import { sub } from "date-fns";
import { db, validations, encoding } from "@turboremote/lib";
import { fastify } from "./server";

const { connect } = db;
const {
  mapObjectsWithHashToBase64,
  mapObjectWithHashToBase64,
  normalizeUuid,
  uuidToBase64,
} = encoding;
const { sanitizeEmail } = validations;

export const fetchAccountFromToken = db.fetchAccountFromToken;

export async function createLogin({ email: _email }: { email: string }) {
  const knex = connect();
  const trx = await knex.transaction();
  try {
    const email = sanitizeEmail(_email);
    await trx("logins").where("email", email).whereNull("expired_at").update({
      expired_at: new Date(),
      expired_by: "machine",
    });
    const [login] = await trx("logins").insert({ email }, ["id", "hash"]);
    await trx.commit();
    return login;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}

const ACTIVATION_THRESHOLD_MIN = 15;
export async function fetchValidLogin({ hash }: { hash: string }) {
  const knex = connect();
  const result = await knex.raw("select now()");
  const {
    rows: [{ now }],
  } = result;
  const timeThreshold = sub(new Date(now), {
    minutes: ACTIVATION_THRESHOLD_MIN,
  });
  const login = await knex("logins")
    .where("hash", hash)
    .whereNull("expired_at")
    // .where("created_at", ">", timeThreshold.toISOString())
    .first();
  return login;
}

export async function fetchAccountFromLogin({ id }: { id: db.Id }) {
  const knex = connect();

  const login = await knex("logins")
    .where("id", id)
    .whereNotNull("expired_at")
    .where("expired_by", "user")
    .first(["id", "email"]);

  if (!login) {
    return null;
  }

  const account = await knex("accounts")
    .where({ email: login.email })
    .first("accounts.*");

  const token = mapObjectWithHashToBase64(
    await knex("tokens")
      .where("account_id", account.id)
      .whereNull("expired_at")
      .whereNull("team_id")
      .orderBy("created_at", "desc")
      .first("tokens.*")
  );

  return { account, token };
}

export async function processUserLogin({
  id,
  email: _email,
}: {
  id: number;
  email: string;
}) {
  const knex = connect();
  const email = sanitizeEmail(_email);

  // no matter what, expire login
  await knex("logins").where("id", id).update({
    expired_at: new Date(),
    expired_by: "user",
  });

  // check if email has associated account
  const existingAccount = await knex("accounts")
    .where({ email })
    .first("accounts.*");
  if (existingAccount) {
    const token = mapObjectWithHashToBase64(
      await knex("tokens")
        .where("account_id", existingAccount.id)
        .whereNull("expired_at")
        .whereNull("team_id")
        .orderBy("created_at", "desc")
        .first("tokens.*")
    );
    return { account: existingAccount, token };
  }

  // email doesn't have associated account. create one
  // process any invitations
  const trx = await knex.transaction();
  try {
    const [account] = await trx("accounts")
      .insert({ email })
      .returning(["id", "email"]);
    const [token] = (
      await trx("tokens")
        .insert({
          name: "Turboremote CLI",
          account_id: account.id,
        })
        .returning("tokens.*")
    ).map(mapObjectsWithHashToBase64());

    const invitations = await trx("invites")
      .where("email", email)
      .whereNull("accepted_at")
      .update({
        accepted_at: new Date(),
        acceptee_id: account.id,
      })
      .returning("invites.*");

    if (invitations.length > 0) {
      await trx("memberships").insert(
        invitations.map((invite) => ({
          account_id: account.id,
          team_id: invite.team_id,
          role: "guest",
        }))
      );
    }

    await trx.commit();
    return { account, token };
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}

export async function fetchTeams(token: string) {
  const knex = connect();
  const trx = await knex.transaction();
  try {
    const account = await trx("accounts")
      .join("tokens", "tokens.account_id", "=", "accounts.id")
      .where("tokens.hash", normalizeUuid(token))
      .first("accounts.id");

    const teams = (
      await trx("teams")
        .join("memberships", "teams.id", "=", "memberships.team_id")
        .where("memberships.account_id", account.id)
        .orderBy("teams.created_at", "asc")
        .select("teams.*")
    ).map(mapObjectsWithHashToBase64());

    await trx.commit();
    return teams;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}

export async function createTeam(token: string, { name }: { name: string }) {
  const knex = connect();
  const trx = await knex.transaction();

  try {
    const account = await trx("accounts")
      .join("tokens", "tokens.account_id", "=", "accounts.id")
      .where("tokens.hash", normalizeUuid(token))
      .first("accounts.id");

    const [team] = (
      await trx("teams").insert({ name }).returning("teams.*")
    ).map(mapObjectsWithHashToBase64());
    await trx("memberships").insert({
      account_id: account.id,
      team_id: team.id,
      role: "owner",
    });

    await trx.commit();
    return team;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}

export async function fetchTokens(token: string) {
  const knex = connect();
  const trx = await knex.transaction();
  try {
    const account = await trx("accounts")
      .join("tokens", "accounts.id", "=", "tokens.account_id")
      .where("tokens.hash", normalizeUuid(token))
      .first("accounts.id");

    const tokens = await trx
      .select(["tokens.*", "teams.id as teamId", "teams.name as teamName"])
      .from("tokens")
      .leftJoin("teams", "tokens.team_id", "=", "teams.id")
      .where("tokens.account_id", account.id)
      .whereNull("tokens.expired_at");

    await trx.commit();
    return tokens;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}

export async function createToken(
  token: string,
  { name, teamId }: { name: string; teamId: number }
) {
  const knex = connect();
  const trx = await knex.transaction();
  try {
    const account = await trx("accounts")
      .join("tokens", "tokens.account_id", "=", "accounts.id")
      .where("tokens.hash", normalizeUuid(token))
      .first("accounts.id");

    const [createdToken] = (
      await trx("tokens")
        .insert({ name, team_id: teamId, account_id: account.id })
        .returning("tokens.*")
    ).map(mapObjectsWithHashToBase64());

    await trx.commit();
    return createdToken;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}

export async function deleteToken(
  token: string,
  { tokenId }: { tokenId: number }
) {
  const knex = connect();
  const trx = await knex.transaction();
  try {
    const account = await trx("accounts")
      .join("tokens", "tokens.account_id", "=", "accounts.id")
      .where("tokens.hash", normalizeUuid(token))
      .first("accounts.id");

    await trx("tokens")
      .where("id", tokenId)
      .where("account_id", account.id)
      .update({ expired_at: new Date() });

    await trx.commit();
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}

// Fetch all memberships for the authorized user
export async function fetchMemberships(token: string) {
  const knex = connect();
  const trx = await knex.transaction();
  try {
    const account = await trx("accounts")
      .join("tokens", "tokens.account_id", "=", "accounts.id")
      .where("tokens.hash", normalizeUuid(token))
      .first("accounts.id");
    const memberships = (
      await trx("memberships")
        .join("teams", "teams.id", "=", "memberships.team_id")
        .join("accounts", "accounts.id", "=", "memberships.account_id")
        .where("memberships.account_id", account.id)
        .orderBy("memberships.created_at", "asc")
        .select([
          "memberships.id",
          "memberships.role",
          "accounts.id as accountId",
          "accounts.email as accountEmail",
          "teams.id as teamId",
          "teams.name as teamName",
          "teams.hash as teamHash",
        ])
    ).map((obj) => ({
      id: obj.id,
      role: obj.role,
      account: {
        id: obj.accountId,
        email: obj.accountEmail,
      },
      team: {
        id: obj.teamId,
        name: obj.teamName,
        hash: uuidToBase64(obj.teamHash),
      },
    }));

    await trx.commit();
    return memberships;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}

export async function addTeamMember(
  token: string,
  { teamId, email: _email }: { teamId: number; email: string }
) {
  const knex = connect();
  const email = sanitizeEmail(_email);

  const account = await knex("accounts")
    .join("tokens", "tokens.account_id", "=", "accounts.id")
    .where("tokens.hash", normalizeUuid(token))
    .first("accounts.id");

  // does an account exist with the provided email
  const invitedAccount = await knex("accounts")
    .where("accounts.email", email)
    .first();

  const team = await knex("teams").where("id", teamId).first("teams.*");

  if (!team) {
    throw fastify.httpErrors.badRequest("Team not found");
  }

  // if so, add them directly as a member
  // log the invite as well
  if (invitedAccount) {
    const trx = await knex.transaction();
    try {
      await trx("memberships").insert({
        account_id: invitedAccount.id,
        team_id: team.id,
        role: "guest",
      });
      const [invite] = (
        await trx("invites")
          .insert({
            inviter_id: account.id,
            email,
            acceptee_id: invitedAccount.id,
            accepted_at: new Date(),
            team_id: team.id,
          })
          .returning("invites.*")
      ).map(mapObjectsWithHashToBase64());
      await trx.commit();
      return { invite, team };
    } catch (error) {
      await trx.rollback();
      throw error;
    }
  }

  // if not, create an invite for them to be consumed when they create
  // their account
  const trx = await knex.transaction();
  try {
    // expire existing invites
    await trx("invites")
      .whereNull("accepted_at")
      .where("email", email)
      .where("team_id", teamId)
      .update({ accepted_at: new Date() });

    // create new invite
    const [invite] = (
      await trx("invites")
        .insert({
          inviter_id: account.id,
          email,
          team_id: teamId,
        })
        .returning("invites.*")
    ).map(mapObjectsWithHashToBase64());

    await trx.commit();
    return { invite, team };
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}

// Fetch all memberships for the specified team
export async function fetchTeamMemberships(
  token: string,
  { teamId }: { teamId: number }
) {
  const knex = connect();
  const trx = await knex.transaction();

  try {
    const account = await trx("accounts")
      .join("tokens", "tokens.account_id", "=", "accounts.id")
      .where("tokens.hash", normalizeUuid(token))
      .first("accounts.id");

    const memberships = (
      await trx("memberships")
        .join("teams", "teams.id", "=", "memberships.team_id")
        .join("accounts", "accounts.id", "=", "memberships.account_id")
        .where("memberships.team_id", teamId)
        .select([
          "memberships.id",
          "memberships.role",
          "accounts.id as accountId",
          "accounts.email as accountEmail",
          "teams.id as teamId",
          "teams.name as teamName",
          "teams.hash as teamHash",
        ])
    ).map((obj) => ({
      id: obj.id,
      role: obj.role,
      account: {
        id: obj.accountId,
        email: obj.accountEmail,
      },
      team: {
        id: obj.teamId,
        name: obj.teamName,
        hash: uuidToBase64(obj.teamHash),
      },
    }));

    if (!memberships.some((m) => m.account.id === account.id)) {
      throw fastify.httpErrors.forbidden(
        "Must be a member of the requested team"
      );
    }

    await trx.commit();
    return memberships;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}

export async function removeTeamMember(
  token: string,
  { memberId }: { memberId: number }
) {
  const knex = connect();
  const trx = await knex.transaction();
  try {
    const account = await trx("accounts")
      .join("tokens", "tokens.account_id", "=", "accounts.id")
      .where("tokens.hash", normalizeUuid(token))
      .first("accounts.id");

    const membership = await trx("memberships")
      .where("id", memberId)
      .first("memberships.*");
    const accountMembership = await trx("memberships")
      .where({
        account_id: account.id,
        team_id: membership.team_id,
      })
      .first("memberships.*");

    if (accountMembership.role !== "owner") {
      throw fastify.httpErrors.forbidden("Only owners can remove members");
    }

    if (accountMembership.id === membership.id) {
      throw fastify.httpErrors.forbidden("You can't remove yourself");
    }

    await trx("memberships").where("id", memberId).delete();

    await trx.commit();
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}

export async function fetchUsage(
  token: string,
  { accountId }: { accountId: number }
) {
  const knex = connect();
  const trx = await knex.transaction();
  try {
    const results = await trx
      .select(["transfers.team_id", "type"])
      .sum("artifacts.size_in_bytes")
      .count("*")
      .from("transfers")
      .join("artifacts", function () {
        this.on("artifacts.hash", "=", "transfers.artifact_hash").andOn(
          "artifacts.team_id",
          "=",
          "transfers.team_id"
        );
      })
      .whereRaw(
        "date_trunc('month', transfers.created_at)::date = date_trunc('month', current_date)::date"
      )
      .whereIn("transfers.team_id", function () {
        this.select("memberships.team_id")
          .from("memberships")
          .where("memberships.account_id", accountId);
      })
      .groupBy("type", "transfers.team_id");

    await trx.commit();
    return results;
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}

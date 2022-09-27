import { sub } from "date-fns";
import {
  mapObjectsWithHashToBase64,
  mapObjectWithHashToBase64,
  normalizeUuid,
  uuidToBase64,
} from "../utils/encoding";
import { commitTransaction, connect } from "./utils";
import type { Id } from "./utils";

export async function createLogin({ email }: { email: string }) {
  const knex = connect();
  const trx = await knex.transaction();
  await trx("logins").where("email", email).whereNull("expired_at").update({
    expired_at: new Date(),
    expired_by: "machine",
  });
  const [login] = await trx("logins").insert({ email }, ["id", "hash"]);
  await commitTransaction(trx);
  return login;
}

const ACTIVATION_THRESHOLD_MIN = 15;
export async function fetchValidLogin({ hash }: { hash: string }) {
  const knex = connect();
  const timeThreshold = sub(new Date(), { minutes: ACTIVATION_THRESHOLD_MIN });
  const login = await knex("logins")
    .where("hash", hash)
    .whereNull("expired_at")
    .where("created_at", ">", timeThreshold.toISOString())
    .first();
  return login;
}

export async function fetchAccountFromLogin({ id }: { id: Id }) {
  const knex = connect();

  const login = await knex("logins")
    .where("id", id)
    .whereNotNull("expired_at")
    .where("expired_by", "user")
    .first(["id", "email"]);

  if (!login) {
    return null;
  }

  const account = mapObjectWithHashToBase64(
    await knex("accounts").where({ email: login.email }).first("accounts.*")
  );

  return account;
}

export async function processUserLogin({
  id,
  email,
}: {
  id: number;
  email: string;
}) {
  const knex = connect();
  const trx = await knex.transaction();

  // no matter what, expire login
  await trx("logins").where("id", id).update({
    expired_at: new Date(),
    expired_by: "user",
  });

  // check if email has associated account
  const existingAccount = await trx("accounts")
    .where({ email })
    .first(["id", "email", "hash"]);
  if (existingAccount) {
    await commitTransaction(trx);
    return mapObjectWithHashToBase64(existingAccount);
  }

  // email doesn't have associated account. create one
  const [account] = (
    await trx("accounts").insert({ email }).returning(["id", "email", "hash"])
  ).map(mapObjectsWithHashToBase64());

  await commitTransaction(trx);
  return account;
}

export async function fetchTeams(token: string) {
  const knex = connect();
  const trx = await knex.transaction();

  const teams = (
    await trx("teams")
      .join("memberships", "teams.id", "=", "memberships.team_id")
      .join("accounts", "accounts.id", "=", "memberships.account_id")
      .join("tokens", "accounts.id", "=", "tokens.account_id")
      .where("tokens.hash", normalizeUuid(token))
      .orderBy("teams.created_at", "asc")
      .select("teams.*")
  ).map(mapObjectsWithHashToBase64());

  await commitTransaction(trx);

  return teams;
}

export async function createTeam(token: string, { name }: { name: string }) {
  const knex = connect();
  const trx = await knex.transaction();

  const account = await trx("accounts")
    .where("accounts.hash", normalizeUuid(token))
    .first("accounts.id");

  const [team] = (await trx("teams").insert({ name }).returning("teams.*")).map(
    mapObjectsWithHashToBase64()
  );
  await trx("memberships").insert({
    account_id: account.id,
    team_id: team.id,
    role: "owner",
  });
  const [scopedToken] = (
    await trx("tokens")
      .insert({
        name: "Turboremote CLI",
        account_id: account.id,
        team_id: team.id,
      })
      .returning("tokens.*")
  ).map(mapObjectsWithHashToBase64());

  await commitTransaction(trx);

  return { team, token: scopedToken };
}

export async function fetchTokens(token: string) {
  const knex = connect();
  const trx = await knex.transaction();

  const account = await trx("accounts")
    .join("tokens", "accounts.id", "=", "tokens.account_id")
    .where("tokens.hash", normalizeUuid(token))
    .first("accounts.id");
  const tokens = (
    await trx
      .select([
        "tokens.id",
        "tokens.hash",
        "tokens.name as name",
        "teams.id as teamId",
        "teams.name as teamName",
      ])
      .from("tokens")
      .join("teams", "tokens.scope", "=", "teams.id")
      .where("tokens.account_id", account.id)
  ).map(mapObjectsWithHashToBase64());

  console.log("here", tokens);

  await commitTransaction(trx);

  return tokens;
}

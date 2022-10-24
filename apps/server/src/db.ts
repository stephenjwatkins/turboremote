import { db, encoding } from "@turboremote/lib";
import type { ArtifactEvent } from "./index.d";
import { fastify } from "./server";

export async function verifyRequest({
  token,
  teamId,
}: {
  token: string;
  teamId: string;
}) {
  const knex = db.connect();
  const teamUuid = encoding.normalizeUuid(teamId.replace("team_", ""));

  const account = await knex
    .select(["accounts.*", "teams.hash as teamHash"])
    .from("accounts")
    .join("tokens", "tokens.account_id", "=", "accounts.id")
    .leftJoin("teams", "tokens.team_id", "=", "teams.id")
    .where("tokens.hash", encoding.normalizeUuid(token))
    .first();

  if (account.teamHash && account.teamHash !== teamUuid) {
    throw fastify.httpErrors.forbidden("Invalid team");
  }

  const teamsOnAccount = await knex
    .select(["memberships.role as role", "teams.*"])
    .from("memberships")
    .join("teams", "memberships.team_id", "=", "teams.id")
    .where("memberships.account_id", account.id);

  const team = teamsOnAccount.find((t) => t.hash === teamUuid);
  if (!team) {
    throw fastify.httpErrors.forbidden("Invalid team");
  }

  return { account, team };
}

export const getColumnFromArtifactEvent = (e: ArtifactEvent) => {
  const mapping = {
    LOCAL: {
      MISS: "local_miss_count",
      HIT: "local_hit_count",
    },
    REMOTE: {
      MISS: "remote_miss_count",
      HIT: "remote_hit_count",
    },
  };
  return mapping[e.source][e.event];
};

export async function trackArtifactEvents({
  teamId,
  accountId,
  events,
}: {
  teamId: number;
  accountId: number;
  events: ArtifactEvent[];
}) {
  const knex = db.connect();
  const responses = await Promise.all(
    events.map(async (e) => {
      await knex("events").insert({
        artifact_hash: e.hash,
        team_id: teamId,
        account_id: accountId,
        source: e.source,
        type: e.event,
      });
    })
  );
  return responses;
}

export async function trackPutArtifact({
  hash,
  sizeInBytes,
  durationInMs,
  teamId,
  accountId,
}: {
  hash: string;
  sizeInBytes: number;
  durationInMs: number;
  teamId: number;
  accountId: number;
}) {
  const knex = db.connect();
  const [artifact] = await Promise.all([
    knex("artifacts")
      .insert({
        hash,
        team_id: teamId,
        size_in_bytes: sizeInBytes,
        duration_in_ms: durationInMs,
      })
      .onConflict(["hash", "team_id"])
      .merge(["size_in_bytes", "duration_in_ms"])
      .returning("*"),
    knex("transfers").insert({
      artifact_hash: hash,
      team_id: teamId,
      account_id: accountId,
      type: "upload",
    }),
  ]);
  return artifact;
}

export async function trackGetArtifact({
  hash,
  teamId,
  accountId,
}: {
  hash: string;
  teamId: number;
  accountId: number;
}) {
  const knex = db.connect();
  await knex("transfers").insert({
    artifact_hash: hash,
    team_id: teamId,
    account_id: accountId,
    type: "download",
  });
}

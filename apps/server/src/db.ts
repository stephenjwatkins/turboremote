import { db, encoding } from "@turboremote/lib";
import type { ArtifactEvent } from "./index.d";

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
    .select(["accounts.id as id", "teams.hash as teamHash"])
    .from("accounts")
    .join("tokens", "tokens.account_id", "=", "accounts.id")
    .leftJoin("teams", "tokens.team_id", "=", "teams.id")
    .where("tokens.hash", encoding.normalizeUuid(token))
    .first();

  if (account.teamHash && account.teamHash !== teamUuid) {
    throw new Error("Unauthorized team");
  }

  const memberships = await knex
    .select([
      "memberships.id as membershipId",
      "memberships.role as membershipRole",
      "teams.hash as teamHash",
    ])
    .from("memberships")
    .join("teams", "memberships.team_id", "=", "teams.id")
    .where("memberships.account_id", account.id);

  if (!memberships.some((m) => m.teamHash === teamUuid)) {
    throw new Error("Unauthorized team");
  }
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

export async function trackArtifactEvents(
  tokenHash: string,
  { events }: { events: ArtifactEvent[] }
) {
  const knex = db.connect();
  const trx = await knex.transaction();

  const responses = await Promise.all(
    events.map((e) => {
      return trx("artifacts")
        .where("hash", e.hash)
        .increment(getColumnFromArtifactEvent(e), 1);
    })
  );

  await db.commitTransaction(trx);
  return responses;
}

export async function trackPutArtifact(
  tokenHash: string,
  {
    hash,
    sizeInBytes,
    durationInMs,
    teamHash,
  }: {
    hash: string;
    sizeInBytes: number;
    durationInMs: number;
    teamHash: string;
  }
) {
  const knex = db.connect();
  const trx = await knex.transaction();

  const team = await trx
    .select("teams.*")
    .from("teams")
    .where("hash", encoding.normalizeUuid(teamHash.replace("team_", "")))
    .first();

  const response = await trx("artifacts")
    .insert({
      hash,
      size_in_bytes: sizeInBytes,
      duration_in_ms: durationInMs,
      team_id: team.id,
    })
    .onConflict("hash")
    .merge({
      size_in_bytes: sizeInBytes,
      duration_in_ms: durationInMs,
      team_id: team.id,
    });

  await trx("artifacts").where("hash", hash).increment("upload_count", 1);

  await db.commitTransaction(trx);
  return response;
}

export async function trackGetArtifact(
  tokenHash: string,
  {
    hash,
    teamHash,
  }: {
    hash: string;
    teamHash: string;
  }
) {
  const knex = db.connect();
  const trx = await knex.transaction();

  const team = await trx
    .select("teams.*")
    .from("teams")
    .where("hash", encoding.normalizeUuid(teamHash.replace("team_", "")))
    .first();

  await trx("artifacts")
    .where("hash", hash)
    .where("team_id", team.id)
    .increment("download_count", 1);

  await db.commitTransaction(trx);
}

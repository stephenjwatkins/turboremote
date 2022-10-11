import { db, encoding } from "@turboremote/lib";

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

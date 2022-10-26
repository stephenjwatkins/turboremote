import createKnex, { Knex } from "knex";
import { normalizeUuid } from "./encoding";

export type Id = string | number;

let db: Knex;

function init() {
  return createKnex({
    client: "pg",
    connection: process.env.PG_CONNECTION_STRING,
    pool: {
      propagateCreateError: false,
    },
  });
}

export function connect() {
  db ||= init();
  return db;
}

export async function fetchAccountFromToken(
  token: string,
  trx?: Knex.Transaction<any, any[]>
) {
  const knex = trx ? trx : connect();
  const account = await knex
    .select("accounts.*")
    .from("accounts")
    .join("tokens", "tokens.account_id", "=", "accounts.id")
    .where("tokens.hash", normalizeUuid(token))
    .first();
  return account;
}

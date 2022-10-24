import createKnex, { Knex } from "knex";
import { normalizeUuid } from "./encoding";

export type Id = string | number;

let db: Knex;

export function connect() {
  db =
    db ||
    createKnex({
      client: "pg",
      connection: process.env.PG_CONNECTION_STRING,
      pool: {
        propagateCreateError: false,
      },
    });
  return db;
}

export async function commitTransaction(trx: Knex.Transaction) {
  try {
    await trx.commit();
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}

export async function fetchAccountFromToken(token: string) {
  const knex = connect();
  const account = await knex
    .select("accounts.*")
    .from("accounts")
    .join("tokens", "tokens.account_id", "=", "accounts.id")
    .where("tokens.hash", normalizeUuid(token))
    .first();
  return account;
}

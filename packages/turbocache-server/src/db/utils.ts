import createKnex, { Knex } from "knex";

export type Id = string | number;

let db: Knex;

export function connect() {
  db =
    db ||
    createKnex({
      client: "pg",
      connection: process.env.PG_CONNECTION_STRING,
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

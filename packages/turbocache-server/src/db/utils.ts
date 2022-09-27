import createKnex, { Knex } from "knex";

export type Id = string | number;

export function connect() {
  return createKnex({
    client: "pg",
    connection: process.env.PG_CONNECTION_STRING,
  });
}

export async function commitTransaction(trx: Knex.Transaction) {
  try {
    await trx.commit();
  } catch (error) {
    await trx.rollback();
    throw error;
  }
}

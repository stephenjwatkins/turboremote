import chalk from "chalk";
import { fetchTokens } from "../api";
import { Token } from "../api/utils";
import { wait } from "../utils/console";
import { sleep } from "../utils/promise";
import { getLongest } from "../utils/string";
import { getGreeting } from "../utils/time";
import { acquireToken } from "../utils/token";

export async function tokensList() {
  console.log("");
  console.log("  " + getGreeting());
  console.log("  Let's list your tokens created on Turboremote.");
  console.log("");

  const token = await acquireToken();
  const spinner = wait("Loading tokens from Turboremote.");
  const tokens = await fetchTokens(token);
  await sleep(2500);
  spinner.succeed("Done!");
  console.log("  Tokens loaded from Turboremote.");
  console.log("");

  if (tokens.length === 0) {
    console.log("");
    console.log(
      "  Looks like there are no tokens created on your Turboremote account."
    );
    console.log("");
    console.log("  To create a token on Turboremote, run:");
    console.log(chalk.bold("  npx turboremote tokens:create"));
    console.log("");
    return;
  }

  logTable<Token>({
    gutter: 6,
    records: tokens,
    columns: ["Token Name", "Token Scope"],
    row: (token) => [token.name, token.teamName ?? "All Teams"],
  });

  console.log("");
}

function logTable<T>({
  gutter,
  records,
  columns,
  row,
}: {
  gutter: number;
  records: T[];
  columns: string[];
  row: (record: T) => string[];
}) {
  const rows = records.map((r) => row(r));
  const padding = columns.map((c, i) => {
    const iGutter = i === columns.length - 1 ? 0 : gutter;
    return getLongest([c, ...rows.map((r) => r[i])]) + iGutter;
  });
  const headerCols = columns.map((c, i) => [c, padding[i]]) as [
    string,
    number
  ][];

  console.log(chalk.bold(`  ${cols(headerCols)}`));
  rows.forEach((row) => {
    const rowCols = row.map((r, i) => [r, padding[i]]) as [string, number][];
    console.log(`  ${cols(rowCols)}`);
  });
}

function cols(cols: [string, number][]) {
  return cols.map(([name, pad]) => col(name, pad)).join("");
}

function col(label: string, pad: number) {
  return label.padEnd(pad, " ");
}

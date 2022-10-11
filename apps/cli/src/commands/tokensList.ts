import chalk from "chalk";
import { fetchTokens } from "../api";
import { Token } from "../api/utils";
import { logTable, wait } from "../utils/console";
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

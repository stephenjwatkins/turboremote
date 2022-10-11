import chalk from "chalk";
import inquirer from "inquirer";
import { deleteToken, fetchTokens } from "../api";
import { Token } from "../api/utils";
import { wait } from "../utils/console";
import { sleep } from "../utils/promise";
import { getLongest } from "../utils/string";
import { getGreeting } from "../utils/time";
import { acquireToken } from "../utils/token";
import { RESERVED_TOKEN_NAMES } from "../utils/validation";

export async function tokensDelete() {
  console.log("");
  console.log("  " + getGreeting());
  console.log("  Let's delete a Turboremote access token.");
  console.log("");

  const token = await acquireToken();

  const spinner = wait("Loading tokens from Turboremote.");
  const tokens = await fetchTokens(token);
  const deletableTokens = tokens.filter(
    (t) => !RESERVED_TOKEN_NAMES.includes(t.name)
  );
  await sleep(2500);
  spinner.succeed("Done!");
  console.log("  Tokens loaded from Turboremote.");

  if (deletableTokens.length === 0) {
    console.log("");
    console.log("  Looks like you have no available tokens to delete.");
    console.log("");
    console.log("  To create a token, run:");
    console.log(chalk.bold("  npx turboremote tokens:create"));
    console.log("");
    return;
  }

  console.log("");
  const padName = getLongest(deletableTokens.map((t) => t.name)) + 6;
  const { tokenId }: { tokenId: number } = await inquirer.prompt([
    {
      name: "tokenId",
      type: "list",
      message: "What token do you want to delete?",
      choices: deletableTokens.map((token) => ({
        name: `${token.name.padEnd(padName, " ")}${
          token.teamName ?? "All Teams"
        }`,
        value: token.id,
        short: token.name,
      })),
    },
  ]);

  console.log("");
  console.log("  Deleting this token will break any systems relying on it.");
  const tokenToDelete = deletableTokens.find((t) => t.id === tokenId) as Token;
  const { confirm }: { confirm: boolean } = await inquirer.prompt([
    {
      name: "confirm",
      message: `Are you sure you want to delete the ${tokenToDelete.name} token?`,
      type: "confirm",
    },
  ]);

  if (!confirm) {
    console.log("");
    console.log(`  Got it. We won't delete the ${tokenToDelete.name} token.`);
    console.log("");
    return;
  }

  console.log("");
  const createSpinner = wait("Got it. Deleting token from Turboremote.");
  await deleteToken(token, { tokenId });
  await sleep(2500);
  createSpinner.succeed("Done!");
  console.log(`  The ${tokenToDelete.name} token was successfully deleted.`);
  console.log("");
}

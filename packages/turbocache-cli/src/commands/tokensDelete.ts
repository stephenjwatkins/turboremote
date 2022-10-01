import inquirer from "inquirer";
import { deleteToken, fetchTokens } from "../api";
import { wait } from "../utils/console";
import { acquireToken } from "../utils/token";

export async function tokensDelete() {
  console.log("");
  console.log("Let's delete a personal access token.");

  const token = await acquireToken();

  const spinner = wait("Loading tokens");
  const tokens = await fetchTokens(token);
  const deletableTokens = tokens.filter((t) => t.name !== "Turboremote CLI");
  spinner.succeed("Loaded tokens");

  if (deletableTokens.length === 0) {
    console.log("You have no tokens available to delete.");
    console.log("");
    console.log("To create a token:");
    console.log("npx turboremote tokens-create");
    return;
  }

  const { tokenId }: { tokenId: number } = await inquirer.prompt([
    {
      name: "tokenId",
      type: "list",
      message: "What token do you want to delete?",
      choices: deletableTokens.map((token) => ({
        name: `${token.name}${token.teamName ? `--${token.teamName}` : ""}`,
        value: token.id,
        short: token.name,
      })),
    },
  ]);

  const createSpinner = wait("Deleting token");
  await deleteToken(token, { tokenId });
  createSpinner.succeed("Turboremote successfully deleted token");
}

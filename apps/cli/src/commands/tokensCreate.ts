import chalk from "chalk";
import inquirer from "inquirer";
import { createToken, fetchTeams } from "../api";
import { Team, Token } from "../api/utils";
import { logTable, printTurborepoConfig, wait } from "../utils/console";
import { sleep } from "../utils/promise";
import { getGreeting } from "../utils/time";
import { acquireToken } from "../utils/token";
import { isValidTokenName } from "../utils/validation";

export async function tokensCreate() {
  console.log("");
  console.log("  " + getGreeting());
  console.log("  Let's create a Turboremote access token.");
  console.log(
    "  Access tokens can be used to securely connect to external systems like CI."
  );
  console.log("");

  const token = await acquireToken();
  const initialSpinner = wait("Loading teams from Turboremote.");
  const teams = await fetchTeams(token);
  await sleep(2500);
  initialSpinner.succeed("Done!");
  console.log("  Teams loaded from Turboremote.");
  console.log("");

  if (teams.length === 0) {
    console.log(
      "  Looks like you aren't associated with any teams on Turboremote."
    );
    console.log("  Remote Cache functionality requires a team account.");
    console.log("");
    console.log("  To create a team, run:");
    console.log(chalk.bold("  npx turboremote teams:create"));
    console.log("");
    return;
  }

  console.log("  Access tokens must be scoped to a team.");
  const { teamId }: { teamId: number } = await inquirer.prompt([
    {
      name: "teamId",
      type: "list",
      message: "What team do you want to restrict to this token?",
      choices: teams.map((team) => ({
        name: team.name,
        value: team.id,
        short: team.name,
      })),
    },
  ]);

  const { name }: { name: string } = await inquirer.prompt([
    {
      name: "name",
      message: "What name do you want to give to this token?",
      validate: (value: string) =>
        isValidTokenName(value) ? true : "Please enter a valid token name.",
    },
  ]);

  const team = teams.find((t) => t.id === teamId) as Team;

  console.log("");
  const createSpinner = wait("Got it. Saving token to Turboremote.");
  const paToken = await createToken(token, { name, teamId });
  await sleep(3000);
  createSpinner.succeed("Done!");
  console.log("  Token successfully saved to Turboremote.");
  console.log("");

  logTable<Token>({
    gutter: 6,
    records: [paToken],
    columns: ["Token ID", "Token Name", "Token Scope"],
    row: (token) => [token.hash, token.name, team.name],
  });

  console.log("");
  printTurborepoConfig({
    apiUrl: process.env.SERVER_URL as string,
    teamIdToken: team.hash,
    teamAccessToken: paToken.hash,
  });
  console.log("");
  console.log(
    chalk.italic(
      "  Save your credentials in a secure place--you won't be able to see them again!"
    )
  );
  console.log("");
}

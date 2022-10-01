import inquirer from "inquirer";
import { createToken, fetchTeams } from "../api";
import { Team } from "../api/utils";
import { printTurborepoConfig, wait } from "../utils/console";
import { acquireToken } from "../utils/token";
import { isValidTokenName } from "../utils/validation";

export async function tokensCreate() {
  console.log("");
  console.log("Let's create a personal access token.");
  console.log("This can be used securely with external systems like CI.");

  const token = await acquireToken();

  const initialSpinner = wait("Loading");
  const teams = await fetchTeams(token);
  initialSpinner.succeed("Loaded");

  const { name, team: teamId }: { name: string; team: number } =
    await inquirer.prompt([
      {
        name: "name",
        message: "What do you want to name your token?",
        validate: (value: string) =>
          isValidTokenName(value) ? true : "Please enter a valid token name.",
      },
      {
        name: "team",
        type: "list",
        message: "What team do you want to scope to this token?",
        choices: teams.map((team) => ({
          name: team.name,
          value: team.id,
          short: team.name,
        })),
      },
    ]);

  const team = teams.find((t) => t.id === teamId) as Team;

  const createSpinner = wait("Saving token");
  const paToken = await createToken(token, { name, teamId });
  createSpinner.succeed(
    `Turboremote successfully created token for ${team.name}: ${paToken.hash}`
  );

  console.log("");
  printTurborepoConfig({
    apiUrl: process.env.API_URL as string,
    teamIdToken: team.hash,
    teamAccessToken: paToken.hash,
  });
  console.log("");
  console.log(
    "Save your credentials in a secure place--you won't be able to see them again!"
  );
}

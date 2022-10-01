import chalk from "chalk";
import inquirer from "inquirer";
import { createTeam, fetchTeams } from "../api";
import { Team } from "../api/utils";
import { wait } from "../utils/console";
import { sleep } from "../utils/promise";
import { getGreeting } from "../utils/time";
import { acquireToken } from "../utils/token";
import { saveConfigToTurborepo } from "../utils/turborepo";
import { isValidTeamName } from "../utils/validation";

export async function link() {
  console.log("");
  console.log("  " + getGreeting());
  console.log("  Let's link this repo to Turboremote.");
  console.log("");

  const token = await acquireToken();
  const teams = await fetchTeams(token);
  const originalTeams = [...teams];

  if (teams.length === 0) {
    console.log(
      "  Looks like you aren't associated with any teams on Turboremote."
    );
    console.log("  Remote Cache functionality requires a team account.");
    console.log("  That's OK. We can create a team now. It can be anything.");
    console.log("");
  }

  const team =
    teams.length === 0
      ? await promptCreateTeam(token)
      : await promptChooseTeam(token, teams);

  console.log("");
  const spinner = wait("Connecting Turboremote to this project.");
  await saveConfigToTurborepo({
    apiUrl: process.env.API_URL as string,
    teamIdToken: team.hash,
    teamAccessToken: token,
  });
  await sleep(3500);

  spinner.succeed("Done!");
  console.log(
    "  Turboremote connected to this project as the Remote Cache provider."
  );
  console.log("");

  console.log("  To restore previous settings, run:");
  console.log(chalk.bold("  npx turboremote unlink"));
  console.log("");

  console.log(
    "  To create an access token for external systems such as CI, run:"
  );
  console.log(chalk.bold("  npx turboremote tokens:create"));
  console.log("");

  if (!originalTeams.find((t) => t.id === team.id)) {
    console.log("  To add members to your new team, run:");
    console.log(chalk.bold("  npx turboremote members:add"));
    console.log("");
  }
}

async function promptCreateTeam(token: string) {
  const { name }: { name: string } = await inquirer.prompt([
    {
      name: "name",
      message: "What do you want to name your new team?",
      validate: (value: string) =>
        isValidTeamName(value) ? true : "Please enter a valid team name.",
    },
  ]);

  console.log("");
  const spinner = wait("Saving team to Turboremote");
  const team = await createTeam(token, { name });
  await sleep(3500);
  spinner.succeed("Done!");
  console.log(
    "  Team successfully saved to Turboremote with you as the owner."
  );
  return team;
}

async function promptChooseTeam(token: string, teams: Team[]) {
  const { teamId }: { teamId: number } = await inquirer.prompt([
    {
      name: "teamId",
      type: "list",
      message: "What team do you want to link to this repo?",
      choices: [
        ...teams.map((team) => ({
          name: team.name,
          value: team.id,
          short: team.name,
        })),
        {
          name: "<Create new team>",
          value: 0,
          short: "<Create new team>",
        },
      ],
    },
  ]);

  if (teamId === 0) {
    console.log("");
    console.log("  Great!");
    console.log("  We'll create a new team now.");
    console.log("");
    return await promptCreateTeam(token);
  } else {
    return teams.find((t) => t.id === teamId) as Team;
  }
}

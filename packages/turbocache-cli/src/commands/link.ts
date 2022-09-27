import inquirer from "inquirer";
import { createTeam, fetchTeams } from "../api";
import { Team } from "../api/utils";
import { wait } from "../utils/console";
import { getGreeting } from "../utils/time";
import { acquireToken } from "../utils/token";
import { saveConfigToTurborepo } from "../utils/turborepo";
import { isValidTeamName } from "../utils/validation";

export async function link() {
  console.log("");
  console.log(getGreeting());
  console.log("Let's link this repo to Turboremote.");
  console.log("");

  const token = await acquireToken();
  const teams = await fetchTeams(token);

  if (teams.length === 0) {
    console.log("Looks like you don't have any teams created yet.");
    console.log("Turborepo requires a team to use Remote Cache.");
    console.log("");
  }

  const teamWithToken =
    teams.length === 0
      ? await promptCreateTeam(token)
      : await promptChooseTeam(token, teams);

  console.log("");
  const spinner = wait("Saving Turboremote settings.");
  await saveConfigToTurborepo({
    apiUrl: process.env.API_HOST as string,
    teamIdToken: teamWithToken.team.hash,
    teamAccessToken: teamWithToken.token.hash,
  });

  spinner.succeed("Turboremote successfully saved as Remote Cache Provider.");
}

async function promptCreateTeam(token: string) {
  const { name }: { name: string } = await inquirer.prompt([
    {
      name: "name",
      message: "What do you want to name your team?",
      validate: (value: string) =>
        isValidTeamName(value) ? true : "Please enter a valid team name.",
    },
  ]);
  const spinner = wait("Creating team");
  const teamWithToken = await createTeam(token, { name });
  spinner.succeed("Team successfully created with you as the owner.");
  console.log("You can invite members to the team with:");
  console.log("npx turboremote invite");
  return teamWithToken;
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
          name: "<Create new>",
          value: 0,
          short: "<Create new>",
        },
      ],
    },
  ]);

  if (teamId === 0) {
    return await promptCreateTeam(token);
  } else {
    return teams.find((t) => t.id === teamId) as Team;
  }
}

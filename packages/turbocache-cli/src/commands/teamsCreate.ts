import inquirer from "inquirer";
import { createTeam } from "../api";
import { wait } from "../utils/console";
import { getGreeting } from "../utils/time";
import { acquireToken } from "../utils/token";
import { isValidTeamName } from "../utils/validation";

export async function teamsCreate() {
  console.log("");
  console.log(getGreeting());

  console.log("Let's create a new team on Turboremote.");
  console.log("");

  const token = await acquireToken();
  const { name }: { name: string } = await inquirer.prompt([
    {
      name: "name",
      message: "What do you want to name your team?",
      validate: (value: string) =>
        isValidTeamName(value) ? true : "Please enter a valid team name.",
    },
  ]);
  const spinner = wait("Creating team");

  await createTeam(token, { name });
  spinner.succeed("Team successfully created with you as the owner.");
  console.log("You can invite members to the team with:");
  console.log("npx turboremote invite");
}

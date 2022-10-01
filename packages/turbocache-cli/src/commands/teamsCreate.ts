import chalk from "chalk";
import inquirer from "inquirer";
import { createTeam } from "../api";
import { wait } from "../utils/console";
import { sleep } from "../utils/promise";
import { getGreeting } from "../utils/time";
import { acquireToken } from "../utils/token";
import { isValidTeamName } from "../utils/validation";

export async function teamsCreate() {
  console.log("");
  console.log("  " + getGreeting());
  console.log("  Let's create a new team on Turboremote.");
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

  console.log("");
  const spinner = wait("Got it. Saving team on Turboremote.");
  await createTeam(token, { name });
  await sleep(2500);
  spinner.succeed("Done!");
  console.log("  Team saved to Turboremote with you as the owner.");
  console.log("");
  console.log("  To link this team to the project, run:");
  console.log(chalk.bold("  npx turboremote link"));
  console.log("");
  console.log("  To invite members to the team, run:");
  console.log(chalk.bold("  npx turboremote members:add"));
  console.log("");
}

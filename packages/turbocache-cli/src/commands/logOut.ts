import chalk from "chalk";
import inquirer from "inquirer";
import { wait } from "../utils/console";
import { sleep } from "../utils/promise";
import { getGreeting } from "../utils/time";
import { clearToken, hasToken } from "../utils/token";
import { restoreConfigToTurborepo } from "../utils/turborepo";

export async function logOut() {
  if (!hasToken()) {
    console.log("");
    console.log("  Looks like you're already signed out of Turboremote.");
    console.log("");
    console.log("  To sign in to Turboremote, run:");
    console.log(chalk.bold("  npx turboremote logout"));
    console.log("");
    console.log("  To link a project to Turboremote, run:");
    console.log(chalk.bold("  npx turboremote link"));
    console.log("");
    return;
  }

  console.log("");
  console.log("  " + getGreeting());
  const { confirm }: { confirm: boolean } = await inquirer.prompt([
    {
      name: "confirm",
      message: "Are you sure you want to sign out of Turboremote?",
      type: "confirm",
    },
  ]);

  if (!confirm) {
    console.log("");
    console.log("  Got it. You'll stay signed in to Turboremote.");
    console.log("");
    return;
  }

  console.log("");
  const emailSpinner = wait("Got it. Signing you out of Turboremote.");
  await restoreConfigToTurborepo();
  clearToken();
  await sleep(2500);

  emailSpinner.succeed("Done!");
  console.log("  You're successfully signed out of Turboremote.");
  console.log("");
}

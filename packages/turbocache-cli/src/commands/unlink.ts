import chalk from "chalk";
import inquirer from "inquirer";
import { wait } from "../utils/console";
import { sleep } from "../utils/promise";
import { getGreeting } from "../utils/time";
import {
  hasPreviousConfig,
  isTurboremoteLinked,
  restoreConfigToTurborepo,
} from "../utils/turborepo";

export async function unlink() {
  const hasPrevious = await hasPreviousConfig();
  const isLinked = await isTurboremoteLinked();
  if (!isLinked) {
    console.log("");
    console.log(
      "  Looks like this project is already unlinked from Turboremote."
    );
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
      message: "Are you sure you want to unlink this project from Turboremote?",
      type: "confirm",
    },
  ]);

  if (!confirm) {
    console.log("");
    console.log("  Got it. This project will stay linked to Turboremote.");
    console.log("");
    return;
  }

  console.log("");
  const spinner = wait("Got it. Unlinking this project from Turboremote.");
  await restoreConfigToTurborepo();
  await sleep(2500);
  spinner.succeed("Done!");
  console.log(
    "  This project has been successfully unlinked from Turboremote."
  );
  if (hasPrevious) {
    console.log("  Previous settings have been restored.");
  }
  console.log("");
}

import chalk from "chalk";
import { getGreeting } from "../utils/time";
import { hasToken, runTokenFlow } from "../utils/token";

export async function logIn() {
  if (hasToken()) {
    console.log("");
    console.log("  Looks like you're already signed in to Turboremote.");
    console.log("");
    console.log("  To sign out of Turboremote, run:");
    console.log(chalk.bold("  npx turboremote logout"));
    console.log("");
    console.log("  To link a project to Turboremote, run:");
    console.log(chalk.bold("  npx turboremote link"));
    console.log("");
    return;
  }

  console.log("");
  console.log("  " + getGreeting() + " Welcome to Turboremote.");
  console.log("  Let's sign you in.");
  console.log("");

  await runTokenFlow();
}

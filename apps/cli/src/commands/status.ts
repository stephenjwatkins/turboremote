import chalk from "chalk";
import { fetchMemberships } from "../api";
import { readConfigFromTurborepo } from "../utils/turborepo";

export async function status() {
  const config = await readConfigFromTurborepo();

  if (!config) {
    console.log("");
    console.log("  Looks like this project is not linked to Turboremote.");
    console.log("");
    console.log("  To link a project to Turboremote, run:");
    console.log(chalk.bold("  npx turboremote link"));
    console.log("");
    return;
  }

  const { apiUrl, teamIdToken } = config;

  console.log("");
  console.log("  This project is currently linked to Turboremote.");
  console.log("");
  console.log("  Turboremote Remote Cache URL:");
  console.log(chalk.bold(`  ${apiUrl}`));
  console.log("");
  console.log("  Team ID:");
  console.log(chalk.bold(`  team_${teamIdToken}`));
  console.log("");
  console.log(
    "  To create an access token for external systems such as CI, run:"
  );
  console.log(chalk.bold("  npx turboremote tokens:create"));
  console.log("");
}

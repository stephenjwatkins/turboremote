import chalk from "chalk";
import { fetchMemberships, fetchTeams, fetchTokens } from "../api";
import { Membership, Team } from "../api/utils";
import { logTable, wait } from "../utils/console";
import { sleep } from "../utils/promise";
import { getGreeting } from "../utils/time";
import { acquireToken } from "../utils/token";

export async function teamsList() {
  console.log("");
  console.log("  " + getGreeting());
  console.log("  Let's list the teams you're a member of on Turboremote.");
  console.log("");

  const token = await acquireToken();
  const spinner = wait("Loading teams from Turboremote.");
  const memberships = await fetchMemberships(token);
  await sleep(2500);
  spinner.succeed("Done!");
  console.log("  Teams loaded from Turboremote.");
  console.log("");

  if (memberships.length === 0) {
    console.log("");
    console.log("  Looks like you're not a part of any team on Turboremote.");
    console.log("");
    console.log("  To create a team on Turboremote, run:");
    console.log(chalk.bold("  npx turboremote teams:create"));
    console.log("");
    return;
  }

  logTable<Membership>({
    gutter: 6,
    records: memberships,
    columns: ["Team Name", "Role on Team"],
    row: (membership) => [membership.team.name, membership.role],
  });

  console.log("");
}

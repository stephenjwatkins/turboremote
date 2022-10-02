import chalk from "chalk";
import inquirer from "inquirer";
import { fetchMemberships, fetchTeamMemberships } from "../api";
import { Membership, Team } from "../api/utils";
import { logTable, wait } from "../utils/console";
import { sleep } from "../utils/promise";
import { getGreeting } from "../utils/time";
import { acquireToken } from "../utils/token";

export async function membersList() {
  console.log("");
  console.log("  " + getGreeting());
  console.log("  Let's list team members on Turboremote.");
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

  const { teamId }: { teamId: number } = await inquirer.prompt([
    {
      name: "teamId",
      type: "list",
      message: "What team do you want to list members of?",
      choices: memberships.map((membership) => ({
        name: membership.team.name,
        value: membership.team.id,
        short: membership.team.name,
      })),
    },
  ]);

  const team = (memberships.find((m) => m.team.id === teamId) as Membership)
    .team;
  const teamMemberships = await fetchTeamMemberships(token, { teamId });

  console.log("");
  console.log(`  Members of ${team.name}:`);
  console.log("");

  logTable<Membership>({
    gutter: 6,
    records: teamMemberships,
    columns: ["Member Email", "Role on Team"],
    row: (membership) => [membership.account.email, membership.role],
  });
  console.log("");
}

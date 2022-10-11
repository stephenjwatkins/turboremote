import chalk from "chalk";
import inquirer from "inquirer";
import {
  fetchMemberships,
  fetchTeamMemberships,
  removeTeamMember,
} from "../api";
import { Membership } from "../api/utils";
import { wait } from "../utils/console";
import { sleep } from "../utils/promise";
import { getGreeting } from "../utils/time";
import { acquireToken } from "../utils/token";

export async function membersRemove() {
  console.log("");
  console.log("  " + getGreeting());
  console.log("  Let's remove a member from a team on Turboremote.");
  console.log("");

  const token = await acquireToken();
  const initialSpinner = wait("Loading teams from Turboremote.");
  const memberships = await fetchMemberships(token);
  const ownerMemberships = memberships.filter((m) => m.role === "owner");
  await sleep(2500);
  initialSpinner.succeed("Done!");
  console.log("  Teams loaded from Turboremote.");

  if (ownerMemberships.length === 0) {
    console.log("");
    console.log("  Looks like you aren't an owner of any team.");
    console.log("  Adding members requires an ownership role.");
    console.log("");
    console.log("  To create a team, run:");
    console.log(chalk.bold("  npx turboremote teams:create"));
    console.log("");
    return;
  }

  console.log("");
  const { teamId }: { teamId: number } = await inquirer.prompt([
    {
      name: "teamId",
      type: "list",
      message: "What team do you want to remove a member from?",
      choices: ownerMemberships.map((membership) => ({
        name: membership.team.name,
        value: membership.team.id,
        short: membership.team.name,
      })),
    },
  ]);

  const team = (
    ownerMemberships.find((m) => m.team.id === teamId) as Membership
  ).team;
  const yourMembership = memberships.find(
    (m) => m.team.id === teamId
  ) as Membership;
  const allTeamMemberships = await fetchTeamMemberships(token, { teamId });
  const teamMemberships = allTeamMemberships.filter(
    (tm) => tm.id !== yourMembership.id
  );

  if (teamMemberships.length === 0) {
    console.log("");
    console.log(
      "  Looks like there aren't any members available to remove from this team."
    );
    console.log("");
    return;
  }

  console.log("");
  const { memberId }: { memberId: number } = await inquirer.prompt([
    {
      name: "memberId",
      type: "list",
      message: "What member do you want to remove?",
      choices: async (prev) => {
        return teamMemberships.map((m) => ({
          name: m.account.email,
          value: m.id,
          short: m.account.email,
        }));
      },
    },
  ]);

  const memberToRemove = teamMemberships.find(
    (tm) => tm.id === memberId
  ) as Membership;

  console.log("");
  const createSpinner = wait(
    "Got it. Removing member from team on Turboremote."
  );
  await removeTeamMember(token, { memberId });
  await sleep(2500);
  createSpinner.succeed("Done!");
  console.log(
    `  ${memberToRemove.account.email} removed from ${team.name} on Turboremote.`
  );
  console.log("");
}

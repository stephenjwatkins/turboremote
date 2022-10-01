import inquirer from "inquirer";
import {
  addTeamMember,
  fetchMemberships,
  fetchTeamMemberships,
  removeTeamMember,
} from "../api";
import { Membership } from "../api/utils";
import { wait } from "../utils/console";
import { acquireToken } from "../utils/token";

export async function teamsListMembers() {
  console.log("");

  const token = await acquireToken();

  const spinner = wait("Loading teams");
  const memberships = await fetchMemberships(token);
  spinner.succeed("Loaded teams");

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

  const teamMemberships = await fetchTeamMemberships(token, { teamId });

  console.log("");
  console.log("Teams:");
  teamMemberships.forEach((teamMembership) => {
    console.log(`  ${teamMembership.account.email}--${teamMembership.role}`);
  });
  console.log("");
}

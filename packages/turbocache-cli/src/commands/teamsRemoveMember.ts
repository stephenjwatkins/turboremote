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

export async function teamsRemoveMember() {
  console.log("");

  const token = await acquireToken();

  const spinner = wait("Loading teams");
  const memberships = await fetchMemberships(token);
  const ownerMemberships = memberships.filter((m) => m.role === "owner");
  spinner.succeed("Loaded teams");

  if (ownerMemberships.length === 0) {
    console.log("Looks like you aren't an owner of any team.");
    console.log("");
    console.log("Create a team with:");
    console.log("npx turboremote teams-create");
    return;
  }

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

  const yourMembership = memberships.find(
    (m) => m.team.id === teamId
  ) as Membership;
  const allTeamMemberships = await fetchTeamMemberships(token, { teamId });
  const teamMemberships = allTeamMemberships.filter(
    (tm) => tm.id !== yourMembership.id
  );

  if (teamMemberships.length === 0) {
    console.log("There aren't any members available to remove for this team.");
    console.log("You can't remove yourself.");
    return;
  }

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

  const memberToRemove = teamMemberships.find((tm) => tm.id === memberId);

  const createSpinner = wait("Removing team member");
  await removeTeamMember(token, { memberId });
  createSpinner.succeed(
    `Removed ${memberToRemove?.account.email} account as team member`
  );
}

import inquirer from "inquirer";
import { addTeamMember, fetchMemberships } from "../api";
import { wait } from "../utils/console";
import { acquireToken } from "../utils/token";
import { isValidEmail } from "../utils/validation";

export async function membersAdd() {
  console.log("");

  const token = await acquireToken();

  const spinner = wait("Loading teams");
  const memberships = await fetchMemberships(token);
  const ownerMemberships = memberships.filter((m) => m.role === "owner");
  spinner.succeed("Loaded teams");

  if (ownerMemberships.length === 0) {
    console.log("Looks like you aren't an owner of a team.");
    console.log("Create a team with:");
    console.log("npx turboremote teams-create");
    return;
  }

  const { teamId, email }: { teamId: number; email: string } =
    await inquirer.prompt([
      {
        name: "teamId",
        type: "list",
        message: "What team do you want to add a member to?",
        choices: ownerMemberships.map((membership) => ({
          name: membership.team.name,
          value: membership.team.id,
          short: membership.team.name,
        })),
      },
      {
        name: "email",
        message: "What's the email address of the member to add?",
        validate: (value: string) =>
          isValidEmail(value) ? true : "Please enter a valid email.",
      },
    ]);

  const createSpinner = wait("Adding team member");
  const invite = await addTeamMember(token, { teamId, email });
  createSpinner.succeed(
    invite.accepted_at
      ? `Added ${email} account as team member`
      : `Invited ${email} to team to be added once they create their account`
  );
}

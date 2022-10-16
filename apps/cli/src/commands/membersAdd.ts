import chalk from "chalk";
import inquirer from "inquirer";
import { addTeamMember, fetchMemberships } from "../api";
import { Membership } from "../api/utils";
import { wait } from "../utils/console";
import { sleep } from "../utils/promise";
import { getGreeting } from "../utils/time";
import { acquireToken } from "../utils/token";
import { isValidEmail } from "../utils/validation";

export async function membersAdd() {
  console.log("");
  console.log("  " + getGreeting());
  console.log("  Let's add a member to a team on Turboremote.");
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
        message: "What's the email of the member to add?",
        validate: (value: string) =>
          isValidEmail(value) ? true : "Please enter a valid email.",
      },
    ]);

  const team = (
    ownerMemberships.find((m) => m.team.id === teamId) as Membership
  ).team;
  console.log("");
  const createSpinner = wait("Got it. Saving new team member to Turboremote.");
  try {
    const invite = await addTeamMember(token, { teamId, email });
    await sleep(2500);
    createSpinner.succeed("Done!");
    if (invite.accepted_at) {
      console.log(`  ${email} added to ${team.name} on Turboremote.`);
    } else {
      console.log(`  ${email} invited to ${team.name} on Turboremote.`);
    }
    console.log("");
  } catch {
    createSpinner.fail("Whoops—unable to add member.");
    console.log("");
    console.log(
      `  Looks like there was a problem adding ${email} to ${team.name}.`
    );
    console.log("  Ensure that the member is not already part of the team.");
    console.log("");
    console.log("  Try running the command again.");
    console.log(
      "  If the problem continues, let us know at help@turboremote.org"
    );
    console.log("");
  }
}

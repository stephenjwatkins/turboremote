import { fetchMemberships, fetchTeams, fetchTokens } from "../api";
import { wait } from "../utils/console";
import { acquireToken } from "../utils/token";

export async function teamsList() {
  console.log("");

  const token = await acquireToken();

  const spinner = wait("Loading teams");
  const memberships = await fetchMemberships(token);
  spinner.succeed("Loaded teams");

  console.log("");
  console.log("Teams:");
  memberships.forEach((membership) => {
    console.log(`  ${membership.team.name}--${membership.role}`);
  });
  console.log("");
}

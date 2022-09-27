import { fetchTokens } from "../api";
import { wait } from "../utils/console";
import { acquireToken } from "../utils/token";

export async function tokensList() {
  console.log("");

  const token = await acquireToken();

  const spinner = wait("Loading tokens");
  const tokens = await fetchTokens(token);
  spinner.succeed("Loaded tokens");

  console.log("");
  console.log("Personal access tokens:");
  tokens.forEach((token) => {
    console.log(`  [${token.hash}] ${token.name} for ${token.teamName}`);
  });
  console.log("");
}

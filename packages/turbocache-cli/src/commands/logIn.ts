import { getGreeting } from "../utils/time";
import { hasToken, runTokenFlow } from "../utils/token";

export async function logIn() {
  if (hasToken()) {
    console.log("");
    console.log("Looks like you're already logged in.");
    console.log("Try running another command.");
    console.log("");
    return;
  }

  console.log("");
  console.log(getGreeting() + " Welcome to Turboremote.");
  console.log("Let's log you in.");
  console.log("");

  await runTokenFlow();
}

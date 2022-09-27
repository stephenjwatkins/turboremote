import cliSpinners from "cli-spinners";
import ora from "ora";
import { sleep } from "../utils/promise";
import { getGreeting } from "../utils/time";
import { clearToken, hasToken } from "../utils/token";
import { restoreConfigToTurborepo } from "../utils/turborepo";

export async function logOut() {
  if (!hasToken()) {
    console.log("");
    console.log(getGreeting());
    console.log("You're already signed out of Turboremote.");
    console.log("");
    return;
  }

  console.log("");
  console.log(getGreeting());
  const emailSpinner = ora({
    text: "Signing out of Turboremote.",
    spinner: cliSpinners.dots,
  });
  emailSpinner.start();

  await restoreConfigToTurborepo();
  clearToken();
  await sleep(3000);

  emailSpinner.succeed("Turboremote successfully signed you out.");
  console.log("");
}

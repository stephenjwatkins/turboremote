import { wait } from "../utils/console";
import { getGreeting } from "../utils/time";
import {
  isTurboremoteLinked,
  restoreConfigToTurborepo,
} from "../utils/turborepo";

export async function unlink() {
  console.log("");
  console.log(getGreeting());

  const isLinked = await isTurboremoteLinked();

  if (!isLinked) {
    console.log("Turboremote is not connected to this repo.");
    console.log("");
    return;
  }

  const spinner = wait("Unlinking Turboremote");
  await restoreConfigToTurborepo();
  spinner.succeed("Turboremote successfully unlinked from this repo.");
  console.log("");
}

import { printTurborepoConfig } from "../utils/console";
import { readConfigFromTurborepo } from "../utils/turborepo";

export async function status() {
  const config = await readConfigFromTurborepo();

  if (!config) {
    console.log("Turboremote is not linked to this repo.");
    return;
  }

  const { apiUrl, teamToken, userToken } = config;

  console.log("Turboremote is successfully linked to this repo locally.");
  console.log("");
  console.log(
    "For external systems (CI, etc), you can use the following configurations."
  );
  console.log("");
  printTurborepoConfig({ apiUrl, teamToken, userToken });
}

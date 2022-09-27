import Configstore from "configstore";
import inquirer from "inquirer";
import { checkLogin, initiateLogin } from "../api";
import { wait } from "../utils/console";
import { sleep } from "../utils/promise";
import { isValidEmail } from "../utils/validation";

export async function runTokenFlow() {
  const { email }: { email: string } = await inquirer.prompt([
    {
      name: "email",
      message: "What is your email?",
      validate: (value: string) => {
        return isValidEmail(value)
          ? true
          : "Please enter a valid email address.";
      },
    },
  ]);

  console.log("");
  const sendSpinner = wait("Sending email.");
  const activationId = await initiateLogin({ email });
  sendSpinner.succeed("Check your inbox!");
  console.log(`We sent an activation link to ${email}.`);

  console.log("");
  const activationSpinner = wait("Open the link to continue.");

  let account = await checkLogin({ activationId });
  let count = 1;
  while (!account && count < 100) {
    await sleep(3000);
    account = await checkLogin({ activationId });
    count++;
  }

  if (account) {
    setToken(account.hash);
    activationSpinner.succeed("Got it!");
    console.log(`${email} successfully logged in.`);
  } else {
    activationSpinner.fail("Unable to log in. Try running the command again.");
    console.log("Unable to log in. Try running the command again.");
    process.exit();
  }
}

export async function acquireToken() {
  if (hasToken()) {
    return getToken();
  }

  console.log("First let's connect you to Turboremote.");
  console.log("");

  await runTokenFlow();
  return getToken();
}

export const CONFIGSTORE_KEY = "turboremote";

export function getConfigStore() {
  return new Configstore("turboremote");
}

export function setToken(token: string) {
  const configStore = getConfigStore();
  configStore.set("token", token);
  configStore.set("token_created_at", new Date());
}

export function hasToken() {
  return getConfigStore().has("token");
}

export function clearToken() {
  getConfigStore().delete("token");
}

export function getToken() {
  return getConfigStore().get("token");
}

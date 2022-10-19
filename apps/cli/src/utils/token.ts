import Configstore from "configstore";
import inquirer from "inquirer";
import { initiateLogin, pollLogin } from "../api";
import { wait } from "../utils/console";
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
  let activationId;
  const sendSpinner = wait("Sending email.");
  try {
    activationId = await initiateLogin({ email });
    sendSpinner.succeed("Check your inbox.");
    console.log(`  We sent an activation link to ${email}.`);
  } catch (error) {
    sendSpinner.fail(`Whoops—unable to send an activation link to ${email}.`);
    throw error;
  }

  console.log("");
  const activationSpinner = wait("Open the link to continue.");
  const accountWithToken = await pollLogin({ activationId });

  if (accountWithToken) {
    setToken(accountWithToken.token.hash);
    activationSpinner.succeed("Got it!");
    console.log(`  ${email} successfully logged in.`);
    console.log("");
  } else {
    activationSpinner.fail("Whoops—unable to log in.");
    throw new Error(
      "Unable to login. No account with token successfully polled."
    );
  }
}

export async function acquireToken() {
  if (hasToken()) {
    return getToken();
  }

  console.log("  First let's connect you to Turboremote.");

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

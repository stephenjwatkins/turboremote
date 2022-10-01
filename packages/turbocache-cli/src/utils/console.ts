import cliSpinners from "cli-spinners";
import ora from "ora";
import { TurborepoConfig } from "./turborepo";

export function wait(text: string) {
  const spinner = ora({
    text,
    spinner: cliSpinners.dots,
  });
  spinner.start();
  return spinner;
}

export function printTurborepoConfig({
  apiUrl,
  teamIdToken,
  teamAccessToken,
}: TurborepoConfig) {
  console.log("Usage with command line flags:");
  console.log(
    `  turbo run build --api=${apiUrl} --team=${teamIdToken} --token=${teamAccessToken}`
  );
  console.log("");
  console.log("Usage with environment variables:");
  console.log(
    `  TURBO_TOKEN=${teamAccessToken} TURBO_TEAM=${teamIdToken} turbo run build --api=${apiUrl}`
  );
}

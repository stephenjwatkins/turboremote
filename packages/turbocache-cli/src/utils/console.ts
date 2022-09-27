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
  teamToken,
  userToken,
}: TurborepoConfig) {
  console.log("Usage with command line flags:");
  console.log(
    `  turbo run build --api=${apiUrl} --team=${teamToken} --token=${userToken}`
  );
  console.log("");
  console.log("Usage with environment variables:");
  console.log(
    `  TURBO_TOKEN=${userToken} TURBO_TEAM=${teamToken} turbo run build --api=${apiUrl}`
  );
}

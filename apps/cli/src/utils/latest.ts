import { execSync } from "child_process";
import { existsSync, mkdirSync, rmSync, readdirSync, readFileSync } from "fs";
import path from "path";
import execa from "execa";
import { wait } from "./console";
import inquirer from "inquirer";
import { sleep } from "./promise";
import chalk from "chalk";

export function latestCommand(command: () => {}) {
  return async (argv: any) => {
    await ensureLatest(argv);
    await command();
  };
}

async function ensureLatest(argv: any) {
  const latestVersion = await getLatestTurboremoteVersion();
  const currentVersion = await getCurrentTurboremoteVersion();

  const [latestMajor, latestMinor, latestPatch] = latestVersion.split(".");
  const [currentMajor, currentMinor, currentPatch] = currentVersion.split(".");
  const latestCheck = [latestMinor, latestPatch].join(".");
  const currentCheck = [currentMinor, currentPatch].join(".");
  const isOutdated =
    latestMajor === currentMajor && latestCheck !== currentCheck;

  if (!isOutdated) {
    return;
  }

  console.log("");
  console.log(
    chalk.yellow("  Looks like your Turboremote CLI is out of date.")
  );
  console.log(
    chalk.yellow(
      `  Your installed version is ${currentVersion}. The latest version is ${latestVersion}.`
    )
  );
  console.log(
    chalk.yellow("  To install the latest version of Turboremote, run:")
  );
  console.log(
    chalk.yellow.bold(
      `  npx clear-npx-cache && npx turboremote ${argv._.join(" ")}`
    )
  );

  await sleep(2000);
}

async function getCurrentTurboremoteVersion() {
  const { version } = JSON.parse(
    readFileSync(path.join(__dirname, "../package.json"), "utf8")
  );
  return version;
}

async function getLatestTurboremoteVersion() {
  const { stdout } = await execa("npm", ["view", "turboremote", "version"]);
  return stdout;
}

async function clearNpxCache() {
  const npmCacheDirectory = execSync("npm config get cache")
    .toString()
    .trimEnd();
  const npxCacheDirectory = path.join(npmCacheDirectory, "_npx");

  if (existsSync(npxCacheDirectory)) {
    for (const subdirectoryName of readdirSync(npxCacheDirectory)) {
      const subdirectory = path.join(npxCacheDirectory, subdirectoryName);
      const packagePath = path.join(subdirectory, "package.json");

      if (existsSync(packagePath)) {
        const package_json = JSON.parse(readFileSync(packagePath).toString());
        if (package_json.name === "clear-npx-cache") {
          continue;
        }
      }
      rmSync(subdirectory, { recursive: true });
    }
  } else {
    mkdirSync(npxCacheDirectory);
  }
}

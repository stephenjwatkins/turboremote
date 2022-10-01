import fs from "fs";
import path from "path";
import { baseDirs } from "directories-js";
import {
  fileExists,
  safelyRemoveFile,
  safelyRenameFile,
  safelyWriteFile,
} from "./platform";

export type TurborepoConfig = {
  apiUrl: string;
  teamIdToken: string;
  teamAccessToken: string;
};

export function turborepoCommand(command: () => {}) {
  return async () => {
    await ensureTurborepo();
    command();
  };
}

export async function hasPreviousConfig() {
  const paths = getTurborepoPaths();
  return fileExists(paths.prevProjectConfigFile);
}

export async function isTurboremoteLinked() {
  const paths = getTurborepoPaths();

  if (!fileExists(paths.projectConfigFile)) {
    return false;
  }

  try {
    const data = fs.readFileSync(paths.projectConfigFile, "utf-8");
    const json = JSON.parse(data);
    return json.apiurl === process.env.API_URL;
  } catch {
    return false;
  }
}

export async function readConfigFromTurborepo(): Promise<TurborepoConfig | null> {
  const isLinked = await isTurboremoteLinked();
  if (!isLinked) {
    return null;
  }

  const paths = getTurborepoPaths();

  const projectRawData = fs.readFileSync(paths.projectConfigFile, "utf-8");
  const projectData = JSON.parse(projectRawData);

  const userRawData = fs.readFileSync(paths.userConfigFile, "utf-8");
  const userData = JSON.parse(userRawData);

  return {
    apiUrl: projectData.apiurl,
    teamIdToken: projectData.teamid.replace("team_", ""),
    teamAccessToken: userData.token,
  };
}

export async function saveConfigToTurborepo({
  apiUrl,
  teamIdToken,
  teamAccessToken,
}: TurborepoConfig) {
  const paths = getTurborepoPaths();

  if (!isTurboremoteLinked()) {
    safelyRenameFile(paths.projectConfigFile, paths.prevProjectConfigFile);
    safelyRenameFile(paths.userConfigFile, paths.prevUserConfigFile);
  }

  safelyWriteFile(
    paths.projectDir,
    paths.projectConfigFile,
    JSON.stringify({ apiurl: apiUrl, teamid: `team_${teamIdToken}` }, null, 2)
  );
  safelyWriteFile(
    paths.userDir,
    paths.userConfigFile,
    JSON.stringify({ token: teamAccessToken }, null, 2)
  );
}

export async function restoreConfigToTurborepo() {
  const paths = getTurborepoPaths();

  safelyRemoveFile(paths.projectConfigFile);
  safelyRemoveFile(paths.userConfigFile);

  safelyRenameFile(paths.prevProjectConfigFile, paths.projectConfigFile);
  safelyRenameFile(paths.prevUserConfigFile, paths.userConfigFile);
}

async function ensureTurborepo() {
  const hasTurbo = await lookForTurborepo();
  if (!hasTurbo) {
    console.log("");
    console.log("Looks like this repo is not a valid Turborepo project.");
    console.log(
      "Ensure you're in the root folder of a valid Turborepo project."
    );
    console.log("");
    process.exit();
  }
}

async function lookForTurborepo() {
  const pkgFile = path.join(process.cwd(), "package.json");
  const exists = await fileExists(pkgFile);
  if (!exists) {
    return false;
  }

  try {
    const pkgData = fs.readFileSync(pkgFile, "utf8");
    const pkgJson = JSON.parse(pkgData);
    const { dependencies = {}, devDependencies = {} } = pkgJson;
    const hasTurboInRootPkg = devDependencies.turbo || dependencies.turbo;
    // TODO: Further look in /node_modules to get version
    return hasTurboInRootPkg;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export function getTurborepoPaths() {
  const projectDir = path.join(process.cwd(), ".turbo");
  const userDir = path.join(baseDirs.config() as string, "turborepo");

  const projectConfigFile = path.join(projectDir, "config.json");
  const userConfigFile = path.join(userDir, "config.json");

  const prevProjectConfigFile = path.join(
    projectDir,
    "config.__beforeturboremote__.json"
  );
  const prevUserConfigFile = path.join(
    userDir,
    "config.__beforeturboremote__.json"
  );

  return {
    projectDir,
    userDir,
    projectConfigFile,
    userConfigFile,
    prevProjectConfigFile,
    prevUserConfigFile,
  };
}

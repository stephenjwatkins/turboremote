import fs from "fs";

export function fileExists(path: string) {
  try {
    fs.accessSync(path, fs.constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
}

export function safelyRenameFile(fromPath: string, toPath: string) {
  if (fileExists(fromPath)) {
    fs.renameSync(fromPath, toPath);
  }
}

export function safelyRemoveFile(path: string) {
  if (fileExists(path)) {
    fs.unlinkSync(path);
  }
}

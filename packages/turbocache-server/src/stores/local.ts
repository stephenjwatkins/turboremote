import fs from "fs";
import path from "path";
import fsBlobStore from "fs-blob-store";
import * as os from "os";

function getStore() {
  return fsBlobStore({ path: os.tmpdir() });
}

export async function writeMetadata(artifactPath: any, { duration, tag }: any) {
  const [teamId, artifactId] = artifactPath.split("/");
  await fs.promises.mkdir(path.join(os.tmpdir(), teamId), { recursive: true });
  await fs.promises.writeFile(
    path.join(os.tmpdir(), teamId, `${artifactId}.json`),
    JSON.stringify({ duration, tag })
  );
}

export async function readMetadata(artifactPath: any) {
  const [teamId, artifactId] = artifactPath.split("/");
  const contents = await fs.promises.readFile(
    path.join(os.tmpdir(), teamId, `${artifactId}.json`)
  );
  return JSON.parse(contents.toString("utf8"));
}

export function createReadStream(artifactPath: string) {
  const store = getStore();
  return store.createReadStream({ key: artifactPath });
}

export function createWriteStream(artifactPath: string) {
  const store = getStore();
  return store.createWriteStream({ key: artifactPath });
}

export async function exists(artifactPath: string) {
  return new Promise((resolve, reject) => {
    const store = getStore();
    store.exists({ key: artifactPath }, (err: any, exists: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(exists);
      }
    });
  });
}

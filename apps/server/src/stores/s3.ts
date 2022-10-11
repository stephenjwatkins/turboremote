import aws from "aws-sdk";
import s3BlobStore from "s3-blob-store";

function getClient() {
  return new aws.S3({
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  });
}

function getStore() {
  const client = getClient();
  const store = s3BlobStore({
    client: client,
    bucket: "cmo-dev",
  });
  return store;
}

export async function writeMetadata(artifactPath: any, { duration, tag }: any) {
  return new Promise((resolve, reject) => {
    const client = getClient();
    client.putObject(
      {
        Key: `${artifactPath}.metadata`,
        Bucket: "cmo-dev",
        Body: JSON.stringify({ duration, tag }),
      },
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(undefined);
        }
      }
    );
  });
}

export async function readMetadata(artifactPath: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const client = getClient();
    client.getObject(
      {
        Key: `${artifactPath}.metadata`,
        Bucket: "cmo-dev",
      },
      (err, data) => {
        if (err) {
          reject(err);
        } else if (data && data.Body) {
          const response = JSON.parse(data.Body.toString("utf-8"));
          resolve(response);
        } else {
          reject(new Error("Invalid body returned"));
        }
      }
    );
  });
}

export function createReadStream(artifactPath: string) {
  const store = getStore();
  const stream = store.createReadStream({ key: artifactPath });
  return stream;
}

export function createWriteStream(artifactPath: string) {
  const store = getStore();
  const stream = store.createWriteStream({ key: artifactPath });
  return stream;
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

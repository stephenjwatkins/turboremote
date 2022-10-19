import * as dotenv from "dotenv";
dotenv.config();

import { stream } from "@turboremote/lib";
import path from "path";
import * as db from "./db";
import { ArtifactEvent } from "./index.d";
import {
  getAuthHeaders,
  getMetadataHeaders,
  parseFetchRequest,
  parsePutRequest,
} from "./request";
import { fastify } from "./server";
import * as localStore from "./stores/local";
import * as s3Store from "./stores/s3";

const store = process.env.STORE === "s3" ? s3Store : localStore;

fastify.route({
  url: "/v8/artifacts/events",
  method: "POST",
  handler: async (request, reply) => {
    const { token } = request;
    const events = request.body as ArtifactEvent[];
    await db.trackArtifactEvents(token, { events });
    reply.code(200).send({});
  },
});

fastify.route({
  url: "/v8/artifacts/:artifactId",
  method: ["GET", "OPTIONS"],
  handler: async (request, reply) => {
    const { teamId, token } = request;
    const { artifactId } = parseFetchRequest(request);

    if (request.method === "OPTIONS") {
      return reply
        .headers({
          ["Access-Control-Allow-Headers"]:
            "Authorization, Accept, Content-Type",
          ["Access-Control-Allow-Methods"]:
            "OPTIONS, GET, POST, PUT, PATCH, DELETE",
          ["Access-Control-Allow-Origin"]: "*",
        })
        .code(200)
        .send({});
    }

    const artifactPath = path.join(teamId, artifactId);

    const exists = await store.exists(artifactPath);
    if (!exists) {
      return reply
        .headers(getAuthHeaders(token))
        .code(404)
        .send({ error: { message: "Artifact not found" } });
    }

    const metadata = await store.readMetadata(artifactPath);
    const stream = store.createReadStream(artifactPath);

    await db.trackGetArtifact(token, {
      hash: artifactId,
      teamHash: teamId,
    });

    return reply
      .headers({
        ...getAuthHeaders(token),
        ...getMetadataHeaders(metadata),
      })
      .send(stream);
  },
});

fastify.put("/v8/artifacts/:artifactId", {
  handler: async (request, reply) => {
    const { teamId, token } = request;
    const { artifactId, duration, size, tag } = parsePutRequest(request);

    const artifactPath = path.join(teamId, artifactId);
    await store.writeMetadata(artifactPath, { duration, tag });

    const writeStream = store.createWriteStream(artifactPath);
    await stream.pump(request.raw, writeStream);

    const sizeInBytes = parseInt(size, 10);
    const durationInMs = parseInt(duration, 10);
    await db.trackPutArtifact(token, {
      hash: artifactId,
      teamHash: teamId,
      sizeInBytes,
      durationInMs,
    });

    return reply
      .headers(getAuthHeaders(token))
      .code(200)
      .send({ urls: [artifactPath] });
  },
});

const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    await fastify.listen({ port, host: "0.0.0.0" });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

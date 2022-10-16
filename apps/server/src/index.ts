import * as dotenv from "dotenv";
dotenv.config();

import createFastify from "fastify";
import path from "path";
import { logging, stream } from "@turboremote/lib";
import * as localStore from "./stores/local";
import * as s3Store from "./stores/s3";
import * as db from "./db";
import {
  getAuthHeaders,
  getMetadataHeaders,
  parseFetchRequest,
  parsePutRequest,
  parseRequest,
} from "./request";
import { ArtifactEvent } from "./index.d";

const store = process.env.STORE === "s3" ? s3Store : localStore;

const fastify = createFastify({ logger: logging.getLogger() });

fastify.register(require("@fastify/sensible"));

fastify.addContentTypeParser(
  "application/octet-stream",
  function (_request, _payload, done) {
    done(null);
  }
);

fastify.route({
  url: "/v8/artifacts/events",
  method: "POST",
  handler: async (request, reply) => {
    const { teamId, token } = parseRequest(request);

    if (!token) {
      return reply.code(403).send({
        error: { message: "Invalid token" },
      });
    }

    if (!teamId) {
      return reply.code(403).send({
        error: { message: "Invalid team" },
      });
    }

    try {
      await db.verifyRequest({ token, teamId });
    } catch (error) {
      console.error(error);
      if ((error as Error).message.startsWith("Unauthorized")) {
        return reply.code(403).send({
          error: { message: "Unauthorized" },
        });
      }
      return reply.code(500).send({});
    }

    const events = request.body as ArtifactEvent[];
    await db.trackArtifactEvents(token, { events });

    reply.code(200).send({});
  },
});

fastify.route({
  url: "/v8/artifacts/:artifactId",
  method: ["GET", "OPTIONS"],
  handler: async (request, reply) => {
    const { artifactId, teamId, token } = parseFetchRequest(request);

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

    if (!token) {
      return reply.code(403).send({
        error: { message: "Invalid token" },
      });
    }

    if (!teamId) {
      return reply.code(403).send({
        error: { message: "Invalid team" },
      });
    }

    try {
      await db.verifyRequest({ token, teamId });
    } catch (error) {
      console.error(error);
      if ((error as Error).message.startsWith("Unauthorized")) {
        return reply.code(403).send({
          error: { message: "Unauthorized" },
        });
      }
      return reply.code(500).send({});
    }

    try {
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
    } catch (error) {
      console.error(error);
      return reply
        .headers(getAuthHeaders(token))
        .code(400)
        .send({ error: { message: "Error reading artifact" } });
    }
  },
});

fastify.put("/v8/artifacts/:artifactId", {
  handler: async (request, reply) => {
    const { artifactId, teamId, token, duration, size, tag } =
      parsePutRequest(request);

    if (!token) {
      return reply.code(403).send({
        error: { message: "Invalid token" },
      });
    }

    if (!teamId) {
      return reply.code(403).send({
        error: { message: "Invalid team" },
      });
    }

    try {
      await db.verifyRequest({ token, teamId });
    } catch (error) {
      console.error(error);
      if ((error as Error).message.startsWith("Unauthorized")) {
        return reply.code(403).send({
          error: { message: "Unauthorized" },
        });
      }
      return reply.code(500).send({});
    }

    try {
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
    } catch (error) {
      console.error(error);
      return reply
        .headers(getAuthHeaders(token))
        .code(400)
        .send({ error: { message: "Error writing artifact" } });
    }
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

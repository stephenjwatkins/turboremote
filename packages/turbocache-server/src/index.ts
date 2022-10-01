import * as dotenv from "dotenv";
dotenv.config();

import createFastify from "fastify";
import path from "path";

import * as localStore from "./stores/local";
import * as s3Store from "./stores/s3";
import * as db from "./db";
import { base64ToUuid } from "./utils/encoding";
import { expiredLoginLink, home, validLoginLink } from "./utils/html";
import { getLogger } from "./utils/logging";
import { sendLoginEmail } from "./utils/notifications";
import { isBrowserRequest } from "./utils/platform";
import {
  getAuthHeaders,
  getMetadataHeaders,
  parseFetchRequest,
  parsePutRequest,
} from "./utils/request";
import { pump } from "./utils/stream";
import { sanitizeEmail } from "./utils/validations";

const store = process.env.STORE === "s3" ? s3Store : localStore;

const fastify = createFastify({
  logger: getLogger(),
});

fastify.register(require("@fastify/sensible"));

fastify.addContentTypeParser(
  "application/octet-stream",
  function (_request, _payload, done) {
    done(null);
  }
);

fastify.route({
  url: "/",
  method: "GET",
  handler: async (request, reply) => {
    return reply.code(200).type("text/html").send(home());
  },
});

fastify.route({
  url: "/activations",
  method: "POST",
  handler: async (request, reply) => {
    const { email: unsanitizedEmail } = request.body as any;
    const email = sanitizeEmail(unsanitizedEmail);
    const { id, hash } = await db.createLogin({ email });
    await sendLoginEmail({ email, hash });
    return reply.code(201).send({ id });
  },
});

fastify.route({
  url: "/activations/:id",
  method: "GET",
  handler: async (request, reply) => {
    const { id: loginId } = request.params as { id: string };

    const accountAndToken = await db.fetchAccountFromLogin({ id: loginId });
    if (!accountAndToken) {
      return reply.code(404).send();
    }

    return reply.code(200).send(accountAndToken);
  },
});

fastify.route({
  url: "/logins/:hash",
  method: "GET",
  handler: async (request, reply) => {
    const { hash: base64Hash } = request.params as { hash: string };
    const hash = base64ToUuid(base64Hash);

    if (!isBrowserRequest(request)) {
      return reply.code(404).send();
    }

    const login = await db.fetchValidLogin({ hash });
    if (!login) {
      return reply.code(404).type("text/html").send(expiredLoginLink());
    }

    await db.processUserLogin(login);
    return reply.code(200).type("text/html").send(validLoginLink());
  },
});

fastify.route({
  url: "/teams",
  method: "GET",
  handler: async (request, reply) => {
    const { authorization } = request.headers;
    if (
      !authorization ||
      authorization.length === 0 ||
      !authorization.includes("Bearer ")
    ) {
      return reply.code(403).send();
    }
    const [_type, token] = authorization.split(" ");
    if (!token) {
      return reply.code(403).send();
    }

    const teams = await db.fetchTeams(token);
    return reply.send(teams);
  },
});

fastify.route({
  url: "/teams",
  method: "POST",
  handler: async (request, reply) => {
    const { authorization } = request.headers;
    if (
      !authorization ||
      authorization.length === 0 ||
      !authorization.includes("Bearer ")
    ) {
      return reply.code(403).send();
    }
    const [_type, token] = authorization.split(" ");
    if (!token) {
      return reply.code(403).send();
    }

    const { name } = request.body as { name: string };
    const team = await db.createTeam(token, { name });

    return reply.send(team);
  },
});

fastify.route({
  url: "/tokens",
  method: "GET",
  handler: async (request, reply) => {
    const { authorization } = request.headers;
    if (
      !authorization ||
      authorization.length === 0 ||
      !authorization.includes("Bearer ")
    ) {
      return reply.code(403).send();
    }
    const [_type, token] = authorization.split(" ");
    if (!token) {
      return reply.code(403).send();
    }

    const tokens = await db.fetchTokens(token);
    return reply.send(tokens);
  },
});

fastify.route({
  url: "/tokens",
  method: "POST",
  handler: async (request, reply) => {
    const { authorization } = request.headers;
    if (
      !authorization ||
      authorization.length === 0 ||
      !authorization.includes("Bearer ")
    ) {
      return reply.code(403).send();
    }
    const [_type, token] = authorization.split(" ");
    if (!token) {
      return reply.code(403).send();
    }

    const { name, teamId } = request.body as { name: string; teamId: number };
    const createdToken = await db.createToken(token, { name, teamId });
    return reply.send(createdToken);
  },
});

fastify.route({
  url: "/tokens/:tokenId",
  method: "DELETE",
  handler: async (request, reply) => {
    const { authorization } = request.headers;
    if (
      !authorization ||
      authorization.length === 0 ||
      !authorization.includes("Bearer ")
    ) {
      return reply.code(403).send();
    }
    const [_type, token] = authorization.split(" ");
    if (!token) {
      return reply.code(403).send();
    }

    const { tokenId } = request.params as { tokenId: number };
    await db.deleteToken(token, { tokenId });
    return reply.code(200).send({});
  },
});

fastify.route({
  url: "/memberships",
  method: "GET",
  handler: async (request, reply) => {
    const { authorization } = request.headers;
    if (
      !authorization ||
      authorization.length === 0 ||
      !authorization.includes("Bearer ")
    ) {
      return reply.code(403).send();
    }
    const [_type, token] = authorization.split(" ");
    if (!token) {
      return reply.code(403).send();
    }

    const memberships = await db.fetchMemberships(token);
    return reply.send(memberships);
  },
});

fastify.route({
  url: "/memberships",
  method: "POST",
  handler: async (request, reply) => {
    const { authorization } = request.headers;
    if (
      !authorization ||
      authorization.length === 0 ||
      !authorization.includes("Bearer ")
    ) {
      return reply.code(403).send();
    }
    const [_type, token] = authorization.split(" ");
    if (!token) {
      return reply.code(403).send();
    }

    const { teamId, email } = request.body as { teamId: number; email: string };
    const invite = await db.addTeamMember(token, { teamId, email });
    return reply.code(201).send(invite);
  },
});

fastify.route({
  url: "/team/:teamId/memberships",
  method: "GET",
  handler: async (request, reply) => {
    const { authorization } = request.headers;
    if (
      !authorization ||
      authorization.length === 0 ||
      !authorization.includes("Bearer ")
    ) {
      return reply.code(403).send();
    }
    const [_type, token] = authorization.split(" ");
    if (!token) {
      return reply.code(403).send();
    }

    const { teamId } = request.params as { teamId: number };
    const memberships = await db.fetchTeamMemberships(token, { teamId });
    return reply.send(memberships);
  },
});

fastify.route({
  url: "/memberships/:memberId",
  method: "DELETE",
  handler: async (request, reply) => {
    const { authorization } = request.headers;
    if (
      !authorization ||
      authorization.length === 0 ||
      !authorization.includes("Bearer ")
    ) {
      return reply.code(403).send();
    }
    const [_type, token] = authorization.split(" ");
    if (!token) {
      return reply.code(403).send();
    }

    const { memberId } = request.params as { memberId: number };
    await db.removeTeamMember(token, { memberId });
    return reply.code(200).send({});
  },
});

fastify.post("/v8/artifacts/events", (_request, reply) => {
  reply.code(200).send({});
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
      reply.code(403).send({
        error: { message: "Invalid token" },
      });
    }

    if (!teamId) {
      reply.code(403).send({
        error: { message: "Invalid team" },
      });
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
      return reply
        .headers({
          ...getAuthHeaders(token),
          ...getMetadataHeaders(metadata),
        })
        .send(stream);
    } catch (error) {
      return reply
        .headers(getAuthHeaders(token))
        .code(400)
        .send({ error: { message: "Error reading artifact" } });
    }
  },
});

fastify.put("/v8/artifacts/:artifactId", {
  handler: async (request, reply) => {
    const { artifactId, teamId, token, duration, tag } =
      parsePutRequest(request);

    if (!token) {
      reply.code(403).send({
        error: { message: "Invalid token" },
      });
    }

    if (!teamId) {
      reply.code(403).send({
        error: { message: "Invalid team" },
      });
    }

    try {
      const artifactPath = path.join(teamId, artifactId);
      await store.writeMetadata(artifactPath, { duration, tag });

      const stream = store.createWriteStream(artifactPath);
      await pump(request.raw, stream);

      return reply
        .headers(getAuthHeaders(token))
        .code(200)
        .send({ urls: [artifactPath] });
    } catch (err) {
      return reply
        .headers(getAuthHeaders(token))
        .code(400)
        .send({ error: { message: "Error writing artifact" } });
    }
  },
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

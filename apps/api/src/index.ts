import * as dotenv from "dotenv";
dotenv.config();

import createFastify from "fastify";
import { logging, validations, encoding, platform } from "@turboremote/lib";

import * as db from "./db";
import * as notifications from "./notifications";

const fastify = createFastify({
  logger: logging.getLogger(),
});

fastify.register(require("@fastify/cors"), {
  origin: ["http://localhost:3002", "https://turboremote.org"],
});
fastify.register(require("@fastify/sensible"));

fastify.route({
  url: "/activations",
  method: "POST",
  handler: async (request, reply) => {
    const { email: unsanitizedEmail } = request.body as any;
    const email = validations.sanitizeEmail(unsanitizedEmail);
    const { id, hash } = await db.createLogin({ email });
    await notifications.sendLoginEmail({ email, hash });
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

fastify.route({
  url: "/logins",
  method: "POST",
  handler: async (request, reply) => {
    const { hash: base64Hash } = request.body as { hash: string };
    const hash = encoding.base64ToUuid(base64Hash);

    const login = await db.fetchValidLogin({ hash });
    if (!login) {
      return reply.code(404).send({ error: { message: "Expired." } });
    }

    await db.processUserLogin(login);
    return reply.code(200).send({});
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

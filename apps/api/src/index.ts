import * as dotenv from "dotenv";
dotenv.config();

import { encoding, validations } from "@turboremote/lib";
import * as db from "./db";
import * as notifications from "./notifications";
import { fastify } from "./server";
import { Sentry } from "./sentry";

declare module "fastify" {
  interface FastifyRequest {
    token: string;
    account: { id: number; email: string };
  }
}

// Authenticated routes
fastify.register((instance, opts, done) => {
  instance.decorateRequest("token", "");
  instance.decorateRequest("tokenUuid", "");
  instance.addHook("preHandler", async (request, _reply) => {
    const { authorization } = request.headers;
    if (
      !authorization ||
      authorization.length === 0 ||
      !authorization.includes("Bearer ")
    ) {
      throw instance.httpErrors.forbidden("Invalid token");
    }

    const [_type, token] = authorization.split(" ");
    if (!token) {
      throw instance.httpErrors.forbidden("Invalid token");
    }

    request.token = token;
    request.account = await db.fetchAccountFromToken(token);
  });

  instance.addHook("preHandler", async (request) => {
    Sentry.setUser({ email: request.account.email });
  });

  instance.route({
    url: "/teams",
    method: "GET",
    handler: async (request, reply) => {
      const { token } = request;
      throw new Error("blah3");
      const teams = await db.fetchTeams(token);
      return reply.send(teams);
    },
  });

  instance.route({
    url: "/teams",
    method: "POST",
    handler: async (request, reply) => {
      const { token } = request;
      const { name } = request.body as { name: string };
      const team = await db.createTeam(token, { name });
      return reply.send(team);
    },
  });

  instance.route({
    url: "/tokens",
    method: "GET",
    handler: async (request, reply) => {
      const { token } = request;
      const tokens = await db.fetchTokens(token);
      return reply.send(tokens);
    },
  });

  instance.route({
    url: "/tokens",
    method: "POST",
    handler: async (request, reply) => {
      const { token } = request;
      const { name, teamId } = request.body as { name: string; teamId: number };
      const createdToken = await db.createToken(token, { name, teamId });
      return reply.send(createdToken);
    },
  });

  instance.route({
    url: "/tokens/:tokenId",
    method: "DELETE",
    handler: async (request, reply) => {
      const { token } = request;
      const { tokenId } = request.params as { tokenId: number };
      await db.deleteToken(token, { tokenId });
      return reply.code(200).send({});
    },
  });

  instance.route({
    url: "/memberships",
    method: "GET",
    handler: async (request, reply) => {
      const { token } = request;
      const memberships = await db.fetchMemberships(token);
      return reply.send(memberships);
    },
  });

  instance.route({
    url: "/memberships",
    method: "POST",
    handler: async (request, reply) => {
      const { token } = request;

      const { teamId, email } = request.body as {
        teamId: number;
        email: string;
      };
      const { invite, team } = await db.addTeamMember(token, { teamId, email });

      await notifications.sendInviteEmail({
        email,
        teamName: team.name,
        isNewUser: !invite.accepted_at,
      });

      return reply.code(201).send(invite);
    },
  });

  instance.route({
    url: "/team/:teamId/memberships",
    method: "GET",
    handler: async (request, reply) => {
      const { token } = request;
      const { teamId } = request.params as { teamId: number };
      const memberships = await db.fetchTeamMemberships(token, { teamId });
      return reply.send(memberships);
    },
  });

  instance.route({
    url: "/memberships/:memberId",
    method: "DELETE",
    handler: async (request, reply) => {
      const { token } = request;
      const { memberId } = request.params as { memberId: number };
      await db.removeTeamMember(token, { memberId });
      return reply.code(200).send({});
    },
  });

  done();
});

// Unauthenticated
fastify.register((instance, opts, done) => {
  instance.route({
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

  instance.route({
    url: "/activations/:id",
    method: "GET",
    handler: async (request, reply) => {
      const { id: loginId } = request.params as { id: string };

      const accountAndToken = await db.fetchAccountFromLogin({ id: loginId });
      if (!accountAndToken) {
        throw fastify.httpErrors.notFound();
      }

      return reply.code(200).send(accountAndToken);
    },
  });

  instance.route({
    url: "/logins",
    method: "POST",
    handler: async (request, reply) => {
      const { hash: base64Hash } = request.body as { hash: string };
      const hash = encoding.base64ToUuid(base64Hash);

      const login = await db.fetchValidLogin({ hash });
      if (!login) {
        throw fastify.httpErrors.notFound("Login expired");
      }

      await db.processUserLogin(login);
      return reply.code(200).send({});
    },
  });

  done();
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

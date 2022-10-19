import fastifySensible from "@fastify/sensible";
import { logging } from "@turboremote/lib";
import createFastify from "fastify";
import { parseRequest } from "./request";
import { Sentry } from "./sentry";
import * as db from "./db";
declare module "fastify" {
  interface FastifyRequest {
    teamId: string;
    token: string;
    account: { id: number; email: string };
  }
}

const fastify = createFastify({ logger: logging.getLogger() });

fastify.register(fastifySensible);

fastify.setErrorHandler(function (error, request, reply) {
  const statusCode = error.statusCode || 500;
  const message = error.message;
  const name = require("http").STATUS_CODES[statusCode];
  reply.status(statusCode).send({
    statusCode,
    error: name,
    message,
  });
});

fastify.addHook("onError", async (_request, reply, error) => {
  reply.log.error(error);
  Sentry.captureException(error);
});

fastify.addContentTypeParser(
  "application/octet-stream",
  function (_request, _payload, done) {
    done(null);
  }
);

fastify.addHook("preHandler", async (request, _reply) => {
  const { teamId, token } = parseRequest(request);
  if (!token) {
    throw fastify.httpErrors.forbidden("Invalid token");
  }
  if (!teamId) {
    throw fastify.httpErrors.forbidden("Invalid team");
  }
  const account = await db.verifyRequest({ token, teamId });

  request.token = token;
  request.teamId = teamId;
  request.account = account;
});

fastify.addHook("preHandler", async (request) => {
  Sentry.setUser({ email: request.account.email });
});

export { fastify };

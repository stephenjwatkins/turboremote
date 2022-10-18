import fastifySensible from "@fastify/sensible";
import fastifyCors from "@fastify/cors";
import createFastify from "fastify";
import { logging } from "@turboremote/lib";
import { Sentry } from "./sentry";

const fastify = createFastify({ logger: logging.getLogger() });

fastify.register(fastifyCors, { origin: [process.env.CORS_ORIGIN!] });
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

export { fastify };

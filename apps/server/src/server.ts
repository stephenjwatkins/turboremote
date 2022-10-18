import fastifySensible from "@fastify/sensible";
import { logging } from "@turboremote/lib";
import createFastify from "fastify";
import { Sentry } from "./sentry";

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

export { fastify };

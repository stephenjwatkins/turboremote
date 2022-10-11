import { FastifyRequest } from "fastify";

export function isBrowserRequest(request: FastifyRequest) {
  const hasAccept =
    request.headers["accept"] && request.headers["accept"].length > 0;
  const hasUserAgent =
    request.headers["user-agent"] && request.headers["user-agent"].length > 0;
  const isNotBot =
    request.headers["user-agent"] &&
    !request.headers["user-agent"].toLowerCase().includes("bot");
  return hasAccept && hasUserAgent && isNotBot;
}

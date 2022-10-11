FROM node:16-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY . .
RUN npm i -g pnpm
RUN pnpm install
RUN pnpm build:lib
RUN pnpm build:api

FROM node:16-alpine AS runner
WORKDIR /app

EXPOSE 8080

ENV NODE_ENV production
ENV LOGIN_URL https://turboremote.org/login?code=<code>

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 apijs

COPY --from=builder /app ./
RUN npm i -g pnpm

USER apijs

CMD ["pnpm", "start:api"]

FROM node:16-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY . .
RUN npm i -g pnpm
RUN pnpm install
RUN pnpm build:lib
RUN pnpm build:server

FROM node:16-alpine AS runner
WORKDIR /app

EXPOSE 8080

ENV NODE_ENV production
ENV STORE s3
ENV SENTRY_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 serverjs

COPY --from=builder /app ./
RUN npm i -g pnpm

USER serverjs

CMD ["pnpm", "start:server"]

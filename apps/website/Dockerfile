FROM node:16-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY . .
RUN npm i -g pnpm
RUN pnpm install

ENV NEXT_TELEMETRY_DISABLED 1
ARG NEXT_PUBLIC_API_URL="https://api.turboremote.org"

RUN pnpm build:request
RUN pnpm build:website

FROM node:16-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app ./
RUN npm i -g pnpm

USER nextjs

CMD ["pnpm", "start:website"]

FROM node:16-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY . .
RUN npm i -g pnpm
RUN pnpm install

ENV NEXT_TELEMETRY_DISABLED 1
ARG NEXT_PUBLIC_API_URL="https://api.turboremote.org"
ARG NEXT_PUBLIC_SENTRY_DSN="https://f1bc104e413443d5b798a1a218178c18@o4503995969241088.ingest.sentry.io/4503995974483968"
ARG NEXT_PUBLIC_SENTRY_ENV="production"
ARG NEXT_PUBLIC_GA_TRACKING_ID="G-CGWG7YEQBY"

RUN pnpm build:request
RUN pnpm build:website

FROM node:16-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV NEXT_PUBLIC_API_URL="https://api.turboremote.org"
ENV NEXT_PUBLIC_SENTRY_DSN="https://f1bc104e413443d5b798a1a218178c18@o4503995969241088.ingest.sentry.io/4503995974483968"
ENV NEXT_PUBLIC_SENTRY_ENV="production"
ENV NEXT_PUBLIC_GA_TRACKING_ID="G-CGWG7YEQBY"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app ./
RUN npm i -g pnpm

USER nextjs

CMD ["pnpm", "start:website"]

FROM node:18-alpine AS base

RUN apk add -U tzdata
ENV TZ=Europe/Paris
RUN cp /usr/share/zoneinfo/Europe/Paris /etc/localtime

LABEL org.opencontainers.image.source=https://github.com/kgrab75/black-mirror
LABEL org.opencontainers.image.description="My container image"
LABEL org.opencontainers.image.licenses=MIT

ARG BASE_URL
ARG NEXT_PUBLIC_OPEN_WEATHER_API_KEY
ARG NEXT_PUBLIC_PRIM_API_KEY
ARG BASE_URL_DOMO
ARG USERNAME_DOMO
ARG PASSWORD_DOMO
ARG NYLAS_CLIENT_ID
ARG NYLAS_API_KEY
ARG NYLAS_API_URI

ENV BASE_URL=$BASE_URL
ENV NEXT_PUBLIC_OPEN_WEATHER_API_KEY=$NEXT_PUBLIC_OPEN_WEATHER_API_KEY
ENV NEXT_PUBLIC_PRIM_API_KEY=$NEXT_PUBLIC_PRIM_API_KEY
ENV BASE_URL_DOMO=$BASE_URL_DOMO
ENV USERNAME_DOMO=$USERNAME_DOMO
ENV PASSWORD_DOMO=$PASSWORD_DOMO
ENV NYLAS_CLIENT_ID=$NYLAS_CLIENT_ID
ENV NYLAS_API_KEY=$NYLAS_API_KEY
ENV NYLAS_API_URI=$NYLAS_API_URI

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
ENV NEXT_TELEMETRY_DISABLED=1

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run telemetry_off && npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
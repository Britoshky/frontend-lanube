# syntax=docker/dockerfile:1
ARG NODE_VERSION=22-bookworm-slim
FROM node:${NODE_VERSION} AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

FROM deps AS build
ARG BACKEND_INTERNAL_URL=http://192.168.30.254:4003/api/v1
ARG NEXT_PUBLIC_BACKEND_URL=https://lanubefm.cl/api/v1
ARG NEXT_PUBLIC_API_URL=https://lanubefm.cl/api/v1
ARG NEXT_PUBLIC_MEDIA_BASE_URL=https://lanubefm.cl/api/editorial/media
ENV BACKEND_INTERNAL_URL=${BACKEND_INTERNAL_URL}
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_MEDIA_BASE_URL=${NEXT_PUBLIC_MEDIA_BASE_URL}
COPY . .
RUN --mount=type=cache,target=/app/.next/cache npm run build

FROM base AS prod-deps
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3010
RUN apt-get update \
  && apt-get install -y --no-install-recommends dumb-init curl \
  && rm -rf /var/lib/apt/lists/*
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/.next ./.next
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/package*.json ./
COPY --from=build --chown=node:node /app/next.config.ts ./next.config.ts
ARG BACKEND_INTERNAL_URL=http://192.168.30.254:4003/api/v1
ARG NEXT_PUBLIC_BACKEND_URL=https://lanubefm.cl/api/v1
ARG NEXT_PUBLIC_API_URL=https://lanubefm.cl/api/v1
ARG NEXT_PUBLIC_MEDIA_BASE_URL=https://lanubefm.cl/api/editorial/media
ENV BACKEND_INTERNAL_URL=${BACKEND_INTERNAL_URL}
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_MEDIA_BASE_URL=${NEXT_PUBLIC_MEDIA_BASE_URL}
EXPOSE 3010
USER node
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "run", "start", "--", "-p", "3010"]

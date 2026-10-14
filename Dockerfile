# syntax=docker/dockerfile:1

# Full install (dev dependencies included) to build the SvelteKit app.
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund
COPY . .
RUN npm run build

# Runtime dependencies only: adapter-node already bundles the dev ones into build/.
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev --ignore-scripts --no-audit --no-fund

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3000
COPY --from=deps /app/node_modules ./node_modules
COPY package.json server.js realtime-attach.js migrate.js ./
COPY drizzle ./drizzle
COPY --from=build /app/build ./build
# The code stays read-only for the app user: only uploaded files (a mounted volume) are writable.
RUN mkdir -p data/storage && chown node:node data/storage
USER node
EXPOSE 3000
CMD ["node", "server.js"]

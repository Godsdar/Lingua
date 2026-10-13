# syntax=docker/dockerfile:1

# ---- build: compile the static web app from the shared core ----
FROM node:24-slim AS build
WORKDIR /app
# The web build does not need the Electron runtime binary.
ENV ELECTRON_SKIP_BINARY_DOWNLOAD=1
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build:web

# ---- ci: typecheck and build every surface (desktop, extension, web) ----
FROM build AS ci
RUN npm test \
 && npm run typecheck \
 && npm run build \
 && npm run build:ext \
 && npm run build:server \
 && npm run smoke:server

# ---- server-build: compile the standalone API ----
FROM build AS server-build
RUN npm run typecheck:server && npm run build:server

# ---- server: opt-in API; provide LINGUA_API_KEY at runtime ----
FROM node:24-slim AS server
WORKDIR /app
ENV NODE_ENV=production LINGUA_HOST=0.0.0.0 PORT=8787
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force
COPY --from=server-build /app/server-dist ./server-dist
USER node
EXPOSE 8787
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s CMD node -e "fetch('http://127.0.0.1:8787/health/ready').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server-dist/index.mjs"]

# ---- web: serve the static SPA ----
FROM nginx:1.27-alpine AS web
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/web/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/ >/dev/null 2>&1 || exit 1

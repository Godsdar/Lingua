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
 && npm run build:ext

# ---- web: serve the static SPA ----
FROM nginx:1.27-alpine AS web
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/web/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/ >/dev/null 2>&1 || exit 1

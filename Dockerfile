# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

# Configurable upstream addresses for API proxies
ENV SIGNAL_API_UPSTREAM=host.docker.internal:18810
ENV PREDICT_API_UPSTREAM=host.docker.internal:18801
ENV DATA_API_UPSTREAM=host.docker.internal:8081

COPY --from=builder /app/dist /usr/share/nginx/html
RUN chmod -R a+r /usr/share/nginx/html
COPY nginx.conf /etc/nginx/templates/default.conf.template
EXPOSE 3080
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3080/ || exit 1

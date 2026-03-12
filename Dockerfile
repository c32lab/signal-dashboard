# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false
COPY . .
RUN npm run build

# Stage 2: Serve with Node.js
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev
ENV SIGNAL_API_UPSTREAM=host.docker.internal:18810
ENV PREDICT_API_UPSTREAM=host.docker.internal:18801
ENV DATA_API_UPSTREAM=host.docker.internal:8081
EXPOSE 3080
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3080/ || exit 1
CMD ["node", "server.js"]

FROM node:18-alpine AS builder
WORKDIR /app
ADD . .
RUN npm install -g pnpm
RUN pnpm install
RUN pnpm run build

FROM node:18-alpine
WORKDIR /app
RUN npm install -g pnpm
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

CMD ["pnpm", "run", "start"]
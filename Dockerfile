FROM node:18-alpine AS deps
WORKDIR /app
RUN npm install -g pnpm
COPY package*.json .
ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
RUN pnpm install

FROM node:18-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY --from=deps /app/node_modules ./node_modules

ADD . .
COPY .env.example .env

RUN pnpm run build

FROM node:18-alpine
RUN npm install -g pnpm
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

CMD ["pnpm", "run", "start"]
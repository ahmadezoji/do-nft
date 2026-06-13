FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package.json ./
COPY package-lock.json ./
COPY tsconfig.base.json ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json
COPY backend/tsconfig.json ./backend/tsconfig.json
COPY backend/prisma ./backend/prisma

RUN npm install
RUN npm run prisma:generate --workspace backend

COPY backend ./backend

WORKDIR /app/backend

EXPOSE 4000

CMD ["npm", "run", "docker:dev"]

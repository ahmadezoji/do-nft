FROM node:20-alpine

WORKDIR /app

COPY package.json ./
COPY tsconfig.base.json ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json
COPY frontend/tsconfig.json ./frontend/tsconfig.json
COPY frontend/tsconfig.node.json ./frontend/tsconfig.node.json
COPY frontend/vite.config.ts ./frontend/vite.config.ts

RUN npm install

COPY frontend ./frontend

WORKDIR /app/frontend

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

FROM node:22-alpine AS menu-builder
WORKDIR /workspace
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
COPY angular.json tsconfig*.json ./
COPY public/ ./public/
COPY src/ ./src/
RUN npm run build

FROM node:22-alpine AS sudoku-builder
WORKDIR /workspace
COPY M306-sudoku/frontend/package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
COPY M306-sudoku/frontend/ ./
RUN npm run build -- --base-href=/sudoku/

FROM node:22-alpine AS nonogram-builder
WORKDIR /workspace
COPY M306-nonogram/frontend/package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
COPY M306-nonogram/frontend/ ./
RUN npm run build -- --base-href=/nonogram/

FROM node:22-alpine AS minesweeper-builder
WORKDIR /workspace
COPY M306-minesweeper/minesweeper-frontend/package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
COPY M306-minesweeper/minesweeper-frontend/ ./
RUN npm run build -- --base-href=/minesweeper/

FROM nginxinc/nginx-unprivileged:1.29-alpine

COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=menu-builder /workspace/dist/tuffesmenu/browser/ /usr/share/nginx/html/
COPY --from=sudoku-builder /workspace/dist/sudoku-frontend/browser/ /usr/share/nginx/html/sudoku/
COPY --from=nonogram-builder /workspace/dist/frontend/browser/ /usr/share/nginx/html/nonogram/
COPY --from=minesweeper-builder /workspace/dist/minesweeper-frontend/browser/ /usr/share/nginx/html/minesweeper/

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1

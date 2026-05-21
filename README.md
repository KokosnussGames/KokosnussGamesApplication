# Kokosnuss Games Application

Kokosnuss Games is a menu application that launches three minigames inside iframes:

- Sudoku
- Minesweeper
- Nonogram

The final application is intended to run through Docker Compose. The `frontend` container builds and serves the menu plus all three game frontends through Nginx. The three Spring Boot backends run as separate containers behind the same Nginx reverse proxy.

## Requirements

- Git
- Docker
- Docker Compose plugin (`docker compose`)

For local frontend development without Docker, install Node.js as well. The menu currently uses Angular 20.

## Project Structure

```text
.
├── compose.yaml
├── docker/nginx/                 # Nginx Dockerfile and reverse proxy config
├── src/                          # Menu Angular app
├── public/                       # Menu static assets
├── M306-sudoku/                  # Sudoku frontend and backend
├── M306-minesweeper/             # Minesweeper frontend and backend
└── M306-nonogram/                # Nonogram frontend and backend
```

## Run The Full Application

From the repository root:

```bash
docker compose up --build
```

Open:

```text
http://localhost:8080
```

The menu is served at `/` and the games are served at:

```text
http://localhost:8080/sudoku/
http://localhost:8080/minesweeper/
http://localhost:8080/nonogram/
```

Backend API routes are proxied through Nginx:

```text
/api/sudoku
/api/minesweeper
/api/nonogram
```

## Common Docker Commands

Start in the background:

```bash
docker compose up -d --build
```

Stop the app:

```bash
docker compose down
```

View service status:

```bash
docker compose ps
```

View logs:

```bash
docker compose logs -f
```

Rebuild only the frontend image:

```bash
docker compose build frontend
docker compose up -d frontend
```

## Local Menu Development

To work only on the menu Angular app:

```bash
npm install
npm start
```

Open:

```text
http://localhost:4200
```

This only starts the menu frontend. The full integrated app with all game frontends and backends should be tested with Docker Compose.

Build the menu locally:

```bash
npm run build
```

## Notes

- The game iframes are loaded from the same Nginx host, so the games do not need to be started separately when using Docker Compose.
- The iframe backgrounds are transparent so the games appear directly on the menu sign.
- If the first Docker build takes a while, it is usually downloading Node, Java, Maven, Gradle, and npm dependencies. Later builds should be faster because Docker caches the layers.
- If a game page looks blank, check `docker compose logs -f frontend` and make sure the game path and API route return `200`.

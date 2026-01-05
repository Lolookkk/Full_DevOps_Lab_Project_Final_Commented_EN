# AutoMessage Monorepo

This repo contains a minimal backend (Express + tests + lint) and a minimal frontend (Vite + React) to unblock parallel work.

## Quickstart

Backend:
```bash
cd backend
npm ci
npm run dev          # http://localhost:3000
npm test -- --coverage
```

Frontend:
```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

## Backend routes

- `GET /` basic JSON greeting
- `GET /health` health check (200 OK)
- `GET /version` returns `{ version }` from `package.json`
- `GET /info` returns `{ name, version, node, uptime }`
- `GET /boom` triggers an error to test the global error handler

Routes are auto-mounted from `backend/src/routes/auto/*.route.js`.

## Project layout

```
backend/
  src/
    app.js          # Express app (auto-mount + global error handler)
    index.js        # server entry (not used by tests)
    routes/auto/    # add *.route.js files here
    utils/          # small testable helpers
  test/
    *.test.js       # integration (HTTP) tests
    unit/*.test.js  # pure unit tests
frontend/
  src/              # React app
```

## CI (GitHub Actions)

The workflow runs backend lint + tests with coverage, and builds the frontend.

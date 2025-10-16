# Machine Task – Full‑Stack App (NestJS + React + Vite)

A minimal full‑stack application showcasing authentication, user management, and a modern search UI with Tailwind CSS v4. The repo contains a NestJS server (`server/`) and a React + Vite client (`client/`).

## Features
- JWT authentication (login/register) with protected routes
- Users list with a search card UI (tabs, dropdown filters, highlights)
- Toggleable sections (Files, People, Chats) via settings dropdown
- Client-side validation for login, register, and search input
- Tailwind CSS v4 styling with subtle animations and smooth container resizing
- CORS configured to allow the client origin

## Tech Stack
- Server: NestJS 10, TypeORM, PostgreSQL, Passport JWT
- Client: React 19, Vite 7, Tailwind CSS v4, PostCSS

## Monorepo Structure
```
machineTask/
  client/     # React + Vite app
  server/     # NestJS API
```

## Prerequisites
- Node.js 20+ (Vite 7 and some plugins require >= 20.19)
- PostgreSQL database

## Setup – Server (NestJS)
1. Install deps
   ```bash
   cd server
   npm install
   ```
2. Configure database and JWT via env (create `.env` in `server/`):
   ```env
   # Server
   PORT=3000
   CLIENT_ORIGIN=http://localhost:5173

   # Database (example)
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASS=postgres
   DB_NAME=machinetask

   # JWT
   JWT_SECRET=secretkey
   JWT_EXPIRES_IN=3600
   ```
   The app uses `server/src/ormconfig.ts` (already wired) and `app.module.ts` config.
3. Run dev server
   ```bash
   npm run start:dev
   ```

### API (high level)
- `POST /auth/register` – Register user { name, email, password }
- `POST /auth/login` – Login, returns `{ access_token, user }`
- `GET /users?search=...` – List users (JWT required)
- `DELETE /users/:id` – Delete user (JWT required)

Add the `Authorization: Bearer <token>` header for protected routes.

## Setup – Client (React + Vite)
1. Install deps
   ```bash
   cd client
   npm install
   ```
2. Start dev server
   ```bash
   npm run dev
   ```

The client expects the API at `http://localhost:3000`. Adjust `client/src/api.ts` if needed.

## Tailwind CSS v4 Notes
- CSS uses `@import "tailwindcss";` (not `@tailwind` at‑rules)
- PostCSS plugin is `@tailwindcss/postcss` configured in `client/postcss.config.js`

## Auth & Routing
- `ProtectedRoute` gatekeeps private pages (e.g., `/users`)
- `GuestRoute` prevents logged‑in users from seeing `/login` and `/register`
- Token stored in `localStorage` at `token`
- Logout available in the Users page header

## UI – Users Page
- Search input with validation (length ≤ 50; allowed: letters, numbers, space, -, _, .; disallows whitespace‑only)
- Tabs: All / Files / People / Chats
- Gear icon opens settings dropdown to toggle sections; tabs hide/show accordingly
- Smooth dropdown and list animations (see `client/src/index.css`)

## Common Issues & Fixes
- Tailwind v4: ensure `@tailwindcss/postcss` is installed and configured
- CORS: `server/src/main.ts` enables CORS; set `CLIENT_ORIGIN` if your client runs on a different URL
- JWT expiration: configured via `JWT_EXPIRES_IN` (seconds). Example: `3600`

## Scripts
Server:
```bash
npm run start        # start
npm run start:dev    # dev with watch
npm run build        # build
```

Client:
```bash
npm run dev          # vite dev
npm run build        # build
npm run preview      # preview build
```

## Production Notes
- Serve the API behind HTTPS and set secure cookies or secure storage
- Configure a production database and strong `JWT_SECRET`
- Consider rate limiting and CSRF protection based on your deployment

## License
MIT – use as you wish.


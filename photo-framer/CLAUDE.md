# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Photo-Framer is a personal photo gallery application for tomasquinones.com. It's a full-stack app with a React (Vite) client and an Express/Node.js server backed by MySQL. Deployed to cPanel via GitHub Actions at the `/photos/` subpath.

## Commands

```bash
# Install all dependencies (root, client, server)
npm run install:all

# Run both client and server in dev mode (concurrent)
npm run dev

# Run only the client (Vite dev server on port 5173)
npm run dev:client

# Run only the server (nodemon on port 3001)
npm run dev:server

# Build client for production
npm run build

# Start production server
npm start
```

## Architecture

**Client-server monorepo** with separate `package.json` files at root, `client/`, and `server/`. The root orchestrates both with `concurrently`.

### Server (`server/`)
- **Express** app using ES modules (`"type": "module"`)
- **MySQL** via `mysql2/promise` connection pool — all DB access through `config/database.js` helpers (`query`, `queryOne`)
- **Session-based auth** stored in the DB (not JWTs for session management) — cookies with `session_id`, sliding 24h expiration
- **Image processing**: uploads go to `uploads/temp/` via multer, then `services/imageProcessor.js` validates magic bytes, extracts EXIF with `exifr`, creates thumbnails with `sharp` (max 800px), and stores originals + thumbnails in `uploads/originals/` and `uploads/thumbnails/`
- Route structure: `routes/` → `controllers/` pattern, middleware in `middleware/`
- Security middleware: helmet, CORS, rate limiting, bot blocking, hotlink protection

### Client (`client/`)
- **React 19** + **React Router v7** + **Vite** + **Axios**
- Base path is `/photos/` in production, `/` in dev (configured in `vite.config.js`)
- API calls via `services/api.js` (axios instance that derives baseURL from `import.meta.env.BASE_URL`)
- Dev server proxies `/api` to `localhost:3001`
- Auth context in `context/AuthContext.jsx`, protected routes via `ProtectedRoute` component
- User roles: `admin`, `contributor`, `viewer`

### Production Deployment
- Hosted on cPanel with Passenger (Node.js), the server strips `/photos` prefix from incoming URLs
- Client build output goes to `server/client/` for static serving
- GitHub Actions deploys on push to `main` when `photo-framer/` files change

### Database
- Schema in `scripts/setup-database.sql` — tables: `users`, `sessions`, `albums`, `photos`, `album_permissions`, `rate_limits`, `audit_logs`
- Albums have `visibility` (public/private/unlisted) and per-album compression settings
- Photos store EXIF data as JSON, have sort ordering within albums

### Environment
- Server config via `.env` (see `server/.env.example`) — requires `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, `IMAGE_TOKEN_SECRET`
- The `.env` file lives in `server/`, loaded by `dotenv` at server startup

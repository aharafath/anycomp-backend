# Backend Setup

Steps to clone the repo and run the backend locally.

## Prerequisites
- Node.js 18+ and pnpm (repo uses pnpm 10.x)
- PostgreSQL instance (local or remote) you can connect to
- Git

## Clone and install
```bash
git clone <repo-url>
cd anycomp-2/backend
pnpm install
```

## Environment
Copy the example file and fill in your values:
```bash
cp .env.example .env
```

Key variables:
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME` for PostgreSQL connection (set `DB_SSL=true` if your provider requires it)
- `PORT` API port (default 5050)
- `FRONTEND_URL` origin allowed for CORS
- `ACCESS_TOKEN_SECRET`, `ACCESS_TOKEN_EXPIRE_IN` for auth tokens
- `DEFAULT_ADMIN_EMAIL`, `DEFAULT_ADMIN_PASSWORD`, `DEFAULT_ADMIN_NAME` for seeding an initial admin
- Set `SYNCHRONIZE=false` in production and rely on migrations

## Database setup
1) Ensure the PostgreSQL database defined in `DB_NAME` exists.
2) Run migrations to create tables:
```bash
pnpm migration:run
```
3) (Optional) Seed the default admin user after migrations:
```bash
pnpm seed:admin
```

## Run the server
- Development (watches TypeScript with nodemon):
```bash
pnpm dev
```
- Production build and start:
```bash
pnpm build
pnpm start
```

## Common scripts
- `pnpm migration:generate` to scaffold a new migration (after entity changes)
- `pnpm migration:run` to apply migrations
- `pnpm seed:admin` to insert the default admin user

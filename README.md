# do-nft

Monorepo for an AI-assisted NFT SaaS platform.

## Structure

- `backend`: Express + TypeScript + Prisma API
- `frontend`: React + TypeScript + Vite client
- `docker`: container assets
- `docker-compose.yml`: local development stack

## MVP scope implemented

- Authentication with JWT
- Encrypted user integration credentials
- Personal branding profile
- Collections CRUD
- NFT Studio draft flow with AI prompt/image abstractions
- Promotion draft generation
- Dashboard summaries

Third-party providers such as OpenAI, Gemini, OpenSea, IPFS, X, and Discord are prepared behind interfaces. The current implementation uses mock fallbacks when provider credentials are not configured.

## Docker development

1. Copy `.env.example` to `.env`.
2. Start the stack with `docker compose up --build`.

Container notes:

- The backend container runs from `/app/backend`, so do not append `--workspace backend` when using `docker compose exec backend ...`.
- The backend container now runs `prisma generate` and `prisma db push` on startup for local development.
- If you need to sync schema manually, use:
  `docker compose exec backend npm run prisma:push`
- `prisma migrate dev` is not the right first-run command in this Docker flow unless you are intentionally creating migration files.

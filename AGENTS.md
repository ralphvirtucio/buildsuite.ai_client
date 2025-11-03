# Repository Guidelines

## Project Structure & Module Organization
- `app/` — Next.js App Router source. Pages (`page.tsx`), layout (`layout.tsx`), global styles (`globals.css`), and API routes under `app/api` (e.g., `app/api/chat/route.ts`).
- `public/` — static assets served at the site root.
- Config — `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `.prettierrc`.
- Env — `.env.local` for secrets (not committed). Build output lives in `.next/`.
- Prefer colocating small components and utilities near their feature folder within `app/`.

## Build, Test, and Development Commands
- `pnpm install` — install dependencies (use pnpm; avoid mixing package managers).
- `pnpm dev` — start the dev server at `http://localhost:3000` with HMR.
- `pnpm build` — create a production build.
- `pnpm start` — run the production server (after `build`).
- `pnpm lint` — run ESLint using Next.js rules.

## Coding Style & Naming Conventions
- Language — TypeScript with `strict` mode.
- Formatting — Prettier (`.prettierrc`): 2‑space indent, semicolons, single quotes, trailing commas, width 100.
- Linting — ESLint (`eslint.config.mjs`) extending Next core‑web‑vitals + TypeScript.
- React — Components in PascalCase; hooks/functions in camelCase. Pages are `page.tsx`, API routes are `route.ts`. Prefer named exports; required Next.js files (`page.tsx`, `layout.tsx`) default‑export.
- Styles — Tailwind CSS via `@tailwindcss/postcss`; keep class lists readable and grouped by intent.

## Testing Guidelines
- No test runner is configured yet. If adding tests, use Vitest + React Testing Library.
- Name tests `*.test.ts`/`*.test.tsx`; colocate next to the file or under `__tests__/`.
- Add a `test` script in `package.json` when introducing tests; keep unit tests fast and deterministic.

## Commit & Pull Request Guidelines
- Commits — short, imperative subject (≤72 chars) with context in the body when needed. Conventional Commits (e.g., `feat:`, `fix:`, `chore:`) are welcome.
- Branches — `feat/<slug>`, `fix/<slug>`, `chore/<slug>`.
- PRs — clear description, linked issues, screenshots for UI changes, and manual test notes. Ensure `pnpm lint` passes.

## Security & Configuration Tips
- Put secrets in `.env.local` and never commit them. Example:

```bash
OPENAI_API_KEY=sk-...
```

- The chat route (`app/api/chat/route.ts`) relies on an AI provider; ensure the required API key is present. Avoid logging sensitive values.


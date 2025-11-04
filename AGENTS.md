# Repository Guidelines

## Project Structure & Module Organization
- Stack: Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui.
- Source: `app/` (routes, layouts, pages), feature code under `app/feature/*` (e.g., `app/feature/chat/index.tsx`).
- Reusable UI: `components/` (e.g., `components/ui/button.tsx`), shared helpers: `lib/` (e.g., `lib/utils.ts`).
- Assets: `public/` (SVGs, static files). Global styles: `app/globals.css`.
- Path aliases: `@/components`, `@/lib`, `@/components/ui`.

## Build, Test, and Development Commands
- `pnpm dev` — Run the local dev server.
- `pnpm build` — Production build (`.next/`).
- `pnpm start` — Start the built app.
- `pnpm lint` — Lint with Next/ESLint config.

## Coding Style & Naming Conventions
- Language: TypeScript. Components must be typed.
- Files: kebab-case (e.g., `theme-toggle.tsx`, `chat/index.tsx`).
- Exports: React components in PascalCase; helpers in camelCase.
- Formatting: Prettier enforced (2 spaces, semicolons, single quotes, trailing commas, width 100). Run via your editor; ensure diffs are formatted.
- Linting: ESLint with `eslint-config-next` (core web vitals + TS). Fix warnings before PR.

## Testing Guidelines
- No test runner configured yet. If adding tests, prefer Vitest + Testing Library.
- Place tests beside sources as `*.test.ts(x)` or under `__tests__/` mirroring folders.
- Cover new logic and critical paths; include minimal fixtures and clear assertions.

## Commit & Pull Request Guidelines
- Commit style: Prefer Conventional Commits (`feat:`, `fix:`, `chore:`). Keep messages imperative and scoped.
- PRs: Provide a clear description, linked issues, and UI screenshots/GIFs when applicable. Note any env/config changes.
- Keep PRs small and focused. Update docs and examples as needed.

## Security & Configuration
- Env: Use `.env.local` for secrets (ignored by git). Do not commit keys (e.g., AI provider tokens).
- Verify builds locally before PR. Avoid introducing server-only code in client components.

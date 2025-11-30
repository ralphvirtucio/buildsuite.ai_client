# Repository Guidelines

## Project Structure & Module Organization
- Next.js App Router lives in `app/` (`layout.tsx`, `providers/`, root `page.tsx`, `unauthenticated/` page). Middleware-style guard logic sits in `proxy.ts`.
- Domain logic is grouped in `features/` (`auth` hooks/types, `chat` UI, API helpers, and session modal/prompt components).
- Reusable primitives live in `components/ui/` (buttons, inputs, card, scroll area) with shared helpers in `components/` and `lib/` (`axios` client, `utils`).
- Styling uses Tailwind CSS v4 in `app/globals.css` with theme tokens and utility layers. Static assets are in `public/`.

## Build, Test, and Development Commands
- `pnpm dev` — start the local dev server at `http://localhost:3000`.
- `pnpm build` — create a production build; runs Next.js type and bundle checks.
- `pnpm start` — serve the production build locally (after `pnpm build`).
- `pnpm lint` — run ESLint with Next.js Core Web Vitals rules. Fix straightforward issues before sending a PR.

## Coding Style & Naming Conventions
- TypeScript is strict (`tsconfig.json`), JSX via `react-jsx`, and path alias `@/*` is preferred over long relative imports.
- Favor functional components and hooks; keep domain-specific hooks under `features/<domain>/`.
- Use Tailwind classes and existing design tokens; extend `app/globals.css` sparingly. Keep class names composable with `clsx`/`class-variance-authority`.
- Follow ESLint guidance; align with existing 2-space indentation and semi-colon-free style seen in the codebase.

## Testing Guidelines
- No automated tests exist yet. When adding, prefer React Testing Library + Vitest/Jest colocated under `features/<domain>/__tests__/` with filenames like `component.spec.tsx`.
- Aim to cover data flows (query/mutations in `features/chat/api.ts`) and auth state handling. Include accessibility assertions for UI components.
- Run the test suite locally before PR submission once introduced.

## Commit & Pull Request Guidelines
- Commit messages trend toward short prefixes (`feat:`, `hotfix:`) plus a concise summary (`feat: add session selector`). Keep the first line under ~72 characters.
- PRs should describe scope, include screenshots/GIFs for UI changes, list manual test steps (`pnpm lint`, `pnpm build`), and link issues/tickets.
- Keep changes focused; prefer small, reviewable PRs. Update or add tests when introducing new behavior once the suite exists.

## Security & Configuration Tips
- Keep secrets in `.env.local` (not committed). Mirror any needed variables in deployment configs (`vercel.json`) without leaking values.
- The request proxy redirects unauthenticated users in production; ensure session cookies are set where needed when modifying auth flows.

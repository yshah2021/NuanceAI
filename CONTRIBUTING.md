# Contributing to Nuance AI

Thanks for your interest in contributing. This is a frontend-only demo — the best contributions right now are the ones that help bridge it toward a real product.

## Getting Started

1. Fork the repo and clone your fork
2. Copy the environment file and add your API key:
   ```sh
   cp .env.example .env
   # then edit .env and add your GEMINI_API_KEY
   ```
3. Install dependencies and start the dev server:
   ```sh
   npm install
   npm run dev
   ```

## Before You Submit a PR

```sh
npm run lint    # must pass
npm test        # must pass
npx tsc --noEmit  # must pass
```

Open an issue first for any non-trivial change so we can align on approach before you invest time writing code.

## Where Help Is Most Needed

- **Backend & persistence** — replace mock data with real user accounts and session history (Supabase or Firebase are the natural fits)
- **Authentication** — swap the mock login for a real auth provider (Clerk or Auth0)
- **API proxy** — move Gemini calls server-side so contributors don't expose their key in the client bundle
- **Accessibility** — ARIA audit, keyboard navigation, screen reader support

## Code Style

- TypeScript strict mode is enabled — no `any` shortcuts
- Prefer editing existing files over creating new abstractions
- Keep components focused; if a file is growing past ~200 lines, it probably needs splitting
- No comments explaining *what* the code does — only *why* when the reason isn't obvious

## Commit Messages

Use the conventional commits format:
```
feat: add session history persistence
fix: correct score aggregation for empty sessions
docs: update setup instructions
```

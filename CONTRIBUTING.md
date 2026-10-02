# Contributing to quantum-dashboard

Thanks for your interest! This document covers how to get a development
environment running, the coding standards we enforce, and the pull-request
workflow. If you are an AI assistant working on the codebase, also read
[CLAUDE.md](CLAUDE.md) — it covers conventions that are not repeated here.

## Ways to contribute

- **New or improved resource views** — following the react-admin patterns
  already in `src/pages/`.
- **UX improvements** — navigation, forms, calendar, accessibility.
- **Core improvements** — data/auth provider hardening, shared hooks, docs.
- **Bug reports and usability feedback** — open an issue with clear
  reproduction steps.

## Development environment

Requirements:

- Node.js (current LTS)
- A running [quantum-api](README.md) backend and a Keycloak realm (or the
  `portable-deployment` stack, which provides both)

Install dependencies and configure:

```sh
npm install
cp .env.example .env      # point VITE_API_URL / VITE_KEYCLOAK_* at your backend
npm run dev               # Vite dev server with hot reload
```

## Coding rules

All of these are enforced by tooling — read `.eslintrc.cjs`,
`prettier.config.js`, and the `tsconfig*.json` files for the authoritative
source.

### Formatting and linting — ESLint + Prettier

```sh
npm run lint          # eslint --fix over ./src
npm run format        # prettier --write over ./src
```

Keep formatting to the project config rather than hand-tuning. If a rule
genuinely does not apply to a specific line, use a narrow
`// eslint-disable-next-line <rule>` with a comment explaining why, rather than
disabling the rule globally.

### Type checking — TypeScript

```sh
npm run type-check    # tsc --noEmit; must be clean
```

Add types to everything you touch; do not reach for `any` to silence the
compiler — fix the type.

### Build

```sh
npm run build         # vite build; must succeed
```

## react-admin conventions

- **One folder per resource** under `src/pages/`, registered in `App.tsx`.
  Follow the structure of an existing resource (e.g. `projects`,
  `reservations`) rather than inventing a new layout.
- **Data access goes through the data provider** (`dataProvider.ts`,
  `ra-data-simple-rest`). Don't scatter ad-hoc `fetch` calls through
  components; the API is react-admin compatible (`Content-Range`).
- **Auth goes through the auth provider** (`authProvider.ts`, `ra-keycloak`).
  Don't re-implement token handling in components.
- **Reuse shared hooks/services** in `src/hooks/` and `src/services/` instead
  of duplicating logic across pages.

## Pull request workflow

1. **Branch** with a descriptive name (`feat/...`, `fix/...`).
2. **Keep the change focused.** One logical change per PR. Separate refactors
   from behaviour changes.
3. **Make the commit message explain the `why`.**
4. **Run the checks locally:**
   ```sh
   npm run lint
   npm run type-check
   npm run build
   ```
5. **Update documentation** in the same PR:
   - New env vars → update `.env.example` and the config table in
     [README.md](README.md).
   - User-visible changes → update [README.md](README.md).
6. **Open the PR against `main`** with a description that covers what changed
   and why, any new configuration, and how you tested it.

## Security

Please **do not** open public issues for security reports. Email the
maintainers privately (see repository metadata) with a description and
reproduction. We'll acknowledge within a reasonable window and coordinate a
fix and disclosure.

## License

By contributing, you agree that your contributions will be licensed under the
[European Union Public Licence v. 1.2 (EUPL-1.2)](LICENSE) that covers the
project. See the Licensing section of [README.md](README.md) for what this
means in practice.

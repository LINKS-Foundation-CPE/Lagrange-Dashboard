# CLAUDE.md

Orientation for AI assistants (and new human contributors) working on
**quantum-dashboard**. Read this before making changes.

## What this project is

The web UI of the **Lagrange** quantum-computing management stack — a
[react-admin](https://marmelab.com/react-admin/) single-page application on top
of the [quantum-api](README.md) REST backend. It is the operator- and
user-facing front end for organizations, projects, budgets, reservations,
users, and job monitoring. Authentication is delegated to Keycloak.

This is a **thin presentation layer**. Business rules, budgets, and
authorization live in quantum-api; if you find yourself encoding policy in the
dashboard, it probably belongs in the backend.

- User-facing overview: [README.md](README.md).
- Development workflow: [CONTRIBUTING.md](CONTRIBUTING.md).

## Stack

React + TypeScript, built with Vite. react-admin 5 on MUI 6,
`ra-data-simple-rest` data provider, `ra-keycloak` auth provider,
`@tanstack/react-query`, `react-big-calendar`, `luxon`. ESLint + Prettier for
style.

## Architectural rules (non-negotiable)

1. **Data access goes through the data provider.** `dataProvider.ts`
   (`ra-data-simple-rest`) is the single path to the API. Don't scatter ad-hoc
   `fetch`/axios calls through components. The API is react-admin compatible
   (list endpoints emit `Content-Range`).

2. **Auth goes through the auth provider.** `authProvider.ts` (`ra-keycloak`)
   and `fetchBackendTokenOnce.ts` own login and token handling. Don't
   re-implement token logic in components.

3. **One folder per resource.** Each react-admin resource lives in its own
   `src/pages/<resource>/` folder and is registered in `App.tsx`. New resources
   follow the structure of an existing one; don't invent a parallel layout.

4. **Keep policy in the backend.** The dashboard renders and submits; it does
   not decide budgets, authorization, or billing. Mirror backend rules for UX,
   but the backend is authoritative.

5. **Reuse shared hooks/services.** Cross-cutting logic lives in `src/hooks/`
   and `src/services/`. Extend those rather than duplicating logic per page.

## Where things live

```
src/
├── App.tsx              # react-admin <Admin> + resource registration
├── Layout.tsx           # app shell
├── CustomAppBar.tsx     # top bar
├── CustomMenu.tsx       # navigation menu
├── authProvider.ts      # Keycloak (ra-keycloak) auth provider
├── dataProvider.ts      # ra-data-simple-rest data provider
├── fetchBackendTokenOnce.ts  # one-shot backend token fetch
├── pages/               # one folder per resource (list/edit/create views)
├── hooks/               # shared React hooks
└── services/            # API/helper services
```

## Development workflow

See [CONTRIBUTING.md](CONTRIBUTING.md). In short:

```sh
npm install
cp .env.example .env      # point VITE_* at your backend
npm run lint && npm run type-check && npm run build
```

All three must pass before opening a PR. `npm run dev` starts the Vite dev
server with hot reload.

## Code style

- **ESLint + Prettier** — don't fight the config; narrow
  `// eslint-disable-next-line <rule>` with a reason if a rule is genuinely
  wrong for a line.
- **Types everywhere** — no `any` to silence the compiler; fix the type.
- **Comments explain `why`, not `what`.**

## What NOT to do

- Don't bypass the data/auth providers with ad-hoc calls.
- Don't encode backend policy (budgets, authorization) in the UI as the source
  of truth.
- Don't add dependencies casually — justify each addition in the PR.
- Don't commit `.env` or credentials. They're gitignored; keep it that way.

## Cutting a release

The project uses **CalVer** `YYYY.MM.PATCH`; rules are at the top of
[CHANGELOG.md](CHANGELOG.md). To cut one: move `## [Unreleased]` entries into a
new dated section, flag action-on-upgrade items with **Breaking:**, add the
link reference at the bottom, bump the version in `package.json`, commit
(`chore: release <version>`), then tag (`git tag -a <version>`) and push the
tag. Tags are bare (no `v` prefix).

## Repository layout — private + public

Development happens on a **private GitLab repo**; a public open-source mirror
on **GitHub**, `Lagrange-Dashboard`, is planned (repository not yet created):

| Remote | URL | Purpose |
|--------|-----|---------|
| `origin` | `gitlab.linksfoundation.com:links-iqm-spark/machine-management/quantum-dashboard.git` | Private development (default push target) |
| `github` | `github.com:LINKS-Foundation-CPE/Lagrange-Dashboard.git` (to be created) | Public open-source mirror |

### Branch mapping

| Branch | Lives on | Pushed to |
|--------|----------|-----------|
| `main` | GitLab `origin` | `origin main` only |
| `public` | Both remotes | `origin public` + `github main` (once created) |

`public` is an **orphan branch** — its history starts from a clean "Initial
public release" squash commit and never includes the pre-release private
history. It is fast-forwarded from `main` one commit at a time via
`git cherry-pick`.

### What never goes on `public`

This path is deployment machinery for *our* installation. It belongs on `main`
and must never be cherry-picked to `public`:

| Path | Why |
|------|-----|
| `.gitlab-ci.yml` | The deploy pipeline: our SSH target, deploy directory and `DEV_*`/`PROD_*` CI variable names. Useless publicly and a description of our infrastructure. |

Everything else is published, and is written to be deployment-neutral: no
committed host names or credentials, and every deployment difference is a
`VITE_*` variable documented in `.env.example`. Keep it that way.

If a commit touches both publishable code and an excluded path, cherry-pick it
with `-n`, drop the excluded path, and commit on `public` with the same message.

### Publishing a commit to GitHub

After merging or committing to `main` on GitLab:

```bash
git checkout public
git cherry-pick <commit-sha>          # repeat for each commit to publish
git push origin public                # update GitLab mirror of public
git push github public:main           # update GitHub main (once the repo exists)
git checkout main
```

Review each cherry-pick before pushing — the `public` branch is the gate that
prevents internal details from leaking to GitHub. Never push `main` directly to
GitHub or rebase `public` onto `main` (that would carry the full private
history).

## Working on this repository on its own

Clone it anywhere and it is workable: everything needed to build, test and change
it is in here. Nothing in this file depends on another repository being at hand,
or on any private document.

What it talks to, and where each contract is written down:

| Counterpart | Interface | Where the contract is |
|---|---|---|
| Portal backend (`quantum-api`) | `/api/*` through a react-admin data provider; `GET /config` announces which features the deployment enables | that repository's `api.yml` (OpenAPI) |
| Identity provider (Keycloak) | OIDC public client, authorization-code flow; the session token is also what the Profile page hands to the vendor SDK | `src/authProvider.ts`, `src/services/iqmKeycloak.ts` |

Every `VITE_*` value is baked in **at build time**, so a configuration change is a
rebuild, not a restart. A Keycloak client's web origin must be bare
(`https://host`, not `https://host/` or `/*`) or preflight fails silently.

Every repository in the stack carries a `CLAUDE.md` in this same shape, so the
same is true read from the other side. If you find yourself needing a fact that
is not in one of them, that is a gap worth fixing in the repository that owns the
fact — not a reason to go looking for a central document.

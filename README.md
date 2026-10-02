# quantum-dashboard

The web UI of **Lagrange** — the management stack operating Italy's first
publicly-accessible quantum computer. quantum-dashboard is the operator- and
user-facing front end for the platform: organizations, projects, budgets,
reservations, users, and job monitoring. Developed in the context of the
**QTech Piemonte** strategic initiative.

<a href="https://linksfoundation.com"><img src="docs/assets/logo-links.png" alt="LINKS Foundation" height="60"></a>&nbsp;&nbsp;&nbsp;<a href="https://www.polito.it"><img src="docs/assets/logo-polito.png" alt="Politecnico di Torino" height="60"></a>&nbsp;&nbsp;&nbsp;<a href="https://www.inrim.it"><img src="docs/assets/logo-inrim.jpg" alt="INRIM" height="60"></a>

---

quantum-dashboard is a [react-admin](https://marmelab.com/react-admin/)
single-page application on top of the [quantum-api](#related-projects) REST
backend. Administrators use it to manage organizations, projects, budgets,
reservations, and users; end users use it to see their projects, budgets,
reservation calendar, and job history. Authentication is delegated to Keycloak.

> Status: Developed by LINKS Foundation Advanced Computing, Photonics and
> Electromagnetics research domain and used in production on IQM-based quantum
> hardware. Open-sourced so other projects can reuse and adapt the management
> front end for their own quantum-computing services.

## Features

- **react-admin resources** — organizations, projects, users, project
  membership, reservations, time slots, jobs, announcements, notifications,
  and roles, each with list/edit/create views.
- **Keycloak authentication** — OIDC login via `ra-keycloak`; a backend token
  is fetched once and attached to API calls.
- **Reservation calendar** — a calendar view (`react-big-calendar`) for booking
  and reviewing machine time, with a *jump to date* field for the weeks that are
  months away.
- **Budget & job visibility** — per-project budgets in QPU-time and job history
  surfaced to users and operators, with the submitted circuit and the results of
  each job one button away.
- **Billing reports** — the per-period aggregates a *consuntivo* is built from,
  exportable as CSV per table or as one HTML report, for platform admins and for
  organization managers and auditors scoped to their own organization.
- **Project tags** — an admin-maintained controlled vocabulary, assignable by a
  project's own administrators.
- **Embedded monitoring** — optional *Machine Status* and *Machine Metrics*
  panels over the deployment's own status and monitoring pages, plus a link to
  its user documentation. Each appears only where its URL is configured.
- **Themed** — the Lagrange palette applied through MUI `ThemeOptions` merged
  onto react-admin's default theme, so a user meets one brand before and after
  signing in.

## Tech stack

React + TypeScript, built with Vite. react-admin 5 on MUI, `ra-data-simple-rest`
data provider (the API emits `Content-Range`), `ra-keycloak` auth provider,
`@tanstack/react-query`, `react-big-calendar`, and `luxon`.

## Quick start

Requirements: Node.js (LTS), a running [quantum-api](#related-projects), and a
Keycloak realm.

```sh
npm install
cp .env.example .env      # point VITE_API_URL / VITE_KEYCLOAK_* at your backend
npm run dev               # Vite dev server with hot reload
```

Production build:

```sh
npm run build             # outputs static assets to dist/
npm run serve             # preview the production build locally
```

For a full, one-command local stack (this dashboard together with quantum-api,
the QC Gateway, Keycloak, Postgres, Redis and MinIO on a bare IP with
self-signed TLS), see the **portable-deployment** project — it runs this
dashboard as a Vite dev server against the rest of the stack.

## Configuration

All configuration is via `VITE_*` environment variables; copy `.env.example`
to `.env` and point it at your backend:

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | quantum-api REST base URL |
| `VITE_TOKEN_URL` | backend token endpoint |
| `VITE_KEYCLOAK_URL` | Keycloak base URL |
| `VITE_KEYCLOAK_REALM` | Keycloak realm |
| `VITE_KEYCLOAK_CLIENTID` | Keycloak client ID |

Optional — each feature is simply absent when its variable is unset:

| Variable | Purpose |
|---|---|
| `VITE_MACHINE_STATUS_URL` | Status page (Kener). Drives the **Machine Status** panel. |
| `VITE_MACHINE_METRICS_URL` | Monitoring overview page, embedded as **Machine Metrics**. |
| `VITE_MACHINE_STATUS_MONITORS` | Which monitors the status panel shows, `tag` or `tag:Label`, comma separated. **Do not quote it**; unset falls back to the status site's aggregate monitor. |
| `VITE_DOCS_URL` | Documentation site. A sidebar link opening in a new tab, not a panel. |

Both panels are cross-origin frames, so whatever serves those pages must not
send `X-Frame-Options`, and any `Content-Security-Policy: frame-ancestors` it
does send must name this dashboard's origin. `.env.example` carries the full
notes.

Because every `VITE_*` value is baked in at build time, a deployment that omits
one of these gets a build without that feature and no error anywhere — worth a
check after a first deploy.

## Project layout

```
src/
├── App.tsx              # react-admin <Admin> + resource registration
├── Layout.tsx           # app shell
├── CustomAppBar.tsx     # top bar
├── CustomMenu.tsx       # navigation menu
├── authProvider.ts      # Keycloak (ra-keycloak) auth provider
├── dataProvider.ts      # ra-data-simple-rest data provider
├── fetchBackendTokenOnce.ts  # one-shot backend token fetch
├── pages/               # one folder per react-admin resource (list/edit/create)
├── hooks/               # shared React hooks
└── services/            # API/helper services
```

## Documentation

- [CONTRIBUTING.md](CONTRIBUTING.md) — development setup, coding style,
  linting/formatting, and the contribution workflow.
- [CLAUDE.md](CLAUDE.md) — orientation for AI assistants working on this
  codebase (also a useful cheat sheet for new human contributors).

## Related projects

- **quantum-api** — the REST backend this dashboard talks to.
- **[QC Gateway](https://github.com/LINKS-Foundation-CPE/QC-Gateway)** — the
  authenticating reverse proxy in front of the quantum machine.
- **portable-deployment** — one-command deployment of the whole stack for
  development and integration experiments.

## Citation

If you use Lagrange in your research, please cite:

```bibtex
@misc{viviani2026lagrangeoperatingitalyspubliclyaccessible,
      title={Lagrange: Operating Italy's First Publicly-Accessible Quantum Computer for Research and Education}, 
      author={Paolo Viviani and Fabrizio Bertone and Giacomo Vitali and Emanuele Dri and Federico Stirano and Giuseppe Caragnano and Francesco Lubrano and Antonino Nespola and Olivier Terzo and Matteo Cocuzza and Bartolomeo Montrucchio and Giovanna Turvani and Gianluca Bertaina and Marco Coisson and Davide Calonico and Fabrizio Pirri and Pietro Asinari},
      year={2026},
      eprint={2604.21695},
      archivePrefix={arXiv},
      primaryClass={quant-ph},
      url={https://arxiv.org/abs/2604.21695}, 
}
```

## Licensing

quantum-dashboard is licensed under the **European Union Public Licence v. 1.2
(EUPL-1.2)** — see [LICENSE](LICENSE).

EUPL-1.2 is an OSI- and FSF-approved copyleft licence maintained by the
European Commission. It is compatible with GPL (v2 and v3), LGPL, AGPL, MPL,
CeCILL, and several other major licences through the EUPL compatibility list,
so code from those licences can be combined with quantum-dashboard without
licence conflicts.

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project uses **CalVer** in the form `YYYY.MM.PATCH`:

- `YYYY.MM` is bumped when a release is cut in that year and month. There is
  no obligation to release every month; the date simply records when the
  release happened.
- `.PATCH` is bumped for fix-only follow-up releases within the same month,
  starting at `.0`.
- Pre-release labels (e.g. `-rc1`, `-pre-<name>`) may be appended when
  appropriate.

Entries marked **Breaking:** require action on upgrade — typically a change to
`.env` (`VITE_*` variables) or a new backend requirement.

## [Unreleased]

## [2026.10.0] — 2026-10-02

### Fixed
- **The job CSV export no longer stops at 1000 rows.** Both job lists used
  react-admin's `<ExportButton>`, which fetches a single page of `maxResults`
  rows and defaults that to 1000 — so every export quietly ended after a
  thousand jobs, giving a 1001-line file (the header plus a thousand rows) with
  nothing to say the rest had been left behind. A truncated export that looks
  complete is worse than one that fails.

  The button now pages through the result set, 20,000 rows per request,
  stopping when a short page says the data has run out. The backend never had a
  ceiling of its own — `utils/query.ts` turns the requested range straight into
  `limit`/`offset` — so nothing was needed on that side.

  The permanent list filter is merged over the user's filter values, the same
  way react-admin's own exporter does it: "My Jobs" scopes with
  `filter={{ user_id }}`, and a filter value must not be able to widen an
  export to everybody's jobs.

- **The job export no longer writes the two artifact URLs, and refuses an
  export too large for the browser.** The `jobs` table has grown to roughly
  800,000 rows, which changes what an export costs. `submitted_circuit` and
  `results` are full URLs of about 127 characters each, and measured across the
  whole table they were **63% of the file** — 311 MB with them, 116 MB without.
  They are reconstructible from the job id and the owner, so the export writes
  an explicit column list that leaves them out; that also keeps the column
  order predictable as the API grows.

  Even so, a browser cannot build an arbitrarily large CSV: it holds the row
  objects, the assembled text and the download's copy of it at once. Measured,
  200,000 rows is a 29 MB file and about 230 MB of peak heap, which is
  comfortable; the whole table is over 500 MB before the download copy. The
  button therefore checks the row count the list already knows **before it
  starts** and asks for narrower filters, rather than being discovered half a
  gigabyte in. Exporting everything wants the server to stream it, which is a
  separate piece of work.
- **"Mark all as read" in the bell dropdown no longer throws.** The handler
  called `notify(...)` to report what had been marked, but nothing bound
  `notify` — `useNotify` was imported and never called — so clicking the item
  raised `ReferenceError: notify is not defined` and the notifications stayed
  unread. Introduced with the action itself, in the same unreleased cycle.

  It reached `staging` because `tsc --noEmit` is a no-op in this repository:
  the root `tsconfig.json` is `"files": []` plus project *references*, and
  plain `tsc` does not build referenced projects. `tsc -b` does, and reports it
  as `TS2304: Cannot find name 'notify'`. Vite's build never had a chance —
  esbuild strips types without checking them, so the identifier survived to
  runtime. Use `npx tsc -b` when checking this repository.

- **The default-project picker searches.** Typing in it did nothing: the list
  stayed at whatever page of projects had been loaded — the first 25 by id — so
  on a deployment with more projects than that, most could not be chosen.

  The cause was entirely on the backend. `<ReferenceInput>` already renders an
  `<AutocompleteInput>` and that already sends the typed text as `q`; both are
  react-admin defaults. The filter was simply not honoured by
  `GET /api/projects`, and the matching quantum-api change is what fixes it, as a
  case-insensitive **substring** match on the project name. Substring rather than
  prefix matters: project names follow a convention where the distinguishing part
  is rarely at the front.

  What changed on this side is small and cosmetic: the two places that pick a
  default project — the user form and the bulk create form — share one input
  rather than repeating the line, with a clearer label and empty-state text. The
  search behaviour itself is react-admin's own.

### Fixed
- **The date picker's month arrows animated and then landed on the same month.**
  `DateCalendar` re-syncs the visible month whenever its `value` prop changes
  *by reference*, and the toolbar built that value inline — a new object every
  render. Clicking an arrow fires `onMonthChange`, which updates the month whose
  markers are loaded, which re-renders the toolbar, which recreated the value and
  snapped the calendar back. The value is memoised on the timestamp now.

  The dots introduced this: before them nothing re-rendered the toolbar while the
  popper was open, so the effect never refired.

### Fixed
- **"My Jobs" printed its name twice in the app bar** — `My JobsMy Jobs`. The
  page rendered a `<Title>` next to a `<List title>`, and both push into the same
  title portal. The `<List>` one is kept, since it also sets the document title.
  It was the only page doing both.

### Changed
- **The partner logos moved from the foot of the sidebar to the centre of the app
  bar**, in their white-on-transparent form — the same files the monitoring
  overview uses, which are made for a navy bar. They sit between the page title
  and the account controls, with a spacer either side so neither pushes them off
  centre, and are hidden below the `md` breakpoint where the bar has room for the
  title and the controls and nothing else.

  This also settles what the sidebar footer had become: it was cut off on a short
  screen, then scrolled away once the menu scrolled, then needed pinning. There
  is no footer to pin now. The menu keeps its scrolling, which was worth having
  on its own — a long admin section overflowed a short viewport with no way to
  reach the end.

### Changed
- **The sidebar's logo footer stays pinned** instead of scrolling away with the
  menu items. Making the menu scrollable fixed the logos being cut off, but it
  also meant they left the screen as soon as the list was long enough to scroll —
  which is the case the change existed for. `position: sticky` with its own
  background keeps them at the bottom while the items scroll underneath.

### Changed
- **The partner logos at the foot of the sidebar fit on one line.** They were a
  wrapping flex row at 26px, and three logos at their natural width do not fit a
  240px sidebar — so they wrapped onto two or three lines and ate the bottom of
  the menu. Now three equal columns, each logo scaled to its third and 18px tall,
  which holds at any sidebar width; a collapsed sidebar clips them rather than
  being forced open by them.
- **The sidebar scrolls when it does not fit the screen.** It was `height: 100%`
  with no overflow handling, so on a short viewport everything past the fold was
  cut — the last admin items and the logos beneath them unreachable, with no
  scrollbar to say so. The menu now scrolls, and the logo block is never squeezed
  to make room for the list above it.

### Changed
- **The QPU time column reports seconds with three decimals** — `1.018s`, not
  `1s 18ms`. The existing duration formatter switches unit with magnitude, which
  is exactly what a column of execution times must not do: two rows an order of
  magnitude apart render in different units and stop being comparable at a
  glance. Three decimals is the granularity billing runs at, and the unit the
  billing reports already use.

  `formatSeconds` sits beside `formatDuration` rather than replacing it. Budget
  *balances* are a different quantity — five hours reads better as `5h` than as
  `18000.000s` — so those keep the adaptive formatter.

### Added
- **Recurring slots and reservations.** The slot and reservation create forms
  gain **Repeat weekly**: pick the weekdays and an end date, and the form
  creates a whole series through the API's new series endpoints. The first
  day's weekday is preselected, which is what "repeat this" most often means.

  Nothing is created straight away. **Save** opens a preview listing every
  occurrence with its date, time and whether it can be created — and why not
  when it cannot: an overlapping slot or booking, no slot of the project's
  organization to put a reservation in, a date outside the project. For
  reservations it also shows the cost against the project's remaining budget.
  From there: **Create N**, **Create N, skip M** to leave out the conflicting
  ones, or **Back** to change the series. The series is created all at once or
  not at all.

  A reservation series needs no slot picker: the slot picker disappears in
  repeat mode, because the server places each occurrence in the slot that
  covers it. Times are wall-clock times in the browser's zone, so a 09:00
  series stays 09:00 across the clock changes.

  A slot or reservation created as part of a series shows **Delete series** on
  its page: every future occurrence goes — refunded, for reservations, by the
  same rule a single delete uses — and past ones stay as history.

- **A "User" column on the Budget Transactions tab** — the submitter for a job
  charge, the acting user for a reservation charge or refund. "Which job cost
  this" was already answerable from the description; "who ran it" was not.

  Read straight off the row: `GET /api/projects/{id}/transactions` embeds the
  user, so there is nothing to fetch and no per-row lookup. Blank rather than a
  dash where a transaction has no user behind it — a vault being funded, a
  project created with a budget — since those are not missing data, they have no
  answer. Needs the matching quantum-api change; against an older backend the
  column is simply empty.

### Added
- **Dots on the calendars' date picker**, on every day that already carries a
  slot or a reservation — so a month can be read for availability before jumping
  into it, rather than jumping in to find out. Scoped the way the grid is:
  reservations count only where the calendar shows them, so the dashboard's
  read-only calendar marks slots alone.

  The dots come from their own query, not from what the grid holds. The calendar
  loads a week; the picker shows a month, usually one the calendar has never
  visited, so filtering the loaded events would have put dots only on the week
  you are already looking at. It is keyed by month and cached, so paging back and
  forth is free after the first visit, and an entry spanning several days marks
  each of them — clamped to the displayed month, since walking a year-long slot
  day by day to reach the month on screen is hundreds of wasted iterations.

  The markers reach the toolbar through **context** rather than props, which is
  forced by react-big-calendar: it takes the toolbar as a component *type*, so
  passing data down would mean constructing that component during the calendar's
  render — a new type on every change, which React unmounts and remounts. Since
  the picker lives inside the toolbar, its popper would close exactly when the
  month's data arrived. A stable component reading a changing context keeps it
  open.
- **A "QPU time" column on every job table**, immediately before the two
  execution timestamps: how much the job actually used, which is what the row is
  usually being read for. Derived from `execution_end − execution_start` rather
  than stored, because that is how the backend derives what it bills — a stored
  copy would be a second source of truth for one number. Formatted with the same
  formatter the budgets use, so a job's consumption reads in the units of the
  budget it draws from.

  A job that never ran, and one whose window ends before it starts, both show a
  muted dash: that is what the platform counts for them, and it matches the
  "discard, do not subtract" rule the billing reports already follow. Not
  sortable, since there is no backend column to sort on.

### Changed
- **"My Jobs" no longer shows the user column.** Every row there is the caller's
  own, so it cost width and told nobody anything. The admin "All Jobs" list keeps
  it, and both still come from the same shared table — the column is a `showUser`
  prop rather than a forked copy.

### Fixed
- **Machine Metrics was compressed on a short window.** The embedded page lays
  itself out against `100vh` with `overflow: hidden` — it is built as a wall
  display: one screen, no scrolling — and inside a frame `100vh` is the frame's
  height. So a window shorter than the page needs did not make the embedded page
  scroll, it made every row of it compress until the readings were unreadable.
  The frame now stops shrinking at 800px and the portal page scrolls instead of
  the embedded page squeezing. The previous floor was 480px, which is well below
  the height that page needs.

### Fixed
- **"Get IQM token" on the profile page failed with `Failed to get IQM token:
  undefined`.** It ran a second keycloak-js instance against a separate
  `iqm_client` Keycloak client and minted a token through a silent check-sso.
  That client is not configured for browser use at the dashboard origin in any
  deployment — in production its session-status iframe answers 403 for that
  origin and it rejects `<origin>/silent-check-sso.html` as a redirect URI — and
  keycloak-js reports both of those as a bare `undefined`, which is the whole of
  what reached the user.

  The second client is now gone rather than configured, because it was never
  buying anything: the gateway validates the realm signature, the issuer, and
  `aud` against its `AUDIENCE`, which is `account`, and every client's access
  token in the realm carries that audience. A token issued for the client the
  dashboard already signs in with is accepted by the gateway exactly like one
  issued for a machine-specific client. So the page now hands out the access
  token of the current session, which needs no Keycloak configuration beyond
  what signing in already requires, no second SSO round trip, and no iframe.
  `VITE_IQM_KEYCLOAK_CLIENTID` is no longer read; it was never documented in
  `.env.example`. The card names the client the token came from, and says the
  token expires with the session.

  What remains of the failure path is one case — the refresh rejecting — and it
  is no longer fatal unless the token in hand has actually expired, in which
  case it says the session expired instead of `undefined`.

### Changed
- **Lists show 25 rows per page** instead of react-admin's default 10. Set once
  in the theme as a `RaList` default prop rather than on each list: `<List>`
  reads its props through MUI's `useThemeProps`, so a theme default reaches
  every list in the app, including ones added later that a per-list prop would
  miss. The tables on the Show pages never had the problem — they are
  `<ReferenceManyField>`, and ra-core's `usePaginationState` already defaulted
  to 25, which is why those looked inconsistent with the main lists. The one
  place that had pinned a Show table to 10 explicitly now inherits 25 too.
  Deliberate large page sizes stay as they are: the tag picker, the budget
  transfer tab, the reports queries and the calendar all fetch a whole working
  set on purpose, not a page.

### Changed
- **Reservations and Reservations Calendar moved into the Admin section** of the
  sidebar. They are administrative views of everything the caller may reach —
  scoped by the backend to a PI's administered projects, an organization
  manager's organization, or everything for an admin — not personal views like
  My Projects and My Jobs, which is what the section above the Admin header is
  for. The role gate is unchanged: project admins and above.

### Fixed
- **The reservations list was unreachable.** `ReservationList` was registered on
  the `reservations` resource and routed at `/reservations`, but nothing linked
  to it: the sidebar offered only the calendar, while slots have had both a list
  and a calendar entry all along. Added a **Reservations** item next to
  Reservations Calendar, on the same gate the calendar already used — project
  admins and above (platform admin, organization manager, project admin), with
  the backend scoping the rows. No new page and no new endpoint; the page was
  already there.

### Changed
- **The portal has a theme.** It ran on stock react-admin; it now carries the
  Lagrange palette already in production on the Keycloak login screen — navy
  app bar, white sidebar, accent-blue actions, bordered cards on a light
  canvas — so a user meets the same brand before and after signing in. Also a
  type scale and sentence-case buttons and menu items in place of the default
  uppercase. Written as MUI `ThemeOptions` merged onto react-admin's
  `defaultTheme`, so nothing the framework relies on is replaced, and no new
  dependency: react-admin renders MUI, and a Bootstrap-based admin template
  could not have been applied without abandoning its rendering entirely.
- **The submitted circuit and results are buttons**, not bare URLs, in every
  job table — "All Jobs", "My Jobs", and the job tables on the organization,
  project and user pages. A long URL in a dense table is a hard target and
  wraps; a button is one shape per row. A job that has not produced the
  artifact shows a muted dash, so "nothing yet" reads differently from a broken
  column.
- **Machine Status shows cards instead of a framed status page.** Framing the
  whole Kener site brought its navigation with it, and its links had nowhere to
  go inside a panel. The state now comes from Kener's `/badge/<tag>/{status,uptime}`
  endpoints, which are SVG images and therefore not subject to CORS — the
  status host opens its JSON API to no other origin, so this needs no proxy and
  no gateway change. Kener renders the badges, so the panel cannot drift from
  the status page. Refreshed on a timer, since those endpoints send no cache
  headers. Monitors are listed in `VITE_MACHINE_STATUS_MONITORS`; unset falls
  back to Kener's `_` aggregate, so the panel works unconfigured.

### Added
- **A date picker on the calendars.** Both the reservations and the slots
  calendar navigated with react-big-calendar's stock Back / Today / Next only,
  which is one week per click — allocated slots are planned months ahead, so
  reaching the week you actually wanted cost a dozen clicks and told you
  nothing about where you were going. The calendars now carry their own toolbar
  with a **Jump to date** field: pick or type a date and the view moves to the
  week containing it. The jump is expressed as react-big-calendar's own `DATE`
  navigation action, so the calendar recomputes its visible range and refetches
  through the data provider exactly as Back and Next already did — no second
  path to the API, and Today, Back and Next keep working unchanged. Both
  calendars are the same component, so this lands once and covers the dashboard
  calendar too. Built from MUI and the `@mui/x-date-pickers` Luxon picker
  already used by the reservation and slot forms, which also puts the toolbar on
  the Lagrange theme instead of react-big-calendar's unstyled buttons; no new
  dependency.
- **Project tags.** Projects can carry labels from a vocabulary the platform
  admins maintain — a **Tags** screen with the usual list/create/rename/delete,
  restricted to platform admins, since the point of a controlled vocabulary is
  that a project admin picks from it rather than inventing terms by typo. The
  vocabulary's two refusals are 409s that carry information available nowhere
  else in the UI — the name that is already taken, and how many projects still
  carry a tag you tried to delete — so those messages are shown verbatim
  instead of react-admin's generic "An error occurred", and the delete and
  rename run in pessimistic mode so the refusal arrives before the row appears
  to have changed rather than after.

  Assignment is a control of its own on the project's **Tags** tab, not a field
  on the project form, and that is forced by the backend rather than a
  preference: `PUT /api/projects/:id` is admin and organization-manager only,
  while `PUT /api/projects/:id/tags` is also open to the project's own admins.
  A PI has to be able to tag a project whose other fields they cannot submit at
  all, so the two cannot share a save — and keeping the selection out of any
  form bound to the `projects` resource is what makes it impossible for `tags`
  to end up in the project update body by accident: there is no form field for
  it to be registered on. The call goes through a `setProjectTags` method on
  the data provider, alongside the other project sub-resource calls, and sends
  ids rather than names for the same reason the vocabulary is admin-defined.
  Saving replaces the whole set, so clearing the selection clears the tags.

  Tags also show as chips in the projects list and on the project show page.
  Those cost nothing: projects already come back from the API with their tags
  attached, so this is a field over data in hand and not a reference field that
  would fetch per row.
- **Documentation** link in the sidebar (`VITE_DOCS_URL`), opening in a new tab
  rather than a panel — it is a separate site with its own navigation, which is
  what made framing the status page a poor fit. Hidden when unset.
- `src/preview/` and `preview.html`: a theme preview harness. Runs the real
  `Layout`, `CustomAppBar` and `CustomMenu` over an in-memory data provider, so
  the chrome can be judged without a backend, a session or a deployment
  (`npx vite`, then `/preview.html`). Not an entry point of the production
  build — `vite build` emits `index.html` only.

### Added
- **Machine Status** and **Machine Metrics** panels in the sidebar, visible to
  every signed-in user. They embed the deployment's own monitoring pages — the
  Kener status page and the Perses-backed overview page — rather than
  reimplementing them, so each stays owned by the stack that produces it. Both
  are configured by URL (`VITE_MACHINE_STATUS_URL`, `VITE_MACHINE_METRICS_URL`)
  and each item appears only where its URL is set, so a deployment without a
  monitoring stack simply does not have the panel; the route stays registered
  and reports itself unconfigured, so a stale bookmark says so instead of
  dead-ending. Each panel carries an "Open in new tab" link, because an
  embedded page that misbehaves in a frame should still be one click from
  useful. The frames are cross-origin, so neither page can read the portal or
  be read by it — whatever serves them must not send `X-Frame-Options`, and any
  `frame-ancestors` policy it does send must name the dashboard's origin.

### Fixed
- "Mark all as read" on the notifications page reports what actually happened.
  It used `Promise.all`, so one rejected request discarded the outcome of every
  other one and the list was never refreshed, and its `catch` block swallowed
  the error — which is why the failure could not be diagnosed from the browser
  either. It now settles every request, refreshes regardless, says how many of
  how many succeeded, and logs the reason. The failure this surfaced is fixed
  in quantum-api: an admin's list contained other users' notifications, which
  the API rightly refused to mark.

### Added
- Billing reports show durations to **three decimals** — a thousandth of a
  second, which is the granularity billing actually runs at — instead of four,
  and a **"Round durations to the second"** checkbox rounds them for a report
  meant to be read rather than reconciled against the ledger. Hours are then
  derived from the rounded seconds, so the two columns of a row cannot
  disagree. The tables, the CSVs and the HTML report share one formatter, so
  what is exported is what was on screen.
- **Billing reports page** (`/reports`), for platform admins and for
  organization managers and auditors, who see their own organization. The
  figures a consuntivo is built from, computed by the backend
  (`GET /api/reports/*`) rather than by exporting the database and
  aggregating it elsewhere. The controls are those of the standalone billing
  app it replaces — start and end date, per-project and per-organization
  checkboxes with select-all/clear, "enable organization reports", "hide
  technical columns" — as are the CSV filenames and the layout of the combined
  HTML report, so a report produced here reads like the ones before it. Two
  differences: there is no "download tables from DB" step, because nothing is
  dumped; and a reservation-usage table is included, which the old app
  described but never implemented.
- `LICENSE` file: the project is now distributed under the European Union
  Public Licence v. 1.2 (EUPL-1.2). See the Licensing section of `README.md`
  for the rationale behind the choice and what it means in practice.
- `CONTRIBUTING.md` and `CLAUDE.md`: contribution workflow and codebase
  orientation.
- Partner attribution and expanded overview in `README.md`.

## [2026.07.0] — 2026-07-20

First versioned release. This baseline captures the state of the project at
the time open-sourcing preparation was completed: the Lagrange management web
UI — a react-admin application over the quantum-api backend — with developer
tooling and a documented contribution flow. Changes accumulated prior to this
tag are captured here as a single inaugural entry; future releases will track
individual changes.

### Added
- react-admin application with resources for organizations, projects, users,
  project membership, reservations, time slots, jobs, announcements,
  notifications, and roles.
- Keycloak (OIDC) authentication via `ra-keycloak` with one-shot backend token
  fetch.
- `ra-data-simple-rest` data provider against the react-admin-compatible
  quantum-api.
- Reservation calendar view and per-project budget/job visibility.
- Customized MUI layout (app bar and navigation menu).
- Vite build tooling with ESLint + Prettier and TypeScript project references.

[Unreleased]: https://github.com/LINKS-Foundation-CPE/Lagrange-Dashboard/compare/2026.10.0...HEAD
[2026.10.0]: https://github.com/LINKS-Foundation-CPE/Lagrange-Dashboard/releases/tag/2026.10.0
[2026.07.0]: https://github.com/LINKS-Foundation-CPE/Lagrange-Dashboard/releases/tag/2026.07.0

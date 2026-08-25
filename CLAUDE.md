# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Read `AGENTS.md` first — it is the working agreement for agents in this repository. This file
covers mechanics only.

## Repository shape

A course repository (software engineering, fall 2026). Teaching material, not a shipped product.

- `AGENTS.md` — the working agreement for agents. Read it first.
- `CONTRIBUTING.md` — how a change is accepted: signing, definition of done, what CI enforces.
- `parking/` — the live system. `README.md` there has the component table and the dependency rule;
  `REQUIREMENTS.md` is numbered observable behavior; `DESIGN.md` is chosen mechanism.
- `attic/parking/` — the original demo as it arrived, kept as a before-picture. Nothing depends on
  it and it is not maintained.
- `snowpack/` — empty placeholder. `.viki/`, `.vikiignore` — external tool cache, not project code.

**Only `parking/app/` and `parking/db/` are implemented.** The other eight component folders are
specified, each with a README stating its contract, and unbuilt. A gap between the documents and the
code is work to be done, not an error in the documents — do not "fix" a requirement by narrowing it
to what the code happens to do.

Commits on `main` are signed (SSH, `.github/allowed_signers`). See `CONTRIBUTING.md`.

## Working in `parking/`

Everything below is run from `parking/`.

```sh
docker compose up --build          # db + app; open http://localhost:3000
docker compose down -v             # REQUIRED after any schema change (see below)
```

```sh
cli/check-layering.sh              # dependency rule; the only check that exists yet
```

There is no test suite, linter, or build step. The frontend is plain static files served by Express
from `app/public` — no bundler, no transpile, so editing `public/*` only needs a browser reload
(the container copies files at build time, so rebuild or bind-mount when iterating in Docker).

**The compose build context is `parking/`, not `parking/app/`** (`dockerfile: app/Dockerfile`), so
that images can copy in the shared libraries once they depend on them. A Dockerfile cannot COPY from
above its own context. Paths inside `app/Dockerfile` are therefore relative to `parking/`, and the
image layout mirrors the repo so `require('../identity')` will resolve the same way in both.

Running the server outside Docker requires `DATABASE_URL` (hard-fails without it) and `JWT_SECRET`
(warns and falls back to `dev-secret`):

```sh
cd app && npm install && DATABASE_URL=... JWT_SECRET=... npm start
```

Seed logins: `root`/`rootpass` (root, bypasses all role checks), `sensor/north`/`sensorpass`.

### Database

`db/init.sql` is mounted into `/docker-entrypoint-initdb.d`, so **it runs only on a fresh
volume**. Any change to the schema or seed data requires `docker compose down -v` before the next
`up`, or the old database silently persists. There is no migration tooling.

Password hashing lives in SQL, not Node: `crypt($2, gen_salt('bf'))` on insert and
`password_hash = crypt($2, password_hash)` on login, via the `pgcrypto` extension. The plaintext
password travels as a query parameter.

Lots can only be created by editing the seed — there is no lot-creation endpoint. Schema-level
invariants worth knowing: `occupancy <= capacity`, and a `sensor` user must have a `lot_id`.

### Server (`app/index.js`)

One ~330-line Express file; `db.js` only exports a `pg` `Pool`. Raw parameterized SQL, no ORM.

- `lotSelectFields` is a shared SQL fragment interpolated into every lot query. It derives
  `available` server-side as `capacity - occupancy` when open and `0` when closed — the client never
  computes availability. Any new lot query should reuse this fragment.
- Auth is stateless JWT (8h). The token payload carries `role`, `lot_id`, and `is_root`, and
  `getUserFromRequest` only verifies the signature — it never re-reads the user row. Consequence:
  role changes, lot reassignment, and user deletion do not take effect until the token expires or
  the user logs in again. `GET /api/me` just echoes the decoded token.
- Two auth middlewares: `requireAdmin` and `requireSensorForLot` (which checks the token's `lot_id`
  against `:id`). `is_root` short-circuits both. `parseLotId` runs before them on lot routes, and
  `requireSensorForLot` re-parses `:id` independently.

### Frontend (`app/public`)

`app.js` is a single ~1050-line file with no modules or framework. Its first ~575 lines are the
`translations` object covering eight languages: `en`, `zh`, `es`, `hi`, `bn`, `pt`, `ru`, `ja`.

- All UI text goes through `t(key, params)` with `{token}` interpolation and an `en` → key fallback.
  `applyTranslations()` rewrites every `[data-i18n]` (textContent) and `[data-i18n-placeholder]`
  element on load and on language change. **Adding visible text means adding a `data-i18n`
  attribute in `index.html` plus the key in all eight language packs**, not a literal string.
- Module-level `state` (lots, users, language, lastRefreshAt) and `auth` (token, user). Persisted in
  `localStorage` under `parking_token` and `parking_language`.
- `setRoleVisibility()` toggles the `hidden` attribute on `#admin-panel`, `#users-panel`, and
  `#sensor-panel`. This is presentation only — every endpoint enforces its own authorization.
- `authFetch` attaches the bearer token; lots are re-polled every 5s via `setInterval`.

# Essentials: Docker

A container is one machine, described in a file, that anyone can start. It retires the other half of
"it works on my machine" — the half about what is installed — and it gives you the thing every test
suite needs most: one command back to a known state.

- **The fear it retires:** "It works on my machine." "I can't get back to a clean state."
- **The fence you prove:** From a clean clone, `docker compose up --build` serves
  `http://localhost:3000`; `docker compose down -v` and `up` again gives the seed state; and you can
  say which architecture the image was built for.
- **Before this:** `GITHUB-ACTIONS.md`
- **After this:** `PACKAGES.md`

## The model

```
  Dockerfile ──build──▶ image ──run──▶ container ──▶ a process in its own filesystem and network
  (a recipe)            (immutable,     (one running    │
                         layered)        copy; cheap;   ├── volume:  state that outlives the container
                                         disposable)    ├── port:    host:3000 → container:3000
                                                        └── network: compose makes `db` a hostname
```

Four nouns, and the mistakes are mostly confusing two of them:

- **An image** is a snapshot of a filesystem plus a command to run. It is built from a Dockerfile,
  it is immutable, and it is made of layers so that a rebuild redoes only what changed.
- **A container** is a running (or stopped) copy of an image. It is cheap and disposable. Anything
  written inside a container that is not on a volume dies with it.
- **A volume** is where state lives on purpose: the database's files. `parking/` has one, named
  `pgdata`. It survives `down`; it does not survive `down -v`.
- **A compose file** describes several containers, their volumes, ports, environment, and the
  network in which they can find each other by service name. `app` reaches the database at
  `db:5432` because compose made `db` a hostname.

## Once per machine

- **Mac and Windows:** Docker Desktop. On Windows it runs on the WSL 2 backend; turn that on in
  Desktop's settings, and run compose from the WSL side, in a project under the WSL home
  (`SHELL.md` — `/mnt/c` is slow, and for Docker's bind mounts it is very slow).
- **Linux:** Docker Engine plus the compose plugin, from Docker's repository, not the distribution's
  older package. Add yourself to the `docker` group so `sudo` is not needed.
- **Check:** `docker run --rm hello-world`, then `docker compose version`. Note the word: it is
  `docker compose` with a space; the hyphenated `docker-compose` is the old separate tool.
- **Know your architecture.** `docker version --format '{{.Server.Arch}}'` prints `arm64` on an
  Apple-silicon Mac and `amd64` on most everything else. Remember which you saw.

## Once per repository

**A Dockerfile per service.** `parking/app/Dockerfile`, annotated:

```dockerfile
FROM node:20-alpine            # the runtime, pinned to a major: same policy as PACKAGES.md
WORKDIR /srv/app               # every later path is relative to here
COPY app/package.json ./       # dependencies first, so this layer is cached until they change
RUN npm install --omit=dev     # (should be: COPY the lock file too, and `npm ci` — see PACKAGES.md)
COPY app/ ./                   # then the code, which changes often
ENV NODE_ENV=production
EXPOSE 3000                    # documentation; compose does the actual port mapping
CMD ["npm", "start"]
```

The order matters. Docker caches each layer and reuses it when its inputs are unchanged, so
copying `package.json` and installing *before* copying the source means an edit to `index.js` does
not reinstall every dependency.

**The build context.** `parking/docker-compose.yml` sets `context: .` and
`dockerfile: app/Dockerfile`, so the context is `parking/`, not `parking/app/`. That is why the
`COPY` paths above start with `app/`. A Dockerfile cannot `COPY` from above its own context, and
this layout lets the image copy in the shared libraries (`contract/`, `identity/`) once the service
depends on them. Add a `.dockerignore` (`node_modules`, `.git`, `.env`) so the context sent to the
builder is small and never contains a secret.

**A compose file** naming the services, from `parking/docker-compose.yml`:

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: parking_user
      POSTGRES_PASSWORD: parking_pass                # the demo database; not a secret, and labeled
      POSTGRES_DB: parking
    volumes:
      - pgdata:/var/lib/postgresql/data              # state, on a named volume
      - ./db/init.sql:/docker-entrypoint-initdb.d/init.sql:ro   # runs ONLY on an empty volume
    ports: ["5432:5432"]
  app:
    build: { context: ., dockerfile: app/Dockerfile }
    environment:
      DATABASE_URL: postgres://parking_user:parking_pass@db:5432/parking
      JWT_SECRET: demo-secret-change-me              # a demo value, in plain text, on purpose
      PORT: 3000
    depends_on: [db]
    ports: ["3000:3000"]
volumes:
  pgdata:
```

`depends_on` orders *starting*, not *readiness*: `app` may come up before Postgres accepts
connections. The fix is a health check on `db` and `condition: service_healthy` on the dependency:

```yaml
  db:
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U parking_user -d parking"]
      interval: 2s
      retries: 15
  app:
    depends_on:
      db:
        condition: service_healthy
```

That is the power-on self test from `TESTING.md`, applied to a dependency: do not start until the
thing you need says it is ready.

## Every day

| Want                                  | Type                                                      |
| ------------------------------------- | --------------------------------------------------------- |
| build and start everything            | `docker compose up --build`                               |
| the same, in the background           | `docker compose up --build -d`, then `docker compose logs -f app` |
| stop, keep the data                   | `docker compose down`                                     |
| stop, **destroy the data**            | `docker compose down -v` — required after any schema change |
| what is running                       | `docker compose ps`                                       |
| a shell in the database               | `docker compose exec db psql -U parking_user parking`     |
| a shell in the app                    | `docker compose exec app sh`                              |
| rebuild from scratch                  | `docker compose build --no-cache`                         |
| edit the frontend without rebuilding  | add a bind mount: `./app/public:/srv/app/public` under `app.volumes`, then reload the browser |
| reclaim disk                          | `docker system prune` (and `-a` to drop unused images too — it asks) |

**`down -v` is not a migration.** `db/init.sql` runs only when the volume is empty, so a schema
change with `up` and no `down -v` gives you new code against the old database, silently. `down -v`
fixes that by destroying the data, which is fine for a demo and not for anything with real rows.
`V-7` in `REQUIREMENTS.md` says the real story is still to be written.

### Repeatable, almost

An image tag is a family, not a file. `node:20-alpine` on an Apple-silicon Mac pulls the `arm64`
build; on a GitHub runner it pulls `amd64`. Same Dockerfile, two architectures, two builds of every
package inside. They behave the same almost always; native modules, packages with no `arm64` build,
numerical libraries, and anything timing-sensitive are where they differ. Three honest choices:

| Choice                                                   | Cost                                                        |
| -------------------------------------------------------- | ----------------------------------------------------------- |
| `platform: linux/amd64` on the service                   | emulation on Apple silicon: slow, and now the developer's machine is the odd one out |
| build both, test both — `docker buildx build --platform linux/amd64,linux/arm64`, and an `arm64` runner in CI | two builds; the honest one |
| accept *almost*, and write down where it is load-bearing | nothing today; a K4 with a known blast radius               |

Any of the three is fine. Not knowing which one you chose is not. And an image is only as
repeatable as its inputs: the base tag floats to the newest `20.x`, and `npm install` without a lock
file resolves fresh every build. `PACKAGES.md` is the fix, and `TESTING.md` is the argument.

## Danger Will Robinson

- **`docker compose down -v`** on a database with real data. There is no undo. Back up first.
- **A secret in an image.** `ENV`, `ARG`, or a copied `.env` lands in a layer, and layers are
  forever; anyone who can pull the image can read it. Secrets enter at *run* time, through the
  environment (`1PASSWORD.md`).
- **`latest`.** An image tag with no version is a different image every week.
- **Running as root inside the container** for a service that does not need it. Add a `USER` line.
- **A project under `/mnt/c`** with a bind mount. Every file access crosses the boundary twice.

## When it goes wrong

| Symptom                                          | Cause                                              | Do                                                           |
| ------------------------------------------------ | -------------------------------------------------- | ------------------------------------------------------------ |
| `port is already allocated`                      | something else on 3000 or 5432                     | `lsof -i :3000`; stop it, or change the host side of the mapping |
| `app` exits with `ECONNREFUSED` to `db`          | Postgres was not ready                              | the health check above                                       |
| the schema change did not take                   | the volume still has the old database               | `docker compose down -v && docker compose up --build`        |
| `no space left on device`                        | old images and build cache                          | `docker system prune`                                        |
| it built on a teammate's machine and not on yours | different architecture, or a floating base image   | compare `docker version` arch; pin; see *Repeatable, almost* |
| the container cannot see a file you just edited  | it was copied at build time                         | rebuild, or bind-mount the directory while iterating         |
| everything is slow on Windows                    | project under `/mnt/c`                              | move it to the WSL home                                      |

## Checklist

- [ ] `docker compose up --build` works from a clean clone, and `http://localhost:3000` answers.
- [ ] `docker compose down -v` then `up` returns the seed state, and you know why `-v` matters.
- [ ] The Dockerfile copies the manifest and lock before the source, and installs with `npm ci`.
- [ ] `.dockerignore` exists and excludes `node_modules`, `.git`, and `.env`.
- [ ] The base image is pinned to a major, and you can name the architecture it was built for.
- [ ] No secret is in any image layer or compose file except the demo value, and the demo value is
      labeled as one.

## In `parking/`

`T-5` — one command returns the entire system to a known state — is `docker compose down -v` and
`up --build`, which is why the essays keep calling the reset cheap. The compose file lists only the
services that exist and says which ones will join it, so `up` works from a clean checkout today.
`E-8` puts a one-hour window on anything that cannot be done live, and a schema change under real
data is the first thing that will not fit in `down -v`. And the `JWT_SECRET` line in the compose
file is the demo secret in plain text, labeled, which is the honest way to have one.

## Resources

- Docker's *Dockerfile reference* and *Compose file reference* — every key above, defined.
- Docker's *Multi-platform images* page — the `arm64` and `amd64` story, from the source.
- The languages course repository's `rust/` directory — a container used for exactly what
  containers are best at, a hermetic build, with the reasoning written down; and its `ml/`
  directory, for when a container is the wrong tool.

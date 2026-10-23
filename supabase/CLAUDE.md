# CLAUDE.md for `supabase/` (the backend)

This file is read when a session works inside `supabase/`. It adds to the root [`CLAUDE.md`](../CLAUDE.md), it does not replace it. **The root rules (simple language, lanes, git rules) still apply here.**

## Whose folder is this?

- **Owner of this folder: Shafin.** Only Shafin's sessions change files here.
- If you are working for Bishal or Sraboni, you may **read** this folder but must **not change** it. If their app needs something from the backend, they write a short, plain request and give it to Shafin.
- Not sure who you are working for? Read `CLAUDE.local.md` in the top folder, or ask.

## What this folder is

The **backend** is the hidden part of Griho that stores information and enforces the rules. It runs on Supabase (login, a Postgres database, live updates, and small server programs called Edge Functions). Both phone apps talk to it.

**Big idea: the database is the security guard.** The apps are only screens. Every rule that matters is enforced here, so a changed app cannot cheat.

## Planned layout

| Folder | What goes in it |
|---|---|
| `migrations/` | Database changes, one new file per change, in order (tables, security rules, functions) |
| `functions/` | Edge Functions: `delete_account` and push alerts |
| `tests/` | Database tests: building isolation, role permissions, counters, exits |

None of these folders exist yet.

## Read before you build

| Need | Read |
|---|---|
| Product rules (the PRD always wins) | [`docs/prd.md`](../docs/prd.md) |
| Tables, security layers, flows, testing plan | [`docs/architecture.md`](../docs/architecture.md) |
| The promise to the apps: function names, inputs, results, error codes | [`docs/api-contract.md`](../docs/api-contract.md) |

## Backend rules

- **Never edit an old migration.** Every change is a **new** migration file.
- **Row Level Security (a lock on each table row) is on for every table.** A new table without it is a bug.
- **Apps never write tables directly.** Important changes happen only through functions that check permissions and run in one step.
- **Every function must match `docs/api-contract.md` exactly:** same name, same inputs, same result shape, same error codes. Errors use the capital-letter code as the message.
- **Changing or removing an existing function** is a breaking change. Tell Bishal and Sraboni first, and update the contract in the same pull request. **Adding** a function is fine, but add it to the contract too.
- **People cannot read the codes table directly.** Owners and the manager see codes only through `list_codes`. Joining goes through `submit_join_request`, with rate limiting (8 tries per 10 minutes per account) and one error (`CODE_NOT_USABLE`) for any bad code.
- **Used count goes up only when a request is approved**, inside one step that locks the code row.
- **Every exit checks the typed name** inside the function, ignoring capital letters and spaces at the ends.
- **Labels** ("Former member", "Deleted account") are worked out when reading. Never store them.
- **Secrets** (service keys, push keys) never go in code or in git. Use environment settings.

## Tests

- Tests come first. Before anything goes to a remote branch, the tests must pass.
- Most important test of all: **a member of building A reads zero rows from building B**, on every table.
- Also test: guards can message like everyone else, rejected requests use no code slot, last-owner exit deletes everything, and removed members lose access immediately.

## Seed data (planned)

A script that fills the dev project with fake people (an owner, a tenant, a manager, a guard), a building, and a few codes, so Bishal and Sraboni can log in on day one. Never put real people's data in it.

## Status

`supabase init` has been run (`config.toml` exists) and the `migrations/`, `functions/`, and `tests/` folders are ready but empty. No tables or functions yet.

**Docker:** running the backend on your own computer (`supabase start`) needs Docker. Only Shafin needs this. Bishal and Sraboni use the shared dev project instead, so Docker is optional for them.

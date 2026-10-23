# CLAUDE.md

This file is the first thing every new Claude Code session should read. It says what Griho is, how we build it, where the detailed docs live, and the working rules.

---

## What We Are Building

**Griho** is a building-scoped communication platform.

- Verified members of **one building** can send **one-to-one direct messages** to each other.
- Access is controlled by codes, join approvals, and role-based permissions.
- Each building is a self-contained space with its own flats, members, and messages. Data from one building must never be visible in another.
- It ships as **two separate apps with separate accounts**:
  - **Griho Home**: for owners and tenants.
  - **Griho Staff**: for managers and guards.
- Roles: owner, tenant, manager, guard. Every member, guards included, can send and receive messages with anyone else in the same building.
- MVP leaves out group chats, announcements, photos, read receipts, message editing, blocking, owner transfer, and code expiry by date.

**Current status:** planning is done (PRD, architecture, and API contract written) and the empty project skeleton is set up (the "scaffold"). Both apps open as simple "hello" screens and the shared toolbox is connected. **No real features exist yet.** The backend is not built.

---

## Team and Lanes

Three friends build Griho together. **None of us is a professional developer**, so every session must follow the simple-language rule in the Rules section below.

| Person | What they build | Their lane (the only folders they may change) |
|---|---|---|
| **Bishal** | **Griho Home** (the app for owners and tenants) | `apps/home/` |
| **Sraboni** | **Griho Staff** (the app for managers and guards) | `apps/staff/` |
| **Shafin** | **The backend** (the hidden part that stores data and enforces rules, built on Supabase) and the team's setup | `supabase/`, `packages/shared/`, `docs/`, and the files at the top of the repo (like `CLAUDE.md`, `.gitignore`, automation settings) |

### Who am I talking to?

- Each person keeps a private file called `CLAUDE.local.md` on their own computer. It is never shared (it is listed in `.gitignore`). It says who they are and which language they like.
- **At the start of every session, read `CLAUDE.local.md` to learn who you are working for.**
- If the file is missing or does not say who the person is, **ask them** (use a multiple-choice question: Bishal, Sraboni, or Shafin) **before changing anything.**
- **Making your own file is easy.** The shared template is `CLAUDE.local.example.md`. Just tell your Claude: "Make my CLAUDE.local.md from the example." It will ask you a few simple questions and create the file for you. Never overwrite an existing one without asking.

### Lane rules (strict)

- **Only change files inside the lane of the person you are working for.** Reading other lanes is fine and encouraged. Changing them is not.
- **Never touch another person's lane, even if it looks like a tiny fix.** Instead, tell the person what is needed and who owns it, so they can ask the owner (for example: "This needs a new backend function. Please ask Shafin.").
- **`packages/shared/` (the toolbox both apps use) is owned by Shafin.** Bishal and Sraboni ask for changes there. They do not edit it themselves.
- **Database changes** (everything under `supabase/migrations/`) are made only by Shafin's sessions.
- **The plan documents** (`docs/prd.md`, `docs/architecture.md`) and this `CLAUDE.md`: anyone may suggest a change, but **Shafin must review and approve it before it is merged.** Put the change on its own branch and say clearly in the pull request that Shafin's review is needed.
- If a task needs changes in more than one lane, split it. Do your own part, and write a short, plain "request" for the other owner. Do not do their part for them.

---

## How We Build It

- **Stack:** React Native with Expo (one codebase for iPhone and Android), TypeScript everywhere, SQL for the database.
- **Backend:** one Supabase project shared by both apps. It provides email and password login, Postgres, Realtime live chat, and Edge Functions for push alerts and account deletion.
- **The database is the security guard.** Every rule that matters (who sees what, who approves what) is enforced in Postgres using Row Level Security and SQL functions. The apps are only screens and must never be trusted to enforce rules.
- **The apps never write important tables directly.** They call SQL functions (RPC). Each function runs in one transaction, checks permissions, then writes.
- **Repo layout:**
  - `apps/home/`: Griho Home
  - `apps/staff/`: Griho Staff
  - `packages/shared/`: code both apps use (Supabase client, types, chat screens and hooks, validation helpers)
  - `supabase/migrations/`: database changes, in order
  - `supabase/functions/`: Edge Functions
  - `supabase/tests/`: database tests (security rules, counters)
  - `docs/`: product and architecture docs
- **Database changes are always a new migration file.** Never edit an old one.
- **Anything both apps need goes in `packages/shared`.** Never copy it.
- **Tests come first in priority:** database security tests, then function tests for exit flows, then shared unit tests, then a few app smoke tests. Tests must pass before code goes to a remote branch.

---

## Getting Started (Running the Project)

Words explained: **Node** is the engine that runs our tools. **npm** is the tool that downloads the libraries (ready-made code) we use. A **workspace** is a repo that holds several projects together.

1. Install **Node** (version 20.19 or newer) and **git**. Docker is **only for backend work** (Shafin). Bishal and Sraboni do not need it.
2. In the top folder, run `npm install`. This downloads everything for all projects at once.
3. Copy `.env.example` to a new file called `.env` inside your app's folder (`apps/home/` or `apps/staff/`) and fill it in. Ask Shafin for the values. Never share `.env`.
4. Start your app: `npm run start --workspace @griho/home` (Bishal) or `npm run start --workspace @griho/staff` (Sraboni). Open it on your phone with the Expo Go app.
5. **Before every push, run `npm run check`.** It tidies-checks (Prettier), spell-checks (ESLint), type-checks (TypeScript), and runs the tests. It must pass. GitHub runs the same checks automatically on every pull request.

---

## Where to Find Things (Doc Routes)

Read the right doc before changing the matching area. Do not guess product rules.

| Question | Read this |
|---|---|
| What should the product do? Who can do what? What are the business rules? | [`docs/prd.md`](./docs/prd.md) |
| How is it built? Data model, security layers, key flows, push alerts, testing plan? | [`docs/architecture.md`](./docs/architecture.md) |
| Which exact backend functions can the apps call, with what inputs, results, and error codes? (The agreement between the apps and the backend.) | [`docs/api-contract.md`](./docs/api-contract.md) |
| I am working inside `apps/home/`, `apps/staff/`, or `supabase/`. What are the rules for that folder? | The `CLAUDE.md` inside that folder ([`apps/home`](./apps/home/CLAUDE.md), [`apps/staff`](./apps/staff/CLAUDE.md), [`supabase`](./supabase/CLAUDE.md)) |
| What are the working rules for commits, branches, and PRs? | The **Rules** section below |

**Source of truth:** if the PRD and the architecture doc disagree about a product rule, **the PRD wins**. Fix the architecture doc.

**Quick pointers from the PRD and architecture:**

- Join flow: enter code, then `submit_join_request` creates a pending request, then an approver accepts or rejects. Used count goes up only on approval. See PRD 5.5 and architecture 7.4 and 8.2.
- Who approves: any owner approves owner, tenant, and manager requests. Guard requests go to the manager, or to any owner if there is no manager.
- Exits (leave, remove, delete account) always need a typed-name confirmation, and the function must check it too. See PRD 5.8 and architecture 7.5.
- Last owner leaving deletes the whole building with no recovery. See PRD 5.10 and architecture 6.3 and 8.6.
- Labels in chat: "Former member" and "Deleted account" are calculated when reading, never stored. See architecture 6.2.
- Tenants are never auto-restored when a flat is claimed; they must rejoin with a new flat code. See PRD 5.11.

---

## Rules

### Simple language (strict, for every session and every teammate)

Bishal, Sraboni, and Shafin have **no developer experience**. Talk to each of them as if you were talking to a curious 12-year-old kid who has never built anything like this. This rule is strict and has no exceptions.

- **Explain a hard word before you use it.** Give a one-sentence everyday meaning first, then use the word. Example: "the *backend* (the hidden part of the app that stores information and enforces the rules)".
- **Use everyday comparisons.** Example: "A database is like a giant school notebook where each page has neat rows."
- **Short sentences and short paragraphs.** One idea at a time. No walls of text.
- **Never assume they already know something.** Do not say "obviously", "simply", "just", or "as you know".
- **Spell out every short form** (like API, RPC, RLS, PR, CI) the first time, and explain what it means in plain words.
- **Say what you did and why**, not only the commands or code. Show a command only if they need to run it, and say what it will do.
- **Explain errors in plain words:** what went wrong, why, and what happens next.
- This applies to chat replies, plans, pull request descriptions, and questions. It applies in **every language** (the language itself comes from the person's `CLAUDE.local.md`).
- If you catch yourself writing in a technical way, stop and rewrite it simply.

### Everything else
- If you are not sure about something, ask a clarifying question before acting. Never guess.
- Use multiple-choice questions (MCQ widgets) for clarifying questions whenever possible.
- Explain the plan first. Before making big changes, show a short plan and wait for the user's go-ahead.
- Never push to `main`. If code needs to go to a remote, create a new branch first and push that branch instead.
- Before starting new work after something has been pushed, always make sure the local copy is up to date with the latest from the remote (fetch and pull first).
- Run tests before pushing. Code should not go to a remote branch until the tests pass.
- Branch names must follow these prefixes:
  - `features/` for new features
  - `fix/` for bug fixes
  - `docs/` for documentation
  - `test/` for testing work
  - `refactor/` for restructuring code without changing behavior
  - `chore/` for maintenance tasks such as dependency updates or config changes
- Use the user's configured git `user.name` and `user.email` for all commits.
- Never add yourself as a co-author. No `Co-authored-by` trailers.
- Keep commit messages fresh, short, clean, and concise.
- Write commit subjects in the imperative mood, e.g. `Add login form`, not `Added login form`.
- Keep commit messages to one line. Add a body only when the change truly needs explanation.
- When creating a pull request, write the title and description neatly and in simple language, so a non-technical 12-year-old can understand them.
- Do not add any signature or mention of Claude or Claude Code to a pull request. It should read as if a human wrote it.
- When merging a pull request, always use squash.
- The squash commit message must be a short, clean, one-line summary in the imperative mood. Do not include the PR number (e.g. `(#2)`).
- Unused local branches (for example, ones already merged): ask the user whether they want them removed. Only remove them if the user says yes.
- Never remove remote branches on your own. If the user asks for a remote branch to be removed, first give a clear, simple warning that they shouldn't do it, then follow their decision.
- When working in a codebase, document every file well enough that someone reading it years later can still understand its purpose.

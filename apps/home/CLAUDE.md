# CLAUDE.md for `apps/home/` (Griho Home)

This file is read when a session works inside `apps/home/`. It adds to the root [`CLAUDE.md`](../../CLAUDE.md), it does not replace it. **The root rules (simple language, lanes, git rules) still apply here.**

## Whose folder is this?

- **Owner of this folder: Bishal.** Only Bishal's sessions change files here.
- If you are working for Sraboni or Shafin, you may **read** this folder but must **not change** it. Tell the person who owns it instead.
- Not sure who you are working for? Read `CLAUDE.local.md` in the top folder, or ask.

## What this app is

**Griho Home** is the phone app for **owners** and **tenants**. It is built with React Native (Expo) and TypeScript.

- **Owner** can: create a building, add flats, make codes (building, flat, manager, guard), approve or reject join requests, remove tenants / the manager / guards, send messages, switch between buildings, and leave or delete their account.
- **Tenant** can: join a flat with a flat code, send messages, and leave or delete their account.
- Only **Home accounts** work here. A Staff account that logs in must be signed out with a clear message (error code `WRONG_APP`).
- The **sign-up screen must explain** that the same email cannot be used for both Griho Home and Griho Staff. A person who needs both uses two different emails.
- The **building name must show on every screen** (PRD rule 15), not only in the building switcher.
- Every exit (leave, remove, delete) asks the person to **type a name** to confirm. A last owner gets an **extra warning** that the whole building will be deleted forever.
- Not in the MVP: group chats, photos, editing messages, password reset, email verification, changing your name. Do not build them.

## Read before you build

| Need | Read |
|---|---|
| What the product must do | [`docs/prd.md`](../../docs/prd.md) |
| Exact backend functions, inputs, results, error codes | [`docs/api-contract.md`](../../docs/api-contract.md) |
| How the whole system fits together | [`docs/architecture.md`](../../docs/architecture.md) |

## How this app talks to the backend

- **Only call the functions listed in `docs/api-contract.md`**, with the exact names and inputs written there.
- **Never write to database tables directly.** The backend functions do the checking.
- Once it exists, use the ready-made wrappers in `packages/shared` instead of typing function names by hand.
- **Turn error codes into friendly sentences** in this app's own screen text. Never show a raw code like `CODE_USED_UP` to a person.
- Until a function is built, you may build against a fake version that returns the shapes from Section 3 of the contract. Keep fakes inside `apps/home/`.
- **Never put secret keys in code.** Keys go in a local `.env` file that is not shared.

## Needs something outside this folder?

- A new or changed backend function, a database change, or a change in `packages/shared`: **ask Shafin.** Write a short, plain request saying what the screen needs. Do not edit those folders yourself.
- A change to the plan documents or the root `CLAUDE.md`: suggest it in a pull request and mark it as needing Shafin's review.

## Working style for this folder

- Every file starts with a short comment saying what it is for, in plain words.
- Keep screens simple. Prefer small files that do one thing.
- Work on a branch with the right prefix (see the root rules). Never push to `main`.

## Status

The Expo project exists and shows a simple "hello" screen. It is connected to `@griho/shared`. No real screens yet. Start it with `npm run start --workspace @griho/home` (see "Getting Started" in the root `CLAUDE.md`). Docker is not needed for this app.

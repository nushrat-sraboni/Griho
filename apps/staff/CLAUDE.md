# CLAUDE.md for `apps/staff/` (Griho Staff)

This file is read when a session works inside `apps/staff/`. It adds to the root [`CLAUDE.md`](../../CLAUDE.md), it does not replace it. **The root rules (simple language, lanes, git rules) still apply here.**

## Whose folder is this?

- **Owner of this folder: Sraboni.** Only Sraboni's sessions change files here.
- If you are working for Bishal or Shafin, you may **read** this folder but must **not change** it. Tell the person who owns it instead.
- Not sure who you are working for? Read `CLAUDE.local.md` in the top folder, or ask.

## What this app is

**Griho Staff** is the phone app for **managers** and **guards**. It is built with React Native (Expo) and TypeScript.

- **Manager** can: join with a manager code (made by an owner), make guard codes, approve or reject guard join requests, see and disable or delete guard codes, see and remove guards, send messages to owners and tenants, and leave or delete their account.
- **Guard** can: join with a guard code, then leave or delete their account. **Nothing else.** Guards cannot send or receive messages and have no other features in the MVP. After a guard is approved, show a simple screen with the building name and a leave option.
- A building has **at most one manager**. When the manager leaves, the guards stay. Until a new manager joins, owners (in the Home app) make guard codes and approve guards.
- Only **Staff accounts** work here. A Home account that logs in must be signed out with a clear message (error code `WRONG_APP`).
- The **sign-up screen must explain** that the same email cannot be used for both Griho Home and Griho Staff.
- Every exit (leave, remove, delete) asks the person to **type a name** to confirm.
- Not in the MVP: group chats, announcements, guard features, photos, editing messages, password reset, email verification, changing your name. Do not build them.

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
- Until a function is built, you may build against a fake version that returns the shapes from Section 3 of the contract. Keep fakes inside `apps/staff/`.
- **Never put secret keys in code.** Keys go in a local `.env` file that is not shared.

## Needs something outside this folder?

- A new or changed backend function, a database change, or a change in `packages/shared`: **ask Shafin.** Write a short, plain request saying what the screen needs. Do not edit those folders yourself.
- A change to the plan documents or the root `CLAUDE.md`: suggest it in a pull request and mark it as needing Shafin's review.

## Working style for this folder

- Every file starts with a short comment saying what it is for, in plain words.
- Keep screens simple. Prefer small files that do one thing.
- Work on a branch with the right prefix (see the root rules). Never push to `main`.

## Status

The app follows the Griho Staff design and talks to a **pretend backend** (`src/fakeBackend.ts`), because the real backend is not built yet. Delete the pretend one when it is.

**Built:** log in, sign up, join with a code, waiting for approval, the guard home screen (with leaving a building), and the manager workspace's Overview, Access, and Guards screens (answer guard requests, make and switch guard codes, see and remove guards with a typed-name confirmation).

**Not built yet:** the manager's Messages screen (it shows a "coming next" note), the exact Plus Jakarta Sans font, and the bottom menu icons. The font and icons need packages added by Shafin.

Start it with `npm run start --workspace @griho/staff` (see "Getting Started" in the root `CLAUDE.md`). Docker is not needed for this app.

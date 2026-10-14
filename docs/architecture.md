# Griho Architecture

**Status:** Draft v1 (blueprint, no code exists yet)
**Last updated:** 2026-10-14
**Source of truth for product rules:** [`docs/prd.md`](./prd.md)

---

## 1. Purpose and How to Read This File

This file explains **how Griho is built**: the pieces, how they talk to each
other, how data is stored, and how the product rules in the PRD are enforced.

- The PRD says **what** Griho does. This file says **how** we build it.
- If this file and the PRD disagree about a product rule, the PRD wins. Fix this
  file.
- Written for future developers and AI helpers. Someone reading it years later
  should understand why things are the way they are.
- Section 12 lists the product decisions made while writing this file. Some of
  them settle open questions that the PRD still lists as open. Update the PRD to
  match.

---

## 2. System Picture

```
 ┌──────────────────┐        ┌──────────────────┐
 │   Griho Home     │        │   Griho Stuff    │
 │ (owners/tenants) │        │ (managers/guards)│
 │  React Native    │        │  React Native    │
 └────────┬─────────┘        └────────┬─────────┘
          │       shared code         │
          └──────────┬────────────────┘
                     │  HTTPS + WebSocket (live updates)
                     ▼
        ┌──────────────────────────────┐
        │           Supabase           │
        │  ┌────────────────────────┐  │
        │  │ Auth (email+password)  │  │
        │  ├────────────────────────┤  │
        │  │ Postgres database      │  │
        │  │  - tables              │  │
        │  │  - Row Level Security  │  │
        │  │  - SQL functions (RPC) │  │
        │  ├────────────────────────┤  │
        │  │ Realtime (live chat)   │  │
        │  ├────────────────────────┤  │
        │  │ Edge Functions         │  │
        │  │  - push alerts         │  │
        │  │  - delete account      │  │
        │  └────────────────────────┘  │
        └──────────────┬───────────────┘
                       │
                       ▼
              Expo Push Service ──► phone alerts
```

Key idea: **the database is the security guard.** The apps are only screens.
Every rule that matters (who can see what, who can approve what) is enforced in
Postgres, so a modified app cannot bypass it.

---

## 3. Technology Choices

| Piece | Choice | Why |
|---|---|---|
| Phone apps | React Native with Expo | One codebase for iPhone and Android, large community, easy shared code between the two apps. |
| Backend | Supabase | Database, login, live messages and functions in one place. No server for us to run. |
| Database | Postgres (inside Supabase) | Strong relational rules (flats, roles, counts) and Row Level Security. |
| Login | Supabase Auth, email + password | Simplest option for the MVP. Phone login can come later. |
| Live chat | Supabase Realtime | Pushes new messages to open chats, and respects the same security rules as normal reads. |
| Push alerts | Expo Push Service, triggered by Edge Functions | Works for both iPhone and Android with one API. |
| Language | TypeScript everywhere (apps, Edge Functions) and SQL (database) | One language for most code, with types shared between apps. |

---

## 4. Repository Layout

One repository holds both apps and everything they share.

```
Griho/
├── apps/
│   ├── home/            Griho Home (owners, tenants)
│   └── stuff/           Griho Stuff (managers, guards)
├── packages/
│   └── shared/          Code both apps use: Supabase client, types,
│                        chat screens/hooks, validation helpers
├── supabase/
│   ├── migrations/      Database changes, in order (tables, policies, functions)
│   ├── functions/       Edge Functions (push alerts, delete account)
│   └── tests/           Database tests (security rules, counters)
├── docs/
│   ├── prd.md           Product rules
│   └── architecture.md  This file
├── CLAUDE.md            Working rules for AI helpers
└── README.md
```

Rules for the repo:

- Database changes are always a new migration file. Never edit an old one.
- Every file starts with a short comment saying what it is for (see
  `CLAUDE.md`).
- Anything that both apps need goes in `packages/shared`, not copied.

---

## 5. Accounts: Home vs Stuff

The PRD requires two kinds of accounts that must never be one login. We use
**one Supabase project** and tag each account.

- `accounts.app` is either `home` or `stuff`. It is set at sign-up from the app
  the person signed up in and never changes.
- Each app checks the tag after login. A `stuff` account that logs in to Griho
  Home is signed out with a clear message, and vice versa.
- The database also enforces the tag: roles only fit their app (owner and
  tenant need `home`, manager and guard need `stuff`).
- **Consequence:** Supabase allows one account per email address. A person who
  needs both a Home and a Stuff account must use two different email
  addresses. The sign-up screens must explain this.

One account can hold many memberships across many buildings **inside its own
app**.

---

## 6. Data Model

All tables live in Postgres. IDs are UUIDs. All tables have `created_at`.

```
accounts ──< memberships >── buildings ──< flats
                │                │
                │                └──< codes ──< join_requests
                │
                └── used as sender/participants of:
                    conversations ──< messages
```

### 6.1 Tables

**`accounts`** (one row per person per app; links to Supabase Auth)

| Column | Notes |
|---|---|
| `id` | Same as the Supabase Auth user id |
| `app` | `home` or `stuff` |
| `display_name` | Shown in chats and the member list |
| `deleted_at` | Set when the account is deleted. The row stays as a tombstone so old messages can be labeled "Deleted account". Name and other personal data are wiped. |

**`buildings`**

| Column | Notes |
|---|---|
| `name`, `address` | Required |
| `total_flats`, `contact_info` | Required at creation (decided in Section 12) |

**`flats`**

| Column | Notes |
|---|---|
| `building_id` | Which building |
| `label` | Flat number or name, unique inside the building |
| `owner_account_id` | One owner at a time. `NULL` means unclaimed. |

**`memberships`** (the link between an account and a building)

| Column | Notes |
|---|---|
| `account_id`, `building_id` | Who and where |
| `role` | `owner`, `tenant`, `manager`, `guard` |
| `flat_id` | Required for tenants, otherwise `NULL` |
| `status` | `active`, `left`, `removed` |
| `ended_at`, `end_reason` | Why access stopped (for example `left`, `removed`, `flat_unclaimed`, `account_deleted`) |

Database constraints on memberships:

- At most **one active manager** per building.
- At most **one active tenant membership per account per building** (one flat
  per tenant).
- A tenant must have a `flat_id`. Others must not.

**`codes`**

| Column | Notes |
|---|---|
| `building_id` | Which building |
| `type` | `building`, `flat`, `manager`, `guard` |
| `flat_id` | Only for flat codes |
| `value` | The random text people type. Unique, hard to guess. |
| `max_uses`, `used_count` | `remaining = max_uses - used_count` is calculated, never stored |
| `status` | `active`, `disabled`, `deleted` |
| `created_by` | The membership that created it |

Deleting a code sets `status = 'deleted'` (soft delete) so old join requests
and approvals stay traceable. Deleted codes are hidden everywhere and cannot be
used. Codes have **no time expiry**. They stop only by use count or by being
disabled or deleted.

**`join_requests`**

| Column | Notes |
|---|---|
| `code_id`, `building_id` | What was used |
| `requester_account_id` | Who asked |
| `role`, `flat_id` | What they will become (taken from the code, not from the user) |
| `status` | `pending`, `approved`, `rejected`, `cancelled` |
| `decided_by`, `decided_at` | Who answered and when |

**`conversations`** (one-to-one DM thread)

| Column | Notes |
|---|---|
| `building_id` | Conversations belong to exactly one building |
| `member_low_id`, `member_high_id` | The two accounts, stored in sorted order so a pair can only have one thread per building |

**`messages`**

| Column | Notes |
|---|---|
| `conversation_id`, `building_id` | The building is repeated so security rules and building deletion are simple |
| `sender_account_id` | Who wrote it |
| `body` | Plain text. Cleared (set to `NULL`) when deleted. |
| `deleted_at` | Set when the sender deletes the message. Everyone sees "Message deleted". |

**`push_tokens`** (phone addresses for alerts: account, token, platform)

### 6.2 Labels: "Former member" and "Deleted account"

Labels are **calculated when reading**, never stored on the message:

1. If the sender's `accounts.deleted_at` is set, show **Deleted account**.
2. Otherwise, if the sender has no active membership in this building, show
   **Former member**.
3. Otherwise show the sender's name.

This matches the PRD table in Section 8: a former member who later deletes their
account becomes "Deleted account" automatically.

### 6.3 Building deletion

Every building-owned table uses `ON DELETE CASCADE` from `buildings`. Deleting
the building row removes flats, memberships, codes, join requests,
conversations and messages in one step. There is no soft delete, grace period or
recovery (PRD 5.10).

---

## 7. Security: How the PRD Rules Are Enforced

### 7.1 Layers

1. **Row Level Security (RLS)** on every table. Reads are limited by building
   membership and role. Direct writes are mostly turned off.
2. **SQL functions (RPC)** for every action that changes important state. These
   run inside one transaction, check permissions, then write.
3. **Edge Functions** only for things Postgres cannot do (calling Expo Push,
   deleting the login record in Supabase Auth).

The apps never write to the important tables directly. They call functions.

### 7.2 Building isolation

A helper such as `is_active_member(building_id)` returns true only when the
caller has an active membership there. Every read policy starts with it, so a
user can never see another building's rows. Messages carry `building_id` too, so
a mistaken conversation id still cannot leak across buildings.

Database tests must prove: "a member of building A reads zero rows from
building B" on every table.

### 7.3 Permissions matrix (PRD Section 6) as functions

| Action | Function | Who may call |
|---|---|---|
| Create building | `create_building` | Home account |
| Add and manage flats | `create_flat`, `update_flat` | Owner of the building |
| Create code | `create_code` | Depends on type (see below) |
| Disable or delete code | `set_code_status` | Owner, or manager for any code the manager can see |
| Enter a code | `submit_join_request` | Any logged-in account of the matching app |
| Approve or reject | `decide_join_request` | See below |
| Remove a member | `remove_member` | See below |
| Leave a building | `leave_building` | Any member |
| Delete account | Edge Function `delete_account` | The account itself |
| Start a DM and send | `get_or_create_conversation`, `send_message` | Active owner, tenant, or manager |
| Delete own message | `delete_message` | The sender |

Who can do what:

- **Create code:** building, flat and manager codes by owners only. Guard codes
  by owners and the manager.
- **Approve:** owner, tenant and manager requests by **any owner of that
  building**. Guard requests by the manager, or by **any owner while there is no
  manager** (decided in Section 12).
- **Remove:** owners remove tenants and the manager. Owners and the manager
  remove guards.
- **Messaging:** guards are blocked by the function, so there are no guard
  conversations. The member list also hides guards.

### 7.4 Codes and join requests

- The apps cannot read the `codes` table by value. Entering a code calls
  `submit_join_request`, which looks the code up inside the database. This stops
  people from scanning for valid codes. Add rate limiting on this function.
- `submit_join_request` checks: code exists, `status = active`, remaining uses
  above zero, and the account's app fits the code's role. It then creates a
  `pending` request. The role and flat come from the code.
- `decide_join_request` runs in one transaction and **locks the code row**. On
  approval it re-checks remaining uses, increments `used_count` by 1 and
  creates the membership. On rejection nothing is consumed.
- Used count increases **only on approval** (PRD rule 3). Several requests may
  be pending at once. If the code is used up by the time an owner approves one,
  the approval fails with a clear message.
- The first approver wins. Once a request is decided, it closes for all other
  approvers.
- Disabling or deleting a code blocks new requests only. Existing members and
  already-pending requests are not affected by the code status change.
  (A pending request can still be approved if uses remain and the code is not
  deleted. A request on a deleted code is cancelled.)

### 7.5 Typed-name confirmation

Every exit (leave, remove, delete) requires the typed name (PRD rule 13). The
app asks for it, and the **function also checks it** by receiving the typed text
and comparing it to the right name (the member's own name for leave and delete,
the removed member's name for remove). A modified app cannot skip it.

---

## 8. Key Flows

### 8.1 Create a building (owner)

1. Owner signs up in Griho Home and logs in.
2. Calls `create_building` with name, address, total flats and contact info.
3. One transaction creates the building and an `owner` membership.
4. No codes are created. Codes appear only when the owner asks (PRD 5.2).

### 8.2 Join with a code

```
Person enters code
   └─► submit_join_request ──► pending request
                                   │
              approver sees it (live + push)
                                   │
                     decide_join_request
              ┌────────────────┴───────────────┐
           approve                           reject
   used_count +1, membership created     nothing consumed
   push alert to requester               push alert to requester
```

### 8.3 Send a direct message

1. Member opens the building member list (name, flat and role, guards hidden).
2. Picks a person. The app calls `get_or_create_conversation`, which checks both
   people are active, non-guard members of the same building.
3. `send_message` inserts the message. Realtime delivers it to the other
   person's open chat. A database trigger calls the push Edge Function if the
   person's app is closed.

### 8.4 Leave a building

`leave_building(building_id, typed_name)`:

1. Verify the typed name.
2. If the caller is **not** an owner: set their membership to `left`. Done.
3. If the caller is an owner and **other owners remain**: see 8.5.
4. If the caller is the **last owner**: see 8.6.

### 8.5 Owner leaves a multi-owner building

In one transaction:

1. Set the owner's membership to `left`.
2. For each flat they owned: set `owner_account_id = NULL` (unclaimed).
3. For every tenant of those flats: set the membership to `removed` with
   `end_reason = 'flat_unclaimed'`. They must rejoin with a new flat code if
   another owner claims the flat (decided in Section 12).
4. Pending requests that this owner could approve stay open for the other
   owners.

### 8.6 Last owner leaves or deletes account

1. The app shows the extra last-owner warning plus the typed-name confirmation.
2. The function detects there are no other active owners and deletes the
   building row. Everything cascades (Section 6.3).
3. Nothing is kept: no grace period, no recovery.

### 8.7 Delete account

Edge Function `delete_account`, run with the service role:

1. Verify the typed name.
2. For every building the account belongs to, apply the leave rules above
   (including multi-owner and last-owner handling).
3. Set `accounts.deleted_at`, wipe the display name and other personal fields,
   and remove push tokens.
4. Delete the Supabase Auth user so the person cannot log in.

Messages remain and now show "Deleted account". Only buildings the account
belonged to are affected.

### 8.8 Claiming an unclaimed flat

Another owner calls `claim_flat`. The function sets `owner_account_id` on a
flat that is currently `NULL` and is in a building where the caller is an
active owner. Old tenants are **not** restored. The new owner creates a flat
code and approves whoever joins.

### 8.9 Switching building (owner)

Purely an app feature. The selected building id is stored on the phone. The
building name is shown in the header of every Griho Home screen (PRD rule 15).
The database does not need to know which building is "active".

---

## 9. Live Updates and Push Alerts

- **Live chat:** apps subscribe to Realtime for `messages` and `join_requests`
  filtered by building. Realtime applies the same RLS rules, so nobody receives
  rows they cannot read.
- **Push alerts** (MVP scope):
  - New message
  - Join request approved or rejected (to the requester)
  - New join request waiting (to the approvers)
- Phones register an Expo push token after login. It is saved in `push_tokens`
  and removed on logout or account deletion.
- A database trigger on `messages` and `join_requests` calls an Edge Function,
  which looks up recipients' tokens and sends through Expo Push.
- Push payloads must not contain private message text beyond a short preview,
  and users must be able to turn alerts off at the phone level.

---

## 10. Environments and Testing

| Environment | Used for |
|---|---|
| Local | Supabase running on the developer's machine for daily work |
| Dev | A shared Supabase project for testing builds |
| Production | The real Supabase project, changed only by reviewed migrations |

Testing priorities, in order of importance:

1. **Database security tests**: building isolation, role permissions, guards
   cannot message, used count only changes on approval, typed-name checks.
2. **Function tests** for the exit flows (leave, owner leave, last owner, delete
   account).
3. **Shared package unit tests** (validation, label logic on the client).
4. **A small set of app smoke tests**: sign up, create building, join, send a
   message.

Tests must pass before any code goes to a remote branch (`CLAUDE.md`).

---

## 11. Not in This Architecture (MVP)

- Group chats and announcements
- Guard features beyond joining
- Co-owned flats
- Manual building deletion and owner transfer
- Photos, attachments, read receipts, edit message
- Blocking and reporting
- Code expiry dates
- A website or separate web portal
- Phone-number login

---

## 12. Decision Log

Decisions made while planning this file. Items 1 to 15 map to the PRD's open
questions (Section 12 of the PRD).

| # | Question | Decision |
|---|---|---|
| 1 | Manager leaves: do guards go? | Guards stay in the building. |
| 2 | Can owners remove guards? | Yes. Owners and the manager can both remove guards. |
| 3 | Pending requests when an approver leaves or the building is deleted | They stay open for other approvers. They are deleted with the building. |
| 4 | Who creates guard codes and approves guards with no manager? | Any owner, until a manager joins. |
| 5 | Claiming an unclaimed flat: old tenants? | They must rejoin with a new flat code. |
| 6 | Can a removed tenant rejoin? | Yes, with a new request and approval. No block list in the MVP. |
| 7 | Tenant in many flats of one building? | No. One flat per tenant per building. |
| 8 | How to find someone to message | A building member list with name, flat and role. Guards are hidden. |
| 9 | Guard messaging direction | Guards can neither send nor receive. |
| 10 | Message features | Plain text, plus delete own message (removed for everyone, shows "Message deleted"). No edit, read receipts or media. |
| 11 | Block and report | Not in the MVP. |
| 12 | Notifications | Basic push alerts are in the MVP. |
| 13 | Code expiry | Use count only. Owners and managers can disable at any time. |
| 14 | Owner transfer | Not in the MVP. |
| 15 | Building details | Name, address, total flats, and contact info are all required. |

Extra decisions made here:

| Topic | Decision |
|---|---|
| Phone apps | React Native (Expo), iPhone and Android |
| Backend | One Supabase project for both apps |
| Account separation | One backend with accounts tagged Home or Stuff. Same email cannot be used in both apps. |
| Login | Email and password |
| Building portal | Screens inside the apps, no website |
| Repo | One repo containing both apps and shared code |
| Several owners approving | Any owner of the building can approve. First answer wins. |

---

## 13. Risks and Things to Watch

- **Two emails needed for two accounts.** Users who want a Home and a Stuff
  account need two different email addresses. Test this in the sign-up flow.
- **Approvals vs. counts.** Because used count rises only on approval, several
  people can be pending for the last slot. The approval step must handle the
  "no uses left" case gracefully.
- **Message privacy.** Owners and the manager are normal members. They cannot
  read other people's DMs, and the security tests must prove it.
- **Deletion is permanent.** Last-owner deletion has no recovery. The warning
  screen and the typed-name check are the only safeguards.
- **Code guessing.** Codes must be long and random, and code lookup must be rate
  limited.

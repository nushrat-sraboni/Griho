# Griho API Contract

**Status:** Draft v1 (the backend does not exist yet; every function below is `planned`)
**Owner:** Shafin (backend). Changes need Shafin's review.
**Last updated:** 2026-10-15
**Source of truth for product rules:** [`prd.md`](./prd.md). **For how things are built:** [`architecture.md`](./architecture.md).

---

## 1. What This File Is (In Plain Words)

The two apps (Griho Home and Griho Staff) and the backend are built by different people. This file is the **written agreement between them**, like a restaurant menu:

- The backend (kitchen) promises to offer these "dishes" (functions).
- The apps (customers) order them using the exact names and details written here.

So Bishal and Sraboni can build their screens **without waiting for the backend**, and Shafin can build the backend **without guessing what the apps need**.

Rules for this file:

- If this file and the PRD disagree about a **product rule**, the PRD wins. Fix this file.
- Function names, input names, and error codes here are **exact**. Do not rename them in app code.
- **Adding** a new function is allowed through a pull request that Shafin reviews. **Changing or removing** an existing one must be announced to Bishal and Sraboni first.
- Items marked **(proposed)** are new ideas added while writing this contract. They are not in `architecture.md` yet. Shafin must confirm them.

---

## 2. Ground Rules for Calling the Backend

### 2.1 How a call looks

The backend is Supabase. Apps call a function like this (TypeScript):

```ts
const { data, error } = await supabase.rpc('create_building', {
  name: 'Green Tower',
  address: '12 Lake Road',
  contact_info: '01700000000',
});
```

(`rpc` means "remote procedure call": the app asks the database to run one of its ready-made functions.)

- Input names are `snake_case`, exactly as written in this file.
- The apps **never write to tables directly**. They only call functions (see architecture 7.1).
- Every function needs a logged-in user. A call without login fails with `NOT_AUTHENTICATED`.

### 2.2 Errors

When something is wrong, the call returns `error`. Its **`error.message` is a short code in CAPITALS** (for example `CODE_USED_UP`). The app must **turn the code into a friendly sentence in its own screen text**. Apps never show the raw code to users.

The full list of codes is in Section 6.

### 2.3 Lists and paging

- Short lists (members, codes, flats) come back in full.
- Chat messages use paging: `get_messages` gives 50 at a time, newest first. Pass `before` (a timestamp) to get older ones.

### 2.4 Live updates (Realtime)

Apps may "listen" for changes on two tables: `messages` and `join_requests`, filtered by `building_id`. Security rules make sure each person only hears about rows they are allowed to see. When a change arrives, **the app should re-run the matching read function** (`get_messages`, `list_pending_join_requests`, ...) to get the final labels and names, instead of trusting the raw row.

### 2.5 Who is who

- A **Home account** can be an owner or tenant. A **Staff account** can be a manager or guard.
- The role comes from the **code** used to join, never from what the user types.
- A person has **only one role per building**. There is no owner-and-tenant in the same building.

### 2.6 Typed-name check

`leave_building`, `remove_member`, and `delete_account` take a `typed_name`. The backend compares it to the right person's display name, **ignoring capital letters and extra spaces at the start and end**. So `rahim ` matches `Rahim`. A wrong name fails with `TYPED_NAME_MISMATCH`. The app also checks it on the screen, but the backend always checks too.

### 2.7 Not in the MVP

There is **no password reset, no email verification, and no way to change your display name**. Sign-up lets a person in right away. (A person who forgets their password cannot recover the account in v1.)

---

## 3. Data Shapes

These are the objects functions give back. Dates are ISO strings (for example `2026-10-15T09:30:00Z`). All ids are UUIDs (long unique ids).

```ts
type App = 'home' | 'staff';
type Role = 'owner' | 'tenant' | 'manager' | 'guard';
type CodeType = 'building' | 'flat' | 'manager' | 'guard';
type CodeStatus = 'active' | 'disabled' | 'deleted';

type Account = { id: string; app: App; display_name: string; email: string };

type Building = {
  id: string; name: string; address: string; contact_info: string;
};

type Flat = {
  id: string; building_id: string; label: string;
  owner: { account_id: string; display_name: string } | null; // null = unclaimed
};

// One row per building the person belongs to (active only).
type MyMembership = {
  membership_id: string;
  building: { id: string; name: string };
  role: Role;
  flat: { id: string; label: string } | null; // only for tenants
};

type CodeInfo = {
  id: string; type: CodeType; value: string;
  flat: { id: string; label: string } | null; // only for flat codes
  max_uses: number; used_count: number; remaining: number;
  status: 'active' | 'disabled'; // deleted codes are never returned
  created_at: string;
};

type JoinRequest = {
  request_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  building: { id: string; name: string };
  role: Role;
  flat_label: string | null;
  created_at: string;
};

type PendingRequestForApprover = {
  request_id: string;
  requester_name: string;
  role: Role;
  flat_label: string | null;
  created_at: string;
};

type MemberListItem = {
  account_id: string; membership_id: string;
  display_name: string; role: Role; flat_label: string | null;
};

type ConversationItem = {
  conversation_id: string;
  other: { account_id: string; label: string }; // label: a name, "Former member", or "Deleted account"
  last_message: { preview: string | null; deleted: boolean; created_at: string } | null;
};

type Message = {
  id: string; conversation_id: string;
  sender_account_id: string; sender_label: string; // name, "Former member", or "Deleted account"
  is_mine: boolean;
  body: string | null;  // null when deleted
  deleted: boolean;     // true -> show "Message deleted"
  created_at: string;
};
```

---

## 4. Functions

Each block says: **plain words**, **who can call**, **inputs**, **returns**, **errors**, and the **PRD rule** behind it. "Home" and "Staff" show which app normally uses it.

### 4.1 Account and login

#### Sign up (Supabase Auth, no custom function)
- **Plain words:** make an account with email and password, in the app the person belongs to.
- **Call:** `supabase.auth.signUp({ email, password, options: { data: { app, display_name } } })`
- `app` is `'home'` or `'staff'`, set by the app itself and never changeable later.
- A database trigger creates the matching `accounts` row.
- **If the email is already used** (even in the other app), sign-up fails. The sign-up screen must explain: *"Each app needs its own email address."* (PRD 3, architecture 5.)

#### Log in (Supabase Auth, no custom function)
- **Call:** `supabase.auth.signInWithPassword({ email, password })`, then `get_my_account()`.
- If `account.app` does not match the app being used, **sign out** and show a clear message (error code `WRONG_APP`).

#### `get_my_account()` — Home, Staff
- **Plain words:** who am I, and which app is my account for?
- **Returns:** `Account`
- **Errors:** `NOT_AUTHENTICATED`

#### `register_push_token(token, platform)` — Home, Staff **(proposed)**
- **Plain words:** save this phone's address so the backend can send it alerts.
- **Inputs:** `token: string` (the Expo push token), `platform: 'ios' | 'android'`
- **Returns:** `{ ok: true }`
- Saving the same token twice is fine (no error).

#### `remove_push_token(token)` — Home, Staff **(proposed)**
- **Plain words:** stop sending alerts to this phone (call on log out).
- **Returns:** `{ ok: true }`

#### `delete_account(typed_name)` — Home, Staff (Edge Function)
- **Plain words:** permanently delete my account. It applies the leave rules to every building I am in (PRD 5.8 to 5.10).
- **Call:** `supabase.functions.invoke('delete_account', { body: { typed_name } })`
- **Inputs:** `typed_name` must match my own display name.
- **Returns:** `{ ok: true, buildings_deleted: number }`
- **Errors:** `TYPED_NAME_MISMATCH`
- The app shows the extra **last-owner warning** first when `get_my_memberships()` shows I am the only owner anywhere (see `is_last_owner` in 4.2).

### 4.2 Buildings

#### `create_building(name, address, contact_info)` — Home
- **Plain words:** make a new building. I become its first owner. No codes are created yet.
- **Who:** any Home account.
- **Inputs:** all three are required, and none may be empty. There is no "total flats" input; the number of flats is just how many flats the owners add.
- **Returns:** `Building`
- **Errors:** `INVALID_INPUT`, `WRONG_APP`
- **Rule:** PRD 5.2.

#### `get_my_memberships()` — Home, Staff
- **Plain words:** all the buildings I belong to and what I am in each one. Used for the building switcher (PRD 5.12).
- **Returns:** `(MyMembership & { is_last_owner: boolean })[]` (active memberships only)
- `is_last_owner` is true when I am the only active owner of that building.

#### `get_building(building_id)` — Home, Staff
- **Plain words:** details of one building I belong to.
- **Returns:** `Building`
- **Errors:** `NOT_A_MEMBER`

### 4.3 Flats

#### `create_flat(building_id, label)` — Home
- **Plain words:** add a flat to my building. I am the flat's owner. The label is the flat number or name.
- **Who:** an owner of the building.
- **Returns:** `Flat`
- **Errors:** `NOT_ALLOWED`, `INVALID_INPUT`, `FLAT_LABEL_TAKEN`
- **Rule:** PRD 5.3. No flat code is made here.

#### `update_flat(flat_id, label)` — Home
- **Plain words:** rename a flat.
- **Who:** the flat's owner.
- **Returns:** `Flat`
- **Errors:** `NOT_ALLOWED`, `FLAT_LABEL_TAKEN`

#### `list_flats(building_id)` — Home **(proposed)**
- **Plain words:** all flats in my building, including unclaimed ones.
- **Who:** an owner of the building.
- **Returns:** `Flat[]`

#### `claim_flat(flat_id)` — Home
- **Plain words:** take over an unclaimed flat. Old tenants are **not** restored; they must join again with a new flat code (PRD 5.11).
- **Who:** an owner of that building.
- **Returns:** `Flat`
- **Errors:** `NOT_ALLOWED`, `FLAT_NOT_UNCLAIMED`

### 4.4 Codes

#### `create_code(building_id, type, max_uses, flat_id?)` — Home, Staff
- **Plain words:** make a join code. Codes are only made when someone asks (never automatic).
- **Inputs:**
  - `type`: `'building' | 'flat' | 'manager' | 'guard'`
  - `max_uses`: whole number from 1 to 1000, where 1 means single use
  - `flat_id`: required for `flat` codes only
- **Who:** building, flat, and manager codes by owners. Guard codes by owners and the manager.
- **Returns:** `CodeInfo`
- **Errors:** `NOT_ALLOWED`, `INVALID_INPUT`
- **Rule:** PRD 5.4. Codes never expire by time.

#### `list_codes(building_id)` — Home, Staff **(proposed)**
- **Plain words:** the code list, with each code's type, max uses, used count, remaining, and status.
- **Who:** owners see all codes. The manager sees guard codes only.
- **Returns:** `CodeInfo[]`
- Owners and the manager must be able to **see the code text** to share it. Everyone else can never read codes. This is why codes are read through this function and not through a table.

#### `set_code_status(code_id, status)` — Home, Staff
- **Plain words:** turn a code off, back on, or delete it.
- **Inputs:** `status: 'active' | 'disabled' | 'deleted'`
- **Who:** owners; the manager for the codes they can see.
- **Returns:** `CodeInfo` (or `{ ok: true }` when deleted)
- **Errors:** `NOT_ALLOWED`, `NOT_FOUND`
- **Rule:** disabling or deleting blocks **new** requests only. Existing members stay (PRD 5.4). A pending request on a deleted code is cancelled.

### 4.5 Joining

#### `submit_join_request(code_value)` — Home, Staff
- **Plain words:** I typed a code. Ask to join.
- **Inputs:** `code_value: string` (what the person typed; the backend trims spaces and ignores capital letters)
- **Returns:** `{ request_id, building_name, role, flat_label, status: 'pending' }`
- **Errors:** `CODE_NOT_USABLE`, `CODE_USED_UP`, `WRONG_APP`, `ALREADY_MEMBER`, `ALREADY_PENDING`, `TENANT_ALREADY_HAS_FLAT`, `MANAGER_SLOT_TAKEN`, `TOO_MANY_ATTEMPTS`
- **Rules:**
  - `CODE_NOT_USABLE` is used for "does not exist", "disabled", and "deleted". It is **one error on purpose**, so nobody can guess which codes exist.
  - The role and flat come from the code, never from the user.
  - The code's used count does **not** change here (PRD rule 3).
  - This function is rate limited: **8 tries per 10 minutes per account**. After that it returns `TOO_MANY_ATTEMPTS`.

#### `list_my_join_requests()` — Home, Staff **(proposed)**
- **Plain words:** requests I sent and their answers.
- **Returns:** `JoinRequest[]` (newest first)

#### `list_pending_join_requests(building_id)` — Home, Staff **(proposed)**
- **Plain words:** requests waiting for **my** answer in this building.
- **Who:** an owner sees owner, tenant, and manager requests, plus guard requests when the building has no manager. The manager sees guard requests.
- **Returns:** `PendingRequestForApprover[]`

#### `decide_join_request(request_id, decision)` — Home, Staff
- **Plain words:** say yes or no to a request.
- **Inputs:** `decision: 'approve' | 'reject'`
- **Returns:** `{ request_id, status: 'approved' | 'rejected' }`
- **Errors:** `NOT_ALLOWED`, `NOT_FOUND`, `REQUEST_ALREADY_DECIDED`, `CODE_USED_UP`, `MANAGER_SLOT_TAKEN`, `TENANT_ALREADY_HAS_FLAT`
- **Rules (PRD 5.5, architecture 7.4):**
  - First answer wins. Everyone else gets `REQUEST_ALREADY_DECIDED`.
  - On approve: used count goes up by 1 and the membership is created, all in one step.
  - On reject: nothing is used up.
  - If the code ran out while the request was waiting, approving fails with `CODE_USED_UP`.

### 4.6 Members

#### `list_members(building_id)` — Home, Staff **(proposed)**
- **Plain words:** the member list I use to find someone to message (PRD 5.6). Shows name, flat, role.
- **Who:** any active member of the building (owner, tenant, manager, or guard).
- **Returns:** `MemberListItem[]`. **Guards are included** (role `guard`), so everyone can message them. I am not included.

#### `list_guards(building_id)` — Staff, Home **(proposed)**
- **Plain words:** only the guards of the building, so they can be removed. (Guards also appear in `list_members`.)
- **Who:** owners and the manager.
- **Returns:** `MemberListItem[]` (role is always `guard`)

#### `remove_member(membership_id, typed_name)` — Home, Staff
- **Plain words:** remove someone from the building. They lose access right away; their messages stay as "Former member".
- **Inputs:** `typed_name` must match the **removed person's** display name.
- **Who:** owners remove tenants, the manager, and guards. The manager removes guards.
- **Returns:** `{ ok: true }`
- **Errors:** `NOT_ALLOWED`, `NOT_FOUND`, `TYPED_NAME_MISMATCH`
- **Rule:** PRD 5.7. Nobody can remove an owner.

#### `leave_building(building_id, typed_name)` — Home, Staff
- **Plain words:** I leave this building. If I am the last owner, the whole building is deleted forever.
- **Inputs:** `typed_name` must match **my own** display name.
- **Returns:** `{ result: 'left' | 'building_deleted' }`
- **Errors:** `NOT_A_MEMBER`, `TYPED_NAME_MISMATCH`
- **Rules:**
  - Not an owner: I leave. Done.
  - Owner, other owners remain: I leave, my flats become unclaimed, and their tenants lose access (PRD 5.9).
  - Last owner: the building and everything in it is deleted. No undo (PRD 5.10). The app must show the last-owner warning first.

### 4.7 Direct messages

#### `get_or_create_conversation(building_id, other_account_id)` — Home, Staff
- **Plain words:** open the chat with this person (or start it if it is new).
- **Returns:** `{ conversation_id }`
- **Errors:** `NOT_A_MEMBER`, `NOT_IN_SAME_BUILDING`, `CANNOT_MESSAGE_SELF`
- **Rule:** both people must be active members of that building, in any role (owner, tenant, manager, or guard). There is only one thread per pair per building.

#### `list_conversations(building_id)` — Home, Staff **(proposed)**
- **Plain words:** my chats in this building.
- **Returns:** `ConversationItem[]` (latest activity first)

#### `get_messages(conversation_id, before?, limit?)` — Home, Staff **(proposed)**
- **Plain words:** the messages of one chat, 50 at a time, newest first.
- **Inputs:** `before`: ISO timestamp (optional). `limit`: 1 to 100, default 50.
- **Returns:** `Message[]`
- Labels ("Former member", "Deleted account") are worked out here, when reading (architecture 6.2).

#### `send_message(conversation_id, body)` — Home, Staff
- **Plain words:** send a plain text message.
- **Inputs:** `body`: text, trimmed, 1 to 2000 characters.
- **Returns:** `Message`
- **Errors:** `NOT_ALLOWED`, `INVALID_INPUT`

#### `delete_message(message_id)` — Home, Staff
- **Plain words:** delete a message **I** sent. It disappears for everyone and shows "Message deleted".
- **Returns:** `{ ok: true }`
- **Errors:** `NOT_ALLOWED`, `NOT_FOUND`, `MESSAGE_ALREADY_DELETED`

---

## 5. Who Calls What

| Function | Owner | Tenant | Manager | Guard |
|---|---|---|---|---|
| `get_my_account`, push token functions, `delete_account` | ✅ | ✅ | ✅ | ✅ |
| `get_my_memberships`, `get_building` | ✅ | ✅ | ✅ | ✅ |
| `submit_join_request`, `list_my_join_requests` | ✅ | ✅ | ✅ | ✅ |
| `leave_building` | ✅ | ✅ | ✅ | ✅ |
| `create_building`, `create_flat`, `update_flat`, `list_flats`, `claim_flat` | ✅ | ❌ | ❌ | ❌ |
| `create_code` (building, flat, manager) | ✅ | ❌ | ❌ | ❌ |
| `create_code` (guard) | ✅ | ❌ | ✅ | ❌ |
| `list_codes`, `set_code_status` | ✅ | ❌ | ✅ (guard codes) | ❌ |
| `list_pending_join_requests`, `decide_join_request` | ✅ | ❌ | ✅ (guard requests) | ❌ |
| `list_members` | ✅ | ✅ | ✅ | ✅ |
| `list_guards` | ✅ | ❌ | ✅ | ❌ |
| `remove_member` | ✅ (tenant, manager, guard) | ❌ | ✅ (guard) | ❌ |
| Chat functions | ✅ | ✅ | ✅ | ✅ |

This table follows the PRD permissions matrix (PRD Section 6).

---

## 6. Error Codes

| Code | When it happens |
|---|---|
| `NOT_AUTHENTICATED` | The person is not logged in. |
| `WRONG_APP` | A Home account used a Staff-only action, or the other way around. |
| `NOT_ALLOWED` | The person's role cannot do this. |
| `NOT_A_MEMBER` | The person is not an active member of that building. |
| `NOT_FOUND` | The thing asked about does not exist or is not visible to this person. |
| `INVALID_INPUT` | A required input is missing, empty, or in the wrong shape. |
| `CODE_NOT_USABLE` | The code does not exist, is disabled, or was deleted (one error on purpose). |
| `CODE_USED_UP` | The code has no uses left. |
| `ALREADY_MEMBER` | The person already has an active role in this building. One person has only one role per building. |
| `ALREADY_PENDING` | The person already has a waiting request for this code. |
| `TENANT_ALREADY_HAS_FLAT` | A tenant already has a flat in this building (PRD rule 16). |
| `MANAGER_SLOT_TAKEN` | The building already has a manager (PRD rule 8). |
| `REQUEST_ALREADY_DECIDED` | Someone else already answered this request. |
| `FLAT_LABEL_TAKEN` | Another flat in this building already has that label. |
| `FLAT_NOT_UNCLAIMED` | The flat already has an owner. |
| `TYPED_NAME_MISMATCH` | The typed name does not match (PRD rule 13). |
| `GUARD_CANNOT_MESSAGE` | **Retired.** Guards can now message, so this is no longer returned. |
| `NOT_IN_SAME_BUILDING` | The two people do not share this building. |
| `CANNOT_MESSAGE_SELF` | A person tried to open a chat with themselves. |
| `MESSAGE_ALREADY_DELETED` | The message was already deleted. |
| `TOO_MANY_ATTEMPTS` | Too many code tries in a short time. Wait and try again. |

Unknown errors: the app should show a general "Something went wrong, please try again" message and not crash.

---

## 7. Live Updates and Alerts

- **Realtime tables:** `messages`, `join_requests` (filter by `building_id`). See 2.4.
- **Push alerts** (the backend sends them; apps only register the phone token):
  - new message
  - my join request was approved or rejected
  - a new join request is waiting for me (approvers only)
- Alerts carry only a short preview. There are no in-app alert settings in the MVP (PRD 5.15).

---

## 8. Decisions and Open Questions

### Decided on 2026-10-15 (Shafin)

| # | Question | Decision |
|---|---|---|
| 1 | Keep the "total flats" number? | **Removed.** Nothing used it. The flat count is just the flats the owners add. No flat limit exists. |
| 2 | Which codes can the manager see? | Guard codes only. |
| 3 | Owner and tenant in the same building? | No. One role per person per building. |
| 4 | Range for a code's `max_uses` | 1 to 1000. |
| 5 | Rate limit for `submit_join_request` | 8 tries per 10 minutes per account. |
| 6 | Maximum message length | 2000 characters. |
| 7 | How the typed name is compared | Ignore capital letters and extra spaces at the ends. |
| 8 | Password reset and email verification | Not in the MVP. |
| 9 | Changing the display name | Not in the MVP. |

### Still open

None right now. New questions go here. Do **not** guess; ask Shafin.

---

## 9. How This File Will Be Used

- The backend (`supabase/migrations/`) is built to match this file.
- `packages/shared` will hold one small, typed wrapper per function here, so the apps call `api.createBuilding(...)` and never type function names by hand. Shafin owns that package.
- Until a function exists in the real backend, apps may build against a fake version of it, using the shapes in Section 3.
- Status of each function (`planned`, `built`, `tested`) will be tracked in the task board.

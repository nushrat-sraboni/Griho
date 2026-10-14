# Griho MVP: Product Requirements Document

**Status:** Draft v1
**Owner:** Shafin Ahmed
**Last updated:** 2026-10-09

---

## 1. Overview

Griho is a building-scoped communication platform. Verified members of a single building can send one-to-one direct messages to each other. Access is controlled through codes, join approvals, and role-based permissions. Each building is a self-contained space with its own flats, members, and messages.

Griho ships as two separate apps with separate accounts:

- **Griho Home** for owners and tenants
- **Griho Stuff** for managers and guards

---

## 2. Goals and Non-Goals

### Goals (MVP)
- Let building members reach each other privately without group chats or phone numbers.
- Make building access controlled, traceable, and revocable.
- Keep each building's data isolated from every other building.

### Non-Goals (MVP)
- Group chats
- Building-wide announcements
- Guard messaging or any guard features beyond joining
- Co-owned flats (one flat, one owner account)
- Manual building deletion
- Message recovery or grace periods after deletion
- Any feature not listed in Section 5

---

## 3. Apps and Roles

| Role | App | Account type | How they join | Can send DMs to | Can receive DMs from |
|---|---|---|---|---|---|
| Owner | Griho Home | Separate account | Building code, approved by owner or manager | Owners, tenants, manager | Owners, tenants, manager |
| Tenant | Griho Home | Separate account | Flat code, approved by owner or manager | Owners, tenants, manager | Owners, tenants, manager |
| Manager | Griho Stuff | Separate account | Manager code from owner's building portal, approved by owner | Owners, tenants, manager | Owners, tenants, manager |
| Guard | Griho Stuff | Separate account | Guard code from manager, approved by manager | None | None |

**Account rules:**
- A person who is an owner or tenant in a building and also a manager in another building uses two accounts, one per app. A single login across both apps is not allowed.
- One account can hold multiple roles across multiple buildings within its own app. Example: an owner account can own several buildings. A Griho Home account can be an owner in Building A and a tenant in Building B.

---

## 4. Core Entities

- **Building:** name, address, and building details entered by the creating owner. Has one building code and one manager slot.
- **Flat:** belongs to one building. Has exactly one owner account at a time (or none, if unclaimed). Has one flat code at a time.
- **Code:** a join credential. Types: building code, flat code, manager code, guard code. Has a max-use limit, a used count, a remaining count, and a status (active, disabled, deleted).
- **Join request:** a pending request created when someone enters a valid code. Approved or rejected by an owner or manager.
- **Membership:** the link between an account and a building, with a role and, for tenants, a flat.
- **Conversation:** a one-to-one DM thread between two members of the same building.
- **Message:** belongs to a conversation, which belongs to a building.

---

## 5. Features and User Flows

### 5.1 Account Creation
- Users create an account in the app they belong to (Griho Home or Griho Stuff).
- Account creation does not, by itself, grant access to any building.

### 5.2 Building Creation (Owner)
1. Owner creates an account in Griho Home.
2. Owner creates a building and enters all building details.
3. The app generates no code automatically. The owner triggers code creation from the building portal.
4. The building exists with one owner and no flats, managers, or guards.

### 5.3 Flat Creation (Owner)
1. Owner adds one or more flats to a building they own.
2. Each flat has exactly one owner account. Co-owned flats are not supported.
3. Each flat gets a flat code only when the owner triggers code creation.

### 5.4 Code Management (Owner and Manager)
- Owner or manager triggers code creation. Codes are never auto-generated.
- On creation, the user sets a **max-use value**. A value of 1 means single use.
- Code list is visible to owners and the manager. Each code shows:
  - Type (building, flat, manager, guard)
  - Max uses
  - Used count (counted on approval, not on request)
  - Remaining uses
  - Status (active, disabled)
- Owner or manager can **disable** a code. A disabled code blocks new join requests only. Existing members stay.
- Owner or manager can **delete** a code.

**Code type permissions:**
- Building code: created by owner. Used by owners to join.
- Flat code: created by owner for a specific flat. Used by tenants.
- Manager code: created by owner from the building portal. Used by the manager.
- Guard code: created by owner or manager. Used by guards.

### 5.5 Join Requests
1. A person enters a code in their app.
2. The app validates the code. If the code is valid, active, and has remaining uses, a join request is created.
3. The request appears to the approver: the owner for owner, tenant, and manager requests; the manager for guard requests.
4. The approver accepts or rejects.
5. On approval, the code's used count increases by 1 and membership is created.
6. On rejection, the code's used count does not change.

**Join request rules:**
- Join approval is mandatory for every role.
- Codes do not grant access on their own.

### 5.6 Direct Messages
- One-to-one only. No group chats.
- Allowed pairs: owner ↔ owner, owner ↔ tenant, owner ↔ manager, tenant ↔ tenant, tenant ↔ manager, manager ↔ manager (not applicable, one manager per building).
- Guards cannot send or receive messages.
- Messages are stored as part of the building record.

### 5.7 Removing Members
- Owner can remove tenants and the manager.
- Manager can remove guards.
- Removed members lose access to the building immediately.
- Removed members' messages remain in chats, labeled "Former member."

### 5.8 Leaving and Deleting Accounts
- Any member can leave a building or delete their account.
- Every exit requires a **typed-name confirmation**.
- Leaving a building: the member loses access to that building. Their messages remain, labeled "Former member."
- Deleting an account: the account is removed. Their messages remain, labeled "Deleted account." This applies to all buildings the account was in.
- Deleting an account affects only the buildings it belongs to. Other buildings are untouched.
- **Last-owner warning:** if the leaving or deleting member is the only owner of a building, the app shows an extra warning that the building, all its flats, managers, guards, and messages will be permanently deleted.

### 5.9 Owner Leaving or Deleting (Multi-Owner Building)
- The building stays.
- Flats owned by the leaving owner lose their tenants' access.
- The flats themselves become unclaimed records. They stay in the building until a new owner claims them.
- The leaving owner's messages remain, labeled per Section 5.8.

### 5.10 Last Owner Leaving or Deleting
- The building is permanently deleted.
- This deletes: all flats, all managers, all guards, all memberships, all codes, all join requests, and all messages.
- No grace period. No cancel window. No recovery.
- Typed-name confirmation and the last-owner warning are required.

### 5.11 Unclaimed Flats
- A flat becomes unclaimed when its owner leaves or deletes their account, and the building still has other owners.
- An unclaimed flat stays in the building. Its tenants lose access (see 5.9).
- Another owner in the building can claim it.
- Unclaimed flats are deleted when the building is deleted.

### 5.12 Building Switching (Owner)
- An owner with multiple buildings selects one as the active building in the portal.
- Griho Home shows the building name on every screen, not only in the switcher.

### 5.13 Manager
- One manager per building.
- The manager joins through a manager code created by the owner.
- The manager runs day-to-day operations in Griho Stuff, including generating guard codes and approving guard requests.

### 5.14 Guard
- Joins through a guard code.
- Gets an account linked to the building.
- No features, no messaging, no other actions in v1.

---

## 6. Permissions Matrix

| Action | Owner | Tenant | Manager | Guard |
|---|---|---|---|---|
| Create building | ✅ | ❌ | ❌ | ❌ |
| Add and manage flats | ✅ | ❌ | ❌ | ❌ |
| Create manager code | ✅ | ❌ | ❌ | ❌ |
| Create flat code | ✅ | ❌ | ❌ | ❌ |
| Create guard code | ✅ | ❌ | ✅ | ❌ |
| Create building code | ✅ | ❌ | ❌ | ❌ |
| View code list | ✅ | ❌ | ✅ | ❌ |
| Disable or delete code | ✅ | ❌ | ✅ | ❌ |
| Approve join requests (owner, tenant, manager) | ✅ | ❌ | ❌ | ❌ |
| Approve join requests (guard) | ❌ | ❌ | ✅ | ❌ |
| Remove tenant | ✅ | ❌ | ❌ | ❌ |
| Remove manager | ✅ | ❌ | ❌ | ❌ |
| Remove guard | ❓ Open | ❌ | ✅ | ❌ |
| Send and receive DMs | ✅ | ✅ | ✅ | ❌ |
| Switch active building | ✅ | ❌ | ❌ | ❌ |
| Leave building or delete account | ✅ | ✅ | ✅ | ✅ |

---

## 7. Business Rules

1. Codes are never auto-generated. Owner or manager triggers creation.
2. A code's max-use value is set at creation. A value of 1 is single use.
3. Used count increases only on approval.
4. Rejected join requests do not consume a code slot.
5. Disabling a code blocks new join requests only.
6. Deleting a code removes it. Existing members stay.
7. A flat has at most one owner account at a time.
8. A building has at most one manager at a time.
9. Co-owned flats are not supported.
10. Buildings cannot be deleted manually. Deletion happens only when the last owner leaves or deletes.
11. Messages belong to the building and are deleted with it.
12. Guards cannot send or receive messages.
13. All exits (leave, remove, delete) require typed-name confirmation.
14. Removed or left members show as "Former member." Deleted accounts show as "Deleted account."
15. The building name is visible on every screen in Griho Home.

---

## 8. Labels and Display

| Situation | Label shown in chat |
|---|---|
| Member removed from building | Former member |
| Member left building | Former member |
| Member deleted their account | Deleted account |
| Member who was "Former member" later deletes their account | Deleted account |

---

## 9. Data Retention and Deletion

| Event | What is deleted | What stays |
|---|---|---|
| Member leaves or is removed | Their access to the building | Their messages (label: Former member) |
| Member deletes account | Account and access to all buildings | Their messages (label: Deleted account) |
| Owner leaves in multi-owner building | Owner's access, tenants' access to the owner's flats | Building, other flats, messages |
| Last owner leaves or deletes | Building, flats, managers, guards, codes, join requests, messages | Nothing |
| Flat owner account deleted (multi-owner building) | Owner's access | Flat record (unclaimed), tenants lose access |

---

## 10. Success Metrics (Suggested, Not Confirmed)

- New owner creates a building and gets its code in under 5 minutes.
- Tenant joins a flat and sends a first message in the same session.
- 100% of exits (leave, remove, delete) require typed-name confirmation.
- Zero messages visible across different buildings.

---

## 11. Out of Scope (MVP)

- Group chats and announcements
- Guard messaging and guard features
- Co-owned flats
- Manual building deletion
- Message grace periods, recovery, or export
- Any feature not listed in Section 5

---

## 12. Open Questions

### Confirmed open (parked for team discussion)
1. When a manager leaves or is removed, do their guards also get removed?
2. Can owners remove guards, or only the manager?

### Unresolved gaps (not yet decided, must be answered before build)
3. **Pending requests on exit:** what happens to pending join requests when the approver leaves, is removed, or the building is deleted?
4. **Manager vacancy:** when the manager leaves or is removed, who generates guard codes until a new manager joins? Can the owner appoint a new manager directly?
5. **Unclaimed flat claim:** when a new owner claims an unclaimed flat, do its previous tenants remain? (Their access was revoked on owner exit, so they would need to rejoin.)
6. **Tenant re-joining:** after a tenant is removed, can they rejoin the same flat using the same code if uses remain? Is there a cooldown or a block list?
7. **Tenant in multiple flats:** can one tenant account hold more than one flat in the same building?
8. **Starting a DM:** how does a member find another member to message? Is there a member directory? Does it show all roles, or only some?
9. **Guard messaging direction:** guards are blocked from sending and receiving. Confirm both directions.
10. **Message features:** are edit, delete-for-me, delete-for-everyone, read receipts, or media attachments in MVP? Not discussed yet.
11. **Blocking and reporting:** is there a way to block a member or report abuse? Not discussed yet, and it matters for a building full of strangers.
12. **Notifications:** do members get push notifications for new messages and join request outcomes? Not discussed yet.
13. **Code expiry:** do codes expire by time, or only by use count?
14. **Owner transfer:** can an owner hand over a building to another owner without leaving?
15. **Building details:** which fields are required at creation (address, total flats, contact info)? Not defined yet.

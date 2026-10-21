// apps/home/src/api/fake/fakeMembers.ts
//
// The part of the PRETEND KITCHEN that deals with PEOPLE COMING AND GOING
// (docs/api-contract.md, 4.5 and 4.6, and delete_account in 4.1):
//   - joining: submitJoinRequest, listMyJoinRequests, listPendingJoinRequests,
//     decideJoinRequest
//   - people: listMembers, listGuards, removeMember
//   - leaving: leaveBuilding, deleteAccount
// It follows the same rules as the real backend will:
//   - a code's used count goes up ONLY when a request is approved (PRD 5.5)
//   - the first answer to a request wins
//   - every exit needs the typed name, ignoring capital letters and spaces
//   - an owner who leaves a building with other owners leaves their flats
//     unclaimed, and those flats' tenants lose access (PRD 5.9)
//   - the last owner leaving deletes the whole building (PRD 5.10)
// fakeApi.ts wraps each dish below so it waits a moment like a real network call.
// Owned by Bishal.

import type { ErrorCode, MemberListItem, Role } from '@griho/shared';
import type {
  DecideJoinRequestResult,
  DeleteAccountResult,
  LeaveBuildingResult,
  Ok,
  SubmitJoinRequestResult,
} from '../api';
import type {
  AccountRecord,
  CodeRecord,
  FakeDatabase,
  JoinRequestRecord,
  MembershipRecord,
} from './fakeDatabase';
import { makeId } from './fakeDatabase';

/** What this file needs from the main pretend kitchen. */
export type MemberContext = {
  db: FakeDatabase;
  requireMe: () => AccountRecord;
  myMembership: (accountId: string, buildingId: string) => MembershipRecord | undefined;
  countActiveOwners: (buildingId: string) => number;
};

/** The rate limit on typing codes: 8 tries per 10 minutes per account (contract 4.5). */
const MAX_CODE_TRIES = 8;
const CODE_TRY_WINDOW_MS = 10 * 60 * 1000;

function fail(code: ErrorCode): never {
  throw new Error(code);
}

/** Makes two names comparable: "Rahim" and " rahim " match (contract 2.6). */
function nameKey(name: string): string {
  return name.trim().toLowerCase();
}

/** Which role a code gives the person who uses it. */
function roleOfCode(code: CodeRecord): Role {
  switch (code.type) {
    case 'building':
      return 'owner';
    case 'flat':
      return 'tenant';
    case 'manager':
      return 'manager';
    case 'guard':
      return 'guard';
  }
}

export function createMemberDishes(ctx: MemberContext) {
  const { db, requireMe, myMembership, countActiveOwners } = ctx;

  function hasActiveManager(buildingId: string): boolean {
    return db.memberships.some(
      (m) => m.buildingId === buildingId && m.role === 'manager' && m.status === 'active',
    );
  }

  /** Which requests can this member answer? Owners: owner, tenant and manager requests (and guard ones with no manager). The manager: guard requests. */
  function canAnswerRole(approver: MembershipRecord, requestRole: Role): boolean {
    if (approver.role === 'owner') {
      return requestRole !== 'guard' || !hasActiveManager(approver.buildingId);
    }
    if (approver.role === 'manager') return requestRole === 'guard';
    return false;
  }

  function flatLabelOf(flatId: string | null): string | null {
    return db.flats.find((f) => f.id === flatId)?.label ?? null;
  }

  function accountName(accountId: string): string {
    return db.accounts.find((a) => a.id === accountId)?.displayName ?? 'Someone';
  }

  // ---- Joining (contract 4.5) ---------------------------------------------

  function submitJoinRequest({ code_value }: { code_value: string }): SubmitJoinRequestResult {
    const me = requireMe();

    // Rate limit: too many tries in a short time, right or wrong.
    const now = Date.now();
    db.joinAttempts = db.joinAttempts.filter((a) => now - a.at < CODE_TRY_WINDOW_MS);
    const myTries = db.joinAttempts.filter((a) => a.accountId === me.id).length;
    if (myTries >= MAX_CODE_TRIES) fail('TOO_MANY_ATTEMPTS');
    db.joinAttempts.push({ accountId: me.id, at: now });

    // One error for "does not exist", "turned off" and "deleted", so nobody can guess codes.
    const wanted = nameKey(code_value);
    const code = db.codes.find((c) => c.value.toLowerCase() === wanted && c.status === 'active');
    if (!code) fail('CODE_NOT_USABLE');

    const role = roleOfCode(code);
    const roleApp = role === 'owner' || role === 'tenant' ? 'home' : 'staff';
    if (me.app !== roleApp) fail('WRONG_APP');
    if (code.usedCount >= code.maxUses) fail('CODE_USED_UP');
    if (myMembership(me.id, code.buildingId)) fail('ALREADY_MEMBER');
    if (
      db.joinRequests.some(
        (r) => r.requesterAccountId === me.id && r.codeId === code.id && r.status === 'pending',
      )
    ) {
      fail('ALREADY_PENDING');
    }
    if (role === 'manager' && hasActiveManager(code.buildingId)) fail('MANAGER_SLOT_TAKEN');

    // The role and the flat come from the code, never from the person. Nothing is used up yet.
    const request: JoinRequestRecord = {
      id: makeId(db, 'req'),
      codeId: code.id,
      buildingId: code.buildingId,
      requesterAccountId: me.id,
      role,
      flatId: code.flatId,
      status: 'pending',
      decidedByAccountId: null,
      createdAt: new Date().toISOString(),
    };
    db.joinRequests.push(request);
    return {
      request_id: request.id,
      building_name: db.buildings.find((b) => b.id === code.buildingId)?.name ?? '',
      role,
      flat_label: flatLabelOf(code.flatId),
      status: 'pending',
    };
  }

  function listMyJoinRequests() {
    const me = requireMe();
    return db.joinRequests
      .filter((r) => r.requesterAccountId === me.id)
      .map((r) => ({
        request_id: r.id,
        status: r.status,
        building: {
          id: r.buildingId,
          name: db.buildings.find((b) => b.id === r.buildingId)?.name ?? '',
        },
        role: r.role,
        flat_label: flatLabelOf(r.flatId),
        created_at: r.createdAt,
      }))
      .reverse(); // Newest first.
  }

  function listPendingJoinRequests({ building_id }: { building_id: string }) {
    const me = requireMe();
    const approver = myMembership(me.id, building_id);
    if (!approver || (approver.role !== 'owner' && approver.role !== 'manager')) {
      fail('NOT_ALLOWED');
    }
    return db.joinRequests
      .filter(
        (r) =>
          r.buildingId === building_id && r.status === 'pending' && canAnswerRole(approver, r.role),
      )
      .map((r) => ({
        request_id: r.id,
        requester_name: accountName(r.requesterAccountId),
        role: r.role,
        flat_label: flatLabelOf(r.flatId),
        created_at: r.createdAt,
      })); // Oldest first: the one that has waited longest is at the top.
  }

  function decideJoinRequest({
    request_id,
    decision,
  }: {
    request_id: string;
    decision: 'approve' | 'reject';
  }): DecideJoinRequestResult {
    const me = requireMe();
    const request = db.joinRequests.find((r) => r.id === request_id);
    if (!request) fail('NOT_FOUND');
    const approver = myMembership(me.id, request.buildingId);
    if (!approver) fail('NOT_FOUND'); // Do not reveal requests of other buildings.
    if (!canAnswerRole(approver, request.role)) fail('NOT_ALLOWED');
    // The first answer wins. Everybody else is told it has been answered.
    if (request.status !== 'pending') fail('REQUEST_ALREADY_DECIDED');

    if (decision === 'reject') {
      request.status = 'rejected';
      request.decidedByAccountId = me.id; // Nothing is used up.
      return { request_id: request.id, status: 'rejected' };
    }

    // Approving happens in one step: check, count the use, make the membership.
    const code = db.codes.find((c) => c.id === request.codeId);
    if (!code || code.usedCount >= code.maxUses) fail('CODE_USED_UP');
    if (request.role === 'manager' && hasActiveManager(request.buildingId))
      fail('MANAGER_SLOT_TAKEN');
    if (myMembership(request.requesterAccountId, request.buildingId)) {
      fail(request.role === 'tenant' ? 'TENANT_ALREADY_HAS_FLAT' : 'ALREADY_MEMBER');
    }
    code.usedCount += 1;
    db.memberships.push({
      id: makeId(db, 'mem'),
      accountId: request.requesterAccountId,
      buildingId: request.buildingId,
      role: request.role,
      flatId: request.role === 'tenant' ? request.flatId : null,
      status: 'active',
    });
    request.status = 'approved';
    request.decidedByAccountId = me.id;
    return { request_id: request.id, status: 'approved' };
  }

  // ---- People (contract 4.6) ----------------------------------------------

  function listMembers({ building_id }: { building_id: string }): MemberListItem[] {
    const me = requireMe();
    const mine = myMembership(me.id, building_id);
    if (!mine) fail('NOT_A_MEMBER');
    if (mine.role === 'guard') fail('NOT_ALLOWED'); // Guards have no member list.
    const order: Record<Role, number> = { owner: 0, manager: 1, tenant: 2, guard: 3 };
    return db.memberships
      .filter(
        (m) =>
          m.buildingId === building_id &&
          m.status === 'active' &&
          m.role !== 'guard' &&
          m.accountId !== me.id,
      )
      .sort(
        (a, b) =>
          order[a.role] - order[b.role] ||
          accountName(a.accountId).localeCompare(accountName(b.accountId)),
      )
      .map((m) => ({
        account_id: m.accountId,
        membership_id: m.id,
        display_name: accountName(m.accountId),
        role: m.role,
        flat_label: flatLabelOf(m.flatId),
      }));
  }

  function listGuards({ building_id }: { building_id: string }): MemberListItem[] {
    const me = requireMe();
    const mine = myMembership(me.id, building_id);
    if (!mine) fail('NOT_A_MEMBER');
    if (mine.role !== 'owner' && mine.role !== 'manager') fail('NOT_ALLOWED');
    return db.memberships
      .filter((m) => m.buildingId === building_id && m.status === 'active' && m.role === 'guard')
      .map((m) => ({
        account_id: m.accountId,
        membership_id: m.id,
        display_name: accountName(m.accountId),
        role: m.role,
        flat_label: null,
      }));
  }

  function removeMember({
    membership_id,
    typed_name,
  }: {
    membership_id: string;
    typed_name: string;
  }): Ok {
    const me = requireMe();
    const target = db.memberships.find((m) => m.id === membership_id && m.status === 'active');
    if (!target) fail('NOT_FOUND');
    const mine = myMembership(me.id, target.buildingId);
    if (!mine) fail('NOT_FOUND'); // Do not reveal people of other buildings.
    // Owners remove tenants, the manager and guards. The manager removes guards. Nobody removes an owner.
    const allowed =
      (mine.role === 'owner' && target.role !== 'owner') ||
      (mine.role === 'manager' && target.role === 'guard');
    if (!allowed) fail('NOT_ALLOWED');
    // The typed name must be the name of the person being removed.
    if (nameKey(typed_name) !== nameKey(accountName(target.accountId))) fail('TYPED_NAME_MISMATCH');
    target.status = 'removed';
    return { ok: true };
  }

  // ---- Leaving (contract 4.6) and deleting my account (contract 4.1) ------

  /** Deletes a building and everything inside it, for good. No undo (PRD 5.10). */
  function deleteBuilding(buildingId: string) {
    const conversationIds = db.conversations
      .filter((c) => c.buildingId === buildingId)
      .map((c) => c.id);
    db.messages = db.messages.filter((m) => !conversationIds.includes(m.conversationId));
    db.conversations = db.conversations.filter((c) => c.buildingId !== buildingId);
    db.joinRequests = db.joinRequests.filter((r) => r.buildingId !== buildingId);
    db.codes = db.codes.filter((c) => c.buildingId !== buildingId);
    db.memberships = db.memberships.filter((m) => m.buildingId !== buildingId);
    db.flats = db.flats.filter((f) => f.buildingId !== buildingId);
    db.buildings = db.buildings.filter((b) => b.id !== buildingId);
  }

  /** Applies the leave rules for one membership. Says what happened. */
  function applyLeave(membership: MembershipRecord): LeaveBuildingResult['result'] {
    if (membership.role !== 'owner') {
      membership.status = 'left';
      return 'left';
    }
    if (countActiveOwners(membership.buildingId) <= 1) {
      deleteBuilding(membership.buildingId); // The last owner: everything goes.
      return 'building_deleted';
    }
    // Other owners remain: my flats become unclaimed and their tenants lose access.
    const myFlatIds = db.flats
      .filter(
        (f) => f.buildingId === membership.buildingId && f.ownerAccountId === membership.accountId,
      )
      .map((f) => f.id);
    for (const flat of db.flats) {
      if (myFlatIds.includes(flat.id)) flat.ownerAccountId = null;
    }
    for (const m of db.memberships) {
      if (
        m.role === 'tenant' &&
        m.status === 'active' &&
        m.flatId &&
        myFlatIds.includes(m.flatId)
      ) {
        m.status = 'removed';
      }
    }
    membership.status = 'left';
    return 'left';
  }

  function leaveBuilding({
    building_id,
    typed_name,
  }: {
    building_id: string;
    typed_name: string;
  }): LeaveBuildingResult {
    const me = requireMe();
    const mine = myMembership(me.id, building_id);
    if (!mine) fail('NOT_A_MEMBER');
    if (nameKey(typed_name) !== nameKey(me.displayName)) fail('TYPED_NAME_MISMATCH');
    return { result: applyLeave(mine) };
  }

  function deleteAccount({ typed_name }: { typed_name: string }): DeleteAccountResult {
    const me = requireMe();
    if (nameKey(typed_name) !== nameKey(me.displayName)) fail('TYPED_NAME_MISMATCH');
    let buildingsDeleted = 0;
    const mine = db.memberships.filter((m) => m.accountId === me.id && m.status === 'active');
    for (const membership of mine) {
      if (applyLeave(membership) === 'building_deleted') buildingsDeleted += 1;
    }
    // Requests I sent that are still waiting are cancelled.
    for (const request of db.joinRequests) {
      if (request.requesterAccountId === me.id && request.status === 'pending') {
        request.status = 'cancelled';
      }
    }
    // The account stays as a "Deleted account" marker; the person's details are wiped.
    me.deleted = true;
    me.email = `deleted-${me.id}@deleted.invalid`;
    me.displayName = 'Deleted account';
    db.pushTokens = db.pushTokens.filter((t) => t.accountId !== me.id);
    db.sessionAccountId = null;
    return { ok: true, buildings_deleted: buildingsDeleted };
  }

  return {
    submitJoinRequest,
    listMyJoinRequests,
    listPendingJoinRequests,
    decideJoinRequest,
    listMembers,
    listGuards,
    removeMember,
    leaveBuilding,
    deleteAccount,
  };
}

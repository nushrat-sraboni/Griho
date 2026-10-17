// apps/home/src/api/fake/fakeApi.ts
//
// THE PRETEND KITCHEN. It answers every order on the menu (../api.ts) with
// made-up data, and it follows the same rules as docs/api-contract.md, so a
// wrong order fails with the same CAPITAL-LETTER error code the real backend
// will use.
//
// BATCH 1 (built): login and sign-up, buildings, flats, and codes.
// LATER BATCHES (not built yet): joining and approving, members and leaving,
// and chat. Those dishes throw "FAKE_NOT_BUILT_YET" until their batch lands.
//
// Real-backend details we copy on purpose:
//   - Signing up with an email that is already used fails with the text
//     "User already registered" (Supabase's own words, not one of our codes),
//     so the sign-up screen must handle that case itself.
//   - A wrong email or password fails with "Invalid login credentials".
//   - Signing in works for a Staff account too. The SCREEN must look at
//     `account.app` and sign out, just like the contract says.
//
// Owned by Bishal.

import type { Account, App, Building, CodeInfo, ErrorCode, Flat } from '@griho/shared';
import type { GrihoApi, MembershipWithLastOwner, Ok } from '../api';
import type {
  AccountRecord,
  CodeRecord,
  FakeDatabase,
  FlatRecord,
  MembershipRecord,
} from './fakeDatabase';
import { makeId } from './fakeDatabase';
import { createSeededDatabase } from './seed';

export type FakeApiOptions = {
  /** Which app this pretend kitchen serves. New sign-ups get this tag. Default: 'home'. */
  app?: App;
  /** How long each call "thinks", so loading screens get built properly. Default 300. */
  delayMs?: number;
  /** Pass your own notebook (tests do this). Default: a fresh seeded one. */
  database?: FakeDatabase;
};

const DEFAULT_DELAY_MS = 300;
const CODE_LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Stops the call and sends back one of the contract's error codes. */
function fail(code: ErrorCode): never {
  throw new Error(code);
}

/** The same text with extra spaces at the ends removed. */
function clean(text: string): string {
  return text.trim();
}

/** Makes two labels comparable: "A-1" and " a-1 " are the same flat label. */
function labelKey(label: string): string {
  return clean(label).toLowerCase();
}

function nowIso(): string {
  return new Date().toISOString();
}

export function createFakeApi(options: FakeApiOptions = {}): GrihoApi {
  const app: App = options.app ?? 'home';
  const delayMs = options.delayMs ?? DEFAULT_DELAY_MS;
  const db: FakeDatabase = options.database ?? createSeededDatabase();

  // ---- Small helpers ------------------------------------------------------

  /** Waits a moment, then runs the dish. Any throw becomes a failed answer. */
  function call<Args extends unknown[], Result>(dish: (...args: Args) => Result) {
    return async (...args: Args): Promise<Result> => {
      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
      return dish(...args);
    };
  }

  /** Who is logged in? Fails with NOT_AUTHENTICATED when nobody is. */
  function requireMe(): AccountRecord {
    const me = db.accounts.find((a) => a.id === db.sessionAccountId && !a.deleted);
    if (!me) fail('NOT_AUTHENTICATED');
    return me;
  }

  function toAccount(record: AccountRecord): Account {
    return {
      id: record.id,
      app: record.app,
      display_name: record.displayName,
      email: record.email,
    };
  }

  /** My active membership in a building, or undefined. */
  function myMembership(accountId: string, buildingId: string): MembershipRecord | undefined {
    return db.memberships.find(
      (m) => m.accountId === accountId && m.buildingId === buildingId && m.status === 'active',
    );
  }

  function toBuilding(buildingId: string): Building {
    const record = db.buildings.find((b) => b.id === buildingId);
    if (!record) fail('NOT_FOUND');
    return {
      id: record.id,
      name: record.name,
      address: record.address,
      contact_info: record.contactInfo,
    };
  }

  function toFlat(record: FlatRecord): Flat {
    const owner = db.accounts.find((a) => a.id === record.ownerAccountId);
    return {
      id: record.id,
      building_id: record.buildingId,
      label: record.label,
      owner: owner ? { account_id: owner.id, display_name: owner.displayName } : null,
    };
  }

  function toCodeInfo(record: CodeRecord): CodeInfo {
    const flat = db.flats.find((f) => f.id === record.flatId);
    return {
      id: record.id,
      type: record.type,
      value: record.value,
      flat: flat ? { id: flat.id, label: flat.label } : null,
      max_uses: record.maxUses,
      used_count: record.usedCount,
      remaining: record.maxUses - record.usedCount,
      // Deleted codes are never handed to a screen.
      status: record.status === 'disabled' ? 'disabled' : 'active',
      created_at: record.createdAt,
    };
  }

  /** Makes a join code that no other code uses yet. */
  function makeCodeValue(): string {
    for (;;) {
      let value = '';
      for (let i = 0; i < 8; i += 1) {
        value += CODE_LETTERS[Math.floor(Math.random() * CODE_LETTERS.length)];
      }
      if (!db.codes.some((c) => c.value === value)) return value;
    }
  }

  function countActiveOwners(buildingId: string): number {
    return db.memberships.filter(
      (m) => m.buildingId === buildingId && m.role === 'owner' && m.status === 'active',
    ).length;
  }

  // ---- Account and login (contract 4.1) -----------------------------------

  const signUp: GrihoApi['signUp'] = call(({ email, password, display_name }) => {
    const cleanEmail = clean(email).toLowerCase();
    const cleanName = clean(display_name);
    const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);
    if (!looksLikeEmail || !cleanName || password.length < 6) fail('INVALID_INPUT');
    // The email must be unused in BOTH apps (PRD rule 19).
    if (db.accounts.some((a) => !a.deleted && a.email === cleanEmail)) {
      throw new Error('User already registered');
    }
    const record: AccountRecord = {
      id: makeId(db, 'acc'),
      app,
      displayName: cleanName,
      email: cleanEmail,
      password,
      deleted: false,
    };
    db.accounts.push(record);
    db.sessionAccountId = record.id; // No email check in the MVP: the person is in right away.
    return toAccount(record);
  });

  const signIn: GrihoApi['signIn'] = call(({ email, password }) => {
    const cleanEmail = clean(email).toLowerCase();
    const record = db.accounts.find((a) => !a.deleted && a.email === cleanEmail);
    if (!record || record.password !== password) {
      throw new Error('Invalid login credentials');
    }
    db.sessionAccountId = record.id;
    return toAccount(record);
  });

  const signOut: GrihoApi['signOut'] = call((): Ok => {
    db.sessionAccountId = null;
    return { ok: true };
  });

  const getMyAccount: GrihoApi['getMyAccount'] = call(() => toAccount(requireMe()));

  const registerPushToken: GrihoApi['registerPushToken'] = call(({ token, platform }): Ok => {
    const me = requireMe();
    const known = db.pushTokens.some((t) => t.accountId === me.id && t.token === token);
    if (!known) db.pushTokens.push({ accountId: me.id, token, platform });
    return { ok: true };
  });

  const removePushToken: GrihoApi['removePushToken'] = call(({ token }): Ok => {
    const me = requireMe();
    db.pushTokens = db.pushTokens.filter((t) => !(t.accountId === me.id && t.token === token));
    return { ok: true };
  });

  // ---- Buildings (contract 4.2) -------------------------------------------

  const createBuilding: GrihoApi['createBuilding'] = call(({ name, address, contact_info }) => {
    const me = requireMe();
    if (me.app !== 'home') fail('WRONG_APP');
    const cleanName = clean(name);
    const cleanAddress = clean(address);
    const cleanContact = clean(contact_info);
    if (!cleanName || !cleanAddress || !cleanContact) fail('INVALID_INPUT');

    const building = {
      id: makeId(db, 'bld'),
      name: cleanName,
      address: cleanAddress,
      contactInfo: cleanContact,
    };
    db.buildings.push(building);
    // The person who makes a building becomes its first owner. No codes yet.
    db.memberships.push({
      id: makeId(db, 'mem'),
      accountId: me.id,
      buildingId: building.id,
      role: 'owner',
      flatId: null,
      status: 'active',
    });
    return toBuilding(building.id);
  });

  const getMyMemberships: GrihoApi['getMyMemberships'] = call((): MembershipWithLastOwner[] => {
    const me = requireMe();
    return db.memberships
      .filter((m) => m.accountId === me.id && m.status === 'active')
      .map((m) => {
        const building = toBuilding(m.buildingId);
        const flat = db.flats.find((f) => f.id === m.flatId);
        return {
          membership_id: m.id,
          building: { id: building.id, name: building.name },
          role: m.role,
          flat: flat ? { id: flat.id, label: flat.label } : null,
          is_last_owner: m.role === 'owner' && countActiveOwners(m.buildingId) === 1,
        };
      });
  });

  const getBuilding: GrihoApi['getBuilding'] = call(({ building_id }) => {
    const me = requireMe();
    if (!myMembership(me.id, building_id)) fail('NOT_A_MEMBER');
    return toBuilding(building_id);
  });

  // ---- Flats (contract 4.3) -----------------------------------------------

  /** Fails with NOT_ALLOWED unless I am an owner of this building. */
  function requireOwner(buildingId: string): { me: AccountRecord; membership: MembershipRecord } {
    const me = requireMe();
    const membership = myMembership(me.id, buildingId);
    if (!membership || membership.role !== 'owner') fail('NOT_ALLOWED');
    return { me, membership };
  }

  function labelIsTaken(buildingId: string, label: string, exceptFlatId?: string): boolean {
    return db.flats.some(
      (f) =>
        f.buildingId === buildingId &&
        f.id !== exceptFlatId &&
        labelKey(f.label) === labelKey(label),
    );
  }

  const createFlat: GrihoApi['createFlat'] = call(({ building_id, label }) => {
    const { me } = requireOwner(building_id);
    const cleanLabel = clean(label);
    if (!cleanLabel) fail('INVALID_INPUT');
    if (labelIsTaken(building_id, cleanLabel)) fail('FLAT_LABEL_TAKEN');
    const flat: FlatRecord = {
      id: makeId(db, 'flat'),
      buildingId: building_id,
      label: cleanLabel,
      ownerAccountId: me.id, // The person who adds a flat is its owner. No flat code yet.
    };
    db.flats.push(flat);
    return toFlat(flat);
  });

  const updateFlat: GrihoApi['updateFlat'] = call(({ flat_id, label }) => {
    const me = requireMe();
    const flat = db.flats.find((f) => f.id === flat_id);
    if (!flat) fail('NOT_FOUND');
    if (flat.ownerAccountId !== me.id) fail('NOT_ALLOWED');
    const cleanLabel = clean(label);
    if (!cleanLabel) fail('INVALID_INPUT');
    if (labelIsTaken(flat.buildingId, cleanLabel, flat.id)) fail('FLAT_LABEL_TAKEN');
    flat.label = cleanLabel;
    return toFlat(flat);
  });

  const listFlats: GrihoApi['listFlats'] = call(({ building_id }) => {
    requireOwner(building_id);
    return db.flats
      .filter((f) => f.buildingId === building_id)
      .sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }))
      .map(toFlat);
  });

  const claimFlat: GrihoApi['claimFlat'] = call(({ flat_id }) => {
    const flat = db.flats.find((f) => f.id === flat_id);
    if (!flat) fail('NOT_FOUND');
    const { me } = requireOwner(flat.buildingId);
    if (flat.ownerAccountId !== null) fail('FLAT_NOT_UNCLAIMED');
    // Old tenants are NOT brought back. They must join again (PRD 5.11).
    flat.ownerAccountId = me.id;
    return toFlat(flat);
  });

  // ---- Codes (contract 4.4) -----------------------------------------------

  /** Owners may make any code. The manager may make guard codes only. */
  function requireCodeMaker(buildingId: string, type: CodeRecord['type']): MembershipRecord {
    const me = requireMe();
    const membership = myMembership(me.id, buildingId);
    const allowed =
      !!membership &&
      (membership.role === 'owner' || (membership.role === 'manager' && type === 'guard'));
    if (!membership || !allowed) fail('NOT_ALLOWED');
    return membership;
  }

  const createCode: GrihoApi['createCode'] = call(({ building_id, type, max_uses, flat_id }) => {
    const membership = requireCodeMaker(building_id, type);
    if (!Number.isInteger(max_uses) || max_uses < 1 || max_uses > 1000) fail('INVALID_INPUT');
    if (type === 'flat') {
      const flat = db.flats.find((f) => f.id === flat_id && f.buildingId === building_id);
      if (!flat) fail('INVALID_INPUT'); // A flat code needs a flat of this building.
    } else if (flat_id !== undefined) {
      fail('INVALID_INPUT'); // Only flat codes point at a flat.
    }
    const record: CodeRecord = {
      id: makeId(db, 'code'),
      buildingId: building_id,
      type,
      flatId: type === 'flat' ? (flat_id ?? null) : null,
      value: makeCodeValue(),
      maxUses: max_uses,
      usedCount: 0,
      status: 'active',
      createdByMembershipId: membership.id,
      createdAt: nowIso(),
    };
    db.codes.push(record);
    return toCodeInfo(record);
  });

  const listCodes: GrihoApi['listCodes'] = call(({ building_id }) => {
    const me = requireMe();
    const membership = myMembership(me.id, building_id);
    if (!membership || (membership.role !== 'owner' && membership.role !== 'manager')) {
      fail('NOT_ALLOWED');
    }
    return db.codes
      .filter((c) => c.buildingId === building_id && c.status !== 'deleted')
      .filter((c) => membership.role === 'owner' || c.type === 'guard') // The manager sees guard codes only.
      .map(toCodeInfo)
      .reverse(); // Newest first.
  });

  const setCodeStatus: GrihoApi['setCodeStatus'] = call(({ code_id, status }) => {
    const me = requireMe();
    const code = db.codes.find((c) => c.id === code_id && c.status !== 'deleted');
    if (!code) fail('NOT_FOUND');
    const membership = myMembership(me.id, code.buildingId);
    if (!membership) fail('NOT_FOUND'); // Do not reveal codes of other buildings.
    const allowed =
      membership.role === 'owner' || (membership.role === 'manager' && code.type === 'guard');
    if (!allowed) fail('NOT_ALLOWED');

    if (status === 'deleted') {
      code.status = 'deleted';
      // A request that was still waiting on this code is cancelled.
      for (const request of db.joinRequests) {
        if (request.codeId === code.id && request.status === 'pending')
          request.status = 'cancelled';
      }
      return { ok: true } as Ok;
    }
    // Disabling or deleting blocks NEW requests only. Existing members stay.
    code.status = status;
    return toCodeInfo(code);
  });

  // ---- Not built yet (later batches) --------------------------------------

  /** A dish that is on the menu but whose batch has not been built yet. */
  function notBuilt(name: string) {
    return async (): Promise<never> => {
      throw new Error(`FAKE_NOT_BUILT_YET: ${name}`);
    };
  }

  return {
    signUp,
    signIn,
    signOut,
    getMyAccount,
    registerPushToken,
    removePushToken,
    createBuilding,
    getMyMemberships,
    getBuilding,
    createFlat,
    updateFlat,
    listFlats,
    claimFlat,
    createCode,
    listCodes,
    setCodeStatus,

    // Batch 2: joining, members, leaving.
    deleteAccount: notBuilt('deleteAccount'),
    submitJoinRequest: notBuilt('submitJoinRequest'),
    listMyJoinRequests: notBuilt('listMyJoinRequests'),
    listPendingJoinRequests: notBuilt('listPendingJoinRequests'),
    decideJoinRequest: notBuilt('decideJoinRequest'),
    listMembers: notBuilt('listMembers'),
    listGuards: notBuilt('listGuards'),
    removeMember: notBuilt('removeMember'),
    leaveBuilding: notBuilt('leaveBuilding'),

    // Batch 3: chat.
    getOrCreateConversation: notBuilt('getOrCreateConversation'),
    listConversations: notBuilt('listConversations'),
    getMessages: notBuilt('getMessages'),
    sendMessage: notBuilt('sendMessage'),
    deleteMessage: notBuilt('deleteMessage'),
  };
}

// apps/home/src/api/fake/seed.ts
//
// The made-up starting data for the pretend backend, so a screen has something
// to show on day one. EVERYTHING HERE IS FAKE: the people, the building, the
// passwords. Never put real people's information in this file.
//
// Story:
//   "Green Tower" is a building with two owners (Rahim and Salma), one tenant
//   (Karima, in flat A-2) and one manager (Jamal, who uses the Staff app).
//   Nina has an account but no building yet, and has asked to join flat A-1.
//
// Log in with any email below and the fake password "test1234".
// Owned by Bishal.

import { createEmptyDatabase, type FakeDatabase } from './fakeDatabase';

export const FAKE_PASSWORD = 'test1234';

/** The fake people, so screens and tests can name them without typing ids. */
export const SEED = {
  accounts: {
    rahim: 'acc-rahim',
    salma: 'acc-salma',
    karima: 'acc-karima',
    nina: 'acc-nina',
    jamal: 'acc-jamal',
  },
  emails: {
    rahim: 'rahim@example.com',
    salma: 'salma@example.com',
    karima: 'karima@example.com',
    nina: 'nina@example.com',
    jamal: 'jamal@example.com',
  },
  building: 'bld-green',
  flats: { a1: 'flat-a1', a2: 'flat-a2', b1: 'flat-b1', c1: 'flat-c1' },
  codes: {
    owner: 'code-owner',
    flatA1: 'code-a1',
    manager: 'code-mgr',
    guard: 'code-guard',
    disabled: 'code-old',
    deleted: 'code-gone',
  },
  codeValues: {
    owner: 'GREEN-OWNER',
    flatA1: 'A1-TENANT',
    manager: 'GREEN-MGR',
    guard: 'GREEN-GUARD',
    disabled: 'B1-OLD',
  },
  memberships: {
    rahim: 'mem-rahim',
    salma: 'mem-salma',
    karima: 'mem-karima',
    jamal: 'mem-jamal',
  },
  joinRequestNina: 'req-nina',
  conversationRahimKarima: 'conv-rahim-karima',
} as const;

/** Makes a fresh notebook filled with the made-up story above. */
export function createSeededDatabase(): FakeDatabase {
  const db = createEmptyDatabase();
  const { accounts, emails, flats, codes, memberships } = SEED;

  db.accounts.push(
    {
      id: accounts.rahim,
      app: 'home',
      displayName: 'Rahim',
      email: emails.rahim,
      password: FAKE_PASSWORD,
      deleted: false,
    },
    {
      id: accounts.salma,
      app: 'home',
      displayName: 'Salma',
      email: emails.salma,
      password: FAKE_PASSWORD,
      deleted: false,
    },
    {
      id: accounts.karima,
      app: 'home',
      displayName: 'Karima',
      email: emails.karima,
      password: FAKE_PASSWORD,
      deleted: false,
    },
    {
      id: accounts.nina,
      app: 'home',
      displayName: 'Nina',
      email: emails.nina,
      password: FAKE_PASSWORD,
      deleted: false,
    },
    {
      id: accounts.jamal,
      app: 'staff',
      displayName: 'Jamal',
      email: emails.jamal,
      password: FAKE_PASSWORD,
      deleted: false,
    },
  );

  db.buildings.push({
    id: SEED.building,
    name: 'Green Tower',
    address: '12 Lake Road',
    contactInfo: '01700000000',
  });

  db.flats.push(
    { id: flats.a1, buildingId: SEED.building, label: 'A-1', ownerAccountId: accounts.rahim },
    { id: flats.a2, buildingId: SEED.building, label: 'A-2', ownerAccountId: accounts.rahim },
    { id: flats.b1, buildingId: SEED.building, label: 'B-1', ownerAccountId: accounts.salma },
    // An unclaimed flat, so the "claim a flat" screen has something to show.
    { id: flats.c1, buildingId: SEED.building, label: 'C-1', ownerAccountId: null },
  );

  db.memberships.push(
    {
      id: memberships.rahim,
      accountId: accounts.rahim,
      buildingId: SEED.building,
      role: 'owner',
      flatId: null,
      status: 'active',
    },
    {
      id: memberships.salma,
      accountId: accounts.salma,
      buildingId: SEED.building,
      role: 'owner',
      flatId: null,
      status: 'active',
    },
    {
      id: memberships.karima,
      accountId: accounts.karima,
      buildingId: SEED.building,
      role: 'tenant',
      flatId: flats.a2,
      status: 'active',
    },
    {
      id: memberships.jamal,
      accountId: accounts.jamal,
      buildingId: SEED.building,
      role: 'manager',
      flatId: null,
      status: 'active',
    },
  );

  db.codes.push(
    // Some uses left.
    {
      id: codes.owner,
      buildingId: SEED.building,
      type: 'building',
      flatId: null,
      value: SEED.codeValues.owner,
      maxUses: 5,
      usedCount: 2,
      status: 'active',
      createdByMembershipId: memberships.rahim,
      createdAt: '2026-10-01T09:00:00Z',
    },
    // Fresh flat code, used by Nina's pending request.
    {
      id: codes.flatA1,
      buildingId: SEED.building,
      type: 'flat',
      flatId: flats.a1,
      value: SEED.codeValues.flatA1,
      maxUses: 1,
      usedCount: 0,
      status: 'active',
      createdByMembershipId: memberships.rahim,
      createdAt: '2026-10-02T09:00:00Z',
    },
    // Already used up.
    {
      id: codes.manager,
      buildingId: SEED.building,
      type: 'manager',
      flatId: null,
      value: SEED.codeValues.manager,
      maxUses: 1,
      usedCount: 1,
      status: 'active',
      createdByMembershipId: memberships.rahim,
      createdAt: '2026-10-03T09:00:00Z',
    },
    {
      id: codes.guard,
      buildingId: SEED.building,
      type: 'guard',
      flatId: null,
      value: SEED.codeValues.guard,
      maxUses: 3,
      usedCount: 0,
      status: 'active',
      createdByMembershipId: memberships.jamal,
      createdAt: '2026-10-04T09:00:00Z',
    },
    // Turned off by an owner.
    {
      id: codes.disabled,
      buildingId: SEED.building,
      type: 'flat',
      flatId: flats.b1,
      value: SEED.codeValues.disabled,
      maxUses: 2,
      usedCount: 1,
      status: 'disabled',
      createdByMembershipId: memberships.salma,
      createdAt: '2026-10-05T09:00:00Z',
    },
    // Deleted: it must never show up in any list.
    {
      id: codes.deleted,
      buildingId: SEED.building,
      type: 'guard',
      flatId: null,
      value: 'GUARD-GONE',
      maxUses: 1,
      usedCount: 0,
      status: 'deleted',
      createdByMembershipId: memberships.jamal,
      createdAt: '2026-10-06T09:00:00Z',
    },
  );

  db.joinRequests.push({
    id: SEED.joinRequestNina,
    codeId: codes.flatA1,
    buildingId: SEED.building,
    requesterAccountId: accounts.nina,
    role: 'tenant',
    flatId: flats.a1,
    status: 'pending',
    decidedByAccountId: null,
    createdAt: '2026-10-07T09:00:00Z',
  });

  db.conversations.push({
    id: SEED.conversationRahimKarima,
    buildingId: SEED.building,
    accountAId: accounts.rahim,
    accountBId: accounts.karima,
  });

  db.messages.push(
    {
      id: 'msg-1',
      conversationId: SEED.conversationRahimKarima,
      buildingId: SEED.building,
      senderAccountId: accounts.karima,
      body: 'Hello! The water tap in A-2 is leaking.',
      deleted: false,
      createdAt: '2026-10-08T08:00:00Z',
    },
    {
      id: 'msg-2',
      conversationId: SEED.conversationRahimKarima,
      buildingId: SEED.building,
      senderAccountId: accounts.rahim,
      body: 'Thanks for telling me. I will send a plumber tomorrow.',
      deleted: false,
      createdAt: '2026-10-08T08:05:00Z',
    },
    // A message its sender deleted: screens show "Message deleted".
    {
      id: 'msg-3',
      conversationId: SEED.conversationRahimKarima,
      buildingId: SEED.building,
      senderAccountId: accounts.karima,
      body: null,
      deleted: true,
      createdAt: '2026-10-08T08:06:00Z',
    },
    {
      id: 'msg-4',
      conversationId: SEED.conversationRahimKarima,
      buildingId: SEED.building,
      senderAccountId: accounts.karima,
      body: 'Great, thank you!',
      deleted: false,
      createdAt: '2026-10-08T08:07:00Z',
    },
  );

  db.nextNumber = 100; // New ids start at 100, so they never clash with the ones above.
  return db;
}

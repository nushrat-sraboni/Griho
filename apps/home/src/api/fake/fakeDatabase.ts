// apps/home/src/api/fake/fakeDatabase.ts
//
// THE PRETEND NOTEBOOK. A real database is like a giant school notebook with
// neat rows. This file describes what one row of each page looks like, and
// makes an empty notebook. It lives only in the phone's memory, so everything
// is forgotten when the app restarts (a clean start every time).
//
// The row shapes here are the fake backend's own, private shapes. They are NOT
// what screens see. Screens only see the shapes in @griho/shared.
// Owned by Bishal.

import type { App, CodeStatus, CodeType, Role } from '@griho/shared';

export type AccountRecord = {
  id: string;
  app: App;
  displayName: string;
  email: string;
  /** FAKE password, kept in plain words because this is only pretend data. */
  password: string;
  /** True after the account was deleted. The row stays so old chats can say "Deleted account". */
  deleted: boolean;
};

export type BuildingRecord = {
  id: string;
  name: string;
  address: string;
  contactInfo: string;
};

export type FlatRecord = {
  id: string;
  buildingId: string;
  label: string;
  /** null means the flat is unclaimed. */
  ownerAccountId: string | null;
};

export type MembershipRecord = {
  id: string;
  accountId: string;
  buildingId: string;
  role: Role;
  /** Only tenants have a flat. */
  flatId: string | null;
  status: 'active' | 'left' | 'removed';
};

export type CodeRecord = {
  id: string;
  buildingId: string;
  type: CodeType;
  flatId: string | null;
  value: string;
  maxUses: number;
  usedCount: number;
  status: CodeStatus;
  createdByMembershipId: string;
  createdAt: string;
};

export type JoinRequestRecord = {
  id: string;
  codeId: string;
  buildingId: string;
  requesterAccountId: string;
  role: Role;
  flatId: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  decidedByAccountId: string | null;
  createdAt: string;
};

export type ConversationRecord = {
  id: string;
  buildingId: string;
  accountAId: string;
  accountBId: string;
};

export type MessageRecord = {
  id: string;
  conversationId: string;
  buildingId: string;
  senderAccountId: string;
  /** null once the sender deleted the message. */
  body: string | null;
  deleted: boolean;
  createdAt: string;
};

export type PushTokenRecord = {
  accountId: string;
  token: string;
  platform: 'ios' | 'android';
};

export type FakeDatabase = {
  accounts: AccountRecord[];
  buildings: BuildingRecord[];
  flats: FlatRecord[];
  memberships: MembershipRecord[];
  codes: CodeRecord[];
  joinRequests: JoinRequestRecord[];
  conversations: ConversationRecord[];
  messages: MessageRecord[];
  pushTokens: PushTokenRecord[];
  /** Who is logged in right now. null means nobody. */
  sessionAccountId: string | null;
  /** A counter that makes sure every new id is different. */
  nextNumber: number;
};

/** Makes a new, empty notebook. */
export function createEmptyDatabase(): FakeDatabase {
  return {
    accounts: [],
    buildings: [],
    flats: [],
    memberships: [],
    codes: [],
    joinRequests: [],
    conversations: [],
    messages: [],
    pushTokens: [],
    sessionAccountId: null,
    nextNumber: 1,
  };
}

/** Gives out a fresh id such as "bld-1" or "flat-2". */
export function makeId(db: FakeDatabase, prefix: string): string {
  const id = `${prefix}-${db.nextNumber}`;
  db.nextNumber += 1;
  return id;
}

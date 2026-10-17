// apps/home/src/api/api.ts
//
// THE MENU. This file lists every "dish" the backend promises to cook, exactly
// as written in docs/api-contract.md (Sections 3 and 4). Screens only ever talk
// to this menu, never to a particular kitchen. Today the kitchen is a pretend
// one (see ./fake/fakeApi.ts). Later it will be the real backend, and the
// screens will not need to change.
//
// How the calls behave:
//   - Every call is async (it returns a Promise, which is "an answer that
//     arrives a moment later").
//   - When something is wrong the call THROWS an Error whose `message` is one of
//     the CAPITAL-LETTER codes from @griho/shared (for example CODE_USED_UP).
//     Use getErrorCode(error) from @griho/shared to read it, then show a
//     friendly sentence. Never show the raw code to a person.
//   - Input names are snake_case, exactly like the contract.
//
// Owned by Bishal. Asked of Shafin: please confirm the real wrappers in
// packages/shared use this same style (one object of inputs per call).

import type {
  Account,
  Building,
  CodeInfo,
  CodeStatus,
  CodeType,
  ConversationItem,
  Flat,
  JoinRequest,
  MemberListItem,
  Message,
  MyMembership,
  PendingRequestForApprover,
  Role,
} from '@griho/shared';

/** The plain "it worked" answer. */
export type Ok = { ok: true };

/** A membership plus a flag that says "I am the only owner of this building". */
export type MembershipWithLastOwner = MyMembership & { is_last_owner: boolean };

export type SubmitJoinRequestResult = {
  request_id: string;
  building_name: string;
  role: Role;
  flat_label: string | null;
  status: 'pending';
};

export type DecideJoinRequestResult = {
  request_id: string;
  status: 'approved' | 'rejected';
};

export type LeaveBuildingResult = { result: 'left' | 'building_deleted' };

export type DeleteAccountResult = { ok: true; buildings_deleted: number };

export interface GrihoApi {
  // ---- Account and login (contract 4.1) -----------------------------------

  /** Make an account in this app and log in straight away. */
  signUp(input: { email: string; password: string; display_name: string }): Promise<Account>;
  /** Log in. The screen must check `account.app` and sign out on a wrong app. */
  signIn(input: { email: string; password: string }): Promise<Account>;
  signOut(): Promise<Ok>;
  /** Who am I, and which app is my account for? */
  getMyAccount(): Promise<Account>;
  registerPushToken(input: { token: string; platform: 'ios' | 'android' }): Promise<Ok>;
  removePushToken(input: { token: string }): Promise<Ok>;
  /** Permanently delete my account (applies the leave rules to every building). */
  deleteAccount(input: { typed_name: string }): Promise<DeleteAccountResult>;

  // ---- Buildings (contract 4.2) -------------------------------------------

  createBuilding(input: { name: string; address: string; contact_info: string }): Promise<Building>;
  /** All the buildings I belong to (for the building switcher). */
  getMyMemberships(): Promise<MembershipWithLastOwner[]>;
  getBuilding(input: { building_id: string }): Promise<Building>;

  // ---- Flats (contract 4.3) -----------------------------------------------

  createFlat(input: { building_id: string; label: string }): Promise<Flat>;
  updateFlat(input: { flat_id: string; label: string }): Promise<Flat>;
  listFlats(input: { building_id: string }): Promise<Flat[]>;
  claimFlat(input: { flat_id: string }): Promise<Flat>;

  // ---- Codes (contract 4.4) -----------------------------------------------

  createCode(input: {
    building_id: string;
    type: CodeType;
    max_uses: number;
    flat_id?: string;
  }): Promise<CodeInfo>;
  listCodes(input: { building_id: string }): Promise<CodeInfo[]>;
  /** Turn a code off, back on, or delete it. Deleting answers with `{ ok: true }`. */
  setCodeStatus(input: { code_id: string; status: CodeStatus }): Promise<CodeInfo | Ok>;

  // ---- Joining (contract 4.5) ---------------------------------------------

  submitJoinRequest(input: { code_value: string }): Promise<SubmitJoinRequestResult>;
  listMyJoinRequests(): Promise<JoinRequest[]>;
  listPendingJoinRequests(input: { building_id: string }): Promise<PendingRequestForApprover[]>;
  decideJoinRequest(input: {
    request_id: string;
    decision: 'approve' | 'reject';
  }): Promise<DecideJoinRequestResult>;

  // ---- Members (contract 4.6) ---------------------------------------------

  listMembers(input: { building_id: string }): Promise<MemberListItem[]>;
  listGuards(input: { building_id: string }): Promise<MemberListItem[]>;
  removeMember(input: { membership_id: string; typed_name: string }): Promise<Ok>;
  leaveBuilding(input: { building_id: string; typed_name: string }): Promise<LeaveBuildingResult>;

  // ---- Direct messages (contract 4.7) -------------------------------------

  getOrCreateConversation(input: {
    building_id: string;
    other_account_id: string;
  }): Promise<{ conversation_id: string }>;
  listConversations(input: { building_id: string }): Promise<ConversationItem[]>;
  getMessages(input: {
    conversation_id: string;
    before?: string;
    limit?: number;
  }): Promise<Message[]>;
  sendMessage(input: { conversation_id: string; body: string }): Promise<Message>;
  deleteMessage(input: { message_id: string }): Promise<Ok>;
}

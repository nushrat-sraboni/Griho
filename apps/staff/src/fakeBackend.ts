// apps/staff/src/fakeBackend.ts
//
// A pretend backend for Griho Staff. A "backend" is the hidden part of the app
// that stores information. This one keeps accounts in memory, so they disappear
// when the app closes. It lets us build and test the log-in screens before
// Shafin's real backend exists.
//
// It copies the real behaviour where it matters:
//   - A failed call throws an error whose message is an error code (see Section 6
//     of docs/api-contract.md), or a plain sentence from the login system.
//   - A Home account cannot log in to Staff. That gives the code WRONG_APP.
//
// Passwords are not checked against anything here. The fake only makes sure a
// password was typed. Any typed password works.
// Delete this file when the real backend is ready. Owned by Sraboni.

import type { Account, CodeInfo, PendingRequestForApprover } from '@griho/shared';

// Fake accounts to log in with while we build. Emails end in ".test" on purpose,
// so they can never be real people's addresses.
const accounts: Account[] = [
  { id: 'fake-staff-1', app: 'staff', display_name: 'Sraboni', email: 'sraboni@staff.test' },
  { id: 'fake-home-1', app: 'home', display_name: 'Bishal', email: 'bishal@home.test' },
];

// The account that is logged in right now (null means nobody is logged in).
let currentAccount: Account | null = null;

/** Log in with an email. Only Staff accounts may log in to this app. */
export async function signIn(email: string, password: string): Promise<Account> {
  if (!password) {
    throw new Error('INVALID_INPUT');
  }
  const found = accounts.find((a) => a.email === email.trim().toLowerCase());
  if (!found) {
    throw new Error('Invalid login credentials');
  }
  if (found.app !== 'staff') {
    // Wrong app: do not keep the session. The screen shows a clear message.
    throw new Error('WRONG_APP');
  }
  currentAccount = found;
  return found;
}

/** Make a new Staff account and log it in. */
export async function signUp(input: {
  email: string;
  password: string;
  displayName: string;
}): Promise<Account> {
  const email = input.email.trim().toLowerCase();
  const displayName = input.displayName.trim();
  if (!email || !input.password || !displayName) {
    throw new Error('INVALID_INPUT');
  }
  if (accounts.some((a) => a.email === email)) {
    // The real login system refuses an email that is already used, in either app.
    throw new Error('User already registered');
  }
  const account: Account = {
    id: `fake-staff-${accounts.length + 1}`,
    app: 'staff',
    display_name: displayName,
    email,
  };
  accounts.push(account);
  currentAccount = account;
  return account;
}

/** Log out. Nobody is logged in afterwards. */
export async function signOut(): Promise<void> {
  currentAccount = null;
}

/** The logged-in account, or null if nobody is logged in. */
export function getCurrentAccount(): Account | null {
  return currentAccount;
}

// ---- Joining a building with a code ----

// Fake codes the Staff app can accept. Only manager and guard codes are used here.
// "remaining" is how many more people may use the code.
type FakeCode = {
  value: string;
  role: 'manager' | 'guard';
  building_name: string;
  address: string;
  remaining: number;
  status: 'active' | 'disabled';
};

const BUILDING = { building_name: 'Lakeview Heights', address: 'House 18, Road 7, Dhaka' };

const codes: FakeCode[] = [
  { value: 'GUARD-2468', role: 'guard', ...BUILDING, remaining: 10, status: 'active' },
  { value: 'MANAGER-1357', role: 'manager', ...BUILDING, remaining: 50, status: 'active' },
  { value: 'GUARD-0000', role: 'guard', ...BUILDING, remaining: 0, status: 'active' },
  { value: 'GUARD-OFF', role: 'guard', ...BUILDING, remaining: 5, status: 'disabled' },
];

// The join request each account has sent (keyed by account id).
const pendingRequests = new Map<string, JoinRequestResult>();

/** The building a person belongs to, once their request has been approved. */
export type Membership = {
  building_name: string;
  address: string;
  role: 'manager' | 'guard';
};

// The building each account belongs to (keyed by account id).
const memberships = new Map<string, Membership>();

/** What the backend tells us after a join request is sent. */
export type JoinRequestResult = {
  request_id: string;
  building_name: string;
  role: 'manager' | 'guard';
  flat_label: null;
  status: 'pending';
};

/** Send a join request using a code the person typed. */
export async function submitJoinRequest(codeValue: string): Promise<JoinRequestResult> {
  if (!currentAccount) {
    throw new Error('NOT_AUTHENTICATED');
  }
  const typed = codeValue.trim().toUpperCase();
  const code = codes.find((c) => c.value === typed);
  // A missing or switched-off code gets the same answer, so nobody can guess codes.
  if (!code || code.status !== 'active') {
    throw new Error('CODE_NOT_USABLE');
  }
  if (code.remaining <= 0) {
    throw new Error('CODE_USED_UP');
  }
  if (memberships.has(currentAccount.id)) {
    throw new Error('ALREADY_MEMBER');
  }
  if (pendingRequests.has(currentAccount.id)) {
    throw new Error('ALREADY_PENDING');
  }
  // The code is NOT used up here. It is only used up when an owner approves.
  const result: JoinRequestResult = {
    request_id: `fake-request-${pendingRequests.size + 1}`,
    building_name: code.building_name,
    role: code.role,
    flat_label: null,
    status: 'pending',
  };
  pendingRequests.set(currentAccount.id, result);
  return result;
}

/** The request the logged-in person is waiting on, or null if there is none. */
export function getMyPendingRequest(): JoinRequestResult | null {
  if (!currentAccount) return null;
  return pendingRequests.get(currentAccount.id) ?? null;
}

/** The building the logged-in person belongs to, or null if they are in none. */
export function getMyMembership(): Membership | null {
  if (!currentAccount) return null;
  return memberships.get(currentAccount.id) ?? null;
}

/**
 * FOR TESTING ONLY. Pretends a manager or owner said yes to my waiting request.
 * In the real app, someone else approves it and the backend creates the
 * membership. Here, the code's used count goes down by one, only on approval.
 */
export async function approveMyRequestForTesting(): Promise<Membership> {
  if (!currentAccount) {
    throw new Error('NOT_AUTHENTICATED');
  }
  const request = pendingRequests.get(currentAccount.id);
  if (!request) {
    throw new Error('NOT_FOUND');
  }
  const code = codes.find(
    (c) => c.building_name === request.building_name && c.role === request.role,
  );
  if (!code || code.remaining <= 0) {
    throw new Error('CODE_USED_UP');
  }
  code.remaining -= 1;
  const membership: Membership = {
    building_name: request.building_name,
    address: code.address,
    role: request.role,
  };
  pendingRequests.delete(currentAccount.id);
  memberships.set(currentAccount.id, membership);
  return membership;
}

/**
 * Leave my building. The person must type their own name to confirm (the name
 * check ignores capital letters and spaces at the ends, like the real backend).
 */
export async function leaveBuilding(typedName: string): Promise<{ result: 'left' }> {
  if (!currentAccount) {
    throw new Error('NOT_AUTHENTICATED');
  }
  if (!memberships.has(currentAccount.id)) {
    throw new Error('NOT_A_MEMBER');
  }
  if (typedName.trim().toLowerCase() !== currentAccount.display_name.trim().toLowerCase()) {
    throw new Error('TYPED_NAME_MISMATCH');
  }
  memberships.delete(currentAccount.id);
  return { result: 'left' };
}

// ---- Manager tools: guard requests and guard codes ----
//
// Pretend data for the manager workspace. It copies these functions from
// docs/api-contract.md: list_pending_join_requests, decide_join_request,
// list_codes, create_code, and set_code_status. Only a manager may use them;
// anyone else gets NOT_ALLOWED, as the real backend will do.

type FakeGuardRequest = {
  request_id: string;
  requester_name: string;
  code_id: string;
  created_at: string;
  status: 'pending' | 'approved' | 'rejected';
};

let guardCodes: CodeInfo[] = [];
let guardRequests: FakeGuardRequest[] = [];
let guardCount = 0;
let codeCounter = 0;

// A sample number, until the Messages screen exists.
const OPEN_CHATS = 4;

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60000).toISOString();
}

function makeCode(
  id: string,
  value: string,
  maxUses: number,
  usedCount: number,
  status: 'active' | 'disabled',
): CodeInfo {
  return {
    id,
    type: 'guard',
    value,
    flat: null,
    max_uses: maxUses,
    used_count: usedCount,
    remaining: maxUses - usedCount,
    status,
    created_at: minutesAgo(60 * 24 * 3),
  };
}

/** Puts the pretend manager data back to how it starts. Tests use this too. */
export function resetManagerDataForTesting(): void {
  guardCodes = [
    makeCode('code-1', 'GRD-4F7K', 3, 1, 'active'),
    makeCode('code-2', 'GRD-7P3Q', 5, 2, 'active'),
    makeCode('code-3', 'GRD-2WD8', 1, 0, 'active'),
    makeCode('code-4', 'GRD-9M2C', 2, 2, 'disabled'),
  ];
  guardRequests = [
    {
      request_id: 'request-1',
      requester_name: 'Karim Hossain',
      code_id: 'code-1',
      created_at: minutesAgo(12),
      status: 'pending',
    },
    {
      request_id: 'request-2',
      requester_name: 'Salma Begum',
      code_id: 'code-1',
      created_at: minutesAgo(60),
      status: 'pending',
    },
  ];
  guardCount = 5;
  codeCounter = guardCodes.length;
}
resetManagerDataForTesting();

// Only a logged-in manager may use the manager tools.
function requireManager(): void {
  if (!currentAccount) {
    throw new Error('NOT_AUTHENTICATED');
  }
  if (memberships.get(currentAccount.id)?.role !== 'manager') {
    throw new Error('NOT_ALLOWED');
  }
}

/** The numbers shown on the manager's overview screen. */
export async function getManagerCounts(): Promise<{
  guards: number;
  waiting: number;
  codesInUse: number;
  chats: number;
}> {
  requireManager();
  return {
    guards: guardCount,
    waiting: guardRequests.filter((r) => r.status === 'pending').length,
    codesInUse: guardCodes.filter((c) => c.status === 'active').length,
    chats: OPEN_CHATS,
  };
}

/** Guard requests waiting for the manager's answer, newest first. */
export async function listPendingJoinRequests(): Promise<PendingRequestForApprover[]> {
  requireManager();
  return guardRequests
    .filter((r) => r.status === 'pending')
    .map((r) => ({
      request_id: r.request_id,
      requester_name: r.requester_name,
      role: 'guard' as const,
      flat_label: null,
      created_at: r.created_at,
    }))
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
}

/**
 * Say yes or no to a request. The first answer wins. Approving uses up one use of
 * the code and adds a guard. Rejecting uses up nothing.
 */
export async function decideJoinRequest(
  requestId: string,
  decision: 'approve' | 'reject',
): Promise<{ request_id: string; status: 'approved' | 'rejected' }> {
  requireManager();
  const request = guardRequests.find((r) => r.request_id === requestId);
  if (!request) {
    throw new Error('NOT_FOUND');
  }
  if (request.status !== 'pending') {
    throw new Error('REQUEST_ALREADY_DECIDED');
  }
  if (decision === 'approve') {
    const code = guardCodes.find((c) => c.id === request.code_id);
    if (!code || code.remaining <= 0) {
      throw new Error('CODE_USED_UP');
    }
    code.used_count += 1;
    code.remaining -= 1;
    guardCount += 1;
    request.status = 'approved';
  } else {
    request.status = 'rejected';
  }
  return { request_id: request.request_id, status: request.status };
}

/** The guard codes, newest first. */
export async function listCodes(): Promise<CodeInfo[]> {
  requireManager();
  return guardCodes
    .map((c) => ({ ...c }))
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
}

/** Make a new guard code that can be used 1 to 1000 times. */
export async function createCode(maxUses: number): Promise<CodeInfo> {
  requireManager();
  if (!Number.isInteger(maxUses) || maxUses < 1 || maxUses > 1000) {
    throw new Error('INVALID_INPUT');
  }
  codeCounter += 1;
  const tail = (codeCounter * 7919 + 1234).toString(36).toUpperCase().slice(-4).padStart(4, '0');
  const code = makeCode(`code-${codeCounter}`, `GRD-${tail}`, maxUses, 0, 'active');
  code.created_at = new Date().toISOString();
  guardCodes.push(code);
  return { ...code };
}

/** Turn a code off, back on, or delete it. This blocks new requests only. */
export async function setCodeStatus(
  codeId: string,
  status: 'active' | 'disabled' | 'deleted',
): Promise<CodeInfo | { ok: true }> {
  requireManager();
  const code = guardCodes.find((c) => c.id === codeId);
  if (!code) {
    throw new Error('NOT_FOUND');
  }
  if (status === 'deleted') {
    guardCodes = guardCodes.filter((c) => c.id !== codeId);
    return { ok: true };
  }
  code.status = status;
  return { ...code };
}

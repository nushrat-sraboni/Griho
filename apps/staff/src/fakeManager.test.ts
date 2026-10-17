// apps/staff/src/fakeManager.test.ts
//
// Checks the pretend manager tools: seeing requests, approving and rejecting them,
// making and switching codes, and keeping everyone who is not a manager out.
// Run with: npm test

import { beforeEach, describe, expect, it } from 'vitest';
import {
  approveMyRequestForTesting,
  createCode,
  decideJoinRequest,
  getManagerCounts,
  listCodes,
  listPendingJoinRequests,
  resetManagerDataForTesting,
  setCodeStatus,
  signOut,
  signUp,
  submitJoinRequest,
} from './fakeBackend';

let accountNumber = 0;

// Makes a brand-new account that joins as a manager and is approved.
async function logInAsManager() {
  accountNumber += 1;
  await signUp({
    email: `manager${accountNumber}@staff.test`,
    password: 'x',
    displayName: `Manager ${accountNumber}`,
  });
  await submitJoinRequest('MANAGER-1357');
  await approveMyRequestForTesting();
}

// Makes a brand-new account that joins as a guard and is approved.
async function logInAsGuard() {
  accountNumber += 1;
  await signUp({
    email: `guard${accountNumber}@staff.test`,
    password: 'x',
    displayName: `Guard ${accountNumber}`,
  });
  await submitJoinRequest('GUARD-2468');
  await approveMyRequestForTesting();
}

beforeEach(async () => {
  await signOut();
  resetManagerDataForTesting();
});

describe('who may use the manager tools', () => {
  it('refuses a guard with NOT_ALLOWED', async () => {
    await logInAsGuard();
    await expect(listPendingJoinRequests()).rejects.toThrow('NOT_ALLOWED');
    await expect(listCodes()).rejects.toThrow('NOT_ALLOWED');
    await expect(getManagerCounts()).rejects.toThrow('NOT_ALLOWED');
    await expect(createCode(1)).rejects.toThrow('NOT_ALLOWED');
  });

  it('refuses someone who is not logged in', async () => {
    await expect(listPendingJoinRequests()).rejects.toThrow('NOT_AUTHENTICATED');
  });
});

describe('guard requests', () => {
  it('lists the waiting requests, newest first', async () => {
    await logInAsManager();
    const requests = await listPendingJoinRequests();
    expect(requests.map((r) => r.requester_name)).toEqual(['Karim Hossain', 'Salma Begum']);
    expect(requests[0].role).toBe('guard');
  });

  it('approving adds a guard and uses up one use of the code', async () => {
    await logInAsManager();
    const before = await getManagerCounts();
    const codeBefore = (await listCodes()).find((c) => c.id === 'code-1')!;

    await expect(decideJoinRequest('request-1', 'approve')).resolves.toEqual({
      request_id: 'request-1',
      status: 'approved',
    });

    const after = await getManagerCounts();
    const codeAfter = (await listCodes()).find((c) => c.id === 'code-1')!;
    expect(after.guards).toBe(before.guards + 1);
    expect(after.waiting).toBe(before.waiting - 1);
    expect(codeAfter.used_count).toBe(codeBefore.used_count + 1);
    expect(codeAfter.remaining).toBe(codeBefore.remaining - 1);
  });

  it('rejecting uses up nothing and adds no guard', async () => {
    await logInAsManager();
    const before = await getManagerCounts();
    const codeBefore = (await listCodes()).find((c) => c.id === 'code-1')!;

    await decideJoinRequest('request-2', 'reject');

    const after = await getManagerCounts();
    const codeAfter = (await listCodes()).find((c) => c.id === 'code-1')!;
    expect(after.guards).toBe(before.guards);
    expect(after.waiting).toBe(before.waiting - 1);
    expect(codeAfter.used_count).toBe(codeBefore.used_count);
  });

  it('lets only the first answer count', async () => {
    await logInAsManager();
    await decideJoinRequest('request-1', 'reject');
    await expect(decideJoinRequest('request-1', 'approve')).rejects.toThrow(
      'REQUEST_ALREADY_DECIDED',
    );
  });

  it('says NOT_FOUND for a request that does not exist', async () => {
    await logInAsManager();
    await expect(decideJoinRequest('request-999', 'approve')).rejects.toThrow('NOT_FOUND');
  });
});

describe('guard codes', () => {
  it('lists the codes with their usage', async () => {
    await logInAsManager();
    const codes = await listCodes();
    expect(codes.length).toBe(4);
    expect(codes.every((c) => c.type === 'guard')).toBe(true);
    expect(codes.find((c) => c.value === 'GRD-4F7K')).toMatchObject({
      max_uses: 3,
      used_count: 1,
      remaining: 2,
      status: 'active',
    });
  });

  it('makes a new active code with no uses yet, listed first', async () => {
    await logInAsManager();
    const made = await createCode(5);
    expect(made).toMatchObject({ max_uses: 5, used_count: 0, remaining: 5, status: 'active' });
    expect(made.value).toMatch(/^GRD-[A-Z0-9]{4}$/);
    expect((await listCodes())[0].id).toBe(made.id);
  });

  it('gives each new code its own value', async () => {
    await logInAsManager();
    const first = await createCode(1);
    const second = await createCode(1);
    expect(first.value).not.toBe(second.value);
  });

  it('refuses a number of uses outside 1 to 1000', async () => {
    await logInAsManager();
    await expect(createCode(0)).rejects.toThrow('INVALID_INPUT');
    await expect(createCode(1001)).rejects.toThrow('INVALID_INPUT');
    await expect(createCode(2.5)).rejects.toThrow('INVALID_INPUT');
  });

  it('switches a code off and on again', async () => {
    await logInAsManager();
    await expect(setCodeStatus('code-1', 'disabled')).resolves.toMatchObject({
      status: 'disabled',
    });
    expect((await getManagerCounts()).codesInUse).toBe(2);
    await expect(setCodeStatus('code-1', 'active')).resolves.toMatchObject({ status: 'active' });
    expect((await getManagerCounts()).codesInUse).toBe(3);
  });

  it('deletes a code', async () => {
    await logInAsManager();
    await expect(setCodeStatus('code-3', 'deleted')).resolves.toEqual({ ok: true });
    expect((await listCodes()).some((c) => c.id === 'code-3')).toBe(false);
  });

  it('says NOT_FOUND for a code that does not exist', async () => {
    await logInAsManager();
    await expect(setCodeStatus('code-999', 'disabled')).rejects.toThrow('NOT_FOUND');
  });
});

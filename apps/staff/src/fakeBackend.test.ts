// apps/staff/src/fakeBackend.test.ts
//
// Checks that the pretend backend behaves like the real one for the log-in
// rules: Staff accounts get in, Home accounts get WRONG_APP, and a new sign-up
// makes a Staff account. Run with: npm test

import { describe, expect, it } from 'vitest';
import {
  approveMyRequestForTesting,
  deleteAccount,
  getCurrentAccount,
  getMyMembership,
  getMyPendingRequest,
  leaveBuilding,
  signIn,
  signOut,
  signUp,
  submitJoinRequest,
} from './fakeBackend';

describe('fake log-in', () => {
  it('lets a Staff account log in', async () => {
    const account = await signIn('sraboni@staff.test', 'anything');
    expect(account.app).toBe('staff');
    expect(getCurrentAccount()?.email).toBe('sraboni@staff.test');
    await signOut();
  });

  it('refuses a Home account with WRONG_APP and keeps nobody logged in', async () => {
    await expect(signIn('bishal@home.test', 'anything')).rejects.toThrow('WRONG_APP');
    expect(getCurrentAccount()).toBeNull();
  });

  it('refuses a log-in with no password typed', async () => {
    await expect(signIn('sraboni@staff.test', '')).rejects.toThrow('INVALID_INPUT');
  });

  it('refuses an unknown email', async () => {
    await expect(signIn('nobody@staff.test', 'anything')).rejects.toThrow();
  });
});

describe('fake sign-up', () => {
  it('makes a new Staff account and logs it in', async () => {
    const account = await signUp({
      email: 'new.guard@staff.test',
      password: 'anything',
      displayName: 'New Guard',
    });
    expect(account.app).toBe('staff');
    expect(getCurrentAccount()?.display_name).toBe('New Guard');
    await signOut();
  });

  it('refuses an email that is already used', async () => {
    await expect(
      signUp({ email: 'bishal@home.test', password: 'anything', displayName: 'Someone' }),
    ).rejects.toThrow();
  });

  it('refuses a sign-up with a missing name', async () => {
    await expect(
      signUp({ email: 'empty@staff.test', password: 'anything', displayName: '' }),
    ).rejects.toThrow('INVALID_INPUT');
  });
});

describe('fake join requests', () => {
  it('sends a guard request with a good code and shows it as pending', async () => {
    await signIn('sraboni@staff.test', 'anything');
    const request = await submitJoinRequest('guard-2468');
    expect(request.status).toBe('pending');
    expect(request.role).toBe('guard');
    expect(request.building_name).toBe('Lakeview Heights');
    expect(getMyPendingRequest()?.request_id).toBe(request.request_id);
    await signOut();
  });

  it('refuses a code that does not exist', async () => {
    await signIn('sraboni@staff.test', 'anything');
    await expect(submitJoinRequest('NOPE-1111')).rejects.toThrow('CODE_NOT_USABLE');
    await signOut();
  });

  it('refuses a switched-off code with the same answer as a missing one', async () => {
    await signIn('sraboni@staff.test', 'anything');
    await expect(submitJoinRequest('GUARD-OFF')).rejects.toThrow('CODE_NOT_USABLE');
    await signOut();
  });

  it('refuses a code with no uses left', async () => {
    await signIn('sraboni@staff.test', 'anything');
    await expect(submitJoinRequest('GUARD-0000')).rejects.toThrow('CODE_USED_UP');
    await signOut();
  });

  it('refuses a second request while one is still waiting', async () => {
    // A brand-new account, so the request from the test above does not get in the way.
    await signUp({ email: 'second.try@staff.test', password: 'anything', displayName: 'Second' });
    await submitJoinRequest('GUARD-2468');
    await expect(submitJoinRequest('MANAGER-1357')).rejects.toThrow('ALREADY_PENDING');
    await signOut();
  });

  it('needs someone logged in to send a request', async () => {
    await expect(submitJoinRequest('GUARD-2468')).rejects.toThrow('NOT_AUTHENTICATED');
  });
});

describe('fake approval and leaving', () => {
  it('moves an approved request into a membership', async () => {
    await signUp({
      email: 'approved.guard@staff.test',
      password: 'x',
      displayName: 'Approved Guard',
    });
    await submitJoinRequest('GUARD-2468');
    const membership = await approveMyRequestForTesting();
    expect(membership.role).toBe('guard');
    expect(membership.building_name).toBe('Lakeview Heights');
    expect(membership.address).toBe('House 18, Road 7, Dhaka');
    expect(getMyMembership()?.role).toBe('guard');
    expect(getMyPendingRequest()).toBeNull();
    await signOut();
  });

  it('refuses a new join request from someone who is already a member', async () => {
    await signUp({
      email: 'already.member@staff.test',
      password: 'x',
      displayName: 'Already Member',
    });
    await submitJoinRequest('GUARD-2468');
    await approveMyRequestForTesting();
    await expect(submitJoinRequest('GUARD-2468')).rejects.toThrow('ALREADY_MEMBER');
    await signOut();
  });

  it('has nothing to approve when no request was sent', async () => {
    await signUp({ email: 'no.request@staff.test', password: 'x', displayName: 'No Request' });
    await expect(approveMyRequestForTesting()).rejects.toThrow('NOT_FOUND');
    await signOut();
  });

  it('refuses to leave when the typed name does not match', async () => {
    await signUp({ email: 'wrong.name@staff.test', password: 'x', displayName: 'Wrong Name' });
    await submitJoinRequest('GUARD-2468');
    await approveMyRequestForTesting();
    await expect(leaveBuilding('Someone Else')).rejects.toThrow('TYPED_NAME_MISMATCH');
    expect(getMyMembership()).not.toBeNull();
    await signOut();
  });

  it('lets a member leave when they type their own name, ignoring capitals and spaces', async () => {
    await signUp({ email: 'leaver@staff.test', password: 'x', displayName: 'Leaver Person' });
    await submitJoinRequest('GUARD-2468');
    await approveMyRequestForTesting();
    await expect(leaveBuilding('  leaver person ')).resolves.toEqual({ result: 'left' });
    expect(getMyMembership()).toBeNull();
    await signOut();
  });

  it('says NOT_A_MEMBER when leaving without a building', async () => {
    await signUp({ email: 'no.building@staff.test', password: 'x', displayName: 'No Building' });
    await expect(leaveBuilding('No Building')).rejects.toThrow('NOT_A_MEMBER');
    await signOut();
  });
});

describe('deleting an account', () => {
  it('needs someone logged in', async () => {
    await signOut();
    await expect(deleteAccount('Anyone')).rejects.toThrow('NOT_AUTHENTICATED');
  });

  it('refuses when the typed name does not match, and keeps the account', async () => {
    await signUp({ email: 'keep.me@staff.test', password: 'x', displayName: 'Keep Me' });
    await expect(deleteAccount('Someone Else')).rejects.toThrow('TYPED_NAME_MISMATCH');
    expect(getCurrentAccount()?.email).toBe('keep.me@staff.test');
    await signOut();
    await expect(signIn('keep.me@staff.test', 'x')).resolves.toMatchObject({
      display_name: 'Keep Me',
    });
    await signOut();
  });

  it('removes the account for good when the person types their own name', async () => {
    await signUp({ email: 'delete.me@staff.test', password: 'x', displayName: 'Delete Me' });
    await expect(deleteAccount('  delete ME ')).resolves.toEqual({
      ok: true,
      buildings_deleted: 0,
    });
    expect(getCurrentAccount()).toBeNull();
    await expect(signIn('delete.me@staff.test', 'x')).rejects.toThrow();
  });

  it('lets the same email sign up again as a fresh account', async () => {
    await signUp({ email: 'again@staff.test', password: 'x', displayName: 'Again One' });
    const firstId = getCurrentAccount()!.id;
    await deleteAccount('Again One');
    const second = await signUp({
      email: 'again@staff.test',
      password: 'x',
      displayName: 'Again Two',
    });
    expect(second.id).not.toBe(firstId);
    expect(getMyMembership()).toBeNull();
    await signOut();
  });

  it('never gives two accounts the same id, even after a deletion', async () => {
    const a = await signUp({ email: 'id.a@staff.test', password: 'x', displayName: 'Id A' });
    await deleteAccount('Id A');
    const b = await signUp({ email: 'id.b@staff.test', password: 'x', displayName: 'Id B' });
    const c = await signUp({ email: 'id.c@staff.test', password: 'x', displayName: 'Id C' });
    expect(new Set([a.id, b.id, c.id]).size).toBe(3);
    await signOut();
  });

  it('removes a waiting request and a place in a building', async () => {
    await signUp({ email: 'waiting@staff.test', password: 'x', displayName: 'Waiting One' });
    await submitJoinRequest('GUARD-2468');
    expect(getMyPendingRequest()).not.toBeNull();
    await deleteAccount('Waiting One');
    await signUp({ email: 'waiting@staff.test', password: 'x', displayName: 'Waiting One' });
    expect(getMyPendingRequest()).toBeNull();
    await signOut();

    await signUp({ email: 'member@staff.test', password: 'x', displayName: 'Member One' });
    await submitJoinRequest('GUARD-2468');
    await approveMyRequestForTesting();
    expect(getMyMembership()).not.toBeNull();
    await deleteAccount('Member One');
    await signUp({ email: 'member@staff.test', password: 'x', displayName: 'Member One' });
    expect(getMyMembership()).toBeNull();
    await signOut();
  });
});

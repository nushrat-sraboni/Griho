// apps/staff/src/fakeBackend.test.ts
//
// Checks that the pretend backend behaves like the real one for the log-in
// rules: Staff accounts get in, Home accounts get WRONG_APP, and a new sign-up
// makes a Staff account. Run with: npm test

import { describe, expect, it } from 'vitest';
import {
  getCurrentAccount,
  getMyPendingRequest,
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
    expect(request.building_name).toBe('Rose Garden');
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

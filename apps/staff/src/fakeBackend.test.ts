// apps/staff/src/fakeBackend.test.ts
//
// Checks that the pretend backend behaves like the real one for the log-in
// rules: Staff accounts get in, Home accounts get WRONG_APP, and a new sign-up
// makes a Staff account. Run with: npm test

import { describe, expect, it } from 'vitest';
import { getCurrentAccount, signIn, signOut, signUp } from './fakeBackend';

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

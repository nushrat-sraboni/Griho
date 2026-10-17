// apps/home/src/auth.test.ts
//
// Small checks that prove the Griho Home log-in rule: Home accounts get in,
// Staff accounts are signed out again with WRONG_APP, and wrong passwords fail.
// They use the pretend backend, so no internet is needed. Run with: npm test

import { describe, expect, it } from 'vitest';
import { createFakeApi } from './api/fake/fakeApi';
import { createSeededDatabase, FAKE_PASSWORD, SEED } from './api/fake/seed';
import { logInToHome } from './auth';

function setup() {
  return createFakeApi({ app: 'home', delayMs: 0, database: createSeededDatabase() });
}

describe('logInToHome', () => {
  it('logs in a Home account and returns it', async () => {
    const api = setup();
    const account = await logInToHome(api, SEED.emails.rahim, FAKE_PASSWORD);
    expect(account.display_name).toBe('Rahim');
    expect(account.app).toBe('home');
    expect((await api.getMyAccount()).id).toBe(account.id);
  });

  it('signs a Staff account out again and says WRONG_APP', async () => {
    const api = setup();
    await expect(logInToHome(api, SEED.emails.jamal, FAKE_PASSWORD)).rejects.toThrow('WRONG_APP');
    await expect(api.getMyAccount()).rejects.toThrow('NOT_AUTHENTICATED');
  });

  it('fails with the login service wording for a wrong password', async () => {
    const api = setup();
    await expect(logInToHome(api, SEED.emails.rahim, 'nope')).rejects.toThrow(
      'Invalid login credentials',
    );
    await expect(api.getMyAccount()).rejects.toThrow('NOT_AUTHENTICATED');
  });

  it('does not keep an earlier person logged in after a failed log in', async () => {
    const api = setup();
    await logInToHome(api, SEED.emails.rahim, FAKE_PASSWORD);
    await expect(logInToHome(api, SEED.emails.jamal, FAKE_PASSWORD)).rejects.toThrow('WRONG_APP');
    await expect(api.getMyAccount()).rejects.toThrow('NOT_AUTHENTICATED');
  });
});

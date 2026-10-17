// apps/home/src/auth.ts
//
// The log-in rule for Griho Home, kept apart from the screens so it can be
// tested. Logging in has two steps (docs/api-contract.md, 4.1):
//   1. Check the email and password.
//   2. Ask "who am I?" and make sure the account belongs to THIS app.
// A Staff account must never stay logged in here: it is signed out straight
// away and the call fails with WRONG_APP, so the screen can explain why.
// Owned by Bishal.

import type { Account } from '@griho/shared';
import type { GrihoApi } from './api';

/** Logs in to Griho Home. Throws the backend's error, or WRONG_APP for a Staff account. */
export async function logInToHome(
  api: GrihoApi,
  email: string,
  password: string,
): Promise<Account> {
  await api.signIn({ email, password });
  const account = await api.getMyAccount();
  if (account.app !== 'home') {
    await api.signOut();
    throw new Error('WRONG_APP');
  }
  return account;
}

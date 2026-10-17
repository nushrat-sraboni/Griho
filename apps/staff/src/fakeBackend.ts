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

import type { Account } from '@griho/shared';

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

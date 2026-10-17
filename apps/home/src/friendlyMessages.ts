// apps/home/src/friendlyMessages.ts
//
// Turns failed backend calls into plain sentences a person can read. The app
// never shows a raw error code (like CODE_USED_UP) to anyone.
//
// Two kinds of errors are handled:
//   1. The CAPITAL-LETTER codes from docs/api-contract.md. Every code in the
//      shared list MUST have a sentence here. TypeScript checks this for us:
//      when Shafin adds a new code, this file will refuse to build until we
//      write its sentence too.
//   2. Two plain-English messages from the login service itself ("User already
//      registered" and "Invalid login credentials"). They are not in the shared
//      list, so they are handled on their own below.
//
// Anything else gets a safe, general sentence so the app never crashes.
// Owned by Bishal.

import { type ErrorCode, getErrorCode } from '@griho/shared';

const SENTENCES: Record<ErrorCode | 'UNKNOWN', string> = {
  NOT_AUTHENTICATED: 'Please log in first.',
  WRONG_APP: 'This account belongs to Griho Staff. Please use the Griho Staff app instead.',
  NOT_ALLOWED: 'You are not allowed to do that.',
  NOT_A_MEMBER: 'You are not a member of this building.',
  NOT_FOUND: 'We could not find that. It may have been removed.',
  INVALID_INPUT: 'Some information is missing or not correct. Please check it and try again.',
  CODE_NOT_USABLE: 'This code does not work. Please check it with the person who gave it to you.',
  CODE_USED_UP:
    'This code has already been used as many times as it allows. Please ask for a new one.',
  ALREADY_MEMBER: 'You are already a member of this building.',
  ALREADY_PENDING: 'You already sent a request. Please wait for an answer.',
  TENANT_ALREADY_HAS_FLAT: 'A tenant can only have one flat in a building.',
  MANAGER_SLOT_TAKEN: 'This building already has a manager.',
  REQUEST_ALREADY_DECIDED: 'Someone has already answered this request.',
  FLAT_LABEL_TAKEN: 'A flat with this name already exists in this building.',
  FLAT_NOT_UNCLAIMED: 'This flat already has an owner.',
  TYPED_NAME_MISMATCH: 'The name you typed does not match. Please type it exactly.',
  GUARD_CANNOT_MESSAGE: 'Guards cannot send or receive messages.',
  NOT_IN_SAME_BUILDING: 'You can only message people in your own building.',
  CANNOT_MESSAGE_SELF: 'You cannot message yourself.',
  MESSAGE_ALREADY_DELETED: 'This message was already deleted.',
  TOO_MANY_ATTEMPTS: 'Too many tries. Please wait 10 minutes and try again.',
  UNKNOWN: 'Something went wrong. Please try again.',
};

/** Plain-English messages that come from the login service and are not in the shared code list. */
const LOGIN_SERVICE_SENTENCES: Record<string, string> = {
  'User already registered': 'This email is already used. Please use a different email.',
  'Invalid login credentials': 'The email or password is not correct.',
};

/** The plain sentence to show a person for a failed call. */
export function friendlyErrorMessage(error: { message?: string } | null | undefined): string {
  const message = error?.message?.trim();
  if (message && message in LOGIN_SERVICE_SENTENCES) {
    return LOGIN_SERVICE_SENTENCES[message];
  }
  return SENTENCES[getErrorCode(error)];
}

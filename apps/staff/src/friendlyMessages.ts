// apps/staff/src/friendlyMessages.ts
//
// Turns error codes (like WRONG_APP) into plain sentences a person can read.
// The app never shows the raw code to anyone. Every code from the shared list
// must have a sentence here. TypeScript checks that for us, so when Shafin adds
// a new code, this file will ask us to write its sentence too.
// Owned by Sraboni.

import { type ErrorCode, getErrorCode } from '@griho/shared';

const SENTENCES: Record<ErrorCode | 'UNKNOWN', string> = {
  NOT_AUTHENTICATED: 'You need to log in first.',
  WRONG_APP: 'This account belongs to Griho Home. Please use the Griho Home app instead.',
  NOT_ALLOWED: 'You are not allowed to do that.',
  NOT_A_MEMBER: 'You are not a member of this building.',
  NOT_FOUND: 'We could not find that. It may have been removed.',
  INVALID_INPUT: 'Some information is missing or not correct. Please check it and try again.',
  CODE_NOT_USABLE: 'This code does not work. Please check it with the building owner.',
  CODE_USED_UP: 'This code has already been used the maximum number of times.',
  ALREADY_MEMBER: 'You are already a member of this building.',
  ALREADY_PENDING: 'You already sent a request. Please wait for an answer.',
  TENANT_ALREADY_HAS_FLAT: 'This tenant already has a flat.',
  MANAGER_SLOT_TAKEN: 'This building already has a manager.',
  REQUEST_ALREADY_DECIDED: 'Someone has already answered this request.',
  FLAT_LABEL_TAKEN: 'A flat with this name already exists.',
  FLAT_NOT_UNCLAIMED: 'This flat already has an owner.',
  TYPED_NAME_MISMATCH: 'The name you typed does not match. Please type it exactly.',
  GUARD_CANNOT_MESSAGE: 'Guards cannot send or receive messages.',
  NOT_IN_SAME_BUILDING: 'You can only message people in your own building.',
  CANNOT_MESSAGE_SELF: 'You cannot message yourself.',
  MESSAGE_ALREADY_DELETED: 'This message was already deleted.',
  TOO_MANY_ATTEMPTS: 'Too many tries. Please wait 10 minutes and try again.',
  UNKNOWN: 'Something went wrong. Please try again.',
};

/** The plain sentence to show a person for a failed call. */
export function friendlyErrorMessage(error: { message?: string } | null | undefined): string {
  return SENTENCES[getErrorCode(error)];
}

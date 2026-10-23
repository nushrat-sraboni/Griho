// packages/shared/src/errors.ts
//
// The list of error codes the backend can send (see Section 6 of
// docs/api-contract.md). When a backend call fails, error.message is one of
// these CAPITAL-LETTER codes. Apps turn each code into a friendly sentence in
// their own screens. They never show the raw code to a person.
// Owned by Shafin.

export const ERROR_CODES = [
  'NOT_AUTHENTICATED',
  'WRONG_APP',
  'NOT_ALLOWED',
  'NOT_A_MEMBER',
  'NOT_FOUND',
  'INVALID_INPUT',
  'CODE_NOT_USABLE',
  'CODE_USED_UP',
  'ALREADY_MEMBER',
  'ALREADY_PENDING',
  'TENANT_ALREADY_HAS_FLAT',
  'MANAGER_SLOT_TAKEN',
  'REQUEST_ALREADY_DECIDED',
  'FLAT_LABEL_TAKEN',
  'FLAT_NOT_UNCLAIMED',
  'TYPED_NAME_MISMATCH',
  'GUARD_CANNOT_MESSAGE', // Retired: guards can message now. Never returned; kept so the apps still compile.
  'NOT_IN_SAME_BUILDING',
  'CANNOT_MESSAGE_SELF',
  'MESSAGE_ALREADY_DELETED',
  'TOO_MANY_ATTEMPTS',
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

/** True when the text is one of the known error codes. */
export function isErrorCode(value: unknown): value is ErrorCode {
  return typeof value === 'string' && (ERROR_CODES as readonly string[]).includes(value);
}

/**
 * Reads the error code out of a failed backend call.
 * Returns 'UNKNOWN' for anything else, so the app can show a general
 * "Something went wrong, please try again" message instead of crashing.
 */
export function getErrorCode(
  error: { message?: string } | null | undefined,
): ErrorCode | 'UNKNOWN' {
  const message = error?.message?.trim();
  return isErrorCode(message) ? message : 'UNKNOWN';
}

// packages/shared/src/errors.test.ts
//
// Small checks that prove the error-code helpers behave. Run with: npm test

import { describe, expect, it } from 'vitest';
import { ERROR_CODES, getErrorCode, isErrorCode } from './errors';

describe('error codes', () => {
  it('has no duplicate codes', () => {
    expect(new Set(ERROR_CODES).size).toBe(ERROR_CODES.length);
  });

  it('recognises a known code', () => {
    expect(isErrorCode('CODE_USED_UP')).toBe(true);
  });

  it('does not recognise a made-up code', () => {
    expect(isErrorCode('SOMETHING_ELSE')).toBe(false);
  });

  it('reads the code out of a failed call', () => {
    expect(getErrorCode({ message: 'WRONG_APP' })).toBe('WRONG_APP');
  });

  it('falls back to UNKNOWN for anything else', () => {
    expect(getErrorCode({ message: 'boom' })).toBe('UNKNOWN');
    expect(getErrorCode(null)).toBe('UNKNOWN');
  });
});

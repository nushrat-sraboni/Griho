// apps/home/src/friendlyMessages.test.ts
//
// Small checks that prove every error code has a plain sentence, that the
// raw code is never shown, and that unknown errors get a safe general
// sentence. Run with: npm test

import { describe, expect, it } from 'vitest';
import { ERROR_CODES } from '@griho/shared';
import { friendlyErrorMessage } from './friendlyMessages';

const GENERAL = 'Something went wrong. Please try again.';

describe('friendly error messages', () => {
  it('has a sentence for every shared error code', () => {
    for (const code of ERROR_CODES) {
      const sentence = friendlyErrorMessage({ message: code });
      expect(sentence.length).toBeGreaterThan(0);
      expect(sentence).not.toBe(GENERAL);
    }
  });

  it('never shows the raw code to a person', () => {
    for (const code of ERROR_CODES) {
      expect(friendlyErrorMessage({ message: code })).not.toContain(code);
    }
  });

  it('explains WRONG_APP in plain words', () => {
    expect(friendlyErrorMessage({ message: 'WRONG_APP' })).toContain('Griho Staff');
  });

  it('explains a used email in plain words', () => {
    expect(friendlyErrorMessage({ message: 'User already registered' })).toBe(
      'This email is already used. Please use a different email.',
    );
  });

  it('explains a wrong password in plain words', () => {
    expect(friendlyErrorMessage({ message: 'Invalid login credentials' })).toBe(
      'The email or password is not correct.',
    );
  });

  it('falls back to a general sentence for anything unknown', () => {
    expect(friendlyErrorMessage({ message: 'boom' })).toBe(GENERAL);
    expect(friendlyErrorMessage({ message: 'FAKE_NOT_BUILT_YET: x' })).toBe(GENERAL);
    expect(friendlyErrorMessage(null)).toBe(GENERAL);
    expect(friendlyErrorMessage(undefined)).toBe(GENERAL);
  });
});

// apps/staff/src/friendlyMessages.test.ts
//
// Small checks that prove every error code has a plain sentence, and that
// unknown errors get a safe, general sentence. Run with: npm test

import { describe, expect, it } from 'vitest';
import { ERROR_CODES } from '@griho/shared';
import { friendlyErrorMessage } from './friendlyMessages';

describe('friendly error messages', () => {
  it('has a sentence for every shared error code', () => {
    for (const code of ERROR_CODES) {
      const sentence = friendlyErrorMessage({ message: code });
      expect(sentence.length).toBeGreaterThan(0);
      // The raw code must never be shown to a person.
      expect(sentence).not.toContain(code);
    }
  });

  it('explains WRONG_APP in plain words', () => {
    expect(friendlyErrorMessage({ message: 'WRONG_APP' })).toContain('Griho Home');
  });

  it('falls back to a general sentence for anything unknown', () => {
    expect(friendlyErrorMessage({ message: 'Invalid login credentials' })).toBe(
      'Something went wrong. Please try again.',
    );
    expect(friendlyErrorMessage(null)).toBe('Something went wrong. Please try again.');
  });
});

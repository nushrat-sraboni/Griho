// apps/home/src/greeting.test.ts
//
// Small checks for the greeting and the date label on the signed-in screen.
// Run with: npm test

import { describe, expect, it } from 'vitest';
import { formatEyebrowDate, getGreeting } from './greeting';

describe('getGreeting', () => {
  it('says good morning before noon', () => {
    expect(getGreeting(new Date(2026, 9, 17, 0, 0))).toBe('Good morning');
    expect(getGreeting(new Date(2026, 9, 17, 11, 59))).toBe('Good morning');
  });

  it('says good afternoon from noon until 5pm', () => {
    expect(getGreeting(new Date(2026, 9, 17, 12, 0))).toBe('Good afternoon');
    expect(getGreeting(new Date(2026, 9, 17, 16, 59))).toBe('Good afternoon');
  });

  it('says good evening from 5pm', () => {
    expect(getGreeting(new Date(2026, 9, 17, 17, 0))).toBe('Good evening');
    expect(getGreeting(new Date(2026, 9, 17, 23, 59))).toBe('Good evening');
  });
});

describe('formatEyebrowDate', () => {
  it('writes the weekday, month and day in capital letters', () => {
    expect(formatEyebrowDate(new Date(2026, 9, 17))).toBe('SATURDAY, OCTOBER 17');
    expect(formatEyebrowDate(new Date(2026, 0, 1))).toBe('THURSDAY, JANUARY 1');
  });
});

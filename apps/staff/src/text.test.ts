// apps/staff/src/text.test.ts
//
// Small checks for the time and initials helpers. Run with: npm test

import { describe, expect, it } from 'vitest';
import { greetingFor, initialsOf, namesMatch, timeAgo } from './text';

const NOW = Date.parse('2026-10-17T12:00:00Z');
const minutesAgo = (m: number) => new Date(NOW - m * 60000).toISOString();

describe('timeAgo', () => {
  it('says "Just now" for the last moments', () => {
    expect(timeAgo(minutesAgo(0), NOW)).toBe('Just now');
  });

  it('counts minutes under an hour', () => {
    expect(timeAgo(minutesAgo(12), NOW)).toBe('12 min ago');
  });

  it('counts hours, with a singular form', () => {
    expect(timeAgo(minutesAgo(60), NOW)).toBe('1 hour ago');
    expect(timeAgo(minutesAgo(180), NOW)).toBe('3 hours ago');
  });

  it('counts days, with a singular form', () => {
    expect(timeAgo(minutesAgo(24 * 60), NOW)).toBe('1 day ago');
    expect(timeAgo(minutesAgo(3 * 24 * 60), NOW)).toBe('3 days ago');
  });

  it('never goes negative for a time in the future', () => {
    expect(timeAgo(minutesAgo(-5), NOW)).toBe('Just now');
  });
});

describe('initialsOf', () => {
  it('uses the first letter of the first two words', () => {
    expect(initialsOf('Karim Hossain')).toBe('KH');
    expect(initialsOf('  salma   begum  ')).toBe('SB');
    expect(initialsOf('Anna Maria Lopez')).toBe('AM');
  });

  it('uses the first two letters of a single name', () => {
    expect(initialsOf('Mahin')).toBe('MA');
  });

  it('gives a question mark for an empty name', () => {
    expect(initialsOf('   ')).toBe('?');
  });
});

describe('greetingFor', () => {
  it('greets by the time of day', () => {
    expect(greetingFor(0)).toBe('Good morning');
    expect(greetingFor(11)).toBe('Good morning');
    expect(greetingFor(12)).toBe('Good afternoon');
    expect(greetingFor(17)).toBe('Good afternoon');
    expect(greetingFor(18)).toBe('Good evening');
    expect(greetingFor(23)).toBe('Good evening');
  });
});

describe('namesMatch', () => {
  it('ignores capital letters and spaces at the ends', () => {
    expect(namesMatch('  karim hossain ', 'Karim Hossain')).toBe(true);
  });

  it('does not match a different or partial name', () => {
    expect(namesMatch('Karim', 'Karim Hossain')).toBe(false);
    expect(namesMatch('', 'Karim Hossain')).toBe(false);
  });
});

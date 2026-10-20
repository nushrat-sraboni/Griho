// apps/staff/src/text.test.ts
//
// Small checks for the time and initials helpers. Run with: npm test

import { describe, expect, it } from 'vitest';
import {
  chatListTime,
  clockTime,
  dayLabel,
  greetingFor,
  guardCodeMessage,
  initialsOf,
  namesMatch,
  timeAgo,
} from './text';

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

// Dates made in the phone's own time zone, so these checks pass anywhere.
const local = (month: number, day: number, hour = 12, minute = 0) =>
  new Date(2026, month - 1, day, hour, minute).toISOString();
const TODAY_NOON = new Date(2026, 9, 17, 12, 0).getTime();

describe('clockTime', () => {
  it('shows morning and afternoon times', () => {
    expect(clockTime(local(10, 17, 9, 5))).toBe('9:05 AM');
    expect(clockTime(local(10, 17, 18, 40))).toBe('6:40 PM');
  });

  it('shows midnight and noon as 12', () => {
    expect(clockTime(local(10, 17, 0, 0))).toBe('12:00 AM');
    expect(clockTime(local(10, 17, 12, 30))).toBe('12:30 PM');
  });
});

describe('dayLabel', () => {
  it('says TODAY, YESTERDAY, or the date', () => {
    expect(dayLabel(local(10, 17, 1, 0), TODAY_NOON)).toBe('TODAY');
    expect(dayLabel(local(10, 16, 23, 0), TODAY_NOON)).toBe('YESTERDAY');
    expect(dayLabel(local(10, 12, 8, 0), TODAY_NOON)).toBe('12 OCT');
  });
});

describe('chatListTime', () => {
  it('shows the clock time for today', () => {
    expect(chatListTime(local(10, 17, 6, 52), TODAY_NOON)).toBe('6:52 AM');
  });

  it('shows Yesterday, then a weekday for the last week, then a date', () => {
    expect(chatListTime(local(10, 16, 20, 0), TODAY_NOON)).toBe('Yesterday');
    expect(chatListTime(local(10, 12, 20, 0), TODAY_NOON)).toBe('Mon');
    expect(chatListTime(local(9, 30, 20, 0), TODAY_NOON)).toBe('30 Sep');
  });
});

describe('guardCodeMessage', () => {
  it('names the building and the code', () => {
    expect(guardCodeMessage('GRD-4F7K', 'Lakeview Heights')).toBe(
      'Join Lakeview Heights on Griho Staff as a guard. Your code is GRD-4F7K.',
    );
  });
});

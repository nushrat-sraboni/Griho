// apps/home/src/messages.test.ts
//
// Small checks for the message helpers: times and day labels, the list lines,
// the "can I send this?" check, and the day labels between messages.
// Run with: npm test

import { describe, expect, it } from 'vitest';
import type { ConversationItem, Message } from '@griho/shared';
import {
  canReplyTo,
  chatsSummary,
  checkMessageText,
  clockTime,
  dayLabel,
  listTime,
  previewText,
  rowsWithDays,
} from './messages';

// Local-time dates, so the checks work in any time zone. Oct 21 2026 is a Wednesday.
const NOW = new Date(2026, 9, 21, 15, 0);

function at(day: number, hour: number, minute = 0): string {
  return new Date(2026, 9, day, hour, minute).toISOString();
}

function message(id: string, createdAt: string): Message {
  return {
    id,
    conversation_id: 'c',
    sender_account_id: 'a',
    sender_label: 'A',
    is_mine: false,
    body: id,
    deleted: false,
    created_at: createdAt,
  };
}

describe('clockTime', () => {
  it('writes am and pm the plain way', () => {
    expect(clockTime(at(21, 8, 7))).toBe('8:07 am');
    expect(clockTime(at(21, 16, 30))).toBe('4:30 pm');
    expect(clockTime(at(21, 0, 5))).toBe('12:05 am');
    expect(clockTime(at(21, 12, 0))).toBe('12:00 pm');
  });
});

describe('dayLabel and listTime', () => {
  it('says Today, Yesterday, a weekday, or a date', () => {
    expect(dayLabel(at(21, 9), NOW)).toBe('Today');
    expect(dayLabel(at(20, 9), NOW)).toBe('Yesterday');
    expect(dayLabel(at(17, 9), NOW)).toBe('Saturday');
    expect(dayLabel(at(8, 9), NOW)).toBe('Oct 8');
  });

  it('shows the clock for today and words for older chats in the list', () => {
    expect(listTime(at(21, 9, 30), NOW)).toBe('9:30 am');
    expect(listTime(at(20, 9), NOW)).toBe('Yesterday');
    expect(listTime(at(14, 9), NOW)).toBe('1 week ago');
  });
});

describe('the list of chats', () => {
  it('shows a preview, or says the message was deleted', () => {
    const base = { created_at: at(20, 9) };
    expect(previewText({ ...base, preview: 'Great, thank you!', deleted: false })).toBe(
      'Great, thank you!',
    );
    expect(previewText({ ...base, preview: null, deleted: true })).toBe('Message deleted');
    expect(previewText(null)).toBe('No messages yet');
  });

  it('counts chats', () => {
    const chat = (id: string): ConversationItem => ({
      conversation_id: id,
      other: { account_id: id, label: id },
      last_message: null,
    });
    expect(chatsSummary([])).toBe('No chats yet');
    expect(chatsSummary([chat('a')])).toBe('1 chat');
    expect(chatsSummary([chat('a'), chat('b')])).toBe('2 chats');
  });
});

describe('checkMessageText', () => {
  it('needs at least one real character', () => {
    expect(checkMessageText('')).toEqual({ ok: false });
    expect(checkMessageText('   ')).toEqual({ ok: false });
    expect(checkMessageText(' hi ')).toEqual({ ok: true });
  });

  it('allows up to 2000 characters and says so when it is too long', () => {
    expect(checkMessageText('a'.repeat(2000)).ok).toBe(true);
    expect(checkMessageText('a'.repeat(2001))).toEqual({
      ok: false,
      problem: 'Messages can be up to 2000 characters.',
    });
  });
});

describe('canReplyTo', () => {
  it('is false for someone who left or deleted their account', () => {
    expect(canReplyTo('Former member')).toBe(false);
    expect(canReplyTo('Deleted account')).toBe(false);
    expect(canReplyTo('Karima')).toBe(true);
  });
});

describe('rowsWithDays', () => {
  it('puts a day label after the oldest message of each day (so it shows above it)', () => {
    // Newest first: two on the 21st, one on the 20th.
    const rows = rowsWithDays(
      [message('c', at(21, 10)), message('b', at(21, 9)), message('a', at(20, 18))],
      NOW,
    );
    expect(rows.map((r) => (r.kind === 'day' ? `day:${r.label}` : r.message.id))).toEqual([
      'c',
      'b',
      'day:Today',
      'a',
      'day:Yesterday',
    ]);
  });

  it('is empty for no messages', () => {
    expect(rowsWithDays([], NOW)).toEqual([]);
  });
});

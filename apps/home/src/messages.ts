// apps/home/src/messages.ts
//
// Small pieces of "messages" know-how, kept apart from the screens so they can
// be tested:
//   - clockTime / dayLabel / listTime: plain words for when something was sent
//   - previewText / chatsSummary: the lines in the list of chats
//   - checkMessageText: is the message ready to send (1 to 2000 characters)?
//   - canReplyTo: you cannot send to someone who left or deleted their account
//   - rowsWithDays: puts a "Today" or "Thursday" label between days in a chat
// Owned by Bishal.

import type { ConversationItem, Message } from '@griho/shared';
import { timeAgo } from './joining';

export const MAX_MESSAGE_LENGTH = 2000;

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** "8:07 am" or "4:30 pm". */
export function clockTime(isoDate: string): string {
  const date = new Date(isoDate);
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;
  return `${hour12}:${minutes} ${hours < 12 ? 'am' : 'pm'}`;
}

/** "Today", "Yesterday", a weekday for the last week, or a date such as "Oct 8". */
export function dayLabel(isoDate: string, now: Date): string {
  const date = new Date(isoDate);
  if (sameDay(date, now)) return 'Today';
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(date, yesterday)) return 'Yesterday';
  const daysAgo = (now.getTime() - date.getTime()) / (24 * 60 * 60 * 1000);
  if (daysAgo >= 0 && daysAgo < 7) return WEEKDAYS[date.getDay()];
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

/** The time shown on a chat in the list: the clock time today, otherwise "Yesterday", "3 days ago"... */
export function listTime(isoDate: string, now: Date): string {
  return sameDay(new Date(isoDate), now) ? clockTime(isoDate) : timeAgo(isoDate, now);
}

/** The grey line under a person's name in the list of chats. */
export function previewText(last: ConversationItem['last_message']): string {
  if (!last) return 'No messages yet';
  if (last.deleted) return 'Message deleted';
  return last.preview ?? '';
}

/** "1 chat", "3 chats" or "No chats yet". */
export function chatsSummary(chats: ConversationItem[]): string {
  if (chats.length === 0) return 'No chats yet';
  return `${chats.length} ${chats.length === 1 ? 'chat' : 'chats'}`;
}

/** True when the text can be sent: not empty, and not longer than 2000 characters. */
export function checkMessageText(text: string): { ok: boolean; problem?: string } {
  const length = text.trim().length;
  if (length === 0) return { ok: false };
  if (length > MAX_MESSAGE_LENGTH) {
    return { ok: false, problem: `Messages can be up to ${MAX_MESSAGE_LENGTH} characters.` };
  }
  return { ok: true };
}

/** Can I still send to this person? Not if they left the building or deleted their account. */
export function canReplyTo(label: string): boolean {
  return label !== 'Former member' && label !== 'Deleted account';
}

/** One line in a chat: a message, or a day label. */
export type ChatRow =
  { kind: 'message'; message: Message } | { kind: 'day'; label: string; key: string };

/**
 * Turns messages (newest first, as the backend gives them) into rows for an upside-down
 * list: after each message that starts a new day, a day label follows, so it shows above.
 */
export function rowsWithDays(messages: Message[], now: Date): ChatRow[] {
  const rows: ChatRow[] = [];
  messages.forEach((message, index) => {
    rows.push({ kind: 'message', message });
    const older = messages[index + 1];
    if (!older || !sameDay(new Date(older.created_at), new Date(message.created_at))) {
      rows.push({
        kind: 'day',
        label: dayLabel(message.created_at, now),
        key: `day-${message.id}`,
      });
    }
  });
  return rows;
}

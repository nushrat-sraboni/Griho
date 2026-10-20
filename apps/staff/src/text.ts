// apps/staff/src/text.ts
//
// Two small helpers for showing people and times in plain words:
//   - timeAgo turns a date into "12 min ago", "1 hour ago", and so on.
//   - initialsOf turns a name into its first letters, like "Karim Hossain" -> "KH".
// They have no screens in them, so they are easy to test. Owned by Sraboni.

/** A date as plain words, like "12 min ago". `now` can be given for testing. */
export function timeAgo(iso: string, now: number = Date.now()): string {
  const minutes = Math.max(0, Math.round((now - Date.parse(iso)) / 60000));
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? '1 day ago' : `${days} days ago`;
}

/** The first letters of up to two words of a name, in capitals. */
export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return '?';
  const letters = words.length === 1 ? words[0].slice(0, 2) : words[0][0] + words[1][0];
  return letters.toUpperCase();
}

/** "Good morning", "Good afternoon", or "Good evening" for an hour from 0 to 23. */
export function greetingFor(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/**
 * True when a typed name matches a real name, ignoring capital letters and spaces
 * at the ends. The screens use it to switch on the "Remove" button. The backend
 * checks the name again on its own, so the screens are never the only guard.
 */
export function namesMatch(typed: string, actual: string): boolean {
  return typed.trim().toLowerCase() === actual.trim().toLowerCase();
}

// ---- Times for the chat screens ----

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// The start of a date's day in the phone's local time, as a number of milliseconds.
function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

// How many calendar days ago a date was (0 means today).
function daysAgo(iso: string, now: number): number {
  const day = 24 * 60 * 60 * 1000;
  return Math.round((startOfDay(new Date(now)) - startOfDay(new Date(iso))) / day);
}

/** The time of day, like "6:40 PM", in the phone's local time. */
export function clockTime(iso: string): string {
  const date = new Date(iso);
  const hours = date.getHours();
  const twelve = hours % 12 === 0 ? 12 : hours % 12;
  return `${twelve}:${String(date.getMinutes()).padStart(2, '0')} ${hours < 12 ? 'AM' : 'PM'}`;
}

/** The little heading above a day of messages: "TODAY", "YESTERDAY", or "12 OCT". */
export function dayLabel(iso: string, now: number = Date.now()): string {
  const ago = daysAgo(iso, now);
  if (ago <= 0) return 'TODAY';
  if (ago === 1) return 'YESTERDAY';
  const date = new Date(iso);
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`.toUpperCase();
}

/**
 * The time shown on a row of the chat list: the clock time for today, "Yesterday",
 * a short weekday like "Mon" for the last week, otherwise a date like "12 Oct".
 */
export function chatListTime(iso: string, now: number = Date.now()): string {
  const ago = daysAgo(iso, now);
  if (ago <= 0) return clockTime(iso);
  if (ago === 1) return 'Yesterday';
  const date = new Date(iso);
  if (ago < 7) return WEEKDAYS[date.getDay()];
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

// apps/home/src/greeting.ts
//
// Two tiny helpers for the top of the signed-in screen: the greeting
// ("Good morning") and the date label ("SATURDAY, OCTOBER 17"). They are
// written by hand, with no help from the phone's language settings, so the
// words are the same on every phone. Owned by Bishal.

const WEEKDAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const MONTHS = [
  'JANUARY',
  'FEBRUARY',
  'MARCH',
  'APRIL',
  'MAY',
  'JUNE',
  'JULY',
  'AUGUST',
  'SEPTEMBER',
  'OCTOBER',
  'NOVEMBER',
  'DECEMBER',
];

/** "Good morning" before noon, "Good afternoon" until 5pm, "Good evening" after. */
export function getGreeting(now: Date): string {
  const hour = now.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/** The date in capital letters, for example "SATURDAY, OCTOBER 17". */
export function formatEyebrowDate(now: Date): string {
  return `${WEEKDAYS[now.getDay()]}, ${MONTHS[now.getMonth()]} ${now.getDate()}`;
}

// apps/home/src/people.ts
//
// Small pieces of "people in a building" know-how, kept apart from the screens
// so they can be tested:
//   - canRemove: who the person may remove (PRD 5.7)
//   - peopleSummary / peopleCountSentence: short lines about the people list
//   - typedNameMatches: the check that the typed name is right (PRD rule 13);
//     the backend checks again, this only gives faster help on the screen
//   - exit warnings: what to say before leaving or deleting an account
// Owned by Bishal.

import type { MemberListItem, Role } from '@griho/shared';
import type { MembershipWithLastOwner } from './api';

/** Owners may remove tenants, the manager and guards. Nobody removes an owner. */
export function canRemove(myRole: Role, target: Pick<MemberListItem, 'role'>): boolean {
  return myRole === 'owner' && target.role !== 'owner';
}

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

/** "3 people · 1 guard", "3 people" or "No one else yet". */
export function peopleSummary(people: MemberListItem[], guards: MemberListItem[]): string {
  if (people.length === 0 && guards.length === 0) return 'No one else yet';
  if (people.length === 0) return plural(guards.length, 'guard', 'guards');
  const first = plural(people.length, 'person', 'people');
  return guards.length > 0 ? `${first} · ${plural(guards.length, 'guard', 'guards')}` : first;
}

/** The line under the "In <building>" heading. */
export function peopleCountSentence(people: MemberListItem[], guards: MemberListItem[]): string {
  const peopleText =
    people.length === 0 ? 'No other people' : plural(people.length, 'person', 'people');
  const guardText = guards.length > 0 ? ` and ${plural(guards.length, 'guard', 'guards')}` : '';
  return `${peopleText}${guardText}. You are not in this list.`;
}

/** True when the typed text is the same name, ignoring capital letters and spaces at the ends. */
export function typedNameMatches(typed: string, name: string): boolean {
  return typed.trim().toLowerCase() === name.trim().toLowerCase() && name.trim().length > 0;
}

/** The buildings that would be deleted if this person left or deleted their account. */
export function buildingsThatWouldBeDeleted(memberships: MembershipWithLastOwner[]): string[] {
  return memberships.filter((m) => m.is_last_owner).map((m) => m.building.name);
}

/** The buildings this person would just leave (they are not the only owner there). */
export function buildingsThatWouldBeLeft(memberships: MembershipWithLastOwner[]): string[] {
  return memberships.filter((m) => !m.is_last_owner).map((m) => m.building.name);
}

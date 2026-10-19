// apps/home/src/flats.ts
//
// Small pieces of "flat" know-how, kept apart from the screens so they can be
// tested:
//   - flatOwnerTone / flatOwnerText: who owns a flat, in plain words
//   - canRenameFlat / canClaimFlat: which buttons a flat shows (PRD 5.3, 5.11)
//   - flatSummary: the short line on the building page ("4 flats · 1 without an owner")
//   - checkFlatLabel: what to say when the flat name box is empty
// Owned by Bishal.

import type { Flat } from '@griho/shared';

/** Whose flat it is, from my point of view. */
export type OwnerTone = 'mine' | 'other' | 'none';

export function flatOwnerTone(flat: Flat, myAccountId: string): OwnerTone {
  if (flat.owner === null) return 'none';
  return flat.owner.account_id === myAccountId ? 'mine' : 'other';
}

/** "You own it", "Owned by Salma" or "No owner". */
export function flatOwnerText(flat: Flat, myAccountId: string): string {
  const tone = flatOwnerTone(flat, myAccountId);
  if (tone === 'none') return 'No owner';
  if (tone === 'mine') return 'You own it';
  return `Owned by ${flat.owner?.display_name ?? 'another owner'}`;
}

/** Only the flat's own owner may rename it (not any other owner of the building). */
export function canRenameFlat(flat: Flat, myAccountId: string): boolean {
  return flat.owner !== null && flat.owner.account_id === myAccountId;
}

/** Only a flat with no owner can be claimed. */
export function canClaimFlat(flat: Flat): boolean {
  return flat.owner === null;
}

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

/** "4 flats · 1 without an owner", "3 flats", or "No flats yet". */
export function flatSummary(flats: Flat[]): string {
  if (flats.length === 0) return 'No flats yet';
  const withoutOwner = flats.filter((flat) => flat.owner === null).length;
  const total = plural(flats.length, 'flat', 'flats');
  return withoutOwner > 0 ? `${total} · ${withoutOwner} without an owner` : total;
}

/** "4 flats in this building." for the line under the Flats heading. */
export function flatCountSentence(flats: Flat[]): string {
  if (flats.length === 0) return 'No flats yet.';
  return `${plural(flats.length, 'flat', 'flats')} in this building.`;
}

/** Says what is wrong with the flat name box, or nothing when it is fine. */
export function checkFlatLabel(label: string): string | undefined {
  return label.trim() ? undefined : 'Please type the flat name.';
}

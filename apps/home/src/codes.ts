// apps/home/src/codes.ts
//
// Small pieces of "join code" know-how, kept apart from the screens so they can
// be tested:
//   - codeTypeLabel / codeStatus / usesLeftText: the words shown for a code
//   - codesSummary / codesCountSentence: short lines about a building's codes
//   - CODE_CHOICES: the four kinds of code and who each one is for
//   - parseMaxUses / checkCodeForm: checks for the "Make a code" form
//   - shareMessage: the text sent when a code is shared
// A code's used count only goes up when a request is approved (PRD 5.4); turning
// a code off or deleting it blocks new requests only. Owned by Bishal.

import type { CodeInfo, CodeType } from '@griho/shared';

type CodeLike = Pick<CodeInfo, 'type' | 'flat'>;
type UsesLike = Pick<CodeInfo, 'max_uses' | 'used_count' | 'remaining'>;

/** "Building code", "Flat code · A-1", "Manager code" or "Guard code". */
export function codeTypeLabel(code: CodeLike): string {
  switch (code.type) {
    case 'building':
      return 'Building code';
    case 'flat':
      return code.flat ? `Flat code · ${code.flat.label}` : 'Flat code';
    case 'manager':
      return 'Manager code';
    case 'guard':
      return 'Guard code';
  }
}

export type CodeStatusTone = 'active' | 'off' | 'usedUp';

/** What to show for a code's state. A turned-off code says so even if it is also used up. */
export function codeStatus(code: Pick<CodeInfo, 'status' | 'remaining'>): {
  text: string;
  tone: CodeStatusTone;
} {
  if (code.status === 'disabled') return { text: 'Turned off', tone: 'off' };
  if (code.remaining <= 0) return { text: 'Used up', tone: 'usedUp' };
  return { text: 'Active', tone: 'active' };
}

function usesWord(count: number): string {
  return count === 1 ? 'use' : 'uses';
}

/** "3 of 5 uses left". */
export function usesLeftText(code: UsesLike): string {
  return `${code.remaining} of ${code.max_uses} ${usesWord(code.max_uses)} left`;
}

/** "2 of 5". */
export function usedText(code: UsesLike): string {
  return `${code.used_count} of ${code.max_uses}`;
}

/** "3 uses" or "1 use". */
export function leftText(code: UsesLike): string {
  return `${code.remaining} ${usesWord(code.remaining)}`;
}

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

/** "5 codes · 1 turned off", "3 codes" or "No codes yet". */
export function codesSummary(codes: CodeInfo[]): string {
  if (codes.length === 0) return 'No codes yet';
  const turnedOff = codes.filter((code) => code.status === 'disabled').length;
  const total = plural(codes.length, 'code', 'codes');
  return turnedOff > 0 ? `${total} · ${turnedOff} turned off` : total;
}

/** The line under the "Your codes" heading. */
export function codesCountSentence(codes: CodeInfo[]): string {
  if (codes.length === 0) return 'No codes yet.';
  return `${plural(codes.length, 'code', 'codes')} in this building. Tap one to share it or turn it off.`;
}

/** The four kinds of code an owner can make, and who each one is for. */
export const CODE_CHOICES: { type: CodeType; title: string; help: string }[] = [
  { type: 'building', title: 'Building code', help: 'For other owners of this building' },
  { type: 'flat', title: 'Flat code', help: 'For a tenant of one flat' },
  {
    type: 'manager',
    title: 'Manager code',
    help: 'For the building’s manager (Griho Staff app)',
  },
  { type: 'guard', title: 'Guard code', help: 'For guards (Griho Staff app)' },
];

export const MAX_USES_LIMIT = 1000;

/** Reads the "how many people" box. Gives the number, or a plain sentence saying what is wrong. */
export function parseMaxUses(text: string): { value?: number; problem?: string } {
  const trimmed = text.trim();
  if (!trimmed) return { problem: 'Please type how many people can use the code.' };
  if (!/^\d+$/.test(trimmed)) {
    return { problem: `Please type a whole number from 1 to ${MAX_USES_LIMIT}.` };
  }
  const value = Number(trimmed);
  if (value < 1 || value > MAX_USES_LIMIT) {
    return { problem: `Please type a whole number from 1 to ${MAX_USES_LIMIT}.` };
  }
  return { value };
}

export type CodeFormProblems = { flat?: string; uses?: string };

/** Checks the "Make a code" form. Gives the problems found, and the number of uses when it is fine. */
export function checkCodeForm(form: { type: CodeType; flatId: string | null; usesText: string }): {
  problems: CodeFormProblems;
  maxUses?: number;
} {
  const problems: CodeFormProblems = {};
  if (form.type === 'flat' && !form.flatId) problems.flat = 'Please pick a flat.';
  const uses = parseMaxUses(form.usesText);
  if (uses.problem) problems.uses = uses.problem;
  return { problems, maxUses: uses.value };
}

/** The message sent when a code is shared. */
export function shareMessage(code: Pick<CodeInfo, 'value'>, buildingName: string): string {
  return `Join ${buildingName} on Griho. Your code is ${code.value}.`;
}

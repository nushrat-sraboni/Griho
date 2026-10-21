// apps/home/src/joining.ts
//
// Small pieces of "joining a building" know-how, kept apart from the screens so
// they can be tested:
//   - roleWords: "Tenant · Flat A-1", "Owner", "Manager", "Guard"
//   - timeAgo: "Today", "Yesterday", "2 days ago"
//   - requestStatusLine: the sentence about a request I sent
//   - waitingSummary / requestsCountSentence: short lines about waiting requests
//   - checkJoinCode: what to say when the code box is empty
//   - joinedMessage / declinedMessage: the green message after an owner answers
// Owned by Bishal.

import type { JoinRequest, PendingRequestForApprover, Role } from '@griho/shared';

/** "Tenant · Flat A-1", "Owner", "Manager" or "Guard". */
export function roleWords(role: Role, flatLabel: string | null): string {
  switch (role) {
    case 'owner':
      return 'Owner';
    case 'tenant':
      return flatLabel ? `Tenant · Flat ${flatLabel}` : 'Tenant';
    case 'manager':
      return 'Manager';
    case 'guard':
      return 'Guard';
  }
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** How long ago something happened, in plain words. */
export function timeAgo(isoDate: string, now: Date): string {
  const days = Math.floor((now.getTime() - new Date(isoDate).getTime()) / DAY_MS);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
}

/** What to tell the person about a request they sent. */
export function requestStatusLine(request: Pick<JoinRequest, 'status'>): string {
  switch (request.status) {
    case 'pending':
      return 'An owner has not answered yet.';
    case 'approved':
      return 'An owner said yes. You are in.';
    case 'rejected':
      return 'An owner said no.';
    case 'cancelled':
      return 'This request was cancelled.';
  }
}

/** "2 waiting for your answer" or "Nothing waiting". */
export function waitingSummary(count: number): string {
  return count === 0 ? 'Nothing waiting' : `${count} waiting for your answer`;
}

/** The line under the "Waiting for you" heading. */
export function requestsCountSentence(count: number): string {
  if (count === 0) return 'No requests are waiting.';
  const noun = count === 1 ? '1 request' : `${count} requests`;
  return `${noun}. Anyone who says yes becomes part of the building.`;
}

/** Says what is wrong with the join code box, or nothing when it is fine. */
export function checkJoinCode(text: string): string | undefined {
  return text.trim() ? undefined : 'Please type the code.';
}

function asWords(role: Role, flatLabel: string | null): string {
  switch (role) {
    case 'owner':
      return 'an owner';
    case 'tenant':
      return flatLabel ? `a tenant of flat ${flatLabel}` : 'a tenant';
    case 'manager':
      return 'the manager';
    case 'guard':
      return 'a guard';
  }
}

/** "Nina joined Green Tower as a tenant of flat A-1." */
export function joinedMessage(
  request: Pick<PendingRequestForApprover, 'requester_name' | 'role' | 'flat_label'>,
  buildingName: string,
): string {
  return `${request.requester_name} joined ${buildingName} as ${asWords(request.role, request.flat_label)}.`;
}

/** "You said no to Omar." */
export function declinedMessage(
  request: Pick<PendingRequestForApprover, 'requester_name'>,
): string {
  return `You said no to ${request.requester_name}.`;
}

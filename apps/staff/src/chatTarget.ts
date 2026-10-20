// apps/staff/src/chatTarget.ts
//
// The small description of "who I am chatting with" that the chat screens pass to
// each other: the chat's id, the person's id and name, and their role and flat if
// they are still in the building. A person who left has role null and is shown as
// "Former member". It also holds the plain words for each role. Owned by Sraboni.

import type { Role } from '@griho/shared';

export type ChatTarget = {
  conversationId: string;
  accountId: string;
  name: string;
  /** null means the person left the building ("Former member"). */
  role: Role | null;
  flatLabel: string | null;
};

const ROLE_WORDS: Record<Role, string> = {
  owner: 'Owner',
  tenant: 'Tenant',
  manager: 'Manager',
  guard: 'Guard',
};

/** The role as one plain word, like "Guard". */
export function roleWord(role: Role): string {
  return ROLE_WORDS[role];
}

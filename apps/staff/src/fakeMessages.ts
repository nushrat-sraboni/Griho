// apps/staff/src/fakeMessages.ts
//
// A pretend backend for chatting in Griho Staff. Like fakeBackend.ts, it keeps
// everything in memory so we can build and test the chat screens before Shafin's real
// backend exists. It copies these functions from docs/api-contract.md:
// list_members, get_or_create_conversation, list_conversations, get_messages,
// send_message, and delete_message.
//
// ONE DIFFERENCE FROM THE CONTRACT: here guards can send and receive messages, and
// can message anyone in their building (owners, tenants, the manager, other guards).
// The contract and the product rules still say guards cannot message, so Shafin must
// decide and update them before the real backend is built.
//
// The pretend people are the building's owners, tenants, and manager, plus the guards
// in the pretend guard list. Everything stays inside one building.
// Delete this file when the real backend is ready. Owned by Sraboni.

import type { ConversationItem, MemberListItem, Message, Role } from '@griho/shared';
import { getCurrentAccount, getKnownGuards, getMyMembership } from './fakeBackend';

// ---- The pretend people ----

function person(id: string, name: string, role: Role, flat: string | null): MemberListItem {
  return {
    account_id: `person-${id}`,
    membership_id: `person-membership-${id}`,
    display_name: name,
    role,
    flat_label: flat,
  };
}

// Owners and tenants never change in the pretend building.
const OWNERS_AND_TENANTS: MemberListItem[] = [
  person('owner-1', 'Nadia Rahman', 'owner', '10B'),
  person('owner-2', 'Mahmud Hasan', 'owner', '9B'),
  person('tenant-1', 'Farhana Islam', 'tenant', '8A'),
  person('tenant-2', 'Jamal Uddin', 'tenant', '9B'),
];

// The pretend manager. A guard can message them. A logged-in manager is the
// manager, so this person is only listed for guards.
const MANAGER = person('manager', 'Mahin Islam', 'manager', null);

// ---- The pretend chats ----

type Conversation = { id: string; a: string; b: string };

type StoredMessage = {
  id: string;
  number: number;
  conversation_id: string;
  sender_account_id: string;
  body: string;
  deleted: boolean;
  created_at: string;
};

const conversations = new Map<string, Conversation>();
let storedMessages: StoredMessage[] = [];
let messageCounter = 0;
// Accounts that already got their starter chats.
const seededFor = new Set<string>();

/** Puts the pretend chats back to how they start. Tests use this too. */
export function resetMessagesDataForTesting(): void {
  conversations.clear();
  storedMessages = [];
  messageCounter = 0;
  seededFor.clear();
}

// ---- Helpers ----

// The logged-in person, who must belong to the building as a manager or a guard.
function requireViewer(): { id: string; name: string; role: Role } {
  const account = getCurrentAccount();
  if (!account) {
    throw new Error('NOT_AUTHENTICATED');
  }
  const membership = getMyMembership();
  if (!membership) {
    throw new Error('NOT_A_MEMBER');
  }
  const viewer = { id: account.id, name: account.display_name, role: membership.role };
  // The first time a person uses chat, give them their starter chats.
  ensureSeeded(viewer);
  return viewer;
}

// Everyone the viewer can write to: the whole building except themselves.
function peopleFor(viewer: { id: string; role: Role }): MemberListItem[] {
  return [
    ...OWNERS_AND_TENANTS,
    ...(viewer.role === 'guard' ? [MANAGER] : []),
    ...getKnownGuards(),
  ].filter((p) => p.account_id !== viewer.id);
}

function conversationIdFor(x: string, y: string): string {
  return `conversation:${[x, y].sort().join('|')}`;
}

function otherSide(conversation: Conversation, viewerId: string): string {
  return conversation.a === viewerId ? conversation.b : conversation.a;
}

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60000).toISOString();
}

function addMessage(conversationId: string, senderId: string, body: string, minutes: number) {
  messageCounter += 1;
  storedMessages.push({
    id: `message-${messageCounter}`,
    number: messageCounter,
    conversation_id: conversationId,
    sender_account_id: senderId,
    body,
    deleted: false,
    created_at: minutesAgo(minutes),
  });
}

// Makes a chat with starter messages. `lines` says who spoke ('me' or 'them').
function seedChat(
  viewerId: string,
  otherName: string,
  people: MemberListItem[],
  lines: ['me' | 'them', string, number][],
) {
  const other = people.find((p) => p.display_name === otherName);
  if (!other) return;
  const id = conversationIdFor(viewerId, other.account_id);
  conversations.set(id, { id, a: viewerId, b: other.account_id });
  for (const [who, body, minutes] of lines) {
    addMessage(id, who === 'me' ? viewerId : other.account_id, body, minutes);
  }
}

// Gives a person a few starter chats the first time they look, so the screens are not empty.
function ensureSeeded(viewer: { id: string; role: Role }) {
  if (seededFor.has(viewer.id)) return;
  seededFor.add(viewer.id);
  const people = peopleFor(viewer);
  if (viewer.role === 'manager') {
    seedChat(viewer.id, 'Rafiq Ahmed', people, [
      ['them', 'Good evening. The lock on the back gate is jammed again.', 400],
      ['me', 'Thanks for telling me. I will send someone to fix it.', 396],
      ['them', 'Okay. I will keep watch at that gate until then.', 394],
    ]);
    seedChat(viewer.id, 'Nadia Rahman', people, [
      ['them', 'Hi, did you see the update about the water maintenance?', 1700],
      ['me', 'Yes, thanks for letting me know. I will plan around it.', 1690],
      ['them', 'Thanks. I will tell the other owners too.', 1685],
    ]);
    seedChat(viewer.id, 'Mahmud Hasan', people, [
      ['them', 'Could we talk about the water update?', 1900],
    ]);
    seedChat(viewer.id, 'Farhana Islam', people, [
      ['them', 'Thank you for letting me know.', 4300],
    ]);
  } else {
    seedChat(viewer.id, 'Mahin Islam', people, [
      ['them', 'The repair is booked for tomorrow at 10.', 40],
    ]);
    seedChat(viewer.id, 'Rafiq Ahmed', people, [
      ['them', 'I can swap shifts with you on Friday.', 1900],
    ]);
    seedChat(viewer.id, 'Nadia Rahman', people, [
      ['them', 'A parcel is waiting at the gate.', 4300],
    ]);
    seedChat(viewer.id, 'Farhana Islam', people, [
      ['them', 'Thank you for opening the gate.', 5800],
    ]);
  }
}

// The name to show for someone. A person who left the building shows as "Former member".
function labelFor(accountId: string, viewer: { id: string; name: string; role: Role }): string {
  if (accountId === viewer.id) return viewer.name;
  const known = [...OWNERS_AND_TENANTS, MANAGER, ...getKnownGuards()].find(
    (p) => p.account_id === accountId,
  );
  return known ? known.display_name : 'Former member';
}

function toMessage(
  stored: StoredMessage,
  viewer: { id: string; name: string; role: Role },
): Message {
  return {
    id: stored.id,
    conversation_id: stored.conversation_id,
    sender_account_id: stored.sender_account_id,
    sender_label: labelFor(stored.sender_account_id, viewer),
    is_mine: stored.sender_account_id === viewer.id,
    body: stored.deleted ? null : stored.body,
    deleted: stored.deleted,
    created_at: stored.created_at,
  };
}

// A chat the viewer is part of, or an error.
function requireMyConversation(conversationId: string, viewerId: string): Conversation {
  const conversation = conversations.get(conversationId);
  if (!conversation || (conversation.a !== viewerId && conversation.b !== viewerId)) {
    throw new Error('NOT_FOUND');
  }
  return conversation;
}

// ---- The functions the screens call ----

/** Everyone the logged-in person may message: owners, tenants, the manager, and guards. */
export async function listMembers(): Promise<MemberListItem[]> {
  const viewer = requireViewer();
  return peopleFor(viewer);
}

/** Open the chat with someone, or start it if it is new. */
export async function getOrCreateConversation(
  otherAccountId: string,
): Promise<{ conversation_id: string }> {
  const viewer = requireViewer();
  if (otherAccountId === viewer.id) {
    throw new Error('CANNOT_MESSAGE_SELF');
  }
  if (!peopleFor(viewer).some((p) => p.account_id === otherAccountId)) {
    throw new Error('NOT_IN_SAME_BUILDING');
  }
  const id = conversationIdFor(viewer.id, otherAccountId);
  if (!conversations.has(id)) {
    conversations.set(id, { id, a: viewer.id, b: otherAccountId });
  }
  return { conversation_id: id };
}

/** The logged-in person's chats, latest activity first. */
export async function listConversations(): Promise<ConversationItem[]> {
  const viewer = requireViewer();
  const items = [...conversations.values()]
    .filter((c) => c.a === viewer.id || c.b === viewer.id)
    .map((c) => {
      const otherId = otherSide(c, viewer.id);
      const last = storedMessages
        .filter((m) => m.conversation_id === c.id)
        .sort((x, y) => y.number - x.number)[0];
      return {
        item: {
          conversation_id: c.id,
          other: { account_id: otherId, label: labelFor(otherId, viewer) },
          last_message: last
            ? {
                preview: last.deleted ? null : last.body,
                deleted: last.deleted,
                created_at: last.created_at,
              }
            : null,
        } satisfies ConversationItem,
        // An empty chat counts as the newest thing, so it shows at the top.
        time: last ? Date.parse(last.created_at) : Number.MAX_SAFE_INTEGER,
        number: last ? last.number : Number.MAX_SAFE_INTEGER,
      };
    })
    .sort((x, y) => y.time - x.time || y.number - x.number);
  return items.map((entry) => entry.item);
}

/** Messages of one chat, newest first. `limit` is 1 to 100 (default 50). */
export async function getMessages(
  conversationId: string,
  before?: string,
  limit: number = 50,
): Promise<Message[]> {
  const viewer = requireViewer();
  requireMyConversation(conversationId, viewer.id);
  if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new Error('INVALID_INPUT');
  }
  return storedMessages
    .filter((m) => m.conversation_id === conversationId)
    .filter((m) => !before || Date.parse(m.created_at) < Date.parse(before))
    .sort((x, y) => y.number - x.number)
    .slice(0, limit)
    .map((m) => toMessage(m, viewer));
}

/** Send a plain text message of 1 to 2000 letters. */
export async function sendMessage(conversationId: string, body: string): Promise<Message> {
  const viewer = requireViewer();
  const conversation = requireMyConversation(conversationId, viewer.id);
  const text = body.trim();
  if (text.length < 1 || text.length > 2000) {
    throw new Error('INVALID_INPUT');
  }
  // Nobody can write to someone who has left the building.
  const otherId = otherSide(conversation, viewer.id);
  if (!peopleFor(viewer).some((p) => p.account_id === otherId)) {
    throw new Error('NOT_ALLOWED');
  }
  addMessage(conversationId, viewer.id, text, 0);
  return toMessage(storedMessages[storedMessages.length - 1], viewer);
}

/** Delete a message I sent. It disappears for both people and shows "Message deleted". */
export async function deleteMessage(messageId: string): Promise<{ ok: true }> {
  const viewer = requireViewer();
  const message = storedMessages.find((m) => m.id === messageId);
  if (!message) {
    throw new Error('NOT_FOUND');
  }
  requireMyConversation(message.conversation_id, viewer.id);
  if (message.sender_account_id !== viewer.id) {
    throw new Error('NOT_ALLOWED');
  }
  if (message.deleted) {
    throw new Error('MESSAGE_ALREADY_DELETED');
  }
  message.deleted = true;
  message.body = '';
  return { ok: true };
}

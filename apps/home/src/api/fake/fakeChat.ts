// apps/home/src/api/fake/fakeChat.ts
//
// The part of the PRETEND KITCHEN that deals with DIRECT MESSAGES
// (docs/api-contract.md, 4.7):
//   getOrCreateConversation, listConversations, getMessages, sendMessage,
//   deleteMessage.
// Rules it follows:
//   - a chat is between exactly two people of the SAME building, one chat per
//     pair per building, never with yourself
//   - EVERYONE in the building can message everyone, guards included (the team
//     agreed this; the written PRD and contract are being updated to match)
//   - names are worked out when reading: a person who left shows as "Former
//     member", a deleted account as "Deleted account" (architecture 6.2)
//   - you cannot send to someone who is no longer in the building, but you can
//     still read the old messages
//   - a message is 1 to 2000 characters; getMessages gives 50 at a time, newest
//     first; deleting your own message removes its words for EVERYONE
// fakeApi.ts wraps each dish below so it waits a moment like a real network call.
// Owned by Bishal.

import type { ConversationItem, ErrorCode, Message } from '@griho/shared';
import type { Ok } from '../api';
import type {
  AccountRecord,
  ConversationRecord,
  FakeDatabase,
  MembershipRecord,
  MessageRecord,
} from './fakeDatabase';
import { makeId } from './fakeDatabase';

/** What this file needs from the main pretend kitchen. */
export type ChatContext = {
  db: FakeDatabase;
  requireMe: () => AccountRecord;
  myMembership: (accountId: string, buildingId: string) => MembershipRecord | undefined;
};

export const MAX_MESSAGE_LENGTH = 2000;
const DEFAULT_PAGE = 50;
const MAX_PAGE = 100;
const PREVIEW_LENGTH = 80;

function fail(code: ErrorCode): never {
  throw new Error(code);
}

export function createChatDishes(ctx: ChatContext) {
  const { db, requireMe, myMembership } = ctx;

  /** The name to show for a person, worked out now (never stored). */
  function labelFor(accountId: string, buildingId: string): string {
    const account = db.accounts.find((a) => a.id === accountId);
    if (!account || account.deleted) return 'Deleted account';
    return myMembership(accountId, buildingId) ? account.displayName : 'Former member';
  }

  /** The chat, if I am one of its two people. Otherwise it does not exist for me. */
  function myConversation(id: string, me: AccountRecord): ConversationRecord {
    const conversation = db.conversations.find((c) => c.id === id);
    if (!conversation || (conversation.accountAId !== me.id && conversation.accountBId !== me.id)) {
      fail('NOT_FOUND');
    }
    return conversation;
  }

  function otherOf(conversation: ConversationRecord, me: AccountRecord): string {
    return conversation.accountAId === me.id ? conversation.accountBId : conversation.accountAId;
  }

  function toMessage(record: MessageRecord, me: AccountRecord): Message {
    return {
      id: record.id,
      conversation_id: record.conversationId,
      sender_account_id: record.senderAccountId,
      sender_label: labelFor(record.senderAccountId, record.buildingId),
      is_mine: record.senderAccountId === me.id,
      body: record.deleted ? null : record.body,
      deleted: record.deleted,
      created_at: record.createdAt,
    };
  }

  function getOrCreateConversation({
    building_id,
    other_account_id,
  }: {
    building_id: string;
    other_account_id: string;
  }): { conversation_id: string } {
    const me = requireMe();
    if (!myMembership(me.id, building_id)) fail('NOT_A_MEMBER');
    if (other_account_id === me.id) fail('CANNOT_MESSAGE_SELF');
    if (!myMembership(other_account_id, building_id)) fail('NOT_IN_SAME_BUILDING');

    const existing = db.conversations.find(
      (c) =>
        c.buildingId === building_id &&
        ((c.accountAId === me.id && c.accountBId === other_account_id) ||
          (c.accountAId === other_account_id && c.accountBId === me.id)),
    );
    if (existing) return { conversation_id: existing.id };

    const created: ConversationRecord = {
      id: makeId(db, 'conv'),
      buildingId: building_id,
      accountAId: me.id,
      accountBId: other_account_id,
    };
    db.conversations.push(created);
    return { conversation_id: created.id };
  }

  function listConversations({ building_id }: { building_id: string }): ConversationItem[] {
    const me = requireMe();
    if (!myMembership(me.id, building_id)) fail('NOT_A_MEMBER');
    return db.conversations
      .filter(
        (c) => c.buildingId === building_id && (c.accountAId === me.id || c.accountBId === me.id),
      )
      .map((conversation) => {
        const messages = db.messages.filter((m) => m.conversationId === conversation.id);
        const last = messages[messages.length - 1];
        const otherId = otherOf(conversation, me);
        const item: ConversationItem = {
          conversation_id: conversation.id,
          other: { account_id: otherId, label: labelFor(otherId, building_id) },
          last_message: last
            ? {
                preview: last.deleted ? null : (last.body ?? '').slice(0, PREVIEW_LENGTH),
                deleted: last.deleted,
                created_at: last.createdAt,
              }
            : null,
        };
        return item;
      })
      .sort((a, b) =>
        (b.last_message?.created_at ?? '').localeCompare(a.last_message?.created_at ?? ''),
      ); // Latest activity first.
  }

  function getMessages({
    conversation_id,
    before,
    limit,
  }: {
    conversation_id: string;
    before?: string;
    limit?: number;
  }): Message[] {
    const me = requireMe();
    const conversation = myConversation(conversation_id, me);
    if (!myMembership(me.id, conversation.buildingId)) fail('NOT_A_MEMBER');
    const size = limit ?? DEFAULT_PAGE;
    if (!Number.isInteger(size) || size < 1 || size > MAX_PAGE) fail('INVALID_INPUT');

    return db.messages
      .filter((m) => m.conversationId === conversation.id)
      .filter((m) => (before ? m.createdAt < before : true))
      .slice() // Newest first.
      .reverse()
      .slice(0, size)
      .map((m) => toMessage(m, me));
  }

  function sendMessage({
    conversation_id,
    body,
  }: {
    conversation_id: string;
    body: string;
  }): Message {
    const me = requireMe();
    const conversation = myConversation(conversation_id, me);
    const text = body.trim();
    if (text.length < 1 || text.length > MAX_MESSAGE_LENGTH) fail('INVALID_INPUT');
    // Both people must still be in the building to send a new message.
    if (
      !myMembership(me.id, conversation.buildingId) ||
      !myMembership(otherOf(conversation, me), conversation.buildingId)
    ) {
      fail('NOT_ALLOWED');
    }
    const record: MessageRecord = {
      id: makeId(db, 'msg'),
      conversationId: conversation.id,
      buildingId: conversation.buildingId,
      senderAccountId: me.id,
      body: text,
      deleted: false,
      createdAt: new Date().toISOString(),
    };
    db.messages.push(record);
    return toMessage(record, me);
  }

  function deleteMessage({ message_id }: { message_id: string }): Ok {
    const me = requireMe();
    const record = db.messages.find((m) => m.id === message_id);
    if (!record) fail('NOT_FOUND');
    myConversation(record.conversationId, me); // Not my chat: it does not exist for me.
    if (record.senderAccountId !== me.id) fail('NOT_ALLOWED'); // Only my own messages.
    if (record.deleted) fail('MESSAGE_ALREADY_DELETED');
    record.deleted = true; // The words are removed for everyone.
    record.body = null;
    return { ok: true };
  }

  return {
    getOrCreateConversation,
    listConversations,
    getMessages,
    sendMessage,
    deleteMessage,
  };
}

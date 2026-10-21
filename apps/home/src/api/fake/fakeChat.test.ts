// apps/home/src/api/fake/fakeChat.test.ts
//
// Small checks that prove the pretend kitchen follows the rules for direct
// messages (docs/api-contract.md, 4.7), with the team's decision that EVERYONE
// in a building can message everyone, guards included. Each test starts with a
// fresh made-up notebook. Run them with: npm test

import { describe, expect, it } from 'vitest';
import { getErrorCode } from '@griho/shared';
import type { GrihoApi } from '../api';
import { createFakeApi } from './fakeApi';
import { createSeededDatabase, FAKE_PASSWORD, SEED } from './seed';

function setup() {
  const database = createSeededDatabase();
  const api = createFakeApi({ app: 'home', delayMs: 0, database });
  return { api, database };
}

async function loginAs(api: GrihoApi, person: keyof typeof SEED.emails) {
  return api.signIn({ email: SEED.emails[person], password: FAKE_PASSWORD });
}

async function errorCodeOf(promise: Promise<unknown>): Promise<string> {
  try {
    await promise;
  } catch (error) {
    return getErrorCode(error as Error);
  }
  return 'NO_ERROR';
}

describe('starting a chat', () => {
  it('opens the chat that already exists between two people, from either side', async () => {
    const { api } = setup();
    await loginAs(api, 'rahim');
    const first = await api.getOrCreateConversation({
      building_id: SEED.building,
      other_account_id: SEED.accounts.karima,
    });
    expect(first.conversation_id).toBe(SEED.conversationRahimKarima);
    await loginAs(api, 'karima');
    const second = await api.getOrCreateConversation({
      building_id: SEED.building,
      other_account_id: SEED.accounts.rahim,
    });
    expect(second.conversation_id).toBe(SEED.conversationRahimKarima);
  });

  it('makes only ONE chat per pair, however many times it is opened', async () => {
    const { api, database } = setup();
    await loginAs(api, 'salma');
    const a = await api.getOrCreateConversation({
      building_id: SEED.building,
      other_account_id: SEED.accounts.jamal,
    });
    const b = await api.getOrCreateConversation({
      building_id: SEED.building,
      other_account_id: SEED.accounts.jamal,
    });
    expect(a.conversation_id).toBe(b.conversation_id);
    expect(database.conversations).toHaveLength(2);
  });

  it('lets everyone message everyone, guards included', async () => {
    const { api } = setup();
    await loginAs(api, 'karima');
    const toGuard = await api.getOrCreateConversation({
      building_id: SEED.building,
      other_account_id: SEED.accounts.gopal,
    });
    await loginAs(api, 'gopal');
    const fromGuard = await api.getOrCreateConversation({
      building_id: SEED.building,
      other_account_id: SEED.accounts.karima,
    });
    expect(fromGuard.conversation_id).toBe(toGuard.conversation_id);
    await expect(
      api.sendMessage({ conversation_id: toGuard.conversation_id, body: 'Hello from the gate' }),
    ).resolves.toMatchObject({ is_mine: true, body: 'Hello from the gate' });
  });

  it('refuses yourself, outsiders and people of other buildings', async () => {
    const { api } = setup();
    await loginAs(api, 'rahim');
    expect(
      await errorCodeOf(
        api.getOrCreateConversation({
          building_id: SEED.building,
          other_account_id: SEED.accounts.rahim,
        }),
      ),
    ).toBe('CANNOT_MESSAGE_SELF');
    expect(
      await errorCodeOf(
        api.getOrCreateConversation({
          building_id: SEED.building,
          other_account_id: SEED.accounts.nina,
        }),
      ),
    ).toBe('NOT_IN_SAME_BUILDING');
    await loginAs(api, 'nina');
    expect(
      await errorCodeOf(
        api.getOrCreateConversation({
          building_id: SEED.building,
          other_account_id: SEED.accounts.rahim,
        }),
      ),
    ).toBe('NOT_A_MEMBER');
  });
});

describe('the list of chats', () => {
  it('shows my chats with the other person and the last message', async () => {
    const { api } = setup();
    await loginAs(api, 'rahim');
    const chats = await api.listConversations({ building_id: SEED.building });
    expect(chats).toHaveLength(1);
    expect(chats[0].other.label).toBe('Karima');
    expect(chats[0].last_message).toMatchObject({ preview: 'Great, thank you!', deleted: false });
  });

  it('puts the chat with the newest message first', async () => {
    const { api } = setup();
    await loginAs(api, 'rahim');
    const { conversation_id } = await api.getOrCreateConversation({
      building_id: SEED.building,
      other_account_id: SEED.accounts.salma,
    });
    await api.sendMessage({ conversation_id, body: 'Meeting at 6?' });
    const chats = await api.listConversations({ building_id: SEED.building });
    expect(chats.map((c) => c.other.label)).toEqual(['Salma', 'Karima']);
  });

  it('does not show other people’s chats', async () => {
    const { api } = setup();
    await loginAs(api, 'salma');
    expect(await api.listConversations({ building_id: SEED.building })).toEqual([]);
  });

  it('shows "Former member" and "Deleted account" in place of a name, worked out when reading', async () => {
    const { api } = setup();
    await loginAs(api, 'rahim');
    await api.removeMember({ membership_id: SEED.memberships.karima, typed_name: 'Karima' });
    expect((await api.listConversations({ building_id: SEED.building }))[0].other.label).toBe(
      'Former member',
    );
    await loginAs(api, 'karima');
    await api.deleteAccount({ typed_name: 'Karima' });
    await loginAs(api, 'rahim');
    expect((await api.listConversations({ building_id: SEED.building }))[0].other.label).toBe(
      'Deleted account',
    );
  });
});

describe('reading messages', () => {
  it('gives the newest first, with deleted ones shown as deleted', async () => {
    const { api } = setup();
    await loginAs(api, 'rahim');
    const messages = await api.getMessages({ conversation_id: SEED.conversationRahimKarima });
    expect(messages.map((m) => m.id)).toEqual(['msg-4', 'msg-3', 'msg-2', 'msg-1']);
    expect(messages[1]).toMatchObject({ deleted: true, body: null });
    expect(messages[2]).toMatchObject({ is_mine: true, sender_label: 'Rahim' });
    expect(messages[3]).toMatchObject({ is_mine: false, sender_label: 'Karima' });
  });

  it('pages: a limit and "before" give older messages', async () => {
    const { api } = setup();
    await loginAs(api, 'rahim');
    const page = await api.getMessages({ conversation_id: SEED.conversationRahimKarima, limit: 2 });
    expect(page.map((m) => m.id)).toEqual(['msg-4', 'msg-3']);
    const older = await api.getMessages({
      conversation_id: SEED.conversationRahimKarima,
      before: page[1].created_at,
      limit: 2,
    });
    expect(older.map((m) => m.id)).toEqual(['msg-2', 'msg-1']);
  });

  it('refuses a silly page size', async () => {
    const { api } = setup();
    await loginAs(api, 'rahim');
    for (const limit of [0, 101, 1.5]) {
      expect(
        await errorCodeOf(
          api.getMessages({ conversation_id: SEED.conversationRahimKarima, limit }),
        ),
      ).toBe('INVALID_INPUT');
    }
  });

  it('hides a chat from people who are not in it', async () => {
    const { api } = setup();
    await loginAs(api, 'salma');
    expect(
      await errorCodeOf(api.getMessages({ conversation_id: SEED.conversationRahimKarima })),
    ).toBe('NOT_FOUND');
  });

  it('still lets me read old messages after the other person left', async () => {
    const { api } = setup();
    await loginAs(api, 'karima');
    await api.leaveBuilding({ building_id: SEED.building, typed_name: 'Karima' });
    await loginAs(api, 'rahim');
    const messages = await api.getMessages({ conversation_id: SEED.conversationRahimKarima });
    expect(messages[0].sender_label).toBe('Former member');
  });
});

describe('sending and deleting', () => {
  it('sends a trimmed message that shows up first', async () => {
    const { api } = setup();
    await loginAs(api, 'rahim');
    const sent = await api.sendMessage({
      conversation_id: SEED.conversationRahimKarima,
      body: '  See you soon  ',
    });
    expect(sent).toMatchObject({ body: 'See you soon', is_mine: true, deleted: false });
    const messages = await api.getMessages({ conversation_id: SEED.conversationRahimKarima });
    expect(messages[0].id).toBe(sent.id);
    await loginAs(api, 'karima');
    expect(
      (await api.getMessages({ conversation_id: SEED.conversationRahimKarima }))[0].is_mine,
    ).toBe(false);
  });

  it('accepts 1 to 2000 characters and nothing else', async () => {
    const { api } = setup();
    await loginAs(api, 'rahim');
    const send = (body: string) =>
      api.sendMessage({ conversation_id: SEED.conversationRahimKarima, body });
    expect(await errorCodeOf(send(''))).toBe('INVALID_INPUT');
    expect(await errorCodeOf(send('   '))).toBe('INVALID_INPUT');
    expect(await errorCodeOf(send('a'.repeat(2001)))).toBe('INVALID_INPUT');
    expect((await send('a'.repeat(2000))).body).toHaveLength(2000);
  });

  it('does not let me send to someone who left, or when I have left', async () => {
    const { api } = setup();
    await loginAs(api, 'rahim');
    await api.removeMember({ membership_id: SEED.memberships.karima, typed_name: 'Karima' });
    expect(
      await errorCodeOf(
        api.sendMessage({ conversation_id: SEED.conversationRahimKarima, body: 'Hello?' }),
      ),
    ).toBe('NOT_ALLOWED');
  });

  it('deletes my own message for everyone, and only my own', async () => {
    const { api } = setup();
    await loginAs(api, 'rahim');
    expect(await errorCodeOf(api.deleteMessage({ message_id: 'msg-1' }))).toBe('NOT_ALLOWED');
    await api.deleteMessage({ message_id: 'msg-2' });
    expect(await errorCodeOf(api.deleteMessage({ message_id: 'msg-2' }))).toBe(
      'MESSAGE_ALREADY_DELETED',
    );
    await loginAs(api, 'karima');
    const messages = await api.getMessages({ conversation_id: SEED.conversationRahimKarima });
    expect(messages.find((m) => m.id === 'msg-2')).toMatchObject({ deleted: true, body: null });
  });

  it('does not reveal messages of chats I am not in', async () => {
    const { api } = setup();
    await loginAs(api, 'salma');
    expect(await errorCodeOf(api.deleteMessage({ message_id: 'msg-2' }))).toBe('NOT_FOUND');
    expect(await errorCodeOf(api.deleteMessage({ message_id: 'nope' }))).toBe('NOT_FOUND');
  });
});

describe('deleting a building removes its chats', () => {
  it('takes the conversations and messages with it', async () => {
    const { api, database } = setup();
    await loginAs(api, 'rahim');
    await api.leaveBuilding({ building_id: SEED.building, typed_name: 'Rahim' });
    await loginAs(api, 'salma');
    await api.leaveBuilding({ building_id: SEED.building, typed_name: 'Salma' });
    expect(database.conversations).toHaveLength(0);
    expect(database.messages).toHaveLength(0);
  });
});

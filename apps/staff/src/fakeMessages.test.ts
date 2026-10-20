// apps/staff/src/fakeMessages.test.ts
//
// Checks the pretend chat backend: who can be messaged, opening and listing chats,
// sending and deleting messages, and how a person who left the building is shown.
// It also checks the new rule that guards can message and be messaged.
// Run with: npm test

import { beforeEach, describe, expect, it } from 'vitest';
import {
  approveMyRequestForTesting,
  getCurrentAccount,
  removeMember,
  listGuards,
  resetManagerDataForTesting,
  signOut,
  signUp,
  submitJoinRequest,
} from './fakeBackend';
import {
  deleteMessage,
  getMessages,
  getOrCreateConversation,
  listConversations,
  listMembers,
  resetMessagesDataForTesting,
  sendMessage,
} from './fakeMessages';

let accountNumber = 0;

// Makes a brand-new account that joins with a code and is approved.
async function joinAs(code: 'MANAGER-1357' | 'GUARD-2468', name: string) {
  accountNumber += 1;
  await signUp({ email: `chat${accountNumber}@staff.test`, password: 'x', displayName: name });
  await submitJoinRequest(code);
  await approveMyRequestForTesting();
}

const asManager = () => joinAs('MANAGER-1357', 'Test Manager');
const asGuard = () => joinAs('GUARD-2468', 'Test Guard');

// Finds a person in the member list by name.
async function memberNamed(name: string) {
  const member = (await listMembers()).find((m) => m.display_name === name);
  if (!member) throw new Error(`No member named ${name}`);
  return member;
}

beforeEach(async () => {
  await signOut();
  resetManagerDataForTesting();
  resetMessagesDataForTesting();
});

describe('who can chat', () => {
  it('needs someone logged in', async () => {
    await expect(listMembers()).rejects.toThrow('NOT_AUTHENTICATED');
  });

  it('needs the person to belong to a building', async () => {
    await signUp({ email: 'nobuilding@staff.test', password: 'x', displayName: 'No Building' });
    await expect(listMembers()).rejects.toThrow('NOT_A_MEMBER');
    await expect(listConversations()).rejects.toThrow('NOT_A_MEMBER');
  });
});

describe('the people a person can message', () => {
  it('lets a manager message owners, tenants, and guards, but not themselves', async () => {
    await asManager();
    const members = await listMembers();
    const names = members.map((m) => m.display_name);
    expect(names).toContain('Nadia Rahman');
    expect(names).toContain('Farhana Islam');
    expect(names).toContain('Rafiq Ahmed');
    expect(names).not.toContain('Test Manager');
    expect(names).not.toContain('Mahin Islam');
    expect(members.filter((m) => m.role === 'guard').length).toBe(5);
  });

  it('lets a guard message the manager, owners, tenants, and other guards', async () => {
    await asGuard();
    const members = await listMembers();
    const roles = new Set(members.map((m) => m.role));
    expect(roles).toEqual(new Set(['owner', 'tenant', 'manager', 'guard']));
    expect(members.map((m) => m.display_name)).toContain('Mahin Islam');
  });

  it('gives owners and tenants their flat', async () => {
    await asManager();
    expect((await memberNamed('Nadia Rahman')).flat_label).toBe('10B');
    expect((await memberNamed('Rafiq Ahmed')).flat_label).toBeNull();
  });
});

describe('opening chats', () => {
  it('opens the same chat for the same person every time', async () => {
    await asGuard();
    const nadia = await memberNamed('Nadia Rahman');
    const first = await getOrCreateConversation(nadia.account_id);
    const second = await getOrCreateConversation(nadia.account_id);
    expect(second.conversation_id).toBe(first.conversation_id);
  });

  it('refuses to open a chat with yourself or with someone outside the building', async () => {
    await asGuard();
    await expect(getOrCreateConversation(getCurrentAccount()!.id)).rejects.toThrow(
      'CANNOT_MESSAGE_SELF',
    );
    await expect(getOrCreateConversation('not-a-person')).rejects.toThrow('NOT_IN_SAME_BUILDING');
  });

  it('shows a brand-new empty chat at the top of the list', async () => {
    await asManager();
    const jamal = await memberNamed('Jamal Uddin');
    const { conversation_id } = await getOrCreateConversation(jamal.account_id);
    const list = await listConversations();
    expect(list[0].conversation_id).toBe(conversation_id);
    expect(list[0].last_message).toBeNull();
  });
});

describe('the chat list', () => {
  it('gives a manager starter chats, latest first', async () => {
    await asManager();
    const list = await listConversations();
    expect(list.map((c) => c.other.label)).toEqual([
      'Rafiq Ahmed',
      'Nadia Rahman',
      'Mahmud Hasan',
      'Farhana Islam',
    ]);
  });

  it('gives a guard starter chats that include the manager and other guards', async () => {
    await asGuard();
    const labels = (await listConversations()).map((c) => c.other.label);
    expect(labels).toContain('Mahin Islam');
    expect(labels).toContain('Rafiq Ahmed');
  });

  it('moves a chat to the top when a new message is sent in it', async () => {
    await asManager();
    const farhana = await memberNamed('Farhana Islam');
    const { conversation_id } = await getOrCreateConversation(farhana.account_id);
    await sendMessage(conversation_id, 'Hello again.');
    const list = await listConversations();
    expect(list[0].other.label).toBe('Farhana Islam');
    expect(list[0].last_message?.preview).toBe('Hello again.');
  });
});

describe('sending messages', () => {
  it('lets a guard send a message and shows it as theirs', async () => {
    await asGuard();
    const nadia = await memberNamed('Nadia Rahman');
    const { conversation_id } = await getOrCreateConversation(nadia.account_id);
    const sent = await sendMessage(conversation_id, '  The parcel is at the gate.  ');
    expect(sent.body).toBe('The parcel is at the gate.');
    expect(sent.is_mine).toBe(true);
    expect(sent.deleted).toBe(false);
    expect((await getMessages(conversation_id))[0].id).toBe(sent.id);
  });

  it('lets a guard message another guard', async () => {
    await asGuard();
    const rafiq = await memberNamed('Rafiq Ahmed');
    const { conversation_id } = await getOrCreateConversation(rafiq.account_id);
    await expect(sendMessage(conversation_id, 'Can you cover my shift?')).resolves.toMatchObject({
      is_mine: true,
    });
  });

  it('shows a guard the messages they received', async () => {
    await asGuard();
    const mahin = await memberNamed('Mahin Islam');
    const { conversation_id } = await getOrCreateConversation(mahin.account_id);
    const messages = await getMessages(conversation_id);
    expect(messages[0]).toMatchObject({
      is_mine: false,
      sender_label: 'Mahin Islam',
      body: 'The repair is booked for tomorrow at 10.',
    });
  });

  it('refuses an empty message and one that is too long', async () => {
    await asManager();
    const nadia = await memberNamed('Nadia Rahman');
    const { conversation_id } = await getOrCreateConversation(nadia.account_id);
    await expect(sendMessage(conversation_id, '   ')).rejects.toThrow('INVALID_INPUT');
    await expect(sendMessage(conversation_id, 'a'.repeat(2001))).rejects.toThrow('INVALID_INPUT');
    await expect(sendMessage(conversation_id, 'a'.repeat(2000))).resolves.toBeTruthy();
  });

  it('keeps other people out of a chat that is not theirs', async () => {
    await asManager();
    const nadia = await memberNamed('Nadia Rahman');
    const { conversation_id } = await getOrCreateConversation(nadia.account_id);
    await signOut();
    await asGuard();
    await expect(getMessages(conversation_id)).rejects.toThrow('NOT_FOUND');
    await expect(sendMessage(conversation_id, 'Hi')).rejects.toThrow('NOT_FOUND');
  });
});

describe('reading messages', () => {
  it('lists the newest message first', async () => {
    await asManager();
    const nadia = await memberNamed('Nadia Rahman');
    const { conversation_id } = await getOrCreateConversation(nadia.account_id);
    await sendMessage(conversation_id, 'One');
    await sendMessage(conversation_id, 'Two');
    const bodies = (await getMessages(conversation_id)).map((m) => m.body);
    expect(bodies.slice(0, 2)).toEqual(['Two', 'One']);
  });

  it('respects the limit and rejects a limit outside 1 to 100', async () => {
    await asManager();
    const nadia = await memberNamed('Nadia Rahman');
    const { conversation_id } = await getOrCreateConversation(nadia.account_id);
    expect((await getMessages(conversation_id, undefined, 2)).length).toBe(2);
    await expect(getMessages(conversation_id, undefined, 0)).rejects.toThrow('INVALID_INPUT');
    await expect(getMessages(conversation_id, undefined, 101)).rejects.toThrow('INVALID_INPUT');
  });

  it('only gives messages older than the "before" time', async () => {
    await asManager();
    const nadia = await memberNamed('Nadia Rahman');
    const { conversation_id } = await getOrCreateConversation(nadia.account_id);
    const all = await getMessages(conversation_id);
    const older = await getMessages(conversation_id, all[0].created_at);
    expect(older.length).toBeLessThan(all.length);
  });
});

describe('deleting messages', () => {
  it('deletes my own message and shows "Message deleted" in the chat and the list', async () => {
    await asManager();
    const nadia = await memberNamed('Nadia Rahman');
    const { conversation_id } = await getOrCreateConversation(nadia.account_id);
    const sent = await sendMessage(conversation_id, 'Oops, wrong chat.');
    await expect(deleteMessage(sent.id)).resolves.toEqual({ ok: true });
    const first = (await getMessages(conversation_id))[0];
    expect(first).toMatchObject({ id: sent.id, body: null, deleted: true });
    expect((await listConversations())[0].last_message).toMatchObject({
      preview: null,
      deleted: true,
    });
  });

  it('does not let someone delete a message that is not theirs', async () => {
    await asManager();
    const nadia = await memberNamed('Nadia Rahman');
    const { conversation_id } = await getOrCreateConversation(nadia.account_id);
    const theirs = (await getMessages(conversation_id)).find((m) => !m.is_mine)!;
    await expect(deleteMessage(theirs.id)).rejects.toThrow('NOT_ALLOWED');
  });

  it('cannot delete the same message twice', async () => {
    await asManager();
    const nadia = await memberNamed('Nadia Rahman');
    const { conversation_id } = await getOrCreateConversation(nadia.account_id);
    const sent = await sendMessage(conversation_id, 'Delete me.');
    await deleteMessage(sent.id);
    await expect(deleteMessage(sent.id)).rejects.toThrow('MESSAGE_ALREADY_DELETED');
  });

  it('says NOT_FOUND for a message that does not exist', async () => {
    await asManager();
    await expect(deleteMessage('message-9999')).rejects.toThrow('NOT_FOUND');
  });
});

describe('someone who left the building', () => {
  it('shows as "Former member" and can no longer be written to', async () => {
    await asManager();
    const rafiq = (await listGuards()).find((g) => g.display_name === 'Rafiq Ahmed')!;
    const { conversation_id } = await getOrCreateConversation(rafiq.account_id);
    await removeMember(rafiq.membership_id, 'Rafiq Ahmed');

    const chat = (await listConversations()).find((c) => c.conversation_id === conversation_id)!;
    expect(chat.other.label).toBe('Former member');
    const messages = await getMessages(conversation_id);
    expect(messages.find((m) => !m.is_mine)?.sender_label).toBe('Former member');
    await expect(sendMessage(conversation_id, 'Hello?')).rejects.toThrow('NOT_ALLOWED');
    await expect(getOrCreateConversation(rafiq.account_id)).rejects.toThrow('NOT_IN_SAME_BUILDING');
  });
});

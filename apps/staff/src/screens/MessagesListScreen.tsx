// apps/staff/src/screens/MessagesListScreen.tsx
//
// The "Messages" list, matching the design. It shows the person's chats, latest first.
// Each row has the person's initials, their name with a coloured role label, a line
// with their flat and the last message, and the time. A search box filters the chats
// by name. Tapping a row opens the chat. Managers and guards both use this screen,
// because both can message anyone in their building. The data comes from the pretend
// chat backend until the real one exists. Owned by Sraboni.

import type { ConversationItem, MemberListItem } from '@griho/shared';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import Avatar from '../components/Avatar';
import Brand from '../components/Brand';
import Eyebrow from '../components/Eyebrow';
import RoleBadge from '../components/RoleBadge';
import type { ChatTarget } from '../chatTarget';
import { listConversations, listMembers } from '../fakeMessages';
import { friendlyErrorMessage } from '../friendlyMessages';
import { colors, styles } from '../styles';
import { chatListTime } from '../text';

type Props = {
  displayName: string;
  /** Changes whenever the chats might have changed, so the list reads them again. */
  refreshKey: number;
  onOpenChat: (target: ChatTarget) => void;
};

// The grey line under a name: the flat (if any) and what the last message said.
function previewLine(chat: ConversationItem, member: MemberListItem | undefined): string {
  const last = chat.last_message;
  const text = !last ? 'No messages yet' : last.deleted ? 'Message deleted' : (last.preview ?? '');
  return member?.flat_label ? `Flat ${member.flat_label} · ${text}` : text;
}

export default function MessagesListScreen({ displayName, refreshKey, onOpenChat }: Props) {
  const [chats, setChats] = useState<ConversationItem[] | null>(null);
  const [members, setMembers] = useState<MemberListItem[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([listConversations(), listMembers()])
      .then(([newChats, newMembers]) => {
        if (cancelled) return;
        setChats(newChats);
        setMembers(newMembers);
      })
      .catch((caught) => {
        if (!cancelled) setError(friendlyErrorMessage(caught as { message?: string }));
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const query = search.trim().toLowerCase();
  const shown = (chats ?? []).filter((chat) => chat.other.label.toLowerCase().includes(query));

  return (
    <>
      <Brand right={<Avatar name={displayName} size={40} />} />
      <Eyebrow>Private communication</Eyebrow>
      <Text style={styles.title}>Messages.</Text>

      <TextInput
        style={local.search}
        value={search}
        onChangeText={setSearch}
        placeholder="Search chats"
        placeholderTextColor={colors.muted}
        accessibilityLabel="Search chats"
        autoCorrect={false}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={[styles.card, local.listCard]}>
        {chats !== null && shown.length === 0 ? (
          <Text style={local.empty}>
            {chats.length === 0
              ? 'No chats yet. Tap "New message" to start one.'
              : 'No chats match your search.'}
          </Text>
        ) : null}
        {shown.map((chat, index) => {
          const member = members.find((m) => m.account_id === chat.other.account_id);
          return (
            <Pressable
              key={chat.conversation_id}
              style={[local.row, index > 0 && local.rowDivider]}
              accessibilityRole="button"
              accessibilityLabel={`Chat with ${chat.other.label}`}
              onPress={() =>
                onOpenChat({
                  conversationId: chat.conversation_id,
                  accountId: chat.other.account_id,
                  name: chat.other.label,
                  role: member?.role ?? null,
                  flatLabel: member?.flat_label ?? null,
                })
              }
            >
              <Avatar name={chat.other.label} />
              <View style={local.rowText}>
                <View style={local.nameLine}>
                  <Text style={local.name} numberOfLines={1}>
                    {chat.other.label}
                  </Text>
                  {member ? <RoleBadge role={member.role} /> : null}
                </View>
                <Text style={local.preview} numberOfLines={1}>
                  {previewLine(chat, member)}
                </Text>
              </View>
              {chat.last_message ? (
                <Text style={local.time}>{chatListTime(chat.last_message.created_at)}</Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </>
  );
}

const local = StyleSheet.create({
  search: {
    height: 48,
    marginTop: 14,
    borderWidth: 1.5,
    borderColor: '#d8dfd9',
    borderRadius: 16,
    backgroundColor: colors.white,
    color: colors.ink,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  listCard: { paddingVertical: 6 },
  empty: { color: colors.muted, fontSize: 13, lineHeight: 19, paddingVertical: 14 },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 72 },
  rowDivider: { borderTopWidth: 1, borderTopColor: '#eff2ee' },
  rowText: { flex: 1, marginLeft: 12, marginRight: 8 },
  nameLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { flexShrink: 1, color: colors.ink, fontSize: 14, fontWeight: '800' },
  preview: { color: colors.muted, fontSize: 12, marginTop: 3 },
  time: { color: colors.muted, fontSize: 11 },
});

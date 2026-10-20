// apps/staff/src/screens/NewMessageScreen.tsx
//
// The "New message" screen, matching the design. It lists everyone in the building the
// person can write to, grouped as Owners, Tenants, the Manager, and Guards, with a
// search box that matches names and flats. Guards and managers can message anyone.
// Tapping a person opens the chat with them, or starts it if it is new. The data comes
// from the pretend chat backend until the real one exists. Owned by Sraboni.

import type { MemberListItem, Role } from '@griho/shared';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import Avatar from '../components/Avatar';
import Eyebrow from '../components/Eyebrow';
import { roleWord, type ChatTarget } from '../chatTarget';
import { getOrCreateConversation, listMembers } from '../fakeMessages';
import { friendlyErrorMessage } from '../friendlyMessages';
import { colors, styles } from '../styles';

type Props = {
  buildingName: string;
  onBack: () => void;
  onOpenChat: (target: ChatTarget) => void;
};

// The groups, in the order they are shown.
const GROUPS: { role: Role; title: string }[] = [
  { role: 'owner', title: 'OWNERS' },
  { role: 'tenant', title: 'TENANTS' },
  { role: 'manager', title: 'MANAGER' },
  { role: 'guard', title: 'GUARDS' },
];

export default function NewMessageScreen({ buildingName, onBack, onOpenChat }: Props) {
  const [members, setMembers] = useState<MemberListItem[] | null>(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listMembers()
      .then((result) => {
        if (!cancelled) setMembers(result);
      })
      .catch((caught) => {
        if (!cancelled) setError(friendlyErrorMessage(caught as { message?: string }));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function open(member: MemberListItem) {
    setError(null);
    setBusyId(member.account_id);
    try {
      const { conversation_id } = await getOrCreateConversation(member.account_id);
      onOpenChat({
        conversationId: conversation_id,
        accountId: member.account_id,
        name: member.display_name,
        role: member.role,
        flatLabel: member.flat_label,
      });
    } catch (caught) {
      setError(friendlyErrorMessage(caught as { message?: string }));
    } finally {
      setBusyId(null);
    }
  }

  const query = search.trim().toLowerCase();
  const matches = (member: MemberListItem) =>
    member.display_name.toLowerCase().includes(query) ||
    (member.flat_label ?? '').toLowerCase().includes(query);

  return (
    <>
      <Pressable
        style={local.back}
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel="Back to messages"
      >
        <Text style={local.backText}>← Messages</Text>
      </Pressable>

      <Eyebrow>New message</Eyebrow>
      <Text style={styles.title}>Who to write to?</Text>
      <Text style={styles.subtitle}>Anyone in {buildingName}.</Text>

      <TextInput
        style={local.search}
        value={search}
        onChangeText={setSearch}
        placeholder="Search by name or flat"
        placeholderTextColor={colors.muted}
        accessibilityLabel="Search people"
        autoCorrect={false}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {GROUPS.map((group) => {
        const people = (members ?? []).filter((m) => m.role === group.role && matches(m));
        if (people.length === 0) return null;
        return (
          <View key={group.role}>
            <Text style={local.groupTitle}>{group.title}</Text>
            <View style={[styles.card, local.listCard]}>
              {people.map((member, index) => (
                <Pressable
                  key={member.account_id}
                  style={[local.row, index > 0 && local.rowDivider]}
                  onPress={() => open(member)}
                  disabled={busyId !== null}
                  accessibilityRole="button"
                  accessibilityLabel={`Write to ${member.display_name}`}
                >
                  <Avatar name={member.display_name} />
                  <View style={local.rowText}>
                    <Text style={local.name}>{member.display_name}</Text>
                    <Text style={local.detail}>
                      {member.flat_label ? `Flat ${member.flat_label}` : roleWord(member.role)}
                    </Text>
                  </View>
                  <Text style={local.chevron}>›</Text>
                </Pressable>
              ))}
            </View>
          </View>
        );
      })}

      {members !== null && !(members ?? []).some(matches) ? (
        <Text style={local.empty}>No one matches your search.</Text>
      ) : null}
    </>
  );
}

const local = StyleSheet.create({
  back: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center', marginBottom: 6 },
  backText: { color: colors.green, fontSize: 15, fontWeight: '700' },
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
  groupTitle: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.6,
    marginTop: 18,
  },
  listCard: { paddingVertical: 4, marginTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 64 },
  rowDivider: { borderTopWidth: 1, borderTopColor: '#eff2ee' },
  rowText: { flex: 1, marginLeft: 12 },
  name: { color: colors.ink, fontSize: 14, fontWeight: '800' },
  detail: { color: colors.muted, fontSize: 12, marginTop: 2 },
  chevron: { color: colors.muted, fontSize: 24, marginLeft: 8 },
  empty: { color: colors.muted, fontSize: 13, lineHeight: 19, marginTop: 18 },
});

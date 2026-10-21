// apps/home/src/screens/ChatScreen.tsx
//
// One private chat. Messages sit in an upside-down list, so the newest is at the
// bottom next to the box where you type. The screen checks for new messages every
// 3 seconds while it is open, and loads older ones (50 at a time) when you scroll
// up. A day label ("Today", "Yesterday") sits between days. If the other person
// left the building or deleted their account, you can still read the chat, but the
// typing box is replaced by a note (PRD 5.8). The building bar stays at the top so
// the building's name is always visible. Owned by Bishal.

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import type { Message } from '@griho/shared';

import { api, type MembershipWithLastOwner } from '../api';
import Avatar from '../components/Avatar';
import BackLink from '../components/BackLink';
import BuildingBar from '../components/BuildingBar';
import ChatBubble from '../components/ChatBubble';
import Notice from '../components/Notice';
import { roleLabel } from '../buildings';
import { friendlyErrorMessage } from '../friendlyMessages';
import {
  canReplyTo,
  checkMessageText,
  MAX_MESSAGE_LENGTH,
  rowsWithDays,
  type ChatRow,
} from '../messages';
import { colors, fonts } from '../theme';

const PAGE_SIZE = 50;
const CHECK_EVERY_MS = 3000;

type Props = {
  membership: MembershipWithLastOwner;
  conversationId: string;
  /** The other person's name, or "Former member" / "Deleted account". */
  otherLabel: string;
  onBack: () => void;
  onSwitch: () => void;
  /** The person tapped "Delete" on one of their own messages. */
  onDelete: (message: Message) => void;
};

/** Puts fresh messages in front of the ones already shown, replacing any that changed. */
function mergeNewest(current: Message[], fresh: Message[]): Message[] {
  const freshIds = new Set(fresh.map((message) => message.id));
  const rest = current.filter((message) => !freshIds.has(message.id));
  return [...fresh, ...rest].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export default function ChatScreen({
  membership,
  conversationId,
  otherLabel,
  onBack,
  onSwitch,
  onDelete,
}: Props) {
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const messagesRef = useRef<Message[]>([]);
  messagesRef.current = messages;

  const canReply = canReplyTo(otherLabel);
  const check = checkMessageText(text);

  const loadNewest = useCallback(
    async (first: boolean) => {
      try {
        const fresh = await api.getMessages({ conversation_id: conversationId, limit: PAGE_SIZE });
        setMessages((current) => mergeNewest(current, fresh));
        if (first) setHasMore(fresh.length === PAGE_SIZE);
        setLoadError(null);
      } catch (caught) {
        // A failed check in the background should not hide the chat; only the first load shows a problem.
        if (first) setLoadError(friendlyErrorMessage(caught as { message?: string }));
      } finally {
        if (first) setLoading(false);
      }
    },
    [conversationId],
  );

  useEffect(() => {
    loadNewest(true);
    const timer = setInterval(() => loadNewest(false), CHECK_EVERY_MS);
    return () => clearInterval(timer);
  }, [loadNewest]);

  async function loadOlder() {
    const oldest = messagesRef.current[messagesRef.current.length - 1];
    if (!hasMore || loadingOlder || !oldest) return;
    setLoadingOlder(true);
    try {
      const older = await api.getMessages({
        conversation_id: conversationId,
        before: oldest.created_at,
        limit: PAGE_SIZE,
      });
      setMessages((current) => {
        const known = new Set(current.map((message) => message.id));
        return [...current, ...older.filter((message) => !known.has(message.id))];
      });
      setHasMore(older.length === PAGE_SIZE);
    } catch (caught) {
      setSendError(friendlyErrorMessage(caught as { message?: string }));
    } finally {
      setLoadingOlder(false);
    }
  }

  async function send() {
    if (!check.ok || sending) return;
    setSendError(null);
    setSending(true);
    try {
      const sent = await api.sendMessage({ conversation_id: conversationId, body: text.trim() });
      setMessages((current) => mergeNewest(current, [sent]));
      setText('');
    } catch (caught) {
      setSendError(friendlyErrorMessage(caught as { message?: string }));
    } finally {
      setSending(false);
    }
  }

  const rows = rowsWithDays(messages, new Date());

  function renderRow({ item }: { item: ChatRow }) {
    if (item.kind === 'day') {
      return (
        <View style={styles.day}>
          <Text style={styles.dayText}>{item.label}</Text>
        </View>
      );
    }
    return <ChatBubble message={item.message} onDelete={() => onDelete(item.message)} />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.top, { paddingTop: insets.top + 12 }]}>
        <BuildingBar
          buildingName={membership.building.name}
          roleText={roleLabel(membership)}
          onSwitch={onSwitch}
        />
        <BackLink label="Messages" onPress={onBack} />
        <View style={styles.header}>
          <Avatar name={otherLabel} grey={!canReply} />
          <Text style={[styles.headerName, !canReply && styles.headerGone]} numberOfLines={1}>
            {otherLabel}
          </Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator
          style={styles.loading}
          color={colors.teal}
          accessibilityLabel="Loading"
        />
      ) : loadError ? (
        <View style={styles.errorBox}>
          <Notice kind="error" text={loadError} />
        </View>
      ) : (
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={rows}
          inverted
          keyExtractor={(row) => (row.kind === 'day' ? row.key : row.message.id)}
          renderItem={renderRow}
          ItemSeparatorComponent={Gap}
          onEndReached={loadOlder}
          onEndReachedThreshold={0.4}
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={
            loadingOlder ? <ActivityIndicator color={colors.teal} style={styles.older} /> : null
          }
          ListEmptyComponent={<Text style={styles.empty}>No messages yet. Say hello!</Text>}
        />
      )}

      {canReply ? (
        <View style={[styles.composer, { paddingBottom: insets.bottom + 10 }]}>
          {sendError ? <Notice kind="error" text={sendError} /> : null}
          {check.problem ? <Notice kind="error" text={check.problem} /> : null}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={(value) => {
                setText(value);
                setSendError(null);
              }}
              placeholder="Type a message"
              placeholderTextColor={colors.muted}
              multiline
              maxLength={MAX_MESSAGE_LENGTH + 200}
              accessibilityLabel="Message"
            />
            <Pressable
              style={[styles.send, (!check.ok || sending) && styles.sendOff]}
              onPress={send}
              disabled={!check.ok || sending}
              accessibilityRole="button"
              accessibilityLabel="Send message"
              accessibilityState={{ disabled: !check.ok || sending, busy: sending }}
            >
              <Svg
                width={20}
                height={20}
                viewBox="0 0 24 24"
                fill="none"
                stroke={colors.white}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <Path d="M4 12 L20 4 L13 20 L11 13 Z" />
              </Svg>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={[styles.former, { paddingBottom: insets.bottom + 14 }]}>
          <Text style={styles.formerText}>
            {otherLabel === 'Deleted account'
              ? 'This account was deleted, so you cannot send a message. You can still read the chat.'
              : 'This person left the building, so you cannot send a message. You can still read the chat.'}
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

function Gap() {
  return <View style={styles.gap} />;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.page },
  top: { paddingHorizontal: 20, paddingBottom: 4 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4, marginBottom: 8 },
  headerName: { flex: 1, fontFamily: fonts.extraBold, fontSize: 22, color: colors.ink },
  headerGone: { color: colors.muted },
  loading: { marginTop: 32 },
  errorBox: { paddingHorizontal: 20 },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 20, paddingVertical: 12, flexGrow: 1 },
  gap: { height: 8 },
  older: { marginVertical: 12 },
  day: { alignSelf: 'center', marginVertical: 10, paddingHorizontal: 12, paddingVertical: 4 },
  dayText: { fontFamily: fonts.bold, fontSize: 12.5, color: colors.muted },
  empty: {
    textAlign: 'center',
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
    transform: [{ scaleY: -1 }],
  },
  composer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 8,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    paddingHorizontal: 16,
    paddingTop: 13,
    paddingBottom: 13,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.page,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.ink,
  },
  send: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendOff: { opacity: 0.4 },
  former: {
    paddingHorizontal: 20,
    paddingTop: 14,
    backgroundColor: colors.pillGrey,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  formerText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.pillGreyText,
    textAlign: 'center',
  },
});

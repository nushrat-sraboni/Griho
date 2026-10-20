// apps/staff/src/screens/ChatScreen.tsx
//
// One chat, matching the "Chat" design. At the top is a white header with a rounded
// bottom edge, the person's initials, their name, a coloured role label, and the
// building. Below it the messages show as "notes": cards with the sender's name and
// the time inside. Your notes are deep green on the right and theirs are white on the
// left, and a deleted note is a dashed outline that says "Message deleted". A floating
// bar at the bottom lets you type and send. Press and hold one of your notes to delete
// it. A person who left the building can be read but not written to. The data comes
// from the pretend chat backend until the real one exists. Owned by Sraboni.

import type { Message } from '@griho/shared';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import Avatar from '../components/Avatar';
import { OutlineButton, PrimaryButton } from '../components/Buttons';
import RoleBadge from '../components/RoleBadge';
import { Rings } from '../components/Screen';
import type { ChatTarget } from '../chatTarget';
import { deleteMessage, getMessages, sendMessage } from '../fakeMessages';
import { friendlyErrorMessage } from '../friendlyMessages';
import { TOP_INSET, colors, styles } from '../styles';
import { clockTime, dayLabel } from '../text';

type Props = {
  target: ChatTarget;
  buildingName: string;
  onBack: () => void;
  /** Called after a message is sent or deleted, so the chat list reads again. */
  onChanged: () => void;
};

// The small capital-letter name above a note: "YOU", or the sender's first name.
function senderLine(message: Message): string {
  if (message.is_mine) return 'YOU';
  if (message.sender_label === 'Former member') return 'FORMER MEMBER';
  return message.sender_label.split(' ')[0].toUpperCase();
}

// One note card. Only your own notes that are not deleted can be pressed and held.
function Note({ message, onLongPress }: { message: Message; onLongPress: () => void }) {
  const mine = message.is_mine;
  const canDelete = mine && !message.deleted;
  return (
    <Pressable
      onLongPress={canDelete ? onLongPress : undefined}
      delayLongPress={350}
      accessibilityLabel={`${senderLine(message)} at ${clockTime(message.created_at)}: ${
        message.deleted ? 'Message deleted' : message.body
      }`}
      accessibilityHint={canDelete ? 'Press and hold to delete this note' : undefined}
      style={[
        local.note,
        mine ? local.noteMine : local.noteTheirs,
        message.deleted && local.noteDeleted,
      ]}
    >
      <View style={local.noteTop}>
        <Text style={[local.noteName, mine && !message.deleted && local.noteNameMine]}>
          {senderLine(message)}
        </Text>
        <Text style={[local.noteName, mine && !message.deleted && local.noteNameMine]}>
          {clockTime(message.created_at)}
        </Text>
      </View>
      {message.deleted ? (
        <Text style={local.deletedText}>Message deleted</Text>
      ) : (
        <Text style={[local.noteBody, mine && local.noteBodyMine]}>{message.body}</Text>
      )}
    </Pressable>
  );
}

export default function ChatScreen({ target, buildingName, onBack, onChanged }: Props) {
  // Oldest first, so the newest note sits at the bottom.
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [toDelete, setToDelete] = useState<Message | null>(null);
  const [deleting, setDeleting] = useState(false);
  const scroller = useRef<ScrollView>(null);

  const load = useCallback(async () => {
    try {
      const newest = await getMessages(target.conversationId, undefined, 100);
      setMessages([...newest].reverse());
    } catch (caught) {
      setError(friendlyErrorMessage(caught as { message?: string }));
    }
  }, [target.conversationId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSend() {
    if (!text.trim() || sending) return;
    setError(null);
    setSending(true);
    try {
      await sendMessage(target.conversationId, text);
      setText('');
      await load();
      onChanged();
    } catch (caught) {
      setError(friendlyErrorMessage(caught as { message?: string }));
    } finally {
      setSending(false);
    }
  }

  async function handleDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await deleteMessage(toDelete.id);
      setToDelete(null);
      await load();
      onChanged();
    } catch (caught) {
      setError(friendlyErrorMessage(caught as { message?: string }));
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  const hasMyNotes = messages.some((m) => m.is_mine && !m.deleted);
  const canWrite = target.role !== null;

  // The notes, with a small heading whenever the day changes.
  const rows: ReactNode[] = [];
  let lastDay = '';
  for (const message of messages) {
    const day = dayLabel(message.created_at);
    if (day !== lastDay) {
      lastDay = day;
      rows.push(
        <View key={`day-${message.id}`} style={local.dayRow}>
          <View style={local.dayDash} />
          <Text style={local.dayText}>{day}</Text>
          <View style={local.dayLine} />
        </View>,
      );
    }
    rows.push(<Note key={message.id} message={message} onLongPress={() => setToDelete(message)} />);
  }

  return (
    <KeyboardAvoidingView
      style={local.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Rings />

      <View style={local.header}>
        <Pressable
          style={local.back}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Back to messages"
        >
          <Text style={local.backText}>← Messages</Text>
        </Pressable>
        <View style={local.who}>
          <Avatar name={target.name} size={52} />
          <View style={local.whoText}>
            <Text style={local.whoName} numberOfLines={1}>
              {target.name}
            </Text>
            <View style={local.whoLine}>
              {target.role ? <RoleBadge role={target.role} /> : null}
              <Text style={local.whoBuilding} numberOfLines={1}>
                {target.flatLabel ? `Flat ${target.flatLabel} · ` : ''}
                {buildingName}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        ref={scroller}
        style={local.messages}
        contentContainerStyle={local.messagesContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scroller.current?.scrollToEnd({ animated: false })}
      >
        {messages.length === 0 ? (
          <Text style={local.emptyChat}>No notes yet. Write the first one below.</Text>
        ) : (
          rows
        )}
      </ScrollView>

      {error ? <Text style={[styles.error, local.errorText]}>{error}</Text> : null}
      {hasMyNotes ? (
        <Text style={local.hint}>Press and hold one of your notes to delete it.</Text>
      ) : null}

      {canWrite ? (
        <View style={local.composer}>
          <TextInput
            style={local.input}
            value={text}
            onChangeText={setText}
            placeholder="Write a note..."
            placeholderTextColor={colors.muted}
            accessibilityLabel="Write a message"
            maxLength={2000}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <Pressable
            style={[local.send, (!text.trim() || sending) && local.sendOff]}
            onPress={handleSend}
            disabled={!text.trim() || sending}
            accessibilityRole="button"
            accessibilityLabel="Send message"
          >
            <Text style={local.sendArrow}>↑</Text>
          </Pressable>
        </View>
      ) : (
        <Text style={[styles.note, local.leftNote]}>
          This person has left the building. You can read your chat, but you cannot write.
        </Text>
      )}

      <Modal
        visible={toDelete !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setToDelete(null)}
      >
        <View style={local.backdrop}>
          <View style={local.sheet} accessibilityViewIsModal>
            <View style={local.handle} />
            <Text style={local.sheetTitle}>Delete this note?</Text>
            <Text style={local.sheetText}>
              It disappears for everyone in this chat. They will see "Message deleted" instead.
            </Text>
            <PrimaryButton
              danger
              label={deleting ? 'Deleting...' : 'Delete message'}
              onPress={handleDelete}
              disabled={deleting}
            />
            <View style={local.cancelWrap}>
              <OutlineButton compact label="Cancel" onPress={() => setToDelete(null)} />
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const local = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  header: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingTop: TOP_INSET - 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
    shadowColor: colors.ink,
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
    zIndex: 2,
  },
  back: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' },
  backText: { color: colors.green, fontSize: 14, fontWeight: '700' },
  who: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  whoText: { flex: 1, marginLeft: 14 },
  whoName: { color: colors.ink, fontSize: 22, fontWeight: '800', letterSpacing: -0.6 },
  whoLine: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5 },
  whoBuilding: { flexShrink: 1, color: colors.muted, fontSize: 12 },
  messages: { flex: 1 },
  messagesContent: { padding: 20, paddingBottom: 12, gap: 14, flexGrow: 1 },
  emptyChat: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 24,
  },
  dayRow: { flexDirection: 'row', alignItems: 'center' },
  dayDash: { width: 22, height: 2, backgroundColor: colors.gold, marginRight: 10 },
  dayText: { color: colors.green, fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  dayLine: { flex: 1, height: 1, backgroundColor: '#e3e8e3', marginLeft: 10 },
  note: { width: '82%', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 13 },
  noteTheirs: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 22,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  noteMine: {
    alignSelf: 'flex-end',
    backgroundColor: colors.green,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 6,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  noteDeleted: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#c9d3cc',
    borderStyle: 'dashed',
  },
  noteTop: { flexDirection: 'row', justifyContent: 'space-between' },
  noteName: { color: colors.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1.2 },
  noteNameMine: { color: 'rgba(255,255,255,0.85)' },
  noteBody: { color: colors.ink, fontSize: 14, lineHeight: 22, marginTop: 6 },
  noteBodyMine: { color: colors.white },
  deletedText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 6,
    fontStyle: 'italic',
  },
  errorText: { marginHorizontal: 20, marginTop: 0, marginBottom: 6 },
  hint: { color: colors.muted, fontSize: 11, textAlign: 'center', marginBottom: 8 },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 24,
    marginHorizontal: 14,
    marginBottom: 16,
    paddingVertical: 8,
    paddingLeft: 18,
    paddingRight: 8,
    shadowColor: colors.ink,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  input: { flex: 1, height: 44, color: colors.ink, fontSize: 15 },
  send: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendOff: { opacity: 0.5 },
  sendArrow: { color: colors.white, fontSize: 24, fontWeight: '800', marginTop: -2 },
  leftNote: { marginHorizontal: 14, marginBottom: 16, marginTop: 0 },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(18,58,48,0.45)' },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 22,
    paddingBottom: 28,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#d8dfd9',
    marginBottom: 18,
  },
  sheetTitle: { color: colors.ink, fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  sheetText: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 8 },
  cancelWrap: { marginTop: 10 },
});

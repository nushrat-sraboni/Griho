// apps/home/src/components/ConversationRow.tsx
//
// One chat in the list of chats: the other person's round badge and name (or
// "Former member" / "Deleted account" in grey), a line with their last message
// ("Message deleted" when it was deleted), and when it was sent. The whole row
// can be tapped to open the chat. Owned by Bishal.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ConversationItem } from '@griho/shared';

import { canReplyTo, listTime, previewText } from '../messages';
import { colors, fonts } from '../theme';
import Avatar from './Avatar';

type Props = { chat: ConversationItem; onPress: () => void };

export default function ConversationRow({ chat, onPress }: Props) {
  const gone = !canReplyTo(chat.other.label);
  const preview = previewText(chat.last_message);
  const deleted = chat.last_message?.deleted ?? false;

  return (
    <Pressable
      style={styles.row}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Chat with ${chat.other.label}. ${preview}`}
    >
      <Avatar name={chat.other.label} grey={gone} />
      <View style={styles.middle}>
        <Text style={[styles.name, gone && styles.nameGone]} numberOfLines={1}>
          {chat.other.label}
        </Text>
        <Text style={[styles.preview, deleted && styles.previewDeleted]} numberOfLines={1}>
          {preview}
        </Text>
      </View>
      {chat.last_message ? (
        <Text style={styles.time}>{listTime(chat.last_message.created_at, new Date())}</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
  },
  middle: { flex: 1 },
  name: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  nameGone: { color: colors.muted },
  preview: { marginTop: 3, fontFamily: fonts.regular, fontSize: 13.5, color: colors.muted },
  previewDeleted: { fontStyle: 'italic' },
  time: { fontFamily: fonts.regular, fontSize: 12.5, color: colors.muted },
});

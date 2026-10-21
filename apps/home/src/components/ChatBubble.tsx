// apps/home/src/components/ChatBubble.tsx
//
// One message in a chat. My messages are teal and sit on the right; the other
// person's are white and sit on the left. The time is shown under the words. My
// own messages have a "Delete" link (it removes the message for everyone). A
// deleted message shows "Message deleted" in a soft grey box, with no words.
// Owned by Bishal.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Message } from '@griho/shared';

import { clockTime } from '../messages';
import { colors, fonts } from '../theme';

type Props = {
  message: Message;
  /** Called when the person taps "Delete" on their own message. */
  onDelete: () => void;
};

export default function ChatBubble({ message, onDelete }: Props) {
  if (message.deleted) {
    return (
      <View
        style={[styles.bubble, styles.deleted, message.is_mine ? styles.mine : styles.theirs]}
        accessibilityLabel="Message deleted"
      >
        <Text style={styles.deletedText}>Message deleted</Text>
      </View>
    );
  }

  const mine = message.is_mine;
  return (
    <View
      style={[
        styles.bubble,
        mine ? styles.mineBubble : styles.theirsBubble,
        mine ? styles.mine : styles.theirs,
      ]}
    >
      <Text style={[styles.body, mine && styles.bodyMine]}>{message.body}</Text>
      <View style={styles.footer}>
        <Text style={[styles.time, mine && styles.timeMine]}>{clockTime(message.created_at)}</Text>
        {mine ? (
          <Pressable
            onPress={onDelete}
            accessibilityRole="button"
            accessibilityLabel="Delete this message"
            hitSlop={12}
          >
            <Text style={styles.delete}>Delete</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: { maxWidth: '78%', paddingVertical: 10, paddingHorizontal: 14 },
  mine: { alignSelf: 'flex-end' },
  theirs: { alignSelf: 'flex-start' },
  mineBubble: {
    backgroundColor: colors.teal,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 6,
  },
  theirsBubble: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 18,
  },
  deleted: {
    backgroundColor: colors.pillGrey,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#B5BDB9',
    borderRadius: 18,
  },
  deletedText: {
    fontFamily: fonts.regular,
    fontStyle: 'italic',
    fontSize: 14,
    color: colors.pillGreyText,
  },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 21, color: colors.ink },
  bodyMine: { color: colors.white },
  footer: { marginTop: 4, flexDirection: 'row', justifyContent: 'space-between', gap: 14 },
  time: { fontFamily: fonts.regular, fontSize: 11.5, color: colors.muted },
  timeMine: { color: colors.onTealSoft },
  delete: {
    fontFamily: fonts.bold,
    fontSize: 11.5,
    color: colors.white,
    textDecorationLine: 'underline',
  },
});

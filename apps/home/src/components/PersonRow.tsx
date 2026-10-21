// apps/home/src/components/PersonRow.tsx
//
// One person in a list of people: a round badge with their first letter, their
// name, and their role ("Owner", "Tenant · Flat A-2", "Manager" or "Guard").
// On the right: a round chat button ("Message") when `onMessage` is given, and a
// red "Remove" button when the person looking is allowed to remove them.
// Owned by Bishal.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { MemberListItem } from '@griho/shared';

import { roleWords } from '../joining';
import { colors, fonts } from '../theme';
import Avatar from './Avatar';
import Pill from './Pill';

type Props = {
  person: MemberListItem;
  /** Show a Remove button? Only when the person looking is allowed to remove this one. */
  removable?: boolean;
  onRemove?: () => void;
  /** When given, a round chat button is shown. */
  onMessage?: () => void;
  /** When given, the whole row can be tapped (for example to start a chat). */
  onPress?: () => void;
};

export default function PersonRow({
  person,
  removable = false,
  onRemove,
  onMessage,
  onPress,
}: Props) {
  const isGuard = person.role === 'guard';

  const content = (
    <>
      <Avatar name={person.display_name} grey={isGuard} />
      <View style={styles.middle}>
        <Text style={styles.name} numberOfLines={1}>
          {person.display_name}
        </Text>
        <View style={styles.pill}>
          <Pill text={roleWords(person.role, person.flat_label)} tone={isGuard ? 'grey' : 'teal'} />
        </View>
      </View>
      {onMessage ? (
        <Pressable
          style={styles.chat}
          onPress={onMessage}
          accessibilityRole="button"
          accessibilityLabel={`Message ${person.display_name}`}
        >
          <Svg
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.teal}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <Path d="M4 5 H20 V16 H11 L6 20 V16 H4 Z" />
          </Svg>
        </Pressable>
      ) : null}
      {removable && onRemove ? (
        <Pressable
          style={styles.remove}
          onPress={onRemove}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${person.display_name}`}
        >
          <Text style={styles.removeText}>Remove</Text>
        </Pressable>
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        style={styles.row}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${person.display_name}, ${roleWords(person.role, person.flat_label)}`}
      >
        {content}
      </Pressable>
    );
  }
  return <View style={styles.row}>{content}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
  },
  middle: { flex: 1, marginLeft: 4 },
  name: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  pill: { marginTop: 4, alignSelf: 'flex-start' },
  chat: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  remove: { minHeight: 44, paddingHorizontal: 8, justifyContent: 'center' },
  removeText: { fontFamily: fonts.bold, fontSize: 14, color: colors.errorText },
});

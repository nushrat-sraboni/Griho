// apps/home/src/components/PersonRow.tsx
//
// One person in the "People" list: a round badge with their first letter, their
// name, and their role ("Owner", "Tenant · Flat A-2", "Manager" or "Guard").
// When the person looking is allowed to remove them, a red "Remove" button shows
// on the right. Owned by Bishal.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { MemberListItem } from '@griho/shared';

import { roleWords } from '../joining';
import { colors, fonts } from '../theme';
import Avatar from './Avatar';
import Pill from './Pill';

type Props = {
  person: MemberListItem;
  /** Show a Remove button? Only when the person looking is allowed to remove this one. */
  removable: boolean;
  onRemove: () => void;
};

export default function PersonRow({ person, removable, onRemove }: Props) {
  const isGuard = person.role === 'guard';

  return (
    <View style={styles.row}>
      <Avatar name={person.display_name} grey={isGuard} />
      <View style={styles.middle}>
        <Text style={styles.name} numberOfLines={1}>
          {person.display_name}
        </Text>
        <View style={styles.pill}>
          <Pill text={roleWords(person.role, person.flat_label)} tone={isGuard ? 'grey' : 'teal'} />
        </View>
      </View>
      {removable ? (
        <Pressable
          style={styles.remove}
          onPress={onRemove}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${person.display_name}`}
        >
          <Text style={styles.removeText}>Remove</Text>
        </Pressable>
      ) : null}
    </View>
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
  pill: { marginTop: 4, alignSelf: 'flex-start' },
  remove: { minHeight: 44, paddingHorizontal: 8, justifyContent: 'center' },
  removeText: { fontFamily: fonts.bold, fontSize: 14, color: colors.errorText },
});

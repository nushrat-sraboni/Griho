// apps/home/src/components/ChoiceCard.tsx
//
// One tappable choice in a list where exactly one can be picked (for example
// "who is this code for?"). The picked one has a teal border, a pale green
// background and a filled round mark on its right. Screen readers announce it
// as a radio button. Owned by Bishal.

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '../theme';

type Props = {
  title: string;
  help: string;
  selected: boolean;
  onPress: () => void;
};

export default function ChoiceCard({ title, help, selected, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      accessibilityLabel={`${title}. ${help}`}
      style={[styles.card, selected && styles.cardSelected]}
    >
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.help}>{help}</Text>
      </View>
      <View style={[styles.mark, selected && styles.markSelected]}>
        {selected ? <View style={styles.dot} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.white,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: colors.teal,
    backgroundColor: colors.selectedBackground,
    paddingHorizontal: 13,
  },
  text: { flex: 1 },
  title: { fontFamily: fonts.bold, fontSize: 15, color: colors.ink },
  help: {
    marginTop: 2,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
  mark: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.fieldBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markSelected: { borderColor: colors.teal },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.teal },
});

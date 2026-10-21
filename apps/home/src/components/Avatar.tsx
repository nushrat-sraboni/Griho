// apps/home/src/components/Avatar.tsx
//
// A round badge with a person's first letter, used in lists of people and
// requests. Guards get a grey badge, everyone else a pale teal one. It is only
// decoration, so screen readers skip it. Owned by Bishal.

import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '../theme';

type Props = { name: string; grey?: boolean };

export default function Avatar({ name, grey = false }: Props) {
  const letter = name.trim().charAt(0).toUpperCase();
  return (
    <View
      style={[styles.circle, grey ? styles.grey : styles.teal]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Text style={[styles.letter, grey ? styles.greyText : styles.tealText]}>{letter}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teal: { backgroundColor: colors.pillTeal },
  grey: { backgroundColor: colors.pillGrey },
  letter: { fontFamily: fonts.extraBold, fontSize: 16 },
  tealText: { color: colors.pillTealText },
  greyText: { color: colors.pillGreyText },
});

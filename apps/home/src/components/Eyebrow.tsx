// apps/home/src/components/Eyebrow.tsx
//
// The tiny label above a big heading: a short amber dash, then a few words in
// small spaced-out capital letters (for example "WELCOME BACK" or the date).
// Owned by Bishal.

import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '../theme';

type Props = { text: string };

export default function Eyebrow({ text }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.dash} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dash: { width: 24, height: 2, backgroundColor: colors.amberDark },
  text: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.6, color: colors.teal },
});

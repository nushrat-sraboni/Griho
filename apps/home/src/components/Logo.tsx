// apps/home/src/components/Logo.tsx
//
// The small Griho Home logo: a teal rounded square with four little windows
// (one of them lit amber), and the name beside it. Owned by Bishal.

import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '../theme';

export default function Logo() {
  return (
    <View style={styles.row} accessibilityRole="header" accessibilityLabel="Griho Home">
      <View style={styles.mark} accessibilityElementsHidden importantForAccessibility="no">
        <View style={styles.window} />
        <View style={[styles.window, styles.lit]} />
        <View style={styles.window} />
        <View style={styles.window} />
      </View>
      <Text style={styles.name}>
        Griho <Text style={styles.product}>Home</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mark: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.teal,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'center',
    justifyContent: 'center',
    gap: 4,
    padding: 6,
  },
  window: { width: 8, height: 8, borderRadius: 2, backgroundColor: colors.page },
  lit: { backgroundColor: colors.amber },
  name: { fontFamily: fonts.extraBold, fontSize: 18, color: colors.ink, letterSpacing: -0.2 },
  product: { fontFamily: fonts.medium, color: colors.muted },
});

// apps/home/src/components/BackLink.tsx
//
// A small "< Flats" style link with a left arrow, shown under the building bar
// to go back one screen. It is at least 44 tall so it is easy to tap.
// Owned by Bishal.

import { Pressable, StyleSheet, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors, fonts } from '../theme';

type Props = { label: string; onPress: () => void };

export default function BackLink({ label, onPress }: Props) {
  return (
    <Pressable
      style={styles.link}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Back to ${label}`}
    >
      <Svg
        width={18}
        height={18}
        viewBox="0 0 24 24"
        fill="none"
        stroke={colors.teal}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d="M15 6 L9 12 L15 18" />
      </Svg>
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: {
    marginTop: 8,
    minHeight: 44,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  text: { fontFamily: fonts.bold, fontSize: 14, color: colors.teal },
});

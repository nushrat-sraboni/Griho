// apps/home/src/components/MenuCard.tsx
//
// A big tappable card on the building page that opens one part of the building
// (for example "Flats" or "Join codes"). It shows a colored icon tile, a title,
// one short line of information, and an arrow on the right. The teal border says
// "this one is ready to use". Owned by Bishal.

import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { cardStyle, colors, fonts } from '../theme';

type Props = {
  title: string;
  body: string;
  /** The little picture inside the colored tile. */
  icon: ReactNode;
  /** The tile's background color. */
  tileColor: string;
  onPress: () => void;
  /** A small amber number on the right (for example how many requests are waiting). Hidden when 0 or missing. */
  badge?: number;
};

export default function MenuCard({ title, body, icon, tileColor, onPress, badge }: Props) {
  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${body}`}
    >
      <View
        style={[styles.tile, { backgroundColor: tileColor }]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        {icon}
      </View>
      <View style={styles.text}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>
      </View>
      {badge ? (
        <View style={styles.badge} accessibilityElementsHidden importantForAccessibility="no">
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
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
        <Path d="M9 6 L15 12 L9 18" />
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    ...cardStyle,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderColor: colors.teal,
    borderWidth: 1.5,
  },
  tile: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    minWidth: 28,
    height: 28,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: colors.amber,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontFamily: fonts.extraBold, fontSize: 13, color: colors.onAmber },
  text: { flex: 1 },
  title: { fontFamily: fonts.bold, fontSize: 17, color: colors.ink, letterSpacing: -0.2 },
  body: {
    marginTop: 4,
    fontFamily: fonts.regular,
    fontSize: 13.5,
    lineHeight: 19,
    color: colors.muted,
  },
});

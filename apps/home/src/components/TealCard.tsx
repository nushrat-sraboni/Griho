// apps/home/src/components/TealCard.tsx
//
// The big rounded teal card with a softer circle tucked into one corner. It is
// used for the banner on the log-in screen and the "Make or join a building"
// card on the signed-in screen. Whatever you put inside sits on top of the
// circle. Owned by Bishal.

import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { colors } from '../theme';

type Props = {
  children: ReactNode;
  /** Where the soft circle sits: the bottom right or the top right corner. */
  circle?: 'bottom' | 'top';
  style?: ViewStyle;
};

export default function TealCard({ children, circle = 'bottom', style }: Props) {
  return (
    <View style={[styles.card, style]}>
      <View style={[styles.circle, circle === 'bottom' ? styles.circleBottom : styles.circleTop]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, backgroundColor: colors.teal, overflow: 'hidden' },
  circle: { position: 'absolute', backgroundColor: colors.tealLight },
  circleBottom: { right: -40, bottom: -60, width: 170, height: 170, borderRadius: 85 },
  circleTop: { right: -50, top: -60, width: 190, height: 190, borderRadius: 95 },
});

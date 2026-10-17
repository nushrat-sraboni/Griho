// apps/home/src/components/Notice.tsx
//
// A small message box with an icon.
//   error   : red, read out loud by screen readers as an alert
//   info    : yellow, for helpful notes (like "each app needs its own email")
//   success : green, for "it worked" messages (like "Your building is ready")
// Owned by Bishal.

import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { colors, fonts } from '../theme';

type Kind = 'error' | 'info' | 'success';

type Props = { kind: Kind; text: string };

const LOOK: Record<Kind, { background: string; text: string }> = {
  error: { background: colors.errorBackground, text: colors.errorText },
  info: { background: colors.noteBackground, text: colors.noteText },
  success: { background: colors.successBackground, text: colors.successText },
};

export default function Notice({ kind, text }: Props) {
  const look = LOOK[kind];

  return (
    <View
      style={[styles.box, { backgroundColor: look.background }]}
      accessibilityRole={kind === 'error' ? 'alert' : undefined}
    >
      <Svg
        width={20}
        height={20}
        viewBox="0 0 24 24"
        fill="none"
        stroke={look.text}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Circle cx={12} cy={12} r={10} />
        {kind === 'error' ? (
          <>
            <Line x1={12} y1={8} x2={12} y2={12} />
            <Line x1={12} y1={16} x2={12.01} y2={16} />
          </>
        ) : null}
        {kind === 'info' ? (
          <>
            <Line x1={12} y1={16} x2={12} y2={12} />
            <Line x1={12} y1={8} x2={12.01} y2={8} />
          </>
        ) : null}
        {kind === 'success' ? <Path d="M8 12.5 L11 15.5 L16.5 9" /> : null}
      </Svg>
      <Text style={[styles.text, { color: look.text }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  text: { flex: 1, fontFamily: fonts.medium, fontSize: 13.5, lineHeight: 20 },
});

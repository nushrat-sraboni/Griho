// apps/home/src/components/Notice.tsx
//
// A small message box with an icon. "error" is red and is read out loud by
// screen readers as an alert. "info" is yellow and is for helpful notes (like
// "each app needs its own email address"). Owned by Bishal.

import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

import { colors, fonts } from '../theme';

type Props = { kind: 'error' | 'info'; text: string };

export default function Notice({ kind, text }: Props) {
  const isError = kind === 'error';
  const textColor = isError ? colors.errorText : colors.noteText;

  return (
    <View
      style={[
        styles.box,
        { backgroundColor: isError ? colors.errorBackground : colors.noteBackground },
      ]}
      accessibilityRole={isError ? 'alert' : undefined}
    >
      <Svg
        width={20}
        height={20}
        viewBox="0 0 24 24"
        fill="none"
        stroke={textColor}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={styles.icon}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Circle cx={12} cy={12} r={10} />
        {isError ? (
          <>
            <Line x1={12} y1={8} x2={12} y2={12} />
            <Line x1={12} y1={16} x2={12.01} y2={16} />
          </>
        ) : (
          <>
            <Line x1={12} y1={16} x2={12} y2={12} />
            <Line x1={12} y1={8} x2={12.01} y2={8} />
          </>
        )}
      </Svg>
      <Text style={[styles.text, { color: textColor }]}>{text}</Text>
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
  icon: { marginTop: 0 },
  text: { flex: 1, fontFamily: fonts.medium, fontSize: 13.5, lineHeight: 20 },
});

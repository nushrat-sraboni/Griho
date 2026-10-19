// apps/home/src/components/CodeBox.tsx
//
// Shows a join code in big letters inside a dashed box, like a ticket. The text
// shrinks to fit if the code is long. A turned-off code is shown in a softer
// color. Owned by Bishal.

import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '../theme';

type Props = {
  value: string;
  /** 'large' for the main display, 'medium' for a smaller reminder. */
  size?: 'large' | 'medium';
  dimmed?: boolean;
};

export default function CodeBox({ value, size = 'large', dimmed = false }: Props) {
  const large = size === 'large';
  return (
    <View style={[styles.box, large ? styles.boxLarge : styles.boxMedium]}>
      <Text
        style={[
          styles.text,
          large ? styles.textLarge : styles.textMedium,
          dimmed && styles.textDimmed,
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
        selectable
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.fieldBorder,
    backgroundColor: colors.fieldBackground,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  boxLarge: { paddingVertical: 18 },
  boxMedium: { paddingVertical: 14 },
  text: { fontFamily: fonts.extraBold, color: colors.ink },
  textLarge: { fontSize: 32, letterSpacing: 4 },
  textMedium: { fontSize: 22, letterSpacing: 1.6 },
  textDimmed: { color: colors.muted },
});

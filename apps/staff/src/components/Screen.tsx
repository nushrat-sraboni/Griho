// apps/staff/src/components/Screen.tsx
//
// The frame every Griho Staff screen sits in: a cream background, the three soft
// circles in the top-right corner, and a scrolling area for the content. Using it
// on every screen keeps the look the same. The keyboard avoiding part makes the
// text boxes stay visible while the person types. Owned by Sraboni.

import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';

import { colors, styles } from '../styles';

// One circle: sized, placed, and outlined. The biggest one is also lightly filled.
function Ring({
  size,
  top,
  right,
  filled,
}: {
  size: number;
  top: number;
  right: number;
  filled?: boolean;
}) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top,
        right,
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1.5,
        borderColor: colors.ring,
        backgroundColor: filled ? colors.ringFill : 'transparent',
      }}
    />
  );
}

export default function Screen({
  children,
  footer,
}: {
  children: ReactNode;
  /** Something fixed to the bottom of the screen, like the bottom menu. */
  footer?: ReactNode;
}) {
  return (
    <View style={styles.screen}>
      <Ring size={254} top={-55} right={-84} filled />
      <Ring size={190} top={-23} right={-52} />
      <Ring size={128} top={8} right={-21} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
        {footer}
      </KeyboardAvoidingView>
    </View>
  );
}

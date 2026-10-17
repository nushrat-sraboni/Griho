// apps/home/src/components/Screen.tsx
//
// The frame every Griho Home screen sits in: the cream page, the pale green
// circles at the top right, and a scrolling area that keeps clear of the
// phone's top bar, bottom bar and on-screen keyboard.
// Owned by Bishal.

import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { colors } from '../theme';

type Props = { children: ReactNode };

export default function Screen({ children }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.page}>
      <Svg
        width={300}
        height={300}
        viewBox="0 0 300 300"
        fill="none"
        style={styles.circles}
        pointerEvents="none"
      >
        <Circle cx={150} cy={150} r={140} fill={colors.mint} />
        <Circle cx={150} cy={150} r={140} stroke={colors.arc} strokeWidth={1.5} />
        <Circle cx={150} cy={150} r={104} stroke={colors.arc} strokeWidth={1.5} />
        <Circle cx={150} cy={150} r={68} stroke={colors.arc} strokeWidth={1.5} />
      </Svg>
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.page, overflow: 'hidden' },
  circles: { position: 'absolute', right: -100, top: -70 },
  fill: { flex: 1 },
  content: { flexGrow: 1, paddingHorizontal: 20 },
});

// apps/staff/src/components/Eyebrow.tsx
//
// The small label above a screen's big heading: a short gold line followed by
// spaced-out green capital letters, like "WELCOME BACK" in the Griho design.
// Owned by Sraboni.

import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../styles';

export default function Eyebrow({ children }: { children: string }) {
  return (
    <View style={local.row}>
      <View style={local.line} />
      <Text style={local.text}>{children.toUpperCase()}</Text>
    </View>
  );
}

const local = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  line: { width: 22, height: 2, backgroundColor: colors.gold, marginRight: 10 },
  text: { color: colors.green, fontSize: 11, fontWeight: '800', letterSpacing: 2 },
});

// apps/staff/src/components/Avatar.tsx
//
// A small rounded square with a person's initials in it, like "KH" for Karim
// Hossain. The colour is picked from the name, so the same person always gets the
// same colour. It is used in the request lists and at the top of manager screens.
// Owned by Sraboni.

import { StyleSheet, Text, View } from 'react-native';

import { initialsOf } from '../text';

// Soft background and darker letter colour pairs, taken from the Griho design.
const PALETTE = [
  { bg: '#e8d7c4', fg: '#6d4e36' },
  { bg: '#eae8f6', fg: '#5d5994' },
  { bg: '#f8e8e2', fg: '#9a4d3a' },
  { bg: '#e1eee8', fg: '#19705b' },
  { bg: '#f7ebdd', fg: '#8a5a1c' },
];

// The same name always gives the same number, so the colour never changes.
function pick(name: string) {
  let total = 0;
  for (const letter of name) total += letter.charCodeAt(0);
  return PALETTE[total % PALETTE.length];
}

export default function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const colors = pick(name);
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={name}
      style={[
        local.box,
        { width: size, height: size, borderRadius: size * 0.32, backgroundColor: colors.bg },
      ]}
    >
      <Text style={[local.text, { color: colors.fg, fontSize: size * 0.3 }]}>
        {initialsOf(name)}
      </Text>
    </View>
  );
}

const local = StyleSheet.create({
  box: { alignItems: 'center', justifyContent: 'center' },
  text: { fontWeight: '800' },
});

// apps/staff/src/components/HouseIllustration.tsx
//
// A simple line drawing of a house with a flagpole and a small plus badge, drawn
// with plain boxes (no picture files and no extra libraries). It sits on the green
// banner, like the house in the Griho design. It is only decoration, so screen
// readers skip it. Owned by Sraboni.

import { StyleSheet, View } from 'react-native';

const LINE = '#cfe6dc';
const WIDTH = 1.4;

export default function HouseIllustration() {
  return (
    <View
      style={local.box}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {/* The ground line. */}
      <View style={[local.line, { left: 0, top: 90, width: 120, height: WIDTH }]} />
      {/* The flagpole. */}
      <View style={[local.line, { left: 59, top: 0, width: WIDTH, height: 14 }]} />
      {/* The roof: a square turned on its corner, with only its top two edges drawn. */}
      <View style={local.roof} />
      {/* The walls. */}
      <View style={[local.line, { left: 26, top: 56, width: WIDTH, height: 34 }]} />
      <View style={[local.line, { left: 94, top: 56, width: WIDTH, height: 34 }]} />
      {/* The door. */}
      <View style={local.door} />
      {/* The two windows. */}
      <View style={local.window} />
      <View style={[local.window, { left: 80 }]} />
      {/* The little plus badge. */}
      <View style={local.badge} />
      <View style={[local.line, { left: 96, top: 9, width: WIDTH, height: 10 }]} />
      <View style={[local.line, { left: 91, top: 14, width: 10, height: WIDTH }]} />
    </View>
  );
}

const local = StyleSheet.create({
  box: { width: 120, height: 100 },
  line: { position: 'absolute', backgroundColor: LINE },
  roof: {
    position: 'absolute',
    left: 30,
    top: 26,
    width: 60,
    height: 60,
    borderTopWidth: WIDTH,
    borderLeftWidth: WIDTH,
    borderColor: LINE,
    transform: [{ rotate: '45deg' }],
  },
  door: {
    position: 'absolute',
    left: 54,
    top: 68,
    width: 12,
    height: 22,
    borderRadius: 2,
    backgroundColor: '#6fa99a',
  },
  window: {
    position: 'absolute',
    left: 31,
    top: 62,
    width: 9,
    height: 12,
    borderRadius: 2,
    borderWidth: WIDTH,
    borderColor: LINE,
  },
  badge: {
    position: 'absolute',
    left: 90,
    top: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: WIDTH,
    borderColor: LINE,
  },
});

// apps/staff/src/components/Brand.tsx
//
// The Griho logo row: a green square holding four small tiles (one of them gold),
// then the words "Griho Staff". It sits at the top of every screen, like the logo
// in the Griho design. Owned by Sraboni.

import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../styles';

// One small tile inside the logo square.
function Tile({ gold }: { gold?: boolean }) {
  return <View style={[local.tile, gold && { backgroundColor: colors.goldDot }]} />;
}

export default function Brand() {
  return (
    <View style={local.row} accessibilityRole="header">
      <View style={local.mark}>
        <Tile />
        <Tile gold />
        <Tile />
        <Tile />
      </View>
      <Text style={local.name}>
        <Text style={local.bold}>Griho</Text> <Text style={local.light}>Staff</Text>
      </Text>
    </View>
  );
}

const local = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  mark: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.green,
    padding: 9,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'space-between',
    marginRight: 12,
  },
  tile: { width: 9, height: 9, borderRadius: 3, backgroundColor: colors.white },
  name: { fontSize: 24, letterSpacing: -0.5, color: colors.ink },
  bold: { fontWeight: '800' },
  light: { fontWeight: '400', color: colors.muted },
});

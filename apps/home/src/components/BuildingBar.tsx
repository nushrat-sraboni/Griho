// apps/home/src/components/BuildingBar.tsx
//
// The bar at the top of every screen inside a building. It always shows the
// building's name and the person's role there, because the product rules say
// the building name must be visible on every Griho Home screen. The "Switch"
// button goes back to the list of buildings. Owned by Bishal.

import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors, fonts } from '../theme';
import { LogoMark } from './Logo';
import Pill from './Pill';

type Props = {
  buildingName: string;
  roleText: string;
  onSwitch: () => void;
};

export default function BuildingBar({ buildingName, roleText, onSwitch }: Props) {
  return (
    <View style={styles.bar}>
      <LogoMark />
      <Text style={styles.name} numberOfLines={1}>
        {buildingName}
      </Text>
      <Pill text={roleText} />
      <Pressable
        style={styles.switch}
        onPress={onSwitch}
        accessibilityRole="button"
        accessibilityLabel="Switch building"
      >
        <Svg
          width={16}
          height={16}
          viewBox="0 0 24 24"
          fill="none"
          stroke={colors.teal}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <Path d="M7 4 L3 8 L7 12" />
          <Path d="M3 8 H17" />
          <Path d="M17 12 L21 16 L17 20" />
          <Path d="M21 16 H7" />
        </Svg>
        <Text style={styles.switchText}>Switch</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 10,
    paddingRight: 8,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 26,
    shadowColor: colors.ink,
    shadowOpacity: 0.06,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  name: { flex: 1, fontFamily: fonts.extraBold, fontSize: 15, color: colors.ink },
  switch: {
    height: 44,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  switchText: { fontFamily: fonts.bold, fontSize: 13.5, color: colors.teal },
});

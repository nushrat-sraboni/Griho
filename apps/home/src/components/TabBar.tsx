// apps/home/src/components/TabBar.tsx
//
// The bar at the bottom of the screen inside a building, like in a phone app:
// Home, Messages and Settings. The tab you are on is teal with a small dash above
// it. Every tab is at least 48 tall so it is easy to tap, and the bar keeps clear
// of the phone's own bottom edge. Owned by Bishal.

import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import type { TabName } from '../tabs';
import { colors, fonts } from '../theme';

type Props = { active: TabName; onSelect: (tab: TabName) => void };

function icon(tab: TabName, color: string): ReactNode {
  const common = {
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  if (tab === 'home') {
    return (
      <Svg {...common}>
        <Path d="M3 11 L12 4 L21 11" />
        <Path d="M5 10 V20 H19 V10" />
      </Svg>
    );
  }
  if (tab === 'messages') {
    return (
      <Svg {...common}>
        <Path d="M4 5 H20 V16 H11 L6 20 V16 H4 Z" />
      </Svg>
    );
  }
  return (
    <Svg {...common}>
      <Circle cx={12} cy={8} r={4} />
      <Path d="M4 21 C4 16.5 7.5 14 12 14 C16.5 14 20 16.5 20 21" />
    </Svg>
  );
}

const TABS: { name: TabName; label: string }[] = [
  { name: 'home', label: 'Home' },
  { name: 'messages', label: 'Messages' },
  { name: 'settings', label: 'Settings' },
];

export default function TabBar({ active, onSelect }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + 6 }]}>
      {TABS.map((tab) => {
        const on = tab.name === active;
        return (
          <Pressable
            key={tab.name}
            style={styles.tab}
            onPress={() => onSelect(tab.name)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            accessibilityLabel={tab.label}
          >
            <View style={[styles.dash, on && styles.dashOn]} />
            {icon(tab.name, on ? colors.teal : colors.muted)}
            <Text style={[styles.label, on && styles.labelOn]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 4,
  },
  tab: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', gap: 2 },
  dash: { width: 24, height: 3, borderRadius: 2, backgroundColor: 'transparent', marginBottom: 2 },
  dashOn: { backgroundColor: colors.teal },
  label: { fontFamily: fonts.semiBold, fontSize: 11.5, color: colors.muted },
  labelOn: { fontFamily: fonts.bold, color: colors.teal },
});

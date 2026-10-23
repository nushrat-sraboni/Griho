// apps/staff/src/components/BottomNav.tsx
//
// The bottom menu of Griho Staff. A manager sees five tabs (Overview, Access, Guards,
// Messages, Settings) and a guard sees three (Home, Messages, Settings). The tab you are on is shown on a
// pale green pill, like the Griho Staff design. (The design also has little icons.
// Those need a drawing library the Staff app does not have yet, so for now the tabs
// show words only.) Owned by Sraboni.

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../styles';

export type ManagerTab = 'overview' | 'access' | 'guards' | 'messages' | 'settings';
export type GuardTab = 'home' | 'messages' | 'settings';

export const MANAGER_TABS: { id: ManagerTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'access', label: 'Access' },
  { id: 'guards', label: 'Guards' },
  { id: 'messages', label: 'Messages' },
  { id: 'settings', label: 'Settings' },
];

export const GUARD_TABS: { id: GuardTab; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'messages', label: 'Messages' },
  { id: 'settings', label: 'Settings' },
];

type Props<T extends string> = {
  tabs: { id: T; label: string }[];
  current: T;
  onChange: (tab: T) => void;
  /** A small number shown on one tab, like the count of waiting requests. */
  badges?: Partial<Record<T, number>>;
};

export default function BottomNav<T extends string>({ tabs, current, onChange, badges }: Props<T>) {
  // With five tabs the words are a little smaller, so they all fit on a narrow phone.
  const small = tabs.length > 4;
  return (
    <View style={local.bar} accessibilityRole="tablist">
      {tabs.map((tab) => {
        const active = tab.id === current;
        const badge = badges?.[tab.id];
        return (
          <Pressable
            key={tab.id}
            style={[local.tab, active && local.tabActive]}
            onPress={() => onChange(tab.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={tab.label}
          >
            <Text style={[local.label, small && local.labelSmall, active && local.labelActive]}>
              {tab.label}
            </Text>
            {badge ? (
              <View style={local.badge}>
                <Text style={local.badgeText}>{badge}</Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const local = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 22,
    marginHorizontal: 12,
    marginBottom: 12,
    padding: 6,
    shadowColor: colors.ink,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  tab: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  tabActive: { backgroundColor: colors.mint },
  label: { color: colors.muted, fontSize: 12, fontWeight: '800' },
  labelSmall: { fontSize: 10.5 },
  labelActive: { color: colors.green },
  badge: {
    marginLeft: 5,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 5,
    backgroundColor: colors.goldDot,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: colors.ink, fontSize: 10, fontWeight: '800' },
});

// apps/staff/src/components/BottomNav.tsx
//
// The bottom menu of the manager workspace: Overview, Access, Guards, and Messages.
// The tab you are on is shown on a pale green pill, like the Griho Staff design.
// (The design also has little icons. Those need a drawing library the Staff app
// does not have yet, so for now the tabs show words only.) Owned by Sraboni.

import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../styles';

export type ManagerTab = 'overview' | 'access' | 'guards' | 'messages';

const TABS: { id: ManagerTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'access', label: 'Access' },
  { id: 'guards', label: 'Guards' },
  { id: 'messages', label: 'Messages' },
];

type Props = {
  current: ManagerTab;
  onChange: (tab: ManagerTab) => void;
  /** A small number shown on the Access tab, like the count of waiting requests. */
  accessBadge?: number;
};

export default function BottomNav({ current, onChange, accessBadge }: Props) {
  return (
    <View style={local.bar} accessibilityRole="tablist">
      {TABS.map((tab) => {
        const active = tab.id === current;
        return (
          <Pressable
            key={tab.id}
            style={[local.tab, active && local.tabActive]}
            onPress={() => onChange(tab.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={tab.label}
          >
            <Text style={[local.label, active && local.labelActive]}>{tab.label}</Text>
            {tab.id === 'access' && accessBadge ? (
              <View style={local.badge}>
                <Text style={local.badgeText}>{accessBadge}</Text>
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

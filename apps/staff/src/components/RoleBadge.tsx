// apps/staff/src/components/RoleBadge.tsx
//
// A tiny coloured label showing a person's role: "Owner", "Tenant", "Manager", or
// "Guard". Each role has its own soft colour, taken from the Griho Staff design, so
// you can tell who you are talking to at a glance. Owned by Sraboni.

import type { Role } from '@griho/shared';
import { StyleSheet, Text } from 'react-native';

import { roleWord } from '../chatTarget';

// Soft background and darker text colours for each role.
const COLORS: Record<Role, { bg: string; fg: string }> = {
  owner: { bg: '#e1eee8', fg: '#19705b' },
  tenant: { bg: '#eae8f6', fg: '#5d5994' },
  manager: { bg: '#dde6f3', fg: '#2f4a73' },
  guard: { bg: '#f7ebdd', fg: '#6b4412' },
};

export default function RoleBadge({ role }: { role: Role }) {
  const colors = COLORS[role];
  return (
    <Text style={[local.badge, { backgroundColor: colors.bg, color: colors.fg }]}>
      {roleWord(role)}
    </Text>
  );
}

const local = StyleSheet.create({
  badge: {
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    fontSize: 10,
    fontWeight: '800',
    overflow: 'hidden',
  },
});

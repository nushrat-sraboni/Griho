// apps/staff/src/components/HeroCard.tsx
//
// The big deep-green banner from the Griho design. It has a small capital-letter
// label, a bold title, an optional line of smaller text, the house drawing on the
// right, and room for extra content (like a status pill) underneath.
// Owned by Sraboni.

import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../styles';
import HouseIllustration from './HouseIllustration';

type Props = {
  label: string;
  title: string;
  detail?: string;
  children?: ReactNode;
};

export default function HeroCard({ label, title, detail, children }: Props) {
  return (
    <View style={local.card}>
      <View style={local.circle} pointerEvents="none" />
      <View style={local.house} pointerEvents="none">
        <HouseIllustration />
      </View>
      <Text style={local.label}>{label.toUpperCase()}</Text>
      <Text style={local.title}>{title}</Text>
      {detail ? <Text style={local.detail}>{detail}</Text> : null}
      {children}
    </View>
  );
}

const local = StyleSheet.create({
  card: {
    backgroundColor: colors.green,
    borderRadius: 28,
    padding: 20,
    marginTop: 20,
    overflow: 'hidden',
    minHeight: 130,
  },
  circle: {
    position: 'absolute',
    right: -34,
    top: 6,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: colors.greenSoft,
  },
  house: { position: 'absolute', right: 14, top: 16 },
  label: { color: '#cfe6dc', fontSize: 10, fontWeight: '800', letterSpacing: 2 },
  title: {
    color: colors.white,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 27,
    marginTop: 10,
    maxWidth: 190,
  },
  detail: { color: '#e4f0eb', fontSize: 13, lineHeight: 19, marginTop: 8, maxWidth: 190 },
});

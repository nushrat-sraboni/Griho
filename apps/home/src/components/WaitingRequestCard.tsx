// apps/home/src/components/WaitingRequestCard.tsx
//
// A request the person sent that has not been answered yet, shown on "My
// buildings": a small clock badge, the building's name, what they asked to
// become, and "An owner has not answered yet." Owned by Bishal.

import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import type { JoinRequest } from '@griho/shared';

import { requestStatusLine, roleWords } from '../joining';
import { colors, fonts } from '../theme';
import Pill from './Pill';

type Props = { request: JoinRequest };

export default function WaitingRequestCard({ request }: Props) {
  const role = roleWords(request.role, request.flat_label);

  return (
    <View
      style={styles.card}
      accessible
      accessibilityLabel={`${request.building.name}, ${role}. ${requestStatusLine(request)}`}
    >
      <View style={styles.clock} accessibilityElementsHidden importantForAccessibility="no">
        <Svg
          width={22}
          height={22}
          viewBox="0 0 24 24"
          fill="none"
          stroke={colors.onAmber}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <Circle cx={12} cy={12} r={9} />
          <Path d="M12 7 V12 L15 14" />
        </Svg>
      </View>
      <View style={styles.text}>
        <Text style={styles.name}>{request.building.name}</Text>
        <View style={styles.pill}>
          <Pill text={role} tone="amber" />
        </View>
        <Text style={styles.line}>{requestStatusLine(request)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    backgroundColor: '#FFF9EC',
    borderWidth: 1,
    borderColor: '#F0DCB0',
    borderRadius: 20,
  },
  clock: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.amber,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1 },
  name: { fontFamily: fonts.bold, fontSize: 16, color: colors.ink },
  pill: { marginTop: 4, alignSelf: 'flex-start' },
  line: {
    marginTop: 6,
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
  },
});

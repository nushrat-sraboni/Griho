// apps/home/src/components/HouseDrawing.tsx
//
// The white line drawing of a house that sits inside the teal cards. It is only
// decoration, so it is hidden from screen readers. Owned by Bishal.

import Svg, { Circle, Path, Rect } from 'react-native-svg';

type Props = { width: number; height: number };

export default function HouseDrawing({ width, height }: Props) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 120 96"
      fill="none"
      stroke="#FFFFFF"
      strokeOpacity={0.8}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Path d="M8 52 L60 14 L112 52" />
      <Path d="M16 47 V88 H104 V47" />
      <Path d="M6 88 H114" />
      <Path d="M34 64 L60 40 L86 64 V88 H34 Z" />
      <Rect x={52} y={66} width={16} height={22} rx={3} fill="#FFFFFF" fillOpacity={0.35} />
      <Rect x={22} y={58} width={9} height={12} rx={2} fill="#FFFFFF" fillOpacity={0.35} />
      <Rect x={89} y={58} width={9} height={12} rx={2} fill="#FFFFFF" fillOpacity={0.35} />
      <Path d="M60 14 V5" />
      <Circle cx={100} cy={20} r={6} />
      <Path d="M100 17 V23 M97 20 H103" />
    </Svg>
  );
}

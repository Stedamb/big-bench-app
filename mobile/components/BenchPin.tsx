import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";

interface BenchPinProps {
  colors?: string[];
}

// Native port of the bicolor pin markup in
// BigBenchApp/src/components/blocks/BenchMap.tsx (createBenchIcon). Same
// path data and layout; SVG DOM attrs become react-native-svg props and the
// raw <linearGradient> becomes <LinearGradient>. No gradient-id collisions
// to guard against here — each <BenchPin> is its own isolated SVG tree, not
// shared markup injected into one DOM.
export function BenchPin({ colors = [] }: BenchPinProps) {
  const primaryColor = colors[0] || "#C4572A";
  const secondaryColor = colors[1] || primaryColor;

  return (
    <Svg width={28} height={42} viewBox="0 0 24 36">
      <Defs>
        <LinearGradient id="pinGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="50%" stopColor={primaryColor} stopOpacity={1} />
          <Stop offset="50%" stopColor={secondaryColor} stopOpacity={1} />
        </LinearGradient>
      </Defs>
      <Path
        d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z"
        fill="url(#pinGradient)"
        stroke="#1a1a1a"
        strokeWidth={1}
      />
      <Circle cx={12} cy={11} r={5} fill="white" fillOpacity={0.9} />
      <Rect x={8} y={9.5} width={8} height={1.5} rx={0.5} fill={primaryColor} />
      <Rect x={9} y={11.5} width={1.5} height={3} rx={0.3} fill={primaryColor} />
      <Rect x={13.5} y={11.5} width={1.5} height={3} rx={0.3} fill={secondaryColor} />
    </Svg>
  );
}

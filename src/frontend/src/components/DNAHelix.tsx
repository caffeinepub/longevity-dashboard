import { useMemo } from "react";

interface MarkerInfo {
  label: string;
  completed: boolean;
  color: string;
}

interface DNAHelixProps {
  height?: number;
  markers?: MarkerInfo[];
  showMarkers?: boolean;
}

const DEFAULT_MARKERS: MarkerInfo[] = [
  { label: "Ern\u00e4hrung", completed: false, color: "oklch(0.76 0.15 180)" },
  { label: "Schlaf", completed: false, color: "oklch(0.70 0.18 210)" },
  { label: "Bewegung", completed: false, color: "oklch(0.83 0.22 145)" },
  { label: "Stress", completed: false, color: "oklch(0.76 0.12 250)" },
  { label: "Fasten", completed: false, color: "oklch(0.78 0.18 160)" },
  { label: "Routinen", completed: false, color: "oklch(0.72 0.16 195)" },
];

const WIDTH = 160;
const CENTER_X = WIDTH / 2;
const AMPLITUDE = 58;
const PERIOD = 140;
const STEP = 5; // sample every 5px for smooth curves with fewer points

export function DNAHelix({
  height = 900,
  markers = DEFAULT_MARKERS,
  showMarkers = true,
}: DNAHelixProps) {
  const { strand1Path, strand2Path, rungs, markerPositions } = useMemo(() => {
    // Build sine wave paths using line segments (accurate, smooth at 5px steps)
    const s1Parts: string[] = [];
    const s2Parts: string[] = [];

    for (let y = 0; y <= height; y += STEP) {
      const t = (y / PERIOD) * 2 * Math.PI;
      const x1 = CENTER_X + AMPLITUDE * Math.sin(t);
      const x2 = CENTER_X + AMPLITUDE * Math.sin(t + Math.PI);
      const cmd = y === 0 ? "M" : "L";
      s1Parts.push(`${cmd} ${x1.toFixed(2)} ${y}`);
      s2Parts.push(`${cmd} ${x2.toFixed(2)} ${y}`);
    }

    // Rungs at half-period intervals where strands cross
    const rungList: { x1: number; y: number; x2: number; key: string }[] = [];
    for (let y = PERIOD / 4; y < height; y += PERIOD / 2) {
      const t = (y / PERIOD) * 2 * Math.PI;
      const rx1 = CENTER_X + AMPLITUDE * Math.sin(t);
      const rx2 = CENTER_X + AMPLITUDE * Math.sin(t + Math.PI);
      rungList.push({ x1: rx1, y, x2: rx2, key: `rung-${Math.round(y)}` });
    }

    // 6 markers at evenly spaced y positions
    const mPositions = markers.map((marker, i) => {
      const y = 60 + (i * (height - 120)) / (markers.length - 1);
      const t = (y / PERIOD) * 2 * Math.PI;
      const mx1 = CENTER_X + AMPLITUDE * Math.sin(t);
      const mx2 = CENTER_X + AMPLITUDE * Math.sin(t + Math.PI);
      const onRight = mx1 > mx2;
      return {
        x: onRight ? mx1 : mx2,
        y,
        onRight,
        label: marker.label,
        completed: marker.completed,
        color: marker.color,
        idx: i,
      };
    });

    return {
      strand1Path: s1Parts.join(" "),
      strand2Path: s2Parts.join(" "),
      rungs: rungList,
      markerPositions: mPositions,
    };
  }, [height, markers]);

  return (
    <svg
      width={WIDTH}
      height={height}
      viewBox={`0 0 ${WIDTH} ${height}`}
      className="helix-container"
      style={{ overflow: "visible" }}
      role="img"
      aria-label="DNA Doppelhelix Animation"
    >
      <defs>
        <filter id="glow-teal" x="-80%" y="-5%" width="260%" height="110%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="0 0.6 0.8 0 0  0 0.8 0.7 0 0.15  0 0.4 0.9 0 0.2  0 0 0 14 -5"
            result="glow"
          />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="glow-green" x="-80%" y="-5%" width="260%" height="110%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="0 0.3 0.1 0 0  0 0.9 0.2 0 0.3  0 0.3 0.1 0 0.05  0 0 0 14 -5"
            result="glow"
          />
          <feMerge>
            <feMergeNode in="glow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="marker-glow" x="-300%" y="-300%" width="700%" height="700%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="strand1-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.76 0.15 180)" />
          <stop offset="50%" stopColor="oklch(0.68 0.18 215)" />
          <stop offset="100%" stopColor="oklch(0.76 0.15 180)" />
        </linearGradient>
        <linearGradient id="strand2-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.83 0.22 145)" />
          <stop offset="50%" stopColor="oklch(0.76 0.15 180)" />
          <stop offset="100%" stopColor="oklch(0.83 0.22 145)" />
        </linearGradient>
      </defs>

      {/* Strand 1 glow */}
      <path
        d={strand1Path}
        fill="none"
        stroke="oklch(0.76 0.15 180 / 0.35)"
        strokeWidth="7"
        filter="url(#glow-teal)"
        className="helix-strand-1"
      />
      {/* Strand 1 crisp */}
      <path
        d={strand1Path}
        fill="none"
        stroke="url(#strand1-grad)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="helix-strand-1"
      />

      {/* Strand 2 glow */}
      <path
        d={strand2Path}
        fill="none"
        stroke="oklch(0.83 0.22 145 / 0.35)"
        strokeWidth="7"
        filter="url(#glow-green)"
        className="helix-strand-2"
      />
      {/* Strand 2 crisp */}
      <path
        d={strand2Path}
        fill="none"
        stroke="url(#strand2-grad)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="helix-strand-2"
      />

      {/* Rungs */}
      {rungs.map((rung, i) => (
        <line
          key={rung.key}
          x1={rung.x1}
          y1={rung.y}
          x2={rung.x2}
          y2={rung.y}
          stroke="oklch(0.76 0.15 180 / 0.4)"
          strokeWidth="1"
          strokeLinecap="round"
          className="helix-rung"
          style={{ animationDelay: `${(i % 8) * 0.1}s` }}
        />
      ))}

      {/* Markers */}
      {showMarkers &&
        markerPositions.map((mp) => (
          <g key={`marker-${mp.idx}`} filter="url(#marker-glow)">
            <line
              x1={mp.x}
              y1={mp.y}
              x2={mp.onRight ? mp.x + 20 : mp.x - 20}
              y2={mp.y}
              stroke={mp.color}
              strokeWidth="0.8"
              opacity={mp.completed ? 0.9 : 0.28}
            />
            <circle
              cx={mp.x}
              cy={mp.y}
              r={4.5}
              fill={mp.completed ? mp.color : "none"}
              stroke={mp.color}
              strokeWidth="1.5"
              className={mp.completed ? "marker-dot-active" : "marker-dot-dim"}
            />
            {mp.completed && (
              <circle
                cx={mp.x}
                cy={mp.y}
                r={8.5}
                fill="none"
                stroke={mp.color}
                strokeWidth="0.7"
                opacity="0.4"
                className="marker-dot-active"
              />
            )}
          </g>
        ))}
    </svg>
  );
}

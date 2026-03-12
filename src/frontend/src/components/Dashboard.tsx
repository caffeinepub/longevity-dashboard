import { CheckCircle2, Circle, LogOut } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useDailyScore, useDailySummary } from "../hooks/useQueries";
import { DNAHelix } from "./DNAHelix";

const CATEGORIES = [
  {
    key: "nutrition" as const,
    view: "ernaehrung",
    label: "Ernährung",
    emoji: "🥗",
    color: "oklch(0.76 0.15 180)",
    description: "Nährstoffe tracken",
  },
  {
    key: "sleep" as const,
    view: "schlaf",
    label: "Schlaf",
    emoji: "🌙",
    color: "oklch(0.70 0.18 210)",
    description: "Schlafqualität erfassen",
  },
  {
    key: "movement" as const,
    view: "bewegung",
    label: "Bewegung",
    emoji: "⚡",
    color: "oklch(0.83 0.22 145)",
    description: "Aktivitäten loggen",
  },
  {
    key: "stress" as const,
    view: "stress",
    label: "Stress",
    emoji: "🧘",
    color: "oklch(0.76 0.12 250)",
    description: "Stresslevel messen",
  },
  {
    key: "fasting" as const,
    view: "fasten",
    label: "Fasten",
    emoji: "⏱",
    color: "oklch(0.78 0.18 160)",
    description: "Intervallfasten Timer",
  },
  {
    key: "routines" as const,
    view: "routinen",
    label: "Routinen",
    emoji: "✅",
    color: "oklch(0.72 0.16 195)",
    description: "Gewohnheiten pflegen",
  },
];

// r=72, circumference = 2π×72 ≈ 452.4
const RING_R = 72;
const CIRCUMFERENCE = 2 * Math.PI * RING_R;

interface DashboardProps {
  onNavigate: (view: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { data: summary } = useDailySummary();
  const { data: score } = useDailyScore();
  const { clear } = useInternetIdentity();

  const scoreNum = score ? Number(score) : 0;
  const dashOffset = CIRCUMFERENCE - (scoreNum / 100) * CIRCUMFERENCE;

  const markers = CATEGORIES.map((cat) => ({
    label: cat.label,
    completed: summary ? summary[cat.key] : false,
    color: cat.color,
  }));

  const completedCount = markers.filter((m) => m.completed).length;

  return (
    <div
      className="relative flex flex-col items-center"
      style={{ minHeight: "calc(100vh - 80px)", overflow: "hidden" }}
    >
      {/* Photo Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <img
          src="/assets/uploads/IMG_8928-1.jpeg"
          alt=""
          className="w-full h-full object-cover object-center"
          style={{ opacity: 0.55 }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.75) 100%)",
          }}
        />
      </div>

      {/* Logout button */}
      <button
        type="button"
        onClick={clear}
        className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all duration-200"
        style={{
          background: "oklch(0.09 0.018 264 / 0.7)",
          border: "1px solid oklch(0.76 0.15 180 / 0.15)",
          color: "oklch(0.45 0.01 220)",
          backdropFilter: "blur(8px)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color =
            "oklch(0.55 0.22 25)";
          (e.currentTarget as HTMLButtonElement).style.borderColor =
            "oklch(0.55 0.22 25 / 0.4)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color =
            "oklch(0.45 0.01 220)";
          (e.currentTarget as HTMLButtonElement).style.borderColor =
            "oklch(0.76 0.15 180 / 0.15)";
        }}
        data-ocid="dashboard.logout.button"
      >
        <LogOut size={12} />
        <span>Abmelden</span>
      </button>

      {/* Content overlay */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-2xl px-4 pt-8 pb-12">
        {/* Header */}
        <div className="text-center mb-10 animate-fade-in-up">
          <p
            className="text-xs tracking-[0.45em] uppercase mb-2 mono-data"
            style={{ color: "oklch(0.76 0.15 180 / 0.7)" }}
          >
            Longevity·Dashboard
          </p>
          <h1 className="text-3xl font-light tracking-tight text-foreground">
            {new Date().toLocaleDateString("de-DE", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </h1>
          <p className="text-xs text-muted-foreground mt-1 mono-data">
            {new Date().getFullYear()}
          </p>
        </div>

        {/* Score Ring */}
        <div
          className="relative flex items-center justify-center mb-10 animate-fade-in-up"
          style={{ animationDelay: "0.1s" }}
        >
          <div
            className="absolute rounded-full"
            style={{
              width: 176,
              height: 176,
              background: `radial-gradient(circle, oklch(0.76 0.15 180 / ${scoreNum > 0 ? 0.08 : 0.03}) 0%, transparent 70%)`,
            }}
          />
          <svg
            width="160"
            height="160"
            viewBox="0 0 160 160"
            role="img"
            aria-label={`Tages-Score: ${scoreNum} von 100`}
          >
            <circle
              cx="80"
              cy="80"
              r={RING_R}
              fill="none"
              stroke="oklch(0.76 0.15 180 / 0.08)"
              strokeWidth="7"
            />
            <circle
              cx="80"
              cy="80"
              r={RING_R}
              fill="none"
              stroke={
                scoreNum >= 80 ? "oklch(0.83 0.22 145)" : "oklch(0.76 0.15 180)"
              }
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 80 80)"
              style={{
                filter: `drop-shadow(0 0 8px ${
                  scoreNum >= 80
                    ? "oklch(0.83 0.22 145 / 0.7)"
                    : "oklch(0.76 0.15 180 / 0.7)"
                }) drop-shadow(0 0 20px ${
                  scoreNum >= 80
                    ? "oklch(0.83 0.22 145 / 0.3)"
                    : "oklch(0.76 0.15 180 / 0.25)"
                })`,
                transition:
                  "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.6s ease",
              }}
            />
            <circle
              cx="80"
              cy="80"
              r="63"
              fill="none"
              stroke="oklch(0.83 0.22 145 / 0.06)"
              strokeWidth="1"
              strokeDasharray="4 8"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span
              className="mono-data font-bold"
              style={{
                fontSize: "2.4rem",
                lineHeight: 1,
                color:
                  scoreNum >= 80
                    ? "oklch(0.83 0.22 145)"
                    : "oklch(0.76 0.15 180)",
                textShadow: `0 0 16px ${
                  scoreNum >= 80
                    ? "oklch(0.83 0.22 145 / 0.7)"
                    : "oklch(0.76 0.15 180 / 0.7)"
                }`,
              }}
            >
              {scoreNum}
            </span>
            <span
              className="text-xs text-muted-foreground tracking-[0.25em] uppercase mt-1"
              style={{ fontSize: "9px" }}
            >
              Score
            </span>
            <span
              className="mono-data mt-1"
              style={{ fontSize: "10px", color: "oklch(0.52 0.01 220)" }}
            >
              {completedCount}/6
            </span>
          </div>
        </div>

        {/* Category Grid — clickable tiles */}
        <div
          className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full animate-fade-in-up"
          style={{ animationDelay: "0.2s" }}
        >
          {CATEGORIES.map((cat, idx) => {
            const isDone = summary ? summary[cat.key] : false;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => onNavigate(cat.view)}
                className="glass-card rounded-xl p-4 flex flex-col items-center gap-2 transition-all duration-300 cursor-pointer text-left w-full dashboard-tile"
                style={
                  {
                    borderColor: isDone
                      ? cat.color.replace(")", " / 0.35)")
                      : "oklch(0.76 0.15 180 / 0.18)",
                    boxShadow: isDone
                      ? `0 0 18px ${cat.color.replace(")", " / 0.12)")}`
                      : "none",
                    background: isDone
                      ? "oklch(0.09 0.018 264 / 0.9)"
                      : undefined,
                    "--tile-glow-color": cat.color,
                  } as React.CSSProperties
                }
                data-ocid={`dashboard.item.${idx + 1}`}
              >
                <div className="text-xl">{cat.emoji}</div>
                <div
                  className="text-xs font-medium tracking-wide"
                  style={{ color: isDone ? cat.color : "oklch(0.65 0.01 220)" }}
                >
                  {cat.label}
                </div>
                <div
                  className="text-xs"
                  style={{ color: "oklch(0.38 0.01 220)", fontSize: "10px" }}
                >
                  {cat.description}
                </div>
                {isDone ? (
                  <CheckCircle2
                    size={14}
                    style={{
                      color: cat.color,
                      filter: `drop-shadow(0 0 4px ${cat.color})`,
                    }}
                  />
                ) : (
                  <Circle
                    size={14}
                    className="opacity-20"
                    style={{ color: "oklch(0.52 0.01 220)" }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Helix + labels panel */}
        <div
          className="w-full mt-8 flex justify-center animate-fade-in-up"
          style={{ animationDelay: "0.3s" }}
        >
          <div className="glass-card rounded-2xl p-5 w-full max-w-sm">
            <p
              className="text-xs tracking-[0.35em] text-center mono-data mb-5"
              style={{
                color: "oklch(0.76 0.15 180 / 0.6)",
                textTransform: "uppercase",
                fontSize: "9px",
              }}
            >
              Biomarker · Heute
            </p>
            <div className="flex items-stretch gap-5">
              <div className="flex-shrink-0">
                <DNAHelix height={290} markers={markers} showMarkers={true} />
              </div>
              <div className="flex flex-col justify-between py-0.5 flex-1">
                {CATEGORIES.map((cat) => {
                  const isDone = summary ? summary[cat.key] : false;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => onNavigate(cat.view)}
                      className="flex items-center gap-2 text-left hover:opacity-80 transition-opacity"
                      data-ocid={`dashboard.helix.${cat.key}.button`}
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-all duration-500"
                        style={{
                          backgroundColor: isDone
                            ? cat.color
                            : "oklch(0.22 0.01 220)",
                          boxShadow: isDone ? `0 0 5px ${cat.color}` : "none",
                        }}
                      />
                      <span
                        className="text-xs transition-colors duration-300"
                        style={{
                          color: isDone
                            ? "oklch(0.82 0.01 220)"
                            : "oklch(0.38 0.01 220)",
                        }}
                      >
                        {cat.label}
                      </span>
                      {isDone && (
                        <CheckCircle2
                          size={9}
                          className="ml-auto flex-shrink-0"
                          style={{ color: cat.color }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

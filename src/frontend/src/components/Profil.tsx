import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Loader2,
  Save,
  TrendingUp,
  User,
  Weight,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  useAddWeightEntry,
  useSaveUserProfile,
  useUserProfile,
  useWeightHistory,
} from "../hooks/useQueries";

interface ProfilProps {
  onBack: () => void;
}

function WeightChart({
  entries,
}: { entries: { weightKg: number; timestamp: bigint }[] }) {
  const last30 = entries.slice(-30);

  if (last30.length < 2) {
    return (
      <div
        className="flex flex-col items-center justify-center py-10 rounded-xl"
        style={{
          background: "oklch(0.09 0.018 264 / 0.6)",
          border: "1px solid oklch(0.76 0.15 180 / 0.1)",
        }}
        data-ocid="profil.empty_state"
      >
        <TrendingUp size={28} style={{ color: "oklch(0.76 0.15 180 / 0.3)" }} />
        <p className="mt-3 text-sm" style={{ color: "oklch(0.42 0.01 220)" }}>
          Noch keine Daten — trage dein Gewicht ein
        </p>
      </div>
    );
  }

  const W = 480;
  const H = 180;
  const PAD = { top: 16, right: 20, bottom: 32, left: 48 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const weights = last30.map((e) => e.weightKg);
  const minW = Math.min(...weights);
  const maxW = Math.max(...weights);
  const range = maxW - minW || 1;

  const toX = (i: number) => PAD.left + (i / (last30.length - 1)) * chartW;
  const toY = (w: number) => PAD.top + chartH - ((w - minW) / range) * chartH;

  const pathD = last30
    .map((e, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(e.weightKg)}`)
    .join(" ");

  const areaD = `${pathD} L ${toX(last30.length - 1)} ${PAD.top + chartH} L ${toX(0)} ${PAD.top + chartH} Z`;

  const formatDate = (ts: bigint) => {
    const ms = Number(ts) / 1_000_000;
    const d = new Date(ms);
    return `${d.getDate()}.${d.getMonth() + 1}.`;
  };

  const labelIndices = [
    0,
    Math.floor((last30.length - 1) / 2),
    last30.length - 1,
  ];

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: "oklch(0.09 0.018 264 / 0.7)",
        border: "1px solid oklch(0.76 0.15 180 / 0.12)",
      }}
    >
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}>
        <title>Gewichtsverlauf</title>
        <defs>
          <linearGradient id="weight-area-grad" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="oklch(0.76 0.15 180)"
              stopOpacity="0.25"
            />
            <stop
              offset="100%"
              stopColor="oklch(0.76 0.15 180)"
              stopOpacity="0.02"
            />
          </linearGradient>
          <filter id="line-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = PAD.top + t * chartH;
          const val = (maxW - t * range).toFixed(1);
          return (
            <g key={t}>
              <line
                x1={PAD.left}
                y1={y}
                x2={PAD.left + chartW}
                y2={y}
                stroke="oklch(0.76 0.15 180 / 0.07)"
                strokeWidth="1"
              />
              {(t === 0 || t === 1) && (
                <text
                  x={PAD.left - 6}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="oklch(0.45 0.01 220)"
                  fontFamily="'JetBrains Mono', monospace"
                >
                  {val}
                </text>
              )}
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaD} fill="url(#weight-area-grad)" />

        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="oklch(0.76 0.15 180)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          filter="url(#line-glow)"
        />

        {/* Data points */}
        {last30.map((e, i) => (
          <circle
            key={String(e.timestamp)}
            cx={toX(i)}
            cy={toY(e.weightKg)}
            r="3.5"
            fill="oklch(0.06 0.015 264)"
            stroke="oklch(0.76 0.15 180)"
            strokeWidth="1.5"
            data-ocid="profil.chart_point"
          />
        ))}

        {/* X-axis date labels */}
        {labelIndices.map((i) => (
          <text
            key={i}
            x={toX(i)}
            y={H - 6}
            textAnchor="middle"
            fontSize="9"
            fill="oklch(0.38 0.01 220)"
            fontFamily="'JetBrains Mono', monospace"
          >
            {formatDate(last30[i].timestamp)}
          </text>
        ))}
      </svg>
    </div>
  );
}

export function Profil({ onBack }: ProfilProps) {
  const { data: profile, isLoading: profileLoading } = useUserProfile();
  const { data: weightHistory = [], isLoading: weightLoading } =
    useWeightHistory();
  const saveProfile = useSaveUserProfile();
  const addWeight = useAddWeightEntry();

  const [nameInput, setNameInput] = useState("");
  const [weightInput, setWeightInput] = useState("");

  useEffect(() => {
    if (profile?.name) setNameInput(profile.name);
  }, [profile]);

  const latestWeight = useMemo(() => {
    if (weightHistory.length === 0) return null;
    return weightHistory[weightHistory.length - 1].weightKg;
  }, [weightHistory]);

  const proteinTarget = latestWeight ? (latestWeight * 1.8).toFixed(0) : null;

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    try {
      await saveProfile.mutateAsync({ name: nameInput.trim() });
      toast.success("Name gespeichert");
    } catch {
      toast.error("Fehler beim Speichern");
    }
  };

  const handleSaveWeight = async () => {
    const kg = Number.parseFloat(weightInput);
    if (Number.isNaN(kg) || kg <= 0 || kg > 500) {
      toast.error("Ungültiges Gewicht");
      return;
    }
    try {
      await addWeight.mutateAsync(kg);
      setWeightInput("");
      toast.success(`${kg} kg gespeichert`);
    } catch {
      toast.error("Fehler beim Speichern");
    }
  };

  const isLoading = profileLoading || weightLoading;

  return (
    <div
      className="relative min-h-screen"
      style={{ background: "oklch(0.06 0.015 264)" }}
    >
      {/* Background photo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 0 }}
      >
        <img
          src="/assets/uploads/IMG_8928-1.jpeg"
          alt=""
          className="w-full h-full object-cover object-center"
          style={{ opacity: 0.18 }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.9) 100%)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8 pb-16">
        {/* Back button */}
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 mb-8 text-sm transition-colors"
          style={{ color: "oklch(0.45 0.01 220)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color =
              "oklch(0.76 0.15 180)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color =
              "oklch(0.45 0.01 220)";
          }}
          data-ocid="profil.back.button"
        >
          <ArrowLeft size={16} />
          <span>Dashboard</span>
        </button>

        {/* Header */}
        <div className="mb-8">
          <p
            className="text-xs tracking-[0.45em] uppercase mono-data mb-2"
            style={{ color: "oklch(0.78 0.12 280 / 0.7)" }}
          >
            Longevity · Profil
          </p>
          <h1
            className="text-2xl font-light tracking-tight"
            style={{ color: "oklch(0.92 0.01 220)" }}
          >
            {profile?.name ? `Hallo, ${profile.name}` : "Mein Profil"}
          </h1>
        </div>

        {isLoading ? (
          <div
            className="flex justify-center py-12"
            data-ocid="profil.loading_state"
          >
            <Loader2
              size={24}
              className="animate-spin"
              style={{ color: "oklch(0.76 0.15 180)" }}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Name section */}
            <section
              className="rounded-2xl p-5"
              style={{
                background: "oklch(0.09 0.018 264 / 0.8)",
                border: "1px solid oklch(0.78 0.12 280 / 0.15)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <User size={14} style={{ color: "oklch(0.78 0.12 280)" }} />
                <h2
                  className="text-xs tracking-[0.3em] uppercase mono-data"
                  style={{ color: "oklch(0.78 0.12 280)" }}
                >
                  Name
                </h2>
              </div>
              <div className="flex gap-2">
                <Input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Dein Name"
                  className="flex-1 bg-transparent border-0 border-b rounded-none text-sm focus-visible:ring-0"
                  style={{
                    borderBottom: "1px solid oklch(0.78 0.12 280 / 0.25)",
                    color: "oklch(0.85 0.01 220)",
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                  data-ocid="profil.name.input"
                />
                <Button
                  size="sm"
                  onClick={handleSaveName}
                  disabled={saveProfile.isPending || !nameInput.trim()}
                  className="gap-1.5"
                  style={{
                    background: "oklch(0.78 0.12 280 / 0.15)",
                    border: "1px solid oklch(0.78 0.12 280 / 0.3)",
                    color: "oklch(0.78 0.12 280)",
                  }}
                  data-ocid="profil.name.save_button"
                >
                  {saveProfile.isPending ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Save size={12} />
                  )}
                  <span>Speichern</span>
                </Button>
              </div>
            </section>

            {/* Weight input section */}
            <section
              className="rounded-2xl p-5"
              style={{
                background: "oklch(0.09 0.018 264 / 0.8)",
                border: "1px solid oklch(0.76 0.15 180 / 0.15)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Weight size={14} style={{ color: "oklch(0.76 0.15 180)" }} />
                <h2
                  className="text-xs tracking-[0.3em] uppercase mono-data"
                  style={{ color: "oklch(0.76 0.15 180)" }}
                >
                  Körpergewicht
                </h2>
              </div>

              {latestWeight !== null && (
                <div className="flex gap-6 mb-5">
                  <div>
                    <Label
                      className="text-xs mono-data block mb-1"
                      style={{ color: "oklch(0.42 0.01 220)" }}
                    >
                      Aktuell
                    </Label>
                    <span
                      className="mono-data font-semibold text-xl"
                      style={{ color: "oklch(0.76 0.15 180)" }}
                    >
                      {latestWeight.toFixed(1)}
                      <span
                        className="text-sm font-normal ml-1"
                        style={{ color: "oklch(0.45 0.01 220)" }}
                      >
                        kg
                      </span>
                    </span>
                  </div>
                  {proteinTarget && (
                    <div>
                      <Label
                        className="text-xs mono-data block mb-1"
                        style={{ color: "oklch(0.42 0.01 220)" }}
                      >
                        Protein-Tagesziel
                      </Label>
                      <span
                        className="mono-data font-semibold text-xl"
                        style={{ color: "oklch(0.83 0.22 145)" }}
                      >
                        {proteinTarget}
                        <span
                          className="text-sm font-normal ml-1"
                          style={{ color: "oklch(0.45 0.01 220)" }}
                        >
                          g
                        </span>
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  type="number"
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  placeholder="z.B. 75.5"
                  min={20}
                  max={500}
                  step={0.1}
                  className="flex-1 bg-transparent border-0 border-b rounded-none text-sm focus-visible:ring-0 mono-data"
                  style={{
                    borderBottom: "1px solid oklch(0.76 0.15 180 / 0.25)",
                    color: "oklch(0.85 0.01 220)",
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveWeight()}
                  data-ocid="profil.weight.input"
                />
                <span
                  className="flex items-center text-sm mono-data"
                  style={{ color: "oklch(0.42 0.01 220)" }}
                >
                  kg
                </span>
                <Button
                  size="sm"
                  onClick={handleSaveWeight}
                  disabled={addWeight.isPending || !weightInput}
                  className="gap-1.5"
                  style={{
                    background: "oklch(0.76 0.15 180 / 0.15)",
                    border: "1px solid oklch(0.76 0.15 180 / 0.3)",
                    color: "oklch(0.76 0.15 180)",
                  }}
                  data-ocid="profil.weight.save_button"
                >
                  {addWeight.isPending ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Save size={12} />
                  )}
                  <span>Eintragen</span>
                </Button>
              </div>
            </section>

            {/* Weight history chart */}
            <section
              className="rounded-2xl p-5"
              style={{
                background: "oklch(0.09 0.018 264 / 0.8)",
                border: "1px solid oklch(0.76 0.15 180 / 0.1)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp
                    size={14}
                    style={{ color: "oklch(0.76 0.15 180)" }}
                  />
                  <h2
                    className="text-xs tracking-[0.3em] uppercase mono-data"
                    style={{ color: "oklch(0.76 0.15 180)" }}
                  >
                    Gewichtsverlauf
                  </h2>
                </div>
                {weightHistory.length > 0 && (
                  <span
                    className="text-xs mono-data"
                    style={{ color: "oklch(0.38 0.01 220)" }}
                  >
                    {weightHistory.length} Einträge
                  </span>
                )}
              </div>
              <WeightChart entries={weightHistory} />
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

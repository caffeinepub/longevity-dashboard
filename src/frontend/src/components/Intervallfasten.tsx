import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, Play, Square, Timer } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useStartFasting, useStopFasting } from "../hooks/useQueries";

const STORAGE_KEY = "longevity_fasting_session";
const RADIUS = 90;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const TICK_ANGLES = [0, 90, 180, 270];

interface FastingSession {
  sessionId: string;
  startTime: string;
  targetHours: number;
}

interface IntervallfastenProps {
  onBack: () => void;
}

export function Intervallfasten({ onBack }: IntervallfastenProps) {
  const [session, setSession] = useState<FastingSession | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [elapsed, setElapsed] = useState(0);
  const [targetHours, setTargetHours] = useState(16);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startFasting = useStartFasting();
  const stopFasting = useStopFasting();

  useEffect(() => {
    if (!session) {
      setElapsed(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    const tick = () => {
      const start = new Date(session.startTime).getTime();
      setElapsed(Math.floor((Date.now() - start) / 1000));
    };
    tick();
    intervalRef.current = setInterval(tick, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [session]);

  const handleStart = async () => {
    try {
      const id = await startFasting.mutateAsync(targetHours);
      const newSession: FastingSession = {
        sessionId: String(id),
        startTime: new Date().toISOString(),
        targetHours,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSession));
      setSession(newSession);
      toast.success(`Fasten gestartet — Ziel: ${targetHours}h`);
    } catch {
      toast.error("Fehler beim Starten");
    }
  };

  const handleStop = async () => {
    if (!session) return;
    try {
      await stopFasting.mutateAsync(BigInt(session.sessionId));
      localStorage.removeItem(STORAGE_KEY);
      setSession(null);
      toast.success("Fasten beendet — gut gemacht!");
    } catch {
      toast.error("Fehler beim Beenden");
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const targetSeconds = (session?.targetHours ?? targetHours) * 3600;
  const progress = Math.min(elapsed / targetSeconds, 1);
  const dashOffset = CIRCUMFERENCE - progress * CIRCUMFERENCE;
  const hoursElapsed = elapsed / 3600;
  const hoursRemaining = Math.max(
    (session?.targetHours ?? targetHours) - hoursElapsed,
    0,
  );

  return (
    <div className="max-w-xl mx-auto px-4 py-8 animate-fade-in-up">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs mb-6 transition-colors duration-200"
        style={{ color: "oklch(0.45 0.01 220)" }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color =
            "oklch(0.76 0.15 180)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color =
            "oklch(0.45 0.01 220)";
        }}
        data-ocid="fasting.back.button"
      >
        <ArrowLeft size={14} />
        <span>Dashboard</span>
      </button>

      <div className="mb-8">
        <p className="text-xs tracking-[0.4em] text-muted-foreground uppercase mono-data mb-1">
          Modul 05
        </p>
        <h2 className="text-2xl font-light text-foreground">Intervallfasten</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Timer und Fortschritt
        </p>
      </div>

      <div className="flex flex-col items-center mb-8">
        <div className="relative" style={{ width: 220, height: 220 }}>
          <svg
            width="220"
            height="220"
            viewBox="0 0 220 220"
            role="img"
            aria-label={`Fasten Fortschritt: ${Math.round(progress * 100)}%`}
          >
            <circle
              cx="110"
              cy="110"
              r={RADIUS}
              fill="none"
              stroke="oklch(0.76 0.15 180 / 0.08)"
              strokeWidth="8"
            />
            <circle
              cx="110"
              cy="110"
              r={RADIUS}
              fill="none"
              stroke={
                progress >= 1 ? "oklch(0.83 0.22 145)" : "oklch(0.76 0.15 180)"
              }
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              transform="rotate(-90 110 110)"
              style={{
                filter: `drop-shadow(0 0 10px ${progress >= 1 ? "oklch(0.83 0.22 145 / 0.8)" : "oklch(0.76 0.15 180 / 0.7)"})`,
                transition: "stroke-dashoffset 1s linear, stroke 0.5s ease",
              }}
            />
            {TICK_ANGLES.map((angle) => {
              const rad = (angle - 90) * (Math.PI / 180);
              const x1 = 110 + (RADIUS - 12) * Math.cos(rad);
              const y1 = 110 + (RADIUS - 12) * Math.sin(rad);
              const x2 = 110 + (RADIUS + 12) * Math.cos(rad);
              const y2 = 110 + (RADIUS + 12) * Math.sin(rad);
              return (
                <line
                  key={`tick-${angle}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="oklch(0.76 0.15 180 / 0.2)"
                  strokeWidth="1"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="mono-data text-4xl font-bold tracking-wider"
              style={{
                color: session
                  ? progress >= 1
                    ? "oklch(0.83 0.22 145)"
                    : "oklch(0.76 0.15 180)"
                  : "oklch(0.35 0.01 220)",
                textShadow: session
                  ? `0 0 20px ${progress >= 1 ? "oklch(0.83 0.22 145 / 0.6)" : "oklch(0.76 0.15 180 / 0.6)"}`
                  : "none",
              }}
            >
              {formatTime(elapsed)}
            </span>
            <span className="text-xs text-muted-foreground mt-1 tracking-widest">
              {session ? `von ${session.targetHours}h` : "Kein aktives Fasten"}
            </span>
            {session && (
              <span
                className="mono-data text-sm mt-2"
                style={{ color: "oklch(0.83 0.22 145)" }}
              >
                {Math.round(progress * 100)}%
              </span>
            )}
          </div>
        </div>

        {session && (
          <div className="flex gap-8 mt-2 text-center">
            <div>
              <div
                className="mono-data text-lg font-bold"
                style={{ color: "oklch(0.76 0.15 180)" }}
              >
                {hoursElapsed.toFixed(1)}h
              </div>
              <div className="text-xs text-muted-foreground">Gefastet</div>
            </div>
            <div>
              <div
                className="mono-data text-lg font-bold"
                style={{ color: "oklch(0.52 0.01 220)" }}
              >
                {hoursRemaining.toFixed(1)}h
              </div>
              <div className="text-xs text-muted-foreground">Verbleibend</div>
            </div>
          </div>
        )}
      </div>

      <div className="glass-card-strong rounded-2xl p-6 space-y-4">
        {!session && (
          <div className="space-y-2">
            <label
              className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"
              htmlFor="fasting-target-select"
            >
              <Timer size={12} /> Zieldauer
            </label>
            <Select
              value={String(targetHours)}
              onValueChange={(v) => setTargetHours(Number(v))}
            >
              <SelectTrigger
                id="fasting-target-select"
                className="bg-muted/40 border-border"
                data-ocid="fasting.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12 Stunden (12:12)</SelectItem>
                <SelectItem value="16">16 Stunden (16:8)</SelectItem>
                <SelectItem value="18">18 Stunden (18:6)</SelectItem>
                <SelectItem value="20">20 Stunden (20:4)</SelectItem>
                <SelectItem value="24">24 Stunden (OMAD)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {!session ? (
          <Button
            onClick={handleStart}
            disabled={startFasting.isPending}
            className="w-full font-medium tracking-wide text-base py-5"
            style={{
              background: "oklch(0.76 0.15 180)",
              color: "oklch(0.06 0.015 264)",
            }}
            data-ocid="fasting.primary_button"
          >
            {startFasting.isPending ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" /> Starte...
              </>
            ) : (
              <>
                <Play size={16} className="mr-2" fill="currentColor" /> Fasten
                starten
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={handleStop}
            disabled={stopFasting.isPending}
            variant="destructive"
            className="w-full font-medium tracking-wide text-base py-5"
            data-ocid="fasting.delete_button"
          >
            {stopFasting.isPending ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" /> Beende...
              </>
            ) : (
              <>
                <Square size={16} className="mr-2" fill="currentColor" /> Fasten
                beenden
              </>
            )}
          </Button>
        )}

        <div className="flex gap-2 flex-wrap pt-2">
          {["16:8", "18:6", "20:4", "OMAD"].map((protocol) => (
            <span
              key={protocol}
              className="px-3 py-1 rounded-full text-xs border"
              style={{
                borderColor: "oklch(0.18 0.025 200)",
                color: "oklch(0.45 0.01 220)",
              }}
            >
              {protocol}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

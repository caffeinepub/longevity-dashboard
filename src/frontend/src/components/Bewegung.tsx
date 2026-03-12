import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Activity, ArrowLeft, Clock, Loader2, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAddMovementEntry, useMovementEntries } from "../hooks/useQueries";

const ACTIVITY_PRESETS = [
  "Laufen",
  "Radfahren",
  "Krafttraining",
  "Yoga",
  "Schwimmen",
  "Wandern",
];

interface BewegungProps {
  onBack: () => void;
}

export function Bewegung({ onBack }: BewegungProps) {
  const { data: entries, isLoading } = useMovementEntries();
  const addEntry = useAddMovementEntry();

  const [form, setForm] = useState({
    activityType: "",
    durationMinutes: "",
    intensity: 3,
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.activityType || !form.durationMinutes) return;
    try {
      await addEntry.mutateAsync({
        activityType: form.activityType,
        durationMinutes: Number(form.durationMinutes),
        intensity: form.intensity,
        notes: form.notes,
      });
      setForm({
        activityType: "",
        durationMinutes: "",
        intensity: 3,
        notes: "",
      });
      toast.success("Bewegungseintrag gespeichert");
    } catch {
      toast.error("Fehler beim Speichern");
    }
  };

  const intensityColor = (v: number) => {
    const colors = [
      "",
      "oklch(0.76 0.15 180)",
      "oklch(0.78 0.18 160)",
      "oklch(0.80 0.20 150)",
      "oklch(0.82 0.21 147)",
      "oklch(0.83 0.22 145)",
    ];
    return colors[v] || colors[3];
  };

  const intensityLabels = [
    "",
    "Leicht",
    "Moderat",
    "Mittel",
    "Intensiv",
    "Maximal",
  ];

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
        data-ocid="movement.back.button"
      >
        <ArrowLeft size={14} />
        <span>Dashboard</span>
      </button>

      <div className="mb-8">
        <p className="text-xs tracking-[0.4em] text-muted-foreground uppercase mono-data mb-1">
          Modul 03
        </p>
        <h2 className="text-2xl font-light text-foreground">Bewegung</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Aktivitäten und Training erfassen
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {ACTIVITY_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => setForm((p) => ({ ...p, activityType: preset }))}
            className="px-3 py-1 rounded-full text-xs border transition-all duration-200"
            style={{
              borderColor:
                form.activityType === preset
                  ? "oklch(0.83 0.22 145 / 0.7)"
                  : "oklch(0.18 0.025 200)",
              color:
                form.activityType === preset
                  ? "oklch(0.83 0.22 145)"
                  : "oklch(0.52 0.01 220)",
              background:
                form.activityType === preset
                  ? "oklch(0.83 0.22 145 / 0.1)"
                  : "transparent",
            }}
          >
            {preset}
          </button>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="glass-card-strong rounded-2xl p-6 space-y-5 mb-8"
      >
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Activity size={12} /> Aktivitätstyp
          </Label>
          <Input
            type="text"
            placeholder="z.B. Laufen, Yoga..."
            value={form.activityType}
            onChange={(e) =>
              setForm((p) => ({ ...p, activityType: e.target.value }))
            }
            className="bg-muted/40 border-border longevity-input"
            data-ocid="movement.input"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Clock size={12} /> Dauer (Minuten)
          </Label>
          <Input
            type="number"
            placeholder="45"
            value={form.durationMinutes}
            onChange={(e) =>
              setForm((p) => ({ ...p, durationMinutes: e.target.value }))
            }
            className="bg-muted/40 border-border longevity-input mono-data"
            data-ocid="movement.duration.input"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Zap size={12} /> Intensität
            </Label>
            <span
              className="mono-data text-sm"
              style={{ color: intensityColor(form.intensity) }}
            >
              {form.intensity}/5 — {intensityLabels[form.intensity]}
            </span>
          </div>
          <Slider
            min={1}
            max={5}
            step={1}
            value={[form.intensity]}
            onValueChange={([v]) => setForm((p) => ({ ...p, intensity: v }))}
            className="w-full"
            data-ocid="movement.intensity.input"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            Notizen
          </Label>
          <Textarea
            placeholder="Strecke, Gewicht, Bemerkungen..."
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            className="bg-muted/40 border-border longevity-input resize-none"
            rows={2}
          />
        </div>

        <Button
          type="submit"
          disabled={
            addEntry.isPending || !form.activityType || !form.durationMinutes
          }
          className="w-full font-medium tracking-wide"
          style={{
            background: "oklch(0.83 0.22 145)",
            color: "oklch(0.06 0.015 264)",
          }}
          data-ocid="movement.submit_button"
        >
          {addEntry.isPending ? (
            <>
              <Loader2 size={14} className="mr-2 animate-spin" /> Speichern...
            </>
          ) : (
            "Eintrag speichern"
          )}
        </Button>
      </form>

      {isLoading ? (
        <div
          className="text-center text-muted-foreground text-sm"
          data-ocid="movement.loading_state"
        >
          Lade Einträge...
        </div>
      ) : entries && entries.length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mono-data">
            Heutige Aktivitäten
          </p>
          {entries.map((entry, idx) => (
            <div
              key={String(entry.id)}
              className="glass-card rounded-xl p-4"
              data-ocid={`movement.item.${idx + 1}`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">
                  {entry.activityType}
                </span>
                <span
                  className="mono-data text-xs"
                  style={{ color: intensityColor(Number(entry.intensity)) }}
                >
                  {String(entry.durationMinutes)} min
                </span>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs text-muted-foreground">
                  Intensität: {String(entry.intensity)}/5
                </span>
                {entry.notes && (
                  <span className="text-xs text-muted-foreground">
                    · {entry.notes}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="text-center py-8 text-muted-foreground text-sm"
          data-ocid="movement.empty_state"
        >
          Noch keine Aktivitäten heute
        </div>
      )}
    </div>
  );
}

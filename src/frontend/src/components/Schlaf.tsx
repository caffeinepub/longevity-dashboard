import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Moon, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAddSleepEntry, useSleepEntry } from "../hooks/useQueries";

const QUALITY_LABELS = [
  "",
  "Sehr schlecht",
  "Schlecht",
  "Mittel",
  "Gut",
  "Ausgezeichnet",
];
const QUALITY_COLORS = [
  "",
  "oklch(0.55 0.22 25)",
  "oklch(0.65 0.18 40)",
  "oklch(0.72 0.18 75)",
  "oklch(0.76 0.15 180)",
  "oklch(0.83 0.22 145)",
];

interface SchlafProps {
  onBack: () => void;
}

export function Schlaf({ onBack }: SchlafProps) {
  const { data: entry, isLoading } = useSleepEntry();
  const addEntry = useAddSleepEntry();

  const [duration, setDuration] = useState("");
  const [quality, setQuality] = useState(3);
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!duration) return;
    try {
      await addEntry.mutateAsync({
        durationHours: Number(duration),
        qualityRating: quality,
        notes,
      });
      setDuration("");
      setQuality(3);
      setNotes("");
      toast.success("Schlafeintrag gespeichert");
    } catch {
      toast.error("Fehler beim Speichern");
    }
  };

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
        data-ocid="sleep.back.button"
      >
        <ArrowLeft size={14} />
        <span>Dashboard</span>
      </button>

      <div className="mb-8">
        <p className="text-xs tracking-[0.4em] text-muted-foreground uppercase mono-data mb-1">
          Modul 02
        </p>
        <h2 className="text-2xl font-light text-foreground">Schlaf</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Schlafdauer und -qualität erfassen
        </p>
      </div>

      {!isLoading && entry && (
        <div
          className="glass-card rounded-2xl p-6 mb-6 border"
          style={{
            borderColor: "oklch(0.70 0.18 210 / 0.3)",
            boxShadow: "0 0 20px oklch(0.70 0.18 210 / 0.1)",
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <Moon size={20} style={{ color: "oklch(0.70 0.18 210)" }} />
            <span className="text-sm font-medium">Heutiger Schlaf</span>
          </div>
          <div className="flex items-end gap-2 mb-3">
            <span
              className="mono-data text-4xl font-bold"
              style={{
                color: "oklch(0.70 0.18 210)",
                textShadow: "0 0 16px oklch(0.70 0.18 210 / 0.6)",
              }}
            >
              {entry.durationHours.toFixed(1)}
            </span>
            <span className="text-muted-foreground mb-1">Stunden</span>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((q) => (
              <Star
                key={q}
                size={16}
                fill={
                  q <= Number(entry.qualityRating)
                    ? QUALITY_COLORS[Number(entry.qualityRating)]
                    : "none"
                }
                style={{
                  color:
                    q <= Number(entry.qualityRating)
                      ? QUALITY_COLORS[Number(entry.qualityRating)]
                      : "oklch(0.3 0.01 220)",
                }}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-1">
              {QUALITY_LABELS[Number(entry.qualityRating)]}
            </span>
          </div>
          {entry.notes && (
            <p className="text-sm text-muted-foreground mt-3">{entry.notes}</p>
          )}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="glass-card-strong rounded-2xl p-6 space-y-6"
      >
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Moon size={12} /> Schlafdauer (Stunden)
          </Label>
          <Input
            type="number"
            step="0.5"
            min="0"
            max="24"
            placeholder="7.5"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="bg-muted/40 border-border longevity-input mono-data"
            data-ocid="sleep.input"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Star size={12} /> Schlafqualität
            </Label>
            <span
              className="mono-data text-sm"
              style={{ color: QUALITY_COLORS[quality] }}
            >
              {quality}/5 — {QUALITY_LABELS[quality]}
            </span>
          </div>
          <Slider
            min={1}
            max={5}
            step={1}
            value={[quality]}
            onValueChange={([v]) => setQuality(v)}
            className="w-full"
            data-ocid="sleep.quality.input"
          />
          <div className="flex justify-between">
            {[1, 2, 3, 4, 5].map((q) => (
              <div
                key={q}
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  backgroundColor:
                    q <= quality
                      ? QUALITY_COLORS[quality]
                      : "oklch(0.25 0.01 220)",
                }}
              />
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            Notizen
          </Label>
          <Textarea
            placeholder="Träume, Besonderheiten..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-muted/40 border-border longevity-input resize-none"
            rows={3}
          />
        </div>

        <Button
          type="submit"
          disabled={addEntry.isPending || !duration}
          className="w-full font-medium tracking-wide"
          style={{
            background: "oklch(0.70 0.18 210)",
            color: "oklch(0.06 0.015 264)",
          }}
          data-ocid="sleep.submit_button"
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

      {isLoading && (
        <div
          className="text-center text-muted-foreground text-sm mt-4"
          data-ocid="sleep.loading_state"
        >
          Lade Daten...
        </div>
      )}
    </div>
  );
}

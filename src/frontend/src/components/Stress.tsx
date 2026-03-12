import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Brain, Loader2, Wind } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAddStressEntry, useStressEntry } from "../hooks/useQueries";

const TECHNIQUE_PRESETS = [
  "Meditation",
  "Atemübungen",
  "Spaziergang",
  "Journaling",
  "Yoga",
  "Kältebad",
];
const LEVEL_BARS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

function getLevelColor(v: number) {
  if (v <= 3) return "oklch(0.83 0.22 145)";
  if (v <= 5) return "oklch(0.76 0.15 180)";
  if (v <= 7) return "oklch(0.72 0.18 75)";
  return "oklch(0.55 0.22 25)";
}

function getLevelLabel(v: number) {
  if (v <= 2) return "Entspannt";
  if (v <= 4) return "Leicht";
  if (v <= 6) return "Moderat";
  if (v <= 8) return "Hoch";
  return "Extrem";
}

interface StressProps {
  onBack: () => void;
}

export function Stress({ onBack }: StressProps) {
  const { data: entry, isLoading } = useStressEntry();
  const addEntry = useAddStressEntry();

  const [level, setLevel] = useState(5);
  const [techniques, setTechniques] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addEntry.mutateAsync({ level, notes, techniques });
      setLevel(5);
      setTechniques("");
      setNotes("");
      toast.success("Stress-Eintrag gespeichert");
    } catch {
      toast.error("Fehler beim Speichern");
    }
  };

  const addTechnique = (t: string) => {
    const existing = techniques
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!existing.includes(t)) {
      setTechniques(existing.length ? `${techniques}, ${t}` : t);
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
        data-ocid="stress.back.button"
      >
        <ArrowLeft size={14} />
        <span>Dashboard</span>
      </button>

      <div className="mb-8">
        <p className="text-xs tracking-[0.4em] text-muted-foreground uppercase mono-data mb-1">
          Modul 04
        </p>
        <h2 className="text-2xl font-light text-foreground">Stress</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Stresslevel und Coping-Techniken
        </p>
      </div>

      {!isLoading && entry && (
        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Brain
              size={18}
              style={{ color: getLevelColor(Number(entry.level)) }}
            />
            <span className="text-sm font-medium">Heutiger Stresslevel</span>
          </div>
          <div className="flex items-end gap-2 mb-2">
            <span
              className="mono-data text-5xl font-bold"
              style={{
                color: getLevelColor(Number(entry.level)),
                textShadow: `0 0 20px ${getLevelColor(Number(entry.level)).replace(")", " / 0.5)")}`,
              }}
            >
              {String(entry.level)}
            </span>
            <span className="text-muted-foreground mb-2">
              /10 · {getLevelLabel(Number(entry.level))}
            </span>
          </div>
          {entry.techniques && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {entry.techniques
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
                .map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-full text-xs border"
                    style={{
                      borderColor: "oklch(0.76 0.15 180 / 0.3)",
                      color: "oklch(0.76 0.15 180)",
                    }}
                  >
                    {t}
                  </span>
                ))}
            </div>
          )}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="glass-card-strong rounded-2xl p-6 space-y-6"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Brain size={12} /> Stresslevel
            </Label>
            <span
              className="mono-data text-lg font-bold"
              style={{ color: getLevelColor(level) }}
            >
              {level}/10
            </span>
          </div>
          <div className="flex gap-1">
            {LEVEL_BARS.map((bar) => (
              <div
                key={bar}
                className="h-6 flex-1 rounded-sm transition-all duration-200"
                style={{
                  backgroundColor:
                    bar <= level
                      ? getLevelColor(level)
                      : "oklch(0.15 0.01 220)",
                  boxShadow:
                    bar <= level
                      ? `0 0 6px ${getLevelColor(level).replace(")", " / 0.4)")}`
                      : "none",
                }}
              />
            ))}
          </div>
          <Slider
            min={1}
            max={10}
            step={1}
            value={[level]}
            onValueChange={([v]) => setLevel(v)}
            className="w-full"
            data-ocid="stress.level.input"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Entspannt</span>
            <span
              className="font-medium"
              style={{ color: getLevelColor(level) }}
            >
              {getLevelLabel(level)}
            </span>
            <span>Extrem</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Wind size={12} /> Techniken
          </Label>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {TECHNIQUE_PRESETS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => addTechnique(t)}
                className="px-3 py-1 rounded-full text-xs border transition-all duration-200"
                style={{
                  borderColor: techniques.includes(t)
                    ? "oklch(0.76 0.15 180 / 0.7)"
                    : "oklch(0.18 0.025 200)",
                  color: techniques.includes(t)
                    ? "oklch(0.76 0.15 180)"
                    : "oklch(0.52 0.01 220)",
                  background: techniques.includes(t)
                    ? "oklch(0.76 0.15 180 / 0.1)"
                    : "transparent",
                }}
              >
                {t}
              </button>
            ))}
          </div>
          <Input
            type="text"
            placeholder="Meditation, Atemübungen..."
            value={techniques}
            onChange={(e) => setTechniques(e.target.value)}
            className="bg-muted/40 border-border longevity-input"
            data-ocid="stress.input"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            Notizen
          </Label>
          <Textarea
            placeholder="Was hat Stress verursacht? Was hat geholfen?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-muted/40 border-border longevity-input resize-none"
            rows={3}
          />
        </div>

        <Button
          type="submit"
          disabled={addEntry.isPending}
          className="w-full font-medium tracking-wide"
          style={{
            background: getLevelColor(level),
            color: "oklch(0.06 0.015 264)",
          }}
          data-ocid="stress.submit_button"
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
          data-ocid="stress.loading_state"
        >
          Lade Daten...
        </div>
      )}
    </div>
  );
}

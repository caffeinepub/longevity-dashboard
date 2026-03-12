import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Beef, Droplets, Flame, Loader2, Wheat } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAddNutritionEntry, useNutritionEntries } from "../hooks/useQueries";

interface ErnaehrungProps {
  onBack: () => void;
}

export function Ernaehrung({ onBack }: ErnaehrungProps) {
  const { data: entries, isLoading } = useNutritionEntries();
  const addEntry = useAddNutritionEntry();

  const [form, setForm] = useState({
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.calories) return;
    try {
      await addEntry.mutateAsync({
        calories: Number(form.calories),
        protein: Number(form.protein),
        carbs: Number(form.carbs),
        fat: Number(form.fat),
        notes: form.notes,
      });
      setForm({ calories: "", protein: "", carbs: "", fat: "", notes: "" });
      toast.success("Ernährungseintrag gespeichert");
    } catch {
      toast.error("Fehler beim Speichern");
    }
  };

  const totalCalories =
    entries?.reduce((s, e) => s + Number(e.calories), 0) ?? 0;
  const totalProtein = entries?.reduce((s, e) => s + Number(e.protein), 0) ?? 0;

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
        data-ocid="nutrition.back.button"
      >
        <ArrowLeft size={14} />
        <span>Dashboard</span>
      </button>

      <div className="mb-8">
        <p className="text-xs tracking-[0.4em] text-muted-foreground uppercase mono-data mb-1">
          Modul 01
        </p>
        <h2 className="text-2xl font-light text-foreground">Ernährung</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Tägliche Nährstoffzufuhr tracken
        </p>
      </div>

      {entries && entries.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Flame size={14} style={{ color: "oklch(0.76 0.15 180)" }} />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Kalorien
              </span>
            </div>
            <span
              className="mono-data text-2xl font-semibold glow-text"
              style={{ color: "oklch(0.76 0.15 180)" }}
            >
              {totalCalories}
            </span>
            <span className="text-xs text-muted-foreground ml-1">kcal</span>
          </div>
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Beef size={14} style={{ color: "oklch(0.83 0.22 145)" }} />
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                Protein
              </span>
            </div>
            <span
              className="mono-data text-2xl font-semibold glow-text-green"
              style={{ color: "oklch(0.83 0.22 145)" }}
            >
              {totalProtein}
            </span>
            <span className="text-xs text-muted-foreground ml-1">g</span>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="glass-card-strong rounded-2xl p-6 space-y-5 mb-8"
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Flame size={12} /> Kalorien
            </Label>
            <Input
              type="number"
              placeholder="2000"
              value={form.calories}
              onChange={(e) =>
                setForm((p) => ({ ...p, calories: e.target.value }))
              }
              className="bg-muted/40 border-border longevity-input mono-data"
              data-ocid="nutrition.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Beef size={12} /> Protein (g)
            </Label>
            <Input
              type="number"
              placeholder="150"
              value={form.protein}
              onChange={(e) =>
                setForm((p) => ({ ...p, protein: e.target.value }))
              }
              className="bg-muted/40 border-border longevity-input mono-data"
              data-ocid="nutrition.protein.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Wheat size={12} /> Kohlenhydrate (g)
            </Label>
            <Input
              type="number"
              placeholder="200"
              value={form.carbs}
              onChange={(e) =>
                setForm((p) => ({ ...p, carbs: e.target.value }))
              }
              className="bg-muted/40 border-border longevity-input mono-data"
              data-ocid="nutrition.carbs.input"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Droplets size={12} /> Fett (g)
            </Label>
            <Input
              type="number"
              placeholder="70"
              value={form.fat}
              onChange={(e) => setForm((p) => ({ ...p, fat: e.target.value }))}
              className="bg-muted/40 border-border longevity-input mono-data"
              data-ocid="nutrition.fat.input"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            Notizen
          </Label>
          <Textarea
            placeholder="Mahlzeiten, Bemerkungen..."
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            className="bg-muted/40 border-border longevity-input resize-none"
            rows={3}
          />
        </div>
        <Button
          type="submit"
          disabled={addEntry.isPending || !form.calories}
          className="w-full font-medium tracking-wide"
          style={{
            background: "oklch(0.76 0.15 180)",
            color: "oklch(0.06 0.015 264)",
          }}
          data-ocid="nutrition.submit_button"
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
          data-ocid="nutrition.loading_state"
        >
          Lade Einträge...
        </div>
      ) : entries && entries.length > 0 ? (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mono-data">
            Heutige Einträge
          </p>
          {entries.map((entry, idx) => (
            <div
              key={String(entry.id)}
              className="glass-card rounded-xl p-4"
              data-ocid={`nutrition.item.${idx + 1}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className="mono-data text-sm"
                  style={{ color: "oklch(0.76 0.15 180)" }}
                >
                  {String(entry.calories)} kcal
                </span>
                <span className="text-xs text-muted-foreground mono-data">
                  {new Date(
                    Number(entry.timestamp) / 1_000_000,
                  ).toLocaleTimeString("de-DE", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>
                  P:{" "}
                  <span className="text-foreground">
                    {String(entry.protein)}g
                  </span>
                </span>
                <span>
                  K:{" "}
                  <span className="text-foreground">
                    {String(entry.carbs)}g
                  </span>
                </span>
                <span>
                  F:{" "}
                  <span className="text-foreground">{String(entry.fat)}g</span>
                </span>
              </div>
              {entry.notes && (
                <p className="text-xs text-muted-foreground mt-2">
                  {entry.notes}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div
          className="text-center py-8 text-muted-foreground text-sm"
          data-ocid="nutrition.empty_state"
        >
          Noch keine Einträge heute
        </div>
      )}
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Clock, Loader2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useAddRoutine,
  useRoutineLogs,
  useToggleRoutine,
} from "../hooks/useQueries";

const ROUTINES_STORAGE_KEY = "longevity_routines";

const SAMPLE_ROUTINES: { name: string; scheduledTime: string }[] = [
  { name: "Morgenmeditation", scheduledTime: "07:00" },
  { name: "Kalte Dusche", scheduledTime: "07:30" },
  { name: "Vitamine & Supplemente", scheduledTime: "08:00" },
  { name: "Abend-Journaling", scheduledTime: "21:00" },
  { name: "Screen-free Zeit", scheduledTime: "22:00" },
];

interface LocalRoutine {
  id: string;
  name: string;
  scheduledTime: string;
}

interface RoutinenProps {
  onBack: () => void;
}

export function Routinen({ onBack }: RoutinenProps) {
  const { data: logs, isLoading } = useRoutineLogs();
  const addRoutine = useAddRoutine();
  const toggleRoutine = useToggleRoutine();

  const [localRoutines, setLocalRoutines] = useState<LocalRoutine[]>(() => {
    try {
      const stored = localStorage.getItem(ROUTINES_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTime, setNewTime] = useState("08:00");
  const [seeded, setSeeded] = useState(
    () => !!localStorage.getItem(ROUTINES_STORAGE_KEY),
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: seeded is the only meaningful dep; addRoutine is stable from react-query
  useEffect(() => {
    if (seeded) return;
    const seedRoutines = async () => {
      const added: LocalRoutine[] = [];
      for (const r of SAMPLE_ROUTINES) {
        try {
          const id = await addRoutine.mutateAsync(r);
          added.push({
            id: String(id),
            name: r.name,
            scheduledTime: r.scheduledTime,
          });
        } catch {
          // ignore
        }
      }
      if (added.length > 0) {
        localStorage.setItem(ROUTINES_STORAGE_KEY, JSON.stringify(added));
        setLocalRoutines(added);
      }
      setSeeded(true);
    };
    seedRoutines();
  }, [seeded]);

  const handleAddRoutine = async () => {
    if (!newName || !newTime) return;
    try {
      const id = await addRoutine.mutateAsync({
        name: newName,
        scheduledTime: newTime,
      });
      const newRoutine: LocalRoutine = {
        id: String(id),
        name: newName,
        scheduledTime: newTime,
      };
      const updated = [...localRoutines, newRoutine];
      localStorage.setItem(ROUTINES_STORAGE_KEY, JSON.stringify(updated));
      setLocalRoutines(updated);
      setNewName("");
      setNewTime("08:00");
      setDialogOpen(false);
      toast.success(`Routine "${newName}" hinzugefügt`);
    } catch {
      toast.error("Fehler beim Hinzufügen");
    }
  };

  const handleToggle = async (routineId: bigint) => {
    const today = new Date().toISOString().split("T")[0];
    try {
      await toggleRoutine.mutateAsync({ routineId, date: today });
    } catch {
      toast.error("Fehler beim Aktualisieren");
    }
  };

  const sortedRoutines = [...localRoutines].sort((a, b) =>
    a.scheduledTime.localeCompare(b.scheduledTime),
  );

  const getCompletionStatus = (routineId: string) => {
    if (!logs) return false;
    const log = logs.find((l) => String(l.routineId) === routineId);
    return log?.completed ?? false;
  };

  const completedCount = localRoutines.filter((r) =>
    getCompletionStatus(r.id),
  ).length;

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
        data-ocid="routines.back.button"
      >
        <ArrowLeft size={14} />
        <span>Dashboard</span>
      </button>

      <div className="mb-8 flex items-start justify-between">
        <div>
          <p className="text-xs tracking-[0.4em] text-muted-foreground uppercase mono-data mb-1">
            Modul 06
          </p>
          <h2 className="text-2xl font-light text-foreground">Routinen</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {completedCount}/{localRoutines.length} erledigt
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="flex items-center gap-1.5"
              style={{
                background: "oklch(0.76 0.15 180)",
                color: "oklch(0.06 0.015 264)",
              }}
              data-ocid="routines.open_modal_button"
            >
              <Plus size={14} /> Hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent
            className="glass-card-strong border-border"
            data-ocid="routines.dialog"
          >
            <DialogHeader>
              <DialogTitle className="text-foreground">
                Neue Routine
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Name
                </Label>
                <Input
                  placeholder="z.B. Morgenmeditation"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="bg-muted/40 border-border longevity-input"
                  data-ocid="routines.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Clock size={12} /> Uhrzeit
                </Label>
                <Input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="bg-muted/40 border-border longevity-input mono-data"
                  data-ocid="routines.time.input"
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="border-border"
                data-ocid="routines.cancel_button"
              >
                Abbrechen
              </Button>
              <Button
                type="button"
                onClick={handleAddRoutine}
                disabled={addRoutine.isPending || !newName}
                style={{
                  background: "oklch(0.76 0.15 180)",
                  color: "oklch(0.06 0.015 264)",
                }}
                data-ocid="routines.save_button"
              >
                {addRoutine.isPending ? (
                  <>
                    <Loader2 size={14} className="mr-2 animate-spin" />{" "}
                    Speichern...
                  </>
                ) : (
                  "Speichern"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {localRoutines.length > 0 && (
        <div className="mb-6">
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: "oklch(0.15 0.01 220)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(completedCount / localRoutines.length) * 100}%`,
                background:
                  "linear-gradient(90deg, oklch(0.76 0.15 180), oklch(0.83 0.22 145))",
                boxShadow: "0 0 8px oklch(0.76 0.15 180 / 0.5)",
              }}
            />
          </div>
        </div>
      )}

      {isLoading ? (
        <div
          className="text-center text-muted-foreground py-8"
          data-ocid="routines.loading_state"
        >
          Lade Routinen...
        </div>
      ) : sortedRoutines.length === 0 ? (
        <div
          className="text-center py-12 text-muted-foreground"
          data-ocid="routines.empty_state"
        >
          <div className="text-4xl mb-3">✅</div>
          <p className="text-sm">Noch keine Routinen</p>
          <p className="text-xs mt-1">Klicke auf "Hinzufügen" um zu beginnen</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sortedRoutines.map((routine, idx) => {
            const isCompleted = getCompletionStatus(routine.id);
            return (
              <div
                key={routine.id}
                className="glass-card rounded-xl px-4 py-3.5 flex items-center gap-3 transition-all duration-300"
                style={
                  isCompleted
                    ? {
                        borderColor: "oklch(0.83 0.22 145 / 0.35)",
                        background: "oklch(0.83 0.22 145 / 0.05)",
                      }
                    : {}
                }
                data-ocid={`routines.item.${idx + 1}`}
              >
                <Checkbox
                  checked={isCompleted}
                  onCheckedChange={() => handleToggle(BigInt(routine.id))}
                  className="border-border"
                  style={{
                    borderColor: isCompleted
                      ? "oklch(0.83 0.22 145)"
                      : undefined,
                  }}
                  data-ocid={`routines.checkbox.${idx + 1}`}
                />
                <div className="flex-1 min-w-0">
                  <span
                    className={`text-sm transition-all duration-300 ${isCompleted ? "line-through" : ""}`}
                    style={{
                      color: isCompleted
                        ? "oklch(0.45 0.01 220)"
                        : "oklch(0.85 0.01 220)",
                    }}
                  >
                    {routine.name}
                  </span>
                </div>
                <span
                  className="mono-data text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{
                    background: isCompleted
                      ? "oklch(0.83 0.22 145 / 0.15)"
                      : "oklch(0.13 0.018 264)",
                    color: isCompleted
                      ? "oklch(0.83 0.22 145)"
                      : "oklch(0.52 0.01 220)",
                    border: `1px solid ${isCompleted ? "oklch(0.83 0.22 145 / 0.3)" : "oklch(0.18 0.025 200)"}`,
                  }}
                >
                  {routine.scheduledTime}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

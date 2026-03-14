import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  DailySummary,
  MovementEntry,
  NutritionEntry,
  RoutineLog,
  SleepEntry,
  StressEntry,
  UserProfile,
  WeightEntry,
} from "../backend.d";
import { useActor } from "./useActor";

export function useDailySummary() {
  const { actor, isFetching } = useActor();
  return useQuery<DailySummary>({
    queryKey: ["daily-summary"],
    queryFn: async () => {
      if (!actor)
        return {
          movement: false,
          stress: false,
          routines: false,
          sleep: false,
          fasting: false,
          nutrition: false,
        };
      return actor.getTodaySummary();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

export function useDailyScore() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["daily-score"],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getDailyScore();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

export function useNutritionEntries() {
  const { actor, isFetching } = useActor();
  return useQuery<NutritionEntry[]>({
    queryKey: ["nutrition-entries"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTodaysNutritionEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddNutritionEntry() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      notes: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addNutritionEntry(
        BigInt(p.calories),
        BigInt(p.protein),
        BigInt(p.carbs),
        BigInt(p.fat),
        p.notes,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["nutrition-entries"] });
      qc.invalidateQueries({ queryKey: ["daily-summary"] });
      qc.invalidateQueries({ queryKey: ["daily-score"] });
    },
  });
}

export function useSleepEntry() {
  const { actor, isFetching } = useActor();
  return useQuery<SleepEntry | null>({
    queryKey: ["sleep-entry"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getTodaysSleepEntry();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddSleepEntry() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: {
      durationHours: number;
      qualityRating: number;
      notes: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addSleepEntry(
        p.durationHours,
        BigInt(p.qualityRating),
        p.notes,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sleep-entry"] });
      qc.invalidateQueries({ queryKey: ["daily-summary"] });
      qc.invalidateQueries({ queryKey: ["daily-score"] });
    },
  });
}

export function useMovementEntries() {
  const { actor, isFetching } = useActor();
  return useQuery<MovementEntry[]>({
    queryKey: ["movement-entries"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTodaysMovementEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddMovementEntry() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: {
      activityType: string;
      durationMinutes: number;
      intensity: number;
      notes: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addMovementEntry(
        p.activityType,
        BigInt(p.durationMinutes),
        BigInt(p.intensity),
        p.notes,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["movement-entries"] });
      qc.invalidateQueries({ queryKey: ["daily-summary"] });
      qc.invalidateQueries({ queryKey: ["daily-score"] });
    },
  });
}

export function useStressEntry() {
  const { actor, isFetching } = useActor();
  return useQuery<StressEntry | null>({
    queryKey: ["stress-entry"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getTodaysStressEntry();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddStressEntry() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { level: number; notes: string; techniques: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addStressEntry(BigInt(p.level), p.notes, p.techniques);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["stress-entry"] });
      qc.invalidateQueries({ queryKey: ["daily-summary"] });
      qc.invalidateQueries({ queryKey: ["daily-score"] });
    },
  });
}

export function useRoutineLogs() {
  const { actor, isFetching } = useActor();
  return useQuery<RoutineLog[]>({
    queryKey: ["routine-logs"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTodayRoutineLogs();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddRoutine() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { name: string; scheduledTime: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addRoutine(p.name, p.scheduledTime);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["routine-logs"] });
    },
  });
}

export function useToggleRoutine() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { routineId: bigint; date: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.toggleRoutineCompletion(p.routineId, p.date);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["routine-logs"] });
      qc.invalidateQueries({ queryKey: ["daily-summary"] });
      qc.invalidateQueries({ queryKey: ["daily-score"] });
    },
  });
}

export function useStartFasting() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (targetHours: number) => {
      if (!actor) throw new Error("Not connected");
      return actor.startFasting(BigInt(targetHours));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["daily-summary"] });
      qc.invalidateQueries({ queryKey: ["daily-score"] });
    },
  });
}

export function useStopFasting() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.stopFasting(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["daily-summary"] });
      qc.invalidateQueries({ queryKey: ["daily-score"] });
    },
  });
}

export function useWeightHistory() {
  const { actor, isFetching } = useActor();
  return useQuery<WeightEntry[]>({
    queryKey: ["weight-history"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getWeightHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddWeightEntry() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (weightKg: number) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).addWeightEntry(weightKg);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["weight-history"] });
    },
  });
}

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["user-profile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-profile"] });
    },
  });
}

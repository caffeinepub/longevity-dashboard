import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface SleepEntry {
    id: bigint;
    durationHours: number;
    notes: string;
    timestamp: bigint;
    qualityRating: bigint;
}
export interface MovementEntry {
    id: bigint;
    activityType: string;
    durationMinutes: bigint;
    notes: string;
    timestamp: bigint;
    intensity: bigint;
}
export interface NutritionEntry {
    id: bigint;
    fat: bigint;
    carbs: bigint;
    calories: bigint;
    notes: string;
    timestamp: bigint;
    protein: bigint;
}
export interface RoutineLog {
    date: string;
    completed: boolean;
    routineId: bigint;
}
export interface StressEntry {
    id: bigint;
    techniques: string;
    level: bigint;
    notes: string;
    timestamp: bigint;
}
export interface UserProfile {
    name: string;
}
export interface WeightEntry {
    id: bigint;
    weightKg: number;
    timestamp: bigint;
}
export interface DailySummary {
    movement: boolean;
    stress: boolean;
    routines: boolean;
    sleep: boolean;
    fasting: boolean;
    nutrition: boolean;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addMovementEntry(activityType: string, durationMinutes: bigint, intensity: bigint, notes: string): Promise<bigint>;
    addNutritionEntry(calories: bigint, protein: bigint, carbs: bigint, fat: bigint, notes: string): Promise<bigint>;
    addRoutine(name: string, scheduledTime: string): Promise<bigint>;
    addSleepEntry(durationHours: number, qualityRating: bigint, notes: string): Promise<bigint>;
    addStressEntry(level: bigint, notes: string, techniques: string): Promise<bigint>;
    addWeightEntry(weightKg: number): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDailyScore(): Promise<bigint>;
    getTodayRoutineLogs(): Promise<Array<RoutineLog>>;
    getTodaySummary(): Promise<DailySummary>;
    getTodaysMovementEntries(): Promise<Array<MovementEntry>>;
    getTodaysNutritionEntries(): Promise<Array<NutritionEntry>>;
    getTodaysSleepEntry(): Promise<SleepEntry | null>;
    getTodaysStressEntry(): Promise<StressEntry | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWeightHistory(): Promise<Array<WeightEntry>>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    startFasting(targetHours: bigint): Promise<bigint>;
    stopFasting(id: bigint): Promise<void>;
    toggleRoutineCompletion(routineId: bigint, date: string): Promise<void>;
}

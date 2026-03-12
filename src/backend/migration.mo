import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Array "mo:core/Array";

module {
  type NutritionEntry = {
    id : Nat;
    calories : Nat;
    protein : Nat;
    carbs : Nat;
    fat : Nat;
    notes : Text;
    timestamp : Int;
  };

  type SleepEntry = {
    id : Nat;
    durationHours : Float;
    qualityRating : Nat;
    notes : Text;
    timestamp : Int;
  };

  type MovementEntry = {
    id : Nat;
    activityType : Text;
    durationMinutes : Nat;
    intensity : Nat;
    notes : Text;
    timestamp : Int;
  };

  type StressEntry = {
    id : Nat;
    level : Nat;
    notes : Text;
    techniques : Text;
    timestamp : Int;
  };

  type FastingSession = {
    id : Nat;
    startTime : Int;
    endTime : ?Int;
    targetHours : Nat;
    isActive : Bool;
  };

  type Routine = {
    id : Nat;
    name : Text;
    scheduledTime : Text;
    isActive : Bool;
  };

  type RoutineLog = {
    routineId : Nat;
    date : Text;
    completed : Bool;
  };

  type OldActor = {
    nutritionEntries : Map.Map<Nat, NutritionEntry>;
    sleepEntries : Map.Map<Nat, SleepEntry>;
    movementEntries : Map.Map<Nat, MovementEntry>;
    stressEntries : Map.Map<Nat, StressEntry>;
    fastingSessions : Map.Map<Nat, FastingSession>;
    routines : Map.Map<Nat, Routine>;
    routineLogs : Map.Map<Nat, RoutineLog>;
    nutritionIdCounter : Nat;
    sleepIdCounter : Nat;
    movementIdCounter : Nat;
    stressIdCounter : Nat;
    fastingIdCounter : Nat;
    routineIdCounter : Nat;
  };

  type NewActor = {
    nutritionEntries : Map.Map<Principal, Map.Map<Nat, NutritionEntry>>;
    sleepEntries : Map.Map<Principal, Map.Map<Nat, SleepEntry>>;
    movementEntries : Map.Map<Principal, Map.Map<Nat, MovementEntry>>;
    stressEntries : Map.Map<Principal, Map.Map<Nat, StressEntry>>;
    fastingSessions : Map.Map<Principal, Map.Map<Nat, FastingSession>>;
    routines : Map.Map<Principal, Map.Map<Nat, Routine>>;
    routineLogs : Map.Map<Principal, Map.Map<Nat, RoutineLog>>;
    nutritionIdCounters : Map.Map<Principal, Nat>;
    sleepIdCounters : Map.Map<Principal, Nat>;
    movementIdCounters : Map.Map<Principal, Nat>;
    stressIdCounters : Map.Map<Principal, Nat>;
    fastingIdCounters : Map.Map<Principal, Nat>;
    routineIdCounters : Map.Map<Principal, Nat>;
  };

  public func run(old : OldActor) : NewActor {
    let emptyNutritionEntries = Map.empty<Principal, Map.Map<Nat, NutritionEntry>>();
    let emptySleepEntries = Map.empty<Principal, Map.Map<Nat, SleepEntry>>();
    let emptyMovementEntries = Map.empty<Principal, Map.Map<Nat, MovementEntry>>();
    let emptyStressEntries = Map.empty<Principal, Map.Map<Nat, StressEntry>>();
    let emptyFastingEntries = Map.empty<Principal, Map.Map<Nat, FastingSession>>();
    let emptyRoutinesEntries = Map.empty<Principal, Map.Map<Nat, Routine>>();
    let emptyRoutineLogsEntries = Map.empty<Principal, Map.Map<Nat, RoutineLog>>();

    let emptyNutritionIdCounters = Map.empty<Principal, Nat>();
    let emptySleepIdCounters = Map.empty<Principal, Nat>();
    let emptyMovementIdCounters = Map.empty<Principal, Nat>();
    let emptyStressIdCounters = Map.empty<Principal, Nat>();
    let emptyFastingIdCounters = Map.empty<Principal, Nat>();
    let emptyRoutineIdCounters = Map.empty<Principal, Nat>();

    {
      nutritionEntries = emptyNutritionEntries;
      sleepEntries = emptySleepEntries;
      movementEntries = emptyMovementEntries;
      stressEntries = emptyStressEntries;
      fastingSessions = emptyFastingEntries;
      routines = emptyRoutinesEntries;
      routineLogs = emptyRoutineLogsEntries;
      nutritionIdCounters = emptyNutritionIdCounters;
      sleepIdCounters = emptySleepIdCounters;
      movementIdCounters = emptyMovementIdCounters;
      stressIdCounters = emptyStressIdCounters;
      fastingIdCounters = emptyFastingIdCounters;
      routineIdCounters = emptyRoutineIdCounters;
    };
  };
};

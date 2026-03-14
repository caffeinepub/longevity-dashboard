import Time "mo:core/Time";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Bool "mo:core/Bool";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";


actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Weight Entry Types and Storage
  type WeightEntry = {
    id : Nat;
    weightKg : Float;
    timestamp : Int;
  };

  module WeightEntry {
    public func compare(a : WeightEntry, b : WeightEntry) : Order.Order {
      Int.compare(a.timestamp, b.timestamp);
    };
  };

  let weightEntries = Map.empty<Principal, Map.Map<Nat, WeightEntry>>();
  let weightIdCounters = Map.empty<Principal, Nat>();

  public shared ({ caller }) func addWeightEntry(weightKg : Float) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add weight entries");
    };
    let id = getAndIncrementCounter(weightIdCounters, caller);
    let entry : WeightEntry = {
      id;
      weightKg;
      timestamp = Time.now();
    };
    let userEntries = switch (weightEntries.get(caller)) {
      case (null) {
        let newMap = Map.empty<Nat, WeightEntry>();
        newMap.add(id, entry);
        newMap;
      };
      case (?entries) {
        entries.add(id, entry);
        entries;
      };
    };
    weightEntries.add(caller, userEntries);
    id;
  };

  public query ({ caller }) func getWeightHistory() : async [WeightEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view weight history");
    };
    let userEntries = switch (weightEntries.get(caller)) {
      case (null) { return [] };
      case (?entries) { entries };
    };
    userEntries.values().toArray().sort();
  };

  // Nutrition Types and Storage
  type NutritionEntry = {
    id : Nat;
    calories : Nat;
    protein : Nat;
    carbs : Nat;
    fat : Nat;
    notes : Text;
    timestamp : Int;
  };

  // Sleep Types and Storage
  type SleepEntry = {
    id : Nat;
    durationHours : Float;
    qualityRating : Nat;
    notes : Text;
    timestamp : Int;
  };

  // Movement Types and Storage
  type MovementEntry = {
    id : Nat;
    activityType : Text;
    durationMinutes : Nat;
    intensity : Nat;
    notes : Text;
    timestamp : Int;
  };

  // Stress Types and Storage
  type StressEntry = {
    id : Nat;
    level : Nat;
    notes : Text;
    techniques : Text;
    timestamp : Int;
  };

  // Fasting Types and Storage
  type FastingSession = {
    id : Nat;
    startTime : Int;
    endTime : ?Int;
    targetHours : Nat;
    isActive : Bool;
  };

  // Routine Types and Storage
  type Routine = {
    id : Nat;
    name : Text;
    scheduledTime : Text;
    isActive : Bool;
  };

  // Routine Log Types and Storage
  type RoutineLog = {
    routineId : Nat;
    date : Text;
    completed : Bool;
  };

  // Daily Summary Type
  type DailySummary = {
    nutrition : Bool;
    sleep : Bool;
    movement : Bool;
    stress : Bool;
    fasting : Bool;
    routines : Bool;
  };

  module NutritionEntry {
    public func compare(a : NutritionEntry, b : NutritionEntry) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module SleepEntry {
    public func compare(a : SleepEntry, b : SleepEntry) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module MovementEntry {
    public func compare(a : MovementEntry, b : MovementEntry) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module StressEntry {
    public func compare(a : StressEntry, b : StressEntry) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module FastingSession {
    public func compare(a : FastingSession, b : FastingSession) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module Routine {
    public func compare(a : Routine, b : Routine) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  module RoutineLog {
    public func compare(a : RoutineLog, b : RoutineLog) : Order.Order {
      Nat.compare(a.routineId, b.routineId);
    };
  };

  // Persistent Storage
  let nutritionEntries = Map.empty<Principal, Map.Map<Nat, NutritionEntry>>();
  let sleepEntries = Map.empty<Principal, Map.Map<Nat, SleepEntry>>();
  let movementEntries = Map.empty<Principal, Map.Map<Nat, MovementEntry>>();
  let stressEntries = Map.empty<Principal, Map.Map<Nat, StressEntry>>();
  let fastingSessions = Map.empty<Principal, Map.Map<Nat, FastingSession>>();
  let routines = Map.empty<Principal, Map.Map<Nat, Routine>>();
  let routineLogs = Map.empty<Principal, Map.Map<Nat, RoutineLog>>();

  // ID Counters per Principal
  let nutritionIdCounters = Map.empty<Principal, Nat>();
  let sleepIdCounters = Map.empty<Principal, Nat>();
  let movementIdCounters = Map.empty<Principal, Nat>();
  let stressIdCounters = Map.empty<Principal, Nat>();
  let fastingIdCounters = Map.empty<Principal, Nat>();
  let routineIdCounters = Map.empty<Principal, Nat>();

  // Helper function to get current day as string "YYYY-MM-DD"
  func getCurrentDay() : Text {
    let now = Time.now();
    let daysSinceEpoch = now / 86_400_000_000_000;
    daysSinceEpoch.toText();
  };

  // Helper function to get and update counters
  func getAndIncrementCounter(map : Map.Map<Principal, Nat>, principal : Principal) : Nat {
    let current = switch (map.get(principal)) {
      case (null) { 0 };
      case (?value) { value };
    };
    map.add(principal, current + 1);
    current;
  };

  // Nutrition CRUD
  public shared ({ caller }) func addNutritionEntry(
    calories : Nat,
    protein : Nat,
    carbs : Nat,
    fat : Nat,
    notes : Text,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add nutrition entries");
    };

    let id = getAndIncrementCounter(nutritionIdCounters, caller);

    let entry : NutritionEntry = {
      id;
      calories;
      protein;
      carbs;
      fat;
      notes;
      timestamp = Time.now();
    };

    let userEntries = switch (nutritionEntries.get(caller)) {
      case (null) {
        let newMap = Map.empty<Nat, NutritionEntry>();
        newMap.add(id, entry);
        newMap;
      };
      case (?entries) {
        entries.add(id, entry);
        entries;
      };
    };

    nutritionEntries.add(caller, userEntries);
    id;
  };

  public query ({ caller }) func getTodaysNutritionEntries() : async [NutritionEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view nutrition entries");
    };

    let today = getCurrentDay();
    let userEntries = switch (nutritionEntries.get(caller)) {
      case (null) { return [] };
      case (?entries) { entries };
    };

    let filteredEntries = userEntries.values().toArray().filter(
      func(entry) {
        Int.abs(entry.timestamp / 86_400_000_000_000).toText() == today;
      }
    );
    filteredEntries.sort();
  };

  // Sleep CRUD
  public shared ({ caller }) func addSleepEntry(durationHours : Float, qualityRating : Nat, notes : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add sleep entries");
    };

    let id = getAndIncrementCounter(sleepIdCounters, caller);

    let entry : SleepEntry = {
      id;
      durationHours;
      qualityRating;
      notes;
      timestamp = Time.now();
    };

    let userEntries = switch (sleepEntries.get(caller)) {
      case (null) {
        let newMap = Map.empty<Nat, SleepEntry>();
        newMap.add(id, entry);
        newMap;
      };
      case (?entries) {
        entries.add(id, entry);
        entries;
      };
    };

    sleepEntries.add(caller, userEntries);
    id;
  };

  public query ({ caller }) func getTodaysSleepEntry() : async ?SleepEntry {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view sleep entries");
    };

    let today = getCurrentDay();
    let userEntries = switch (sleepEntries.get(caller)) {
      case (null) { return null };
      case (?entries) { entries };
    };

    userEntries.values().toArray().find(
      func(entry) {
        Int.abs(entry.timestamp / 86_400_000_000_000).toText() == today;
      }
    );
  };

  // Movement CRUD
  public shared ({ caller }) func addMovementEntry(activityType : Text, durationMinutes : Nat, intensity : Nat, notes : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add movement entries");
    };

    let id = getAndIncrementCounter(movementIdCounters, caller);

    let entry : MovementEntry = {
      id;
      activityType;
      durationMinutes;
      intensity;
      notes;
      timestamp = Time.now();
    };

    let userEntries = switch (movementEntries.get(caller)) {
      case (null) {
        let newMap = Map.empty<Nat, MovementEntry>();
        newMap.add(id, entry);
        newMap;
      };
      case (?entries) {
        entries.add(id, entry);
        entries;
      };
    };

    movementEntries.add(caller, userEntries);
    id;
  };

  public query ({ caller }) func getTodaysMovementEntries() : async [MovementEntry] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view movement entries");
    };

    let today = getCurrentDay();
    let userEntries = switch (movementEntries.get(caller)) {
      case (null) { return [] };
      case (?entries) { entries };
    };

    let filteredEntries = userEntries.values().toArray().filter(
      func(entry) {
        Int.abs(entry.timestamp / 86_400_000_000_000).toText() == today;
      }
    );
    filteredEntries.sort();
  };

  // Stress CRUD
  public shared ({ caller }) func addStressEntry(level : Nat, notes : Text, techniques : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add stress entries");
    };

    let id = getAndIncrementCounter(stressIdCounters, caller);

    let entry : StressEntry = {
      id;
      level;
      notes;
      techniques;
      timestamp = Time.now();
    };

    let userEntries = switch (stressEntries.get(caller)) {
      case (null) {
        let newMap = Map.empty<Nat, StressEntry>();
        newMap.add(id, entry);
        newMap;
      };
      case (?entries) {
        entries.add(id, entry);
        entries;
      };
    };

    stressEntries.add(caller, userEntries);
    id;
  };

  public query ({ caller }) func getTodaysStressEntry() : async ?StressEntry {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view stress entries");
    };

    let today = getCurrentDay();
    let userEntries = switch (stressEntries.get(caller)) {
      case (null) { return null };
      case (?entries) { entries };
    };

    userEntries.values().toArray().find(
      func(entry) {
        Int.abs(entry.timestamp / 86_400_000_000_000).toText() == today;
      }
    );
  };

  // Fasting Operations
  public shared ({ caller }) func startFasting(targetHours : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can start fasting sessions");
    };

    let id = getAndIncrementCounter(fastingIdCounters, caller);

    let session : FastingSession = {
      id;
      startTime = Time.now();
      endTime = null;
      targetHours;
      isActive = true;
    };

    let userSessions = switch (fastingSessions.get(caller)) {
      case (null) {
        let newMap = Map.empty<Nat, FastingSession>();
        newMap.add(id, session);
        newMap;
      };
      case (?sessions) {
        sessions.add(id, session);
        sessions;
      };
    };

    fastingSessions.add(caller, userSessions);
    id;
  };

  public shared ({ caller }) func stopFasting(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can stop fasting sessions");
    };

    let userSessions = switch (fastingSessions.get(caller)) {
      case (null) { Runtime.trap("Fasting session not found") };
      case (?sessions) { sessions };
    };

    switch (userSessions.get(id)) {
      case (null) { Runtime.trap("Fasting session not found") };
      case (?session) {
        let updatedSession : FastingSession = {
          id = session.id;
          startTime = session.startTime;
          endTime = ?Time.now();
          targetHours = session.targetHours;
          isActive = false;
        };
        userSessions.add(id, updatedSession);
      };
    };
  };

  // Routine CRUD
  public shared ({ caller }) func addRoutine(name : Text, scheduledTime : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add routines");
    };

    let id = getAndIncrementCounter(routineIdCounters, caller);

    let routine : Routine = {
      id;
      name;
      scheduledTime;
      isActive = true;
    };

    let userRoutines = switch (routines.get(caller)) {
      case (null) {
        let newMap = Map.empty<Nat, Routine>();
        newMap.add(id, routine);
        newMap;
      };
      case (?existingRoutines) {
        existingRoutines.add(id, routine);
        existingRoutines;
      };
    };

    routines.add(caller, userRoutines);
    id;
  };

  public shared ({ caller }) func toggleRoutineCompletion(routineId : Nat, date : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can toggle routine completion");
    };

    let userLogs = switch (routineLogs.get(caller)) {
      case (null) {
        let newMap = Map.empty<Nat, RoutineLog>();
        routineLogs.add(caller, newMap);
        newMap;
      };
      case (?logs) { logs };
    };

    let log : RoutineLog = {
      routineId;
      date;
      completed = true;
    };
    userLogs.add(routineId, log);
  };

  public query ({ caller }) func getTodayRoutineLogs() : async [RoutineLog] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view routine logs");
    };

    let today = getCurrentDay();
    let userLogs = switch (routineLogs.get(caller)) {
      case (null) { return [] };
      case (?logs) { logs };
    };

    let filteredLogs = userLogs.values().toArray().filter(
      func(log) { log.date == today }
    );
    filteredLogs.sort();
  };

  public query ({ caller }) func getDailyScore() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view daily score");
    };

    let today = getCurrentDay();

    let userNutrition = switch (nutritionEntries.get(caller)) {
      case (null) { Map.empty<Nat, NutritionEntry>() };
      case (?entries) { entries };
    };

    let hasNutrition = userNutrition.values().toArray().find(
      func(entry) {
        Int.abs(entry.timestamp / 86_400_000_000_000).toText() == today;
      }
    ) != null;

    let userSleep = switch (sleepEntries.get(caller)) {
      case (null) { Map.empty<Nat, SleepEntry>() };
      case (?entries) { entries };
    };

    let hasSleep = userSleep.values().toArray().find(
      func(entry) {
        Int.abs(entry.timestamp / 86_400_000_000_000).toText() == today;
      }
    ) != null;

    let userMovement = switch (movementEntries.get(caller)) {
      case (null) { Map.empty<Nat, MovementEntry>() };
      case (?entries) { entries };
    };

    let hasMovement = userMovement.values().toArray().find(
      func(entry) {
        Int.abs(entry.timestamp / 86_400_000_000_000).toText() == today;
      }
    ) != null;

    let userStress = switch (stressEntries.get(caller)) {
      case (null) { Map.empty<Nat, StressEntry>() };
      case (?entries) { entries };
    };

    let hasStress = userStress.values().toArray().find(
      func(entry) {
        Int.abs(entry.timestamp / 86_400_000_000_000).toText() == today;
      }
    ) != null;

    let userFasting = switch (fastingSessions.get(caller)) {
      case (null) { Map.empty<Nat, FastingSession>() };
      case (?sessions) { sessions };
    };

    let hasFasting = userFasting.values().toArray().find(
      func(session) {
        switch (session.endTime) {
          case (null) { false };
          case (_) {
            let sessionDay = session.startTime / 86_400_000_000_000;
            Int.abs(sessionDay).toText() == today;
          };
        };
      }
    ) != null;

    let userRoutines = switch (routines.get(caller)) {
      case (null) { Map.empty<Nat, Routine>() };
      case (?routines) { routines };
    };

    let userRoutineLogs = switch (routineLogs.get(caller)) {
      case (null) { Map.empty<Nat, RoutineLog>() };
      case (?logs) { logs };
    };

    let hasRoutines = userRoutines.values().toArray().all(
      func(routine) {
        userRoutineLogs.values().toArray().find(
          func(log) { log.routineId == routine.id and log.date == today }
        ) != null;
      }
    );

    let score = (
      (if hasNutrition { 16 } else { 0 }) +
      (if hasSleep { 16 } else { 0 }) +
      (if hasMovement { 16 } else { 0 }) +
      (if hasStress { 16 } else { 0 }) +
      (if hasFasting { 18 } else { 0 }) +
      (if hasRoutines { 18 } else { 0 })
    );

    score;
  };

  public query ({ caller }) func getTodaySummary() : async DailySummary {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view daily summary");
    };

    let today = getCurrentDay();

    let userNutrition = switch (nutritionEntries.get(caller)) {
      case (null) { Map.empty<Nat, NutritionEntry>() };
      case (?entries) { entries };
    };

    let nutrition = userNutrition.values().toArray().find(
      func(entry) {
        Int.abs(entry.timestamp / 86_400_000_000_000).toText() == today;
      }
    ) != null;

    let userSleep = switch (sleepEntries.get(caller)) {
      case (null) { Map.empty<Nat, SleepEntry>() };
      case (?entries) { entries };
    };

    let sleep = userSleep.values().toArray().find(
      func(entry) {
        Int.abs(entry.timestamp / 86_400_000_000_000).toText() == today;
      }
    ) != null;

    let userMovement = switch (movementEntries.get(caller)) {
      case (null) { Map.empty<Nat, MovementEntry>() };
      case (?entries) { entries };
    };

    let movement = userMovement.values().toArray().find(
      func(entry) {
        Int.abs(entry.timestamp / 86_400_000_000_000).toText() == today;
      }
    ) != null;

    let userStress = switch (stressEntries.get(caller)) {
      case (null) { Map.empty<Nat, StressEntry>() };
      case (?entries) { entries };
    };

    let stress = userStress.values().toArray().find(
      func(entry) {
        Int.abs(entry.timestamp / 86_400_000_000_000).toText() == today;
      }
    ) != null;

    let userFasting = switch (fastingSessions.get(caller)) {
      case (null) { Map.empty<Nat, FastingSession>() };
      case (?sessions) { sessions };
    };

    let fasting = userFasting.values().toArray().find(
      func(session) {
        switch (session.endTime) {
          case (null) { false };
          case (_) {
            let sessionDay = session.startTime / 86_400_000_000_000;
            Int.abs(sessionDay).toText() == today;
          };
        };
      }
    ) != null;

    let userRoutines = switch (routines.get(caller)) {
      case (null) { Map.empty<Nat, Routine>() };
      case (?routines) { routines };
    };

    let userRoutineLogs = switch (routineLogs.get(caller)) {
      case (null) { Map.empty<Nat, RoutineLog>() };
      case (?logs) { logs };
    };

    let allRoutinesCompleted = userRoutines.values().toArray().all(
      func(routine) {
        userRoutineLogs.values().toArray().find(
          func(log) { log.routineId == routine.id and log.date == today }
        ) != null;
      }
    );

    {
      nutrition;
      sleep;
      movement;
      stress;
      fasting;
      routines = allRoutinesCompleted;
    };
  };
};

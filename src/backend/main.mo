import Set "mo:core/Set";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Map "mo:core/Map";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinStorage "blob-storage/Mixin";



actor {
  include MixinStorage();

  type StudySession = {
    startTime : Time.Time;
    endTime : ?Time.Time;
    focusedDuration : Time.Time;
    pausedDuration : Time.Time;
    distractions : Nat;
    distractionCount : Nat;
    distractionTime : Time.Time; // Time spent on distractions in nanoseconds
    isPomodoro : Bool;
    pomodoroCyclesCompleted : Nat;
  };

  type DailyStats = {
    totalStudyTime : Time.Time;
    focusedTime : Time.Time;
    pausedTime : Time.Time;
    distractionEvents : Nat;
    distractionTime : Time.Time; // Add distractionTime to daily stats
    pomodoroCycles : Nat;
  };

  type Goal = {
    dailyTarget : Time.Time;
    streak : Nat;
    lastDayMet : Time.Time;
  };

  module StudySession {
    public func compare(session1 : StudySession, session2 : StudySession) : Order.Order {
      Int.compare(session1.startTime, session2.startTime);
    };
  };

  let pomodoroTimers = Set.empty<Text>();
  let streaks = Set.empty<Principal>();
  let sessionData = Map.empty<Principal, List.List<StudySession>>();
  let studyGoals = Map.empty<Principal, List.List<Goal>>();

  public shared ({ caller }) func startPomodoroTimer(timerId : Text, duration : Nat) : async () {
    pomodoroTimers.add(timerId);
    // Add timer logic using duration in nanoseconds
  };

  public shared ({ caller }) func stopPomodoroTimer(timerId : Text) : async () {
    pomodoroTimers.remove(timerId);
  };

  public shared ({ caller }) func completePomodoroCycle(user : Principal) : async () {
    streaks.add(user);
  };

  public shared ({ caller }) func pausePomodoroTimer(timerId : Text) : async () {
    if (pomodoroTimers.contains(timerId)) {
      // Add logic to pause timer
    } else {
      Runtime.trap("Timer not found");
    };
  };

  public query ({ caller }) func isPomodoroTimerActive(timerId : Text) : async Bool {
    pomodoroTimers.contains(timerId);
  };

  public shared ({ caller }) func recordSession(user : Principal, startTime : Time.Time, endTime : ?Time.Time, focusedDuration : Time.Time, pausedDuration : Time.Time, distractions : Nat, distractionCount : Nat, distractionTime : Time.Time, isPomodoro : Bool, pomodoroCyclesCompleted : Nat) : async (
  ) {
    let session : StudySession = {
      startTime;
      endTime;
      focusedDuration;
      pausedDuration;
      distractions;
      distractionCount;
      distractionTime;
      isPomodoro;
      pomodoroCyclesCompleted;
    };

    let userSessions = switch (sessionData.get(user)) {
      case (?sessions) { sessions };
      case (null) { List.empty<StudySession>() };
    };
    userSessions.add(session);
    sessionData.add(user, userSessions);
  };

  public query ({ caller }) func getAllSessions() : async [StudySession] {
    var allSessions = List.empty<StudySession>();
    for ((_, sessions) in sessionData.entries()) {
      allSessions.addAll(sessions.values());
    };
    allSessions.toArray().sort();
  };
};

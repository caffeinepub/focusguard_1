import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface StudySession {
    startTime: Time;
    endTime?: Time;
    isPomodoro: boolean;
    distractionCount: bigint;
    distractions: bigint;
    pausedDuration: Time;
    pomodoroCyclesCompleted: bigint;
    focusedDuration: Time;
    distractionTime: Time;
}
export type Time = bigint;
export interface backendInterface {
    completePomodoroCycle(user: Principal): Promise<void>;
    getAllSessions(): Promise<Array<StudySession>>;
    isPomodoroTimerActive(timerId: string): Promise<boolean>;
    pausePomodoroTimer(timerId: string): Promise<void>;
    recordSession(user: Principal, startTime: Time, endTime: Time | null, focusedDuration: Time, pausedDuration: Time, distractions: bigint, distractionCount: bigint, distractionTime: Time, isPomodoro: boolean, pomodoroCyclesCompleted: bigint): Promise<void>;
    startPomodoroTimer(timerId: string, duration: bigint): Promise<void>;
    stopPomodoroTimer(timerId: string): Promise<void>;
}

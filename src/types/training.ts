export interface TrainingWeek {
  week: number;
  swim: number;
  bike: number;
  run: number;
  total: number;
}

export interface TrainingPhase {
  name: string;
  description: string;
  weeks: [number, number]; // [start, end] week numbers
}

export interface TrainingPlan {
  startDate: string;
  totalWeeks: number;
  phases: TrainingPhase[];
  weeks: TrainingWeek[];
}

export interface WeekProgress {
  week: number;
  completed: {
    swim: number;
    bike: number;
    run: number;
    total: number;
  };
  planned: {
    swim: number;
    bike: number;
    run: number;
    total: number;
  };
  percentage: number;
  lastUpdated: string;
}

export interface ProgressData {
  [weekNumber: string]: {
    swim: number;
    bike: number;
    run: number;
    total: number;
    lastUpdated: string;
  };
}

export type DisciplineType = 'swim' | 'bike' | 'run';

export interface WeekDateRange {
  start: Date;
  end: Date;
  weekNumber: number;
}

export interface PhaseInfo {
  phase: TrainingPhase;
  isActive: boolean;
  weeksRemaining: number;
  progress: number; // 0-100
}

export interface RunWorkoutDay {
  type: string;
  date: string;
  distance_meters: number;
  time_seconds: number;
  activities_count: number;
}

export interface StravaActivity {
  id: number;
  name: string;
  type: 'Ride' | 'Swim' | 'Run' | 'Walk' | 'Workout';
  start_date: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  sport_type: string;
}

export interface StravaWeeklyStats {
  week: number;
  swim: number; // hours
  bike: number; // hours  
  run: number; // hours
  total: number; // hours
  activities: StravaActivity[];
}

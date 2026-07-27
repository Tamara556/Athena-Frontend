export type DayState = 'completed' | 'missed' | 'today' | 'future';

export interface DailyActivity {
  date: string;
  tasks: number;
  minutes: number;
  interviews: number;
}

export interface StreakActivity {
  referenceDate: string;
  days: DailyActivity[];
}

export interface StreakSummary {
  currentStreak: number;
  longestStreak: number;
  totalLearningDays: number;
  tasksCompleted: number;
  interviewsCompleted: number;
  badgesEarned: number;
  learningMinutes: number;
}

export interface CalendarDay {
  date: string | null;
  day: number;
  state: DayState;
  active: boolean;
  clickable: boolean;
  label: string;
}

export interface DayDetail {
  date: string;
  items: string[];
  minutes: number;
  tasks: number;
}

export interface HeatmapCell {
  date: string;
  level: number;
  inRange: boolean;
  tasks: number;
}

export interface HeatmapMonthLabel {
  label: string;
  column: number;
}

export interface HeatmapModel {
  weeks: HeatmapCell[][];
  monthLabels: HeatmapMonthLabel[];
  maxLevel: number;
}

export interface WeekdayProgress {
  label: string;
  tasks: number;
  ratio: number;
  isToday: boolean;
  isFuture: boolean;
}

export interface WeeklyProgress {
  days: WeekdayProgress[];
  totalTasks: number;
  goalTasks: number;
  completionRatio: number;
}

export interface MonthlyBar {
  label: string;
  year: number;
  month: number;
  tasks: number;
  minutes: number;
  activeDays: number;
  ratio: number;
}

export interface YearlyStatistics {
  year: number;
  activeDays: number;
  tasks: number;
  minutes: number;
  interviews: number;
  bestStreak: number;
  coverageRatio: number;
}

export interface Achievement {
  id: string;
  title: string;
  icon: string;
  date: string;
}

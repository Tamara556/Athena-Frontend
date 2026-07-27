import {
  Achievement,
  CalendarDay,
  DailyActivity,
  DayDetail,
  DayState,
  HeatmapCell,
  HeatmapModel,
  HeatmapMonthLabel,
  MonthlyBar,
  StreakSummary,
  WeekdayProgress,
  WeeklyProgress,
  YearlyStatistics,
} from './streaks.models';

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const MONTH_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_MS = 86_400_000;
const DAYS_PER_WEEK = 7;
const HEATMAP_WEEKS = 20;
const MONTHLY_BAR_COUNT = 12;
const DAILY_GOAL_TASKS = 4;
const WEEKLY_GOAL_TASKS = DAILY_GOAL_TASKS * DAYS_PER_WEEK;
const HEATMAP_MAX_LEVEL = 4;
const TASKS_MILESTONE = 100;
const STREAK_MILESTONES = [7, 30];
const DETAIL_ITEMS = [
  'Daily Journey',
  'One interview preparation activity',
  'A short knowledge check',
  '15 minutes of focused reading',
  'A practice exercise',
];

export function toIso(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function fromIso(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, amount: number): Date {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

function diffInDays(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / DAY_MS);
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function toActivityMap(days: DailyActivity[]): Map<string, DailyActivity> {
  return new Map(days.map((day) => [day.date, day]));
}

export function firstActiveDate(days: DailyActivity[]): Date | null {
  return days.length ? fromIso(days[0].date) : null;
}

export function currentStreak(activity: Map<string, DailyActivity>, today: Date): number {
  let cursor = today;
  if (!activity.has(toIso(cursor))) {
    cursor = addDays(cursor, -1);
  }
  let streak = 0;
  while (activity.has(toIso(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function longestStreak(days: DailyActivity[]): number {
  let longest = 0;
  let run = 0;
  let previous: Date | null = null;
  for (const day of days) {
    const date = fromIso(day.date);
    run = previous && diffInDays(previous, date) === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = date;
  }
  return longest;
}

export function summarize(days: DailyActivity[], today: Date, badgesEarned: number): StreakSummary {
  const activity = toActivityMap(days);
  return {
    currentStreak: currentStreak(activity, today),
    longestStreak: longestStreak(days),
    totalLearningDays: days.length,
    tasksCompleted: sumBy(days, (day) => day.tasks),
    interviewsCompleted: sumBy(days, (day) => day.interviews),
    badgesEarned,
    learningMinutes: sumBy(days, (day) => day.minutes),
  };
}

export function buildCalendar(
  activity: Map<string, DailyActivity>,
  today: Date,
  firstActive: Date | null,
  year: number,
  month: number,
): CalendarDay[] {
  const leading = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: CalendarDay[] = [];

  for (let blank = 0; blank < leading; blank += 1) {
    cells.push({ date: null, day: 0, state: 'future', active: false, clickable: false, label: '' });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const iso = toIso(date);
    const active = activity.has(iso);
    const state = dayState(date, today, firstActive, active);
    cells.push({
      date: iso,
      day,
      state,
      active,
      clickable: active || state === 'today',
      label: calendarLabel(MONTH_FULL[month], day, state),
    });
  }

  return cells;
}

function dayState(date: Date, today: Date, firstActive: Date | null, active: boolean): DayState {
  if (sameDay(date, today)) {
    return 'today';
  }
  if (date.getTime() > today.getTime()) {
    return 'future';
  }
  if (active) {
    return 'completed';
  }
  if (firstActive && date.getTime() < firstActive.getTime()) {
    return 'future';
  }
  return 'missed';
}

function calendarLabel(month: string, day: number, state: DayState): string {
  const suffix = state === 'today' ? 'today' : state === 'future' ? 'ahead' : state === 'completed' ? 'showed up' : 'missed';
  return `${month} ${day}, ${suffix}`;
}

export function dayDetail(activity: Map<string, DailyActivity>, iso: string): DayDetail | null {
  const day = activity.get(iso);
  if (!day) {
    return null;
  }
  const items = Array.from({ length: Math.min(day.tasks, DETAIL_ITEMS.length) }, (_, index) => DETAIL_ITEMS[index]);
  return { date: iso, items, minutes: day.minutes, tasks: day.tasks };
}

export function buildHeatmap(activity: Map<string, DailyActivity>, today: Date): HeatmapModel {
  const currentWeekStart = addDays(today, -today.getDay());
  const start = addDays(currentWeekStart, -(HEATMAP_WEEKS - 1) * DAYS_PER_WEEK);
  const weeks: HeatmapCell[][] = [];
  const monthLabels: HeatmapMonthLabel[] = [];
  let lastMonth = -1;

  for (let week = 0; week < HEATMAP_WEEKS; week += 1) {
    const cells: HeatmapCell[] = [];
    for (let weekday = 0; weekday < DAYS_PER_WEEK; weekday += 1) {
      const date = addDays(start, week * DAYS_PER_WEEK + weekday);
      const iso = toIso(date);
      const inRange = date.getTime() <= today.getTime();
      const tasks = activity.get(iso)?.tasks ?? 0;
      cells.push({ date: iso, tasks, inRange, level: inRange ? heatmapLevel(tasks) : 0 });
      if (inRange && weekday === 0 && date.getMonth() !== lastMonth) {
        lastMonth = date.getMonth();
        monthLabels.push({ label: MONTH_SHORT[date.getMonth()], column: week });
      }
    }
    weeks.push(cells);
  }

  return { weeks, monthLabels, maxLevel: HEATMAP_MAX_LEVEL };
}

function heatmapLevel(tasks: number): number {
  return tasks <= 0 ? 0 : Math.min(HEATMAP_MAX_LEVEL, tasks);
}

export function buildWeekly(activity: Map<string, DailyActivity>, today: Date): WeeklyProgress {
  const weekStart = addDays(today, -today.getDay());
  const days: WeekdayProgress[] = [];
  let totalTasks = 0;

  for (let index = 0; index < DAYS_PER_WEEK; index += 1) {
    const date = addDays(weekStart, index);
    const isFuture = date.getTime() > today.getTime();
    const tasks = isFuture ? 0 : activity.get(toIso(date))?.tasks ?? 0;
    totalTasks += tasks;
    days.push({
      label: WEEKDAY_LABELS[index],
      tasks,
      ratio: Math.min(1, tasks / DAILY_GOAL_TASKS),
      isToday: sameDay(date, today),
      isFuture,
    });
  }

  return { days, totalTasks, goalTasks: WEEKLY_GOAL_TASKS, completionRatio: Math.min(1, totalTasks / WEEKLY_GOAL_TASKS) };
}

export function buildMonthly(days: DailyActivity[], today: Date): MonthlyBar[] {
  const grouped = groupByMonth(days);
  const bars: MonthlyBar[] = [];

  for (let offset = MONTHLY_BAR_COUNT - 1; offset >= 0; offset -= 1) {
    const ref = new Date(today.getFullYear(), today.getMonth() - offset, 1);
    const key = monthKey(ref.getFullYear(), ref.getMonth());
    const bucket = grouped.get(key);
    bars.push({
      label: MONTH_SHORT[ref.getMonth()],
      year: ref.getFullYear(),
      month: ref.getMonth(),
      tasks: bucket?.tasks ?? 0,
      minutes: bucket?.minutes ?? 0,
      activeDays: bucket?.activeDays ?? 0,
      ratio: 0,
    });
  }

  const maxTasks = Math.max(...bars.map((bar) => bar.tasks), 1);
  return bars.map((bar) => ({ ...bar, ratio: bar.tasks / maxTasks }));
}

export function buildYearly(days: DailyActivity[], today: Date): YearlyStatistics {
  const year = today.getFullYear();
  const yearDays = days.filter((day) => fromIso(day.date).getFullYear() === year);
  const elapsedDays = diffInDays(new Date(year, 0, 1), today) + 1;
  return {
    year,
    activeDays: yearDays.length,
    tasks: sumBy(yearDays, (day) => day.tasks),
    minutes: sumBy(yearDays, (day) => day.minutes),
    interviews: sumBy(yearDays, (day) => day.interviews),
    bestStreak: longestStreak(yearDays),
    coverageRatio: elapsedDays > 0 ? Math.min(1, yearDays.length / elapsedDays) : 0,
  };
}

export function buildAchievements(days: DailyActivity[]): Achievement[] {
  if (!days.length) {
    return [];
  }

  const achievements: Achievement[] = [{ id: 'start', title: 'Started Learning', icon: '✨', date: days[0].date }];
  const pendingStreaks = new Set(STREAK_MILESTONES);
  let run = 0;
  let previous: Date | null = null;
  let cumulativeTasks = 0;
  let tasksMilestoneReached = false;
  let firstInterviewReached = false;

  for (const day of days) {
    const date = fromIso(day.date);
    run = previous && diffInDays(previous, date) === 1 ? run + 1 : 1;
    previous = date;

    for (const milestone of STREAK_MILESTONES) {
      if (run >= milestone && pendingStreaks.has(milestone)) {
        pendingStreaks.delete(milestone);
        achievements.push({ id: `streak-${milestone}`, title: `${milestone} Day Streak`, icon: '🔥', date: day.date });
      }
    }

    cumulativeTasks += day.tasks;
    if (!tasksMilestoneReached && cumulativeTasks >= TASKS_MILESTONE) {
      tasksMilestoneReached = true;
      achievements.push({ id: 'tasks-100', title: `${TASKS_MILESTONE} Tasks Completed`, icon: '💯', date: day.date });
    }

    if (!firstInterviewReached && day.interviews > 0) {
      firstInterviewReached = true;
      achievements.push({ id: 'interview-first', title: 'First Interview Passed', icon: '🎤', date: day.date });
    }
  }

  return achievements.sort((a, b) => a.date.localeCompare(b.date));
}

function groupByMonth(days: DailyActivity[]): Map<string, { tasks: number; minutes: number; activeDays: number }> {
  const grouped = new Map<string, { tasks: number; minutes: number; activeDays: number }>();
  for (const day of days) {
    const date = fromIso(day.date);
    const key = monthKey(date.getFullYear(), date.getMonth());
    const bucket = grouped.get(key) ?? { tasks: 0, minutes: 0, activeDays: 0 };
    bucket.tasks += day.tasks;
    bucket.minutes += day.minutes;
    bucket.activeDays += 1;
    grouped.set(key, bucket);
  }
  return grouped;
}

function monthKey(year: number, month: number): string {
  return `${year}-${month}`;
}

function sumBy(days: DailyActivity[], selector: (day: DailyActivity) => number): number {
  return days.reduce((total, day) => total + selector(day), 0);
}

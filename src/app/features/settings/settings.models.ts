export type Segs = Record<string, string>;
export type Togs = Record<string, boolean>;

export interface Account {
  userId: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  imageName: string | null;
}

export interface SettingsBundle {
  learning: { availability: string; difficulty: string; style: string };
  experience: { tone: string; motivational: boolean; reflection: boolean; adaptive: boolean };
  notifications: { dailyReminder: boolean; weeklySummary: boolean; interviewReminders: boolean; milestones: boolean };
  privacy: { personalize: boolean; shareAnon: boolean };
}

export const DEFAULT_SEGS: Segs = { availability: '2h', difficulty: 'balanced', style: 'practical', tone: 'encouraging' };
export const DEFAULT_TOGS: Togs = {
  motivational: true, reflection: true, adaptive: true,
  dailyReminder: true, weeklySummary: true, interviewReminders: false, milestones: true,
  personalize: true, shareAnon: false,
};

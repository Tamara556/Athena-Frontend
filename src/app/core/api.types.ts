export interface AuthResponse {
  accessToken: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  imageName?: string | null;
  twoFactorRequired?: boolean;
  challengeToken?: string | null;
  sessionId?: string | null;
}

export interface LoginRequest {
  login: string;
  password: string;
}

export interface TwoFactorVerifyRequest {
  challengeToken: string;
  code: string;
}

export interface OnboardingStart {
  greeting?: string;
  firstQuestion?: string;
}

export interface GoalQuestions {
  questions?: string[];
}

export interface AssessmentAnswer {
  question: string;
  answer: string;
}

export interface RoadmapPhase {
  name: string;
  description?: string;
  durationWeeks: number;
  objectives: string[];
  status?: string;
}

export interface RoadmapResponse {
  goal: string;
  level: string;
  phases: RoadmapPhase[];
}

export interface DailyPlanItem {
  type: string;
  title: string;
  description: string;
  estimatedMinutes: number;
}

export interface DailyPlanResponse {
  date: string;
  items: DailyPlanItem[];
}

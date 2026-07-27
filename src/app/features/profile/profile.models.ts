export interface ProfileIdentity {
  userId: string;
  firstName: string;
  lastName: string;
  title: string;
  joinedAt: string;
  imageName: string | null;
}

export interface ProfileNarrative {
  whyStarted: string;
  whyWrittenAt: string;
}

export interface LearningDirection {
  primaryGoal: string;
  currentFocus: string;
  nextMilestone: string;
}

export interface LearningPreferences {
  availability: string;
  difficulty: string;
  style: string;
}

export interface AthenaInsight {
  kind: string;
  text: string;
  emphasis: string;
}

export interface Milestone {
  id: string;
  kind: string;
  title: string;
  achievedAt: string;
}

export interface ProfileView {
  identity: ProfileIdentity;
  narrative: ProfileNarrative;
  direction: LearningDirection;
  preferences: LearningPreferences;
  insights: AthenaInsight[];
  milestones: Milestone[];
}

export type ProfileDialogKind = 'profile' | 'goal' | 'availability';

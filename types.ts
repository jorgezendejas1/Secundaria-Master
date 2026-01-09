
export enum SubjectMode {
  MATH = 'MATH',
  PHYSICS = 'PHYSICS',
  CIVICS = 'CIVICS',
  HISTORY = 'HISTORY',
  CHEMISTRY = 'CHEMISTRY',
}

export interface PersonaConfig {
  id: SubjectMode;
  name: string;
  role: string;
  avatar: string; // Emoji
  color: string;
  bgGradient: string;
  borderColor: string;
  systemInstruction: string;
  welcomeMessage: string;
  loadingMessages: string[];
}

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: Date;
  audioData?: string; // Base64 audio for TTS playback
  isThinking?: boolean;
  image?: string; // Data URL of the uploaded image
}

export interface ChatSessionState {
  messages: Message[];
  isLoading: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface DailyChallenge {
  id: string;
  subject: SubjectMode;
  question: string;
  options: string[];
  correctAnswer: number; // Index
  rewardText: string;
}

export interface UserProfile {
  email?: string;
  username: string;
  avatar: string;
  streak: number;
  totalQuestions: number;
  subjectStats: Record<SubjectMode, number>;
  isAuthenticated: boolean;
}

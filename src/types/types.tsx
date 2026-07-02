export type Step =
  | "TOPIC"
  | "ROLE"
  | "TOPIC_INTRO"
  | "DEBATE"
  | "SUMMARY";

export type Role = "WATCH" | "STEER" | "PARTICIPATE" | null;

export interface DebateMessage {
  id: number;
  side: "Pro" | "Contra" | "You";
  text: string;
}

export interface ChatMessage {
  id: number;
  type: "bot" | "user";
  color?: string;
  text: string;
  side?: string;
  isComplete?: boolean;
  isIntro?: boolean;
}
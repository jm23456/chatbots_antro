export type Step =
  | "TOPIC"
  | "ROLE"
  | "TOPIC_INTRO"
  | "DEBATE"
  | "SUMMARY";

export type Role = "WATCH" | "STEER" | "PARTY" | null;

export type Ling = "first_person" | "general" | null;

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

export type SpeakerKey = "A" | "B" | "C" | "D" | "E" | "SYSTEM";

export type DebateUtterance = {
  uid: string;
  speaker: SpeakerKey;
  text: string;
  speak_as_user?: boolean;
};

export type DebateTransitionOption = {
  option_id: string;
  label: string;
  speak_as_user?: boolean;
  next: string;
  default_option?: boolean;
};

export type DebateTransition =
  | { type: "linear"; next?: string }
  | { type: "choice"; prompt?: string; timeout_seconds?: number | null; options?: DebateTransitionOption[] }
  | { type: "end"; };

export type DebateNode = {
  round?: number;
  kind: string;
  topic?: string;
  utterances: DebateUtterance[];
  transition: DebateTransition;
};

export type RoleData = {
  label?: string;
  description?: string;
  stance?: "pro" | "contra" | "undecided";
  orientation?: string;
  display?: { color?: string; avatar?: string };
};

export type DebateData = {
  schema_version?: string;
  debate_id?: string;
  title?: string;
  source?: string;
  language?: string;
  condition?: {
    linguistic_style?: string;
    interaction_level?: string;
  };
  roles?: Record<string, RoleData>;
  start_node: string;
  nodes: Record<string, DebateNode>;
};
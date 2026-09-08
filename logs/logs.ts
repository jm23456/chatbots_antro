export type DebateLog = {
  timestamp: string;
  event: string;
  // participantId: string | null;
  topic?: string;
  role?: string | null;
  ling?: string | null;
  message?: string;
  data?: Record<string, unknown>;
};

let logs: DebateLog[] = [];
let debateContext: Omit<DebateLog, "timestamp" | "event" | "message" | "data"> = {
  participantId: null,
};

export const startDebateLog = (context: {
  participantId?: string | null;
  topic?: string;
  role?: string | null;
  ling?: string | null;
}) => {
  logs = [];
  debateContext = context;
};

export const logEvent = (
  event: string,
  participantId: string | null,
  data: Record<string, unknown> = {}
) => {
  const log: DebateLog = {
    event,
    ...debateContext,
    participantId,
    ...data,
    timestamp: new Date().toISOString(),
  };

  console.log("LOG:", log);

  logs.push(log);
};


export const getLogs = () => {
  return logs;
};


export const sendLogsToQualtrics = () => {
  console.log("=== SEND TO QUALTRICS ===");
  console.log("Number of logs:", logs.length);
  console.log("Logs:", [...logs]);
  window.parent.postMessage(
    {
      type: "DEBATE_LOG",
      logs: [...logs],
    },
    "*"
  );
    console.log("=== POSTMESSAGE SENT ===");
};


export const clearLogs = () => {
  logs = [];
};
export type DebateLog = {
  event: string;
  timestamp: string;
  participantID: string | null;
  data?: Record<string, any>;
};

// Logs are kept in sessionStorage so a page reload does not wipe the events
// recorded before it. Storage can be blocked inside the Qualtrics iframe
// (e.g. Safari), so every access is guarded and memory is the fallback.
const STORAGE_KEY = "debate_logs";

const loadLogs = (): DebateLog[] => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

let logs: DebateLog[] = loadLogs();

const saveLogs = () => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch {
    // storage unavailable: logs stay in memory only
  }
};

export const logEvent = (
  event: string,
  participantID: string | null,
  data = {}
) => {

  const log: DebateLog = {
    event,
    timestamp: new Date().toISOString(),
    participantID,
    data
  };

  console.log("LOG:", log);

  // A new participant in the same tab (e.g. repeated test runs) starts clean.
  if (logs.length > 0 && logs[0].participantID !== participantID) {
    logs = [];
  }
  logs.push(log);
  saveLogs();
  // Send the full log after every event, so Qualtrics always holds
  // everything recorded so far, even if the participant never reaches the end.
  sendLogsToQualtrics();
};


export const getLogs = () => {
  return logs;
};


// Always sends the complete log, never just the newest event: the Qualtrics
// listener can simply overwrite its embedded data field with each message.
// Type and shape (an array) match the Qualtrics listener, which stringifies it.
export const sendLogsToQualtrics = () => {

  window.parent.postMessage(
    {
      type: "DEBATE_LOG",
      logs: [...logs]
    },
    "*"
  );

};


export const clearLogs = () => {
  logs = [];
  saveLogs();
};

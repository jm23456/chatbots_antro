export type DebateLog = {
  event: string;
  timestamp: string;
  participantID: string | null;
  data?: Record<string, any>;
};

let logs: DebateLog[] = [];

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

  logs.push(log);
};


export const getLogs = () => {
  return logs;
};


export const sendLogsToQualtrics = () => {

  window.parent.postMessage(
    {
      type: "debate_logs",
      logs: JSON.stringify(logs)
    },
    "*"
  );

};


export const clearLogs = () => {
  logs = [];
};
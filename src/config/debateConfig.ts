export const debateConfig = {
  totalRounds: 3,
  turnDurationSeconds: 60,
  showSummary: true,
  showExitWarning: true,
  showExitButton: false,
  // Typing delay per bot message. Must be the same in all three conditions,
  // otherwise pacing and time on task differ between interaction levels.
  typingDelayMs: 1000,
};

export default debateConfig;

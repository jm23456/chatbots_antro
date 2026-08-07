import React, { useState } from "react";
import "./App.css";

import type { Step, Role, Ling } from "./types/types";

import TopicIntro from "./screens/TopicIntro"
import SteerDebateScreen from "./screens/SteerDebateScreen";
import DebateScreen from "./screens/DebateScreen";
import PartyDebateScreen from "./screens/PartyDebateScreen";
import Summary from "./screens/Summary";
import { LanguageProvider } from "./i18n/LanguageContext";
import { useSearchParams } from "react-router-dom";
import { logEvent, sendLogsToQualtrics } from "../logs/logs";
import CandidatesIntro from "./screens/CandidatesIntro";
import PartyCandidatesIntro from "./screens/PartyCandidatesIntro";


const STEPS: Record<string, Step> = {
  TOPIC: "TOPIC",
  ROLE: "ROLE",
  TOPIC_INTRO: "TOPIC_INTRO",
  INTRO: "INTRO",
  DEBATE: "DEBATE",
  SUMMARY: "SUMMARY",
};

const App: React.FC = () => {
  const [params] = useSearchParams();
  const urlTopic = params.get("topic") ?? "";
  const urlLing = params.get("ling") as Ling ?? null;
  const urlRole = params.get("role") as Role ?? null;
  const participantID = params.get("participant_id") ?? null;
  const initialStep = params.get("step") ?? STEPS.TOPIC_INTRO;
  const [step, setStep] = useState<string>(initialStep);
  const [selectedTopic, setSelectedTopic] = useState<string>(urlTopic ?? "");
  const [ling, setLing] = useState<Ling>(urlLing ?? null);
  const [role, setRole] = useState<Role>(urlRole ?? null);
  const [userIntroMessage, setUserIntroMessage] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [isIntro, setIsIntro] = useState(false);
  const currentTopicTitle = selectedTopic;

  return (
    <LanguageProvider>
      <div className="app-root">
        <div className="app-card">
        {step === STEPS.TOPIC_INTRO && (
          <TopicIntro
            topicTitle={selectedTopic}
            onNext={() => {
              setHasStarted(false);
              setStep(STEPS.INTRO);
            }}
            onExit={() => {
              setStep(STEPS.SUMMARY);
              setSelectedTopic("");
              setHasStarted(false);
            }}
          />
        )}

        {step === STEPS.INTRO && (role === "WATCH" || role === "STEER") && (
          <CandidatesIntro
            onNext={() => {
              setHasStarted(false);
            }}
            onExit={() => {
              setStep(STEPS.SUMMARY);
              setSelectedTopic("");
              setHasStarted(false);
            }}
          />
        )}
        {step === STEPS.INTRO && role === "PARTY" && (
          <PartyCandidatesIntro
            onNext={() => {
              setHasStarted(false);
            }}
            onExit={() => {
              setStep(STEPS.SUMMARY);
              setSelectedTopic("");
              setHasStarted(false);
            }}
          />
        )}

        {step === STEPS.DEBATE && role === "WATCH" && (
          <DebateScreen
            topicTitle={currentTopicTitle?? ""}
            participantID={participantID}
            onExit={() => {
              logEvent("Debate_ended", participantID, { timestamp: new Date().toLocaleTimeString() });
              sendLogsToQualtrics();
              setStep(STEPS.SUMMARY);
              setSelectedTopic("");
              setHasStarted(false);
            }}
            hasStarted={hasStarted}
            onStart={() => {
              logEvent("Debate_started", participantID, { timestamp: new Date().toLocaleTimeString() });
              console.log("Log Event:", participantID, new Date().toLocaleTimeString());
              setHasStarted(true);
            }}
          />
        )}

              
        {step === STEPS.DEBATE && role === "STEER" && (
          <SteerDebateScreen
            topicTitle={currentTopicTitle}
            participantID={participantID}
            onExit={() => {
              logEvent("Debate_ended", participantID, { timestamp: new Date().toLocaleTimeString() });
              sendLogsToQualtrics();
              setStep(STEPS.SUMMARY);
              setSelectedTopic("");
              setUserIntroMessage(null);
              setHasStarted(false);
            }}
            hasStarted={hasStarted}
            onStart={() => {
              logEvent("Debate_started", participantID, { timestamp: new Date().toLocaleTimeString() });
              setHasStarted(true);
            }}
            userIntroMessage={userIntroMessage}
          />
        )}

        {step === STEPS.DEBATE && role === "PARTY" && (
          <PartyDebateScreen
            topicTitle={currentTopicTitle}
            participantID={participantID}
            onExit={() => {
              logEvent("Debate_ended", participantID, { timestamp: new Date().toLocaleTimeString() });
              sendLogsToQualtrics();
              setStep(STEPS.SUMMARY);
              setSelectedTopic("");
              setUserIntroMessage(null);
              setHasStarted(false);
            }}
            hasStarted={hasStarted}
            onStart={() => {
              logEvent("Debate_started", participantID, { timestamp: new Date().toLocaleTimeString() });
              setHasStarted(true);
              setIsIntro(true);
            }}
          />
        )}

        {step === STEPS.SUMMARY && (
          <Summary
            topicTitle={currentTopicTitle}
            participantID={participantID}
            onStartAnother={() => {
              setStep(STEPS.TOPIC_INTRO);
              console.log({
  step,
  role,
  hasStarted,
  selectedTopic,
});
            }}
          />
        )}
      </div>
    </div>
    </LanguageProvider>
  );
};


export default App;
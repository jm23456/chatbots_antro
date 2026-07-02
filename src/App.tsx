import React, { useState, useEffect } from "react";
import "./App.css";

import type { Step, Role, DebateMessage } from "./types/types";

import RoleSelection from "./screens/RoleSelection";
import TopicIntro from "./screens/TopicIntro"
import SteerDebateScreen from "./screens/SteerDebateScreen";
import DebateScreen from "./screens/DebateScreen";
import Summary from "./screens/Summary";
import { LanguageProvider } from "./i18n/LanguageContext";
import { useSearchParams } from "react-router-dom";


const STEPS: Record<string, Step> = {
  TOPIC: "TOPIC",
  ROLE: "ROLE",
  TOPIC_INTRO: "TOPIC_INTRO",
  DEBATE: "DEBATE",
  SUMMARY: "SUMMARY",
};

const App: React.FC = () => {
  const [params] = useSearchParams();
  const urlTopic = params.get("topic") ?? "";
  const urlRole = params.get("role") as Role ?? "STEER";
  const initialStep = params.get("step") ?? STEPS.ROLE;
  const [step, setStep] = useState<string>(initialStep);
  const [selectedTopic, setSelectedTopic] = useState<string>(urlTopic ?? "");
  const [role, setRole] = useState<Role>(urlRole ?? "");
  const [debateMessages, setDebateMessages] = useState<DebateMessage[]>([
    { id: 1, side: "Contra", text: "Introduction" },
    { id: 2, side: "Pro", text: "Introduction" },
    { id: 3, side: "Contra", text: "Introduction" },
    { id: 4, side: "Pro", text: "Introduction" },
  ]);
  const [inputText, setInputText] = useState<string>("");
  const [userIntroMessage, setUserIntroMessage] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60); // 15:00
  const [hasStarted, setHasStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  console.log("FULL URL:", window.location.href);
  console.log("HASH:", window.location.hash);
  console.log("params:", params.toString());
  console.log("Topic: "+urlTopic);
  console.log("Role: " + urlRole);
  console.log("InitialStep: " + initialStep);
    console.log("Step: " + step);
  // Timer für DEBATE (15 Min)
  useEffect(() => {
    if (step !== STEPS.DEBATE) return;
    if (!hasStarted) return;
    if (isPaused) return;
    const id = globalThis.setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => globalThis.clearInterval(id);
  }, [step, hasStarted, isPaused]);


  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMessage: DebateMessage = {
      id: Date.now(),
      side: "You",
      text: inputText.trim(),
    };
    setDebateMessages((prev) => [...prev, newMessage]);
    setInputText("");
  };

  const currentTopicTitle = selectedTopic;

  return (
    <LanguageProvider>
      <div className="app-root">
        <div className="app-card">
          {step === STEPS.ROLE && (
            <RoleSelection
              role={role}
              setRole={setRole}
              selectedTopic={selectedTopic}
              setSelectedTopic={setSelectedTopic}
              onContinue={() => {setStep(STEPS.TOPIC_INTRO);
                setSelectedTopic(urlTopic);
                setRole(urlRole);
                 console.log({
                  step,
                  role,
                  hasStarted,
                  selectedTopic,
});}}
            />
        )}

        {step === STEPS.TOPIC_INTRO && (
          <TopicIntro
            topicTitle= {selectedTopic}
            onNext={() => {
              setHasStarted(false);
              setStep(STEPS.DEBATE);
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
            timeLeft={formatTime(timeLeft ?? 0)}
            onExit={() => {
              setStep(STEPS.SUMMARY);
              setTimeLeft(15 * 60);
              setSelectedTopic("");
              setHasStarted(false);
            }}
            hasStarted={hasStarted}
            onStart={() => {
              setHasStarted(true);
              setTimeLeft(15 * 60);
            }}
          />
        )}

              
        {step === STEPS.DEBATE && role === "STEER" && (
          <SteerDebateScreen
            topicTitle={currentTopicTitle}
            timeLeft={formatTime(timeLeft)}
            onExit={() => {
              setStep(STEPS.SUMMARY);
              setSelectedTopic("");
              setUserIntroMessage(null);
              setHasStarted(false);
            }}
            hasStarted={hasStarted}
            onStart={() => {
              setHasStarted(true);
              setTimeLeft(15 * 60);
            }}
            userIntroMessage={userIntroMessage}
          />
        )}

        {step === STEPS.SUMMARY && (
          <Summary
            topicTitle={currentTopicTitle}
            onStartAnother={() => {
              setStep(STEPS.ROLE);
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
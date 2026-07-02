import React, { useState } from "react";
import type { Role } from "../types/types";
import CandidateCardIntro from "../components/CandidateCardIntro";
import "../App.css";
import LanguageToggle from "../components/LanguageToggle";
import { useLanguage } from "../hooks/useLanguage";
import topicConfig from "../config/topicConfig";
import { useSearchParams } from "react-router-dom";


interface RoleSelectionProps {
  role: Role;
  setRole: (value: Role) => void;
  selectedTopic: string;
  setSelectedTopic: (value: string) => void;
  onContinue: () => void;
}


const RoleSelection: React.FC<RoleSelectionProps> = ({
  role,
  selectedTopic,
  onContinue,
}) => {
  const { t, language } = useLanguage();
  const [params] = useSearchParams();
  const topicFromURL = params.get("topic");
  const roleFromURL = params.get("role");
  console.log("URL Params - Topic: " + topicFromURL + ", Role: " + roleFromURL);
  const [activeTopic, setActiveTopic] = useState<keyof typeof topicConfig>("HEALTH_INSURANCE_TOPIC");
  const [activeRole, setActiveRole] = useState<"WATCH" | "ACTIVE" | "STEER" | "PARTICIPATE">("WATCH");
  // const availableRoles = rolesConfig[activeTopic]
  const roles: { id: Role; label: string; description: string }[] = [
   /* {
      id: "WATCH",
      label: "Only observe the debate",
      description: "You observe and follow the arguments.",
    },*/
    {
      id: "COMMENT",
      label: t("comment"),
      description: "You can send questions and short comments.",
    },
    {
      id: "ACTIVE",
      label: t("active"),
      description: "You participate as if you were one side.",
    },
  ];
  

  // const handleRoleSelect = () => {
  //   setRole(roles["ACTIVE"].en);
  //   console.log("Role selected")
  // };
  // const setRoles = (role: string ) => {
  //   if (rolesConfig[activeTopic].includes(role as any)) {
  //     setActiveRole(role as any);
  //   }
  // };
  // const HEALTH_INSURANCE_TOPIC = topicConfig["HEALTH_INSURANCE_TOPIC"].en;
  // console.log("Selected Topic: " + HEALTH_INSURANCE_TOPIC);
  // console.log(typeof HEALTH_INSURANCE_TOPIC);

  const topics = [t("bilateral"), t("healthInsurance"), t("atom")];

  // const handleTopicSelect = () => {
  //   setSelectedTopic("HEALTH_INSURANCE_TOPIC");
  //   console.log("Topic selected")
  // };

  return (
      <div className="screen" style={{
      boxShadow: "0 20px 60px rgba(80, 60, 160, 0.15),0 8px 24px rgba(80, 60, 160, 0.10)",
      paddingTop: "24px",
      paddingBottom: "40px",
      margin: "32px auto",
      maxWidth: "1000px",
      borderRadius: "24px"
    }}>

      <section className="screen-body">
        <LanguageToggle />
        <div className="intro-stage">
          {/* Pro Side */}
            <div className="introcandidates-row-left">
              <CandidateCardIntro color="yellow" />
              <CandidateCardIntro color="gray" />
            </div>

          <div className="introcandidates-row-center">
            <CandidateCardIntro color="blue" />
          </div>

        {/* Contra Side */}
          <div className="introcandidates-row-right">
            <CandidateCardIntro color="red" />
            <CandidateCardIntro color="green" />
          </div>
        </div>
      </section>


      <header className="screen-header" style={{marginBottom: "30px", marginTop: "0px"}}>
        <p className="subtitle">{t("title")}</p>

      </header>

      <div className="screen" style={{
      boxShadow: "0 2px 10px rgba(80, 60, 160, 0.2), 0 8px 24px rgba(80, 60, 160, 0.12), 0 0 80px rgba(80, 60, 160, 0.08)",
      paddingLeft: "40px",
      paddingRight: "40px",
      paddingBottom: "15px",
      paddingTop: "5px",

      background: "#F9F8FD",
      margin: "0px auto",
      maxWidth: "860px",
      height: "auto",
      borderRadius: "24px"
    }}>
      <section className="role-title">
        <h2>{t("chooseRole")}</h2>
        <div className="button-grid">
          {roles.map((r) => (
            <button
              key={r.id ?? "NONE"}
              className={
                "primary-btn outline" + (role === r.id ? " primary-btn-active" : "")
              }
              // onClick={() => handleRoleSelect(r.id)}
            >
              {r.label}
            </button>
          ))}
        </div>
      </section>
      <section className="role-title">
        <h2>{t("chooseTopic")}</h2>
        <div className="button-grid-horizontal">
          {topics.map((topic) => {
            const isHealthTopic = topic;
            return (
              <button
                key={topic}
                className={
                  "topic-btn outline" +
                  ` lang-${language}` +
                  (selectedTopic === topic
                  ? " topic-btn-active"
                  : "")
              }
              // onClick={() => {if (isHealthTopic) {
              //   handleTopicSelect();}
              // }}
              disabled={!isHealthTopic}
            >
              {topic}
            </button>
          );})}
        </div>
      </section>

      <div className="footer-end-row" style={{marginBottom: "0px"}}>
        <button 
          className="con-primary-btn" 
          onClick={onContinue}
        >
          {t("continue")}
        </button>
      </div>
      </div>
    </div>
  );
};

export default RoleSelection;
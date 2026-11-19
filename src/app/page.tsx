"use client";

import { useMemo, useState } from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

type InviteType = "single" | "couple" | "family";

type Question = {
  id: string;
  prompt: string;
  emoji: string;
  options: string[];
};

const QUESTIONS: Question[] = [
  {
    id: "q1",
    prompt: "Sa e prisni me gezim dasmen tone?",
    emoji: "💌",
    options: [
      "Shume e gezuar!",
      "Mezi po pres",
      "Me shume po e pres ushqimin",
      "A do te kete open bar?",
      "E paskam harruar qe po martoheni",
    ],
  },
  {
    id: "q2",
    prompt: "A mendoni se do te prekeni gjate ceremonise?",
    emoji: "🥹",
    options: [
      "Po, patjeter",
      "Po, shume",
      "Do te mundohem ta mbaj veten",
      "Vetem nese qajne edhe te tjeret",
      "Jo ❤️",
    ],
  },
  {
    id: "q3",
    prompt: "Cfare do te sillni si dhurate per dasmen?",
    emoji: "🎁",
    options: [
      "Para, normalisht",
      "Dicka nga lista e dhuratave",
      "Nje dhurate simbolike",
      "Do ta blej ne moment te fundit",
      "Prania ime eshte dhurata",
    ],
  },
  {
    id: "q4",
    prompt: "Cfare ngjyre veshjeje do te zgjidhni per dasmen?",
    emoji: "👗",
    options: ["E bardhe", "E kuqe", "E zeze", "Roze e ndezur", "Si te me udhezoni ju."],
  },
];

function safeType(value: string | null): InviteType {
  if (value === "couple" || value === "family") {
    return value;
  }
  return "single";
}

function InviteExperience() {
  const params = useSearchParams();
  const inviteCode = params.get("invite");
  const inviteeName = params.get("name")?.trim() || "I ftuar i nderuar";
  const inviteType = safeType(params.get("type"));
  const partnerName = params.get("partner")?.trim() || "your partner";
  const children = Number.parseInt(params.get("children") || "0", 10);

  const inviteContext = useMemo(() => {
    if (inviteType === "couple") {
      return `Rezervim per 2 persona (${inviteeName} + ${partnerName})`;
    }
    if (inviteType === "family") {
      const childCount = Number.isNaN(children) ? 0 : Math.max(0, children);
      return `Rezervim familjar: ${inviteeName}${childCount > 0 ? ` + ${childCount} femije` : ""}`;
    }
    return `Vendi i rezervuar per ${inviteeName}`;
  }, [inviteType, inviteeName, partnerName, children]);

  const [step, setStep] = useState(-1);
  const [answers, setAnswers] = useState<string[]>([]);
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const [noTries, setNoTries] = useState(0);
  const [submitState, setSubmitState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [showTravelGuide, setShowTravelGuide] = useState(false);
  const [travelChoice, setTravelChoice] = useState<"return-early" | "overnight" | null>(null);

  const questionIndex = step;
  const isStart = step < 0;
  const isDone = step >= QUESTIONS.length;
  const currentQuestion = QUESTIONS[questionIndex];
  const failedOnWhite = answers[3]?.toLowerCase() === "e bardhe";
  const accepted = isDone && !failedOnWhite;

  async function submitRsvp(nextAnswers: string[]) {
    const payload = {
      inviteCode,
      guestName: inviteeName,
      inviteType,
      partnerName: inviteType === "couple" ? partnerName : null,
      childrenCount: inviteType === "family" ? (Number.isNaN(children) ? 0 : Math.max(0, children)) : 0,
      accepted: nextAnswers[3]?.toLowerCase() !== "white",
      answers: QUESTIONS.map((question, index) => ({
        questionId: question.id,
        answer: nextAnswers[index] || "",
      })),
    };

    setSubmitState("saving");
    setSubmitMessage("Duke ruajtur RSVP...");

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error || "RSVP nuk u ruajt.");
      }

      setSubmitState("saved");
      setSubmitMessage("RSVP u ruajt me sukses.");
    } catch {
      setSubmitState("error");
      setSubmitMessage("RSVP nuk u ruajt. Ju lutem provoni perseri.");
    }
  }

  function handleAnswer(answer: string) {
    const nextAnswers = [...answers];
    nextAnswers[questionIndex] = answer;
    setAnswers(nextAnswers);
    const nextStep = step + 1;
    setStep(nextStep);

    if (nextStep >= QUESTIONS.length) {
      void submitRsvp(nextAnswers);
    }
  }

  function restartQuiz() {
    setStep(-1);
    setAnswers([]);
    setNoPosition({ x: 0, y: 0 });
    setNoTries(0);
    setSubmitState("idle");
    setSubmitMessage("");
    setShowTravelGuide(false);
    setTravelChoice(null);
  }

  function dodgeNoButton() {
    const randomX = Math.floor(Math.random() * 130) - 65;
    const randomY = Math.floor(Math.random() * 36) - 18;
    setNoPosition({ x: randomX, y: randomY });
    setNoTries((prev) => prev + 1);
  }

  return (
    <div className="invite-shell">
      <main className="invite-main">
        <header className="invite-header">
          <p className="invite-kicker">NJE FTESE E VOGEL</p>
          <div className="invite-tabs">
            <span>{isDone ? "PERFUNDIMI" : isStart ? "RSVP" : `PYETJA ${questionIndex + 1}`}</span>
            <span>{isDone ? "PERGJIGJJA FINALE" : "JINI TE SINQERTE"}</span>
          </div>
        </header>

        <section className="invite-card">
          {isStart && (
            <>
              <p className="mini-label">RUAJE DATEN</p>
              <h1>
                {inviteeName}, a do te vini ne dasmen tone? <span>💍</span>
              </h1>
              <p className="invite-context">{inviteContext}</p>
              <div className="rsvp-toggle" role="group" aria-label="RSVP choice">
                <button className="start-btn yes-btn" onClick={() => setStep(0)}>
                  Po
                </button>
                <button
                  className="start-btn no-btn"
                  onMouseEnter={dodgeNoButton}
                  onMouseMove={dodgeNoButton}
                  onFocus={dodgeNoButton}
                  onClick={dodgeNoButton}
                  style={{
                    transform: `translate(${noPosition.x}px, ${noPosition.y}px)`,
                  }}
                  aria-label="No option unavailable"
                  type="button"
                >
                  Jo
                </button>
              </div>
              <p className="dodging-note">
                {noTries > 0 ? "E bukur kjo, por 'Jo' nuk eshte opsion 😄" : "Zgjidhni me kujdes."}
              </p>
            </>
          )}

          {!isStart && !isDone && currentQuestion && (
            <>
              <p className="mini-label">
                PYETJA {questionIndex + 1} NGA {QUESTIONS.length}
              </p>
              <h2>
                {currentQuestion.prompt} <span>{currentQuestion.emoji}</span>
              </h2>
              <div className="options-grid">
                {currentQuestion.options.map((option) => (
                  <button key={option} className="option-btn" onClick={() => handleAnswer(option)}>
                    {option}
                  </button>
                ))}
              </div>
            </>
          )}

          {isDone && (
            <>
              <div className={`verdict-icon ${accepted ? "ok" : "no"}`}>{accepted ? "✓" : "✕"}</div>
              <h3 className={`verdict-title ${accepted ? "ok" : "no"}`}>
                {accepted ? "JENI TE FTUAR" : "VESHJE E BARDHE"}
              </h3>
              <p className="verdict-subtitle">
                {accepted
                  ? "RSVP u pranua. Mezi presim te festojme bashke me ju."
                  : "Ne kete rast nuk kaluat. Ngjyra e bardhe eshte e rezervuar per nusen."}
              </p>
              {submitState !== "idle" && (
                <p className={`submit-note ${submitState}`}>
                  {submitState === "saving" ? "Duke ruajtur..." : submitMessage}
                </p>
              )}
              <div className="verdict-actions">
                <span className={`status-pill ${accepted ? "ok" : "no"}`}>
                  {accepted ? "Statusi i mysafirit: Konfirmuar" : "Statusi i mysafirit: Refuzuar"}
                </span>
                <button className="retry-btn" onClick={restartQuiz}>
                  Provo perseri
                </button>
              </div>

              {accepted && (
                <div className="travel-guide-wrap">
                  <div className="travel-prompt">
                    <p>Ju lutem hapni udhezimet e udhetimit para ardhjes ne dasme.</p>
                    <span className="travel-arrow" aria-hidden="true">
                      ↓
                    </span>
                  </div>
                  <button className="travel-toggle-btn" onClick={() => setShowTravelGuide((prev) => !prev)}>
                    {showTravelGuide ? "Mbyll udhezimet e udhetimit" : "Hap udhezimet e udhetimit"}
                  </button>

                  {showTravelGuide && (
                    <div className="travel-guide">
                      <p className="travel-guide-intro">
                        Zgjidh opsionin qe pershtatet me planin tend pas dasmes.
                      </p>

                      <div className="travel-choice-grid">
                        <button
                          className={`travel-choice-btn ${travelChoice === "return-early" ? "active" : ""}`}
                          onClick={() => setTravelChoice("return-early")}
                        >
                          Do te kthehem me heret, sepse udhetoj jashte Gjakoves
                        </button>
                        <button
                          className={`travel-choice-btn ${travelChoice === "overnight" ? "active" : ""}`}
                          onClick={() => setTravelChoice("overnight")}
                        >
                          Mund te qendroj nje nate ne Gjakove
                        </button>
                      </div>

                      {travelChoice === "return-early" && (
                        <div className="travel-card">
                          <h4>Keshille per shoferet</h4>
                          <p>
                            Nese do te vozisni pas dasmes, ju keshillojme te mos konsumoni me shume
                            se 1-2 gota alkool.
                          </p>
                        </div>
                      )}

                      {travelChoice === "overnight" && (
                        <div className="travel-card">
                          <h4>Kontakte hotelesh me cmime te arsyeshme</h4>
                          <p>
                            Hotel Carshia e Jupave: <a href="tel:+38344000111">+383 44 000 111</a>
                          </p>
                          <p>
                            Hotel La Villa: <a href="tel:+38344000222">+383 44 000 222</a>
                          </p>
                          <p>
                            Hotel Happy: <a href="tel:+38344000333">+383 44 000 333</a>
                          </p>
                          <p>Ju rekomandojme te rezervoni sa me heret per cmime me te favorshme.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </section>

        <footer className="invite-footer">ME SHUME DASHURI DHE ME STANDARDE TE LARTA</footer>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="invite-shell">
          <main className="invite-main">
            <section className="invite-card">
              <p className="invite-context">Duke ngarkuar ftesen tuaj...</p>
            </section>
          </main>
        </div>
      }
    >
      <InviteExperience />
    </Suspense>
  );
}

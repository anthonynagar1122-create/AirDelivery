"use client";

import { FormEvent, useId, useRef, useState, useEffect } from "react";
import { GUARDRAIL_REPLY, routeUtterance } from "@/lib/aira/intent";
import { getSpeechRecognition, type SpeechRecognitionLike } from "@/lib/aira/speech";
import { SarvamVoiceAgent } from "@/lib/aira/sarvam";
import { AgentState } from "sarvam-conv-ai-sdk/browser";

type Turn = { id: number; speaker: "you" | "aira"; text: string };

type Draft = { items: string[]; status: "awaiting-confirmation" | "confirmed" };

const OPENING: Turn = {
  id: 0,
  speaker: "aira",
  text: "Hi, I am Aira. What do you want to order today?",
};

const SARVAM_APP_ID = process.env.NEXT_PUBLIC_SARVAM_APP_ID || "Conversatio-090534dd-d6d8";

export function AiraConsole() {
  const inputId = useId();
  const sarvamAgentRef = useRef<SarvamVoiceAgent | null>(null);
  const [turns, setTurns] = useState<Turn[]>([OPENING]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [voiceAvailable] = useState(() => getSpeechRecognition() !== null);
  const [notice, setNotice] = useState<string | null>(null);
  const [sarvamConnected, setSarvamConnected] = useState(false);
  const [agentState, setAgentState] = useState<AgentState | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (sarvamAgentRef.current) {
        sarvamAgentRef.current.stop().catch(console.error);
      }
    };
  }, []);

  function push(speaker: Turn["speaker"], text: string) {
    setTurns((prev) => [...prev, { id: prev.length, speaker, text }]);
  }

  function submitUtterance(raw: string) {
    const utterance = raw.trim();
    if (!utterance) return;
    push("you", utterance);

    const intent = routeUtterance(utterance);

    if (intent.kind === "order") {
      setDraft({ items: intent.items, status: "awaiting-confirmation" });
      push(
        "aira",
        `Got it: ${intent.items.join(", ")}. I am checking prices with partner shops. ` +
          "I will read you the total before anything is ordered. Shall I confirm?",
      );
      return;
    }

    if (intent.kind === "status") {
      push(
        "aira",
        draft?.status === "confirmed"
          ? "Your order is with us. Live tracking connects in the next release."
          : "I do not see an open order yet. Tell me what you need.",
      );
      return;
    }

    if (intent.kind === "repeat") {
      push("aira", "I cannot find a previous order on this device yet. What do you need?");
      return;
    }

    push("aira", GUARDRAIL_REPLY);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const utterance = input;
    setInput("");
    submitUtterance(utterance);
  }

  async function listen() {
    setNotice(null);
    setListening(true);

    try {
      // Use Sarvam Voice Agent for live voice sessions
      if (SARVAM_APP_ID) {
        const userId = `user-${Date.now()}`;
        const agent = new SarvamVoiceAgent({
          appId: SARVAM_APP_ID,
          userId,
        });

        sarvamAgentRef.current = agent;

        await agent.start({
          onTranscript: (msg) => {
            if (msg.role === "user") {
              push("you", msg.content);
            } else {
              push("aira", msg.content);
            }
          },
          onStateChange: (state) => {
            setAgentState(state);
            setSarvamConnected(state !== AgentState.ERROR && agent.isConnected());
          },
          onError: (error) => {
            setListening(false);
            setNotice(`Voice error: ${error.message}. Try typing instead.`);
            console.error("Sarvam error:", error);
          },
        });

        return;
      }

      // Fallback to browser Web Speech API
      const Recognition = getSpeechRecognition();
      if (!Recognition) {
        setNotice("Voice is not supported in this browser. Type your request instead.");
        setListening(false);
        return;
      }

      const recognition: SpeechRecognitionLike = new Recognition();
      recognition.lang = "en-IN";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const transcript = event.results[0]?.[0]?.transcript ?? "";
        submitUtterance(transcript);
      };
      recognition.onerror = () => {
        setListening(false);
        setNotice("I could not hear that. Check microphone permission, or type instead.");
      };
      recognition.onend = () => setListening(false);

      recognition.start();
    } catch (error) {
      setListening(false);
      setNotice(`Error starting voice: ${error instanceof Error ? error.message : "Unknown error"}. Type instead.`);
      console.error("Voice start error:", error);
    }
  }

  async function stopListening() {
    setListening(false);
    if (sarvamAgentRef.current) {
      await sarvamAgentRef.current.stop();
      sarvamAgentRef.current = null;
      setSarvamConnected(false);
    }
  }

  function confirm() {
    if (!draft || draft.status !== "awaiting-confirmation") return;
    setDraft({ ...draft, status: "confirmed" });
    push("aira", "Done. Your order is confirmed. I will show its status here.");
  }

  return (
    <div className="flex flex-col gap-6">
      <ol
        aria-label="Conversation with Aira"
        aria-live="polite"
        className="flex max-h-[22rem] flex-col gap-3 overflow-y-auto pr-1"
      >
        {turns.map((turn) => (
          <li
            key={turn.id}
            className={
              turn.speaker === "you"
                ? "ml-auto max-w-[85%] rounded-[var(--radius-control)] bg-ink px-4 py-2.5 text-chalk"
                : "max-w-[90%] rounded-[var(--radius-control)] border border-line bg-white px-4 py-2.5"
            }
          >
            <span className="sr-only">{turn.speaker === "you" ? "You: " : "Aira: "}</span>
            {turn.text}
          </li>
        ))}
      </ol>

      {draft && (
        <section
          aria-labelledby="draft-heading"
          className="rounded-[var(--radius-panel)] border-l-4 border-marigold bg-white p-5"
        >
          <h3 id="draft-heading" className="font-display text-xl font-semibold">
            Your order
          </h3>
          <ul className="mt-3 divide-y divide-line">
            {draft.items.map((item) => (
              <li key={item} className="flex justify-between py-2 text-ink-soft">
                <span>{item}</span>
                <span className="text-muted">Price pending</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-muted">
              {draft.status === "confirmed"
                ? "Confirmed. Nothing is charged until delivery."
                : "Nothing is bought until you confirm."}
            </p>
            {draft.status === "awaiting-confirmation" && (
              <button
                type="button"
                onClick={confirm}
                className="min-h-12 shrink-0 rounded-[var(--radius-control)] bg-ink px-5 font-semibold text-chalk transition-colors hover:bg-ink-soft"
              >
                Confirm order
              </button>
            )}
          </div>
        </section>
      )}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <label htmlFor={inputId} className="sr-only">
          Type what you need
        </label>
        <input
          id={inputId}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Or type it: paracetamol and milk"
          autoComplete="off"
          disabled={listening && sarvamConnected}
          className="min-h-12 min-w-0 flex-1 rounded-[var(--radius-control)] border border-line bg-white px-4 text-base placeholder:text-muted focus-visible:border-ink disabled:opacity-60"
        />
        {(voiceAvailable || SARVAM_APP_ID) && (
          <button
            type="button"
            onClick={sarvamConnected && listening ? stopListening : listen}
            disabled={false}
            aria-pressed={listening && sarvamConnected}
            className="relative min-h-12 shrink-0 rounded-[var(--radius-control)] border border-ink px-4 font-semibold text-ink transition-colors hover:bg-chalk-deep disabled:opacity-60"
          >
            {listening && sarvamConnected ? (
              <>
                <span aria-hidden className="aira-ring absolute inset-0 rounded-[var(--radius-control)] border-2 border-marigold" />
                Stop
              </>
            ) : listening ? (
              <>
                <span aria-hidden className="aira-ring absolute inset-0 rounded-[var(--radius-control)] border-2 border-marigold" />
                Listening
              </>
            ) : (
              "Speak"
            )}
          </button>
        )}
        <button
          type="submit"
          disabled={listening && sarvamConnected}
          className="min-h-12 shrink-0 rounded-[var(--radius-control)] bg-ink px-5 font-semibold text-chalk transition-colors hover:bg-ink-soft disabled:opacity-60"
        >
          Send
        </button>
      </form>

      {notice && (
        <p role="status" className="text-sm text-danger">
          {notice}
        </p>
      )}
    </div>
  );
}

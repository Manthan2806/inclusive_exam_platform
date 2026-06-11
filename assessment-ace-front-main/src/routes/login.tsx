import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useExamStore, type DisabilityKey } from "@/store/examStore";
import { EXAM } from "@/lib/examData";
import { speak } from "@/lib/tts";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { ShieldCheck, Mic, Timer, Eye, Brain, Ear, Hand, Users, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login — Inclusive Exam Platform" }] }),
  component: LoginPage,
});

const OPTIONS: { key: DisabilityKey; label: string; desc: string; icon: React.ReactNode }[] = [
  { key: "visual", label: "Visual", desc: "Screen reader, TTS, large text, high contrast • +50% time", icon: <Eye className="h-5 w-5" /> },
  { key: "motor", label: "Motor", desc: "Voice input, large targets • +50% time", icon: <Hand className="h-5 w-5" /> },
  { key: "hearing", label: "Hearing", desc: "Visual alerts instead of audio chimes", icon: <Ear className="h-5 w-5" /> },
  { key: "cognitive", label: "Cognitive", desc: "Simplified language, read-aloud • +100% time", icon: <Brain className="h-5 w-5" /> },
  { key: "multiple", label: "Multiple", desc: "Combined accommodations • +100% time", icon: <Users className="h-5 w-5" /> },
];

function LoginPage() {
  const navigate = useNavigate();
  const setLogin = useExamStore((s) => s.setLogin);
  const reset = useExamStore((s) => s.reset);
  const [name, setName] = useState("");
  const [roll, setRoll] = useState("");
  const [selected, setSelected] = useState<DisabilityKey[]>([]);
  const [activeVoiceField, setActiveVoiceField] = useState<"name" | "roll" | null>(null);
  const { listening, transcript, supported, error, start, stop, reset: resetVoice, setManual } = useVoiceInput();

  useEffect(() => {
    if (activeVoiceField === "name") {
      setName(transcript);
    } else if (activeVoiceField === "roll") {
      setRoll(transcript);
    }
  }, [transcript, activeVoiceField]);

  function toggle(k: DisabilityKey) {
    setSelected((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));
  }

  function startVoice(field: "name" | "roll") {
    setActiveVoiceField(field);
    resetVoice();
    start();
  }

  function stopVoice() {
    stop();
    setActiveVoiceField(null);
  }

  function readAccommodations() {
    const speech = OPTIONS.map((o) => `${o.label}: ${o.desc}`).join(". ");
    speak(speech, 1);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLogin(name.trim() || "Candidate", roll.trim() || "ROLL-0001", selected);
    reset();
    navigate({ to: "/exam/$id", params: { id: EXAM.id } });
  }

  return (
    <AppShell>
      <main id="main" className="mx-auto max-w-3xl px-6 py-10">
        <header className="mb-8 text-center">
          <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <ShieldCheck className="h-4 w-4" aria-hidden /> WCAG 2.2 AA · Accessible by default
          </div>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Inclusive Exam Platform</h1>
          <p className="mt-2 text-muted-foreground">
            An accessible-by-default exam interface for differently-abled candidates.
          </p>
        </header>

        <ul className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3" aria-label="Platform features">
          {[
            { icon: <Mic className="h-4 w-4" aria-hidden />, t: "Voice & AI Scribe" },
            { icon: <Timer className="h-4 w-4" aria-hidden />, t: "Auto-extended time" },
            { icon: <Eye className="h-4 w-4" aria-hidden />, t: "Screen-reader ready" },
          ].map((f) => (
            <li key={f.t} className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm">
              <span className="text-primary">{f.icon}</span>
              {f.t}
            </li>
          ))}
        </ul>

        <form onSubmit={onSubmit} className="rounded-xl border bg-card p-6 shadow-sm" aria-label="Candidate login">
          <h2 className="text-xl font-semibold">Candidate details</h2>
          <p className="mt-1 text-sm text-muted-foreground">Your profile auto-configures the exam.</p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium">Full name</label>
              <div className="flex items-center gap-2">
                <input
                  id="name"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (activeVoiceField === "name") setManual(e.target.value);
                  }}
                  autoComplete="name"
                  className="h-11 w-full rounded-md border bg-background px-3"
                />
                <button
                  type="button"
                  onClick={() => (activeVoiceField === "name" && listening ? stopVoice() : startVoice("name"))}
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-md border ${activeVoiceField === "name" && listening ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"}`}
                  aria-pressed={activeVoiceField === "name" && listening}
                  aria-label={activeVoiceField === "name" && listening ? "Stop voice input for name" : "Start voice input for name"}
                >
                  <Mic className="h-5 w-5" aria-hidden />
                </button>
              </div>
              {activeVoiceField === "name" && listening && (
                <p className="mt-2 text-xs text-destructive">Listening for name…</p>
              )}
            </div>
            <div>
              <label htmlFor="roll" className="mb-1 block text-sm font-medium">Roll number</label>
              <div className="flex items-center gap-2">
                <input
                  id="roll"
                  required
                  value={roll}
                  onChange={(e) => {
                    setRoll(e.target.value);
                    if (activeVoiceField === "roll") setManual(e.target.value);
                  }}
                  className="h-11 w-full rounded-md border bg-background px-3"
                />
                <button
                  type="button"
                  onClick={() => (activeVoiceField === "roll" && listening ? stopVoice() : startVoice("roll"))}
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-md border ${activeVoiceField === "roll" && listening ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"}`}
                  aria-pressed={activeVoiceField === "roll" && listening}
                  aria-label={activeVoiceField === "roll" && listening ? "Stop voice input for roll number" : "Start voice input for roll number"}
                >
                  <Mic className="h-5 w-5" aria-hidden />
                </button>
              </div>
              {activeVoiceField === "roll" && listening && (
                <p className="mt-2 text-xs text-destructive">Listening for roll number…</p>
              )}
            </div>
          </div>
          {(!supported || error) && (
            <div className="mt-3 rounded-lg border border-amber-300/70 bg-amber-50 p-3 text-sm text-amber-900">
              {!supported ? (
                <p>Voice input is not supported in this browser.</p>
              ) : (
                <p>Error with voice input: {error}</p>
              )}
            </div>
          )}

          <fieldset className="mt-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <legend className="mb-2 text-sm font-medium">Disability profile (select all that apply)</legend>
              <Button type="button" variant="outline" size="sm" className="h-9" onClick={readAccommodations}>
                <Mic className="h-4 w-4" /> Read options
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {OPTIONS.map((o) => {
                const checked = selected.includes(o.key);
                return (
                  <label
                    key={o.key}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${checked ? "border-primary bg-primary/5 ring-2 ring-primary/40" : "hover:bg-accent"}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(o.key)}
                      className="mt-1 h-5 w-5"
                      aria-describedby={`desc-${o.key}`}
                    />
                    <span className="flex-1">
                      <span className="flex items-center gap-2 font-medium">
                        <span className="text-primary" aria-hidden>{o.icon}</span>
                        {o.label}
                      </span>
                      <span id={`desc-${o.key}`} className="mt-1 block text-xs text-muted-foreground">
                        {o.desc}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Leave blank if no accommodations are needed — standard exam time will apply.
            </p>
          </fieldset>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <Link to="/admin" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
              Invigilator dashboard →
            </Link>
            <Button type="submit" size="lg" className="h-12 min-w-[180px]">
              Begin exam <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </main>
    </AppShell>
  );
}

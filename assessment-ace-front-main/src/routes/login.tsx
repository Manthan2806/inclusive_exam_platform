import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useExamStore, type DisabilityKey } from "@/store/examStore";
import { startExamSession } from "@/lib/api";
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
  const setExam = useExamStore((s) => s.setExam);
  const setTimeMultiplier = useExamStore((s) => s.setTimeMultiplier);
  const reset = useExamStore((s) => s.reset);
  const [name, setName] = useState("");
  const [roll, setRoll] = useState("");
  const [selected, setSelected] = useState<DisabilityKey[]>([]);
  const [rollError, setRollError] = useState("");
  const [formError, setFormError] = useState("");
  const [starting, setStarting] = useState(false);

  function toggle(k: DisabilityKey) {
    setSelected((s) => (s.includes(k) ? s.filter((x) => x !== k) : [...s, k]));
  }

  function validateRoll(value: string) {
    if (/[^0-9]/.test(value)) {
      setRollError("Enter numeric data");
      return false;
    }
    if (value.length !== 6) {
      setRollError("Roll number must be exactly 6 digits.");
      return false;
    }
    setRollError("");
    return true;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedRoll = roll.trim();
    if (!validateRoll(trimmedRoll)) return;

    setStarting(true);
    setFormError("");

    try {
      const candidateName = name.trim() || "Candidate";
      const response = await startExamSession({
        name: candidateName,
        rollNo: trimmedRoll,
        disabilities: selected,
      });

      setLogin(candidateName, trimmedRoll, selected);
      setExam(response.exam);
      setTimeMultiplier(response.student.timeMultiplier);
      reset();
      navigate({ to: "/exam/$id", params: { id: response.exam.id } });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not start exam.");
    } finally {
      setStarting(false);
    }
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
              <input
                id="name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                className="h-11 w-full rounded-md border bg-background px-3"
              />
            </div>
            <div>
              <label htmlFor="roll" className="mb-1 block text-sm font-medium">Roll number</label>
              <input
                id="roll"
                required
                placeholder="Enter 6 digits"
                inputMode="numeric"
                pattern="[0-9]*"
                value={roll}
                onChange={(e) => {
                  const value = e.target.value;
                  setRoll(value);
                  validateRoll(value.trim());
                }}
                onBlur={() => {
                  validateRoll(roll.trim());
                }}
                className="h-11 w-full rounded-md border bg-background px-3"
              />
              {rollError ? (
                <p className="mt-2 text-sm text-destructive" role="alert">
                  {rollError}
                </p>
              ) : null}
            </div>
          </div>

          <fieldset className="mt-6">
            <legend className="mb-2 text-sm font-medium">Disability profile (select all that apply)</legend>
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
            {formError ? (
              <p className="basis-full text-sm text-destructive" role="alert">
                {formError}
              </p>
            ) : null}
            <Link to="/admin" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
              Invigilator dashboard →
            </Link>
            <Button
              type="submit"
              size="lg"
              className="h-12 min-w-[180px]"
              disabled={starting || !/^[0-9]{6}$/.test(roll.trim())}
            >
              {starting ? "Loading exam..." : "Begin exam"} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </main>
    </AppShell>
  );
}

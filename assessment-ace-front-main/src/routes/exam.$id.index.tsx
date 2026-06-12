import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useExamStore } from "@/store/examStore";
import { EXAM } from "@/lib/examData";
import { speak, stopSpeaking } from "@/lib/tts";
import { cleanupVoiceTranscript } from "@/lib/claudeAPI"; // ✅ Hooked up to real API
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { toast } from "sonner"; // ✅ Added for error handling
import {
  ChevronLeft, ChevronRight, Flag, Mic, MicOff, Pencil, Sparkles,
  Volume2, VolumeX, Languages, ListChecks, Clock, AlertTriangle, Check, RotateCcw,
} from "lucide-react";

export const Route = createFileRoute("/exam/$id/")({
  head: () => ({ meta: [{ title: "Exam — Inclusive Exam Platform" }] }),
  component: ExamPage,
});

type Mode = "type" | "speak" | "scribe";

function ExamPage() {
  const navigate = useNavigate();
  const { id } = Route.useParams();
  const { name, config, prefs, answers, currentIndex, startedAt } = useExamStore();
  const setAnswer = useExamStore((s) => s.setAnswer);
  const toggleFlag = useExamStore((s) => s.toggleFlag);
  const setCurrent = useExamStore((s) => s.setCurrent);
  const startExam = useExamStore((s) => s.startExam);

  useEffect(() => {
    if (!name) navigate({ to: "/login" });
  }, [name, navigate]);

  useEffect(() => {
    startExam();
  }, [startExam]);

  const totalMs = Math.round(EXAM.durationMinutes * 60 * 1000 * config.timeMultiplier);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const remaining = Math.max(0, (startedAt ?? now) + totalMs - now);
  const mins = Math.floor(remaining / 60000);
  const secs = Math.floor((remaining % 60000) / 1000);
  const pulse = remaining > 0 && remaining <= 10 * 60 * 1000;
  const critical = remaining > 0 && remaining <= 5 * 60 * 1000;

  const chimedRef = useRef(false);
  useEffect(() => {
    if (critical && !chimedRef.current) {
      chimedRef.current = true;
      if (!prefs.muteChime && typeof window !== "undefined" && window.speechSynthesis) {
        speak("Five minutes remaining.", prefs.ttsRate);
      }
    }
    if (remaining === 0 && startedAt) {
      navigate({ to: "/confirmation" });
    }
  }, [critical, remaining, startedAt, prefs, id, navigate]);

  const q = EXAM.questions[currentIndex];
  const total = EXAM.questions.length;

  const [mode, setMode] = useState<Mode>(config.voiceInput ? "speak" : "type");
  const [showSimple, setShowSimple] = useState(config.simplifiedLanguage);
  const [scribeOpen, setScribeOpen] = useState(false);
  const [scribePreview, setScribePreview] = useState({ raw: "", cleaned: "" });

  const answerText = answers[q.id]?.text ?? "";
  const flagged = answers[q.id]?.flagged ?? false;

  useEffect(() => {
    // Announce question change to screen readers
    const el = document.getElementById("question-live");
    if (el) el.textContent = `Question ${currentIndex + 1} of ${total}.`;
  }, [currentIndex, total]);

  const minTouch = config.largeTargets ? "h-14 min-w-14" : "h-12 min-w-12";

  return (
    <AppShell>
      <a id="main" />
      <div className="mx-auto max-w-7xl px-4 py-4 md:px-6">
        {/* Top bar */}
        <header className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{EXAM.title}</p>
            <p className="text-sm">
              <span className="font-medium">{name || "Candidate"}</span>
              {config.timeMultiplier > 1 && (
                <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  +{Math.round((config.timeMultiplier - 1) * 100)}% time
                </span>
              )}
            </p>
          </div>
          <div
            role="timer"
            aria-live="off"
            aria-label={`Time remaining ${mins} minutes ${secs} seconds`}
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-2xl font-bold tabular-nums ${critical ? "border-destructive text-destructive" : pulse ? "border-amber-500 text-amber-600" : ""} ${pulse && !prefs.muteChime ? "animate-pulse" : ""}`}
          >
            <Clock className="h-5 w-5" aria-hidden />
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </div>
        </header>

        <div className="grid gap-6 py-6 md:grid-cols-[1fr_280px]">
          <section aria-label="Question and answer" className="min-w-0">
            <p id="question-live" aria-live="polite" className="sr-only" />

            <article className="rounded-xl border bg-card p-6 shadow-sm" style={{ maxWidth: 720 }}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h1 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Question {currentIndex + 1} of {total}
                </h1>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => speak(showSimple ? q.simplified : q.prompt, prefs.ttsRate)}
                    aria-label="Read question aloud"
                  >
                    <Volume2 className="h-4 w-4" /> Read aloud
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={stopSpeaking} aria-label="Stop reading">
                    <VolumeX className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant={showSimple ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowSimple((s) => !s)}
                    aria-pressed={showSimple}
                  >
                    <Languages className="h-4 w-4" /> {showSimple ? "Original" : "Simplify"}
                  </Button>
                </div>
              </div>

              <p className="text-foreground">{q.prompt}</p>
              {showSimple && (
                <div className="mt-4 rounded-lg border-l-4 border-primary bg-primary/5 p-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">Simplified</p>
                  <p>{q.simplified}</p>
                </div>
              )}

              <div className="mt-6">
                <div role="tablist" aria-label="Answer input mode" className="inline-flex rounded-lg border bg-background p-1">
                  {(["type", "speak", "scribe"] as Mode[]).map((m) => (
                    <button
                      key={m}
                      role="tab"
                      aria-selected={mode === m}
                      type="button"
                      onClick={() => setMode(m)}
                      className={`rounded-md px-4 py-2 text-sm font-medium capitalize ${mode === m ? "bg-primary text-primary-foreground" : "hover:bg-accent"}`}
                    >
                      {m === "scribe" ? "AI Scribe" : m}
                    </button>
                  ))}
                </div>

                <div className="mt-4">
                  {mode === "type" && (
                    <TypeArea value={answerText} onChange={(v) => setAnswer(q.id, v)} />
                  )}
                  {mode === "speak" && (
                    <SpeakArea
                      value={answerText}
                      onChange={(v) => setAnswer(q.id, v)}
                      largeTargets={config.largeTargets}
                    />
                  )}
                  {mode === "scribe" && (
                    <ScribeArea
                      value={answerText}
                      onResult={(raw, cleaned) => {
                        setScribePreview({ raw, cleaned });
                        setScribeOpen(true);
                      }}
                    />
                  )}
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  Words: {answerText.trim() ? answerText.trim().split(/\s+/).length : 0}
                </p>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrent(Math.max(0, currentIndex - 1))}
                  disabled={currentIndex === 0}
                  className={minTouch}
                >
                  <ChevronLeft className="h-5 w-5" /> Previous
                </Button>
                <Button
                  type="button"
                  variant={flagged ? "default" : "outline"}
                  onClick={() => toggleFlag(q.id)}
                  aria-pressed={flagged}
                  className={minTouch}
                >
                  <Flag className="h-5 w-5" /> {flagged ? "Flagged" : "Flag for review"}
                </Button>
                {currentIndex < total - 1 ? (
                  <Button
                    type="button"
                    onClick={() => setCurrent(Math.min(total - 1, currentIndex + 1))}
                    className={minTouch}
                  >
                    Next <ChevronRight className="h-5 w-5" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={() => navigate({ to: "/exam/$id/review", params: { id } })}
                    className={minTouch}
                  >
                    <ListChecks className="h-5 w-5" /> Review & submit
                  </Button>
                )}
              </div>
            </article>
          </section>

          <aside aria-label="Question palette" className="md:sticky md:top-4 md:self-start">
            <div className="rounded-xl border bg-card p-4">
              <h2 className="mb-3 text-sm font-semibold">Question palette</h2>
              <div className="grid grid-cols-5 gap-2">
                {EXAM.questions.map((qq, i) => {
                  const a = answers[qq.id];
                  const isAnswered = !!a?.text?.trim();
                  const isFlagged = !!a?.flagged;
                  const isCurrent = i === currentIndex;
                  return (
                    <button
                      key={qq.id}
                      type="button"
                      onClick={() => setCurrent(i)}
                      aria-current={isCurrent ? "true" : undefined}
                      aria-label={`Go to question ${i + 1}${isAnswered ? ", answered" : ", not answered"}${isFlagged ? ", flagged" : ""}`}
                      className={`relative h-11 rounded-md border text-sm font-medium ${isCurrent ? "ring-2 ring-primary" : ""} ${isAnswered ? "bg-primary text-primary-foreground" : "bg-background hover:bg-accent"}`}
                    >
                      {i + 1}
                      {isFlagged && <Flag className="absolute -right-1 -top-1 h-3.5 w-3.5 text-amber-500" aria-hidden />}
                    </button>
                  );
                })}
              </div>
              <Legend />
              <div className="mt-4">
                <Link
                  to="/exam/$id/review"
                  params={{ id }}
                  className="block rounded-md bg-primary px-4 py-3 text-center font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Go to review
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {scribeOpen && (
        <ScribeModal
          raw={scribePreview.raw}
          cleaned={scribePreview.cleaned}
          onUse={() => {
            const existing = answers[q.id]?.text ?? "";
            const joined = existing ? existing.trim() + " " + scribePreview.cleaned : scribePreview.cleaned;
            setAnswer(q.id, joined);
            setScribeOpen(false);
          }}
          onCancel={() => setScribeOpen(false)}
        />
      )}
    </AppShell>
  );
}

function Legend() {
  return (
    <ul className="mt-4 space-y-1 text-xs text-muted-foreground">
      <li className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded bg-primary" /> Answered</li>
      <li className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded border bg-background" /> Not answered</li>
      <li className="flex items-center gap-2"><Flag className="h-3 w-3 text-amber-500" aria-hidden /> Flagged</li>
    </ul>
  );
}

function TypeArea({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  }, [value]);
  return (
    <div>
      <label htmlFor="ans" className="sr-only">Your answer</label>
      <textarea
        id="ans"
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your answer here…"
        rows={6}
        className="w-full resize-none rounded-lg border bg-background p-4 leading-relaxed shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  );
}

function SpeakArea({
  value, onChange, largeTargets,
}: { value: string; onChange: (v: string) => void; largeTargets: boolean }) {
  const { listening, transcript, supported, error, start, stop, reset, setManual } = useVoiceInput();

  useEffect(() => {
    if (transcript) onChange(transcript);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript]);

  if (!supported) {
    return (
      <div className="rounded-lg border border-amber-500/40 bg-amber-50 p-4 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
        <p className="mb-2 flex items-center gap-2 font-medium"><AlertTriangle className="h-4 w-4" /> Voice input not supported in this browser.</p>
        <TypeArea value={value} onChange={onChange} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-pressed={listening}
          aria-label={listening ? "Stop recording" : "Start recording"}
          onClick={() => (listening ? stop() : start())}
          className={`relative inline-flex items-center justify-center rounded-full ${largeTargets ? "h-20 w-20" : "h-16 w-16"} ${listening ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"} shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring`}
        >
          {listening && <span className="absolute inset-0 animate-ping rounded-full bg-destructive/40" aria-hidden />}
          {listening ? <MicOff className="h-7 w-7" /> : <Mic className="h-7 w-7" />}
        </button>
        <div role="status" aria-live="polite" className="text-sm">
          {listening ? (
            <span className="font-medium text-destructive">● Listening…</span>
          ) : (
            <span className="text-muted-foreground">Press the mic and speak. Press again to stop.</span>
          )}
          {error && <p className="mt-1 text-xs text-destructive">Error: {error}</p>}
        </div>
        <div className="ml-auto flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => { reset(); onChange(""); }}>
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
        </div>
      </div>
      <label htmlFor="speak-ans" className="block text-xs font-medium text-muted-foreground">
        Live transcript (editable)
      </label>
      <textarea
        id="speak-ans"
        value={value}
        onChange={(e) => { setManual(e.target.value); onChange(e.target.value); }}
        rows={6}
        placeholder="Your spoken words will appear here…"
        className="w-full resize-y rounded-lg border bg-background p-4 leading-relaxed shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  );
}

// ✅ UPDATED ScribeArea using Real AI Proxy
function ScribeArea({
  value, onResult,
}: { value: string; onResult: (raw: string, cleaned: string) => void }) {
  const { listening, transcript, supported, start, stop, reset } = useVoiceInput();
  const [processing, setProcessing] = useState(false);

  async function finish() {
    if (!transcript.trim()) return;
    
    stop(); // Stop the microphone
    setProcessing(true); // Spin up the loader

    try {
      // ✅ Call your secure local backend to talk to Claude!
      const cleaned = await cleanupVoiceTranscript(transcript);
      onResult(transcript, cleaned);
    } catch (err) {
      console.error("AI Proxy Error:", err);
      toast.error("AI Scribe connection failed. Falling back to your raw text.");
      
      // Fallback: Pass the raw text as both the raw and cleaned so nothing is lost
      onResult(transcript, transcript);
    } finally {
      setProcessing(false);
      reset(); // Clear the mic buffer for the next attempt
    }
  }

  if (!supported) {
    return (
      <div className="rounded-lg border border-amber-500/40 bg-amber-50 p-4 text-sm text-amber-900">
        AI Scribe requires browser speech recognition. Please use the Type mode.
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border bg-gradient-to-b from-primary/5 to-transparent p-4">
      <div className="flex items-center gap-2 text-sm">
        <Sparkles className="h-4 w-4 text-primary" aria-hidden />
        <span className="font-medium">AI Scribe</span>
        <span className="text-muted-foreground">— speak naturally, we'll clean it up. You always confirm before saving.</span>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => (listening ? finish() : start())}
          aria-pressed={listening}
          className={`relative inline-flex h-16 w-16 items-center justify-center rounded-full ${listening ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"} shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring`}
          aria-label={listening ? "Stop and clean up" : "Start dictation"}
        >
          {listening && <span className="absolute inset-0 animate-ping rounded-full bg-destructive/40" aria-hidden />}
          {listening ? <Check className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </button>
        <div className="text-sm" role="status" aria-live="polite">
          {processing ? <span>Cleaning up with Claude…</span> : listening ? <span className="font-medium text-destructive">Listening — press to finish</span> : <span className="text-muted-foreground">Press to start dictating</span>}
        </div>
      </div>
      {transcript && (
        <div className="rounded-md bg-background p-3 text-sm">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Raw transcript</p>
          <p className="italic">{transcript}</p>
        </div>
      )}
      {value && (
        <div className="rounded-md border bg-background p-3 text-sm">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Saved cleaned answer</p>
          <p>{value}</p>
        </div>
      )}
    </div>
  );
}

function ScribeModal({
  raw, cleaned, onUse, onCancel,
}: { raw: string; cleaned: string; onUse: () => void; onCancel: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="scribe-title"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
      onKeyDown={(e) => e.key === "Escape" && onCancel()}
    >
      <div className="w-full max-w-2xl rounded-xl bg-card p-6 shadow-2xl">
        <h2 id="scribe-title" className="flex items-center gap-2 text-lg font-semibold">
          <Sparkles className="h-5 w-5 text-primary" aria-hidden /> Confirm AI-cleaned answer
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The AI rewrites your speech for clarity. It does not add information. You decide whether to use it.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <section className="rounded-lg border bg-background p-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your spoken answer</h3>
            <p className="text-sm italic">"{raw}"</p>
          </section>
          <section className="rounded-lg border border-primary/40 bg-primary/5 p-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">Cleaned answer</h3>
            <p className="text-sm">{cleaned}</p>
          </section>
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={onCancel}><Pencil className="h-4 w-4" /> Re-record</Button>
          <Button onClick={onUse}><Check className="h-4 w-4" /> Use this answer</Button>
        </div>
      </div>
    </div>
  );
}
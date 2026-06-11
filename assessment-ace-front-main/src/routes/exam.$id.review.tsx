import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useExamStore } from "@/store/examStore";
import { EXAM } from "@/lib/examData";
import { speak } from "@/lib/tts";
import { cleanupTranscript } from "@/lib/aiScribe";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { ArrowLeft, CheckCircle2, Circle, Flag, Mic, MicOff } from "lucide-react";

export const Route = createFileRoute("/exam/$id/review")({
  head: () => ({ meta: [{ title: "Review answers — Inclusive Exam Platform" }] }),
  component: ReviewPage,
});

function ReviewPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { answers, name } = useExamStore();
  const setCurrent = useExamStore((s) => s.setCurrent);
  const setAnswer = useExamStore((s) => s.setAnswer);

  const [reScribeQuestionId, setReScribeQuestionId] = useState<number | null>(null);
  const [reScribeTranscript, setReScribeTranscript] = useState("");
  const [reScribeCleaned, setReScribeCleaned] = useState("");
  const [reScribeProcessing, setReScribeProcessing] = useState(false);

  const { listening, transcript, supported, error, start, stop, reset, setManual } = useVoiceInput();

  useEffect(() => {
    if (reScribeQuestionId !== null) {
      setReScribeTranscript(transcript);
    }
  }, [transcript, reScribeQuestionId]);

  const answered = EXAM.questions.filter((q) => answers[q.id]?.text?.trim()).length;
  const flagged = EXAM.questions.filter((q) => answers[q.id]?.flagged).length;
  const total = EXAM.questions.length;

  function submit() {
    navigate({ to: "/confirmation" });
  }

  function openReScribeModal(questionId: number) {
    setReScribeQuestionId(questionId);
    setReScribeTranscript("");
    setReScribeCleaned("");
    reset();
    start();
  }

  function closeReScribeModal() {
    stop();
    setReScribeQuestionId(null);
    setReScribeTranscript("");
    setReScribeCleaned("");
  }

  async function cleanReScribe() {
    if (!reScribeTranscript.trim()) return;
    setReScribeProcessing(true);
    try {
      const cleaned = await cleanupTranscript(reScribeTranscript);
      setReScribeCleaned(cleaned);
    } catch (err) {
      console.warn("AI scribe failed", err);
    } finally {
      setReScribeProcessing(false);
    }
  }

  function applyReScribe() {
    if (reScribeQuestionId === null || !reScribeCleaned.trim()) return;
    setAnswer(reScribeQuestionId, reScribeCleaned.trim());
    closeReScribeModal();
  }

  return (
    <AppShell>
      <main id="main" className="mx-auto max-w-4xl px-4 py-8 md:px-6">
        <Link
          to="/exam/$id"
          params={{ id }}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to exam
        </Link>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">Review your answers</h1>
        <p className="mt-1 text-muted-foreground">
          {name ? `${name}, please` : "Please"} verify your responses before final submission.
        </p>

        <div className="mt-6 grid grid-cols-3 gap-4">
          <Stat label="Answered" value={`${answered} / ${total}`} tone="primary" />
          <Stat label="Not answered" value={`${total - answered}`} tone="muted" />
          <Stat label="Flagged" value={`${flagged}`} tone="warning" />
        </div>

        <ol className="mt-6 space-y-3">
          {EXAM.questions.map((q, i) => {
            const a = answers[q.id];
            const has = !!a?.text?.trim();
            return (
              <li key={q.id} className="rounded-xl border bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {has ? (
                      <CheckCircle2 className="mt-1 h-5 w-5 text-primary" aria-hidden />
                    ) : (
                      <Circle className="mt-1 h-5 w-5 text-muted-foreground" aria-hidden />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Question {i + 1}{a?.flagged && (
                          <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                            <Flag className="h-3 w-3" aria-hidden /> Flagged
                          </span>
                        )}
                      </p>
                      <p className="mt-1 font-medium">{q.prompt}</p>
                      <p className={`mt-2 whitespace-pre-wrap ${has ? "" : "italic text-muted-foreground"}`}>
                        {has ? a!.text : "No answer provided."}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => speak(`${q.prompt}. Answer: ${a?.text ?? "No answer provided."}`)}
                    >
                      Read aloud
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openReScribeModal(q.id)}
                      disabled={!has}
                    >
                      Re-scribe
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCurrent(i);
                        navigate({ to: "/exam/$id", params: { id } });
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <div className="sticky bottom-0 mt-8 -mx-4 border-t bg-background/95 px-4 py-4 backdrop-blur md:-mx-6 md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Once submitted you will not be able to modify your answers.
            </p>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link to="/exam/$id" params={{ id }}>Keep editing</Link>
              </Button>
              <Button onClick={submit} size="lg" className="h-12 min-w-[180px]">
                Submit final answers
              </Button>
            </div>
          </div>
        </div>
      </main>
      {reScribeQuestionId !== null && (
        <ReScribeModal
          question={EXAM.questions.find((q) => q.id === reScribeQuestionId)!}
          originalAnswer={answers[reScribeQuestionId]?.text ?? ""}
          transcript={reScribeTranscript}
          cleaned={reScribeCleaned}
          listening={listening}
          supported={supported}
          error={error}
          processing={reScribeProcessing}
          onStart={() => start()}
          onStop={() => stop()}
          onTranscriptChange={(value) => {
            setManual(value);
            setReScribeTranscript(value);
          }}
          onRequestClean={cleanReScribe}
          onApply={applyReScribe}
          onCancel={closeReScribeModal}
        />
      )}
    </AppShell>
  );
}

function ReScribeModal({
  question,
  originalAnswer,
  transcript,
  cleaned,
  listening,
  supported,
  error,
  processing,
  onStart,
  onStop,
  onTranscriptChange,
  onRequestClean,
  onApply,
  onCancel,
}: {
  question: (typeof EXAM.questions)[number];
  originalAnswer: string;
  transcript: string;
  cleaned: string;
  listening: boolean;
  supported: boolean;
  error: string | null;
  processing: boolean;
  onStart: () => void;
  onStop: () => void;
  onTranscriptChange: (value: string) => void;
  onRequestClean: () => Promise<void>;
  onApply: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="rescribe-title"
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
      onKeyDown={(e) => e.key === "Escape" && onCancel()}
    >
      <div className="w-full max-w-3xl rounded-xl bg-card p-6 shadow-2xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 id="rescribe-title" className="text-xl font-semibold">Improve answer with AI scribe</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Speak again and let the AI clean your answer. The original answer stays visible until you confirm.
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
          <section className="rounded-xl border bg-background p-4">
            <h3 className="mb-2 text-sm font-semibold">Original answer</h3>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{originalAnswer || "No answer provided."}</p>
          </section>
          <section className="rounded-xl border bg-background p-4">
            <h3 className="mb-2 text-sm font-semibold">Your updated transcript</h3>
            {!supported ? (
              <p className="text-sm text-amber-700">Voice input is not supported in this browser.</p>
            ) : (
              <>
                <div className="mb-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={listening ? onStop : onStart}
                    className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm ${listening ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"}`}
                  >
                    {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    {listening ? "Stop recording" : "Start recording"}
                  </button>
                  {listening && <span className="text-sm text-muted-foreground">Listening...</span>}
                </div>
                <textarea
                  value={transcript}
                  onChange={(e) => onTranscriptChange(e.target.value)}
                  rows={5}
                  className="w-full resize-none rounded-md border bg-background p-3 text-sm"
                  placeholder="Speak your improved answer here…"
                />
                {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
              </>
            )}
          </section>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" onClick={onRequestClean} disabled={processing || !transcript.trim()}>
            {processing ? "Cleaning…" : "Clean with AI"}
          </Button>
          <Button type="button" onClick={onApply} disabled={!cleaned.trim()}>
            Use cleaned answer
          </Button>
        </div>

        {cleaned && (
          <section className="mt-4 rounded-xl border bg-primary/5 p-4">
            <h3 className="mb-2 text-sm font-semibold text-primary">Cleaned answer preview</h3>
            <p className="whitespace-pre-wrap text-sm">{cleaned}</p>
          </section>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "primary" | "muted" | "warning" }) {
  const cls =
    tone === "primary"
      ? "border-primary/30 bg-primary/5"
      : tone === "warning"
        ? "border-amber-500/40 bg-amber-50 dark:bg-amber-950/20"
        : "border-border bg-muted/40";
  return (
    <div className={`rounded-xl border p-4 ${cls}`}>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

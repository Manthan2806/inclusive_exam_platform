import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useExamStore } from "@/store/examStore";
import { EXAM } from "@/lib/examData";
import { ArrowLeft, CheckCircle2, Circle, Flag } from "lucide-react";

export const Route = createFileRoute("/exam/$id/review")({
  head: () => ({ meta: [{ title: "Review answers — Inclusive Exam Platform" }] }),
  component: ReviewPage,
});

function ReviewPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { answers, name } = useExamStore();
  const setCurrent = useExamStore((s) => s.setCurrent);

  const answered = EXAM.questions.filter((q) => answers[q.id]?.text?.trim()).length;
  const flagged = EXAM.questions.filter((q) => answers[q.id]?.flagged).length;
  const total = EXAM.questions.length;

  function submit() {
    navigate({ to: "/confirmation" });
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
    </AppShell>
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

import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useExamStore } from "@/store/examStore";
import { EXAM } from "@/lib/examData";
import { CheckCircle2, Home } from "lucide-react";

export const Route = createFileRoute("/confirmation")({
  head: () => ({ meta: [{ title: "Submitted — Inclusive Exam Platform" }] }),
  component: ConfirmationPage,
});

function ConfirmationPage() {
  const { name, rollNo, answers, exam: storedExam } = useExamStore();
  const reset = useExamStore((s) => s.reset);
  const exam = storedExam ?? EXAM;
  const refNo = `INC-${Date.now().toString().slice(-8)}`;
  const answered = exam.questions.filter((q) => answers[q.id]?.text?.trim()).length;

  return (
    <AppShell>
      <main id="main" className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 py-12 text-center">
        <div className="mx-auto mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="h-12 w-12" aria-hidden />
        </div>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Submission received</h1>
        <p className="mt-2 text-muted-foreground">
          Thank you{name ? `, ${name}` : ""}. Your responses have been securely recorded.
        </p>

        <dl className="mt-8 grid w-full gap-3 rounded-xl border bg-card p-6 text-left sm:grid-cols-2">
          <Row label="Candidate" value={name || "—"} />
          <Row label="Roll number" value={rollNo || "—"} />
          <Row label="Reference ID" value={refNo} />
          <Row label="Questions answered" value={`${answered} / ${exam.questions.length}`} />
        </dl>

        <p className="mt-6 text-sm text-muted-foreground">
          Please save your reference ID for any future correspondence.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild variant="outline">
            <Link to="/login" onClick={() => reset()}><Home className="h-4 w-4" /> Back to start</Link>
          </Button>
        </div>
      </main>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Activity, Users, Clock, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Invigilator dashboard" }] }),
  component: AdminPage,
});

const CANDIDATES = [
  { id: "C-001", name: "Aarav Sharma", profile: "Visual", status: "In progress", timer: "42:18", multiplier: "1.5x" },
  { id: "C-002", name: "Diya Patel", profile: "Cognitive", status: "In progress", timer: "1:02:11", multiplier: "2.0x" },
  { id: "C-003", name: "Rohan Iyer", profile: "Motor", status: "Submitted", timer: "—", multiplier: "1.5x" },
  { id: "C-004", name: "Meera Gupta", profile: "General", status: "In progress", timer: "21:44", multiplier: "1.0x" },
  { id: "C-005", name: "Kabir Nair", profile: "Hearing", status: "In progress", timer: "29:01", multiplier: "1.0x" },
];

function AdminPage() {
  return (
    <AppShell>
      <main id="main" className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Invigilator</p>
            <h1 className="text-3xl font-bold tracking-tight">Live exam dashboard</h1>
          </div>
          <Link to="/login" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
            ← Candidate view
          </Link>
        </div>

        <section aria-label="Summary" className="grid gap-3 sm:grid-cols-4">
          <KPI icon={<Users className="h-4 w-4" />} label="Candidates" value="5" />
          <KPI icon={<Activity className="h-4 w-4" />} label="In progress" value="4" />
          <KPI icon={<Clock className="h-4 w-4" />} label="Avg. time used" value="38m" />
          <KPI icon={<ShieldCheck className="h-4 w-4" />} label="Accommodated" value="4 / 5" />
        </section>

        <section className="mt-6 overflow-hidden rounded-xl border bg-card">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Candidate exam status</caption>
            <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3">ID</th>
                <th scope="col" className="px-4 py-3">Candidate</th>
                <th scope="col" className="px-4 py-3">Profile</th>
                <th scope="col" className="px-4 py-3">Multiplier</th>
                <th scope="col" className="px-4 py-3">Time used</th>
                <th scope="col" className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {CANDIDATES.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="px-4 py-3 font-mono text-xs">{c.id}</td>
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3">{c.profile}</td>
                  <td className="px-4 py-3 tabular-nums">{c.multiplier}</td>
                  <td className="px-4 py-3 tabular-nums">{c.timer}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${c.status === "Submitted" ? "bg-primary/10 text-primary" : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"}`}
                    >
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <p className="mt-4 text-xs text-muted-foreground">
          All time extensions are automatic, based on each candidate's registered profile. No manual override is required.
        </p>
      </main>
    </AppShell>
  );
}

function KPI({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <span className="text-primary" aria-hidden>{icon}</span>
        {label}
      </div>
      <p className="mt-2 text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

import { useExamStore, type FontFamily, type LineSpacing, type ThemeMode } from "@/store/examStore";
import { Settings2, Type, Palette, AlignJustify, Gauge, X } from "lucide-react";
import { useState } from "react";

export function AccessibilityToolbar() {
  const prefs = useExamStore((s) => s.prefs);
  const setPrefs = useExamStore((s) => s.setPrefs);
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close accessibility settings" : "Open accessibility settings"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-2 ring-background hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring"
      >
        {open ? <X className="h-6 w-6" /> : <Settings2 className="h-6 w-6" />}
      </button>

      {open && (
        <aside
          role="dialog"
          aria-label="Accessibility settings"
          className="fixed bottom-24 right-6 z-50 w-[min(92vw,360px)] rounded-xl border bg-card p-5 shadow-2xl"
        >
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold">
            <Settings2 className="h-4 w-4" aria-hidden /> Accessibility
          </h2>

          <Section icon={<Type className="h-4 w-4" aria-hidden />} label={`Font size — ${prefs.fontPx}px`}>
            <input
              type="range"
              min={16}
              max={28}
              step={1}
              value={prefs.fontPx}
              onChange={(e) => setPrefs({ fontPx: Number(e.target.value) })}
              aria-label="Font size in pixels"
              className="w-full"
            />
          </Section>

          <Section label="Font family">
            <select
              value={prefs.fontFamily}
              onChange={(e) => setPrefs({ fontFamily: e.target.value as FontFamily })}
              className="w-full rounded-md border bg-background px-3 py-2"
              aria-label="Font family"
            >
              <option value="default">Default (System Sans)</option>
              <option value="dyslexic">OpenDyslexic</option>
              <option value="atkinson">Atkinson Hyperlegible</option>
            </select>
          </Section>

          <Section icon={<Palette className="h-4 w-4" aria-hidden />} label="Colour theme">
            <select
              value={prefs.theme}
              onChange={(e) => setPrefs({ theme: e.target.value as ThemeMode })}
              className="w-full rounded-md border bg-background px-3 py-2"
              aria-label="Colour theme"
            >
              <option value="default">Default</option>
              <option value="high-contrast">High Contrast</option>
              <option value="dark">Dark</option>
              <option value="sepia">Sepia</option>
            </select>
          </Section>

          <Section icon={<AlignJustify className="h-4 w-4" aria-hidden />} label="Line spacing">
            <select
              value={prefs.lineSpacing}
              onChange={(e) => setPrefs({ lineSpacing: e.target.value as LineSpacing })}
              className="w-full rounded-md border bg-background px-3 py-2"
              aria-label="Line spacing"
            >
              <option value="normal">Normal</option>
              <option value="relaxed">Relaxed</option>
              <option value="double">Double</option>
            </select>
          </Section>

          <Section icon={<Gauge className="h-4 w-4" aria-hidden />} label={`Read-aloud speed — ${prefs.ttsRate}x`}>
            <div className="flex gap-2">
              {[0.5, 0.75, 1, 1.25].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setPrefs({ ttsRate: r })}
                  aria-pressed={prefs.ttsRate === r}
                  className={`flex-1 rounded-md border px-2 py-2 text-sm ${prefs.ttsRate === r ? "bg-primary text-primary-foreground" : "bg-background hover:bg-accent"}`}
                >
                  {r}x
                </button>
              ))}
            </div>
          </Section>

          <label className="mt-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={prefs.muteChime}
              onChange={(e) => setPrefs({ muteChime: e.target.checked })}
              className="h-5 w-5"
            />
            Mute timer chime
          </label>
        </aside>
      )}
    </>
  );
}

function Section({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium">
        {icon} {label}
      </div>
      {children}
    </div>
  );
}

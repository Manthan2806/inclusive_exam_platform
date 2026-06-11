import { useEffect } from "react";
import { useExamStore } from "@/store/examStore";
import { AccessibilityToolbar } from "./AccessibilityToolbar";

const FAMILY: Record<string, string> = {
  default: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
  dyslexic:
    '"OpenDyslexic", "Comic Sans MS", Verdana, sans-serif',
  atkinson:
    '"Atkinson Hyperlegible", Verdana, sans-serif',
};

const LH: Record<string, string> = {
  normal: "1.5",
  relaxed: "1.8",
  double: "2.2",
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const prefs = useExamStore((s) => s.prefs);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "theme-high-contrast", "theme-sepia");
    if (prefs.theme === "dark") root.classList.add("dark");
    if (prefs.theme === "high-contrast") root.classList.add("theme-high-contrast");
    if (prefs.theme === "sepia") root.classList.add("theme-sepia");
  }, [prefs.theme]);

  return (
    <div
      style={{
        fontSize: `${prefs.fontPx}px`,
        lineHeight: LH[prefs.lineSpacing],
        fontFamily: FAMILY[prefs.fontFamily],
      }}
      className="min-h-screen bg-background text-foreground"
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to main content
      </a>
      {children}
      <AccessibilityToolbar />
    </div>
  );
}

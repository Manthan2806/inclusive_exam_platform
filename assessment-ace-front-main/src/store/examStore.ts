import { create } from "zustand";
import { persist } from "zustand/middleware";

export type DisabilityKey = "visual" | "motor" | "hearing" | "cognitive" | "multiple";

export interface ProfileConfig {
  tts: boolean;
  voiceInput: boolean;
  simplifiedLanguage: boolean;
  visualAlerts: boolean;
  largeTargets: boolean;
  fontSize: "base" | "lg" | "xl" | "2xl";
  contrast: "default" | "high";
  timeMultiplier: number;
}

export const DEFAULT_CONFIG: ProfileConfig = {
  tts: false,
  voiceInput: false,
  simplifiedLanguage: false,
  visualAlerts: false,
  largeTargets: false,
  fontSize: "lg",
  contrast: "default",
  timeMultiplier: 1,
};

export function deriveConfig(keys: DisabilityKey[]): ProfileConfig {
  const c: ProfileConfig = { ...DEFAULT_CONFIG };
  if (keys.includes("visual")) {
    c.tts = true;
    c.fontSize = "xl";
    c.contrast = "high";
    c.timeMultiplier = Math.max(c.timeMultiplier, 1.5);
  }
  if (keys.includes("motor")) {
    c.voiceInput = true;
    c.largeTargets = true;
    c.timeMultiplier = Math.max(c.timeMultiplier, 1.5);
  }
  if (keys.includes("cognitive")) {
    c.simplifiedLanguage = true;
    c.tts = true;
    c.timeMultiplier = Math.max(c.timeMultiplier, 2);
  }
  if (keys.includes("hearing")) c.visualAlerts = true;
  if (keys.includes("multiple")) c.timeMultiplier = Math.max(c.timeMultiplier, 2);
  return c;
}

export type ThemeMode = "default" | "high-contrast" | "dark" | "sepia";
export type FontFamily = "default" | "dyslexic" | "atkinson";
export type LineSpacing = "normal" | "relaxed" | "double";

export interface Preferences {
  fontPx: number; // 16-28
  fontFamily: FontFamily;
  theme: ThemeMode;
  lineSpacing: LineSpacing;
  ttsRate: number;
  muteChime: boolean;
}

export const DEFAULT_PREFS: Preferences = {
  fontPx: 18,
  fontFamily: "default",
  theme: "default",
  lineSpacing: "relaxed",
  ttsRate: 1,
  muteChime: false,
};

interface AnswerState {
  text: string;
  flagged: boolean;
}

interface ExamState {
  name: string;
  rollNo: string;
  disabilities: DisabilityKey[];
  config: ProfileConfig;
  prefs: Preferences;
  answers: Record<number, AnswerState>;
  currentIndex: number;
  startedAt: number | null;
  setLogin: (name: string, roll: string, disabilities: DisabilityKey[]) => void;
  setPrefs: (p: Partial<Preferences>) => void;
  setAnswer: (i: number, text: string) => void;
  toggleFlag: (i: number) => void;
  setCurrent: (i: number) => void;
  startExam: () => void;
  reset: () => void;
}

export const useExamStore = create<ExamState>()(
  persist(
    (set) => ({
      name: "",
      rollNo: "",
      disabilities: [],
      config: DEFAULT_CONFIG,
      prefs: DEFAULT_PREFS,
      answers: {},
      currentIndex: 0,
      startedAt: null,
      setLogin: (name, rollNo, disabilities) =>
        set({ name, rollNo, disabilities, config: deriveConfig(disabilities) }),
      setPrefs: (p) => set((s) => ({ prefs: { ...s.prefs, ...p } })),
      setAnswer: (i, text) =>
        set((s) => ({
          answers: { ...s.answers, [i]: { ...(s.answers[i] ?? { flagged: false }), text } },
        })),
      toggleFlag: (i) =>
        set((s) => ({
          answers: {
            ...s.answers,
            [i]: { text: s.answers[i]?.text ?? "", flagged: !s.answers[i]?.flagged },
          },
        })),
      setCurrent: (i) => set({ currentIndex: i }),
      startExam: () => set((s) => ({ startedAt: s.startedAt ?? Date.now() })),
      reset: () =>
        set({
          answers: {},
          currentIndex: 0,
          startedAt: null,
        }),
    }),
    { name: "inclusive-exam-store" },
  ),
);

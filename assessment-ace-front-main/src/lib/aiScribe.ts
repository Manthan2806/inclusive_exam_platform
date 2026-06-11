

import { cleanupVoiceTranscript, simplifyComplexQuestion } from "./claudeAPI";

// ── AI Scribe: clean up messy voice dictation ──
// Drop-in replacement for the old cleanupTranscript()
export async function cleanupTranscript(raw: string): Promise<string> {
  if (!raw || raw.trim().length === 0) return raw;

  try {
    return await cleanupVoiceTranscript(raw);
  } catch (error) {
    // If Claude API fails for any reason, fall back to local regex
    // so the exam never breaks for the student
    console.warn("Claude API failed, falling back to local cleanup:", error);
    return localFallbackCleanup(raw);
  }
}

// ── Simplify Question: rephrase complex question ──
// Drop-in replacement for the old simplifyQuestion()
export async function simplifyQuestion(text: string): Promise<string> {
  if (!text || text.trim().length === 0) return text;

  try {
    return await simplifyComplexQuestion(text);
  } catch (error) {
    console.warn("Claude API failed, falling back to local simplify:", error);
    return localFallbackSimplify(text);
  }
}

// ─────────────────────────────────────────────────────────────
// Local fallbacks — only used if Claude API is unreachable
// Keeps the exam functional even without internet
// ─────────────────────────────────────────────────────────────
function localFallbackCleanup(raw: string): string {
  const FILLERS = [
    "uh","um","uhh","umm","like","you know","i mean",
    "sort of","kind of","basically","actually","literally",
    "so um","ah","er"
  ];
  let s = " " + raw.toLowerCase().replace(/\s+/g, " ").trim() + " ";
  for (const f of FILLERS) {
    const re = new RegExp(`\\s${f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s`, "g");
    s = s.replace(re, " ");
  }
  s = s.replace(/\s+,/g, ",").replace(/\s+\./g, ".").replace(/\s+/g, " ").trim();
  const parts = s
    .replace(/\s+and then\s+/g, ". ")
    .replace(/\s+then\s+/g, ". ")
    .replace(/\s+so\s+/g, ". ")
    .split(/(?<=[.?!])\s+|\s*;\s*/);
  return parts
    .map((p) => p.trim().replace(/[.?!]+$/, ""))
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1) + ".")
    .join(" ");
}

function localFallbackSimplify(text: string): string {
  return text
    .replace(/\bcritically examine\b/gi, "explain clearly")
    .replace(/\bevaluate\b/gi, "judge")
    .replace(/\belucidate\b/gi, "explain")
    .replace(/\bdiscuss\b/gi, "talk about")
    .replace(/\bimplications\b/gi, "effects")
    .replace(/\bsignificance\b/gi, "importance");
}
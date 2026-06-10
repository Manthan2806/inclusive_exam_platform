// Local "AI scribe" cleanup. Removes filler words, fixes spacing/capitalization,
// merges run-ons into sentences. No external API needed for the frontend demo.
export function cleanupTranscript(raw: string): string {
  if (!raw) return "";
  const FILLERS = [
    "uh","um","uhh","umm","like","you know","i mean","sort of","kind of","basically","actually","literally","so um","ah","er"
  ];
  let s = " " + raw.toLowerCase().replace(/\s+/g, " ").trim() + " ";
  for (const f of FILLERS) {
    const re = new RegExp(`\\s${f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s`, "g");
    s = s.replace(re, " ");
  }
  s = s.replace(/\s+,/g, ",").replace(/\s+\./g, ".").replace(/\s+/g, " ").trim();
  // Split into rough sentences on conjunctions / pauses
  const parts = s
    .replace(/\s+and then\s+/g, ". ")
    .replace(/\s+then\s+/g, ". ")
    .replace(/\s+so\s+/g, ". ")
    .split(/(?<=[.?!])\s+|\s*;\s*/);
  const sentences = parts
    .map((p) => p.trim().replace(/[.?!]+$/, ""))
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1) + ".");
  return sentences.join(" ");
}

export function simplifyQuestion(text: string): string {
  // Mock "simplified language" — in production, calls Claude API.
  // We rely on each question's pre-written simplified field, but this is a fallback.
  return text
    .replace(/\bcritically examine\b/gi, "explain clearly")
    .replace(/\bevaluate\b/gi, "judge")
    .replace(/\belucidate\b/gi, "explain")
    .replace(/\bdiscuss\b/gi, "talk about")
    .replace(/\bimplications\b/gi, "effects")
    .replace(/\bsignificance\b/gi, "importance");
}

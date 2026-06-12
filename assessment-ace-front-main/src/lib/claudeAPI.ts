// src/lib/claudeAPI.ts

// ─────────────────────────────────────────────────────────────
// Custom error types — gives clear feedback in UI
// ─────────────────────────────────────────────────────────────
export class ApiKeyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiKeyError";
  }
}
 
export class ClaudeAPIError extends Error {
  public statusCode?: number;
  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "ClaudeAPIError";
    this.statusCode = statusCode;
  }
}
 
// ─────────────────────────────────────────────────────────────
// Core fetch wrapper — Hits your local Express backend!
// ─────────────────────────────────────────────────────────────
async function callClaude({
  systemPrompt,
  userMessage,
  maxTokens = 1000,
}: {
  systemPrompt: string;
  userMessage: string;
  maxTokens?: number;
}): Promise<string> {
 
  let response: Response;
  try {
    // Calling your local backend instead of Anthropic directly
    response = await fetch('http://localhost:3000/api/ai', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        maxTokens,
        systemPrompt,
        userMessage
      }),
    });
  } catch (networkError) {
    throw new ClaudeAPIError(
      "Network error: Could not reach the local backend server. Is it running on port 3000?"
    );
  }
 
  if (!response.ok) {
    let errorMessage = `API error (${response.status})`;
    try {
      const errorBody = await response.json();
      errorMessage = errorBody?.error?.message || errorMessage;
    } catch {}
 
    if (response.status === 401) {
      throw new ApiKeyError("Backend API key is invalid. Check backend/.env");
    }
    if (response.status === 429) {
      throw new ClaudeAPIError("Rate limit hit. Please wait a moment and try again.", 429);
    }
    throw new ClaudeAPIError(errorMessage, response.status);
  }
 
  const data = await response.json();
 
  // Extract text from response
  const textBlock = data?.content?.find((block: any) => block.type === "text");
  if (!textBlock?.text) {
    throw new ClaudeAPIError("Unexpected response format from backend API.");
  }
 
  return textBlock.text.trim();
}
 
// ─────────────────────────────────────────────────────────────
// FUNCTION 1: AI Scribe — clean up messy voice dictation
// ─────────────────────────────────────────────────────────────
 
const SCRIBE_SYSTEM_PROMPT = `You are an AI scribe for a differently-abled student taking an exam in India.
 
YOUR ONLY JOB: Clean up and structure the student's raw voice dictation.
 
WHAT YOU MAY DO:
- Remove filler words: "uh", "um", "like", "you know", "basically", "so yeah"
- Fix grammatical errors and incomplete sentences
- Improve sentence structure and flow
- Remove repetitions and false starts (e.g. "the the plants" → "the plants")
- Organise scattered points into coherent paragraphs
 
ABSOLUTE RULES — NEVER BREAK THESE:
1. Do NOT add any facts, data, dates, names, or information not present in the student's words
2. Do NOT answer the question on the student's behalf
3. Do NOT expand on any point beyond what the student explicitly said
4. Do NOT correct factually wrong statements — if the student said something incorrect, keep it as-is (it is their answer, not yours)
5. Do NOT add a conclusion or summary if the student did not provide one
6. If the student's dictation is too fragmented to clean up meaningfully, return it as-is with minimal punctuation fixes only
 
OUTPUT FORMAT:
Return ONLY the cleaned answer text.
No preamble. No explanation. No "Here is the cleaned version:". Just the text itself.`;
 
export async function cleanupVoiceTranscript(rawText: string): Promise<string> {
  if (!rawText || rawText.trim().length === 0) {
    return rawText;
  }
 
  // Don't bother calling API for very short clean text
  if (rawText.trim().split(/\s+/).length < 5) {
    return rawText;
  }
 
  const result = await callClaude({
    systemPrompt: SCRIBE_SYSTEM_PROMPT,
    userMessage: `Student's raw voice dictation:\n\n"${rawText.trim()}"`,
    maxTokens: 1000,
  });
 
  return result;
}
 
// ─────────────────────────────────────────────────────────────
// FUNCTION 2: Simplify Question — rephrase without changing meaning
// ─────────────────────────────────────────────────────────────
 
const SIMPLIFY_SYSTEM_PROMPT = `You are helping a student with cognitive disabilities understand an exam question.
 
YOUR ONLY JOB: Rephrase the question using simpler, everyday words.
 
WHAT YOU MAY DO:
- Replace complex academic or legal vocabulary with plain English words
- Break one long complex sentence into 2–3 shorter sentences
- Convert passive voice to active voice where it helps clarity
- Spell out abbreviations on first use
 
ABSOLUTE RULES — NEVER BREAK THESE:
1. Do NOT change what the question is asking — the same answer should satisfy both versions
2. Do NOT add hints, clues, or suggestions toward the answer
3. Do NOT remove any sub-parts of the question (if it asks for 3 things, simplified version must also ask for 3 things)
4. Do NOT change technical terms that are part of the subject matter (e.g. "photosynthesis", "GDP", "Article 370" must stay as-is)
5. Keep all important keywords that the student needs to address in their answer
 
OUTPUT FORMAT:
Return ONLY the simplified question text.
No preamble. No explanation. No "Here is the simplified version:". Just the question itself.`;
 
export async function simplifyComplexQuestion(questionText: string): Promise<string> {
  if (!questionText || questionText.trim().length === 0) {
    return questionText;
  }
 
  const result = await callClaude({
    systemPrompt: SIMPLIFY_SYSTEM_PROMPT,
    userMessage: `Original exam question:\n\n"${questionText.trim()}"`,
    maxTokens: 500,
  });
 
  return result;
}

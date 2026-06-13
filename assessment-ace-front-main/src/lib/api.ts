import type { DisabilityKey } from "@/store/examStore";
import type { ExamData } from "@/lib/examData";

const BASE_URL = "http://localhost:3000";
export const DEFAULT_EXAM_ID = "upsc-demo-1";

export interface StartExamRequest {
  name: string;
  rollNo: string;
  disabilities: DisabilityKey[];
  examId?: string;
}

export interface StartExamResponse {
  exam: ExamData;
  student: {
    uid: string;
    rollNo: string;
    name: string;
    category: string;
    disabilities: DisabilityKey[];
    timeMultiplier: number;
  };
}

export type AnswerPayload = {
  questionId: number;
  answer: string;
  flagged: boolean;
};

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.error?.message || data?.error || `Request failed (${response.status})`;
    throw new Error(message);
  }
  return data as T;
}

export async function startExamSession({
  name,
  rollNo,
  disabilities,
  examId = DEFAULT_EXAM_ID,
}: StartExamRequest): Promise<StartExamResponse> {
  const response = await fetch(`${BASE_URL}/api/start-exam`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, rollNo, disabilities, examId }),
  });

  return parseJsonResponse<StartExamResponse>(response);
}

export async function submitExam(
  rollNo: string,
  examId: string,
  answers: AnswerPayload[],
) {
  const response = await fetch(`${BASE_URL}/api/submit-exam`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      uid: rollNo,
      rollNo,
      examId,
      answers,
    }),
  });

  return parseJsonResponse<{ success: boolean; submissionId: string; savedAnswers: number }>(response);
}

export async function submitAllAnswers(
  rollNo: string,
  answers: Record<number, { text: string; flagged: boolean }>,
  examId = DEFAULT_EXAM_ID,
) {
  return submitExam(
    rollNo,
    examId,
    Object.entries(answers).map(([questionId, answer]) => ({
      questionId: Number(questionId),
      answer: answer.text || "No answer provided",
      flagged: answer.flagged,
    })),
  );
}

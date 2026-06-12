const BASE_URL = 'http://localhost:3000'

export async function submitAllAnswers(
  rollNo: string,
  answers: Record<number, { text: string; flagged: boolean }>
) {
  const promises = Object.entries(answers).map(([questionId, answer]) =>
    fetch(`${BASE_URL}/api/submit-answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        uid: rollNo,
        questionId: Number(questionId),
        answer: answer.text || 'No answer provided'
      })
    })
  )
  await Promise.all(promises)
}
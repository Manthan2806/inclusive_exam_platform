require("dotenv").config();

const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
const express = require("express");
const cors = require("cors");
const serviceAccount = process.env.SERVICE_ACCOUNT_KEY 
  ? JSON.parse(process.env.SERVICE_ACCOUNT_KEY)
  : require('./serviceAccountKey.json')

admin.initializeApp({
  credential: admin.cert(serviceAccount),
});


const db = getFirestore();
const app = express();

const DEFAULT_EXAM_ID = "upsc-demo-1";

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://your-app.vercel.app'
  ],
  credentials: true
}))
app.use(express.json());

const timeMultipliers = {
  visual: 1.5,
  visually_impaired: 1.5,
  motor: 1.5,
  physical_disability: 1.5,
  hearing: 1,
  hearing_impaired: 1,
  cognitive: 2,
  learning_disability: 2,
  multiple: 2,
  general: 1,
};

function getCategory(disabilities = []) {
  if (!Array.isArray(disabilities) || disabilities.length === 0) return "general";
  if (disabilities.includes("multiple") || disabilities.length > 1) return "multiple";
  return disabilities[0];
}

function getTimeMultiplier(disabilities = [], category = "general") {
  const keys = Array.isArray(disabilities) && disabilities.length > 0
    ? [...disabilities, category]
    : [category];
  return keys.reduce((max, key) => Math.max(max, timeMultipliers[key] || 1), 1);
}

function normalizeExam(examId, exam) {
  return {
    id: examId,
    title: exam.examName || exam.title || "Exam",
    examName: exam.examName || exam.title || "Exam",
    durationMinutes: exam.baseDurationMinutes || exam.durationMinutes || 30,
    baseDurationMinutes: exam.baseDurationMinutes || exam.durationMinutes || 30,
    questions: exam.questions || [],
  };
}

async function getExamById(examId) {
  const examDoc = await db.collection("exams").doc(examId).get();
  if (!examDoc.exists) return null;
  return normalizeExam(examDoc.id, examDoc.data());
}

app.post("/api/start-exam", async (req, res) => {
  try {
    const {
      name = "Candidate",
      rollNo,
      disabilities = [],
      examId = DEFAULT_EXAM_ID,
    } = req.body;

    if (!rollNo) {
      return res.status(400).json({ error: "rollNo is required" });
    }

    const exam = await getExamById(examId);
    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }

    const category = getCategory(disabilities);
    const timeMultiplier = getTimeMultiplier(disabilities, category);

    await db.collection("students").doc(String(rollNo)).set(
      {
        name,
        rollNo: String(rollNo),
        category,
        disabilities,
        timeMultiplier,
        updatedAt: new Date(),
      },
      { merge: true },
    );

    res.json({
      exam,
      student: {
        uid: String(rollNo),
        rollNo: String(rollNo),
        name,
        category,
        disabilities,
        timeMultiplier,
      },
    });
  } catch (error) {
    console.error("Error starting exam:", error);
    res.status(500).json({ error: "Something went wrong while starting exam" });
  }
});

// Compatibility endpoint for quick manual checks:
// GET /api/get-exam?uid=123456&examId=upsc-demo-1
app.get("/api/get-exam", async (req, res) => {
  try {
    const uid = String(req.query.uid || "123456");
    const examId = String(req.query.examId || DEFAULT_EXAM_ID);

    const exam = await getExamById(examId);
    if (!exam) {
      return res.status(404).json({ error: "Exam not found" });
    }

    const studentDoc = await db.collection("students").doc(uid).get();
    const student = studentDoc.exists ? studentDoc.data() : {};
    const category = student.category || "general";
    const multiplier = student.timeMultiplier || getTimeMultiplier(student.disabilities, category);

    res.json({
      exam,
      questions: exam.questions,
      baseDuration: exam.baseDurationMinutes,
      effectiveTime: exam.baseDurationMinutes * multiplier,
      studentName: student.name || "Candidate",
      category,
      multiplier,
    });
  } catch (error) {
    console.error("Error fetching exam:", error);
    res.status(500).json({ error: "Something went wrong while fetching exam" });
  }
});

app.post("/api/submit-exam", async (req, res) => {
  try {
    const { uid, rollNo, examId = DEFAULT_EXAM_ID, answers = [] } = req.body;
    const studentId = String(uid || rollNo || "");

    if (!studentId) {
      return res.status(400).json({ error: "uid or rollNo is required" });
    }

    if (!Array.isArray(answers)) {
      return res.status(400).json({ error: "answers must be an array" });
    }

    const submittedAt = new Date();
    const normalizedAnswers = answers.map((answer) => ({
      uid: studentId,
      rollNo: studentId,
      examId,
      questionId: answer.questionId,
      answer: answer.answer || "No answer provided",
      flagged: Boolean(answer.flagged),
      submittedAt,
    }));

    const batch = db.batch();
    normalizedAnswers.forEach((answer) => {
      const answerRef = db.collection("answers").doc();
      batch.set(answerRef, answer);
    });

    const submissionRef = db.collection("submissions").doc();
    batch.set(submissionRef, {
      uid: studentId,
      rollNo: studentId,
      examId,
      answers: normalizedAnswers.map(({ submittedAt: _submittedAt, ...answer }) => answer),
      submittedAt,
    });

    await batch.commit();

    res.json({
      success: true,
      submissionId: submissionRef.id,
      savedAnswers: normalizedAnswers.length,
    });
  } catch (error) {
    console.error("Error submitting exam:", error);
    res.status(500).json({ error: "Something went wrong while submitting exam" });
  }
});

// Old single-answer endpoint kept so existing frontend calls or manual tests do not break.
app.post("/api/submit-answer", async (req, res) => {
  try {
    const { uid, rollNo, examId = DEFAULT_EXAM_ID, questionId, answer, flagged = false } = req.body;
    const studentId = String(uid || rollNo || "");

    if (!studentId || !questionId) {
      return res.status(400).json({ error: "uid/rollNo and questionId are required" });
    }

    await db.collection("answers").add({
      uid: studentId,
      rollNo: studentId,
      examId,
      questionId,
      answer: answer || "No answer provided",
      flagged: Boolean(flagged),
      submittedAt: new Date(),
    });

    res.json({
      success: true,
      message: "Answer submitted successfully",
    });
  } catch (error) {
    console.error("Error submitting answer:", error);
    res.status(500).json({ error: "Something went wrong while submitting answer" });
  }
});

app.post("/api/ai", async (req, res) => {
  try {
    const { systemPrompt, userMessage, maxTokens } = req.body;

    if (!userMessage) {
      return res.status(400).json({ 
        error: { message: "Missing user message" } 
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(401).json({ 
        error: { message: "Missing GEMINI_API_KEY in environment" } 
      });
    }

    // Combine system prompt and user message for Gemini
    const fullPrompt = systemPrompt 
      ? `${systemPrompt}\n\n${userMessage}` 
      : userMessage;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ 
              text: fullPrompt 
            }]
          }],
          generationConfig: {
            maxOutputTokens: maxTokens || 1000,
            temperature: 0.3
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ 
        error: { message: error.error?.message || "Gemini API error" } 
      });
    }

    const data = await response.json();

    // Extract text from Gemini response
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Return in same format as Claude API so frontend doesnt need changes
    res.json({
      content: [{ 
        type: "text", 
        text: text 
      }]
    });

  } catch (error) {
    console.error("AI API error:", error);
    res.status(500).json({ 
      error: { message: "Something went wrong with AI processing" } 
    });
  }
});



app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(3000, () => console.log("Running on port 3000"));

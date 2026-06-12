const admin = require('firebase-admin')
const { getFirestore } = require('firebase-admin/firestore')
const serviceAccount = require('./serviceAccountKey.json')

admin.initializeApp({
  credential: admin.cert(serviceAccount)
})

const db = getFirestore()

const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

// Time multipliers for each disability category
const timeMultipliers = {
  visually_impaired: 1.5,
  hearing_impaired: 1.25,
  physical_disability: 1.5,
  learning_disability: 1.75,
  general: 1.0
}

// GET exam questions + calculated time
app.get('/api/get-exam', async (req, res) => {
  try {
    // Get student ID from query parameter
    // example: /api/get-exam?uid=student1
    const uid = req.query.uid || 'student1'

    // Fetch exam data from Firestore
    const examDoc = await db.collection('exams').doc('exam1').get()

    // Check if exam exists
    if (!examDoc.exists) {
      return res.status(404).json({ 
        error: 'Exam not found' 
      })
    }

    // Fetch student data from Firestore
    const studentDoc = await db.collection('students').doc(uid).get()

    // Check if student exists
    if (!studentDoc.exists) {
      return res.status(404).json({ 
        error: 'Student not found' 
      })
    }

    const exam = examDoc.data()
    const student = studentDoc.data()

    // Calculate effective time
    // Use student's multiplier from DB, fallback to category multiplier
    const multiplier = student.timeMultiplier || 
                       timeMultipliers[student.category] || 
                       1.0

    const effectiveTime = exam.baseDurationMinutes * multiplier

    // Send back everything frontend needs
    res.json({
      questions: exam.questions,
      baseDuration: exam.baseDurationMinutes,
      effectiveTime: effectiveTime,
      studentName: student.name,
      category: student.category,
      multiplier: multiplier
    })

  } catch (error) {
    console.error('Error fetching exam:', error)
    res.status(500).json({ 
      error: 'Something went wrong while fetching exam' 
    })
  }
})

// POST submit answer
app.post('/api/submit-answer', async (req, res) => {
  try {
    const { uid, questionId, answer } = req.body

    // Check all required fields are present
    if (!uid || !questionId || !answer) {
      return res.status(400).json({ 
        error: 'uid, questionId and answer are all required' 
      })
    }

    // Check answer is not empty
    if (answer.trim() === '') {
      return res.status(400).json({ 
        error: 'Answer cannot be empty' 
      })
    }

    // Save to Firestore
    await db.collection('answers').add({
      uid,
      questionId,
      answer,
      submittedAt: new Date()
    })

    res.json({ 
      success: true,
      message: 'Answer submitted successfully'
    })

  } catch (error) {
    console.error('Error submitting answer:', error)
    res.status(500).json({ 
      error: 'Something went wrong while submitting answer' 
    })
  }
})

// Handle invalid routes
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found' 
  })
})

// POST Universal AI proxy endpoint
app.post('/api/ai', async (req, res) => {
  try {
    const { systemPrompt, userMessage, maxTokens } = req.body;

    if (!userMessage) {
      return res.status(400).json({ error: 'Missing user message' });
    }

    // Secure backend call to Claude
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.CLAUDE_API_KEY, // Secret stays here!
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20240620", 
        max_tokens: maxTokens || 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);

  } catch (error) {
    console.error('Error in AI processing:', error);
    res.status(500).json({ error: 'Internal server error processing AI request' });
  }
});

app.listen(3000, () => console.log('Running on port 3000 ✅'))
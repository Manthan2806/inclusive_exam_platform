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

app.listen(3000, () => console.log('Running on port 3000 ✅'))
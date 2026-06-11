

const admin = require('firebase-admin')
const { getFirestore } = require('firebase-admin/firestore')
const serviceAccount = require('./serviceAccountKey.json')

admin.initializeApp({
  credential: admin.cert(serviceAccount)
})

const db = getFirestore()

async function seedData() {
  // Add exam data
  await db.collection('exams').doc('exam1').set({
    baseDurationMinutes: 60,
    questions: [
      { id: 'q1', text: 'What is photosynthesis?' },
      { id: 'q2', text: 'Explain Newton\'s first law.' },
      { id: 'q3', text: 'What is the capital of India?' }
    ]
  })
  console.log('Exam data added ✅')

  // Add student data
  await db.collection('students').doc('student1').set({
    name: 'Ravi',
    category: 'visually_impaired',
    timeMultiplier: 1.5
  })
  console.log('Student data added ✅')
}

seedData()
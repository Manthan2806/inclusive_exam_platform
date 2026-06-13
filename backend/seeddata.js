const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.cert(serviceAccount),
});

const db = getFirestore();

async function seedData() {
  await db.collection("exams").doc("upsc-demo-1").set({
    examName: "Mock UPSC General Studies - Paper I",
    baseDurationMinutes: 30,
    questions: [
      {
        id: 1,
        prompt:
          "Critically examine the role of the Indian Constitution in safeguarding the rights of differently-abled citizens, with reference to recent legislative amendments.",
        simplified:
          "How does the Indian Constitution protect the rights of people with disabilities? Mention recent law changes.",
      },
      {
        id: 2,
        prompt:
          "Explain the process of photosynthesis and discuss its significance in maintaining the ecological balance of terrestrial ecosystems.",
        simplified:
          "What is photosynthesis? How do plants make food using sunlight? Why is it important for nature on land?",
      },
      {
        id: 3,
        prompt:
          "Discuss the impact of the Green Revolution on Indian agriculture, highlighting both its benefits and ecological consequences.",
        simplified:
          "How did the Green Revolution change Indian farming? What were the good and bad effects on the environment?",
      },
      {
        id: 4,
        prompt:
          "Evaluate the significance of the Non-Cooperation Movement (1920-22) in shaping the trajectory of the Indian freedom struggle.",
        simplified:
          "Why was the Non-Cooperation Movement from 1920 to 1922 important for India's freedom struggle?",
      },
      {
        id: 5,
        prompt:
          "Analyse the implications of artificial intelligence on employment patterns in India over the next decade.",
        simplified:
          "How might AI affect jobs in India in the next 10 years?",
      },
    ],
  });

  await db.collection("students").doc("123456").set({
    name: "Demo Candidate",
    category: "visual",
    timeMultiplier: 1.5,
  });

  console.log("Seed data added successfully");
}

seedData().catch((error) => {
  console.error("Error seeding data:", error);
  process.exit(1);
});

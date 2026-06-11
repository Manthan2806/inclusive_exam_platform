export interface Question {
  id: number;
  prompt: string;
  simplified: string;
}

export const EXAM = {
  id: "demo-1",
  title: "Mock UPSC General Studies — Paper I",
  durationMinutes: 30, // base time; multiplied by profile
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
        "What is photosynthesis (how plants make food using sunlight)? Why is it important for nature on land?",
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
        "Evaluate the significance of the Non-Cooperation Movement (1920–22) in shaping the trajectory of the Indian freedom struggle.",
      simplified:
        "Why was the Non-Cooperation Movement (1920–22) important for India's freedom struggle?",
    },
    {
      id: 5,
      prompt:
        "Analyse the implications of artificial intelligence on employment patterns in India over the next decade.",
      simplified:
        "How might AI (computer programs that think like humans) affect jobs in India in the next 10 years?",
    },
  ] as Question[],
};

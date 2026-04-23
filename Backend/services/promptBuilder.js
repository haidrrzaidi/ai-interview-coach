const ROLES = {
  frontend: {
    label: 'Frontend Engineer',
    focus: 'HTML, CSS, JavaScript, React, state management, performance, accessibility, browser rendering, and modern frontend tooling',
  },
  backend: {
    label: 'Backend Engineer',
    focus: 'API design, databases, caching, queues, concurrency, system design, security, and scalability',
  },
  fullstack: {
    label: 'Full Stack Engineer',
    focus: 'frontend frameworks, backend services, databases, APIs, deployment, and end-to-end architecture',
  },
  mobile: {
    label: 'Mobile Engineer',
    focus: 'React Native, iOS/Android concepts, performance, navigation, offline-first design, and native modules',
  },
  devops: {
    label: 'DevOps Engineer',
    focus: 'CI/CD, containers, Kubernetes, IaC, observability, cloud platforms, and incident response',
  },
  data: {
    label: 'Data Engineer',
    focus: 'ETL/ELT pipelines, data warehousing, SQL, streaming, orchestration, and data modeling',
  },
  ml: {
    label: 'Machine Learning Engineer',
    focus: 'model training, evaluation, feature engineering, MLOps, and production inference',
  },
  android: {
    label: 'Android Engineer',
    focus: 'Kotlin, Android SDK, Jetpack Compose, architecture, and performance',
  },
  ios: {
    label: 'iOS Engineer',
    focus: 'Swift, SwiftUI/UIKit, Apple frameworks, architecture, and App Store lifecycle',
  },
};

const DIFFICULTY = {
  easy: {
    label: 'Easy',
    depth: 'fundamentals and entry-level concepts. Questions should be clear and answerable by someone with 0–2 years experience.',
    questionCount: 5,
  },
  medium: {
    label: 'Medium',
    depth: 'intermediate topics requiring practical experience. Expect applied questions and moderate system thinking. Target 2–4 years experience.',
    questionCount: 6,
  },
  hard: {
    label: 'Hard',
    depth: 'advanced, senior-level topics including deep internals, trade-offs, edge cases, and system design. Target 4+ years experience.',
    questionCount: 7,
  },
};

const getRole = (role) => ROLES[String(role || '').toLowerCase()] || ROLES.fullstack;
const getDifficulty = (difficulty) => DIFFICULTY[String(difficulty || '').toLowerCase()] || DIFFICULTY.medium;

const buildSystemPrompt = (role, difficulty) => {
  const r = getRole(role);
  const d = getDifficulty(difficulty);

  return `You are an expert technical interviewer specialized in hiring ${r.label}s.

Your expertise covers: ${r.focus}.

Current interview settings:
- Role: ${r.label}
- Difficulty: ${d.label} — ${d.depth}
- Expected total questions: ${d.questionCount}

Your responsibilities:
1. Ask one focused technical question at a time. Never stack multiple questions.
2. Evaluate each candidate answer rigorously and give constructive, specific feedback.
3. Score each answer from 0 to 10. Reserve 9–10 for near-perfect answers.
4. Identify specific strengths and weaknesses in each response.
5. Adapt follow-up difficulty to the candidate's demonstrated level.
6. At the end, produce a balanced summary with weak areas and study recommendations.

Tone: professional, encouraging, specific. Never be vague. Always cite concrete technical concepts.

Output discipline: Always respond in the exact JSON schema the user prompt requests. No prose outside JSON. No markdown fences.`;
};

const buildFirstQuestionPrompt = (role, difficulty) => {
  const r = getRole(role);
  const d = getDifficulty(difficulty);

  return `Generate the FIRST interview question for a ${r.label} role at ${d.label} difficulty.

Requirements:
- Pick a strong opener that reveals core competency.
- Keep it specific and technical — no "tell me about yourself".
- The question should be answerable in 3–6 sentences by a qualified candidate.

Return ONLY this JSON (no markdown, no commentary):
{
  "question": "string - the interview question",
  "topic": "string - short topic label, e.g., 'React Hooks' or 'Database Indexing'",
  "questionNumber": 1,
  "totalQuestions": ${d.questionCount}
}`;
};

const buildAnswerEvaluationPrompt = ({
  role,
  difficulty,
  question,
  topic,
  answer,
  questionNumber,
  totalQuestions,
  history,
}) => {
  const r = getRole(role);
  const d = getDifficulty(difficulty);
  const isLast = questionNumber >= totalQuestions;

  const historySummary = (history || [])
    .slice(-3)
    .map((h, i) => `Q${i + 1} (${h.topic}): scored ${h.score}/10`)
    .join('\n');

  return `Interview context:
- Role: ${r.label}
- Difficulty: ${d.label}
- Question ${questionNumber} of ${totalQuestions}
- Current question topic: ${topic}

Previous performance:
${historySummary || '(first question)'}

The candidate was just asked:
"""
${question}
"""

Candidate's answer:
"""
${answer}
"""

Evaluate this answer. Then ${isLast ? 'DO NOT generate another question — this was the final one.' : 'generate the NEXT question. Cover a different topic than the last few and adapt difficulty based on performance.'}

Return ONLY this JSON (no markdown, no commentary):
{
  "feedback": {
    "score": 0-10 integer,
    "strengths": ["string", "string"],
    "weaknesses": ["string", "string"],
    "correctAnswer": "string - brief model answer, 2-3 sentences",
    "summary": "string - 1-2 sentence overall assessment"
  }${isLast ? '' : `,
  "nextQuestion": {
    "question": "string",
    "topic": "string - short topic label",
    "questionNumber": ${questionNumber + 1},
    "totalQuestions": ${totalQuestions}
  }`},
  "isComplete": ${isLast}
}`;
};

const buildFinalSummaryPrompt = ({ role, difficulty, history }) => {
  const r = getRole(role);
  const d = getDifficulty(difficulty);

  const transcript = (history || [])
    .map(
      (h, i) =>
        `Q${i + 1} [${h.topic}] (score ${h.score}/10):
Question: ${h.question}
Answer: ${h.answer}
Strengths: ${(h.strengths || []).join('; ')}
Weaknesses: ${(h.weaknesses || []).join('; ')}`
    )
    .join('\n\n');

  return `The candidate has just completed a ${r.label} interview at ${d.label} difficulty.

Full transcript:
${transcript}

Produce a final interview summary. Be balanced, specific, and actionable.

Return ONLY this JSON (no markdown, no commentary):
{
  "overallScore": 0-10 number (one decimal allowed),
  "performance": "string - one of: 'Excellent', 'Strong', 'Solid', 'Developing', 'Needs Work'",
  "strengths": ["string", "string", "string"],
  "weakAreas": [
    {"topic": "string", "reason": "string - why this is weak", "improvement": "string - specific study suggestion"}
  ],
  "overallFeedback": "string - 3-4 sentences of balanced assessment",
  "recommendedResources": ["string - specific resource", "string - specific resource", "string"],
  "nextSteps": "string - what to study or practice next"
}`;
};

module.exports = {
  ROLES,
  DIFFICULTY,
  getRole,
  getDifficulty,
  buildSystemPrompt,
  buildFirstQuestionPrompt,
  buildAnswerEvaluationPrompt,
  buildFinalSummaryPrompt,
};

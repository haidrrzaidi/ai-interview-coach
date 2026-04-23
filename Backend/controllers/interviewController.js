const { v4: uuidv4 } = require('uuid');

const {
  buildSystemPrompt,
  buildFirstQuestionPrompt,
  buildAnswerEvaluationPrompt,
  buildFinalSummaryPrompt,
  ROLES,
  DIFFICULTY,
  getRole,
  getDifficulty,
} = require('../services/promptBuilder');
const { callClaudeJson } = require('../services/claudeService');
const sessionStore = require('../services/sessionStore');

const validationError = (message) => {
  const err = new Error(message);
  err.status = 400;
  err.name = 'ValidationError';
  return err;
};

const listOptions = (_req, res) => {
  const roles = Object.entries(ROLES).map(([id, r]) => ({
    id,
    label: r.label,
    focus: r.focus,
  }));
  const difficulties = Object.entries(DIFFICULTY).map(([id, d]) => ({
    id,
    label: d.label,
    description: d.depth,
    questionCount: d.questionCount,
  }));
  res.json({ roles, difficulties });
};

const startInterview = async (req, res, next) => {
  try {
    const { role, difficulty, candidateName } = req.body || {};
    if (!role) throw validationError('role is required');
    if (!difficulty) throw validationError('difficulty is required');

    const resolvedRole = getRole(role);
    const resolvedDifficulty = getDifficulty(difficulty);

    const system = buildSystemPrompt(role, difficulty);
    const userPrompt = buildFirstQuestionPrompt(role, difficulty);

    const { data } = await callClaudeJson({
      system,
      userPrompt,
      maxTokens: 1024,
    });

    if (!data || !data.question) {
      const err = new Error('Claude returned invalid question payload');
      err.status = 502;
      throw err;
    }

    const sessionId = uuidv4();
    const session = sessionStore.create(sessionId, {
      role,
      roleLabel: resolvedRole.label,
      difficulty,
      difficultyLabel: resolvedDifficulty.label,
      candidateName: candidateName || 'Candidate',
      totalQuestions: data.totalQuestions || resolvedDifficulty.questionCount,
      currentQuestionNumber: 1,
      currentQuestion: {
        question: data.question,
        topic: data.topic || 'General',
        questionNumber: 1,
        totalQuestions: data.totalQuestions || resolvedDifficulty.questionCount,
      },
      history: [],
      finalSummary: null,
      completed: false,
    });

    res.json({
      sessionId: session.id,
      role: session.role,
      roleLabel: session.roleLabel,
      difficulty: session.difficulty,
      difficultyLabel: session.difficultyLabel,
      totalQuestions: session.totalQuestions,
      question: session.currentQuestion,
    });
  } catch (e) {
    next(e);
  }
};

const submitAnswer = async (req, res, next) => {
  try {
    const { sessionId, answer } = req.body || {};
    if (!sessionId) throw validationError('sessionId is required');
    if (typeof answer !== 'string' || !answer.trim()) {
      throw validationError('answer is required');
    }

    const session = sessionStore.get(sessionId);
    if (!session) {
      const err = new Error('Session not found or expired');
      err.status = 404;
      throw err;
    }
    if (session.completed) {
      throw validationError('Interview already completed');
    }

    const currentQ = session.currentQuestion;
    if (!currentQ) throw validationError('No active question');

    const system = buildSystemPrompt(session.role, session.difficulty);
    const userPrompt = buildAnswerEvaluationPrompt({
      role: session.role,
      difficulty: session.difficulty,
      question: currentQ.question,
      topic: currentQ.topic,
      answer: answer.trim(),
      questionNumber: currentQ.questionNumber,
      totalQuestions: session.totalQuestions,
      history: session.history,
    });

    const { data } = await callClaudeJson({
      system,
      userPrompt,
      maxTokens: 1600,
    });

    if (!data || !data.feedback) {
      const err = new Error('Claude returned invalid evaluation payload');
      err.status = 502;
      throw err;
    }

    const fb = data.feedback;
    const historyEntry = {
      questionNumber: currentQ.questionNumber,
      question: currentQ.question,
      topic: currentQ.topic,
      answer: answer.trim(),
      score: typeof fb.score === 'number' ? fb.score : 0,
      strengths: Array.isArray(fb.strengths) ? fb.strengths : [],
      weaknesses: Array.isArray(fb.weaknesses) ? fb.weaknesses : [],
      correctAnswer: fb.correctAnswer || '',
      summary: fb.summary || '',
    };

    const updatedHistory = [...session.history, historyEntry];

    const nextQuestion = data.isComplete ? null : data.nextQuestion || null;

    const patch = {
      history: updatedHistory,
      currentQuestion: nextQuestion,
      currentQuestionNumber: nextQuestion
        ? nextQuestion.questionNumber
        : session.currentQuestionNumber,
      completed: Boolean(data.isComplete),
    };

    sessionStore.update(sessionId, patch);

    res.json({
      sessionId,
      feedback: historyEntry,
      nextQuestion,
      isComplete: Boolean(data.isComplete),
      progress: {
        current: updatedHistory.length,
        total: session.totalQuestions,
      },
    });
  } catch (e) {
    next(e);
  }
};

const getSummary = async (req, res, next) => {
  try {
    const sessionId = req.query.sessionId || req.params.sessionId;
    if (!sessionId) throw validationError('sessionId is required');

    const session = sessionStore.get(sessionId);
    if (!session) {
      const err = new Error('Session not found or expired');
      err.status = 404;
      throw err;
    }
    if (!session.completed && session.history.length < session.totalQuestions) {
      throw validationError('Interview is not yet complete');
    }

    if (session.finalSummary) {
      return res.json({
        sessionId,
        role: session.role,
        roleLabel: session.roleLabel,
        difficulty: session.difficulty,
        difficultyLabel: session.difficultyLabel,
        candidateName: session.candidateName,
        totalQuestions: session.totalQuestions,
        history: session.history,
        summary: session.finalSummary,
      });
    }

    const system = buildSystemPrompt(session.role, session.difficulty);
    const userPrompt = buildFinalSummaryPrompt({
      role: session.role,
      difficulty: session.difficulty,
      history: session.history,
    });

    const { data } = await callClaudeJson({
      system,
      userPrompt,
      maxTokens: 1800,
    });

    sessionStore.update(sessionId, { finalSummary: data });

    res.json({
      sessionId,
      role: session.role,
      roleLabel: session.roleLabel,
      difficulty: session.difficulty,
      difficultyLabel: session.difficultyLabel,
      candidateName: session.candidateName,
      totalQuestions: session.totalQuestions,
      history: session.history,
      summary: data,
    });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  listOptions,
  startInterview,
  submitAnswer,
  getSummary,
};

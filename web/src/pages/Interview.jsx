import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import QuestionCard from '../components/QuestionCard';
import AnswerBox from '../components/AnswerBox';
import { useInterview } from '../hooks/useInterview';

const ScoreBadge = ({ score }) => {
  const color =
    score >= 8 ? 'text-green-400 bg-green-400/10 border-green-400/30' :
    score >= 5 ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30' :
    'text-red-400 bg-red-400/10 border-red-400/30';
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-bold ${color}`}>
      {score}/10
    </span>
  );
};

const FeedbackPanel = ({ feedback, onNext, isLast }) => (
  <div className="card p-6 space-y-5 animate-slide-up">
    <div className="flex items-center justify-between">
      <h3 className="font-semibold text-white">Feedback</h3>
      <ScoreBadge score={feedback.score} />
    </div>

    <p className="text-white/80 text-sm leading-relaxed">{feedback.summary}</p>

    {feedback.strengths?.length > 0 && (
      <div>
        <p className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-2">Strengths</p>
        <ul className="space-y-1">
          {feedback.strengths.map((s, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-white/80">
              <span className="text-green-400 mt-0.5 shrink-0">✓</span>{s}
            </li>
          ))}
        </ul>
      </div>
    )}

    {feedback.weaknesses?.length > 0 && (
      <div>
        <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-2">Areas to improve</p>
        <ul className="space-y-1">
          {feedback.weaknesses.map((w, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-white/80">
              <span className="text-red-400 mt-0.5 shrink-0">✗</span>{w}
            </li>
          ))}
        </ul>
      </div>
    )}

    {feedback.correctAnswer && (
      <div className="rounded-xl bg-white/5 border border-white/10 p-4">
        <p className="text-xs font-semibold text-brand-300 uppercase tracking-wider mb-2">Model answer</p>
        <p className="text-sm text-white/80 leading-relaxed">{feedback.correctAnswer}</p>
      </div>
    )}

    <button className="btn-primary w-full" onClick={onNext}>
      {isLast ? 'View full summary' : 'Next question →'}
    </button>
  </div>
);

const Interview = () => {
  const { sessionId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { answer, loading, error, session, isComplete } = useInterview();

  const [displayQuestion, setDisplayQuestion] = useState(state?.session?.question || null);
  const [feedback, setFeedback] = useState(null);
  const [progress, setProgress] = useState(
    state?.session ? { current: 0, total: state.session.totalQuestions } : null
  );
  const topRef = useRef(null);

  useEffect(() => {
    if (!state?.session && !displayQuestion) {
      navigate('/', { replace: true });
    }
  }, []);

  const handleAnswer = useCallback(async (text) => {
    try {
      const data = await answer(sessionId, text);
      setFeedback(data.feedback);
      setProgress(data.progress);
      topRef.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (_) {}
  }, [sessionId, answer]);

  const handleNext = useCallback(() => {
    if (isComplete) {
      navigate(`/summary/${sessionId}`);
      return;
    }
    if (session?.question) {
      setDisplayQuestion(session.question);
    }
    setFeedback(null);
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [isComplete, session, sessionId, navigate]);

  if (!displayQuestion) return null;

  const q = displayQuestion;
  const total = state?.session?.totalQuestions || q.totalQuestions;

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-4" ref={topRef}>
      {progress && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.round((progress.current / progress.total) * 100)}%` }}
            />
          </div>
          <span className="text-xs text-white/50 whitespace-nowrap">
            {progress.current}/{progress.total} answered
          </span>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      {!feedback && (
        <>
          <QuestionCard
            question={q.question}
            topic={q.topic}
            questionNumber={q.questionNumber}
            totalQuestions={total}
          />
          <AnswerBox onSubmit={handleAnswer} loading={loading} disabled={loading} />
        </>
      )}

      {feedback && (
        <FeedbackPanel
          feedback={feedback}
          onNext={handleNext}
          isLast={isComplete}
        />
      )}
    </div>
  );
};

export default Interview;

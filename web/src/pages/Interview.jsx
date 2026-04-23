import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import QuestionCard from '../components/QuestionCard';
import AnswerBox from '../components/AnswerBox';
import { useInterview } from '../hooks/useInterview';

const ScoreBadge = ({ score }) => {
  const color =
    score >= 8
      ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30 shadow-[0_0_15px_rgba(52,211,153,0.15)]'
      : score >= 5
      ? 'text-amber-400 bg-amber-400/10 border-amber-400/30 shadow-[0_0_15px_rgba(251,191,36,0.15)]'
      : 'text-rose-400 bg-rose-400/10 border-rose-400/30 shadow-[0_0_15px_rgba(251,113,133,0.15)]';
  return (
    <span className={`inline-flex items-center justify-center rounded-2xl border px-4 py-1.5 font-bold tracking-wide ${color}`}>
      {score}/10
    </span>
  );
};

const VERDICT_STYLE = {
  poor: 'text-rose-300',
  fair: 'text-amber-300',
  good: 'text-emerald-300',
  excellent: 'text-brand-200',
};

const FeedbackPanel = ({ feedback, onNext, isLast, loading }) => {
  if (!feedback) return null;
  return (
    <div className="card p-8 space-y-7 animate-slide-up">
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-2xl">📝</span> Feedback Report
        </h3>
        <ScoreBadge score={feedback.score} />
      </div>

      {feedback.verdict && (
        <p className={`text-sm font-semibold uppercase tracking-widest ${VERDICT_STYLE[feedback.verdict] || 'text-slate-300'}`}>
          Verdict: {feedback.verdict}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {feedback.strengths?.length > 0 && (
          <div className="bg-emerald-950/20 rounded-2xl p-5 border border-emerald-500/10">
            <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Strengths
            </p>
            <ul className="space-y-3">
              {feedback.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="text-emerald-500 mt-0.5 shrink-0 text-lg">✓</span>
                  <span className="leading-relaxed">{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {feedback.improvements?.length > 0 && (
          <div className="bg-rose-950/20 rounded-2xl p-5 border border-rose-500/10">
            <p className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              Areas to improve
            </p>
            <ul className="space-y-3">
              {feedback.improvements.map((w, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="text-rose-500 mt-0.5 shrink-0 text-lg">⚠️</span>
                  <span className="leading-relaxed">{w}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {feedback.modelAnswer && (
        <div className="rounded-2xl bg-brand-950/30 border border-brand-500/20 p-6 shadow-inner relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-brand-400 to-accent-400"></div>
          <p className="text-xs font-bold text-brand-300 uppercase tracking-widest mb-3">Model ideal response</p>
          <p className="text-sm text-slate-300 leading-relaxed italic">{feedback.modelAnswer}</p>
        </div>
      )}

      <div className="pt-2">
        <button className="btn-primary w-full shadow-glow py-4 text-lg" onClick={onNext} disabled={loading}>
          {loading ? 'Loading…' : isLast ? 'View Full Summary 🎉' : 'Next Question ➡️'}
        </button>
      </div>
    </div>
  );
};

const Interview = () => {
  const { sessionId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { answer, getSession, loading: interviewLoading, error: interviewError } = useInterview();

  const [role, setRole] = useState(state?.session?.role || '');
  const [question, setQuestion] = useState(state?.session?.question || null);
  const [feedback, setFeedback] = useState(null);
  const [isLastQuestion, setIsLastQuestion] = useState(false);
  const [progress, setProgress] = useState({
    current: state?.session?.results?.length || 0,
    total: state?.session?.totalQuestions || 5,
  });
  const [recoveryLoading, setRecoveryLoading] = useState(!state?.session);
  const [submitting, setSubmitting] = useState(false);
  const topRef = useRef(null);

  useEffect(() => {
    if (!state?.session && sessionId) {
      setRecoveryLoading(true);
      getSession({ sessionId })
        .then((session) => {
          setRole(session.role);
          setQuestion(session.currentQuestion);
          setIsLastQuestion(session.completed || session.results.length >= session.maxQuestions);
          setProgress({
            current: session.results.length,
            total: session.maxQuestions,
          });
        })
        .catch(() => navigate('/', { replace: true }))
        .finally(() => setRecoveryLoading(false));
    }
  }, [sessionId, state?.session, getSession, navigate]);

  const handleAnswer = useCallback(
    async (text) => {
      if (!question) return;
      setSubmitting(true);
      try {
        const data = await answer({ sessionId, question, answer: text, role });
        setFeedback(data.feedback);
        setIsLastQuestion(Boolean(data.isLastQuestion));
        setProgress({
          current: data.questionNumber ? data.questionNumber - 1 : (progress.current + 1),
          total: data.totalQuestions || progress.total,
        });
        if (data.nextQuestion) setQuestion(data.nextQuestion);
        topRef.current?.scrollIntoView({ behavior: 'smooth' });
      } catch (err) {
        console.error('Answer submission failed:', err);
      } finally {
        setSubmitting(false);
      }
    },
    [answer, progress.current, progress.total, question, role, sessionId]
  );

  const handleNext = useCallback(() => {
    if (isLastQuestion) {
      navigate(`/summary/${sessionId}`, { state: { role } });
      return;
    }
    setFeedback(null);
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [isLastQuestion, sessionId, navigate, role]);

  if (recoveryLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin h-10 w-10 border-4 border-brand-500 border-t-transparent rounded-full" />
        <p className="text-slate-400 animate-pulse">Resuming your interview session...</p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="card p-8 text-center text-slate-400">Loading interview…</div>
    );
  }

  const loading = interviewLoading;
  const error = interviewError;

  const total = progress.total || 5;

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6" ref={topRef}>
      <div className="flex items-center gap-4 bg-slate-900/40 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
        <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden border border-white/5 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-accent-400 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${Math.round((progress.current / total) * 100)}%` }}
          />
        </div>
        <span className="text-sm font-bold text-slate-300 whitespace-nowrap bg-white/5 py-1 px-3 rounded-full border border-white/10">
          {progress.current} / {total}
        </span>
      </div>

      {error && (
        <div className="animate-slide-up rounded-2xl bg-red-500/10 border border-red-500/30 p-5 text-red-200 flex items-center gap-3 shadow-[0_0_20px_rgba(239,68,68,0.15)]">
          <span className="text-xl">⚠️</span>
          <p className="font-medium">{error}</p>
        </div>
      )}

      {!feedback && (
        <>
          <QuestionCard
            question={question.question}
            topic={question.topic}
            questionNumber={progress.current + 1}
            totalQuestions={total}
          />
          <AnswerBox onSubmit={handleAnswer} loading={loading || submitting} />
          
          {(loading || submitting) && (
            <div className="animate-pulse flex flex-col items-center justify-center p-8 bg-brand-500/5 rounded-3xl border border-brand-500/20 mt-6">
              <div className="flex items-center gap-3 text-brand-400 font-bold tracking-wider uppercase text-xs mb-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
                </span>
                AI is evaluating your response
              </div>
              <p className="text-slate-400 text-sm text-center max-w-xs">
                Analyzing technical depth, clarity, and relevance to the {role} role...
              </p>
            </div>
          )}
        </>
      )}

      {feedback && (
        <FeedbackPanel
          feedback={feedback}
          onNext={handleNext}
          isLast={isLastQuestion}
          loading={loading}
        />
      )}
    </div>
  );
};

export default Interview;

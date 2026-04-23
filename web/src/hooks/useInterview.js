import { useCallback, useEffect, useState } from 'react';
import * as api from '../api/interviewApi';

export const useInterviewOptions = () => {
  const [options, setOptions] = useState({ roles: [], difficulties: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .getOptions()
      .then((data) => {
        if (!cancelled) setOptions(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'Failed to load options');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { options, loading, error };
};

export const useInterview = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [history, setHistory] = useState([]);
  const [isComplete, setIsComplete] = useState(false);

  const start = useCallback(async ({ role, difficulty, candidateName }) => {
    setLoading(true);
    setError(null);
    setFeedback(null);
    setHistory([]);
    setIsComplete(false);
    try {
      const data = await api.startInterview({ role, difficulty, candidateName });
      setSession(data);
      return data;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const answer = useCallback(
    async (sessionId, answerText) => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.submitAnswer({ sessionId, answer: answerText });
        setFeedback(data.feedback);
        setHistory((prev) => [...prev, data.feedback]);
        setIsComplete(Boolean(data.isComplete));
        if (data.nextQuestion) {
          setSession((prev) =>
            prev
              ? {
                  ...prev,
                  question: data.nextQuestion,
                }
              : prev
          );
        }
        return data;
      } catch (e) {
        setError(e.message);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const loadSummary = useCallback(async (sessionId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getSummary(sessionId);
      return data;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setSession(null);
    setFeedback(null);
    setHistory([]);
    setIsComplete(false);
    setError(null);
  }, []);

  return {
    loading,
    error,
    session,
    feedback,
    history,
    isComplete,
    start,
    answer,
    loadSummary,
    reset,
  };
};

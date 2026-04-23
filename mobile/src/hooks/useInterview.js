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

  const start = useCallback(async ({ role, difficulty, candidateName }) => {
    setLoading(true);
    setError(null);
    try {
      return await api.startInterview({ role, difficulty, candidateName });
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const answer = useCallback(async (sessionId, answerText) => {
    setLoading(true);
    setError(null);
    try {
      return await api.submitAnswer({ sessionId, answer: answerText });
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSummary = useCallback(async (sessionId) => {
    setLoading(true);
    setError(null);
    try {
      return await api.getSummary(sessionId);
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, start, answer, loadSummary };
};

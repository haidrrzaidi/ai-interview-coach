import { createClient } from '@insforge/sdk';

const baseUrl = process.env.REACT_APP_INSFORGE_URL;
const anonKey = process.env.REACT_APP_INSFORGE_ANON_KEY;

const insforge = createClient({ baseUrl, anonKey });

const invoke = async (action, body = {}) => {
  const { data, error } = await insforge.functions.invoke('interview', {
    body: { action, ...body }
  });
  
  if (error) {
    throw new Error(error.message || 'Function invocation failed');
  }
  return data;
};

export const getOptions = async () => {
  return await invoke('options');
};

export const startInterview = async ({ role, difficulty, candidateName }) => {
  return await invoke('start', { role, difficulty, candidateName });
};

export const submitAnswer = async ({ sessionId, question, answer, role }) => {
  return await invoke('answer', { sessionId, question, answer, role });
};

export const getSession = async ({ sessionId }) => {
  return await invoke('get', { sessionId });
};

export const getSummary = async ({ sessionId, role }) => {
  return await invoke('summary', { sessionId, role });
};

const interviewApi = {
  getOptions,
  startInterview,
  submitAnswer,
  getSession,
  getSummary,
};

export default interviewApi;

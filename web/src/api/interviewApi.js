import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.response.use(
  (r) => r,
  (error) => {
    const msg =
      error?.response?.data?.error ||
      error?.message ||
      'Network error. Please try again.';
    return Promise.reject(new Error(msg));
  }
);

export const getOptions = async () => {
  const { data } = await client.get('/interview/options');
  return data;
};

export const startInterview = async ({ role, difficulty, candidateName }) => {
  const { data } = await client.post('/interview/start', {
    role,
    difficulty,
    candidateName,
  });
  return data;
};

export const submitAnswer = async ({ sessionId, answer }) => {
  const { data } = await client.post('/interview/answer', { sessionId, answer });
  return data;
};

export const getSummary = async (sessionId) => {
  const { data } = await client.get(`/interview/summary/${sessionId}`);
  return data;
};

export default {
  getOptions,
  startInterview,
  submitAnswer,
  getSummary,
};

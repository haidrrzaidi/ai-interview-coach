# AI Interview Coach

A full-stack AI interview practice platform powered by **Claude Opus 4.7**.
Pick a role (Frontend, Backend, DevOps, etc.) and a difficulty (Junior / Mid /
Senior), get interviewed question-by-question, receive scored feedback on
every answer, and finish with a personalised performance report and study
plan.

## Tech stack

| Layer    | Stack                                                               |
|----------|---------------------------------------------------------------------|
| Backend  | Node.js · Express · `@anthropic-ai/sdk` · Claude Opus 4.7           |
| Web      | React · Tailwind CSS · React Router · Axios                         |
| Mobile   | React Native · Expo · React Navigation                              |

**AI features used:** adaptive thinking, prompt caching, streaming, structured
JSON outputs.

## Repo structure

```
ai-interview-coach/
├── backend/                 Node + Express + Claude API
│   ├── server.js
│   ├── routes/interview.js
│   ├── controllers/interviewController.js
│   ├── services/
│   │   ├── claudeService.js   (adaptive thinking + prompt caching)
│   │   └── sessionStore.js    (in-memory session store)
│   └── middleware/
│       ├── cors.js
│       └── errorHandler.js
├── web/                     React + Tailwind web client
│   └── src/
│       ├── pages/            Home.jsx · Interview.jsx · Summary.jsx
│       ├── components/       QuestionCard · AnswerBox · FeedbackPanel · RoleSelector · ProgressBar
│       ├── hooks/useInterview.js
│       └── api/interviewApi.js
├── mobile/                  React Native (Expo) app
│   └── src/
│       ├── screens/          HomeScreen · InterviewScreen · SummaryScreen
│       ├── components/       QuestionCard · FeedbackPanel
│       ├── hooks/useInterview.js
│       └── api/interviewApi.js
├── .gitignore
└── README.md
```

## Quick start

### 1. Backend

```bash
cd backend
cp .env.example .env          # then put your Claude key in .env
npm install
npm run dev                   # http://localhost:5000
```

Verify: `GET http://localhost:5000/health` should return
`{ "status": "OK", "claudeKey": true }`.

### 2. Web

```bash
cd web
cp .env.example .env          # REACT_APP_API_URL=http://localhost:5000/api
npm install
npm start                     # http://localhost:3000
```

### 3. Mobile (Expo)

```bash
cd mobile
npm install
npm start                     # scan QR with Expo Go
```

Edit `mobile/app.json` `expo.extra.apiUrl` to point at your machine's LAN IP if
testing on a physical device.

## API

Base path: `/api/interview`

| Method | Path                 | Body                                                                 |
|--------|----------------------|----------------------------------------------------------------------|
| GET    | `/options`           | —                                                                    |
| POST   | `/start`             | `{ role, difficulty, candidateName? }`                               |
| POST   | `/answer`            | `{ sessionId, question, answer, role? }`                             |
| POST   | `/summary`           | `{ sessionId, role? }`                                               |
| GET    | `/summary/:sessionId`| —                                                                    |

### Response shapes

**POST /start** →
```json
{
  "sessionId": "uuid",
  "question": { "id": "react-001", "question": "…", "topic": "React Hooks", "difficulty": "mid" },
  "questionNumber": 1,
  "totalQuestions": 5
}
```

**POST /answer** →
```json
{
  "feedback": {
    "score": 7,
    "verdict": "good",
    "strengths": ["…"],
    "improvements": ["…"],
    "modelAnswer": "…"
  },
  "nextQuestion": { "id": "…", "question": "…", "topic": "…" },
  "answeredCount": 1,
  "isLastQuestion": false,
  "totalQuestions": 5
}
```

**POST /summary** →
```json
{
  "summary": {
    "overallScore": 7.2,
    "overallVerdict": "promising",
    "strongTopics": ["…"],
    "weakTopics": ["…"],
    "studyPlan": ["…"]
  },
  "results": [ /* every answered question with score + feedback */ ]
}
```

## How Claude is used

`backend/services/claudeService.js` wraps three Claude calls:

1. **`generateQuestion(role, difficulty, askedIds)`** — asks for one fresh
   question as JSON.
2. **`scoreAnswer(question, userAnswer, role)`** — scores the candidate's
   answer with strengths, improvements, and a model answer.
3. **`generateSummary(role, results)`** — produces the final report from the
   full results array.

Every call uses:

- **Model:** `claude-opus-4-7`
- **Adaptive thinking:** `thinking: { type: "adaptive" }` — Claude decides
  when and how much to reason.
- **Prompt caching:** the interviewer system prompt is sent with
  `cache_control: { type: "ephemeral" }`, so the cache hits from the second
  request in a session onwards.
- **Streaming:** `client.messages.stream(...).finalMessage()` so long
  thinking sessions don't hit the request timeout.

## Production checklist

- Set `NODE_ENV=production` on the backend.
- Set `CORS_ORIGINS` to your real web/mobile origins.
- Protect the backend behind HTTPS (reverse proxy: Nginx / Caddy / Cloudflare).
- Swap `sessionStore.js` for Redis or a database if you need multi-instance
  deploys — the current store is in-memory and per-process.
- Tune `RATE_LIMIT_MAX` for your traffic pattern.
- Build the web client with `npm run build` and serve `web/build/` from a
  static host (Vercel, Netlify, Cloudflare Pages, S3 + CloudFront).
- For mobile, use `eas build` to produce App Store / Play Store artifacts.

## License

MIT

# AI Interview Coach

A full-stack AI interview practice platform powered by **Google Gemini 3.1 Pro Preview** and **Insforge Edge Functions**.
Pick a role (Frontend, Backend, DevOps, etc.) and a difficulty (Junior / Mid / Senior), get interviewed question-by-question, receive scored feedback on every answer, and finish with a personalised performance report and study plan.

## Tech Stack

| Layer    | Stack                                                               |
|----------|---------------------------------------------------------------------|
| Backend  | Insforge Edge Functions · Deno · Google Generative Language API (Gemini 3.1 Pro Preview) |
| Web      | React · Vite · Tailwind CSS · React Router · `@insforge/sdk`        |
| Database | PostgreSQL (managed via Insforge)                                   |

## Architecture

This project has been modernized to run entirely on a serverless architecture using Insforge. 

```
ai-interview-coach/
├── functions/               Insforge Edge Functions (Deno)
│   └── interview.js         The core AI logic and database communication
├── web/                     React + Vite + Tailwind web client
│   ├── src/
│   │   ├── pages/           Home.jsx · Interview.jsx · Summary.jsx
│   │   ├── components/      QuestionCard · AnswerBox · FeedbackPanel · RoleSelector
│   │   ├── hooks/           useInterview.js
│   │   └── api/             interviewApi.js (Insforge SDK integration)
│   ├── index.html
│   └── package.json
└── README.md
```

## Quick Start (Local Development)

### 1. Backend Setup

The backend relies on Insforge Serverless Edge Functions. You do not need to run a local backend server. 

1. Create a new Insforge project.
2. In your Insforge dashboard, add the following Environment Variables:
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
3. Deploy the Edge Function using the Insforge CLI or MCP Tool:
   ```bash
   insforge functions deploy interview
   ```
4. A PostgreSQL table `interview_sessions` is required to store session data. Create it in your Insforge database.

### 2. Web Frontend

1. Navigate to the `web` directory.
   ```bash
   cd web
   ```
2. Set up your environment variables by copying `.env.example` to `.env` and adding your Insforge URL and Anon Key.
   ```bash
   VITE_INSFORGE_URL=https://<your-project-id>.insforge.app
   VITE_INSFORGE_ANON_KEY=<your-anon-key>
   ```
3. Install dependencies and start the Vite development server:
   ```bash
   npm install
   npm run dev
   ```
4. Open `http://localhost:5173` to view the app.

## How Gemini AI is Used

The backend edge function (`functions/interview.js`) communicates directly with the Google Gemini REST API using native `fetch`. 

The function exposes a single endpoint that handles multiple actions via a JSON body payload:

1. **`start`**: Prompts Gemini to generate a fresh, relevant question based on the role and difficulty.
2. **`answer`**: Submits the user's answer to Gemini to be evaluated (0-10 score, verdict, strengths, improvements, and a model answer). It concurrently fetches the next question to optimize latency.
3. **`summary`**: Aggregates all Q&A data from the session and prompts Gemini to produce a final, comprehensive hiring report.

## Production Checklist

- Ensure the `GEMINI_API_KEY` is securely stored in Insforge Environment Variables (NOT hardcoded).
- Ensure RLS (Row Level Security) is properly configured in the Insforge database if implementing user authentication.
- Deploy the frontend `web` folder to Vercel, Netlify, or Insforge Hosting.

## License

MIT

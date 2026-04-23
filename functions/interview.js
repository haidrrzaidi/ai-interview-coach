import { createClient } from 'npm:@insforge/sdk';

export default async function(req) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, sessionId } = body;

    const insforge = createClient({
      baseUrl: Deno.env.get('INSFORGE_BASE_URL'),
      anonKey: Deno.env.get('ANON_KEY')
    });

    const apiKey = Deno.env.get('GEMINI_API_KEY') || 'AIzaSyDsy7G8IWsJlDCcfOTdBZwonLdohXAmDYw';

    const callAI = async (prompt) => {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-pro-preview:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    };

    if (action === 'options') {
      return new Response(JSON.stringify({
        roles: [
          { id: 'Frontend Developer', label: 'Frontend Developer' },
          { id: 'Backend Developer', label: 'Backend Developer' },
          { id: 'Full Stack Developer', label: 'Full Stack Developer' },
          { id: 'Mobile Developer', label: 'Mobile Developer' },
          { id: 'DevOps Engineer', label: 'DevOps Engineer' },
          { id: 'Data Engineer', label: 'Data Engineer' },
          { id: 'Machine Learning Engineer', label: 'Machine Learning Engineer' },
          { id: 'Android Developer', label: 'Android Developer' },
          { id: 'iOS Developer', label: 'iOS Developer' },
        ],
        difficulties: [
          { id: 'junior', label: 'Junior' },
          { id: 'mid', label: 'Mid' },
          { id: 'senior', label: 'Senior' },
        ],
        maxQuestions: 5,
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'start') {
      const { role, difficulty, candidateName } = body;
      const sId = crypto.randomUUID();
      const initialData = {
        role,
        difficulty,
        candidateName: candidateName || 'Candidate',
        askedIds: [],
        results: [],
        maxQuestions: 5,
      };

      await insforge.database.from('interview_sessions').insert([{ id: sId, session_data: initialData }]);

      const prompt = `You are an expert ${role} interviewer. Generate a technical interview question for a ${difficulty} level candidate. Return ONLY a JSON object: { "id": "unique_id", "topic": "Topic Name", "question": "Question text" }`;
      const responseText = await callAI(prompt);
      const question = JSON.parse(responseText.replace(/```json|```/g, '').trim());

      await insforge.database.from('interview_sessions').update({
        session_data: { ...initialData, askedIds: [question.id], currentQuestion: question }
      }).eq('id', sId);

      return new Response(JSON.stringify({
        sessionId: sId,
        question,
        questionNumber: 1,
        totalQuestions: 5,
        message: 'Session started!'
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'get') {
      const { data: sData, error: sError } = await insforge.database.from('interview_sessions').select('session_data').eq('id', sessionId).single();
      if (sError || !sData) {
        return new Response(JSON.stringify({ error: 'Session not found' }), { status: 404, headers: corsHeaders });
      }
      return new Response(JSON.stringify(sData.session_data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'answer') {
      const { question, answer } = body;
      const { data: sData } = await insforge.database.from('interview_sessions').select('session_data').eq('id', sessionId).single();
      if (!sData) return new Response(JSON.stringify({ error: 'Session not found' }), { status: 404, headers: corsHeaders });
      const session = sData.session_data;

      const evalPrompt = `Evaluate this answer for a ${session.role} position. Question: ${question.question}. Answer: ${answer}. Return JSON: { "score": 0-10, "verdict": "summary", "strengths": [], "improvements": [], "modelAnswer": "" }`;
      
      const updatedResults = [...session.results];
      const isLast = (updatedResults.length + 1) >= session.maxQuestions;

      const tasks = [callAI(evalPrompt)];
      if (!isLast) {
        const qPrompt = `Generate the next technical question for ${session.role} (${session.difficulty}). Avoid: ${session.askedIds.join(',')}. Return JSON: { "id": "id", "topic": "topic", "question": "text" }`;
        tasks.push(callAI(qPrompt));
      }

      const aiResults = await Promise.all(tasks);
      const feedback = JSON.parse(aiResults[0].replace(/```json|```/g, '').trim());
      
      const result = {
        question: question.question,
        topic: question.topic,
        userAnswer: answer,
        ...feedback
      };
      
      updatedResults.push(result);
      
      let nextQuestion = null;
      let updatedAskedIds = session.askedIds;

      if (aiResults[1]) {
        nextQuestion = JSON.parse(aiResults[1].replace(/```json|```/g, '').trim());
        updatedAskedIds = [...session.askedIds, nextQuestion.id];
      }

      await insforge.database.from('interview_sessions').update({
        session_data: {
          ...session,
          results: updatedResults,
          askedIds: updatedAskedIds,
          currentQuestion: nextQuestion,
          completed: isLast
        }
      }).eq('id', sessionId);

      return new Response(JSON.stringify({
        feedback,
        nextQuestion,
        questionNumber: updatedResults.length + (isLast ? 0 : 1),
        isLastQuestion: isLast,
        totalQuestions: session.maxQuestions
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (action === 'summary') {
      const { data: sData, error: sError } = await insforge.database.from('interview_sessions').select('session_data').eq('id', sessionId).single();
      if (sError || !sData) return new Response(JSON.stringify({ error: 'Session not found' }), { status: 404, headers: corsHeaders });
      const session = sData.session_data;

      const prompt = `Provide a final hiring summary for ${session.candidateName} for the ${session.role} role. Results: ${JSON.stringify(session.results)}. 
      Return ONLY a JSON object: { 
        "overallScore": 0-10, 
        "overallVerdict": "needs work" | "promising" | "interview-ready",
        "strongTopics": [],
        "weakTopics": [],
        "studyPlan": []
      }`;
      
      const responseText = await callAI(prompt);
      const summary = JSON.parse(responseText.replace(/```json|```/g, '').trim());

      return new Response(JSON.stringify({
        ...session,
        summary
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), { status: 400, headers: corsHeaders });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
}


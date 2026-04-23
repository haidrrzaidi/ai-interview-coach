const Anthropic = require('@anthropic-ai/sdk');

const MODEL = 'claude-opus-4-7';
const MAX_TOKENS = 2048;

let client = null;

const getClient = () => {
  if (client) return client;
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey || apiKey === 'your_claude_api_key_here') {
    const err = new Error('CLAUDE_API_KEY is not set. Add it to backend/.env');
    err.status = 500;
    throw err;
  }
  client = new Anthropic({ apiKey });
  return client;
};

const extractText = (message) => {
  if (!message || !Array.isArray(message.content)) return '';
  return message.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim();
};

const stripCodeFences = (s) => {
  let out = s.trim();
  if (out.startsWith('```')) {
    out = out.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '');
  }
  return out.trim();
};

const safeJsonParse = (raw) => {
  const cleaned = stripCodeFences(raw);
  try {
    return JSON.parse(cleaned);
  } catch (_e) {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch (_inner) {
        // fall through
      }
    }
    const err = new Error('Claude returned non-JSON output');
    err.status = 502;
    err.raw = cleaned;
    throw err;
  }
};

const callClaude = async ({ system, userPrompt, maxTokens = MAX_TOKENS }) => {
  const c = getClient();

  const systemBlocks = [
    {
      type: 'text',
      text: system,
      cache_control: { type: 'ephemeral' },
    },
  ];

  try {
    const stream = c.messages.stream({
      model: MODEL,
      max_tokens: maxTokens,
      thinking: { type: 'adaptive' },
      system: systemBlocks,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
    });

    const message = await stream.finalMessage();
    const text = extractText(message);
    if (!text) {
      const err = new Error('Claude returned empty response');
      err.status = 502;
      throw err;
    }
    return {
      text,
      usage: message.usage || null,
    };
  } catch (e) {
    if (e.status) throw e;
    const wrapped = new Error(`Claude API error: ${e.message || e}`);
    wrapped.status = e.status || 502;
    throw wrapped;
  }
};

const callClaudeJson = async (args) => {
  const { text, usage } = await callClaude(args);
  const parsed = safeJsonParse(text);
  return { data: parsed, usage };
};

module.exports = {
  MODEL,
  callClaude,
  callClaudeJson,
};

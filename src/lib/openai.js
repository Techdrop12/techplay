// ✅ /src/lib/openai.js (helper IA, fallback)
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default openai;

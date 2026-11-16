const { GoogleGenAI } = require('@google/genai');

const apiKey = process.env.GEMINI_API_KEY;
console.log('Testing Gemini API with server key:', apiKey ? `${apiKey.substring(0, 8)}...` : 'MISSING');

const ai = new GoogleGenAI({ apiKey });

async function verifyModels() {
  try {
    console.log('\nListing available models from Gemini API...');
    const response = await ai.models.list();
    console.log('Available models found:');
    for await (const model of response) {
      if (model.name.includes('flash') || model.name.includes('gemini')) {
        console.log(`- ${model.name} (Display: ${model.displayName}, InputTokens: ${model.inputTokenLimit})`);
      }
    }
  } catch (err) {
    console.error('List models error:', err.message);
  }
}

verifyModels();

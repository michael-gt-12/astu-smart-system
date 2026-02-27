/**
 * Google Gemini AI Configuration
 * Provides embedding model (text-embedding-004) and generative model (gemini-2.0-flash)
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
let embeddingModel = null;
let generativeModel = null;

const initGemini = () => {
    if (!process.env.GEMINI_API_KEY) {
        console.warn('[Gemini] API key not configured. RAG features will use fallback responses.');
        return false;
    }

    try {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        embeddingModel = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
        generativeModel = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });
        console.log('[Gemini] Initialized successfully.');
        return true;
    } catch (error) {
        console.error('[Gemini] Initialization failed:', error.message);
        return false;
    }
};

/**
 * Generate embedding vector for text
 */
const getEmbedding = async (text) => {
    if (!genAI) initGemini();
    if (!embeddingModel) throw new Error('Gemini embedding model not available');

    const result = await embeddingModel.embedContent({
        content: { parts: [{ text }] },
        outputDimensionality: 768
    });
    return result.embedding.values;
};

/**
 * Generate text response using Gemini
 */
const generateText = async (prompt) => {
    if (!genAI) initGemini();
    if (!generativeModel) throw new Error('Gemini generative model not available');

    const result = await generativeModel.generateContent(prompt);
    return result.response.text();
};

/**
 * Check if Gemini is configured
 */
const isConfigured = () => {
    if (!genAI) initGemini();
    return !!genAI;
};

module.exports = {
    initGemini,
    getEmbedding,
    generateText,
    isConfigured,
};

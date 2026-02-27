/**
 * Pinecone Vector Database Configuration
 */
const { Pinecone } = require('@pinecone-database/pinecone');

let pineconeClient = null;
let pineconeIndex = null;

const initPinecone = async () => {
    if (!process.env.PINECONE_API_KEY) {
        console.warn('[Pinecone] API key not configured. Vector search will be unavailable.');
        return false;
    }

    try {
        pineconeClient = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY,
        });

        const indexName = process.env.PINECONE_INDEX || 'astu-knowledge';
        pineconeIndex = pineconeClient.index(indexName);
        console.log(`[Pinecone] Connected to index: ${indexName}`);
        return true;
    } catch (error) {
        console.error('[Pinecone] Initialization failed:', error.message);
        return false;
    }
};

/**
 * Get the Pinecone index instance
 */
const getIndex = async () => {
    if (!pineconeIndex) await initPinecone();
    return pineconeIndex;
};

/**
 * Check if Pinecone is configured
 */
const isConfigured = () => {
    return !!process.env.PINECONE_API_KEY;
};

module.exports = {
    initPinecone,
    getIndex,
    isConfigured,
};

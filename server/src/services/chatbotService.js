/**
 * RAG-based AI Chatbot Service
 * Integrates Google Gemini for embeddings/generation and Pinecone for vector storage.
 * Includes PDF ingestion and complaint auto-summarization.
 */

const fs = require('fs');
const pdf = require('pdf-parse');
const { getEmbedding, generateText, isConfigured: isGeminiConfigured } = require('../config/gemini');
const { getIndex, isConfigured: isPineconeConfigured } = require('../config/pinecone');
const KnowledgeDoc = require('../models/KnowledgeDoc');

// Fallback rule-based knowledge (from original implementation)
const fallbackKnowledge = {
    greetings: '👋 **Hello!** Welcome to the ASTU Smart Complaint Assistant!\n\nI can help you with campus issues in dormitories, labs, internet, and classrooms. Please describe your issue!',
    help: '📖 **How I Can Help**\n\nI\'m your RAG-powered AI assistant. I can:\n1. Answer specific questions based on campus documentation.\n2. Suggest the right category for your complaint.\n3. Provide troubleshooting steps.\n\nJust type your question!',
    default: '🤔 **I\'m not sure about that.**\n\nPlease provide more details as my AI systems are currently initializing or don\'t have that specific information yet.',
};

/**
 * Chat with the RAG system
 */
const chat = async (message) => {
    try {
        if (!isGeminiConfigured() || !isPineconeConfigured()) {
            return { answer: fallbackKnowledge.greetings, suggestedCategory: null };
        }

        // 1. Generate query embedding
        const queryEmbedding = await getEmbedding(message);

        // 2. Search Pinecone for context
        const index = await getIndex();
        const searchResponse = await index.query({
            vector: queryEmbedding,
            topK: 5,
            includeMetadata: true,
        });

        const context = searchResponse.matches
            .map(match => match.metadata.text)
            .join('\n---\n');

        // 3. Generate response using Gemini with retrieved context
        const prompt = `
            You are the ASTU Smart Complaint Assistant, a helpful AI for university students and staff.
            Use the provided context to answer the user's question accurately.
            
            If the context doesn't contain the answer, use your general knowledge but mention it's not from official documentation.
            Keep responses helpful, concise, and use markdown formatting (bold, lists).
            
            Context:
            ${context || 'No specific documentation found for this query.'}
            
            User Question: ${message}
            
            Answer:
        `;

        const reply = await generateText(prompt);

        // 4. Suggest category based on the message
        const categoryPrompt = `
            Based on this user message, which category does it fit best?
            Choose ONLY ONE from: Dormitory Issues, Laboratory Equipment, Internet & Network, Classroom Facilities, Other.
            Give only the category name.
            
            User Message: ${message}
        `;
        const suggestedCategory = await generateText(categoryPrompt);

        return {
            reply: reply.trim(),
            suggestedCategory: suggestedCategory.trim() !== 'Other' ? suggestedCategory.trim() : null
        };
    } catch (error) {
        console.error('[ChatbotService] Chat error:', error);
        return {
            reply: '❌ I encountered an error processing your request. Please try again later.',
            suggestedCategory: null
        };
    }
};

/**
 * Ingest PDF into the RAG system
 */
const ingestPdf = async (filePath, originalName, userId) => {
    try {
        // 1. Parse PDF
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        const text = data.text;
        console.log(`[ChatbotService] Extracted ${text.length} characters from ${originalName}`);

        if (!text.trim()) {
            throw new Error('Could not extract any text from the PDF. It might be a scanned image or empty.');
        }

        // 2. Chunk text (~1000 chars)
        const chunks = [];
        const chunkSize = 1000;
        for (let i = 0; i < text.length; i += chunkSize) {
            chunks.push(text.substring(i, i + chunkSize));
        }
        console.log(`[ChatbotService] Split into ${chunks.length} chunks`);

        // 3. Embed chunks and prepare for Pinecone
        const pineconeVectors = [];
        const pineconeIds = [];

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i].trim();
            if (chunk.length < 20) continue;

            const embedding = await getEmbedding(chunk);
            const id = `${Date.now()}_${i}`;

            pineconeVectors.push({
                id,
                values: embedding,
                metadata: {
                    text: chunk,
                    source: originalName,
                }
            });
            pineconeIds.push(id);
        }

        if (pineconeVectors.length === 0) {
            throw new Error('No valid text chunks were found in the document (chunks too small).');
        }

        // 4. Upsert to Pinecone
        const index = await getIndex();
        console.log(`[ChatbotService] Upserting ${pineconeVectors.length} vectors to Pinecone...`);
        await index.upsert({ records: pineconeVectors });

        // 5. Save metadata to MongoDB
        const doc = await KnowledgeDoc.create({
            filename: filePath.split('/').pop().split('\\').pop(),
            originalName,
            uploadedBy: userId,
            chunkCount: pineconeVectors.length,
            pineconeIds,
            fileSize: dataBuffer.length,
        });

        return doc;
    } catch (error) {
        console.error('[ChatbotService] Ingestion error:', error);
        throw error;
    }
};

/**
 * Remove document from RAG index
 */
const deletePdfFromIndex = async (docId) => {
    try {
        const doc = await KnowledgeDoc.findById(docId);
        if (!doc) throw new Error('Document not found');

        // 1. Delete from Pinecone
        const index = await getIndex();
        if (doc.pineconeIds && doc.pineconeIds.length > 0) {
            await index.deleteMany(doc.pineconeIds);
        }

        // 2. Delete file if it exists
        const filePath = `./uploads/knowledge/${doc.filename}`;
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // 3. Delete from MongoDB
        await KnowledgeDoc.findByIdAndDelete(docId);

        return true;
    } catch (error) {
        console.error('[ChatbotService] Deletion error:', error);
        throw error;
    }
};


module.exports = {
    chat,
    ingestPdf,
    deletePdfFromIndex,
};

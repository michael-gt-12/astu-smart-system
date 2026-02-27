const { chat: chatService } = require('../services/chatbotService');

// Chat with AI assistant
exports.chat = async (req, res, next) => {
    try {
        const { message } = req.body;
        const response = await chatService(message);

        res.json({
            success: true,
            data: {
                reply: response.reply,
                suggestedCategory: response.suggestedCategory || null,
            },
        });
    } catch (error) {
        next(error);
    }
};

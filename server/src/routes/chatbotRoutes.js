const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const { authenticate } = require('../middlewares/auth');
const { validate, chatbotSchema } = require('../middlewares/validate');

router.post('/', authenticate, validate(chatbotSchema), chatbotController.chat);

module.exports = router;

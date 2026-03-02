const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate, categorySchema } = require('../middlewares/validate');

// Public - get all categories
router.get('/', authenticate, categoryController.getCategories);

module.exports = router;

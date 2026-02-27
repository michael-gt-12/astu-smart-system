const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate, categorySchema } = require('../middlewares/validate');

// Public - get all categories
router.get('/', authenticate, categoryController.getCategories);

// Admin only
router.post('/', authenticate, authorize('admin'), validate(categorySchema), categoryController.createCategory);
router.put('/:id', authenticate, authorize('admin'), validate(categorySchema), categoryController.updateCategory);
router.delete('/:id', authenticate, authorize('admin'), categoryController.deleteCategory);

module.exports = router;

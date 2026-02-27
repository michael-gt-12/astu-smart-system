const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validate, updateUserSchema } = require('../middlewares/validate');

router.get('/', authenticate, authorize('admin'), userController.getUsers);
router.get('/staff', authenticate, authorize('admin', 'category_staff'), userController.getStaffList);
router.put('/:id', authenticate, authorize('admin'), validate(updateUserSchema), userController.updateUser);
router.delete('/:id', authenticate, authorize('admin'), userController.deleteUser);

module.exports = router;

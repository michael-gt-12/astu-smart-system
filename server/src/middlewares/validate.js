const Joi = require('joi');

// Validation middleware factory
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const messages = error.details.map((d) => d.message).join(', ');
            return res.status(400).json({
                success: false,
                message: messages,
            });
        }

        next();
    };
};

// Auth validation schemas
const registerSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required().messages({
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name must not exceed 100 characters',
        'any.required': 'Name is required',
    }),
    email: Joi.string().email().trim().lowercase().required().messages({
        'string.email': 'Please enter a valid email',
        'any.required': 'Email is required',
    }),
    password: Joi.string().min(6).max(128).required().messages({
        'string.min': 'Password must be at least 6 characters',
        'any.required': 'Password is required',
    }),
    role: Joi.string().valid('student').default('student'),
});

const loginSchema = Joi.object({
    email: Joi.string().email().trim().lowercase().required().messages({
        'string.email': 'Please enter a valid email',
        'any.required': 'Email is required',
    }),
    password: Joi.string().required().messages({
        'any.required': 'Password is required',
    }),
});

// Complaint validation schemas
const createComplaintSchema = Joi.object({
    title: Joi.string().trim().min(3).max(200).required().messages({
        'string.min': 'Title must be at least 3 characters',
        'string.max': 'Title must not exceed 200 characters',
        'any.required': 'Title is required',
    }),
    description: Joi.string().trim().min(10).max(5000).required().messages({
        'string.min': 'Description must be at least 10 characters',
        'string.max': 'Description must not exceed 5000 characters',
        'any.required': 'Description is required',
    }),
    category: Joi.string().required().messages({
        'any.required': 'Category is required',
    }),
});

const updateComplaintSchema = Joi.object({
    status: Joi.string().valid('Open', 'In Progress', 'Pending Student Verification', 'Resolved'),
    remarks: Joi.string().trim().max(2000).allow(''),
});

// Category validation schemas
const categorySchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required().messages({
        'string.min': 'Category name must be at least 2 characters',
        'any.required': 'Category name is required',
    }),
    description: Joi.string().trim().max(500).allow('').default(''),
});

// User update validation
const updateUserSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100),
    role: Joi.string().valid('student', 'category_staff', 'admin'),
});

// Chatbot validation
const chatbotSchema = Joi.object({
    message: Joi.string().trim().min(1).max(1000).required().messages({
        'any.required': 'Message is required',
    }),
});

module.exports = {
    validate,
    registerSchema,
    loginSchema,
    createComplaintSchema,
    updateComplaintSchema,
    categorySchema,
    updateUserSchema,
    chatbotSchema,
};

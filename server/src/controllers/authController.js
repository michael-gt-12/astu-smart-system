const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {
    generateAccessToken,
    generateRefreshToken,
    setRefreshTokenCookie,
    clearRefreshTokenCookie,
} = require('../utils/tokenUtils');

// Register
exports.register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists.',
            });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: 'student',
        });

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        setRefreshTokenCookie(res, refreshToken);

        res.status(201).json({
            success: true,
            message: 'Registration successful.',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                accessToken,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Login
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
            });
        }

        if (!user.password) {
            return res.status(401).json({
                success: false,
                message: 'This account uses Google login. Please sign in with Google.',
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.',
            });
        }

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        setRefreshTokenCookie(res, refreshToken);

        res.json({
            success: true,
            message: 'Login successful.',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                accessToken,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Refresh token
exports.refresh = async (req, res, next) => {
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'No refresh token provided.',
            });
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found.',
            });
        }

        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken(user);
        setRefreshTokenCookie(res, newRefreshToken);

        res.json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                accessToken: newAccessToken,
            },
        });
    } catch (error) {
        clearRefreshTokenCookie(res);
        return res.status(401).json({
            success: false,
            message: 'Invalid refresh token.',
        });
    }
};

// Get current user
exports.getMe = async (req, res) => {
    res.json({
        success: true,
        data: {
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role,
            },
        },
    });
};

// Logout
exports.logout = (req, res) => {
    clearRefreshTokenCookie(res);
    res.json({
        success: true,
        message: 'Logged out successfully.',
    });
};

// Google OAuth callback
exports.googleCallback = (req, res) => {
    try {
        const user = req.user;
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);
        setRefreshTokenCookie(res, refreshToken);

        // Redirect to frontend with token
        res.redirect(
            `${process.env.CLIENT_URL}/auth/google/callback?token=${accessToken}`
        );
    } catch (error) {
        res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
    }
};

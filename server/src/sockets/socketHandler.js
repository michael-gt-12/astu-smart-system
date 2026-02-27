const jwt = require('jsonwebtoken');

const setupSocket = (io) => {
    // Auth middleware for socket connections
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication required'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.id;
            socket.userRole = decoded.role;
            next();
        } catch (error) {
            return next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`[Socket] User connected: ${socket.userId}`);

        // Join user's personal room for targeted notifications
        socket.join(`user_${socket.userId}`);

        // Join role-based room
        socket.join(`role_${socket.userRole}`);

        socket.on('disconnect', () => {
            console.log(`[Socket] User disconnected: ${socket.userId}`);
        });
    });
};

module.exports = setupSocket;

import jwt from 'jsonwebtoken';

export function initSocket(io) {
  // Auth middleware — verify JWT on socket handshake
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const { id: userId, classId } = socket.user;

    // Personal room for DMs and notifications
    socket.join(`user:${userId}`);

    // Class room for group chat, Q&A, announcements
    if (classId) socket.join(`class:${classId}`);

    // Allow teachers/admins to join other class rooms (e.g. switching class view)
    socket.on('join:class', (cId) => {
      socket.join(`class:${cId}`);
    });

    socket.on('leave:class', (cId) => {
      socket.leave(`class:${cId}`);
    });

    socket.on('disconnect', () => {
      // socket.io handles room cleanup automatically
    });
  });
}

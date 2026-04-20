import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { initDb, query } from './src/server/db.js';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Routes
import authRoutes from './src/server/routes/auth.js';
import propertyRoutes from './src/server/routes/properties.js';
import reviewRoutes from './src/server/routes/reviews.js';
import chatRoutes from './src/server/routes/chat.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  // Initialize Database
  await initDb();

  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Socket.io Logic
  io.on('connection', (socket) => {
    console.log('👤 User connected:', socket.id);

    socket.on('join_room', (data) => {
      const { userId, recipientId, propertyId } = data;
      // Define a unique room name for the conversation context
      const roomIds = [userId, recipientId].sort((a, b) => a - b);
      const roomName = `chat:${roomIds[0]}:${roomIds[1]}:${propertyId || 'general'}`;
      socket.join(roomName);
      console.log(`🏠 User ${userId} joined room: ${roomName}`);
    });

    socket.on('send_message', async (data) => {
      const { senderId, receiverId, propertyId, content } = data;
      const roomIds = [senderId, receiverId].sort((a, b) => a - b);
      const roomName = `chat:${roomIds[0]}:${roomIds[1]}:${propertyId || 'general'}`;

      try {
        // Save to DB
        const result = await query(
          'INSERT INTO messages (sender_id, receiver_id, property_id, content) VALUES ($1, $2, $3, $4) RETURNING *',
          [senderId, receiverId, propertyId, content]
        );
        
        // Broadcast to the room
        io.to(roomName).emit('receive_message', result.rows[0]);
      } catch (err) {
        console.error('Error saving message:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log('🔌 User disconnected');
    });
  });

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/properties', propertyRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/chat', chatRoutes);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

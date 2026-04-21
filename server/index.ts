import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { initDb, query } from './db.js';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Routes
import authRoutes from './routes/auth.js';
import propertyRoutes from './routes/properties.js';
import reviewRoutes from './routes/reviews.js';
import chatRoutes from './routes/chat.js';
import tourRoutes from './routes/tours.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  console.log('🏁 Starting server initialization...');
  
  // Initialize Database
  try {
    console.log('📅 Initializing database...');
    await initDb();
    console.log('✅ Database initialization complete.');
  } catch (err) {
    console.error('❌ Database initialization failed:', err);
    // Don't exit here, attempt to start server anyway
  }

  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
  
  const PORT = 3000; // Hardcode as per platform instructions
  const FRONTEND_URL = process.env.FRONTEND_URL || '*';

  app.use(cors({
    origin: true, // Reflect request origin
    credentials: true
  }));
  app.use(express.json());

  // Handle JSON parsing errors
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
      return res.status(400).json({ error: 'Invalid JSON payload' });
    }
    next();
  });

  // Request Logging
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl || req.url}`);
    next();
  });

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

  // AI Assistant Context logic wrapper
  const getAiContext = async (req: express.Request, res: express.Response) => {
    console.log(`🤖 AI Context requested by ${req.ip} - ${req.url}`);
    try {
      const toursResult = await query('SELECT id, title, description, city, price, duration FROM tours LIMIT 10');
      const propertiesResult = await query('SELECT id, title, description, city, price, type FROM properties LIMIT 10');
      res.json({
        tours: toursResult.rows,
        properties: propertiesResult.rows
      });
    } catch (err) {
      console.error('AI Context Error:', err);
      res.json({ tours: [], properties: [] });
    }
  };

  // Dedicated AI Context Endpoint (direct mount for reliability)
  app.get('/api/ai/context', getAiContext);

  // API Router setup
  const apiRouter = express.Router();
  apiRouter.get('/ai/context', getAiContext); // Also add to router for redundancy
  apiRouter.use('/auth', authRoutes);
  apiRouter.use('/properties', propertyRoutes);
  apiRouter.use('/reviews', reviewRoutes);
  apiRouter.use('/chat', chatRoutes);
  apiRouter.use('/tours', tourRoutes);

  // Health check
  apiRouter.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Mount API router
  app.use('/api', apiRouter);

  // Log registered routes
  console.log('--- Registered API Routes ---');
  apiRouter.stack.forEach((r: any) => {
    if (r.route && r.route.path) {
      const methods = Object.keys(r.route.methods || {}).join(',').toUpperCase();
      console.log(`${methods} /api${r.route.path}`);
    } else if (r.name === 'router') {
      // Sub-routers like /auth
      const routerPath = r.regexp.toString()
        .replace('/^\\', '')
        .replace('\\/?(?=\\/|$)/i', '')
        .replace(/\\/g, '');
      console.log(`MOUNTED /api/${routerPath}`);
    }
  });
  console.log('-----------------------------');

  // Global Error Handler for API
  app.use('/api', (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('API Error:', err);
    res.status(err.status || 500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
    });
  });

  // Specific catch-all for unknown /api routes to prevent HTML/SPA fallback
  app.all('/api/*', (req, res) => {
    res.status(404).json({ 
      error: 'Not Found', 
      message: `API endpoint ${req.method} ${req.originalUrl} does not exist` 
    });
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

  console.log(`📡 Attempting to listen on port ${PORT}...`);
  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server fully started and listening on http://0.0.0.0:${PORT}`);
    console.log('--- Ready to serve requests ---');
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

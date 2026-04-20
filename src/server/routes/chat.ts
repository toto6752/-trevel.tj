import express from 'express';
import { query } from '../db.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get conversation with a specific user
router.get('/:recipientId', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user?.id;
  const recipientId = req.params.recipientId;

  try {
    const result = await query(
      `SELECT * FROM messages 
       WHERE (sender_id = $1 AND receiver_id = $2) 
          OR (sender_id = $2 AND receiver_id = $1)
       ORDER BY created_at ASC`,
      [userId, recipientId]
    );

    // Mark messages as read
    await query(
      'UPDATE messages SET is_read = true WHERE receiver_id = $1 AND sender_id = $2',
      [userId, recipientId]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch conversation' });
  }
});

// Send a message
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  const { receiver_id, content } = req.body;
  const sender_id = req.user?.id;

  if (!content) return res.status(400).json({ error: 'Message content is required' });

  try {
    const result = await query(
      'INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING *',
      [sender_id, receiver_id, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;

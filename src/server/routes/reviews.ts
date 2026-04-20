import express from 'express';
import { query } from '../db.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get reviews for a property
router.get('/:propertyId', async (req, res) => {
  try {
    const result = await query(
      `SELECT r.*, u.name as user_name 
       FROM reviews r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.property_id = $1 
       ORDER BY r.created_at DESC`,
      [req.params.propertyId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Post a review
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  const { property_id, rating, comment } = req.body;
  const user_id = req.user?.id;

  try {
    // Insert review
    const result = await query(
      'INSERT INTO reviews (property_id, user_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
      [property_id, user_id, rating, comment]
    );

    // Update property average rating
    await query(
      `UPDATE properties 
       SET rating = (SELECT AVG(rating) FROM reviews WHERE property_id = $1)
       WHERE id = $1`,
      [property_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to post review' });
  }
});

export default router;

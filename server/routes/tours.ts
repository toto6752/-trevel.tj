import express from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';
import { authenticateToken, AuthRequest, authorizeRoles } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route GET /api/tours
 * @desc Get all tours
 * @access Public
 */
router.get('/', async (req, res) => {
  try {
    const { city, maxPrice, q } = req.query;
    
    let sql = 'SELECT * FROM tours WHERE 1=1';
    const params: any[] = [];
    
    if (city && city !== 'Все') {
      params.push(city);
      sql += ` AND city = $${params.length}`;
    }
    
    if (maxPrice) {
      params.push(maxPrice);
      sql += ` AND price <= $${params.length}`;
    }
    
    if (q) {
      params.push(`%${q}%`);
      sql += ` AND (title ILIKE $${params.length} OR description ILIKE $${params.length} OR duration ILIKE $${params.length})`;
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch tours error:', err);
    res.status(500).json({ error: 'Failed to fetch tours' });
  }
});

/**
 * @route GET /api/tours/:id
 * @desc Get single tour with reviews
 * @access Public
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const tourResult = await query('SELECT * FROM tours WHERE id = $1', [id]);
    
    if (tourResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    // Track history if user is logged in
    const authHeader = req.headers.authorization;
    if (authHeader) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        await query(
          'INSERT INTO history (user_id, tour_id) VALUES ($1, $2)',
          [decoded.id, id]
        );
      } catch (e) {
        // Error tracking history shouldn't break the response
      }
    }

    const reviewsResult = await query(`
      SELECT r.*, u.name as user_name 
      FROM reviews r 
      JOIN users u ON r.user_id = u.id 
      WHERE r.tour_id = $1 
      ORDER BY r.created_at DESC
    `, [id]);

    res.json({
      ...tourResult.rows[0],
      reviews: reviewsResult.rows
    });
  } catch (err) {
    console.error('Fetch tour error:', err);
    res.status(500).json({ error: 'Failed to fetch tour details' });
  }
});

/**
 * @route PUT /api/tours/:id
 * @desc Update a tour (Owner/Admin only)
 * @access Private
 */
router.put('/:id', authenticateToken, authorizeRoles('creator', 'admin'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { title, description, city, price, duration, images, contacts } = req.body;

    const tourResult = await query('SELECT owner_id FROM tours WHERE id = $1', [id]);
    if (tourResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    if (req.user?.role !== 'admin' && tourResult.rows[0].owner_id !== req.user?.id) {
      return res.status(403).json({ error: 'You can only edit your own tours' });
    }

    const result = await query(
      'UPDATE tours SET title = $1, description = $2, city = $3, price = $4, duration = $5, images = $6, contacts = $7 WHERE id = $8 RETURNING *',
      [title, description, city, price, duration, JSON.stringify(images || []), contacts, id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update tour error:', err);
    res.status(500).json({ error: 'Failed to update tour' });
  }
});

/**
 * @route POST /api/tours
 * @desc Create a new tour (Creator/Admin only)
 * @access Private
 */
router.post('/', authenticateToken, authorizeRoles('creator', 'admin'), async (req: AuthRequest, res) => {
  try {
    const { title, description, city, price, duration, images, contacts } = req.body;

    // Validation
    if (!title || !city || !price) {
      return res.status(400).json({ error: 'Title, city and price are required' });
    }

    const result = await query(
      'INSERT INTO tours (title, description, city, price, duration, images, contacts, owner_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [title, description, city, price, duration, JSON.stringify(images || []), contacts, req.user.id]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create tour error:', err);
    res.status(500).json({ error: 'Failed to create tour' });
  }
});

/**
 * @route DELETE /api/tours/:id
 * @desc Delete a tour (Owner/Admin only)
 * @access Private
 */
router.delete('/:id', authenticateToken, authorizeRoles('creator', 'admin'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const tourResult = await query('SELECT owner_id FROM tours WHERE id = $1', [id]);
    if (tourResult.rows.length === 0) {
      return res.status(404).json({ error: 'Tour not found' });
    }

    if (req.user?.role !== 'admin' && tourResult.rows[0].owner_id !== req.user?.id) {
      return res.status(403).json({ error: 'You can only delete your own tours' });
    }

    await query('DELETE FROM tours WHERE id = $1', [id]);
    res.json({ message: 'Tour deleted successfully' });
  } catch (err) {
    console.error('Delete tour error:', err);
    res.status(500).json({ error: 'Failed to delete tour' });
  }
});

/**
 * @route GET /api/tours/me/created
 * @desc Get tours created by current user
 * @access Private (Creator/Admin)
 */
router.get('/me/created', authenticateToken, authorizeRoles('creator', 'admin'), async (req: AuthRequest, res) => {
  try {
    const result = await query('SELECT * FROM tours WHERE owner_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch my tours error:', err);
    res.status(500).json({ error: 'Failed to fetch your tours' });
  }
});

/**
 * @route GET /api/tours/me/favorites
 * @desc Get favorites for current user
 * @access Private
 */
router.get('/me/favorites', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const result = await query(`
      SELECT t.* 
      FROM favorites f 
      JOIN tours t ON f.tour_id = t.id 
      WHERE f.user_id = $1 
      ORDER BY f.created_at DESC
    `, [req.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch favorites error:', err);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

/**
 * @route POST /api/tours/me/favorites
 * @desc Add tour to favorites
 * @access Private
 */
router.post('/me/favorites', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { tourId } = req.body;
    await query('INSERT INTO favorites (user_id, tour_id) VALUES ($1, $2) ON CONFLICT(user_id, tour_id) DO NOTHING', [req.user.id, tourId]);
    res.json({ message: 'Added to favorites' });
  } catch (err) {
    console.error('Add to favorites error:', err);
    res.status(500).json({ error: 'Failed to add to favorites' });
  }
});

/**
 * @route DELETE /api/tours/me/favorites/:tourId
 * @desc Remove tour from favorites
 * @access Private
 */
router.delete('/me/favorites/:tourId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { tourId } = req.params;
    await query('DELETE FROM favorites WHERE user_id = $1 AND tour_id = $2', [req.user.id, tourId]);
    res.json({ message: 'Removed from favorites' });
  } catch (err) {
    console.error('Remove from favorites error:', err);
    res.status(500).json({ error: 'Failed to remove from favorites' });
  }
});

/**
 * @route GET /api/tours/me/history
 * @desc Get viewing history for current user
 * @access Private
 */
router.get('/me/history', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const result = await query(`
      SELECT t.*, h.viewed_at
      FROM history h 
      JOIN tours t ON h.tour_id = t.id 
      WHERE h.user_id = $1 
      GROUP BY t.id
      ORDER BY h.viewed_at DESC
      LIMIT 20
    `, [req.user.id]);
    
    // Sort the final result by viewed_at manually after DISTINCT ON
    const sortedResult = result.rows.sort((a, b) => 
      new Date(b.viewed_at).getTime() - new Date(a.viewed_at).getTime()
    );
    
    res.json(sortedResult);
  } catch (err) {
    console.error('Fetch history error:', err);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

export default router;

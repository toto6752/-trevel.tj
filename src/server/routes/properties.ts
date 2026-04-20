import express from 'express';
import { query } from '../db.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// Get all properties with optional filtering
router.get('/', async (req, res) => {
  const { city, type, maxPrice } = req.query;
  
  try {
    let sql = 'SELECT * FROM properties WHERE 1=1';
    const params: any[] = [];
    
    if (city && city !== 'Все') {
      params.push(city);
      sql += ` AND city = $${params.length}`;
    }
    
    if (type && type !== 'Все') {
      params.push(type);
      sql += ` AND type = $${params.length}`;
    }
    
    if (maxPrice) {
      params.push(maxPrice);
      sql += ` AND price <= $${params.length}`;
    }
    
    sql += ' ORDER BY created_at DESC';
    
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// Get single property
router.get('/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM properties WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch property details' });
  }
});

// Create property (Owner/Admin only)
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  const { title, description, city, price, type, image_url, amenities } = req.body;
  const owner_id = req.user?.id;

  try {
    const result = await query(
      `INSERT INTO properties (title, description, city, price, type, image_url, owner_id, amenities)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [title, description, city, price, type, image_url, owner_id, amenities]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create property' });
  }
});

export default router;

const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { feedbackSchema } = require('../schemas');

// GET /api/feedback - List all feedback (Admin only)
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('*, projects(title), profiles(email)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/feedback/me - List my feedback (Member)
router.get('/me', requireAuth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('feedback')
      .select('*, projects(title)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/feedback - Submit feedback
router.post('/', requireAuth, async (req, res) => {
  try {
    const validatedData = feedbackSchema.parse(req.body);
    
    const { data, error } = await supabase
      .from('feedback')
      .insert([{ ...validatedData, user_id: req.user.id }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation Error', details: err.errors });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

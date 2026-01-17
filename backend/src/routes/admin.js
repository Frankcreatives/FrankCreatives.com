const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { requireAuth, requireAdmin } = require('../middleware/auth');

// GET /api/admin/stats - Dashboard stats
router.get('/stats', requireAuth, requireAdmin, async (req, res) => {
  try {
    const [
      { count: usersCount },
      { count: projectsCount },
      { count: feedbackCount }
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('projects').select('*', { count: 'exact', head: true }),
      supabase.from('feedback').select('*', { count: 'exact', head: true })
    ]);

    // Simple "most active project" logic: project with most feedback
    // Note: Supabase JS doesn't support complex aggregation easily without RPC.
    // We will do a separate query or basic calculation here.
    // For MVP, we can just fetch feedback and count in JS if dataset is small, or use RPC.
    // Let's use a simple distinct count for now or skip complex analysis to keep it fast.
    // Alternative: Count feedback grouped by project_id
    
    // Using a simplified approach: just return counts for now.
    
    res.json({
      totalUsers: usersCount,
      totalProjects: projectsCount,
      totalFeedback: feedbackCount
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/users - List users
router.get('/users', requireAuth, requireAdmin, async (req, res) => {
  try {
      const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

      if (error) throw error;
      res.json(data);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/feedback - List all feedback
router.get('/feedback', requireAuth, requireAdmin, async (req, res) => {
  try {
    console.log('Admin fetching feedback...');
    // Join with profiles to get user email if possible, but Supabase simple join syntax:
    // .select('*, profiles(email)')
    const { data, error } = await supabase
      .from('feedback')
      .select('*, profiles(email)')
      .order('created_at', { ascending: false });

    if (error) {
        console.error('Supabase error fetching feedback:', error);
        throw error;
    }
    console.log(`Fetched ${data.length} feedback items.`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin/feedback/:id
router.delete('/feedback/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { error } = await supabase
            .from('feedback')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ message: 'Feedback deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/admin/feedback/:id/reply - Reply to feedback
router.put('/feedback/:id/reply', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { reply } = req.body;
        if (!reply) return res.status(400).json({ error: 'Reply text is required' });

        const { data, error } = await supabase
            .from('feedback')
            .update({ 
                admin_reply: reply, 
                replied_at: new Date() 
            })
            .eq('id', req.params.id)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

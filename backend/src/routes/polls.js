const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { z } = require('zod');

// Schema for creating a poll
const pollSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  options: z.array(z.string().min(1, 'Option text required')).min(2, 'At least 2 options required')
});

// GET /api/polls - List all active polls with options and vote counts
router.get('/', async (req, res) => {
  try {
    // 1. Get Active Polls
    const { data: polls, error: pollError } = await supabase
      .from('polls')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (pollError) throw pollError;

    // 2. Fetch Options & Votes for each poll
    const pollsWithDetails = await Promise.all(polls.map(async (poll) => {
      // Get Options
      const { data: options, error: optError } = await supabase
        .from('poll_options')
        .select('*')
        .eq('poll_id', poll.id);
      
      if (optError) throw optError;

      // Get Vote Counts
      const { data: votes, error: voteError } = await supabase
        .from('poll_votes')
        .select('option_id')
        .eq('poll_id', poll.id);

      if (voteError) throw voteError;

      // Calculate counts
      const optionsWithCounts = options.map(opt => ({
        ...opt,
        votes: votes.filter(v => v.option_id === opt.id).length
      }));

      const totalVotes = votes.length;

      return {
        ...poll,
        options: optionsWithCounts,
        totalVotes
      };
    }));

    res.json(pollsWithDetails);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/polls - Create a new poll (Admin)
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { question, options } = pollSchema.parse(req.body);

    // 1. Create Poll
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert([{ question, created_by: req.user.id }])
      .select()
      .single();

    if (pollError) throw pollError;

    // 2. Create Options
    const optionsData = options.map(opt => ({
      poll_id: poll.id,
      option_text: opt
    }));

    const { error: optError } = await supabase
      .from('poll_options')
      .insert(optionsData);

    if (optError) throw optError;

    res.status(201).json(poll);
  } catch (err) {
     if (err.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation Error', details: err.errors });
    }
    res.status(500).json({ error: err.message });
  }
});

// POST /api/polls/:id/vote - Vote on a poll
router.post('/:id/vote', requireAuth, async (req, res) => {
  try {
    const { option_id } = req.body;
    if (!option_id) return res.status(400).json({ error: 'Option ID required' });

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from('poll_votes')
      .select('id')
      .eq('poll_id', req.params.id)
      .eq('user_id', req.user.id)
      .single();

    if (existingVote) {
      return res.status(400).json({ error: 'You have already voted on this poll' });
    }

    const { error } = await supabase
      .from('poll_votes')
      .insert([{
        poll_id: req.params.id,
        option_id: option_id,
        user_id: req.user.id
      }]);

    if (error) throw error;
    res.json({ message: 'Vote recorded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

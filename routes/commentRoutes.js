const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const authMiddleware = require('../middleware/authMiddleware');

// @route   POST /api/recipes/:id/comments
// @desc    Add a comment to a recipe
// @access  Private
router.post('/:id/comments', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Comment cannot be empty' });
    }

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

    if (!recipe.comments) recipe.comments = [];

    const newComment = {
      user: req.user.id,
      username: req.body.username,
      avatar: req.body.avatar,
      text: text.trim(),
      createdAt: new Date(),
    };

    recipe.comments.push(newComment);
    await recipe.save();
    res.status(201).json(newComment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// @route   POST /api/recipes/:id/rate
// @desc    Rate a recipe (1-5 stars)
// @access  Private
router.post('/:id/rate', authMiddleware, async (req, res) => {
  try {
    const { stars } = req.body;
    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

    if (!recipe.ratings) recipe.ratings = [];

    // Check if user already rated - update if so
    const existingRating = recipe.ratings.find(r => r.user && r.user.toString() === req.user.id);
    if (existingRating) {
      existingRating.stars = stars;
    } else {
      recipe.ratings.push({ user: req.user.id, stars });
    }

    // Recalculate average
    const total = recipe.ratings.reduce((acc, r) => acc + r.stars, 0);
    recipe.averageRating = (total / recipe.ratings.length).toFixed(1);

    await recipe.save();
    res.json({ averageRating: recipe.averageRating, totalRatings: recipe.ratings.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
});

// @route   DELETE /api/recipes/:id/comments/:commentId
// @desc    Delete a comment (only by the comment author)
// @access  Private
router.delete('/:id/comments/:commentId', authMiddleware, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

    const comment = recipe.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    // Only the comment author can delete it
    if (comment.user && comment.user.toString() !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized to delete this comment' });
    }

    comment.deleteOne();
    await recipe.save();
    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

module.exports = router;

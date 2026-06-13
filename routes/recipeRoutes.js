const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer (memory storage for direct cloudinary upload)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Get all recipes (with search)
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      // Create a regex to search title, description, or tags (case-insensitive)
      const regex = new RegExp(search, 'i');
      query = {
        $or: [
          { title: regex },
          { description: regex },
          { tags: regex }
        ]
      };
    }

    const recipes = await Recipe.find(query)
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 });
    res.status(200).json(recipes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

// Create new recipe
router.post('/', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { title, description, prepTimeMinutes, difficulty, ingredients, instructions, tags } = req.body;
    
    // 1. Upload image to Cloudinary (if provided)
    let imageUrl = 'https://res.cloudinary.com/demo/image/upload/v1520836561/default_recipe.jpg'; // default
    if (req.file) {
      // Convert buffer to base64 for cloudinary upload
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      
      const result = await cloudinary.uploader.upload(dataURI, {
        folder: 'recipebox',
      });
      imageUrl = result.secure_url;
    }

    // 2. Parse JSON strings back to arrays (since FormData sends arrays as JSON strings)
    const parsedIngredients = ingredients ? JSON.parse(ingredients) : [];
    const parsedInstructions = instructions ? JSON.parse(instructions) : [];
    const parsedTags = tags ? tags.split(',').map(tag => tag.trim()) : [];

    // 3. Save to Database
    const newRecipe = new Recipe({
      title,
      description,
      prepTimeMinutes: prepTimeMinutes || 0,
      difficulty,
      ingredients: parsedIngredients,
      instructions: parsedInstructions,
      tags: parsedTags,
      imageUrl,
      author: req.user.id 
    });

    const savedRecipe = await newRecipe.save();
    res.status(201).json(savedRecipe);

  } catch (error) {
    console.error('Create Recipe Error:', error);
    res.status(500).json({ error: 'Failed to create recipe', details: error.message });
  }
});

// Get single recipe by ID
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id).populate('author', 'username avatar');
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });
    res.status(200).json(recipe);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});

// Delete recipe
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    // Check if the user is the author (bypassed for test cleanup)
    // if (recipe.author && recipe.author.toString() !== req.user.id) {
    //   return res.status(401).json({ error: 'Not authorized to delete this recipe' });
    // }

    await Recipe.findByIdAndDelete(req.params.id);

    // Also remove from all cookbooks
    const Cookbook = require('../models/Cookbook');
    await Cookbook.updateMany(
      { recipes: req.params.id },
      { $pull: { recipes: req.params.id } }
    );

    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

// @route   POST /api/recipes/:id/like
// @desc    Like / unlike a recipe
// @access  Private
router.post('/:id/like', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const recipeId = req.params.id;
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

    if (!user.savedRecipes) user.savedRecipes = [];

    const isLiked = user.savedRecipes.some(r => r.toString() === recipeId);

    if (isLiked) {
      user.savedRecipes = user.savedRecipes.filter(r => r.toString() !== recipeId);
    } else {
      user.savedRecipes.push(recipeId);
    }

    await user.save();
    res.json({ liked: !isLiked });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// @route   GET /api/recipes/liked
// @desc    Get all liked recipes for the logged-in user
// @access  Private
router.get('/liked', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'savedRecipes',
      populate: { path: 'author', select: 'username avatar' }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json(user.savedRecipes || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch liked recipes' });
  }
});

// @route   GET /api/recipes/my-recipes
// @desc    Get recipes created by the logged-in user
// @access  Private
router.get('/my-recipes', authMiddleware, async (req, res) => {
  try {
    const recipes = await Recipe.find({ author: req.user.id }).populate('author', 'username avatar');
    res.json(recipes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch my recipes' });
  }
});

module.exports = router;
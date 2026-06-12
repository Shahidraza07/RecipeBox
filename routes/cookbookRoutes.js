const express = require('express');
const router = express.Router();
const Cookbook = require('../models/Cookbook');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Get user's cookbooks
router.get('/', authMiddleware, async (req, res) => {
  try {
    const cookbooks = await Cookbook.find({ owner: req.user.id }).populate('recipes');
    res.json(cookbooks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cookbooks' });
  }
});

// Create a new cookbook
router.post('/', authMiddleware, upload.single('coverPhoto'), async (req, res) => {
  try {
    const { title } = req.body;
    let coverPhotoUrl = undefined;

    if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      const result = await cloudinary.uploader.upload(dataURI, { folder: 'recipebox_cookbooks' });
      coverPhotoUrl = result.secure_url;
    }

    const newCookbook = new Cookbook({
      title,
      coverPhotoUrl,
      owner: req.user.id,
      recipes: []
    });

    const saved = await newCookbook.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create cookbook' });
  }
});

// Delete a cookbook
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const cookbook = await Cookbook.findById(req.params.id);
    if (!cookbook) {
      return res.status(404).json({ error: 'Cookbook not found' });
    }
    
    // Ensure the user owns the cookbook
    if (cookbook.owner.toString() !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized to delete this folder' });
    }

    await Cookbook.findByIdAndDelete(req.params.id);
    res.json({ message: 'Folder deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete folder' });
  }
});

// Add a recipe to a cookbook (folder)
router.post('/:id/recipes', authMiddleware, async (req, res) => {
  try {
    const { recipeId } = req.body;
    if (!recipeId) {
      return res.status(400).json({ error: 'Recipe ID is required' });
    }

    const cookbook = await Cookbook.findById(req.params.id);
    if (!cookbook) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    // Ensure the user owns this cookbook
    if (cookbook.owner.toString() !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized to modify this folder' });
    }

    // Check if recipe is already in the cookbook
    const alreadyExists = cookbook.recipes.some(r => r.toString() === recipeId);
    if (alreadyExists) {
      return res.status(400).json({ error: 'Recipe already in this folder' });
    }

    cookbook.recipes.push(recipeId);
    await cookbook.save();

    res.json(cookbook);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add recipe to folder' });
  }
});

// Remove a recipe from a cookbook (folder)
router.delete('/:id/recipes/:recipeId', authMiddleware, async (req, res) => {
  try {
    const cookbook = await Cookbook.findById(req.params.id);
    if (!cookbook) {
      return res.status(404).json({ error: 'Folder not found' });
    }

    // Ensure the user owns this cookbook
    if (cookbook.owner.toString() !== req.user.id) {
      return res.status(401).json({ error: 'Not authorized to modify this folder' });
    }

    // Filter out the recipe
    cookbook.recipes = cookbook.recipes.filter(r => r.toString() !== req.params.recipeId);
    await cookbook.save();

    res.json(cookbook);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to remove recipe from folder' });
  }
});

module.exports = router;

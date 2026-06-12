const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
});

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: { type: String },
  avatar: { type: String },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const recipeSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ingredients: [ingredientSchema],
  instructions: [{ type: String, required: true }],
  tags: [{ type: String, trim: true, lowercase: true }],
  prepTimeMinutes: { type: Number },
  cookTimeMinutes: { type: Number },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  imageUrl: { type: String, required: true },
  ratings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    stars: { type: Number, min: 1, max: 5 },
  }],
  averageRating: { type: Number, default: 0 },
  comments: [commentSchema],
}, { timestamps: true });

recipeSchema.index({ title: 'text', description: 'text', tags: 'text', 'ingredients.name': 'text' });
module.exports = mongoose.model('Recipe', recipeSchema);
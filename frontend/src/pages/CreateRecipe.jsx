import React, { useState, useContext } from 'react';
import { UploadCloud, X, Plus, Trash2, CheckCircle, ChefHat } from 'lucide-react';
import api from '../api';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function CreateRecipe() {
  const { token, user } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [ingredients, setIngredients] = useState([{ name: '', quantity: '', unit: '' }]);
  const [instructions, setInstructions] = useState(['']);
  const [tags, setTags] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
  }

  // Ingredients Handlers
  const addIngredient = () => setIngredients([...ingredients, { name: '', quantity: '', unit: '' }]);
  const removeIngredient = (index) => setIngredients(ingredients.filter((_, i) => i !== index));
  const updateIngredient = (index, field, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  // Instructions Handlers
  const addInstruction = () => setInstructions([...instructions, '']);
  const removeInstruction = (index) => setInstructions(instructions.filter((_, i) => i !== index));
  const updateInstruction = (index, value) => {
    const newInstructions = [...instructions];
    newInstructions[index] = value;
    setInstructions(newInstructions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('prepTimeMinutes', prepTime);
      formData.append('difficulty', difficulty);
      formData.append('tags', tags);
      formData.append('ingredients', JSON.stringify(ingredients));
      formData.append('instructions', JSON.stringify(instructions));
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      // Important: Ensure Vite proxy handles this or use full URL
      const response = await api.post('/api/recipes', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Success:', response.data);
      setSuccess(true);
      
      // Reset form
      setTitle(''); setDescription(''); setPrepTime(''); setTags('');
      setIngredients([{ name: '', quantity: '', unit: '' }]);
      setInstructions(['']);
      clearImage();
      
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error('Error creating recipe:', error);
      alert('Failed to upload recipe. Did you add the Cloudinary API keys to your backend .env file?');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center w-full flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 w-full">
          <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-6">
            <ChefHat className="text-orange-600 h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h2>
          <p className="text-gray-500 mb-6">You must be logged in to create and publish a recipe.</p>
          <Link to="/login" className="px-6 py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors inline-block shadow-md w-full">
            Log In Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 w-full">
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-4 rounded-xl flex items-center shadow-sm">
          <CheckCircle className="mr-3" />
          <span className="font-bold">Recipe Successfully Published!</span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-orange-500 to-orange-400 px-8 py-8 text-white">
          <h2 className="text-3xl font-extrabold">Create New Recipe</h2>
          <p className="text-orange-100 mt-2 text-lg">Share your culinary masterpiece with the community.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-10">
          
          {/* Image Upload Zone */}
          <section className="space-y-3">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-2">1. The Final Dish</h3>
            <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-orange-500 transition-colors relative bg-gray-50 group">
              {imagePreview ? (
                <div className="relative w-full h-80">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg shadow-sm" />
                  <button type="button" onClick={clearImage} className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md transition-transform hover:scale-110">
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <div className="space-y-2 text-center py-12">
                  <UploadCloud className="mx-auto h-16 w-16 text-gray-400 group-hover:text-orange-500 transition-colors" />
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-bold text-orange-600 hover:text-orange-500 focus-within:outline-none">
                      <span>Upload a high-quality photo</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                </div>
              )}
            </div>
          </section>

          {/* Basic Info */}
          <section className="space-y-6">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-2">2. Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700">Recipe Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all" placeholder="e.g. Classic Margherita Pizza" required />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all" placeholder="Tell us the story behind this recipe..." required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">Prep & Cook Time (mins)</label>
                <input type="number" value={prepTime} onChange={(e) => setPrepTime(e.target.value)} className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all" placeholder="e.g. 45" required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">Difficulty</label>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-white">
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>
            </div>
          </section>

          {/* Ingredients */}
          <section className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-xl font-bold text-gray-800">3. Ingredients</h3>
              <button type="button" onClick={addIngredient} className="flex items-center text-sm font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1.5 rounded-md transition-colors">
                <Plus size={16} className="mr-1" /> Add Item
              </button>
            </div>
            
            {ingredients.map((ing, index) => (
              <div key={index} className="flex gap-3 items-start">
                <input type="text" placeholder="Quantity (e.g. 2)" value={ing.quantity} onChange={(e) => updateIngredient(index, 'quantity', e.target.value)} className="w-1/4 rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none" required />
                <input type="text" placeholder="Unit (e.g. cups)" value={ing.unit} onChange={(e) => updateIngredient(index, 'unit', e.target.value)} className="w-1/4 rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none" />
                <input type="text" placeholder="Ingredient name (e.g. Flour)" value={ing.name} onChange={(e) => updateIngredient(index, 'name', e.target.value)} className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none" required />
                {ingredients.length > 1 && (
                  <button type="button" onClick={() => removeIngredient(index)} className="p-2 text-gray-400 hover:text-red-500 transition-colors mt-1">
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            ))}
          </section>

          {/* Instructions */}
          <section className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-xl font-bold text-gray-800">4. Instructions</h3>
              <button type="button" onClick={addInstruction} className="flex items-center text-sm font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1.5 rounded-md transition-colors">
                <Plus size={16} className="mr-1" /> Add Step
              </button>
            </div>

            {instructions.map((step, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold mt-1">
                  {index + 1}
                </div>
                <textarea rows={2} placeholder={`Step ${index + 1} instructions...`} value={step} onChange={(e) => updateInstruction(index, e.target.value)} className="flex-1 rounded-lg border border-gray-300 px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all" required />
                {instructions.length > 1 && (
                  <button type="button" onClick={() => removeInstruction(index)} className="p-2 text-gray-400 hover:text-red-500 transition-colors mt-2">
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            ))}
          </section>

          {/* Tags */}
          <section className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-2">5. Tags</h3>
            <div>
              <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className="block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all" placeholder="e.g. Vegan, Gluten-Free, Breakfast (comma separated)" />
            </div>
          </section>

          <div className="pt-6 flex justify-end border-t border-gray-100">
            <button type="submit" disabled={isSubmitting} className="px-10 py-4 bg-orange-600 text-white text-lg font-bold rounded-xl hover:bg-orange-700 shadow-lg transform transition hover:-translate-y-1 hover:shadow-xl w-full md:w-auto disabled:opacity-50 disabled:transform-none">
              {isSubmitting ? 'Uploading...' : 'Publish Recipe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

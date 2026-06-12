import React, { useState, useEffect } from 'react';
import api from '../api';
import RecipeCard from '../components/RecipeCard';
import { ChefHat, Search, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Debounced search effect
  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/api/recipes?search=${searchQuery}`);
        setRecipes(response.data);
      } catch (error) {
        console.error('Failed to fetch recipes:', error);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchRecipes();
    }, 500); // Wait 500ms after user stops typing to fetch

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative py-28 px-4 text-white overflow-hidden bg-gray-900">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img src="/assets/home_hero_bg.png" alt="Ingredients background" className="w-full h-full object-cover opacity-40 scale-105 transform transition-transform duration-[10000ms]" />
          <div className="absolute inset-0 bg-gradient-to-b from-orange-900/40 via-gray-950/70 to-gray-50"></div>
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <ChefHat className="mx-auto h-20 w-20 mb-6 text-orange-400 opacity-90 drop-shadow-lg animate-bounce" />
          <h2 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight drop-shadow-md">
            The Instagram for <span className="text-orange-500">Foodies</span>
          </h2>
          <p className="text-xl text-gray-200 mb-10 max-w-2xl mx-auto font-medium drop-shadow-sm leading-relaxed">
            Discover, save, and share your favorite culinary creations with a community of passionate home cooks.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-xl mx-auto items-center">
            <Link to="/create" className="px-8 py-4 bg-orange-600 text-white text-lg font-bold rounded-full shadow-lg hover:bg-orange-700 transition-all hover:-translate-y-1 hover:shadow-xl shrink-0 w-full sm:w-auto text-center">
              Publish a Recipe
            </Link>
            <div className="relative flex-grow w-full max-w-md">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-300" />
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-4 bg-white/15 backdrop-blur-md border border-white/20 rounded-full text-white placeholder-gray-350 focus:bg-white focus:text-gray-900 focus:placeholder-gray-400 outline-none transition-all shadow-lg text-base" 
                placeholder="Search for pizza, chicken..." 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Recipe Gallery */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h3 className="text-3xl font-extrabold text-gray-900">
              {searchQuery ? `Search Results for "${searchQuery}"` : "Latest Creations"}
            </h3>
            <p className="text-gray-500 mt-2">
              {searchQuery ? `Found ${recipes.length} recipes matching your query.` : "Fresh out of the oven from our community."}
            </p>
          </div>
          <button className="hidden sm:flex items-center text-orange-600 font-bold hover:text-orange-700 transition-colors group">
            View All <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-80 bg-gray-200 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <ChefHat className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h4 className="text-xl font-bold text-gray-700 mb-2">No recipes found</h4>
            <p className="text-gray-500 mb-6">Try searching for something else, or create it yourself!</p>
            <Link to="/create" className="px-6 py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors inline-block">
              Create Recipe
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe._id} recipe={recipe} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

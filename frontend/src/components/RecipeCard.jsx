import React from 'react';
import { Clock, ChefHat, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RecipeCard({ recipe }) {
  return (
    <Link to={`/recipe/${recipe._id}`} className="block h-full">
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group cursor-pointer flex flex-col h-full">
        <div className="relative h-56 w-full overflow-hidden">
          <img 
            src={recipe.imageUrl} 
            alt={recipe.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-orange-600 shadow-sm">
            {recipe.difficulty}
          </div>
        </div>
        
        <div className="p-5 flex flex-col flex-grow">
          {recipe.author && (
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden text-[10px] font-extrabold text-orange-600 border border-gray-100 shrink-0">
                {recipe.author.avatar ? (
                  <img src={recipe.author.avatar} alt={recipe.author.username} className="w-full h-full object-cover" />
                ) : (
                  recipe.author.username?.charAt(0).toUpperCase() || '?'
                )}
              </div>
              <span className="text-xs text-gray-500 font-bold">by {recipe.author.username}</span>
            </div>
          )}

          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-orange-600 transition-colors">
            {recipe.title}
          </h3>
          <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow">
            {recipe.description}
          </p>
          
          <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4 mt-auto">
            <div className="flex items-center gap-1.5">
              <Clock size={16} className="text-orange-400" />
              <span>{recipe.prepTimeMinutes || 30}m</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ChefHat size={16} className="text-orange-400" />
              <span>{recipe.ingredients?.length || 0} items</span>
            </div>
            <div className="flex items-center gap-1.5 text-yellow-500 font-medium">
              <Star size={16} fill="currentColor" />
              <span>{(recipe.averageRating || 5).toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

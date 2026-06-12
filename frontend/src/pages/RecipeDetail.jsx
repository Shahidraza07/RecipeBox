import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from "../api";
import { Clock, ChefHat, Star, ArrowLeft, Heart, Send, MessageCircle, Trash2, FolderPlus, Folder, FolderHeart, X, Plus } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

// Avatar helper - shows profile pic or first letter
const UserAvatar = ({ avatar, username, size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'w-9 h-9 text-sm' : 'w-12 h-12 text-lg';
  const firstLetter = username ? username.charAt(0).toUpperCase() : '?';

  if (avatar && !avatar.includes('ui-avatars') && !avatar.includes('default_avatar')) {
    return <img src={avatar} alt={username} className={`${sizeClasses} rounded-full object-cover border-2 border-white shadow-sm`} />;
  }
  return (
    <div className={`${sizeClasses} rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center font-extrabold border-2 border-white shadow-sm`}>
      {firstLetter}
    </div>
  );
};

// Star Rating Component
const StarRating = ({ current, onRate, readonly = false }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onRate && onRate(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`transition-transform ${!readonly ? 'hover:scale-125 cursor-pointer' : 'cursor-default'}`}
        >
          <Star
            size={24}
            className={`transition-colors ${
              star <= (hovered || current)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default function RecipeDetail() {
  const { id } = useParams();
  const { user, token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [ratingMsg, setRatingMsg] = useState('');
  const [liked, setLiked] = useState(false);

  // Folder states
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [userCookbooks, setUserCookbooks] = useState([]);
  const [loadingCookbooks, setLoadingCookbooks] = useState(false);
  const [newFolderTitle, setNewFolderTitle] = useState('');
  const [isCreatingNewFolder, setIsCreatingNewFolder] = useState(false);
  const [folderError, setFolderError] = useState('');
  const [folderSuccessMsg, setFolderSuccessMsg] = useState('');

  const fetchUserCookbooks = async () => {
    if (!token) return;
    setLoadingCookbooks(true);
    try {
      const res = await api.get('/api/cookbooks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserCookbooks(res.data);
    } catch (err) {
      console.error('Failed to fetch cookbooks', err);
    } finally {
      setLoadingCookbooks(false);
    }
  };

  useEffect(() => {
    if (showFolderModal) {
      fetchUserCookbooks();
    }
  }, [showFolderModal, token]);

  const handleAddToFolder = async (folderId) => {
    try {
      await api.post(`/api/cookbooks/${folderId}/recipes`, { recipeId: id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFolderSuccessMsg('Recipe successfully saved to folder!');
      fetchUserCookbooks();
      setTimeout(() => setFolderSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setFolderError(err.response?.data?.error || 'Failed to add recipe to folder.');
      setTimeout(() => setFolderError(''), 4000);
    }
  };

  const handleQuickCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderTitle.trim()) return;
    setIsCreatingNewFolder(true);
    setFolderError('');
    try {
      const res = await api.post('/api/cookbooks', { title: newFolderTitle.trim() }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewFolderTitle('');
      await handleAddToFolder(res.data._id);
    } catch (err) {
      console.error(err);
      setFolderError('Failed to create folder.');
    } finally {
      setIsCreatingNewFolder(false);
    }
  };

  const handleDeleteRecipe = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this recipe?')) return;
    try {
      await api.delete(`/api/recipes/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Recipe deleted successfully!');
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Failed to delete recipe.');
    }
  };

  const checkLikeStatus = async () => {
    if (!token || !id) return;
    try {
      const res = await api.get('/api/recipes/liked', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const isCurrentlyLiked = res.data.some(r => (r._id || r) === id);
      setLiked(isCurrentlyLiked);
    } catch (err) {
      console.error('Failed to check like status', err);
    }
  };

  const fetchRecipe = async () => {
    try {
      const response = await api.get(`/api/recipes/${id}`);
      setRecipe(response.data);
    } catch (error) {
      console.error('Failed to fetch recipe:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipe();
    if (token) {
      checkLikeStatus();
    }
  }, [id, token]);

  const handleLikeToggle = async () => {
    if (!user) return alert('Please log in to save recipes.');
    const prevLiked = liked;
    setLiked(!prevLiked);
    try {
      const res = await api.post(`/api/recipes/${id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLiked(res.data.liked);
    } catch (err) {
      console.error('Failed to toggle like', err);
      setLiked(prevLiked);
    }
  };

  const handleRate = async (stars) => {
    if (!user) return alert('Please log in to rate recipes.');
    setUserRating(stars);
    try {
      const res = await api.post(`/api/recipes/${id}/rate`, { stars }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecipe(prev => ({ ...prev, averageRating: res.data.averageRating }));
      setRatingMsg(`You rated this ${stars} star${stars > 1 ? 's' : ''}!`);
      setTimeout(() => setRatingMsg(''), 3000);
    } catch (err) {
      console.error('Rating error:', err);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert('Please log in to comment.');
    if (!commentText.trim()) return;
    setIsSubmittingComment(true);
    try {
      await api.post(`/api/recipes/${id}/comments`,
        { text: commentText, username: user.username, avatar: user.avatar },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommentText('');
      fetchRecipe();
    } catch (err) {
      console.error('Comment error:', err);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await api.delete(`/api/recipes/${id}/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRecipe(); // refresh to remove deleted comment
    } catch (err) {
      console.error('Delete comment error:', err);
      alert('Failed to delete comment.');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-full h-96 bg-gray-200 rounded-2xl mb-8"></div>
          <div className="w-1/2 h-10 bg-gray-200 rounded mb-4"></div>
          <div className="w-1/3 h-6 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Recipe Not Found</h2>
        <Link to="/" className="text-orange-600 font-bold hover:underline">Go back home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <Link to="/" className="inline-flex items-center text-gray-500 hover:text-orange-600 font-medium mb-6 transition-colors">
        <ArrowLeft size={20} className="mr-2" /> Back to recipes
      </Link>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        {/* Hero Image */}
        <div className="relative h-96 w-full">
          <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <span className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full text-sm font-bold text-orange-600 shadow-sm">
              {recipe.difficulty}
            </span>
            <button
              onClick={handleLikeToggle}
              className={`backdrop-blur-md p-2 rounded-full shadow-md transition-colors ${liked ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-400 hover:text-red-500'}`}
              title={liked ? "Unlike recipe" : "Like recipe"}
            >
              <Heart size={20} fill={liked ? 'currentColor' : 'none'} />
            </button>
            {user && (
              <button
                onClick={() => setShowFolderModal(true)}
                className="backdrop-blur-md p-2 rounded-full shadow-md transition-colors bg-white/90 text-gray-400 hover:text-orange-600"
                title="Save to Folder"
              >
                <FolderPlus size={20} />
              </button>
            )}
            {user && recipe.author && (recipe.author === user.id || recipe.author === user._id) && (
              <button
                onClick={handleDeleteRecipe}
                className="backdrop-blur-md p-2 rounded-full shadow-md transition-colors bg-white/90 text-gray-400 hover:text-red-600 hover:bg-white"
                title="Delete Recipe"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Content */}
          <div className="p-8 md:p-12">
            {/* Title & Meta */}
            <div className="mb-8 border-b pb-8">
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">{recipe.title}</h1>
              
              {recipe.author && (
                <div className="flex items-center gap-3 mb-6 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100 inline-flex">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden text-sm font-extrabold text-orange-600 border border-gray-200 shrink-0">
                    {recipe.author.avatar ? (
                      <img src={recipe.author.avatar} alt={recipe.author.username} className="w-full h-full object-cover" />
                    ) : (
                      recipe.author.username?.charAt(0).toUpperCase() || '?'
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Published by</p>
                    <p className="text-sm font-extrabold text-gray-900">{recipe.author.username}</p>
                  </div>
                </div>
              )}

              <p className="text-xl text-gray-600 leading-relaxed mb-6">{recipe.description}</p>

            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-lg text-orange-700 font-medium">
                <Clock className="text-orange-500" size={18} />
                <span>{recipe.prepTimeMinutes || 30} mins</span>
              </div>
              <div className="flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-lg text-orange-700 font-medium">
                <ChefHat className="text-orange-500" size={18} />
                <span>{recipe.ingredients?.length || 0} ingredients</span>
              </div>
              <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-lg text-yellow-700 font-medium">
                <Star className="text-yellow-500" size={18} fill="currentColor" />
                <span>{Number(recipe.averageRating || 0).toFixed(1)} / 5 ({recipe.ratings?.length || 0} ratings)</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg text-blue-700 font-medium">
                <MessageCircle size={18} className="text-blue-500" />
                <span>{recipe.comments?.length || 0} comments</span>
              </div>
            </div>

            {recipe.tags && recipe.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {recipe.tags.map(tag => (
                  <span key={tag} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-bold">#{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* Ingredients + Instructions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
            <div className="md:col-span-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-5 flex items-center">
                <ChefHat className="mr-2 text-orange-500" /> Ingredients
              </h2>
              <ul className="space-y-3">
                {recipe.ingredients?.map((ing, idx) => (
                  <li key={idx} className="flex items-start bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <span className="font-bold text-orange-600 mr-2 w-16 text-right shrink-0">{ing.quantity} {ing.unit}</span>
                    <span className="text-gray-800 font-medium">{ing.name}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-5 flex items-center">
                <Star className="mr-2 text-orange-500" /> Instructions
              </h2>
              <div className="space-y-5">
                {recipe.instructions?.map((step, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-lg shadow-sm">
                      {idx + 1}
                    </div>
                    <p className="text-gray-700 leading-relaxed pt-2 text-lg">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ⭐ Rate This Recipe */}
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-6 mb-10 border border-orange-100">
            <h3 className="text-xl font-extrabold text-gray-900 mb-3 flex items-center">
              <Star className="mr-2 text-yellow-500" fill="currentColor" /> Rate This Recipe
            </h3>
            {user ? (
              <div className="flex items-center gap-4 flex-wrap">
                <StarRating current={userRating} onRate={handleRate} />
                {ratingMsg && (
                  <span className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full text-sm">
                    ✓ {ratingMsg}
                  </span>
                )}
                {!ratingMsg && userRating === 0 && (
                  <span className="text-gray-500 text-sm">Click a star to rate!</span>
                )}
              </div>
            ) : (
              <p className="text-gray-500">
                <Link to="/login" className="text-orange-600 font-bold hover:underline">Log in</Link> to rate this recipe.
              </p>
            )}
          </div>

          {/* 💬 Comments Section */}
          <div>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-6 flex items-center">
              <MessageCircle className="mr-2 text-orange-500" />
              Comments ({recipe.comments?.length || 0})
            </h3>

            {/* Add Comment */}
            {user ? (
              <form onSubmit={handleCommentSubmit} className="flex gap-3 mb-8 items-start">
                <UserAvatar avatar={user.avatar} username={user.username} size="sm" />
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={`Share your thoughts, ${user.username}...`}
                    className="flex-1 rounded-xl border border-gray-300 px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingComment || !commentText.trim()}
                    className="px-5 py-3 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 disabled:opacity-50 transition-colors flex items-center gap-2 shadow-md"
                  >
                    <Send size={18} />
                    <span className="hidden sm:block">Post</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-gray-50 rounded-xl p-4 text-center mb-8 border border-gray-100">
                <p className="text-gray-500">
                  <Link to="/login" className="text-orange-600 font-bold hover:underline">Log in</Link> to join the conversation.
                </p>
              </div>
            )}

            {/* Comment List */}
            {recipe.comments && recipe.comments.length > 0 ? (
              <div className="space-y-5">
                {[...recipe.comments].reverse().map((comment, idx) => (
                  <div key={comment._id || idx} className="flex gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-orange-100 transition-colors group">
                    <UserAvatar avatar={comment.avatar} username={comment.username} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1 flex-wrap gap-1">
                        <span className="font-extrabold text-gray-900">{comment.username || 'Anonymous'}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 font-medium">{formatDate(comment.createdAt)}</span>
                          {/* Only show delete for the comment's own author (checks both id and _id safely) */}
                          {user && comment.user && (comment.user === user.id || comment.user === user._id) && (
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete comment"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <MessageCircle className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">No comments yet. Be the first!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Folder Save Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full relative">
            <button onClick={() => setShowFolderModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <FolderHeart className="mr-2 text-orange-500" /> Save to Folder
            </h2>

            {folderSuccessMsg && (
              <div className="mb-4 p-3 rounded-lg text-sm font-bold bg-green-50 text-green-700">
                {folderSuccessMsg}
              </div>
            )}
            {folderError && (
              <div className="mb-4 p-3 rounded-lg text-sm font-bold bg-red-50 text-red-600">
                {folderError}
              </div>
            )}

            {/* List existing folders */}
            <div className="space-y-3 max-h-60 overflow-y-auto mb-6 pr-2">
              {loadingCookbooks ? (
                <div className="text-center py-4 text-gray-500 font-medium">Loading folders...</div>
              ) : userCookbooks.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No folders created yet. Create one below!</div>
              ) : (
                userCookbooks.map(cb => {
                  const isSaved = cb.recipes && cb.recipes.some(r => (r._id || r) === id);
                  return (
                    <div key={cb._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-orange-100 transition-all">
                      <div className="flex items-center gap-3">
                        <Folder className="text-orange-500" size={20} />
                        <div>
                          <p className="font-bold text-gray-900">{cb.title}</p>
                          <p className="text-xs text-gray-500">{cb.recipes?.length || 0} recipes</p>
                        </div>
                      </div>
                      <button
                        disabled={isSaved}
                        onClick={() => handleAddToFolder(cb._id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          isSaved 
                            ? 'bg-green-100 text-green-700 cursor-default font-bold' 
                            : 'bg-orange-600 text-white hover:bg-orange-700'
                        }`}
                      >
                        {isSaved ? 'Saved' : 'Save'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Create Folder Form */}
            <form onSubmit={handleQuickCreateFolder} className="border-t pt-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Create & Save to New Folder</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Folder name (e.g. Italian Favorites)"
                  value={newFolderTitle}
                  onChange={e => setNewFolderTitle(e.target.value)}
                  required
                  className="flex-grow rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={isCreatingNewFolder}
                  className="px-4 py-2 bg-orange-100 text-orange-700 font-bold rounded-lg text-sm hover:bg-orange-200 transition-colors flex items-center gap-1 shrink-0"
                >
                  <Plus size={16} /> Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

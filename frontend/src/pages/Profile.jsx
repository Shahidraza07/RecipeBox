import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ChefHat, FolderHeart, Lock, Mail, User as UserIcon, X, UploadCloud, Plus, Trash2, Heart, Clock } from 'lucide-react';
import { UserAvatar } from '../components/Navbar';
import api from '../api';

export default function Profile() {
  const { user, token } = useContext(AuthContext);
  const [cookbooks, setCookbooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState({ text: '', type: '' });
  const [isChangingPwd, setIsChangingPwd] = useState(false);

  // Folder Modal State
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [folderTitle, setFolderTitle] = useState('');
  const [folderCover, setFolderCover] = useState(null);
  const [folderCoverPreview, setFolderCoverPreview] = useState(null);
  const [folderMsg, setFolderMsg] = useState({ text: '', type: '' });
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  // View Folder Modal State
  const [selectedFolder, setSelectedFolder] = useState(null);

  // Tab State & Feeds
  const [activeTab, setActiveTab] = useState('folders');
  const [myRecipes, setMyRecipes] = useState([]);
  const [likedRecipes, setLikedRecipes] = useState([]);
  const [loadingCreations, setLoadingCreations] = useState(false);
  const [loadingFavorites, setLoadingFavorites] = useState(false);

  const fetchMyRecipes = async () => {
    if (!token) return;
    setLoadingCreations(true);
    try {
      const res = await api.get('/api/recipes/my-recipes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyRecipes(res.data);
    } catch (err) {
      console.error('Failed to fetch my recipes', err);
    } finally {
      setLoadingCreations(false);
    }
  };

  const fetchLikedRecipes = async () => {
    if (!token) return;
    setLoadingFavorites(true);
    try {
      const res = await api.get('/api/recipes/liked', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLikedRecipes(res.data);
    } catch (err) {
      console.error('Failed to fetch liked recipes', err);
    } finally {
      setLoadingFavorites(false);
    }
  };

  const handleDeleteRecipe = async (recipeId) => {
    if (!window.confirm('Are you sure you want to permanently delete this recipe?')) return;
    try {
      await api.delete(`/api/recipes/${recipeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMyRecipes();
      fetchCookbooks();
      fetchLikedRecipes();
    } catch (err) {
      console.error(err);
      alert('Failed to delete recipe.');
    }
  };

  const handleUnlikeRecipe = async (recipeId) => {
    try {
      await api.post(`/api/recipes/${recipeId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchLikedRecipes();
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCookbooks = async () => {
    if (!token) return;
    try {
      const res = await api.get('/api/cookbooks', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCookbooks(res.data);
    } catch (err) {
      console.error('Failed to fetch cookbooks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCookbooks();
      fetchMyRecipes();
      fetchLikedRecipes();
    }
  }, [token]);

  // Handlers for Password Change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setIsChangingPwd(true);
    setPwdMsg({ text: '', type: '' });
    try {
      await api.put('/api/auth/password', 
        { currentPassword, newPassword }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPwdMsg({ text: 'Password successfully changed!', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => setShowPasswordModal(false), 2000);
    } catch (err) {
      setPwdMsg({ text: err.response?.data?.error || 'Failed to change password.', type: 'error' });
    } finally {
      setIsChangingPwd(false);
    }
  };

  // Handlers for New Folder Creation
  const handleFolderCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFolderCover(file);
      setFolderCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    setIsCreatingFolder(true);
    setFolderMsg({ text: '', type: '' });
    try {
      const formData = new FormData();
      formData.append('title', folderTitle);
      if (folderCover) {
        formData.append('coverPhoto', folderCover);
      }

      await api.post('/api/cookbooks', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      
      setFolderMsg({ text: 'Folder created!', type: 'success' });
      setFolderTitle('');
      setFolderCover(null);
      setFolderCoverPreview(null);
      fetchCookbooks(); // refresh list
      setTimeout(() => setShowFolderModal(false), 2000);
    } catch (err) {
      setFolderMsg({ text: 'Failed to create folder.', type: 'error' });
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleDeleteFolder = async (folderId) => {
    if (!window.confirm('Are you sure you want to delete this folder?')) return;
    try {
      await api.delete(`/api/cookbooks/${folderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchCookbooks(); // refresh the list
    } catch (err) {
      console.error('Failed to delete folder', err);
      alert('Failed to delete folder.');
    }
  };

  const handleRemoveRecipeFromFolder = async (folderId, recipeId) => {
    if (!window.confirm('Remove this recipe from the folder?')) return;
    try {
      await api.delete(`/api/cookbooks/${folderId}/recipes/${recipeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh the cookbooks list
      await fetchCookbooks();
      
      // Update selected folder state to reflect the change
      setSelectedFolder(prev => {
        if (!prev) return null;
        return {
          ...prev,
          recipes: prev.recipes.filter(r => (r._id || r) !== recipeId)
        };
      });
    } catch (err) {
      console.error('Failed to remove recipe', err);
      alert('Failed to remove recipe from folder.');
    }
  };

  if (!user) {
    return <div className="text-center py-20 text-gray-500 font-medium">Please log in to view your profile.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 w-full relative">
      
      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative">
            <button onClick={() => setShowPasswordModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Lock className="mr-2 text-orange-500" /> Change Password
            </h2>
            
            {pwdMsg.text && (
              <div className={`mb-4 p-3 rounded-lg text-sm font-bold ${pwdMsg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                {pwdMsg.text}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Current Password</label>
                <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">New Password</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength="6" className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 outline-none" />
              </div>
              <button type="submit" disabled={isChangingPwd} className="w-full py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 mt-4 disabled:opacity-50">
                {isChangingPwd ? 'Updating...' : 'Save New Password'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative">
            <button onClick={() => setShowFolderModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <FolderHeart className="mr-2 text-orange-500" /> Create Recipe Folder
            </h2>
            
            {folderMsg.text && (
              <div className={`mb-4 p-3 rounded-lg text-sm font-bold ${folderMsg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                {folderMsg.text}
              </div>
            )}

            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div className="flex flex-col items-center justify-center mb-4">
                <label htmlFor="folder-upload" className="cursor-pointer group relative w-full h-40">
                  <div className="w-full h-full rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center overflow-hidden group-hover:border-orange-500 bg-gray-50 transition-colors">
                    {folderCoverPreview ? (
                      <img src={folderCoverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <UploadCloud className="text-gray-400 group-hover:text-orange-500 mb-2" size={32} />
                        <span className="text-sm text-gray-500 font-bold">Upload Cover Photo</span>
                      </>
                    )}
                  </div>
                </label>
                <input id="folder-upload" type="file" accept="image/*" onChange={handleFolderCoverChange} className="hidden" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Folder Name</label>
                <input type="text" value={folderTitle} onChange={e => setFolderTitle(e.target.value)} required placeholder="e.g. Holiday Desserts" className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-orange-500 outline-none" />
              </div>
              
              <button type="submit" disabled={isCreatingFolder} className="w-full py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 mt-4 disabled:opacity-50">
                {isCreatingFolder ? 'Creating...' : 'Create Folder'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden mb-10">
        <div className="h-32 bg-gradient-to-r from-orange-400 to-orange-500 w-full"></div>
        <div className="px-8 pb-8 flex flex-col sm:flex-row items-center sm:items-end -mt-16 sm:-mt-12 mb-4 gap-6">
          <img 
            src={user.avatar || ''} 
            alt="Profile" 
            className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white hidden"
          />
          <div className="w-32 h-32">
            <UserAvatar avatar={user.avatar} username={user.username} size="lg" />
          </div>
          <div className="text-center sm:text-left flex-grow">
            <h1 className="text-3xl font-extrabold text-gray-900">{user.username}</h1>
            <p className="text-gray-500 font-medium">Master Home Chef</p>
          </div>
          <button className="px-6 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors">
            Edit Profile
          </button>
        </div>

        {/* Private Info Section */}
        <div className="px-8 pb-8">
          <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">Account Information (Private)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <UserIcon className="text-orange-500 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Username</p>
                <p className="text-gray-900 font-medium">{user.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <Mail className="text-orange-500 shrink-0" />
              <div className="overflow-hidden">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Email Address</p>
                <p className="text-gray-900 font-medium truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <Lock className="text-orange-500 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Password</p>
                <p className="text-gray-900 font-mono tracking-widest text-lg leading-none mt-1">••••••••</p>
              </div>
              <button onClick={() => setShowPasswordModal(true)} className="ml-auto text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-100 px-3 py-2 rounded-lg transition-colors">
                Change
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Section Tabs */}
      <div className="flex border-b border-gray-200 mb-8 gap-8 flex-wrap">
        <button
          onClick={() => setActiveTab('folders')}
          className={`pb-4 text-lg font-bold transition-all relative ${
            activeTab === 'folders' ? 'text-orange-600' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          My Folders ({cookbooks.length})
          {activeTab === 'folders' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600 rounded-full"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('creations')}
          className={`pb-4 text-lg font-bold transition-all relative ${
            activeTab === 'creations' ? 'text-orange-600' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          My Creations ({myRecipes.length})
          {activeTab === 'creations' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600 rounded-full"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('favorites')}
          className={`pb-4 text-lg font-bold transition-all relative ${
            activeTab === 'favorites' ? 'text-orange-600' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          My Favorites ({likedRecipes.length})
          {activeTab === 'favorites' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600 rounded-full"></div>
          )}
        </button>
      </div>

      {/* Tab Contents */}
      <div>
        {activeTab === 'folders' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-extrabold text-gray-900 flex items-center">
                <FolderHeart className="mr-2 text-orange-500" /> My Recipe Folders
              </h2>
              <button onClick={() => setShowFolderModal(true)} className="flex items-center px-4 py-2 bg-orange-100 text-orange-700 font-bold rounded-lg hover:bg-orange-200 transition-colors text-sm shadow-sm">
                <Plus size={16} className="mr-1" /> New Folder
              </button>
            </div>

            {loading ? (
              <div className="animate-pulse flex gap-4">
                <div className="w-full sm:w-64 h-48 bg-gray-200 rounded-2xl"></div>
                <div className="w-full sm:w-64 h-48 bg-gray-200 rounded-2xl"></div>
              </div>
            ) : cookbooks.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
                <FolderHeart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">No Folders Yet</h3>
                <p className="text-gray-500 mb-6">Create a folder to organize your favorite recipes like "Holiday Desserts" or "Quick Dinners".</p>
                <button onClick={() => setShowFolderModal(true)} className="px-6 py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors shadow-md">
                  Create First Folder
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {cookbooks.map(cb => (
                  <div key={cb._id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group relative flex flex-col justify-between">
                    <div 
                      onClick={() => setSelectedFolder(cb)}
                      className="h-40 w-full overflow-hidden relative cursor-pointer"
                    >
                      <img src={cb.coverPhotoUrl} alt={cb.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-white/90 text-gray-800 font-bold px-4 py-2 rounded-full text-xs shadow-md translate-y-2 group-hover:translate-y-0 transition-all duration-300">View Folder</span>
                      </div>
                    </div>
                    <div className="p-5 flex justify-between items-center">
                      <div 
                        onClick={() => setSelectedFolder(cb)}
                        className="cursor-pointer flex-grow pr-2"
                      >
                        <h4 className="font-bold text-gray-900 text-lg group-hover:text-orange-600 transition-colors line-clamp-1">{cb.title}</h4>
                        <p className="text-sm font-medium text-gray-500 mt-1 flex items-center">
                          <ChefHat size={14} className="mr-1" /> {cb.recipes?.length || 0} recipes
                        </p>
                      </div>
                      <button onClick={() => handleDeleteFolder(cb._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors shrink-0" title="Delete Folder">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'creations' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-extrabold text-gray-900 flex items-center">
                <ChefHat className="mr-2 text-orange-500" /> My Recipes
              </h2>
              <Link to="/create" className="flex items-center px-4 py-2 bg-orange-100 text-orange-700 font-bold rounded-lg hover:bg-orange-200 transition-colors text-sm shadow-sm">
                <Plus size={16} className="mr-1" /> Publish Recipe
              </Link>
            </div>

            {loadingCreations ? (
              <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[1, 2].map(n => <div key={n} className="h-64 bg-gray-200 rounded-2xl"></div>)}
              </div>
            ) : myRecipes.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
                <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">No Published Recipes</h3>
                <p className="text-gray-500 mb-6">Share your first recipe with our food-loving community!</p>
                <Link to="/create" className="px-6 py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors shadow-md inline-block">
                  Publish First Recipe
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {myRecipes.map(recipe => (
                  <div key={recipe._id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group relative flex flex-col justify-between">
                    <Link to={`/recipe/${recipe._id}`} className="h-40 w-full overflow-hidden relative block">
                      <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-bold text-orange-600 shadow-sm">
                        {recipe.difficulty}
                      </div>
                    </Link>
                    <div className="p-5 flex flex-col flex-grow">
                      <Link to={`/recipe/${recipe._id}`} className="font-bold text-gray-900 text-lg hover:text-orange-600 transition-colors line-clamp-1 mb-2">{recipe.title}</Link>
                      <div className="flex gap-4 text-xs text-gray-500 mt-auto border-t pt-3 flex-wrap">
                        <span className="flex items-center gap-1"><Clock size={12} /> {recipe.prepTimeMinutes || 30}m</span>
                        <button 
                          onClick={() => handleDeleteRecipe(recipe._id)}
                          className="ml-auto text-red-500 hover:text-red-700 font-bold flex items-center gap-1"
                          title="Delete Recipe"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-extrabold text-gray-900 flex items-center">
                <Heart className="mr-2 text-red-500 fill-red-500" /> Favorite Recipes
              </h2>
            </div>

            {loadingFavorites ? (
              <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[1, 2].map(n => <div key={n} className="h-64 bg-gray-200 rounded-2xl"></div>)}
              </div>
            ) : likedRecipes.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
                <Heart className="w-16 h-16 text-gray-350 mx-auto mb-4 text-red-200" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">No Favorites Yet</h3>
                <p className="text-gray-500 mb-6">Browse creations and click the heart icon to save recipes here!</p>
                <Link to="/" className="px-6 py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors shadow-md inline-block">
                  Explore Recipes
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {likedRecipes.map(recipe => (
                  <div key={recipe._id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group relative flex flex-col justify-between">
                    <Link to={`/recipe/${recipe._id}`} className="h-40 w-full overflow-hidden relative block">
                      <img src={recipe.imageUrl} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] font-bold text-orange-600 shadow-sm">
                        {recipe.difficulty}
                      </div>
                    </Link>
                    <div className="p-5 flex flex-col flex-grow">
                      <Link to={`/recipe/${recipe._id}`} className="font-bold text-gray-900 text-lg hover:text-orange-600 transition-colors line-clamp-1 mb-1">{recipe.title}</Link>
                      {recipe.author && <p className="text-xs text-gray-400 font-bold mb-3">by {recipe.author.username}</p>}
                      <div className="flex gap-4 text-xs text-gray-500 mt-auto border-t pt-3 flex-wrap">
                        <span className="flex items-center gap-1"><Clock size={12} /> {recipe.prepTimeMinutes || 30}m</span>
                        <button 
                          onClick={() => handleUnlikeRecipe(recipe._id)}
                          className="ml-auto text-red-500 hover:text-red-700 font-bold flex items-center gap-1"
                          title="Unlike Recipe"
                        >
                          <Heart size={14} className="fill-current" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Folder Recipes Modal */}
      {selectedFolder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full relative max-h-[85vh] flex flex-col">
            <button onClick={() => setSelectedFolder(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center">
              <FolderHeart className="mr-2 text-orange-500" /> {selectedFolder.title}
            </h2>
            <p className="text-gray-500 text-sm mb-6">Manage saved recipes in this folder</p>

            <div className="flex-grow overflow-y-auto space-y-4 pr-1">
              {!selectedFolder.recipes || selectedFolder.recipes.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <ChefHat className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <p className="text-gray-500 font-medium">No recipes in this folder yet.</p>
                  <Link 
                    to="/" 
                    onClick={() => setSelectedFolder(null)}
                    className="text-orange-600 font-bold hover:underline text-sm mt-2 inline-block"
                  >
                    Browse recipes to add some!
                  </Link>
                </div>
              ) : (
                selectedFolder.recipes.map(recipe => (
                  <div key={recipe._id} className="flex gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-orange-100 transition-colors items-center">
                    <img src={recipe.imageUrl} alt={recipe.title} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <Link 
                        to={`/recipe/${recipe._id}`} 
                        onClick={() => setSelectedFolder(null)}
                        className="font-bold text-gray-900 hover:text-orange-600 transition-colors block truncate text-base"
                      >
                        {recipe.title}
                      </Link>
                      <div className="flex gap-3 text-xs text-gray-500 mt-1">
                        <span className="font-semibold text-orange-600">{recipe.difficulty}</span>
                        <span>•</span>
                        <span>{recipe.prepTimeMinutes || 30} mins</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleRemoveRecipeFromFolder(selectedFolder._id, recipe._id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                      title="Remove from Folder"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="border-t pt-4 mt-6 flex justify-between items-center">
              <button 
                onClick={() => {
                  const id = selectedFolder._id;
                  setSelectedFolder(null);
                  handleDeleteFolder(id);
                }}
                className="text-xs font-bold text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors flex items-center gap-1"
              >
                <Trash2 size={14} /> Delete Entire Folder
              </button>
              <button 
                onClick={() => setSelectedFolder(null)}
                className="px-5 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors text-sm font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

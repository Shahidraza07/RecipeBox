import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ChefHat, Wand2, Copy, CheckCircle, UploadCloud } from 'lucide-react';
import api from '../api';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register } = useContext(AuthContext); 
  const navigate = useNavigate();

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const generateStrongPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
    let newPassword = "";
    for (let i = 0; i < 16; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(newPassword);
    setShowSuggestion(true);
    setCopied(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('email', email);
      formData.append('password', password);
      if (avatar) {
        formData.append('avatar', avatar);
      }

      const res = await api.post('/api/auth/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      localStorage.setItem('token', res.data.token);
      
      // Force a full page reload so AuthContext picks up the new token
      window.location.href = '/'; 

    } catch (err) {
      const serverErrorMsg = err.response?.data?.error || (typeof err.response?.data === 'string' ? err.response.data : null) || err.message;
      setError(serverErrorMsg || 'Failed to register. Username or email might be taken.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">
        
        {/* Form Container */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">Join RecipeBox</h2>
            <p className="text-gray-500 mt-2">Create an account to start sharing your recipes.</p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
            
            {/* Avatar Upload */}
            <div className="flex flex-col items-center justify-center mb-6">
              <label htmlFor="avatar-upload" className="cursor-pointer group relative">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center overflow-hidden group-hover:border-orange-500 transition-colors">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <UploadCloud className="text-gray-400 group-hover:text-orange-500" size={24} />
                      <span className="text-[10px] text-gray-500 font-bold mt-1">Profile Pic</span>
                    </>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <UploadCloud className="text-white" size={24} />
                </div>
              </label>
              <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Username</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all text-sm" 
                placeholder="e.g. MasterChef99" 
                autoComplete="off"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all text-sm" 
                placeholder="you@example.com" 
                autoComplete="off"
                required 
              />
            </div>
            <div>
              <div className="flex justify-between items-end mb-1">
                <label className="block text-sm font-semibold text-gray-700">Password</label>
                <button 
                  type="button" 
                  onClick={generateStrongPassword}
                  className="text-[10px] flex items-center text-orange-600 hover:text-orange-700 font-bold bg-orange-50 px-2 py-1 rounded"
                >
                  <Wand2 size={10} className="mr-1" /> Strong Password
                </button>
              </div>
              <input 
                type="text" 
                value={password} 
                onChange={(e) => {
                  setPassword(e.target.value);
                  setShowSuggestion(false);
                }} 
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all font-mono text-sm" 
                placeholder="••••••••" 
                minLength="6"
                autoComplete="new-password"
                required 
              />
              {showSuggestion && password && (
                <div className="mt-2 flex items-center justify-between bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-xs">
                  <span>Strong password applied!</span>
                  <button 
                    type="button" 
                    onClick={copyToClipboard}
                    className="flex items-center text-green-700 hover:text-green-800 font-bold"
                  >
                    {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                    <span className="ml-1">{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              )}
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors shadow-md mt-4 disabled:opacity-50 text-sm">
              {isSubmitting ? 'Uploading Profile...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-orange-600 hover:text-orange-500">
              Sign in here
            </Link>
          </p>
        </div>

        {/* Visual Container */}
        <div className="hidden md:block md:w-1/2 relative min-h-[600px]">
          <img src="/assets/login_signup_bg.png" alt="Fresh Food Cooking" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 flex flex-col justify-end p-12 text-white">
            <h3 className="text-3xl font-extrabold mb-3 leading-tight">Explore the Culinary Universe</h3>
            <p className="text-gray-200 text-sm leading-relaxed font-medium">
              Connect with home cooks worldwide, discover curated recipe folders, rate delicious dishes, and publish your own culinary creations.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

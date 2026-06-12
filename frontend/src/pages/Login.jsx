import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ChefHat } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      const serverErrorMsg = err.response?.data?.error || (typeof err.response?.data === 'string' ? err.response.data : null) || err.message;
      setError(serverErrorMsg || 'Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">
        
        {/* Form Container */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <ChefHat className="text-orange-600 h-8 w-8" />
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">Welcome Back</h2>
            <p className="text-gray-500 mt-2">Log in to save recipes and connect with cooks.</p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium border border-red-100">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Username or Email Address</label>
              <input 
                type="text" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all text-sm" 
                placeholder="you@example.com or username" 
                autoComplete="off"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all text-sm" 
                placeholder="••••••••" 
                autoComplete="new-password"
                required 
              />
            </div>
            <button type="submit" className="w-full py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors shadow-md mt-2 text-sm">
              Sign In
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-orange-600 hover:text-orange-500">
              Create one now
            </Link>
          </p>
        </div>

        {/* Visual Container */}
        <div className="hidden md:block md:w-1/2 relative min-h-[500px]">
          <img src="/assets/login_signup_bg.png" alt="Fresh Food Cooking" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 flex flex-col justify-end p-12 text-white">
            <h3 className="text-3xl font-extrabold mb-3 leading-tight">Welcome Back to the Kitchen</h3>
            <p className="text-gray-200 text-sm leading-relaxed font-medium">
              Log in to access your custom recipe folders, see your published creations, rate community recipes, and continue sharing the joy of food.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

// Reusable Avatar: shows real photo OR first letter of username
export const UserAvatar = ({ avatar, username, size = 'sm' }) => {
  const sizeClass = size === 'sm' ? 'w-9 h-9 text-sm' : size === 'lg' ? 'w-32 h-32 text-5xl' : 'w-12 h-12 text-lg';
  const firstLetter = username ? username.charAt(0).toUpperCase() : '?';

  const hasRealAvatar = avatar &&
    !avatar.includes('ui-avatars') &&
    !avatar.includes('default_avatar') &&
    !avatar.includes('cloudinary.com/demo');

  if (hasRealAvatar) {
    return (
      <img
        src={avatar}
        alt={username}
        className={`${sizeClass} rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0`}
      />
    );
  }

  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center font-extrabold border-2 border-white shadow-sm flex-shrink-0 select-none`}>
      {firstLetter}
    </div>
  );
};

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-black tracking-tighter text-orange-600 flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-600 text-white rounded-lg flex items-center justify-center font-serif italic text-xl">R</div>
          RecipeBox
        </Link>

        <nav className="space-x-6 flex items-center">
          <Link to="/" className="text-gray-600 font-medium hover:text-orange-600 transition-colors hidden sm:block">Explore</Link>

          {user ? (
            <>
              <Link to="/create" className="text-gray-600 font-medium hover:text-orange-600 transition-colors hidden sm:block">Create</Link>
              <div className="flex items-center gap-3 border-l pl-5">
                <Link to="/profile" className="flex items-center gap-2 hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors">
                  <UserAvatar avatar={user.avatar} username={user.username} size="sm" />
                  <span className="font-bold text-gray-700 text-sm hidden sm:block">{user.username}</span>
                </Link>
                <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50" title="Logout">
                  <LogOut size={20} />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-600 font-medium hover:text-orange-600 transition-colors">Log in</Link>
              <Link to="/register" className="px-5 py-2.5 bg-orange-600 text-white font-bold rounded-full hover:bg-orange-700 transition-all hover:shadow-md">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import CreateRecipe from './pages/CreateRecipe';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RecipeDetail from './pages/RecipeDetail';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col font-sans">
          <Navbar />

          <main className="flex-grow bg-gray-50 flex w-full">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<CreateRecipe />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/recipe/:id" element={<RecipeDetail />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </main>
          
          <footer className="bg-white border-t py-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 font-medium">
              &copy; 2026 RecipeBox. Built for food lovers everywhere.
            </div>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

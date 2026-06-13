require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const cookbookRoutes = require('./routes/cookbookRoutes');
const commentRoutes = require('./routes/commentRoutes');
const { MongoMemoryServer } = require('mongodb-memory-server');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const allowedOrigins = ['http://localhost:5173', 'https://frontend-5uo5g2zsv-shahid-raza-s-projects.vercel.app'];
app.use(cors())({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || origin.includes('vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }, 
  credentials: true
}));
app.use(express.json());

// Database connection health check middleware
app.use((req, res, next) => {
  // If request is for root or health check, skip DB check
  if (req.path === '/' || req.path === '/api/health') {
    return next();
  }
  
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ 
      error: 'Database is offline. Please make sure your local MongoDB server is running (run "mongod" or start the MongoDB service) or check your MONGODB_URI in your backend .env file.' 
    });
  }
  next();
});

// Database connection logic
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/recipebox';
    try {
      await mongoose.connect(MONGODB_URI);
      isConnected = true;
      console.log('✅ Connected to standard MongoDB');
    } catch (err) {
      console.log('⚠️ Standard MongoDB not found. Starting a temporary in-memory database...');
      const mongoServer = await MongoMemoryServer.create();
      const tempUri = mongoServer.getUri();
      await mongoose.connect(tempUri);
      isConnected = true;
      console.log(`✅ Connected to Temporary In-Memory MongoDB at ${tempUri}`);
    }
  } catch (error) {
    console.error('❌ Final MongoDB connection error:', error);
  }
};

// Connect to DB on each request for serverless compatibility, if not already connected
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/cookbooks', cookbookRoutes);
app.use('/api/recipes', commentRoutes);

app.get('/', (req, res) => {
  res.send('RecipeBox API is running.');
});

// Export app for Vercel, or listen locally
if (process.env.NODE_ENV !== 'production') {
  // Try to connect once locally before listening
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  });
}

module.exports = app;
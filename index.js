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
app.use(cors());
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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/cookbooks', cookbookRoutes);
app.use('/api/recipes', commentRoutes);

app.get('/', (req, res) => {
  res.send('RecipeBox API is running.');
});

// Database connection logic that works everywhere
const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/recipebox';
    
    try {
      // First try to connect to your local/cloud MongoDB
      await mongoose.connect(MONGODB_URI);
      console.log('✅ Connected to standard MongoDB');
    } catch (err) {
      console.log('⚠️ Standard MongoDB not found. Starting a temporary in-memory database...');
      
      // If standard connection fails, spin up the temporary database!
      const mongoServer = await MongoMemoryServer.create();
      const tempUri = mongoServer.getUri();
      
      await mongoose.connect(tempUri);
      console.log(`✅ Connected to Temporary In-Memory MongoDB at ${tempUri}`);
      console.log('ℹ️  NOTE: Data will be lost when you restart the server.');
    }

    // Start the server only after database is connected
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Final MongoDB connection error:', error);
  }
};

connectDB();
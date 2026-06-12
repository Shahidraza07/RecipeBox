# 🍳 RecipeBox - The Instagram for Foodies

Welcome to **RecipeBox**, a premium, full-stack recipe sharing social network designed for food lovers to publish, discover, save, and rate culinary creations.

---

## 🚀 How to Run the Application

The project is split into a **Frontend** (Vite + React) and a **Backend** (Node.js + Express + Mongoose).

### 1. Start the Backend Server
1. Navigate to the `backend` folder in your terminal:
   ```bash
   cd backend
   ```
2. Install dependencies (if you haven't already):
   ```bash
   npm install
   ```
3. Start the development server (runs on `http://localhost:5000`):
   ```bash
   npm run dev
   ```

### 2. Start the Frontend Dev Server
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies (if you haven't already):
   ```bash
   npm install
   ```
3. Start the Vite development server (runs on `http://localhost:5173`):
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

---

## 🗄️ Database: Connecting to MongoDB Atlas (Production)

Currently, the backend attempts to connect to your local MongoDB server at `mongodb://localhost:27017/recipebox`. If it is offline, it automatically spins up a **Temporary In-Memory MongoDB Server**. 

> [!NOTE]
> Any accounts or recipes created using the Temporary In-Memory Database will be wiped clean whenever the backend server restarts.

To make your data **permanent**, you can connect to a free cloud database on **MongoDB Atlas**:
1. Create a free account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free shared cluster and get your connection string (looks like `mongodb+srv://username:password@cluster.mongodb.net/recipebox`).
3. Open your backend [`.env`](file:///C:/Users/Shahid%20Raza/Persevex%20Projects/Persevex%20Project-2/RecipeBox/backend/.env) file.
4. Replace `MONGODB_URI` with your connection string:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/recipebox
   ```
5. Restart your backend server. Your data will now persist forever!

---

## ✨ Implemented Features

Here is a summary of the capabilities now fully built and integrated into your workspace:

### 1. 👥 Robust Authentication & Dual Login
*   **Sign Up**: Custom profile picture uploads with automatic Cloudinary storage.
*   **Dual Login**: Log in with either your **email address** or your **username** (e.g. `shahidfx007`).
*   **Security**: BCRYPT password hashing and JWT token authorization.
*   **Diagnostics**: Active database monitoring immediately warns you in the UI if your MongoDB service is offline instead of hanging.

### 2. 🍲 Recipe Publishing & CRUD
*   **Publish Recipes**: Upload cover images, title, description, prep time, difficulty, ingredients list, and step-by-step instructions.
*   **Automatic Ownership**: Recipes are linked to the logged-in creator.
*   **Recipe Deletion**: Creators can delete their own recipes. Deleting a recipe automatically pulls it from any user's saved folders to prevent broken links.

### 3. 💬 Ratings, Comments & Persistent Likes
*   **Likes (Favorites)**: Click the heart icon on any recipe. Likes are now saved directly to the database and persist across page loads.
*   **Ratings**: Interactive 5-star ratings with real-time average calculation.
*   **Comments**: Post thoughts and feedback on recipes. Comments display user avatars and can be deleted by their author.

### 4. 📁 Recipe Folders (Cookbooks)
*   **Organize**: Create recipe folders (e.g., "Holiday Desserts").
*   **Interactive Modal**: Save recipes directly into folders from the detail page, or create folders on the fly.
*   **Management**: View all recipes inside a folder, remove recipes individually, or delete the entire folder from your Profile.

### 5. 🎴 Profile Tabbed Feeds
The user profile page now supports three tabs:
1.  **My Folders**: Manage your recipe collections.
2.  **My Creations**: View and manage recipes you have published.
3.  **My Favorites**: View all recipes you have liked.

---

## 🎨 Premium Visual Enhancements
*   **Explore Hero**: Embellished with overhead food photography, blur overlays, and smooth button styles.
*   **Authentication Forms**: Styled as modern split layouts with rustic Italian dining photography on the right.
*   **Avatars**: Automatically displays the user's uploaded photo, or dynamically falls back to their username's first letter on a warm orange gradient.

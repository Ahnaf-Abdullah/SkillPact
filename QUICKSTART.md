# SkillPact - Quick Start Guide

🚀 **Get started with SkillPact in 10 minutes!**

## Step 1: Firebase Setup (5 minutes)

### Create Firebase Project
1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Name it **"SkillPact"**
4. Disable Google Analytics (optional)
5. Click **"Create project"**

### Enable Authentication
1. Click **"Authentication"** in sidebar
2. Click **"Get started"**
3. Choose **"Email/Password"**
4. Toggle **"Enable"** and click **"Save"**

### Create Firestore Database
1. Click **"Firestore Database"** in sidebar
2. Click **"Create database"**
3. Choose **"Start in production mode"**
4. Select your region
5. Click **"Enable"**

### Get Your Config
1. Click the **gear icon** → **"Project settings"**
2. Scroll to **"Your apps"**
3. Click the **web icon** `</>`
4. Register app: name it **"SkillPact Web"**
5. **Copy the config object** (you'll need this!)

---

## Step 2: Install & Configure (3 minutes)

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

### Configure Environment

Edit `frontend/.env` and paste your Firebase config:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=skillpact-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=skillpact-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=skillpact-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:xxxxx
```

---

## Step 3: Deploy Security Rules (1 minute)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize (from project root)
firebase init

# Select: Firestore
# Use existing project: skillpact-xxxxx
# Accept default filenames

# Deploy rules
firebase deploy --only firestore:rules
```

---

## Step 4: Run the App (1 minute)

```bash
# From frontend directory
npm run dev
```

Visit: **http://localhost:5173** 🎉

---

## Your First Learning Plan

### 1. Create Account
- Click **"Sign up"**
- Enter email, password, and name
- Click **"Sign up"**

### 2. Create Plan
- Click **"Create New Plan"**
- Title: `"Learn React in 4 Weeks"`
- Description: `"Master React fundamentals"`
- Click **"Create Plan"**

### 3. Add Weeks
- Click **"+ Add New Week"**
- Leave default or customize title
- Click **"Add Week"**

### 4. Add Tasks
- Click **"+ Add Task"** under a week
- Task: `"Complete React tutorial"`
- Description: `"Official React docs tutorial"`
- Click **"Add Task"**

### 5. Complete Tasks
- ✅ Check the box to mark complete
- Watch your progress bar grow!

### 6. Invite Friends
- Click **"Invite Member"**
- Enter friend's email
- Click **"Send"**
- Friend receives invitation in their dashboard

---

## Deployment to Production

### Deploy to Vercel (2 minutes)

```bash
# Build the app
npm run build

# Deploy to Vercel
npx vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: skillpact
# - Directory: ./
```

### Add Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each `VITE_FIREBASE_*` variable
5. Redeploy

---

## Troubleshooting

### "Permission Denied" errors
✅ **Solution:** Deploy Firestore rules
```bash
firebase deploy --only firestore:rules
```

### "Firebase not configured"
✅ **Solution:** Check `.env` file exists and has correct values

### "Module not found" errors
✅ **Solution:** Reinstall dependencies
```bash
rm -rf node_modules
npm install
```

### Tasks not updating
✅ **Solution:** Check browser console for errors, verify Firestore rules

---

## Project Structure

```
SkillPact/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CreatePlan.jsx
│   │   │   └── PlanView.jsx
│   │   ├── config/
│   │   │   └── firebase.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   └── package.json
├── backend/ (optional)
├── firestore.rules
└── firebase.json
```

---

## Key Features

✅ **Authentication**
- Email/password signup and login
- Protected routes
- Auto-redirect to dashboard

✅ **Learning Plans**
- Create unlimited plans
- Add weekly sections
- Add tasks with descriptions
- Track completion status

✅ **Collaboration**
- Invite friends by email
- Accept/reject invitations
- See everyone's progress
- Real-time updates

✅ **Progress Tracking**
- Visual progress bars
- Percentage completion
- Per-user tracking
- Task completion history

---

## Commands Cheat Sheet

```bash
# Frontend
cd frontend
npm install          # Install dependencies
npm run dev          # Run development server
npm run build        # Build for production
npm run preview      # Preview production build

# Backend (optional)
cd backend
npm install          # Install dependencies
npm run dev          # Run with nodemon
npm start            # Run production server

# Firebase
firebase login       # Login to Firebase
firebase init        # Initialize Firebase
firebase deploy      # Deploy all services
firebase deploy --only firestore:rules  # Deploy rules only

# Vercel
vercel               # Deploy to Vercel
vercel --prod        # Deploy to production
```

---

## Next Steps

📚 **Read the Docs:**
- [SETUP.md](SETUP.md) - Detailed setup instructions
- [ARCHITECTURE.md](ARCHITECTURE.md) - Component architecture
- [API.md](API.md) - Backend API documentation

🛠️ **Customize:**
- Modify colors in Tailwind config
- Add your logo in `public/`
- Customize authentication flow
- Add new features

🚀 **Deploy:**
- Deploy frontend to Vercel
- Deploy backend to Railway/Render
- Set up custom domain
- Configure analytics

---

## Support & Resources

- **Firebase Docs:** https://firebase.google.com/docs
- **React Docs:** https://react.dev
- **Tailwind CSS:** https://tailwindcss.com
- **Vite Docs:** https://vitejs.dev

---

## Common Tasks

### Add a New Page
```jsx
// 1. Create component
// src/pages/NewPage.jsx
const NewPage = () => {
  return <div>New Page</div>;
};
export default NewPage;

// 2. Add route in App.jsx
<Route path="/new" element={<ProtectedRoute><NewPage /></ProtectedRoute>} />
```

### Add a New Firestore Collection
```javascript
// Add to firestore.rules
match /newCollection/{docId} {
  allow read, write: if isAuthenticated();
}

// Deploy rules
firebase deploy --only firestore:rules
```

### Style a Component
```jsx
// Use Tailwind utilities
<div className="bg-white shadow rounded-lg p-6">
  <h2 className="text-xl font-bold text-gray-900">Title</h2>
  <p className="text-gray-600">Description</p>
</div>
```

---

**Happy Learning! 🎓**

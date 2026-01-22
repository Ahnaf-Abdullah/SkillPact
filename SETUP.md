# SkillPact - Setup Guide

## Prerequisites

Before you begin, ensure you have:
- Node.js (v18 or higher)
- npm or yarn
- A Firebase account
- A Vercel account (for deployment)

## Firebase Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Enable Google Analytics (optional)

### 2. Enable Authentication

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Enable **Email/Password** authentication
3. Click **Save**

### 3. Create Firestore Database

1. Go to **Firestore Database** in the Firebase Console
2. Click **Create database**
3. Start in **production mode** (we'll add rules later)
4. Choose a location close to your users

### 4. Get Firebase Configuration

1. Go to **Project Settings** → **General**
2. Scroll to "Your apps" section
3. Click the web icon (</>) to add a web app
4. Register your app with a nickname (e.g., "SkillPact Web")
5. Copy the Firebase configuration object

### 5. Get Firebase Admin SDK Credentials (for Backend)

1. Go to **Project Settings** → **Service Accounts**
2. Click **Generate new private key**
3. Save the JSON file securely (never commit this to git!)

## Local Development Setup

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```bash
cp .env.example .env
```

4. Add your Firebase configuration to `.env`:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

5. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Backend Setup (Optional - for API endpoints)

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```bash
cp .env.example .env
```

4. Add your Firebase Admin SDK credentials to `.env`:
```
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="your_private_key"
PORT=3000
NODE_ENV=development
```

5. Start the backend server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## Deploy Firestore Security Rules

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase in your project (from the root directory):
```bash
firebase init
```

Select:
- Firestore (rules and indexes)
- Use existing project
- Accept default file names

4. Deploy security rules:
```bash
firebase deploy --only firestore:rules
```

## Deployment

### Frontend Deployment (Vercel)

1. Install Vercel CLI (optional):
```bash
npm install -g vercel
```

2. Build the frontend:
```bash
cd frontend
npm run build
```

3. Deploy to Vercel:

**Option A: Using Vercel CLI**
```bash
vercel
```

**Option B: Using Vercel Dashboard**
- Go to [Vercel Dashboard](https://vercel.com/dashboard)
- Click "Add New Project"
- Import your GitHub repository
- Set root directory to `frontend`
- Add environment variables from your `.env` file
- Deploy

4. Add environment variables in Vercel:
- Go to Project Settings → Environment Variables
- Add all `VITE_FIREBASE_*` variables

### Backend Deployment (Optional)

The backend can be deployed to:
- **Vercel** (as serverless functions)
- **Railway**
- **Render**
- **Heroku**
- **Google Cloud Run**

For Vercel serverless:
1. Move backend code to `api` folder
2. Configure `vercel.json` for API routes
3. Deploy alongside frontend

## Testing the Application

### Create Your First Learning Plan

1. Sign up with email and password
2. You'll be redirected to the dashboard
3. Click "Create New Plan"
4. Enter a title and description
5. Add weekly sections and tasks
6. Invite friends by email

### Invite Collaboration

1. In a learning plan, click "Invite Member"
2. Enter friend's email address
3. Friend will see invitation in their dashboard
4. Friend accepts invitation
5. Both users can now track progress together

## Troubleshooting

### Firebase Connection Issues
- Verify environment variables are correct
- Check Firebase project settings
- Ensure Firestore rules are deployed

### Authentication Errors
- Verify Email/Password auth is enabled in Firebase
- Check auth domain in environment variables
- Clear browser cache and cookies

### Build Errors
- Delete `node_modules` and run `npm install` again
- Ensure Node.js version is 18 or higher
- Check for missing dependencies

## Project Structure

```
SkillPact/
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React contexts (Auth)
│   │   ├── config/          # Firebase config
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── public/              # Static assets
│   ├── .env                 # Environment variables
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Express middleware
│   │   ├── config/          # Firebase admin config
│   │   └── index.js         # Server entry point
│   ├── .env                 # Backend environment variables
│   └── package.json
├── firebase.json            # Firebase configuration
├── firestore.rules          # Firestore security rules
└── README.md
```

## Key Features Implemented

✅ Email/password authentication  
✅ Protected routes  
✅ Dashboard with learning plans  
✅ Create and manage learning plans  
✅ Weekly task organization  
✅ Task completion tracking  
✅ Invite friends by email  
✅ Accept/reject invitations  
✅ Real-time progress tracking  
✅ Mobile responsive design  
✅ Firebase security rules  
✅ REST API (optional backend)  

## Support

For issues or questions:
1. Check Firebase Console for errors
2. Check browser console for client-side errors
3. Check Vercel deployment logs
4. Review Firestore security rules

## License

MIT

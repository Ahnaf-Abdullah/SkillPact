# SkillPact 🎓

> A collaborative learning web app that helps friends learn together at the same pace through shared learning plans, weekly tasks, and mutual accountability.

![React](https://img.shields.io/badge/React-19.2-blue)
![Vite](https://img.shields.io/badge/Vite-7.2-purple)
![Firebase](https://img.shields.io/badge/Firebase-12.8-orange)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-cyan)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **Authentication** | Secure email/password authentication with Firebase Auth |
| 📚 **Learning Plans** | Create and manage collaborative learning plans |
| 📅 **Weekly Structure** | Organize learning into weekly sections with tasks |
| ✅ **Task Tracking** | Mark tasks complete and track progress |
| 👥 **Collaboration** | Invite friends and learn together |
| 📊 **Progress Bars** | Visual progress tracking for each member |
| 🔔 **Invitations** | Email-based invitation system |
| 📱 **Responsive** | Mobile-friendly design with Tailwind CSS |

---

## 🚀 Quick Start

**Get up and running in 10 minutes!** See [QUICKSTART.md](QUICKSTART.md)

```bash
# 1. Install dependencies
cd frontend && npm install

# 2. Configure Firebase (create .env file)
cp .env.example .env
# Add your Firebase config to .env

# 3. Deploy security rules
firebase deploy --only firestore:rules

# 4. Run the app
npm run dev
```

Visit **http://localhost:5173** 🎉

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [📖 QUICKSTART.md](QUICKSTART.md) | Get started in 10 minutes |
| [🛠️ SETUP.md](SETUP.md) | Detailed setup instructions |
| [🏗️ ARCHITECTURE.md](ARCHITECTURE.md) | Component architecture & design |
| [🔌 API.md](API.md) | Backend API documentation |

---

## 🏗️ Tech Stack

### Frontend
- **Framework:** React 19.2
- **Build Tool:** Vite 7.2
- **Styling:** Tailwind CSS 4.1
- **Routing:** React Router DOM 7.12
- **Authentication:** Firebase Auth 12.8

### Backend (Optional)
- **Runtime:** Node.js
- **Framework:** Express 4.18
- **Admin SDK:** Firebase Admin 12.0

### Database
- **Database:** Cloud Firestore
- **Authentication:** Firebase Auth
- **Security:** Firestore Security Rules

### Deployment
- **Frontend:** Vercel
- **Backend:** Firebase Functions / Vercel Serverless
- **Database:** Firebase Cloud

---

## 📁 Project Structure

```
SkillPact/
├── 📁 frontend/
│   ├── 📁 src/
│   │   ├── 📁 components/      # Reusable components
│   │   │   └── ProtectedRoute.jsx
│   │   ├── 📁 contexts/        # React contexts
│   │   │   └── AuthContext.jsx
│   │   ├── 📁 pages/           # Page components
│   │   │   ├── Login.jsx
│   │   │   ├── Signup.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── CreatePlan.jsx
│   │   │   └── PlanView.jsx
│   │   ├── 📁 config/          # Configuration
│   │   │   └── firebase.js
│   │   ├── App.jsx             # Main app
│   │   ├── main.jsx            # Entry point
│   │   └── index.css           # Global styles
│   ├── .env                    # Environment variables
│   └── package.json
│
├── 📁 backend/                 # Optional Express API
│   ├── 📁 src/
│   │   ├── 📁 routes/          # API routes
│   │   ├── 📁 middleware/      # Express middleware
│   │   ├── 📁 config/          # Firebase admin config
│   │   └── index.js            # Server entry
│   └── package.json
│
├── 📄 firebase.json            # Firebase configuration
├── 📄 firestore.rules          # Security rules
├── 📄 firestore.indexes.json   # Database indexes
├── 📄 README.md                # This file
├── 📄 QUICKSTART.md            # Quick start guide
├── 📄 SETUP.md                 # Detailed setup
├── 📄 ARCHITECTURE.md          # Architecture docs
└── 📄 API.md                   # API documentation
```

---

## 🗄️ Firebase Data Structure

### Collections

```
📦 users/{userId}
  ├── email: string
  ├── displayName: string
  └── createdAt: timestamp

📦 learningPlans/{planId}
  ├── title: string
  ├── description: string
  ├── ownerId: string
  ├── createdAt: timestamp
  ├── updatedAt: timestamp
  │
  ├── 📦 members/{memberId}
  │   ├── userId: string
  │   ├── email: string
  │   ├── status: 'pending' | 'accepted' | 'rejected'
  │   ├── invitedAt: timestamp
  │   └── respondedAt: timestamp
  │
  └── 📦 weeks/{weekId}
      ├── weekNumber: number
      ├── title: string
      ├── createdAt: timestamp
      │
      └── 📦 tasks/{taskId}
          ├── title: string
          ├── description: string
          ├── completedBy: [userId1, userId2]
          └── createdAt: timestamp
```

---

## 🎯 Use Cases

### Solo Learner
- Create personal learning plans
- Break down learning into weekly goals
- Track progress with visual indicators
- Stay accountable with task completion

### Study Buddies
- Learn together at the same pace
- See each other's progress in real-time
- Share the same curriculum
- Motivate each other to complete tasks

### Mentorship
- Mentor creates structured learning path
- Student follows week-by-week
- Both track progress
- Clear visibility of completion

### Team Learning
- Company training programs
- Book clubs
- Online course companions
- Coding bootcamp coordination

---

## 🔒 Security

### Firebase Security Rules
- Owner-based access control
- Member-only read access
- Protected task updates
- Email-verified invitations

### Authentication
- Firebase Auth email/password
- Protected routes with React Router
- JWT token verification (backend)
- Auto-redirect on auth state change

---

## 🌐 Deployment

### Frontend (Vercel)
```bash
# Build
npm run build

# Deploy
vercel --prod
```

### Backend (Optional)
Deploy to:
- Vercel Serverless Functions
- Firebase Functions
- Railway / Render / Heroku
- Google Cloud Run

### Firestore Rules
```bash
firebase deploy --only firestore:rules
```

---

## 🧪 Development

```bash
# Frontend development
cd frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Backend development (optional)
cd backend
npm run dev          # Start with nodemon
npm start            # Production server

# Firebase
firebase emulators:start  # Run local emulators
firebase deploy           # Deploy to production
```

---

## 🤝 Contributing

This is a learning project and contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

---

## 📝 License

MIT License - feel free to use this project for learning and building your own apps!

---

## 🙏 Acknowledgments

Built with:
- [React](https://react.dev) - UI library
- [Vite](https://vitejs.dev) - Build tool
- [Firebase](https://firebase.google.com) - Backend services
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Vercel](https://vercel.com) - Hosting

---

**Happy Learning Together! 🎓✨**

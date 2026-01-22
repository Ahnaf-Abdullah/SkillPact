# SkillPact - Component Architecture

## Component Hierarchy

```
App
├── AuthProvider (Context)
│   ├── Login
│   ├── Signup
│   └── ProtectedRoute
│       ├── Dashboard
│       ├── CreatePlan
│       └── PlanView
```

## Core Components

### 1. Authentication Components

#### **Login** (`src/pages/Login.jsx`)
- Email/password login form
- Error handling and validation
- Redirects to dashboard on success
- Link to signup page

**Props:** None  
**State:**
- `email`: string
- `password`: string
- `error`: string
- `loading`: boolean

**Key Functions:**
- `handleSubmit()`: Authenticates user with Firebase

---

#### **Signup** (`src/pages/Signup.jsx`)
- User registration form
- Creates user in Firebase Auth
- Creates user document in Firestore
- Password validation (min 6 characters)

**Props:** None  
**State:**
- `email`: string
- `password`: string
- `displayName`: string
- `error`: string
- `loading`: boolean

**Key Functions:**
- `handleSubmit()`: Creates new user account

---

### 2. Context Providers

#### **AuthContext** (`src/contexts/AuthContext.jsx`)
- Manages authentication state globally
- Provides auth functions to all components
- Listens to Firebase auth state changes

**Provided Values:**
- `currentUser`: object | null
- `loading`: boolean
- `signup(email, password, displayName)`: function
- `login(email, password)`: function
- `logout()`: function

**Key Functions:**
- `onAuthStateChanged()`: Syncs Firebase auth with app state

---

### 3. Protected Routes

#### **ProtectedRoute** (`src/components/ProtectedRoute.jsx`)
- Higher-order component for route protection
- Redirects unauthenticated users to login
- Shows loading state during auth check

**Props:**
- `children`: React.Node

---

### 4. Dashboard Components

#### **Dashboard** (`src/pages/Dashboard.jsx`)
- Main landing page after login
- Displays user's learning plans
- Shows pending invitations
- Create new plan button

**State:**
- `learningPlans`: array
- `invitations`: array
- `loading`: boolean

**Key Functions:**
- `fetchData()`: Loads plans and invitations
- `handleAcceptInvitation(planId, memberId)`: Accepts invitation
- `handleRejectInvitation(planId, memberId)`: Rejects invitation
- `handleLogout()`: Signs out user

**Firestore Queries:**
```javascript
// Get owned plans
collection('learningPlans').where('ownerId', '==', userId)

// Get member status
collection('learningPlans/{planId}/members').where('userId', '==', userId)
```

---

#### **CreatePlan** (`src/pages/CreatePlan.jsx`)
- Form to create new learning plan
- Title and description fields
- Navigates to plan view on success

**State:**
- `title`: string
- `description`: string
- `loading`: boolean
- `error`: string

**Key Functions:**
- `handleSubmit()`: Creates plan in Firestore

**Firestore Operations:**
```javascript
addDoc(collection(db, 'learningPlans'), planData)
```

---

### 5. Learning Plan Components

#### **PlanView** (`src/pages/PlanView.jsx`)
- Comprehensive plan management interface
- Shows progress for all members
- Week and task management
- Member invitation system

**State:**
- `plan`: object
- `weeks`: array
- `members`: array
- `isOwner`: boolean
- `loading`: boolean
- Form states for adding weeks/tasks/members

**Key Functions:**
- `fetchPlanData()`: Loads complete plan data
- `handleAddWeek(weekTitle)`: Creates new week
- `handleAddTask(weekId, taskData)`: Adds task to week
- `handleToggleTask(weekId, taskId)`: Marks task complete/incomplete
- `handleInviteMember(email)`: Sends invitation
- `calculateProgress(userId)`: Computes completion percentage

**Firestore Structure:**
```javascript
learningPlans/{planId}
  ├── members/{memberId}
  └── weeks/{weekId}
      └── tasks/{taskId}
```

---

## Data Flow

### Authentication Flow
```
1. User enters credentials
2. Login/Signup component calls AuthContext method
3. Firebase Auth processes request
4. AuthContext updates currentUser state
5. Protected routes grant access
6. User redirected to dashboard
```

### Plan Creation Flow
```
1. User clicks "Create New Plan"
2. Navigates to CreatePlan
3. Fills form and submits
4. Plan document created in Firestore
5. Navigate to PlanView with new planId
6. Plan data loaded and displayed
```

### Task Completion Flow
```
1. User clicks checkbox on task
2. handleToggleTask() called
3. arrayUnion/arrayRemove updates completedBy
4. Firestore triggers update
5. fetchPlanData() refreshes view
6. Progress bars update automatically
```

### Invitation Flow
```
1. Owner invites by email
2. Member document created with status: 'pending'
3. Invited user sees invitation in Dashboard
4. User accepts/rejects invitation
5. Member status updated to 'accepted'/'rejected'
6. Plan appears in user's dashboard
```

---

## State Management

### Local State (useState)
Used for:
- Form inputs
- Loading states
- Error messages
- UI toggles (show/hide forms)

### Context State (AuthContext)
Used for:
- Current user data
- Authentication status
- Auth-related functions

### Server State (Firestore)
Used for:
- Learning plans
- Tasks and weeks
- Members and invitations
- User profiles

---

## Styling Architecture

### Tailwind CSS Utility Classes

**Color Scheme:**
- Primary: `indigo-600`, `indigo-700` (CTAs, links)
- Success: `green-600` (progress bars, accept buttons)
- Danger: `red-600` (delete, reject buttons)
- Neutral: `gray-50`, `gray-100`, `gray-600` (backgrounds, text)

**Layout Patterns:**
```css
/* Page container */
.max-w-7xl.mx-auto.px-4.sm:px-6.lg:px-8

/* Card */
.bg-white.shadow.rounded-lg.p-6

/* Button primary */
.px-4.py-2.bg-indigo-600.text-white.rounded-md.hover:bg-indigo-700
```

---

## API Integration (Optional Backend)

### Service Layer Pattern

Create `src/services/api.js`:

```javascript
import { auth } from '../config/firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const getAuthHeader = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
};

export const learningPlansAPI = {
  getAll: async () => {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/learning-plans`, { headers });
    return response.json();
  },
  
  getById: async (planId) => {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/learning-plans/${planId}`, { headers });
    return response.json();
  },
  
  create: async (planData) => {
    const headers = await getAuthHeader();
    const response = await fetch(`${API_BASE_URL}/learning-plans`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(planData)
    });
    return response.json();
  }
};
```

---

## Performance Optimizations

### 1. Lazy Loading Routes
```javascript
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const PlanView = lazy(() => import('./pages/PlanView'));

// Wrap in Suspense
<Suspense fallback={<div>Loading...</div>}>
  <Dashboard />
</Suspense>
```

### 2. Memoization
```javascript
import { useMemo } from 'react';

const progress = useMemo(() => calculateProgress(userId), [userId, weeks]);
```

### 3. Firestore Query Optimization
- Use indexes for compound queries
- Limit query results with `.limit()`
- Use pagination for large collections

---

## Testing Strategy

### Unit Tests
- Test individual functions (calculateProgress, etc.)
- Test form validation logic
- Test helper functions

### Integration Tests
- Test authentication flow
- Test plan creation and updates
- Test task completion

### E2E Tests (Cypress)
- Test complete user journeys
- Test invitation flow
- Test collaborative features

---

## Security Considerations

### Frontend
- Never expose Firebase Admin SDK credentials
- Validate all inputs before sending to Firestore
- Use Firebase Auth for all protected routes
- Implement CSRF protection

### Backend
- Validate JWT tokens on all endpoints
- Use Firestore security rules as second layer
- Rate limit API endpoints
- Sanitize user inputs

### Firestore Rules
- Verify ownership before writes
- Check member status before reads
- Use custom claims for roles
- Test rules thoroughly

---

## Accessibility

### ARIA Labels
```jsx
<label htmlFor="email" className="sr-only">Email</label>
<input id="email" aria-label="Email address" />
```

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Focus states clearly visible
- Tab order is logical

### Screen Reader Support
- Semantic HTML elements
- Descriptive button text
- Status messages announced

---

## Future Enhancements

### Phase 2
- Real-time updates using Firestore listeners
- Push notifications
- File attachments for tasks
- Comments and discussions

### Phase 3
- Gamification (badges, streaks)
- Analytics dashboard
- Export learning plans
- Mobile app (React Native)

### Phase 4
- AI-powered learning recommendations
- Video integration
- Live sessions
- Certificates of completion

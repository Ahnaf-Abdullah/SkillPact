# SkillPact - API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication

All API endpoints (except health check) require authentication using Firebase ID tokens.

### Headers
```
Authorization: Bearer <firebase_id_token>
Content-Type: application/json
```

## Endpoints

### Health Check

**GET** `/`

Check if the API is running.

**Response:**
```json
{
  "message": "SkillPact API",
  "version": "1.0.0",
  "status": "active"
}
```

---

### Learning Plans

#### Get All Learning Plans

**GET** `/api/learning-plans`

Get all learning plans owned by the authenticated user.

**Response:**
```json
{
  "plans": [
    {
      "id": "plan123",
      "title": "Learn React in 8 Weeks",
      "description": "Comprehensive React learning path",
      "ownerId": "user123",
      "createdAt": "2026-01-22T10:00:00.000Z",
      "updatedAt": "2026-01-22T10:00:00.000Z"
    }
  ]
}
```

#### Get Learning Plan by ID

**GET** `/api/learning-plans/:planId`

Get a specific learning plan by ID.

**Response:**
```json
{
  "plan": {
    "id": "plan123",
    "title": "Learn React in 8 Weeks",
    "description": "Comprehensive React learning path",
    "ownerId": "user123",
    "createdAt": "2026-01-22T10:00:00.000Z",
    "updatedAt": "2026-01-22T10:00:00.000Z"
  }
}
```

#### Create Learning Plan

**POST** `/api/learning-plans`

Create a new learning plan.

**Request Body:**
```json
{
  "title": "Learn React in 8 Weeks",
  "description": "Comprehensive React learning path"
}
```

**Response:**
```json
{
  "id": "plan123",
  "title": "Learn React in 8 Weeks",
  "description": "Comprehensive React learning path",
  "ownerId": "user123",
  "createdAt": "2026-01-22T10:00:00.000Z",
  "updatedAt": "2026-01-22T10:00:00.000Z"
}
```

#### Update Learning Plan

**PUT** `/api/learning-plans/:planId`

Update an existing learning plan.

**Request Body:**
```json
{
  "title": "Learn React in 10 Weeks",
  "description": "Updated description"
}
```

**Response:**
```json
{
  "message": "Learning plan updated successfully"
}
```

#### Delete Learning Plan

**DELETE** `/api/learning-plans/:planId`

Delete a learning plan.

**Response:**
```json
{
  "message": "Learning plan deleted successfully"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Title is required"
}
```

### 401 Unauthorized
```json
{
  "error": "No token provided"
}
```

### 403 Forbidden
```json
{
  "error": "Not authorized to access this resource"
}
```

### 404 Not Found
```json
{
  "error": "Learning plan not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Something went wrong!",
  "message": "Error details (only in development)"
}
```

---

## Data Models

### Learning Plan
```javascript
{
  id: string,
  title: string,
  description: string,
  ownerId: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Member (Sub-collection)
```javascript
{
  id: string,
  email: string,
  userId: string,
  status: 'pending' | 'accepted' | 'rejected',
  invitedAt: Timestamp,
  respondedAt: Timestamp
}
```

### Week (Sub-collection)
```javascript
{
  id: string,
  weekNumber: number,
  title: string,
  createdAt: Timestamp
}
```

### Task (Sub-collection of Week)
```javascript
{
  id: string,
  title: string,
  description: string,
  completedBy: string[], // Array of user IDs
  createdAt: Timestamp
}
```

---

## Usage Example

### JavaScript/Node.js

```javascript
import { getAuth } from 'firebase/auth';

const auth = getAuth();
const user = auth.currentUser;
const token = await user.getIdToken();

const response = await fetch('http://localhost:3000/api/learning-plans', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);
```

### React Hook

```javascript
import { useAuth } from '../contexts/AuthContext';

const MyComponent = () => {
  const { currentUser } = useAuth();
  
  const fetchPlans = async () => {
    const token = await currentUser.getIdToken();
    
    const response = await fetch('http://localhost:3000/api/learning-plans', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    return data.plans;
  };
};
```

---

## Rate Limiting

Currently, no rate limiting is implemented. Consider adding rate limiting for production using packages like `express-rate-limit`.

## CORS

CORS is enabled for all origins in development. Update the CORS configuration in production to only allow your frontend domain.

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || '*'
}));
```

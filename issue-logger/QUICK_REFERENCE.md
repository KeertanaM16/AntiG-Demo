# Quick Reference Guide - Authentication System

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Environment
Edit `server/.env`:
```bash
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
ALLOWED_ORIGIN=http://localhost:5173
```

### 3. Start Server
```bash
npm start
```

### 4. Run Tests
```bash
node test-auth.js
```

## 📌 API Quick Reference

### Base URL
```
http://localhost:5000
```

### Authentication Endpoints

#### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe"
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

# Returns: { accessToken, refreshToken, user }
```

#### Get Profile (Protected)
```bash
GET /api/auth/profile
Authorization: Bearer YOUR_ACCESS_TOKEN
```

#### Logout (Protected)
```bash
POST /api/auth/logout
Authorization: Bearer YOUR_ACCESS_TOKEN
```

#### Refresh Token
```bash
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "YOUR_REFRESH_TOKEN"
}
```

### Issue Endpoints

#### Get All Issues (Public)
```bash
GET /api/issues
```

#### Create Issue (Protected)
```bash
POST /api/issues
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "issue_text": "Issue description"
}
```

#### Update Issue (Protected - Owner/Admin Only)
```bash
PUT /api/issues/:id
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "issue_text": "Updated description"
}
```

#### Delete Issue (Protected - Owner/Admin Only)
```bash
DELETE /api/issues/:id
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## 🔑 Key Concepts

### Token Lifecycle
1. **Login** → Receive `accessToken` (15 min) + `refreshToken` (7 days)
2. **Use** → Include `accessToken` in Authorization header
3. **Expire** → When `accessToken` expires, use `refreshToken` to get new one
4. **Logout** → Clear tokens and delete from database

### Role-Based Access
- **User**: Can create/edit/delete own issues
- **Admin**: Can create/edit/delete ANY issue

### Ownership Rules
- Users can only modify their own issues
- Admins can modify any issue
- Anyone can view all issues

## 💻 Frontend Integration Example

```javascript
import { authAPI, issuesAPI, tokenManager } from './utils/api';

// Register
const result = await authAPI.register(
  'user@example.com', 
  'password123', 
  'John Doe'
);

// Login
const loginResult = await authAPI.login(
  'user@example.com', 
  'password123'
);
// Tokens are automatically stored

// Create Issue (requires auth)
const issue = await issuesAPI.create('My issue');

// Update Issue
await issuesAPI.update(issueId, 'Updated text');

// Delete Issue
await issuesAPI.delete(issueId);

// Get All Issues
const issues = await issuesAPI.getAll();

// Logout
await authAPI.logout();
// Tokens are automatically cleared
```

## 🗂️ File Locations

### Backend
- **Controllers**: `server/controllers/`
  - `authController.js` - Auth logic
  - `issueController.js` - Issue CRUD
- **Middleware**: `server/middleware/auth.js`
- **Routes**: `server/routes/`
  - `authRoutes.js`
  - `issueRoutes.js`
- **Database**: `server/db/index.js`
- **Main**: `server/index.js`

### Frontend
- **API Utility**: `client/src/utils/api.js`

### Documentation
- **Full Docs**: `AUTH_DOCUMENTATION.md`
- **Summary**: `IMPLEMENTATION_SUMMARY.md`
- **This Guide**: `QUICK_REFERENCE.md`

## 🧪 Test Results

All tests passing ✅:
- User registration
- Admin registration
- Login (user & admin)
- Get profile
- Unauthorized access blocking
- Create issue (user & admin)
- Get all issues
- Update own issue
- Update others' issue (blocked for user)
- Admin can update any issue
- Delete own issue
- Admin can delete any issue
- Logout

## 🔒 Security Checklist

- ✅ Passwords hashed with bcrypt
- ✅ JWT tokens with expiration
- ✅ HTTP-only cookies
- ✅ Role-based access control
- ✅ Ownership verification
- ✅ CORS configuration
- ✅ Token refresh mechanism
- ✅ Secure logout (token cleanup)

## 📊 Database Tables

### users
- `id`, `email`, `password`, `full_name`, `role`, `created_at`, `updated_at`

### refresh_tokens
- `id`, `user_id`, `token`, `expires_at`, `created_at`

### issue_logs
- `id`, `issue_text`, `user_id`, `created_at`

## 🎯 Common Tasks

### Create Admin User
```javascript
// In test-auth.js or via API
await apiCall('/api/auth/register', 'POST', {
  email: 'admin@example.com',
  password: 'admin123',
  full_name: 'Admin User',
  role: 'admin'
});
```

### Check if User is Authenticated (Frontend)
```javascript
import { isAuthenticated, isAdmin } from './utils/api';

if (isAuthenticated()) {
  // User is logged in
}

if (isAdmin()) {
  // User is admin
}
```

### Handle Token Expiration (Frontend)
```javascript
// Automatic in api.js
// If 401 error, automatically tries to refresh token
// If refresh fails, redirects to login
```

## 🐛 Troubleshooting

### "Access denied. No token provided"
- Make sure to include `Authorization: Bearer <token>` header
- Or ensure cookies are being sent with request

### "Invalid token"
- Token may be expired
- Try refreshing the token
- Or login again

### "You can only edit your own issues"
- User is trying to edit someone else's issue
- Only admins can edit any issue

### CORS errors
- Check `ALLOWED_ORIGIN` in `.env`
- Ensure frontend URL matches

## 📞 Support

For detailed documentation, see:
- `AUTH_DOCUMENTATION.md` - Complete API reference
- `IMPLEMENTATION_SUMMARY.md` - Implementation details

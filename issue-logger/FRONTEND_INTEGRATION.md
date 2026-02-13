# Frontend Integration Guide

## 📦 New Files Created

### Components
- `src/components/Login.jsx` - Login form component
- `src/components/Register.jsx` - Registration form component
- `src/components/IssueListWithAuth.jsx` - Issue list with edit/delete (auth-aware)
- `src/components/IssueForm.jsx` - Updated to use API utility

### Context
- `src/context/AuthContext.jsx` - Authentication state management

### Utilities
- `src/utils/api.js` - API wrapper with authentication and auto-refresh

### App
- `src/AppWithAuth.jsx` - Complete app example with authentication flow

## 🚀 Quick Integration Steps

### Option 1: Use AppWithAuth.jsx (Complete Example)

Replace your `src/App.jsx` or `src/main.jsx` entry point:

```javascript
// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import AppWithAuth from './AppWithAuth'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppWithAuth />
  </React.StrictMode>,
)
```

That's it! Your app now has:
- ✅ Complete authentication flow
- ✅ Login/Register forms
- ✅ Protected issue creation
- ✅ Edit/Delete with ownership checks
- ✅ Role-based UI (Admin badges)
- ✅ Automatic token refresh

### Option 2: Manual Integration

If you want to integrate into existing app:

#### 1. Wrap your app with AuthProvider

```javascript
// src/main.jsx or App.jsx
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      {/* Your app components */}
    </AuthProvider>
  );
}
```

#### 2. Use authentication in components

```javascript
import { useAuth } from './context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, isAdmin, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => {}} />;
  }

  return (
    <div>
      <p>Welcome, {user.email}</p>
      {isAdmin && <p>You are an admin!</p>}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

#### 3. Use API utilities

```javascript
import { issuesAPI, authAPI } from './utils/api';

// Create issue
await issuesAPI.create('Issue text');

// Get all issues
const issues = await issuesAPI.getAll();

// Update issue
await issuesAPI.update(issueId, 'Updated text');

// Delete issue
await issuesAPI.delete(issueId);

// Login
await authAPI.login('email@example.com', 'password');

// Logout
await authAPI.logout();
```

## 🎨 Component Usage Examples

### Login Component

```javascript
import Login from './components/Login';

<Login onLoginSuccess={(user) => {
  console.log('User logged in:', user);
  // Navigate to dashboard, etc.
}} />
```

### Register Component

```javascript
import Register from './components/Register';

<Register onRegisterSuccess={(user) => {
  console.log('User registered:', user);
  // Navigate to login or auto-login
}} />
```

### Issue Form (Protected)

```javascript
import IssueForm from './components/IssueForm';
import { useAuth } from './context/AuthContext';

function MyPage() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div>Please login to create issues</div>;
  }

  return <IssueForm onIssueAdded={() => {
    console.log('Issue created!');
    // Refresh issue list
  }} />;
}
```

### Issue List with Auth

```javascript
import IssueListWithAuth from './components/IssueListWithAuth';

<IssueListWithAuth 
  refresh={refreshCounter} 
  onRefreshComplete={() => console.log('Issues loaded')}
/>
```

## 🔐 AuthContext API

### Properties
- `user` - Current user object (`{ id, email, full_name, role }`)
- `loading` - Initial auth loading state
- `isAuthenticated` - Boolean if user is logged in
- `isAdmin` - Boolean if user has admin role

### Methods
- `login(email, password)` - Login user
- `register(email, password, fullName)` - Register new user
- `logout()` - Logout user

### Example

```javascript
const { 
  user,           // { id: 1, email: 'user@example.com', role: 'user' }
  loading,        // false
  isAuthenticated,// true
  isAdmin,        // false
  login,          // async function
  logout          // async function
} = useAuth();
```

## 🎯 Common Patterns

### Protected Component

```javascript
import { useAuth } from './context/AuthContext';
import { Navigate } from 'react-router-dom';

function ProtectedPage() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return <div>Protected content</div>;
}
```

### Admin-Only Component

```javascript
function AdminPanel() {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return <div>Access denied. Admin only.</div>;
  }

  return <div>Admin panel</div>;
}
```

### Conditional Rendering

```javascript
function IssueItem({ issue }) {
  const { user, isAdmin } = useAuth();
  const canEdit = user?.id === issue.user_id || isAdmin;

  return (
    <div>
      <p>{issue.issue_text}</p>
      {canEdit && (
        <button>Edit</button>
      )}
    </div>
  );
}
```

## 🔄 Token Management

Tokens are automatically managed by `src/utils/api.js`:

- Access tokens stored in `localStorage` (15 min expiry)
- Refresh tokens stored in `localStorage` (7 days expiry)
- Auto-refresh on 401 errors
- Auto-redirect to login on refresh failure

### Manual Token Access (if needed)

```javascript
import { tokenManager } from './utils/api';

// Get tokens
const accessToken = tokenManager.getAccessToken();
const refreshToken = tokenManager.getRefreshToken();

// Clear tokens (logout)
tokenManager.clearTokens();

// Get user
const user = tokenManager.getUser();
```

## 🧪 Testing the Frontend

### 1. Start the backend
```bash
cd server
npm start
```

### 2. Start the frontend
```bash
cd client
npm run dev
```

### 3. Test the flow

1. Open `http://localhost:5173`
2. **Register** a new account
3. **Login** with your credentials
4. **Create** an issue
5. **Edit** your own issue (should work)
6. **Delete** your own issue (should work)
7. Try to edit another user's issue (should fail unless admin)

### 4. Test admin features

1. Register another user with role 'admin' (via backend API)
2. Login as admin
3. You should see "Admin" badge
4. You can edit/delete ANY issue

## 🎨 Styling

All components use Tailwind CSS. Make sure you have Tailwind configured in your project:

```bash
# If not installed
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

## 🐛 Troubleshooting

### "Cannot read property 'user' of undefined"
- Make sure your component is wrapped in `<AuthProvider>`

### "401 Unauthorized" errors
- Token may be expired
- Try logging out and logging in again
- Check if backend is running

### CORS errors
- Ensure `ALLOWED_ORIGIN=http://localhost:5173` in `server/.env`
- Restart the backend server

### "useAuth must be used within an AuthProvider"
- Wrap your app with `<AuthProvider>` in `main.jsx` or `App.jsx`

## 📚 File Structure Summary

```
client/src/
├── components/
│   ├── Login.jsx                    # ✅ Login form
│   ├── Register.jsx                 # ✅ Registration form
│   ├── IssueForm.jsx               # ✅ Updated with auth
│   ├── IssueList.jsx               # Original (no auth)
│   └── IssueListWithAuth.jsx       # ✅ With edit/delete
├── context/
│   └── AuthContext.jsx             # ✅ Auth state management
├── utils/
│   └── api.js                      # ✅ API wrapper
├── AppWithAuth.jsx                 # ✅ Complete example
├── App.jsx                         # Original
└── main.jsx                        # Entry point
```

## 🚀 Next Steps

1. **Use AppWithAuth.jsx** - Easiest way to get started
2. **Customize styling** - Modify Tailwind classes to match your design
3. **Add routing** - Integrate with React Router for separate pages
4. **Add notifications** - Use a toast library for better UX
5. **Add loading states** - Improve loading indicators
6. **Add form validation** - Client-side validation before API calls
7. **Add error boundaries** - Handle React errors gracefully

## ✨ Features Included

- ✅ Secure login/register
- ✅ JWT token management
- ✅ Automatic token refresh
- ✅ Protected routes
- ✅ Role-based UI
- ✅ Edit/Delete with ownership checks
- ✅ Admin override capabilities
- ✅ Beautiful Tailwind UI
- ✅ Responsive design
- ✅ Error handling
- ✅ Loading states

Your authentication system is now fully integrated and ready to use! 🎉

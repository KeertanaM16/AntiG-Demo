# Authentication System Documentation

## Overview
This application now includes a complete JWT-based authentication system with user registration, login, logout, and role-based access control.

## Folder Structure

```
server/
├── controllers/
│   ├── authController.js       # Authentication logic (register, login, logout, refresh)
│   └── issueController.js      # Issue CRUD with ownership checks
├── middleware/
│   └── auth.js                 # JWT verification and role-based middleware
├── routes/
│   ├── authRoutes.js          # Authentication endpoints
│   └── issueRoutes.js         # Issue endpoints (protected)
├── db/
│   └── index.js               # Database with users, refresh_tokens, issue_logs tables
├── .env                       # Environment variables (JWT secrets, DB config)
└── index.js                   # Main server file

```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Refresh Tokens Table
```sql
CREATE TABLE refresh_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Issue Logs Table (Updated)
```sql
CREATE TABLE issue_logs (
  id SERIAL PRIMARY KEY,
  issue_text TEXT NOT NULL,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Routes

### Authentication Routes (`/api/auth`)

#### 1. Register
- **POST** `/api/auth/register`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "full_name": "John Doe",
    "role": "user"  // optional, defaults to "user"
  }
  ```
- **Response:**
  ```json
  {
    "message": "User registered successfully!",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "user",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

#### 2. Login
- **POST** `/api/auth/login`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Login successful!",
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "user"
    }
  }
  ```
- **Cookies Set:** `accessToken` (15 min), `refreshToken` (7 days)

#### 3. Refresh Token
- **POST** `/api/auth/refresh`
- **Body (optional):**
  ```json
  {
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
  ```
- **Or Cookie:** `refreshToken`
- **Response:**
  ```json
  {
    "message": "Token refreshed successfully!",
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
  ```

#### 4. Logout (Protected)
- **POST** `/api/auth/logout`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Response:**
  ```json
  {
    "message": "Logout successful!"
  }
  ```

#### 5. Get Profile (Protected)
- **GET** `/api/auth/profile`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Response:**
  ```json
  {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "user",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

### Issue Routes (`/api`)

#### 1. Get All Issues (Public)
- **GET** `/api/issues`
- **Response:**
  ```json
  [
    {
      "id": 1,
      "issue_text": "Sample issue",
      "created_at": "2024-01-01T00:00:00.000Z",
      "user_id": 1,
      "user_email": "user@example.com",
      "user_name": "John Doe"
    }
  ]
  ```

#### 2. Create Issue (Protected)
- **POST** `/api/issues`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Body:**
  ```json
  {
    "issue_text": "New issue description"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Issue submitted successfully!",
    "issue": {
      "id": 1,
      "issue_text": "New issue description",
      "user_id": 1,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

#### 3. Update Issue (Protected - Owner or Admin Only)
- **PUT** `/api/issues/:id`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Body:**
  ```json
  {
    "issue_text": "Updated issue description"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Issue updated successfully!",
    "issue": {
      "id": 1,
      "issue_text": "Updated issue description",
      "user_id": 1,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

#### 4. Delete Issue (Protected - Owner or Admin Only)
- **DELETE** `/api/issues/:id`
- **Headers:** `Authorization: Bearer <accessToken>`
- **Response:**
  ```json
  {
    "message": "Issue deleted successfully!"
  }
  ```

## Middleware

### `verifyToken`
Verifies JWT access token from:
1. Authorization header: `Bearer <token>`
2. Cookie: `accessToken`

Attaches `req.user` with:
```javascript
{
  userId: 1,
  email: "user@example.com",
  role: "user"
}
```

### `isAdmin`
Checks if `req.user.role === 'admin'`. Must be used after `verifyToken`.

### `verifyRefreshToken`
Verifies refresh token for token renewal.

## Security Features

1. **Password Hashing:** bcrypt with salt rounds = 10
2. **JWT Tokens:**
   - Access Token: 15 minutes expiry
   - Refresh Token: 7 days expiry
3. **HTTP-Only Cookies:** Prevents XSS attacks
4. **Role-Based Access Control:** Admin vs User roles
5. **Ownership Verification:** Users can only edit/delete their own issues
6. **CORS Configuration:** Configurable allowed origins

## Environment Variables

```bash
# Server
PORT=5000
NODE_ENV=development
ALLOWED_ORIGIN=http://localhost:5173

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# Database
DB_USER=your_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_db
```

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","full_name":"Test User"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt
```

### Create Issue (with token)
```bash
curl -X POST http://localhost:5000/api/issues \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"issue_text":"Test issue"}'
```

### Update Issue
```bash
curl -X PUT http://localhost:5000/api/issues/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"issue_text":"Updated issue"}'
```

### Delete Issue
```bash
curl -X DELETE http://localhost:5000/api/issues/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Frontend Integration Notes

1. **Store tokens:** Save `accessToken` and `refreshToken` in localStorage or use cookies
2. **Add to requests:** Include `Authorization: Bearer <token>` header
3. **Handle 401 errors:** Refresh token when access token expires
4. **Logout:** Clear tokens and call logout endpoint
5. **Protected routes:** Check authentication before rendering protected pages

## Role-Based Features

### User Role
- Can create issues
- Can edit/delete own issues
- Can view all issues

### Admin Role
- All user permissions
- Can edit/delete ANY issue
- Future: Can manage users, view analytics, etc.

## Next Steps for Production

1. **Add HTTPS:** Use SSL certificates
2. **Rate Limiting:** Prevent brute force attacks
3. **Email Verification:** Verify user emails on registration
4. **Password Reset:** Implement forgot password flow
5. **Token Blacklisting:** Invalidate tokens on logout
6. **Audit Logging:** Track user actions
7. **Input Sanitization:** Prevent SQL injection and XSS
8. **Strong JWT Secrets:** Use cryptographically secure random strings

# 🐛 Simple Bug in Login Route

## Bug Description

**Location**: `server/controllers/authController.js` - Line 100

**Bug Type**: Variable name typo (ReferenceError)

**Code with Bug**:
```javascript
// Line 100: BUG - Typo 'userr' instead of 'user'
const isValidPassword = await bcrypt.compare(password, userr.password);
```

**Should be**:
```javascript
const isValidPassword = await bcrypt.compare(password, user.password);
```

---

## Error Details

### What Happens:
1. User tries to login with valid credentials
2. Code finds user in database successfully
3. Code tries to verify password
4. **BUG**: References `userr.password` instead of `user.password`
5. JavaScript throws: `ReferenceError: userr is not defined`
6. Error is caught by catch block
7. Returns: `500 Internal Server Error`

### Error Message:
```
ReferenceError: userr is not defined
```

### Console Output:
```
Error logging in: ReferenceError: userr is not defined
    at login (authController.js:100:60)
```

---

## Try-Catch Flow

### TRY Block:
```javascript
try {
  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];
  
  // ❌ ERROR HAPPENS HERE
  const isValidPassword = await bcrypt.compare(password, userr.password);
  // userr is not defined! Should be 'user'
  
} catch (err) {
  // ✅ ERROR CAUGHT HERE
  console.error('Error logging in:', err);
  res.status(500).json({ error: 'Internal Server Error' });
}
```

---

## How to Reproduce

1. Start the servers
2. Try to login with ANY valid user credentials
3. **Every login attempt will fail** with this bug

### Test:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Expected Response**:
```json
{
  "error": "Internal Server Error"
}
```

**Server Console**:
```
Error logging in: ReferenceError: userr is not defined
```

---

## What Jules Should Find

### Investigation Steps:
1. **Notice**: Login always fails for valid credentials
2. **Check console**: See `ReferenceError: userr is not defined`
3. **Find line**: Look at line 100 in authController.js
4. **Spot typo**: `userr` instead of `user`
5. **Fix**: Change `userr.password` to `user.password`

### The Fix:
**File**: `server/controllers/authController.js`  
**Line**: 100

**Change**:
```javascript
// FROM:
const isValidPassword = await bcrypt.compare(password, userr.password);

// TO:
const isValidPassword = await bcrypt.compare(password, user.password);
```

---

## Learning Points

This demonstrates:
1. **Try-catch properly catches errors** - Even simple typos are caught
2. **Error propagation** - Error in try block → caught in catch block
3. **Generic error messages** - User sees "Internal Server Error" (not helpful!)
4. **Console logging importance** - Actual error is only in server console
5. **Variable typos** - Common mistake, easy to miss

---

## Impact

- ❌ **All login attempts fail** (100% failure rate)
- ❌ Users cannot login
- ❌ Error message is not helpful to users
- ✅ Error is caught and handled (doesn't crash server)
- ✅ Logged to console for debugging

---

## To Fix

Simply correct the typo on line 100:
- Change `userr` to `user`
- Save file
- Server will auto-reload (nodemon)
- Test login again - should work!

---

**This is a simple, realistic bug showing try-catch error handling in action!** 🎯

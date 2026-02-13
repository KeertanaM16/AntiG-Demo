# 🔥 Simulated Production Instability - Login Route

## Overview
The login route has been modified to randomly throw errors **30% of the time** to simulate real-world production instability and test error handling capabilities.

## ⚠️ IMPORTANT
**These are INTENTIONAL BUGS with realistic try/catch mistakes. DO NOT FIX THEM.**

All simulated failures are marked with:
```javascript
// SIMULATED FAILURE
```

---

## 🎲 Failure Scenarios (30% Total Failure Rate)

### 1️⃣ Database Connection Failure (7.5% chance)
**Location**: Line ~83 in `authController.js`

**Simulated Issue:**
```javascript
// SIMULATED FAILURE #1: Database connection failure (7.5% chance)
if (failureChance < 0.075) {
  console.log('🔥 SIMULATED FAILURE: Database connection timeout');
  // Realistic mistake: Trying to access property before checking if query succeeded
  const result = null;
  const user = result.rows[0]; // ❌ This will crash - accessing rows of null
  return res.status(500).json({ error: 'Database error' });
}
```

**Error Type:** `TypeError: Cannot read property 'rows' of null`

**Realistic Mistake:**
- Trying to access `result.rows[0]` when result is null
- Common mistake when database query fails but developer assumes it always succeeds
- No null check before property access

**What Jules Should Find:**
- Missing null/undefined check
- Need to validate database response before accessing properties
- Should check `if (result && result.rows)` before accessing

---

### 2️⃣ Password Verification Crash (7.5% chance)
**Location**: Line ~96 in `authController.js`

**Simulated Issue:**
```javascript
// SIMULATED FAILURE #2: Password verification crashes (7.5% chance)
if (failureChance >= 0.075 && failureChance < 0.15) {
  console.log('🔥 SIMULATED FAILURE: Password verification crash');
  // Realistic mistake: Calling method on undefined
  const isValidPassword = await bcrypt.compare(password, undefined.password); // ❌ Crashes
}
```

**Error Type:** `TypeError: Cannot read property 'password' of undefined`

**Realistic Mistake:**
- Passing `undefined.password` to bcrypt.compare
- Happens when user object is unexpectedly undefined/null
- Common when assuming database always returns a user

**What Jules Should Find:**
- Need to check if `user` object exists before accessing `user.password`
- Should validate user object is defined
- Missing defensive coding practices

---

### 3️⃣ Token Generation Failure (7.5% chance)
**Location**: Line ~109 in `authController.js`

**Simulated Issue:**
```javascript
// SIMULATED FAILURE #3: Token generation failure (7.5% chance)
if (failureChance >= 0.15 && failureChance < 0.225) {
  console.log('🔥 SIMULATED FAILURE: Token generation with null secret');
  // Realistic mistake: JWT sign with null/undefined secret
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    null, // ❌ This will throw an error
    { expiresIn: '15m' }
  );
}
```

**Error Type:** `Error: secretOrPrivateKey must have a value`

**Realistic Mistake:**
- JWT secret is null/undefined
- Happens when environment variable is not loaded
- Common configuration mistake in production

**What Jules Should Find:**
- Need to validate JWT_SECRET exists before using it
- Should check environment variables at startup
- Add `if (!JWT_SECRET) throw new Error('JWT_SECRET not configured')`

---

### 4️⃣ Async Promise Rejection Unhandled (7.5% chance)
**Location**: Line ~122 in `authController.js`

**Simulated Issue:**
```javascript
// SIMULATED FAILURE #4: Async crash during token storage (7.5% chance)
if (failureChance >= 0.225 && failureChance < 0.3) {
  console.log('🔥 SIMULATED FAILURE: Async promise rejection unhandled');
  // Realistic mistake: Async operation without await - promise rejection not caught
  const crashPromise = new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error('Database write timeout')), 100);
  });
  crashPromise; // ❌ Promise rejection not handled - will crash
}
```

**Error Type:** `UnhandledPromiseRejectionWarning: Error: Database write timeout`

**Realistic Mistake:**
- Creating async promise without `await` or `.catch()`
- Promise rejection not caught by try-catch
- Common mistake: "fire and forget" async operations

**What Jules Should Find:**
- Need to `await crashPromise` or add `.catch()`
- All promises should be handled
- Use `await` for async operations or explicitly handle with `.catch()`

---

### 5️⃣ Catch Block Mistake (Always Present)
**Location**: Line ~177 in `authController.js`

**Simulated Issue:**
```javascript
} catch (err) {
  console.error('Error logging in:', err);
  // REALISTIC MISTAKE: Catch block doesn't check if response was already sent
  // This can cause "Cannot set headers after they are sent" error
  res.status(500).json({ error: 'Internal Server Error' });
}
```

**Error Type:** `Error: Cannot set headers after they are sent to the client`

**Realistic Mistake:**
- Catch block always tries to send response
- Some error paths already sent response with `return res.status(...)`
- Double response sending causes crash

**What Jules Should Find:**
- Need to check `if (res.headersSent) return;` before sending response in catch
- Some code paths already returned a response
- Catch block assumes it's always the first to respond

---

## 📊 Failure Distribution

| Failure Type | Probability | Expected Frequency |
|--------------|-------------|-------------------|
| Database Failure | 7.5% | ~1 in 13 logins |
| Password Crash | 7.5% | ~1 in 13 logins |
| Token Generation Error | 7.5% | ~1 in 13 logins |
| Async Unhandled Rejection | 7.5% | ~1 in 13 logins |
| **Total Failure Rate** | **30%** | **~1 in 3 logins** |

---

## 🧪 How to Test

### Run Multiple Login Attempts
```bash
# In a loop - you'll see failures every 3-4 attempts on average
for i in {1..10}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"password123"}'
  echo "\n---"
done
```

### Watch Server Logs
You'll see error messages like:
```
🔥 SIMULATED FAILURE: Database connection timeout
🔥 SIMULATED FAILURE: Password verification crash
🔥 SIMULATED FAILURE: Token generation with null secret
🔥 SIMULATED FAILURE: Async promise rejection unhandled
```

---

## 🎯 Learning Objectives

This scenario demonstrates:

1. **Defensive Programming** - Always check for null/undefined
2. **Async Error Handling** - Properly await/catch all promises
3. **Configuration Validation** - Verify environment variables exist
4. **Response State Management** - Check if response already sent
5. **Production Debugging** - How to identify and fix random errors
6. **Try-Catch Pitfalls** - Common mistakes in error handling

---

## 🔧 What Jules Should Do

### Investigation Steps:
1. **Notice the random failures** - Login works sometimes, fails others
2. **Check server logs** - See the "SIMULATED FAILURE" messages
3. **Identify each bug** - Read the code comments marked with ❌
4. **Understand the mistakes** - Why each one is a realistic error
5. **Propose fixes** - How to prevent each type of error

### Expected Fixes:
1. Add null checks before accessing properties
2. Validate user object exists
3. Validate environment variables at startup
4. Await all async operations or add .catch()
5. Check `res.headersSent` in catch block

---

## 🎨 Frontend Impact

Users will experience:
- ❌ Random login failures
- ❌ "Internal Server Error" messages
- ❌ Inconsistent behavior (works sometimes, fails other times)
- ❌ No clear error messages (generic "Internal Server Error")

**This mimics real production issues where errors are intermittent and hard to reproduce!**

---

## 📝 Notes

- All failures are **random** - cannot be predicted
- Each login has exactly **30% chance of failure**
- Failures are **independent** - each attempt is a new roll of the dice
- Server logs show which failure occurred
- **DO NOT FIX THESE BUGS** - They are for testing/learning purposes

---

## 🚨 To Disable Failures

If you need to test without failures, comment out the entire failure simulation section:
```javascript
// Comment out lines 77-132 in authController.js
// const failureChance = Math.random();
// ... all the SIMULATED FAILURE blocks
```

**But the goal is to FIND and UNDERSTAND the bugs, not disable them!**

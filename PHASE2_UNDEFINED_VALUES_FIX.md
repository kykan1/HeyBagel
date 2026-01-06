# Phase 2: Undefined Values Fix

## Issue: UNDEFINED_VALUE Error During OAuth

**Error in Terminal:**
```
[auth][error] AdapterError
[auth][cause]: Error: UNDEFINED_VALUE: Undefined values are not allowed
    at linkAccount (webpack-internal:///(rsc)/./lib/auth/config.ts:62:18)
```

**When It Occurred:**
- User clicks "Get Started"
- Redirected to Google OAuth
- User selects Google account
- Google shows permissions screen (access to email, profile, etc.)
- User clicks "Allow"
- **Error:** Auth callback fails with Configuration error
- User redirected to `/auth/error?error=Configuration`

---

## Root Cause

The `postgres` library is strict about data types and **does not allow `undefined` values**. When Google OAuth returns the authorization data, some fields are optional and may be `undefined`:

**Fields that can be undefined:**
- `refresh_token` - Only provided on first authorization
- `expires_at` - Not always provided by OAuth providers
- `token_type` - Sometimes undefined
- `scope` - Can be undefined
- `id_token` - Not always present
- `name` - User might not have a name set
- `image` - User might not have a profile picture

When the adapter tries to insert these undefined values into the database, `postgres` throws an error.

---

## Fix Applied

Updated three adapter methods in `lib/auth/config.ts` to handle undefined values by converting them to `null` using the nullish coalescing operator (`?? null`):

### 1. `createUser` - Fixed undefined name, image, emailVerified

**Before:**
```typescript
await sql`
  INSERT INTO users (id, email, name, image, email_verified)
  VALUES (${id}, ${user.email}, ${user.name}, ${user.image}, ${user.emailVerified ? new Date() : null})
`;
```

**After:**
```typescript
await sql`
  INSERT INTO users (id, email, name, image, email_verified)
  VALUES (
    ${id}, 
    ${user.email}, 
    ${user.name ?? null}, 
    ${user.image ?? null}, 
    ${user.emailVerified ? new Date(user.emailVerified) : null}
  )
`;
```

**Changes:**
- `${user.name}` → `${user.name ?? null}`
- `${user.image}` → `${user.image ?? null}`
- Added proper date conversion for `emailVerified`

---

### 2. `updateUser` - Fixed undefined name, image, emailVerified

**Before:**
```typescript
await sql`
  UPDATE users
  SET email = ${user.email}, name = ${user.name}, image = ${user.image}, 
      email_verified = ${user.emailVerified}, updated_at = NOW()
  WHERE id = ${user.id}
`;
```

**After:**
```typescript
await sql`
  UPDATE users
  SET 
    email = ${user.email}, 
    name = ${user.name ?? null}, 
    image = ${user.image ?? null}, 
    email_verified = ${user.emailVerified ? new Date(user.emailVerified) : null}, 
    updated_at = NOW()
  WHERE id = ${user.id}
`;
```

**Changes:**
- `${user.name}` → `${user.name ?? null}`
- `${user.image}` → `${user.image ?? null}`
- `${user.emailVerified}` → `${user.emailVerified ? new Date(user.emailVerified) : null}`

---

### 3. `linkAccount` - Fixed undefined OAuth tokens (CRITICAL FIX)

**Before:**
```typescript
await sql`
  INSERT INTO accounts (
    id, user_id, type, provider, provider_account_id,
    refresh_token, access_token, expires_at, token_type, scope, id_token
  ) VALUES (
    ${id}, ${account.userId}, ${account.type}, ${account.provider},
    ${account.providerAccountId}, ${account.refresh_token}, ${account.access_token},
    ${account.expires_at}, ${account.token_type}, ${account.scope}, ${account.id_token}
  )
`;
```

**After:**
```typescript
await sql`
  INSERT INTO accounts (
    id, user_id, type, provider, provider_account_id,
    refresh_token, access_token, expires_at, token_type, scope, id_token
  ) VALUES (
    ${id}, 
    ${account.userId}, 
    ${account.type}, 
    ${account.provider},
    ${account.providerAccountId}, 
    ${account.refresh_token ?? null}, 
    ${account.access_token ?? null},
    ${account.expires_at ?? null}, 
    ${account.token_type ?? null}, 
    ${account.scope ?? null}, 
    ${account.id_token ?? null}
  )
`;
```

**Changes (all OAuth-related fields):**
- `${account.refresh_token}` → `${account.refresh_token ?? null}`
- `${account.access_token}` → `${account.access_token ?? null}`
- `${account.expires_at}` → `${account.expires_at ?? null}`
- `${account.token_type}` → `${account.token_type ?? null}`
- `${account.scope}` → `${account.scope ?? null}`
- `${account.id_token}` → `${account.id_token ?? null}`

**This was the main fix** - Google OAuth doesn't always provide all these fields, especially `refresh_token`.

---

## How the Fix Works

### The Nullish Coalescing Operator (`??`)

```typescript
// If value is undefined or null, use null
${value ?? null}

// Examples:
"hello" ?? null     // → "hello"
undefined ?? null   // → null
null ?? null        // → null
0 ?? null          // → 0 (not null, because 0 is a valid value)
"" ?? null         // → "" (empty string is valid)
```

### Why This Works with Postgres

- **Undefined:** Not a valid SQL value → causes error
- **Null:** Valid SQL NULL value → accepted by database
- Database schema allows NULL for these columns (they're optional)

---

## OAuth Flow After Fix

1. User clicks "Get Started"
2. Redirected to Google OAuth
3. User selects account
4. Google shows permissions screen
5. User clicks "Allow"
6. Google redirects to: `/api/auth/callback/google?code=...`
7. **Auth.js exchanges code for tokens** (some may be undefined)
8. Calls `getUserByAccount()` - checks if user exists
9. If new user:
   - Calls `createUser()` with `name ?? null`, `image ?? null` ✅
   - Calls `linkAccount()` with all OAuth fields converted to null ✅
10. Calls `createSession()` - creates session
11. **Success!** Redirects to home page
12. User is logged in

---

## Testing the Fix

### Test 1: First-Time Sign In (New User)

1. **Clear existing data** (if needed):
   - Go to Neon Console → SQL Editor
   - Run: `DELETE FROM accounts; DELETE FROM sessions; DELETE FROM users;`

2. **Sign in:**
   - Visit `http://localhost:3000`
   - Click "Get Started"
   - Click "Continue with Google"
   - Select your Google account
   - Click "Allow" on permissions screen
   - **Should redirect to home page** ✅
   - **No error page** ✅

3. **Verify in database:**
   ```sql
   -- Check user was created
   SELECT * FROM users;
   -- Should see: id, email, name, image (some may be null)
   
   -- Check account was linked
   SELECT * FROM accounts;
   -- Should see: OAuth provider data (some fields will be null)
   
   -- Check session exists
   SELECT * FROM sessions;
   -- Should see: active session with future expires date
   ```

### Test 2: Return User Sign In

1. Sign out (click Sign Out button)
2. Visit home page
3. Click "Get Started"
4. Click "Continue with Google"
5. Select same Google account
6. **Should skip permissions screen** (already granted)
7. **Should redirect to home page immediately** ✅

### Test 3: Different Google Account

1. Sign out
2. Click "Get Started"
3. Use **different Google account**
4. Click "Allow"
5. **Should create new user** ✅
6. Should see empty entries list (new user's data)
7. Sign out and sign in with first account
8. **Should see first user's entries** (data isolation working)

---

## Expected Database State

### After Successful Sign In

**users table:**
```
id          | email                | name        | image                      | email_verified
------------|---------------------|-------------|----------------------------|---------------
abc-123-... | you@gmail.com       | Your Name   | https://lh3.google.../... | 2026-01-04...
```

**accounts table:**
```
id     | user_id   | provider | provider_account_id | access_token | refresh_token | scope
-------|-----------|----------|--------------------|--------------|--------------|---------
xyz... | abc-123...| google   | 1234567890         | ya29.a0...   | NULL         | email...
```

Note: `refresh_token` will likely be NULL - this is normal for Google OAuth.

**sessions table:**
```
id     | session_token          | user_id    | expires
-------|------------------------|------------|------------------
qrs... | abc123...              | abc-123... | 2026-02-04...
```

---

## Common Questions

### Q: Why is refresh_token NULL?

**A:** Google only provides a refresh token on the **first authorization**. On subsequent sign-ins, it's undefined/null. This is normal OAuth behavior.

### Q: Will the app work without refresh_token?

**A:** Yes! For session-based auth (what we're using), you don't need refresh tokens. The session in the database tracks the login state.

### Q: What if access_token is also NULL?

**A:** Some OAuth providers don't return access tokens in the callback. Auth.js handles this internally. As long as the user and session are created, auth works fine.

### Q: Should I manually set these to non-null values?

**A:** No. Let Auth.js and the OAuth provider determine what values to send. The `?? null` operator ensures safety regardless of what's provided.

---

## Troubleshooting

### Still getting UNDEFINED_VALUE error

**Check:**
1. Restart dev server (`Ctrl+C`, then `npm run dev`)
2. Clear Next.js cache: `rm -rf .next` (or `rmdir /s .next` on Windows)
3. Verify all three methods were updated in `lib/auth/config.ts`
4. Check terminal logs for which method is throwing the error

### Getting different error after fix

**Check terminal logs and share:**
- The exact error message
- The line number in `lib/auth/config.ts`
- Any additional context from the error stack

### User created but no session

**Possible causes:**
1. Session expiry is in the past (clock sync issue)
2. Database connection issue during session creation
3. Check `sessions` table for records

---

## Success Criteria

Phase 2 Auth is NOW complete when:

- ✅ Dependencies installed
- ✅ Database schema with Auth.js tables
- ✅ Custom adapter with null-safe value handling
- ✅ Sign-in page functional
- ✅ Middleware protecting routes
- ✅ Navigation hidden when logged out
- ✅ UserMenu visible when logged in
- ✅ All Server Actions using `requireAuth()`
- ✅ **OAuth callback completes without UNDEFINED_VALUE error**
- ✅ **User can click "Allow" and sign in successfully**
- ✅ **Sessions persist across refreshes**
- ✅ **Data isolation between users**

---

## What's Next

If this fix resolves the OAuth error:

1. **Test thoroughly** (see Testing section above)
2. **Test with multiple Google accounts** (verify data isolation)
3. **Create some journal entries**
4. **Test AI analysis**
5. **If everything works:** Phase 2 is complete! 🎉
6. **Ready for:** Phase 3 (Vercel deployment)

---

**Fix applied by:** AI Assistant  
**Date:** January 4, 2026  
**Fix type:** Null safety for OAuth adapter  
**Estimated test time:** 2-3 minutes


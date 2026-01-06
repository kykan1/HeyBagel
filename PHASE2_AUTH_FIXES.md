# Phase 2: Auth Fixes - Black Screen & Landing Page

## Issues Identified

### Issue 1: Black Screen After Google OAuth ❌

**Problem:**
- After completing Google 2FA, screen went black
- Terminal showed: `GET /api/auth/callback/google ... 405 in 2437ms`
- 405 = Method Not Allowed (route not working)

**Root Cause:**
Auth API route was incorrectly importing handlers from Auth.js v5. The route file tried to export `GET` and `POST` directly, but they're nested inside the `handlers` object.

**Terminal Error:**
```
⚠ export 'GET' (reexported as 'GET') was not found in '@/lib/auth/config'
⚠ export 'POST' (reexported as 'POST') was not found in '@/lib/auth/config'
```

---

### Issue 2: Confusing Landing Page Flow 🤔

**Problem:**
- Home page (`/`) showed "old landing page" 
- Still using hardcoded `userId = "default_user"`
- Only prompted for login when clicking "New Entry" button
- No explanation of what the app does before requiring sign-in

**Root Cause:**
Home page wasn't updated with auth integration - it was trying to load entries for "default_user" instead of checking session.

---

## Fixes Applied ✅

### Fix 1: Auth API Route (Critical)

**File:** `app/api/auth/[...nextauth]/route.ts`

**Before:**
```typescript
export { GET, POST } from "@/lib/auth/config";
```

**After:**
```typescript
import { handlers } from "@/lib/auth/config";
export const { GET, POST } = handlers;
```

**Why This Works:**
Auth.js v5 exports handlers in a named object. We need to destructure `GET` and `POST` from `handlers` instead of trying to import them directly.

---

### Fix 2: Landing Page with Auth Check

**File:** `app/page.tsx`

**Changes:**
1. ✅ Import `auth` from auth config
2. ✅ Check session at start of component
3. ✅ Show landing page for unauthenticated users
4. ✅ Show entries list for authenticated users
5. ✅ Use `session.user.id` instead of `"default_user"`

**New Landing Page Features:**
- Hero section with app name and tagline
- "Get Started" button that links to `/auth/signin`
- Three feature highlights (AI Insights, Privacy, Mood Tracking)
- Clean, welcoming design matching Hey Bagel aesthetic

**User Flow Now:**
```
Visitor → Landing Page → "Get Started" → Sign In with Google → 
  OAuth → 2FA → Callback → Home Page (with entries)
```

---

## How to Test

### 1. Restart Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

### 2. Test Landing Page

1. Open browser in incognito mode
2. Visit: `http://localhost:3000`
3. **Should see:** Landing page with "Hey Bagel 🥯" hero section
4. Click "Get Started" button
5. **Should redirect to:** `/auth/signin` page

### 3. Test Sign-In Flow (Full End-to-End)

1. On sign-in page, click "Continue with Google"
2. Select your Google account
3. Complete 2FA on your phone (if prompted)
4. **Should redirect to:** Home page with your entries
5. **Screen should NOT go black** ✅

### 4. Test Authenticated Home Page

1. After signing in, you should see:
   - Header with UserMenu (your name/email + Sign Out button)
   - "Your Journal" heading
   - List of your entries (or empty state if no entries)

### 5. Test Navigation While Authenticated

1. Click "New Entry" - should work without redirect
2. Click "Insights" - should work without redirect
3. Create a test entry - should save successfully
4. Click "Sign Out" - should redirect to sign-in page

### 6. Test Public Access

1. Sign out
2. Visit `http://localhost:3000` directly
3. **Should see:** Landing page (not sign-in redirect)
4. Click "Get Started" to sign in again

---

## What Changed

### Files Modified (2)

1. **`app/api/auth/[...nextauth]/route.ts`**
   - Fixed handler exports for Auth.js v5
   - Prevents 405 errors on OAuth callback

2. **`app/page.tsx`**
   - Added session check
   - Shows landing page for unauthenticated users
   - Shows entries list for authenticated users
   - Uses proper `session.user.id` instead of hardcoded value

### Files Unchanged

- **`middleware.ts`** - No change needed (already allows `/` as public route)
- All other auth files remain the same

---

## Expected Behavior After Fixes

### For Unauthenticated Users:
- ✅ See landing page at `/`
- ✅ Can click "Get Started" to begin sign-in
- ✅ Redirected to `/auth/signin` for protected routes

### For Authenticated Users:
- ✅ See entries list at `/`
- ✅ Can navigate to all protected routes
- ✅ UserMenu visible in header
- ✅ All CRUD operations work with their user ID

### OAuth Flow:
- ✅ Google OAuth completes successfully
- ✅ No black screen after 2FA
- ✅ Callback redirects to home page
- ✅ Session persists across page loads

---

## Technical Details

### Why the Black Screen Happened

The OAuth callback flow:
1. User completes Google auth
2. Google redirects to: `/api/auth/callback/google?code=...`
3. Auth.js needs to handle this GET request
4. **Problem:** GET handler wasn't exported correctly
5. **Result:** 405 Method Not Allowed
6. **User sees:** Black screen (failed callback)

### Auth.js v5 Handler Export Pattern

```typescript
// In lib/auth/config.ts:
export const { handlers, auth, signIn, signOut } = NextAuth({ ... });

// handlers object contains:
// {
//   GET: [Function],
//   POST: [Function]
// }

// In app/api/auth/[...nextauth]/route.ts:
// ✅ CORRECT:
import { handlers } from "@/lib/auth/config";
export const { GET, POST } = handlers;

// ❌ WRONG:
export { GET, POST } from "@/lib/auth/config"; // These don't exist at top level!
```

---

## Success Criteria

Phase 2 is NOW complete when:

- ✅ Dependencies installed
- ✅ Database schema updated
- ✅ Auth configuration created
- ✅ Sign-in page functional
- ✅ Middleware protecting routes
- ✅ UserMenu in header
- ✅ All Server Actions using `requireAuth()`
- ✅ Environment variables configured
- ✅ **API route handlers fixed** ← New
- ✅ **Landing page with auth check** ← New
- ⏳ **Manual testing** - Ready for you to test now!

---

## Next Steps

1. **Test the fixes** (see "How to Test" section above)
2. **Verify OAuth flow completes without black screen**
3. **Test data isolation with multiple Google accounts**
4. **If all tests pass:** Phase 2 is complete! 🎉
5. **Then proceed to:** Phase 3 (Vercel deployment)

---

**Fixes applied by:** AI Assistant  
**Date:** January 4, 2026  
**Status:** Ready for testing  
**Time to test:** 5-10 minutes


# Vercel Deployment Verification Tests

## Overview

Run these 8 critical tests immediately after deploying to Vercel to ensure everything works correctly.

**Estimated time:** 15-20 minutes  
**Prerequisites:** Deployment completed, environment variables configured

---

## Pre-Test Setup

### Test User Accounts

**Prepare 2 Google accounts for testing:**

1. **User A (Primary):** Your main Google account
2. **User B (Secondary):** Different Google account (for isolation testing)

**Access methods:**
- Browser 1: Regular browser session (User A)
- Browser 2: Incognito/Private window (User B)

### Test Data Preparation

None needed - tests will create data as needed.

---

## Test Suite

### ✅ Test 1: Landing Page Loads

**Purpose:** Verify basic deployment and DNS

**Steps:**
1. Open browser to: `https://heybagel.vercel.app`
2. Wait for page to load

**Expected Results:**
- [ ] Page loads within 2 seconds
- [ ] "Hey Bagel 🥯" heading visible
- [ ] "Sign in with Google" button present
- [ ] Three feature cards visible (AI Insights, Private, Track Mood)
- [ ] No console errors (open DevTools → Console)

**If Fails:**
- Check Vercel deployment status
- Verify DNS resolution
- Check browser console for JavaScript errors

**Screenshots to capture:**
- Landing page full view

---

### ✅ Test 2: Google OAuth Sign-In

**Purpose:** Verify authentication flow and session management

**Steps:**
1. Click "Sign in with Google" button
2. Should redirect to Google OAuth consent screen
3. Select User A account
4. Click "Continue" or "Allow"
5. Should redirect back to Hey Bagel

**Expected Results:**
- [ ] Redirects to `accounts.google.com`
- [ ] OAuth consent screen shows "Hey Bagel" app name
- [ ] After authorization, redirects to `https://heybagel.vercel.app`
- [ ] Header shows user menu with email/avatar
- [ ] Home page shows "Your Journal" heading
- [ ] Empty state: "No entries yet" (if first time)
- [ ] Cookie set (check DevTools → Application → Cookies)

**Cookie verification:**
- Name: `authjs.session-token` (or similar)
- HttpOnly: ✅ Yes
- Secure: ✅ Yes
- SameSite: Lax

**If Fails:**
- **Error: "redirect_uri_mismatch"**
  - Fix: Add Vercel URL to Google Cloud Console redirect URIs
  - URL: `https://heybagel.vercel.app/api/auth/callback/google`
- **Error: "Invalid state parameter"**
  - Fix: Check `NEXTAUTH_SECRET` is set correctly
  - Fix: Clear browser cookies and try again
- **Infinite redirect loop:**
  - Fix: Check `NEXTAUTH_URL` matches deployment URL
  - Fix: Verify `DATABASE_URL` is accessible

**Screenshots to capture:**
- Google OAuth consent screen
- Successful sign-in (user menu visible)

---

### ✅ Test 3: Database Connectivity

**Purpose:** Verify Postgres connection and schema initialization

**Steps:**
1. After sign-in, observe home page
2. Check Vercel function logs (Dashboard → Logs)
3. Check Neon Console (console.neon.tech → Monitoring)

**Expected Results:**
- [ ] Home page loads without errors
- [ ] Vercel logs show: "✅ Postgres connection established"
- [ ] Vercel logs show: "✅ Database schema initialized"
- [ ] Neon dashboard shows: Active connection count increased
- [ ] No "connection timeout" errors

**Database verification:**
- Go to Neon Console → SQL Editor
- Run query:
  ```sql
  SELECT tablename FROM pg_tables WHERE schemaname = 'public';
  ```
- Expected tables: `users`, `entries`, `insights`, `accounts`

**If Fails:**
- **Error: "DATABASE_URL not set"**
  - Fix: Add `DATABASE_URL` to Vercel environment variables
- **Error: "Connection timeout"**
  - Fix: Check Neon database is not paused (auto-resumes)
  - Fix: Verify connection string includes `?sslmode=require`
- **Error: "relation does not exist"**
  - Fix: Schema initialization failed
  - Fix: Check schema.sql file exists in `lib/db/schema.sql`

**Screenshots to capture:**
- Vercel logs showing successful connection
- Neon monitoring dashboard

---

### ✅ Test 4: Create Entry (Full CRUD Test)

**Purpose:** Verify database write operations and Server Actions

**Steps:**
1. Click "New Entry" button in header
2. Should navigate to `/entries/new`
3. Fill form:
   - Content: "Testing Vercel deployment! This is my first entry."
   - Mood: Select "Positive"
   - Date: Leave as today (default)
4. Click "Create Entry" button
5. Should redirect to entry detail page

**Expected Results:**
- [ ] Form submission succeeds
- [ ] Redirects to `/entries/[id]` (unique ID in URL)
- [ ] Entry displays with correct content
- [ ] Mood badge shows "Positive" with appropriate color
- [ ] Date shows today's date
- [ ] AI status badge shows "Pending" or "Processing"
- [ ] Vercel logs show: "Entry created successfully"

**Performance:**
- Form submission: <1 second
- Database INSERT: <100ms (check logs)
- Page load after redirect: <500ms

**If Fails:**
- **Error: "Failed to create entry"**
  - Fix: Check database permissions (Neon user has INSERT privilege)
  - Fix: Check Vercel function logs for detailed error
- **Error: "Unauthorized"**
  - Fix: Session expired - sign in again
  - Fix: Check `requireAuth()` is working correctly
- **Stuck loading:**
  - Fix: Check Vercel function timeout (should be 10s default)

**Screenshots to capture:**
- New entry form (filled)
- Created entry detail page

---

### ✅ Test 5: AI Processing

**Purpose:** Verify OpenAI integration and async processing

**Steps:**
1. On entry detail page (from Test 4)
2. Note the AI status: "Pending" or "Processing"
3. Wait 5-10 seconds
4. Refresh the page (F5 or reload button)
5. Check AI results section

**Expected Results:**
- [ ] AI status changes from "Pending" → "Processing" → "Success"
- [ ] AI Summary appears (2-3 sentences)
- [ ] Sentiment badge shows (Positive/Neutral/Negative with emoji)
- [ ] Themes section shows 3-5 keywords
- [ ] Vercel logs show: "AI analysis succeeded"
- [ ] OpenAI Dashboard shows 1 API call

**Timing:**
- Total AI processing time: 3-8 seconds typical
- If >10 seconds: Possible timeout issue

**AI Result Quality Check:**
- Summary makes sense for the entry content
- Sentiment matches entry mood
- Themes are relevant keywords

**If Fails:**
- **Status stuck on "Pending":**
  - Fix: Check Vercel logs for errors
  - Fix: Manually trigger by refreshing page
  - Fix: Check `OPENAI_API_KEY` is set
- **Status shows "Failed" with error:**
  - Error: "Rate limit exceeded"
    - Fix: Wait 1 minute, try again
    - Fix: Check OpenAI rate limits in dashboard
  - Error: "Insufficient credits"
    - Fix: Add payment method in OpenAI billing
  - Error: "Invalid API key"
    - Fix: Regenerate API key in OpenAI dashboard
    - Fix: Update `OPENAI_API_KEY` in Vercel
- **AI results don't appear after 30 seconds:**
  - Fix: Check Vercel function timeout setting
  - Fix: Check OpenAI API status page

**Retry test:**
- Click "Regenerate Insights" button
- Should re-run AI analysis with new results

**Screenshots to capture:**
- Entry with AI results displayed
- Vercel logs showing AI processing

---

### ✅ Test 6: Update Entry

**Purpose:** Verify UPDATE operations and cache invalidation

**Steps:**
1. On entry detail page (from Test 5)
2. Click "Edit" button
3. Should navigate to `/entries/[id]/edit`
4. Modify content: Add " Updated from Vercel!" to the end
5. Change mood from "Positive" to "Neutral"
6. Click "Save Changes" button
7. Should redirect back to entry detail page

**Expected Results:**
- [ ] Edit form pre-fills with existing content and mood
- [ ] Form submission succeeds
- [ ] Redirects to entry detail page (`/entries/[id]`)
- [ ] Updated content displays immediately (cache invalidated)
- [ ] Mood badge shows "Neutral" instead of "Positive"
- [ ] Vercel logs show: "Entry updated successfully"

**Cache validation:**
- Go to home page (`/`)
- Entry should show updated content preview
- Cache was invalidated by `revalidatePath()`

**If Fails:**
- **Error: "Entry not found"**
  - Fix: User doesn't own this entry (shouldn't happen in test)
  - Fix: Check database user_id filtering
- **Changes don't appear:**
  - Fix: Cache not invalidated - check `revalidatePath()` calls
  - Fix: Hard refresh (Ctrl+F5) to bypass cache
- **Old content still shows:**
  - Fix: Database UPDATE failed - check logs

**Screenshots to capture:**
- Edit form (filled)
- Updated entry detail page

---

### ✅ Test 7: User Isolation (Critical Security Test)

**Purpose:** Verify data is scoped by user_id (CRITICAL!)

**Steps:**

**As User A (Browser 1 - Regular session):**
1. Ensure you're signed in as User A
2. Note the entry created in Test 4
3. Go to home page, should see 1 entry
4. Note the entry ID from URL (for verification)

**As User B (Browser 2 - Incognito):**
5. Open incognito/private window
6. Navigate to `https://heybagel.vercel.app`
7. Sign in with **different** Google account (User B)
8. Should see empty state: "No entries yet"
9. Create a test entry: "User B's private entry"
10. Go to home page, should see only User B's entry

**Cross-contamination check:**
11. Try to access User A's entry URL directly (copy from Browser 1)
    - Example: `https://heybagel.vercel.app/entries/[user-a-entry-id]`
12. Paste URL in Browser 2 (signed in as User B)

**Expected Results:**
- [ ] User B does NOT see User A's entry on home page
- [ ] User B does NOT see User A's entry count
- [ ] Direct URL access shows 404 "Entry not found" for User B
- [ ] User B's entries are completely separate
- [ ] No data leakage in any direction
- [ ] Database queries include `WHERE user_id = ${userId}` (check logs)

**Database verification (optional):**
```sql
-- In Neon SQL Editor
SELECT user_id, COUNT(*) FROM entries GROUP BY user_id;
```
Should show 2 rows (one for each user) with their entry counts.

**If Fails - CRITICAL SECURITY ISSUE:**
- **User B sees User A's entries:**
  - 🚨 STOP - Do not proceed with deployment
  - Check all database queries include `user_id` filter
  - Check `requireAuth()` returns correct user ID
  - Verify `getEntryById()` includes `AND user_id = ${userId}`
  - Review all queries in `lib/db/queries.ts`
- **Direct URL access works for other user:**
  - 🚨 CRITICAL - Authorization bypass
  - Check entry detail page calls `requireAuth()`
  - Check `getEntryById()` includes user_id filter
- **Mixed entries visible:**
  - 🚨 CRITICAL - Database query missing user_id filter
  - Review `getAllEntries()` and `getRecentEntries()`

**If any isolation issue found:** Roll back deployment immediately.

**Screenshots to capture:**
- Browser 1: User A's home page (1 entry)
- Browser 2: User B's home page (1 different entry)
- Browser 2: 404 page when accessing User A's entry URL

---

### ✅ Test 8: Generate Insight

**Purpose:** Verify batch AI processing and insights generation

**Prerequisites:**
- Have at least 3 entries created (create more if needed)
- Entries should be from last 7 days for weekly insight

**Steps:**
1. As User A, create 2 more entries if needed:
   - Entry 2: "Second day of testing. Feeling productive!"
   - Entry 3: "Third entry. This app is working well."
2. Navigate to `/insights` (click "Insights" in header)
3. Should see empty state or previous insights
4. Click "Generate Weekly Insight" button
5. Button shows loading state
6. Wait 10-20 seconds
7. Refresh page

**Expected Results:**
- [ ] Button shows loading spinner during generation
- [ ] After refresh, insight appears in "Latest Weekly Insight" section
- [ ] Insight content is a paragraph analyzing the 3 entries
- [ ] Themes section shows recurring keywords
- [ ] Sentiment trend shows trajectory (Stable/Improving/Declining)
- [ ] Vercel logs show: "Batch insight generated successfully"
- [ ] OpenAI Dashboard shows 1 API call (more expensive than entry analysis)

**Insight Quality Check:**
- Content should synthesize patterns across all 3 entries
- Should mention specific themes or topics from entries
- Sentiment trend should make sense based on moods

**Performance:**
- Insight generation: 5-15 seconds (multiple entries analyzed)
- If >20 seconds: Possible timeout issue

**If Fails:**
- **Error: "No entries found"**
  - Fix: Create at least 3 entries first
  - Fix: Check date range (weekly = last 7 days)
- **Status stuck on "Processing":**
  - Fix: Check Vercel function timeout (may need >10s for large insights)
  - Fix: Check OpenAI API rate limits
- **Insight is too generic:**
  - Expected: Batch insights use GPT-4 (more capable model)
  - Fix: Verify `batch-insights.ts` uses correct model
- **Error: "Rate limit exceeded":**
  - Fix: OpenAI rate limit hit - wait 1 minute
  - Fix: Check OpenAI tier limits (free tier has low limits)

**Monthly insight test (optional):**
- Click "Generate Monthly Insight"
- Should analyze last 30 days of entries
- Takes longer (15-30 seconds for many entries)

**Screenshots to capture:**
- Insights page with generated weekly insight
- Vercel logs showing batch processing

---

## Post-Test Verification

### Check Vercel Function Logs

**Access:** Vercel Dashboard → Project → Logs

**Look for these log entries:**
- ✅ "Postgres connection established"
- ✅ "Database schema initialized"
- ✅ "Entry created successfully"
- ✅ "AI analysis succeeded"
- ✅ "Entry updated successfully"
- ✅ "Batch insight generated successfully"

**Filter by:**
- Status: 200 (success), 500 (error)
- Duration: Should mostly be <500ms except AI calls

### Check Neon Dashboard

**Access:** https://console.neon.tech → Your Project → Monitoring

**Metrics to verify:**
- Active connections: 2-5 during testing
- Query count: Increased during tests
- Compute time: A few seconds total
- No errors or warnings

### Check OpenAI Usage

**Access:** https://platform.openai.com/usage

**Metrics to verify:**
- Total requests: 4-5 (1 per entry + 1 insight)
- Cost: ~$0.10 total for testing
- Success rate: 100%

### Browser DevTools Check

**Open DevTools (F12) → Network tab:**
- All requests show 200 status
- No failed requests (red)
- Auth headers present on API calls
- Response times reasonable (<1s)

---

## Test Results Summary

Use this checklist to track test completion:

| Test | Status | Notes |
|------|--------|-------|
| 1. Landing Page Loads | ⬜ Pass / ⬜ Fail | |
| 2. Google OAuth Sign-In | ⬜ Pass / ⬜ Fail | |
| 3. Database Connectivity | ⬜ Pass / ⬜ Fail | |
| 4. Create Entry | ⬜ Pass / ⬜ Fail | |
| 5. AI Processing | ⬜ Pass / ⬜ Fail | |
| 6. Update Entry | ⬜ Pass / ⬜ Fail | |
| 7. User Isolation | ⬜ Pass / ⬜ Fail | |
| 8. Generate Insight | ⬜ Pass / ⬜ Fail | |

**Overall Status:** ⬜ All Pass / ⬜ Some Failed

---

## Additional Tests (Optional)

### Bonus Test 1: Delete Entry

**Steps:**
1. On any entry detail page
2. Click "Delete" button
3. Confirm deletion
4. Should redirect to home page

**Expected:**
- Entry removed from home page
- Database DELETE executed
- Cache invalidated

### Bonus Test 2: Sign Out

**Steps:**
1. Click user menu in header
2. Click "Sign Out"
3. Should redirect to landing page

**Expected:**
- Session cookie cleared
- Cannot access `/entries` or `/insights`
- Redirect to sign-in if accessing protected routes

### Bonus Test 3: Mobile Responsiveness

**Steps:**
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test on iPhone 12 Pro viewport
4. Navigate through app

**Expected:**
- Layout adapts to mobile
- All buttons clickable
- No horizontal scroll
- Text readable

### Bonus Test 4: Caching Behavior

**Steps:**
1. Load home page twice quickly (<30s)
2. Check Vercel logs

**Expected:**
- Second load shows cache hit
- No database query on second load
- Response time <50ms on cache hit

---

## Troubleshooting Common Failures

### All Tests Fail: "Cannot connect"

**Likely cause:** Deployment not accessible

**Fix:**
1. Check Vercel deployment status
2. Verify deployment is "Ready"
3. Check domain/URL is correct

### Tests 2-8 Fail: Auth not working

**Likely cause:** OAuth misconfiguration

**Fix:**
1. Check Google OAuth redirect URIs
2. Verify `NEXTAUTH_URL` and `NEXTAUTH_SECRET`
3. Clear browser cookies, try again

### Tests 4-8 Fail: Database errors

**Likely cause:** Database connection issue

**Fix:**
1. Verify `DATABASE_URL` in Vercel env vars
2. Check Neon database is not paused
3. Test connection from Neon SQL Editor

### Test 5 Fails: AI not working

**Likely cause:** OpenAI API key issue

**Fix:**
1. Verify `OPENAI_API_KEY` in Vercel env vars
2. Check OpenAI billing is active
3. Check OpenAI API rate limits

### Test 7 Fails: User isolation broken

**CRITICAL - DO NOT DEPLOY:**
1. Review all database queries
2. Check user_id filtering
3. Fix before making app public

---

## Sign-Off

**Tested by:** ___________________  
**Date:** ___________________  
**Time:** ___________________  
**Deployment URL:** https://heybagel.vercel.app

**All tests passed:** ⬜ Yes / ⬜ No

**Notes:**

___________________________________________

___________________________________________

___________________________________________

**Approved for production:** ⬜ Yes / ⬜ No

**Signature:** ___________________

---

## Next Steps After All Tests Pass

1. ✅ Monitor Vercel logs for 1 hour
2. ✅ Invite 2-3 beta testers
3. ✅ Set up monitoring alerts
4. ✅ Document any issues found
5. ✅ Keep Railway running for 48 hours (safety net)
6. ✅ After 1 week stable, shut down Railway

**Congratulations! Your deployment is verified and ready for users.** 🎉


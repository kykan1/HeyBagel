# Phase 3 Security Verification Tests

## Overview

These are manual tests to verify user isolation and security in Hey Bagel. Perform these tests before deploying to production.

---

## Test Case 1: Cross-User Data Access Prevention ✅

**Goal:** Verify User A cannot read/modify User B's entries.

### Setup
1. Create two test Google accounts (or use two existing accounts)
2. Sign in as User A
3. Create 2-3 test entries
4. Note one entry ID from User A (copy from URL: `/entries/{id}`)
5. Sign out completely
6. Sign in as User B

### Tests to Perform

| Test | Expected Result | Status |
|------|----------------|--------|
| Visit User A's entry URL directly (e.g., `/entries/{user-a-id}`) | Should show 404 "Entry not found" | ☐ |
| Try to edit User A's entry (e.g., `/entries/{user-a-id}/edit`) | Should show 404 "Entry not found" | ☐ |
| Check home page `/` | Should NOT show User A's entries | ☐ |
| Check insights page `/insights` | Should NOT show User A's insights | ☐ |
| Create entry as User B, note ID | Entry should be created successfully | ☐ |
| Sign out, sign back in as User A | Should NOT see User B's entry | ☐ |

**Pass Criteria:** User B sees nothing from User A. All queries return empty or null due to `user_id` filtering.

---

## Test Case 2: Unauthenticated Access Prevention ✅

**Goal:** Verify unauthenticated users cannot access app data.

### Setup
1. Sign out completely (clear cookies if necessary)
2. Open incognito/private browsing window

### Tests to Perform

| Route | Expected Result | Status |
|-------|----------------|--------|
| Visit `/` | Should show landing page (NOT entries) | ☐ |
| Visit `/entries/new` | Middleware redirects to `/auth/signin?callbackUrl=/entries/new` | ☐ |
| Visit `/entries/{known-id}` | Middleware redirects to `/auth/signin` | ☐ |
| Visit `/insights` | Middleware redirects to `/auth/signin` | ☐ |
| Visit `/auth/signin` | Shows sign-in page (public route) | ☐ |

### API Tests (Optional - Use curl or Postman)

```bash
# Test process-ai endpoint (should fail without auth)
curl -X POST http://localhost:3000/api/process-ai \
  -H "Content-Type: application/json" \
  -d '{"entryId": "test-id"}'

# Expected: {"success": false, "error": "Unauthorized: You must be signed in..."}
```

```bash
# Test delete endpoint (should fail without auth)
curl -X DELETE http://localhost:3000/api/entries/test-id

# Expected: {"success": false, "error": "Unauthorized..."}
```

**Pass Criteria:** No data access without valid session. Clear error messages. Proper redirects.

---

## Test Case 3: Auth Error Handling ✅

**Goal:** Verify expired/invalid sessions are handled gracefully.

### Setup
1. Sign in normally
2. Create a test entry to verify auth is working
3. Open browser DevTools → Application → Cookies
4. Find the `authjs.session-token` cookie (or similar Auth.js cookie)
5. Delete the cookie or change its value to simulate expired/invalid session

### Tests to Perform

| Action | Expected Result | Status |
|--------|----------------|--------|
| Refresh the page | Should redirect to `/auth/signin` | ☐ |
| Try to create new entry | Should redirect to sign-in or show "You must be signed in" error | ☐ |
| Try to visit entry detail page | Should redirect to sign-in | ☐ |
| Try to trigger AI analysis | Should show "Unauthorized" error message | ☐ |

**Pass Criteria:** No app crashes. Clear user feedback. Automatic redirect to sign-in when appropriate.

---

## Test Case 4: SQL Injection Resistance ✅

**Goal:** Verify parameterized queries prevent SQL injection.

### Tests to Perform

| Input | Location | Expected Result | Status |
|-------|----------|----------------|--------|
| `'; DROP TABLE entries; --` | Entry content field | Saved as plain text, no SQL execution | ☐ |
| `" OR 1=1 --` | Entry content field | Saved as plain text, no SQL execution | ☐ |
| `<script>alert('xss')</script>` | Entry content field | Saved and displayed safely (escaped HTML) | ☐ |
| SQL injection in URL params | Try `/entries/1' OR '1'='1` | Should 404, not expose data | ☐ |

### Verification Steps
1. Create entry with malicious SQL in content
2. Check database directly (Neon Console → SQL Editor):
   ```sql
   SELECT content FROM entries ORDER BY created_at DESC LIMIT 5;
   ```
3. Verify the malicious string is stored as literal text
4. View the entry in the UI - should display safely

**Pass Criteria:** All input treated as data, not SQL. No query execution of malicious payloads. HTML is escaped properly.

**Note:** Your app uses postgres template literals which parameterize all inputs automatically. This test is verification only.

---

## Test Case 5: XSS Prevention (Bonus)

**Goal:** Verify Next.js escapes dynamic content properly.

### Tests to Perform

| Input | Expected Result | Status |
|-------|----------------|--------|
| Entry content: `<script>alert('xss')</script>` | Displays as text, doesn't execute | ☐ |
| Entry content: `<img src=x onerror="alert('xss')">` | Displays as text, doesn't execute | ☐ |
| Entry content with markdown: `[click me](javascript:alert('xss'))` | Link should not execute JavaScript | ☐ |

**Pass Criteria:** No JavaScript execution from user input. All dynamic content is escaped.

---

## Quick Verification Checklist

After running all tests, verify:

- [ ] No cross-user data leaks observed
- [ ] All protected routes require authentication
- [ ] Unauthenticated users see clear sign-in prompts
- [ ] Expired sessions handled gracefully (no crashes)
- [ ] SQL injection attempts fail safely
- [ ] XSS attempts are escaped/neutralized
- [ ] Error messages are user-friendly (don't expose internals)
- [ ] No console errors related to auth or security

---

## If Any Test Fails

1. **Document the failure** - Take screenshots, note exact steps
2. **Check server logs** - Look for errors in console or Vercel logs
3. **Verify database state** - Check if incorrect data was written
4. **Review code** - Identify the security gap
5. **Fix and re-test** - Implement fix and run all tests again

---

## Production Deployment Checklist

Before deploying to Vercel:

- [ ] All Phase 3 verification tests pass
- [ ] `SECURITY.md` exists and is up to date
- [ ] Security headers added to `next.config.ts`
- [ ] Environment variables set in Vercel dashboard:
  - `DATABASE_URL` (Neon Postgres)
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL` (production URL)
  - `OPENAI_API_KEY`
- [ ] Test deployment in Vercel preview environment first
- [ ] Monitor logs for auth errors after deployment

---

## Notes

- These tests should be performed in a **local development environment** first
- Run again in **Vercel preview deployment** before production
- Keep this document as a regression test suite for future updates
- Re-run after any auth or security-related changes

---

**Last Updated:** Phase 3 Security Audit  
**Next Review:** Before Vercel production deployment



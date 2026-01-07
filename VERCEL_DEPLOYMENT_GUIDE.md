# Vercel Deployment Guide - Hey Bagel

## Overview

This guide walks you through deploying Hey Bagel to Vercel with full authentication, database connectivity, and caching enabled.

**Estimated Time:** 1-2 hours (including testing)  
**Prerequisites:** GitHub account, Vercel account, Google Cloud Console access

---

## Pre-Deployment Checklist

### ✅ Code Ready

- [x] Phase 4 caching implemented
- [x] All tests passing locally
- [x] No linter errors
- [x] Git history clean

### ✅ External Services Ready

- [ ] Neon database created and accessible
- [ ] OpenAI API key active with billing enabled
- [ ] Google OAuth credentials created
- [ ] Vercel account created

---

## Step 1: Prepare Environment Variables

### Required Variables

Create a secure note or password manager entry with these 6 variables:

```bash
# 1. Database (from Neon Console)
DATABASE_URL=postgresql://[user]:[password]@[host].neon.tech/neondb?sslmode=require

# 2. OpenAI (from OpenAI Dashboard)
OPENAI_API_KEY=sk-proj-...

# 3. Auth.js Secret (generate new for production)
NEXTAUTH_SECRET=[run: openssl rand -base64 32]

# 4. Auth.js URL (will be your Vercel URL)
NEXTAUTH_URL=https://your-project-name.vercel.app

# 5. Google OAuth Client ID (from Google Cloud Console)
GOOGLE_CLIENT_ID=....apps.googleusercontent.com

# 6. Google OAuth Client Secret (from Google Cloud Console)
GOOGLE_CLIENT_SECRET=GOCSPX-...
```

### Generate NEXTAUTH_SECRET

**On Windows (PowerShell):**
```powershell
# Generate random base64 string
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**On macOS/Linux:**
```bash
openssl rand -base64 32
```

**Copy the output** - this is your `NEXTAUTH_SECRET` for production.

⚠️ **Important:** Use a DIFFERENT secret for production than you use locally!

---

## Step 2: Create Vercel Project

### 2.1 Initial Setup

1. Go to https://vercel.com/new
2. Click **"Import Git Repository"**
3. If not connected, authorize Vercel to access your GitHub account
4. Select repository: `kykan1/HeyBagel`

### 2.2 Configure Project

**Project Name:**
- Default: `heybagel` (or customize)
- This becomes: `https://heybagel.vercel.app`

**Framework Preset:**
- Should auto-detect: **Next.js** ✅
- If not detected, select manually

**Root Directory:**
- Leave as: `./` (project root) ✅

**Build Settings:**
- Build Command: `npm run build` (default) ✅
- Output Directory: `.next` (default) ✅
- Install Command: `npm install` (default) ✅

**Environment Variables:**
- **SKIP for now** - we'll add these in Step 3

Click **"Deploy"** to create the project.

⚠️ **This first deployment will FAIL** - that's expected! We need to add environment variables first.

---

## Step 3: Configure Environment Variables

### 3.1 Access Settings

1. After failed deployment, click **"Project Settings"**
2. Navigate to **"Environment Variables"** in left sidebar

### 3.2 Add Variables

For each of the 6 variables, click **"Add New"**:

| Key | Value | Environments |
|-----|-------|-------------|
| `DATABASE_URL` | `postgresql://...` | Production, Preview, Development |
| `OPENAI_API_KEY` | `sk-proj-...` | Production, Preview, Development |
| `GOOGLE_CLIENT_ID` | `....apps.googleusercontent.com` | Production, Preview, Development |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-...` | Production, Preview, Development |
| `NEXTAUTH_URL` | `https://heybagel.vercel.app` | **Production only** |
| `NEXTAUTH_SECRET` | `[generated value]` | Production, Preview, Development |

**Notes:**

- Check all 3 environment boxes for most variables
- `NEXTAUTH_URL` should be Production-only (Vercel handles Preview URLs automatically)
- Use the **same** `DATABASE_URL` for all environments (Neon handles this safely)
- Use the **same** `NEXTAUTH_SECRET` across all environments (or generate unique ones for extra security)

### 3.3 Save Changes

After adding all 6 variables:
1. Click **"Save"** after each one
2. Verify all 6 are listed in the Environment Variables table
3. Check that sensitive values are masked (•••••)

---

## Step 4: Update Google OAuth Configuration

### 4.1 Access Google Cloud Console

1. Go to https://console.cloud.google.com
2. Navigate to **"APIs & Services"** → **"Credentials"**
3. Click on your OAuth 2.0 Client ID (the one you created for Hey Bagel)

### 4.2 Add Authorized Redirect URIs

In **"Authorized redirect URIs"** section, add these 3 URIs:

```
https://heybagel.vercel.app/api/auth/callback/google
https://heybagel-*.vercel.app/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
```

**Breakdown:**
- **Line 1:** Production URL
- **Line 2:** Preview deployments (wildcard for branch/PR previews)
- **Line 3:** Local development (keep existing)

### 4.3 Add Authorized JavaScript Origins

In **"Authorized JavaScript origins"** section, ensure these are present:

```
https://heybagel.vercel.app
https://heybagel-*.vercel.app
http://localhost:3000
```

### 4.4 Save Changes

Click **"Save"** at the bottom.

⚠️ **Critical:** OAuth will not work without these redirect URIs!

---

## Step 5: Configure Vercel Project Settings

### 5.1 Set Region (Optional but Recommended)

1. In Vercel Dashboard → Project Settings → **"Functions"**
2. Scroll to **"Serverless Function Region"**
3. Select: **Washington, D.C., USA (iad1)**

**Why:** Co-locates with Neon database (likely in AWS us-east) for lower latency.

### 5.2 Verify Build Settings

1. Project Settings → **"General"**
2. Confirm:
   - Node.js Version: **20.x** (default)
   - Framework: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`

**No changes needed** - these are correct by default.

---

## Step 6: Deploy to Production

### 6.1 Trigger Deployment

Now that environment variables are configured:

1. Go to **"Deployments"** tab
2. Click **"Redeploy"** on the failed deployment
3. Or push a new commit to trigger auto-deployment:

```bash
git add .
git commit -m "Add Vercel deployment configuration"
git push origin main
```

### 6.2 Monitor Build

Watch the build logs in Vercel Dashboard:

**Expected output:**
```
> Building...
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (7/7)
✓ Finalizing page optimization
```

**Build time:** 60-90 seconds

### 6.3 Deployment Success

Once complete, you'll see:
- ✅ **Status:** Ready
- 🌐 **URL:** https://heybagel.vercel.app
- 📊 **Domains:** Auto-assigned Vercel URL

Click **"Visit"** to open your deployed app!

---

## Step 7: Verify Deployment (Critical!)

Run through these 8 smoke tests to ensure everything works:

### ✅ Test 1: Landing Page Loads

**Steps:**
1. Visit: `https://heybagel.vercel.app`
2. Should see: "Hey Bagel 🥯" heading
3. Should see: "Sign in with Google" button

**Expected:** Page loads in <1 second, no errors

### ✅ Test 2: Google OAuth Sign-In

**Steps:**
1. Click "Sign in with Google"
2. Select your Google account
3. Authorize the app

**Expected:**
- Redirects to Google OAuth consent screen
- After authorization, redirects back to home page
- User menu appears in header with your name/email

**If fails:** Check Google OAuth redirect URIs, verify `NEXTAUTH_URL` and secrets

### ✅ Test 3: Database Connectivity

**Steps:**
1. After sign-in, should see: "Your Journal" heading
2. May see empty state: "No entries yet"

**Expected:** No database connection errors

**If fails:**
- Check Vercel logs for database errors
- Verify `DATABASE_URL` is correct
- Check Neon database is not paused (auto-resumes on connection)

### ✅ Test 4: Create Entry (Full CRUD Test)

**Steps:**
1. Click "New Entry" button
2. Write test entry: "Testing Vercel deployment!"
3. Select mood: "Positive"
4. Click "Create Entry"

**Expected:**
- Redirects to entry detail page
- Entry displays correctly
- Status badge shows "pending" or "processing"

**If fails:** Check Vercel function logs, verify database permissions

### ✅ Test 5: AI Processing

**Steps:**
1. On entry detail page, wait 5-10 seconds
2. Refresh the page
3. Should see AI summary, sentiment, and themes

**Expected:**
- AI analysis completes within 10 seconds
- Results display correctly
- No error messages

**If fails:**
- Check `OPENAI_API_KEY` is correct and has billing enabled
- Check Vercel function timeout (default 10s should be enough)
- Check Vercel logs for OpenAI API errors

### ✅ Test 6: Update Entry

**Steps:**
1. On entry detail page, click "Edit"
2. Modify content: "Updated from Vercel!"
3. Change mood to "Neutral"
4. Click "Save Changes"

**Expected:**
- Redirects back to detail page
- Changes saved correctly
- Cache invalidates (see new content immediately)

### ✅ Test 7: User Isolation (Critical Security Test)

**Steps:**
1. **Browser 1:** Sign in as User A (your primary Google account)
2. Create entry: "User A's private entry"
3. **Browser 2 (Incognito):** Sign in as User B (different Google account)
4. Check home page as User B

**Expected:**
- User B does NOT see "User A's private entry"
- Each user sees only their own data
- No cross-user data leakage

**If fails:** **Critical security issue** - check database queries include `user_id` filter

### ✅ Test 8: Generate Insight

**Steps:**
1. Create at least 3 entries over different dates
2. Navigate to `/insights`
3. Click "Generate Weekly Insight"
4. Wait 10-15 seconds, refresh page

**Expected:**
- Insight generates successfully
- Content displays correctly
- Themes and sentiment trend appear

**If fails:** Check OpenAI API quota, verify batch insight prompts work

---

## Step 8: Monitor Post-Deployment

### 8.1 Check Vercel Logs

**Access:** Vercel Dashboard → Project → **"Logs"**

**Look for:**
- ✅ Successful function executions
- ✅ Database connections established
- ✅ No 500 errors
- ⚠️ Any warnings about timeouts or rate limits

**Filter by:**
- **Status:** 2xx (success), 4xx (client error), 5xx (server error)
- **Source:** Functions, Edge, Static

### 8.2 Check Neon Dashboard

**Access:** https://console.neon.tech → Your Project

**Monitor:**
- **Connections:** Should see 2-5 active connections during usage
- **Compute:** Should stay well under free tier limits
- **Queries:** Should be 80-90% fewer than before (caching working!)

### 8.3 Check OpenAI Usage

**Access:** https://platform.openai.com/usage

**Monitor:**
- **Requests:** Should match entry creation + insight generation count
- **Cost:** ~$0.001 per entry, ~$0.05 per insight
- **Errors:** Should be <5%

### 8.4 Vercel Analytics (Optional)

**Access:** Vercel Dashboard → Project → **"Analytics"**

**Metrics to watch:**
- **Cache Hit Ratio:** Target 60-80%
- **Function Execution Time:** p95 <500ms
- **Error Rate:** <1%
- **Page Views:** Track user engagement

---

## Step 9: Configure Custom Domain (Optional)

### 9.1 Add Domain

1. Vercel Dashboard → Project → **"Domains"**
2. Click **"Add"**
3. Enter your domain: `yourdomain.com`
4. Follow DNS configuration instructions

### 9.2 Update Environment Variables

After domain is verified:

1. Go to **"Environment Variables"**
2. Update `NEXTAUTH_URL` to: `https://yourdomain.com`
3. Redeploy for changes to take effect

### 9.3 Update Google OAuth

Add custom domain to Google Cloud Console:

```
https://yourdomain.com/api/auth/callback/google
https://yourdomain.com
```

---

## Troubleshooting Common Issues

### Issue 1: Build Fails

**Symptoms:** Deployment stuck on "Building", then fails

**Check:**
- Vercel build logs for TypeScript errors
- package.json has all dependencies
- Next.js version is 15.x

**Fix:**
```bash
# Test build locally first
npm run build

# If build succeeds locally, check Vercel Node.js version
# Project Settings → General → Node.js Version → 20.x
```

### Issue 2: "Database connection failed"

**Symptoms:** 500 errors, logs show database timeout

**Check:**
- `DATABASE_URL` environment variable is correct
- Neon database is not paused (check Neon Console)
- Connection string includes `?sslmode=require`

**Fix:**
```bash
# Test connection locally with Vercel env
vercel env pull .env.vercel
npm run dev
```

### Issue 3: "OAuth redirect URI mismatch"

**Symptoms:** Google OAuth fails with error message

**Check:**
- Google Cloud Console → Credentials → Authorized redirect URIs
- Must include: `https://[your-vercel-url]/api/auth/callback/google`

**Fix:**
- Add correct redirect URI in Google Console
- Wait 1-2 minutes for changes to propagate
- Try sign-in again

### Issue 4: "AI analysis fails"

**Symptoms:** Entries stuck in "pending" or "failed" status

**Check:**
- `OPENAI_API_KEY` is correct
- OpenAI account has billing enabled
- Vercel function timeout (default 10s should be enough)

**Fix:**
- Verify API key in OpenAI dashboard
- Check Vercel function logs for error details
- Retry AI analysis from entry detail page

### Issue 5: "Stale data after mutations"

**Symptoms:** Created entry doesn't appear on home page

**Check:**
- Phase 4 caching implemented correctly
- Server Actions call `revalidatePath()`

**Fix:**
- Refresh page (should show after cache expires)
- Check Server Action logs for revalidation errors
- Verify `revalidate` times in page files

### Issue 6: Cross-user data visible

**Symptoms:** User A sees User B's entries (CRITICAL!)

**Check:**
- Database queries include `WHERE user_id = ${userId}`
- `requireAuth()` is called in all Server Actions
- Session user ID is correct

**Fix:**
- **This is a critical security issue** - investigate immediately
- Check database query logs
- Verify `getUserId()` returns correct value
- Roll back if necessary

---

## Rollback Plan

### Scenario 1: Deployment Fails Completely

**Symptoms:** App won't deploy, build errors

**Action:**
1. Keep Railway deployment running
2. Debug locally: `npm run build`
3. Fix errors, push to GitHub
4. Vercel will auto-redeploy

**Downtime:** None (Railway still serving traffic)

### Scenario 2: Auth Broken on Vercel

**Symptoms:** Can't sign in, OAuth errors

**Action:**
1. Verify Google OAuth redirect URIs
2. Check `NEXTAUTH_URL` and `NEXTAUTH_SECRET`
3. If can't fix quickly, point DNS back to Railway

**Downtime:** Users can't access app (redirect to sign-in)

### Scenario 3: Database Issues

**Symptoms:** 500 errors, can't read/write data

**Action:**
1. Check Neon dashboard (database paused? connection limit?)
2. Verify `DATABASE_URL` in Vercel env vars
3. If Neon issue, keep Railway running with old SQLite (if you kept it)

**Downtime:** Depends on issue (usually <5 minutes to diagnose)

### Emergency Rollback (Revert to Railway)

**If Vercel deployment is broken and can't be fixed quickly:**

1. **Don't panic** - Railway is still running
2. **Investigate logs** - Find root cause
3. **Fix locally** - Test with `vercel env pull` and `npm run dev`
4. **Redeploy** - Push fix to GitHub, Vercel auto-deploys
5. **Monitor** - Watch logs for 10-15 minutes

**Vercel's advantage:** Can redeploy instantly, no server management

---

## Post-Deployment Optimization

### 1. Enable Vercel Speed Insights (Free)

**Access:** Vercel Dashboard → Project → **"Speed Insights"**

**Benefits:**
- Real User Monitoring (RUM)
- Core Web Vitals tracking
- Performance scores

### 2. Set Up Alerts (Optional)

**Neon Alerts:**
- Compute usage approaching free tier limit
- Connection pool exhaustion

**OpenAI Alerts:**
- Cost exceeds $20/month
- Error rate >10%

**Vercel Monitoring:**
- Function errors >1%
- 99th percentile latency >1s

### 3. Review Analytics Weekly

**Metrics to track:**
- Active users (sign-ins)
- Entries created per day
- AI analysis success rate
- Insights generated

**Use data to:**
- Validate product-market fit
- Identify pain points
- Plan next features

---

## Success Criteria

Deployment is successful when:

- ✅ All 8 smoke tests pass
- ✅ No 500 errors in Vercel logs for 24 hours
- ✅ Users can sign in, create entries, get AI analysis
- ✅ User isolation verified (no data leakage)
- ✅ Cache hit ratio 60-80% (Vercel Analytics)
- ✅ Database performance acceptable (<100ms p95)
- ✅ OpenAI costs within budget (<$10/month initial)

---

## Next Steps After Deployment

### Immediate (First 48 Hours)

1. **Monitor actively:** Check logs every few hours
2. **Test with real users:** Invite 2-3 beta testers
3. **Document issues:** Track any bugs or UX problems
4. **Keep Railway running:** Safety net during first week

### Short Term (First Week)

1. **User feedback:** Ask testers about experience
2. **Performance review:** Check cache hit ratio, adjust if needed
3. **Cost analysis:** Verify OpenAI and Neon costs are acceptable
4. **Shutdown Railway:** Once Vercel is stable for 7 days

### Medium Term (First Month)

1. **Analytics review:** Look at usage patterns
2. **Feature requests:** Prioritize based on user feedback
3. **Security audit:** Re-verify user isolation is working
4. **Custom domain:** Set up branded domain if desired

---

## Support Resources

**Vercel:**
- Docs: https://vercel.com/docs
- Discord: https://vercel.com/discord
- Status: https://vercel-status.com

**Neon:**
- Docs: https://neon.tech/docs
- Discord: https://neon.tech/discord
- Status: https://neon.tech/status

**Auth.js:**
- Docs: https://authjs.dev
- GitHub Discussions: https://github.com/nextauthjs/next-auth/discussions

**OpenAI:**
- Docs: https://platform.openai.com/docs
- Status: https://status.openai.com
- Support: https://help.openai.com

---

## Conclusion

You've successfully deployed Hey Bagel to Vercel with:

✅ Production-ready caching  
✅ Google OAuth authentication  
✅ Postgres database (Neon)  
✅ AI-powered insights  
✅ Full user isolation  
✅ Error handling and logging  
✅ Security headers and HTTPS

**Your app is now live and scalable!** 🎉

Monitor for the first few days, gather user feedback, and iterate based on real usage patterns.

---

**Deployment completed:** [Date]  
**Deployed by:** [Your Name]  
**Production URL:** https://heybagel.vercel.app  
**Status:** Live ✅


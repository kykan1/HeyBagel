# Vercel Environment Variables Checklist

## Quick Reference

Copy this checklist when configuring environment variables in Vercel Dashboard.

---

## Required Variables (6 Total)

### ✅ 1. DATABASE_URL

**Source:** Neon Console → Connection String

**Format:**
```
postgresql://[user]:[password]@[host].neon.tech/neondb?sslmode=require
```

**Example:**
```
postgresql://myuser:AbCdEf123456@ep-cool-name-12345.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**Environments:** ✅ Production, ✅ Preview, ✅ Development

**Where to find:**
1. Go to https://console.neon.tech
2. Select your project
3. Click "Connection Details"
4. Copy "Connection string" (includes password)

---

### ✅ 2. OPENAI_API_KEY

**Source:** OpenAI Dashboard → API Keys

**Format:**
```
sk-proj-[rest of key]
```

**Example:**
```
sk-proj-AbCdEf123456789...
```

**Environments:** ✅ Production, ✅ Preview, ✅ Development

**Where to find:**
1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Name it "Hey Bagel Production"
4. Copy the key (only shown once!)
5. Verify billing is enabled: https://platform.openai.com/settings/organization/billing/overview

---

### ✅ 3. NEXTAUTH_URL

**Source:** Your Vercel deployment URL

**Format:**
```
https://[your-project-name].vercel.app
```

**Example:**
```
https://heybagel.vercel.app
```

**Environments:** ✅ Production ONLY

**Notes:**
- For Preview/Development, Vercel auto-injects the correct URL
- Only set this for Production environment
- Must match exactly (no trailing slash)

---

### ✅ 4. NEXTAUTH_SECRET

**Source:** Generate yourself (cryptographically random)

**Format:** Base64 string, 32+ characters

**Example:**
```
jZa6/xJ8FqPU9vN3hE7dMwKcL2sRbG4tQyV1nX5iA8o=
```

**Environments:** ✅ Production, ✅ Preview, ✅ Development

**How to generate:**

**Windows (PowerShell):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**macOS/Linux:**
```bash
openssl rand -base64 32
```

**Online (if no terminal access):**
- https://generate-secret.vercel.app/32

**Security notes:**
- Use DIFFERENT secrets for Production vs Preview vs Development
- Never commit this to git
- Store securely (password manager)

---

### ✅ 5. GOOGLE_CLIENT_ID

**Source:** Google Cloud Console → Credentials

**Format:**
```
[numbers]-[random].apps.googleusercontent.com
```

**Example:**
```
123456789012-abcdefghijklmnopqrstuvwxyz123456.apps.googleusercontent.com
```

**Environments:** ✅ Production, ✅ Preview, ✅ Development

**Where to find:**
1. Go to https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID
3. Copy the "Client ID" value

**Notes:**
- Same ID works for all environments (Vercel handles redirect URIs)
- Make sure OAuth consent screen is configured
- Must be type "Web application"

---

### ✅ 6. GOOGLE_CLIENT_SECRET

**Source:** Google Cloud Console → Credentials

**Format:**
```
GOCSPX-[random string]
```

**Example:**
```
GOCSPX-AbCdEfGhIjKlMnOpQrStUvWxYz
```

**Environments:** ✅ Production, ✅ Preview, ✅ Development

**Where to find:**
1. Go to https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID
3. Copy the "Client secret" value
4. If not visible, click "Download JSON" and extract from file

**Security notes:**
- Keep this secret! Never expose in client-side code
- Rotate periodically (every 6-12 months)

---

## Verification Checklist

Before deploying, verify:

- [ ] All 6 variables added to Vercel
- [ ] Values are not empty or placeholder text
- [ ] Sensitive values are masked (••••••) in Vercel UI
- [ ] `NEXTAUTH_URL` matches your actual Vercel URL
- [ ] `NEXTAUTH_SECRET` is cryptographically random (not "test123")
- [ ] `DATABASE_URL` includes `?sslmode=require` at the end
- [ ] `OPENAI_API_KEY` starts with `sk-proj-` (new format) or `sk-` (old format)
- [ ] Google OAuth credentials are for "Web application" type

---

## Testing Environment Variables Locally

### Option 1: Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Link to Vercel project
vercel link

# Pull production environment variables
vercel env pull .env.local

# Test locally
npm run dev
```

### Option 2: Manual Copy

Create `.env.local` with all 6 variables:

```bash
# .env.local (DO NOT COMMIT TO GIT)
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-proj-...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

Then test:
```bash
npm run dev
```

---

## Environment-Specific Notes

### Production

- Use in production environment only
- Must be 100% accurate (no test values)
- `NEXTAUTH_URL` must be your real domain

### Preview

- Used for branch/PR deployments
- Vercel auto-generates URLs like: `heybagel-git-feature.vercel.app`
- Can use same database as production (Neon handles concurrency)
- Consider using separate `NEXTAUTH_SECRET` for security

### Development

- Used when running `vercel dev` locally
- Can share with Preview environment
- `NEXTAUTH_URL` should be `http://localhost:3000`

---

## Common Mistakes

### ❌ Mistake 1: Trailing Slash in NEXTAUTH_URL

**Wrong:**
```
NEXTAUTH_URL=https://heybagel.vercel.app/
```

**Correct:**
```
NEXTAUTH_URL=https://heybagel.vercel.app
```

### ❌ Mistake 2: Missing sslmode in DATABASE_URL

**Wrong:**
```
DATABASE_URL=postgresql://user:pass@host.neon.tech/neondb
```

**Correct:**
```
DATABASE_URL=postgresql://user:pass@host.neon.tech/neondb?sslmode=require
```

### ❌ Mistake 3: Weak NEXTAUTH_SECRET

**Wrong:**
```
NEXTAUTH_SECRET=mysecret123
```

**Correct:**
```
NEXTAUTH_SECRET=jZa6/xJ8FqPU9vN3hE7dMwKcL2sRbG4tQyV1nX5iA8o=
```

### ❌ Mistake 4: Using Development Keys in Production

**Wrong:** Using test OpenAI key or local database

**Correct:** Production values for production environment

### ❌ Mistake 5: Forgetting to Update After Domain Change

**Wrong:** `NEXTAUTH_URL=https://heybagel.vercel.app` (old)

**Correct:** `NEXTAUTH_URL=https://yourdomain.com` (after custom domain added)

---

## Security Best Practices

### ✅ DO

- Store secrets in password manager
- Use different `NEXTAUTH_SECRET` for each environment
- Rotate secrets every 6-12 months
- Verify Vercel masks sensitive values
- Use Vercel's encrypted storage (never commit to git)

### ❌ DON'T

- Commit `.env.local` to git (already in `.gitignore`)
- Share secrets via Slack/email (use secure channels)
- Use weak or guessable secrets
- Reuse production secrets in development
- Expose secrets in client-side code

---

## Troubleshooting

### Issue: "Environment variable not found"

**Check:**
- Variable name spelled correctly (case-sensitive)
- Variable exists in correct environment (Production/Preview/Development)
- Deployment was triggered AFTER adding variables

**Fix:**
- Add missing variable in Vercel Dashboard
- Redeploy to pick up new variables

### Issue: "Invalid DATABASE_URL"

**Check:**
- Connection string format is correct
- Includes `?sslmode=require` at the end
- Password doesn't contain special characters that need URL encoding

**Fix:**
- Copy connection string directly from Neon Console
- URL encode special characters if needed

### Issue: "OAuth redirect_uri_mismatch"

**Check:**
- `NEXTAUTH_URL` matches your actual deployment URL
- Google OAuth has correct redirect URIs configured

**Fix:**
- Update `NEXTAUTH_URL` to match Vercel deployment
- Add redirect URI in Google Cloud Console

---

## Quick Copy-Paste Template

Use this when adding variables in Vercel Dashboard:

```bash
# Variable 1
Key: DATABASE_URL
Value: postgresql://[user]:[pass]@[host].neon.tech/neondb?sslmode=require
Environments: ✅ Production ✅ Preview ✅ Development

# Variable 2
Key: OPENAI_API_KEY
Value: sk-proj-[your-key]
Environments: ✅ Production ✅ Preview ✅ Development

# Variable 3
Key: NEXTAUTH_URL
Value: https://[your-project].vercel.app
Environments: ✅ Production ⬜ Preview ⬜ Development

# Variable 4
Key: NEXTAUTH_SECRET
Value: [generated-base64-string]
Environments: ✅ Production ✅ Preview ✅ Development

# Variable 5
Key: GOOGLE_CLIENT_ID
Value: [numbers]-[random].apps.googleusercontent.com
Environments: ✅ Production ✅ Preview ✅ Development

# Variable 6
Key: GOOGLE_CLIENT_SECRET
Value: GOCSPX-[your-secret]
Environments: ✅ Production ✅ Preview ✅ Development
```

---

**Total: 6 variables required**  
**Estimated setup time: 10-15 minutes**  
**After adding all variables: Trigger deployment in Vercel Dashboard**


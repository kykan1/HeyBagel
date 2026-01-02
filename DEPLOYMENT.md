# Hey Bagel - Deployment Guide

## ⚠️ Critical: SQLite + Vercel Limitation

**better-sqlite3 does NOT work on Vercel** because:
- Vercel uses serverless functions (AWS Lambda)
- better-sqlite3 requires native Node modules (C++ bindings)
- Vercel's runtime doesn't support native dependencies
- File system is read-only and ephemeral

## Quick Deploy Options (Ranked)

### Option 1: Railway (Recommended - 5 minutes) ✅

**Why Railway:**
- ✅ Supports native Node modules (SQLite works!)
- ✅ Deploy directly from GitHub
- ✅ Free tier: $5 credit/month (enough for MVP testing)
- ✅ Persistent file storage
- ✅ Auto-deploys on git push
- ✅ Zero config needed

**Deploy Steps:**
1. Go to https://railway.app
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select `kykan1/HeyBagel`
5. Add environment variable:
   - `OPENAI_API_KEY` = your OpenAI key
6. Click Deploy
7. Railway auto-detects Next.js and deploys!

**Time:** ~5 minutes
**Cost:** Free (with $5/month credit)

---

### Option 2: Render

**Why Render:**
- ✅ Native modules supported
- ✅ Auto-deploy from GitHub
- ✅ Free tier available (slower cold starts)

**Deploy Steps:**
1. Go to https://render.com
2. "New Web Service" → Connect GitHub repo
3. Settings:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
4. Add environment variable: `OPENAI_API_KEY`
5. Deploy

**Time:** ~10 minutes
**Cost:** Free tier available

---

### Option 3: Fly.io

**Why Fly.io:**
- ✅ Full VM support
- ✅ Persistent volumes for database
- ✅ Free tier (3 shared-cpu VMs)

**Deploy Steps:**
1. Install Fly CLI: `powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"`
2. `fly auth login`
3. `fly launch` (in project directory)
4. Set secrets: `fly secrets set OPENAI_API_KEY=your-key`
5. `fly deploy`

**Time:** ~15 minutes
**Cost:** Free tier available

---

### Option 4: Vercel (Requires Architecture Change)

**If you want Vercel, you must:**
1. Replace SQLite with Vercel Postgres or Turso (Libsql)
2. Rewrite `lib/db/client.ts` to use new DB
3. Migrate schema and data
4. Test thoroughly

**Estimated time:** 2-4 hours
**Not recommended for quick MVP validation**

---

## Environment Variables

```env
OPENAI_API_KEY=sk-...    # Required
DATABASE_PATH=/data/heybagel.db  # Optional (defaults to ./data/heybagel.db)
```

---

## Recommended Path: Railway NOW

**Why Railway for MVP:**
- No code changes needed
- No database migration
- 5-minute setup
- Free tier sufficient for testing
- Can migrate later if needed

**After MVP Validation:**
- If you want Vercel: migrate to Postgres/Turso
- If you want scale: add auth, multi-user
- If you want features: implement deferred features from PLAN.md

---

## Database Considerations

### Current (SQLite):
- ✅ Perfect for single-user MVP
- ✅ Fast, simple, reliable
- ✅ No additional costs
- ✅ Easy local development
- ⚠️ Requires persistent disk (Railway/Render/Fly)

### Future (Postgres):
- When to migrate:
  - Adding multi-user auth
  - Moving to Vercel
  - Need backups/replication
  - Scaling beyond 10k entries

**For MVP validation: SQLite is perfect!**

---

## Quick Start: Deploy to Railway

```bash
# 1. Push latest code to GitHub
git add .
git commit -m "Ready for deployment"
git push origin main

# 2. Go to Railway
# https://railway.app

# 3. Deploy from GitHub
# Select your repo, add OPENAI_API_KEY, done!
```

**You'll get a public URL in ~2 minutes.**

---

## Post-Deployment Checklist

- [ ] Test creating an entry
- [ ] Test AI analysis
- [ ] Test weekly/monthly insights
- [ ] Test edit/delete functionality
- [ ] Verify empty states
- [ ] Check error handling
- [ ] Monitor OpenAI API usage

---

## Cost Estimates (MVP Testing)

| Platform | Free Tier | Estimated Monthly |
|----------|-----------|-------------------|
| Railway | $5 credit | $0 (under credit) |
| Render | Yes | $0 (free tier) |
| Fly.io | 3 VMs | $0 (free tier) |
| OpenAI API | Pay-as-you-go | $5-10/month |

**Total: ~$5-10/month for MVP testing**

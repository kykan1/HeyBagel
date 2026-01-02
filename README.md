# Hey Bagel 🥯

A private, AI-powered journaling app that helps you reflect, grow, and discover patterns in your thoughts.

## Features

- 📝 **Private Journaling** - Write daily entries with mood tracking
- 🤖 **AI Analysis** - Get instant summaries, sentiment analysis, and themes (GPT-4o-mini)
- 📊 **Longitudinal Insights** - Weekly and monthly reflections on your journey (GPT-4o)
- 🎨 **Beautiful UI** - Calm, minimal design focused on your writing
- ⌨️ **Keyboard Shortcuts** - Fast navigation (press `?` to see all shortcuts)
- ♿ **Accessible** - ARIA labels, keyboard navigation, error boundaries

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** SQLite with better-sqlite3
- **AI:** OpenAI GPT-4o-mini & GPT-4o
- **Styling:** Tailwind CSS
- **Validation:** Zod
- **TypeScript:** Strict mode

## Getting Started

### Prerequisites

- Node.js 18+
- OpenAI API key ([get one here](https://platform.openai.com/api-keys))

### Installation

```bash
# Clone the repository
git clone https://github.com/kykan1/HeyBagel.git
cd HeyBagel

# Install dependencies
npm install

# Set up environment variables
cp env.example .env.local
# Edit .env.local and add your OPENAI_API_KEY

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start journaling!

### Environment Variables

```env
OPENAI_API_KEY=sk-...    # Required
DATABASE_PATH=./data/heybagel.db  # Optional (defaults to ./data/heybagel.db)
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy (Recommended):**
1. Push to GitHub
2. Deploy to [Railway](https://railway.app) (supports SQLite)
3. Add `OPENAI_API_KEY` environment variable
4. Done! 🎉

**Note:** Vercel doesn't support better-sqlite3. Use Railway, Render, or Fly.io instead.

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home (entry list)
│   ├── entries/           # Entry routes
│   │   ├── new/          # Create entry
│   │   └── [id]/         # View/edit entry
│   └── insights/         # Weekly/monthly insights
├── actions/               # Server Actions (mutations)
├── components/            # React components
├── lib/
│   ├── ai/               # OpenAI integration
│   ├── db/               # SQLite database
│   └── utils/            # Utilities (validation, dates, logger)
└── types/                # TypeScript types
```

## Architecture Principles

1. **Server Components by Default** - Client Components only for interactivity
2. **Server Actions for Writes** - No client-side fetch for mutations
3. **AI Never Blocks** - Entry saves return immediately; AI runs asynchronously
4. **Explicit AI State** - UI always reflects real backend state
5. **Fail Gracefully** - AI errors don't break core journaling UX

## Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint
```

## Keyboard Shortcuts

- `n` - New entry
- `i` - View insights
- `h` - Go home
- `?` - Show all shortcuts

## MVP Status

✅ **Phase 1:** Core journaling (CRUD, mood tracking)
✅ **Phase 2:** AI integration (single entry analysis)
✅ **Phase 3:** Longitudinal insights (weekly/monthly)
✅ **Phase 4:** Polish (empty states, validation, loading states)

**The MVP is complete!** 🎉

## Future Enhancements (Deferred)

See [PLAN.md](./PLAN.md) for the full roadmap. Deferred features include:
- Authentication (multi-user)
- Search functionality
- Export/backup
- Mood trends visualization
- Tags/categories
- Mobile app

## License

Private project - All rights reserved

## Contact

Kyle - [@kykan1](https://github.com/kykan1)

---

**Built with ❤️ for personal reflection and growth**

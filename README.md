# Hey Bagel 🥯

A minimalist, private journaling app with AI-powered insights.

## Phase 1 Complete ✅

This implementation includes the foundation for Hey Bagel:

### What's Built

- **Database Layer**: SQLite with better-sqlite3
  - Schema with entries table
  - CRUD query functions
  - Automatic migrations on startup

- **Entry Management**:
  - Create journal entries
  - View all entries (home page)
  - View individual entry details
  - Optional mood tracking (positive, neutral, negative, mixed)

- **Server Actions**:
  - `createEntry` - Save new entries
  - `updateEntry` - Modify existing entries
  - `deleteEntry` - Remove entries
  - Proper revalidation after mutations

- **UI Components**:
  - EntryForm (client component with form state)
  - EntryList (server component for listing)
  - EntryCard (preview cards with mood indicators)
  - EntryDetail (full entry view)

- **Pages**:
  - Home page (entry list)
  - New entry page (form)
  - Entry detail page (single entry view)
  - Responsive layout with minimal design

### Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- SQLite (better-sqlite3)
- Zod (validation)
- date-fns (date formatting)

## Getting Started

1. **Install dependencies** (already done):
   ```bash
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

4. **Start journaling**:
   - Click "New Entry" to create your first journal entry
   - Write freely and optionally select a mood
   - View your entries on the home page
   - Click any entry to see the full details

## Project Structure

```
HeyBagel/
├── app/                      # Next.js App Router pages
│   ├── entries/
│   │   ├── new/             # New entry form page
│   │   └── [id]/            # Single entry detail page
│   ├── layout.tsx           # Root layout with header
│   ├── page.tsx             # Home page (entry list)
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── EntryCard.tsx       # Entry preview card
│   ├── EntryDetail.tsx     # Full entry display
│   ├── EntryForm.tsx       # Entry creation/edit form
│   └── EntryList.tsx       # List of entry cards
├── lib/                     # Core library code
│   ├── db/
│   │   ├── client.ts       # SQLite connection
│   │   ├── schema.ts       # Database migrations
│   │   └── queries.ts      # Database queries
│   └── utils/
│       ├── date.ts         # Date formatting utilities
│       └── validation.ts   # Zod schemas
├── actions/                 # Server Actions
│   └── entry-actions.ts    # Entry CRUD actions
├── types/                   # TypeScript types
│   └── index.ts            # Shared types
├── data/                    # Database storage (created on first run)
│   └── heybagel.db         # SQLite database file
└── PLAN.md                 # Full implementation plan
```

## Database

The SQLite database is automatically created at `./data/heybagel.db` on first run.

### Entries Table Schema

- `id` - Unique entry identifier
- `user_id` - User identifier (currently "default_user")
- `date` - Entry date (ISO 8601)
- `content` - Journal entry text
- `mood` - Optional mood (positive/neutral/negative/mixed)
- `ai_summary` - AI-generated summary (Phase 2)
- `ai_sentiment` - AI sentiment analysis (Phase 2)
- `ai_themes` - AI-extracted themes (Phase 2)
- `ai_status` - AI processing status (Phase 2)
- `ai_error` - AI error messages (Phase 2)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## What's NOT Built Yet

Phase 1 intentionally excludes AI features. These will be added in Phase 2:

- ❌ AI summaries for entries
- ❌ AI sentiment analysis
- ❌ AI theme extraction
- ❌ Weekly/monthly insights
- ❌ AI error handling and retry logic

Also deferred:
- Authentication (single-user mode for now)
- Entry editing UI
- Entry deletion UI
- Search functionality
- Pagination

## Next Steps

See `PLAN.md` for the complete implementation plan, including:
- Phase 2: AI Integration
- Phase 3: Batch Insights
- Phase 4: Polish & Edge Cases

## Architecture Highlights

✅ **Server Components by Default**: All pages are Server Components for optimal performance

✅ **Server Actions for Mutations**: No client-side fetch; all writes use Server Actions

✅ **Caching & Revalidation**: Proper cache invalidation after mutations

✅ **Type Safety**: Full TypeScript coverage with strict mode

✅ **Data-First Design**: Database writes succeed before any other processing

✅ **Ready for AI**: Schema includes AI fields (pending state), ready for Phase 2

## Development Notes

- Database migrations run automatically on app start
- Default user ID is `"default_user"` (will be replaced in auth phase)
- All routes are force-dynamic to ensure fresh data during development
- The app uses a calm, minimal design aesthetic
- No external dependencies for styling (pure Tailwind)

---

Built with ❤️ as a learning-first project.


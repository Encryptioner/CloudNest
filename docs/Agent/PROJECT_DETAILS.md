# Project Details

> One-page reference for AI agents working on the CloudNest codebase.

## What Is This?

A client-side Google Drive dashboard that aggregates multiple accounts into one unified interface. Runs as a static site on GitHub Pages — no backend, no server, no database.

## Workspace Map

```
CloudNest/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout (ThemeProvider, AuthProvider, ToastProvider)
│   ├── page.tsx            # Landing page
│   ├── setup/              # Setup wizard (Client ID + OAuth)
│   ├── docs/               # In-app documentation
│   └── dashboard/
│       ├── layout.tsx      # Dashboard layout (AuthGuard, Sidebar, Navbar)
│       ├── page.tsx        # Overview (stats + recent files)
│       ├── files/          # File browser with full operations
│       ├── shared/         # Shared-with-me files
│       ├── trash/          # Trash management
│       ├── stats/          # Analytics (Recharts)
│       ├── accounts/       # Account management
│       └── settings/       # Settings + profile
├── components/             # Shared UI components
│   ├── AuthGuard.tsx       # Client-side auth redirect
│   ├── Toast.tsx           # Toast notification system
│   ├── Sidebar.tsx         # Navigation sidebar
│   ├── Navbar.tsx          # Top bar with profile
│   ├── FileList.tsx        # File grid/list view
│   ├── FileRow.tsx         # Single file row + type icons
│   ├── AccountCard.tsx     # Account quota display
│   ├── StorageBar.tsx      # Aggregated storage bar
│   └── UploadZone.tsx      # Drag-and-drop upload area
├── contexts/               # React Context providers
│   ├── AuthContext.tsx      # Auth state (clientId, accounts, tokens)
│   ├── ThemeContext.tsx     # Dark/light theme toggle
│   └── UploadContext.tsx    # Upload queue + drag overlay + confirm dialog
├── hooks/                  # Custom React hooks
│   ├── useDrive.ts         # Drive operations (wraps services/drive.ts with auth)
│   ├── useFiles.ts         # File listing with IndexedDB cache
│   ├── useStorage.ts       # Per-account storage quotas
│   └── useStats.ts         # Computed analytics from file metadata
├── services/               # Pure logic (no React)
│   ├── auth.ts             # Google Identity Services OAuth wrapper
│   ├── drive.ts            # Google Drive API wrapper (gapi + REST)
│   ├── storage.ts          # localStorage abstraction
│   └── fileCache.ts        # IndexedDB file metadata cache (via idb)
├── types/
│   ├── index.ts            # Shared TypeScript interfaces
│   └── gis.d.ts            # Google Identity Services type declarations
├── public/                 # Static assets (favicon, robots.txt, sitemap, 404.html)
├── docs/Agent/             # AI agent documentation (this directory)
├── ai/                     # Per-ticket specs, plans, tests
└── .github/workflows/      # GitHub Actions deploy workflow
```

## Data Flow

```
Browser → Google Identity Services (OAuth popup)
       → Access Token stored in localStorage
       → gapi.client.drive (file listing, metadata)
       → Drive REST API (file upload via XHR)
       → IndexedDB cache (file metadata for offline browsing)
       → React state (UI rendering)
```

## Key Conventions

- All Google API calls go through `services/drive.ts` — never call gapi directly from components
- Auth state managed by `AuthContext` — hooks read from context, never from localStorage directly
- File operations use `useDrive()` hook which auto-injects the correct account token
- Upload routing: `drive.pickBestAccount()` selects the account with the most free space

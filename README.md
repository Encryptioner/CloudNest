# CloudNest

Unified dashboard that aggregates multiple Google Drive accounts into a single storage pool. Runs entirely in your browser — no server, no backend, no installation required.

> **[Try CloudNest](https://encryptioner.github.io/CloudNest/)** — free, open source, works right in your browser.

---

## What is CloudNest?

Google gives every account **15 GB free**. CloudNest lets you combine as many accounts as you want into one unified interface — effectively giving you N x 15 GB of free cloud storage. Every upload automatically routes to the account with the most available space.

---

## Features

- **Unified storage pool** — one dashboard for all your Drive accounts
- **Smart upload routing** — Least-Used-Space strategy picks the best account
- **Folder navigation** — full hierarchy, breadcrumbs, grid & list views, search, filters
- **Drag-to-folder** — drag a file and drop it into any folder
- **Shared with me** — browse files others have shared with your accounts
- **Trash management** — restore or permanently delete
- **Analytics** — storage by account, file type charts, upload activity
- **Dark / light theme**
- **Runs in your browser** — no server, no Docker, no backend
- **Your data stays yours** — stored in your browser and your own Google Drive
- **100% open source, $0 cost**

---

## Quick Start

### Option A: Use the hosted version

Visit **[encryptioner.github.io/CloudNest](https://encryptioner.github.io/CloudNest/)** and follow the setup wizard.

### Option B: Run locally

```bash
git clone https://github.com/Encryptioner/CloudNest.git
cd CloudNest
pnpm install
pnpm run dev
```

Then open [http://localhost:3000/CloudNest](http://localhost:3000/CloudNest).

**Prerequisites:** Node.js 24+, pnpm

---

## Google Cloud Setup

You need a free Google Cloud project to connect your accounts. The in-app setup wizard walks you through each step, but here's the overview:

1. Go to [Google Cloud Console](https://console.cloud.google.com) and create a new project
2. Enable the [Google Drive API](https://console.cloud.google.com/apis/library/drive.googleapis.com)
3. Configure the [OAuth consent screen](https://console.cloud.google.com/apis/credentials/consent) — choose External, add your Google accounts as test users
4. Create [credentials](https://console.cloud.google.com/apis/credentials) — OAuth client ID — Web application
5. Add `https://encryptioner.github.io` as an authorized JavaScript origin (and `http://localhost:3000` for local dev — the basePath `/CloudNest` is not needed in the origin)
6. Copy the Client ID and paste it into CloudNest

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 24, pnpm |
| Framework | Next.js 15 (App Router, static export) |
| UI | React 19, Tailwind CSS 3 |
| Drive API | Google Identity Services + gapi client |
| Storage | localStorage + IndexedDB (via idb) |
| Linting | ESLint 9 (flat config) + typescript-eslint |
| Deployment | GitHub Pages via GitHub Actions |

---

## Known Limitations

- **Token expiry:** Google OAuth tokens last ~1 hour. CloudNest attempts silent re-authentication, but you may occasionally need to re-authorize
- **Testing mode:** Each Google Cloud project in testing mode supports up to 100 test users
- **Browser storage:** Data is stored in your browser's localStorage and IndexedDB. Clearing browser data will require re-setup
- **No offline mode:** File operations require an internet connection to reach Google Drive

---

## Security

- No data is stored on any server — everything stays in your browser and your own Google Drive accounts
- Access tokens are short-lived (~1 hour) and stored in localStorage
- You provide your own Google Cloud Client ID — CloudNest has no shared secrets
- The source code is fully auditable

---

## Contributing

Contributions welcome! Please open an issue or pull request on [GitHub](https://github.com/Encryptioner/CloudNest).

---

## License

MIT

---

<sub>Inspired by [saimon4u/Drive-Pool](https://github.com/saimon4u/Drive-Pool)</sub>


---

## Support

If you find my work useful, consider supporting it:

[![SupportKori](https://img.shields.io/badge/SupportKori-☕-FFDD00?style=flat-square)](https://www.supportkori.com/mirmursalinankur)

# Original Requirement — DP-3

**Date:** 2026-03-29
**Source:** User (Ankur)

> create a service or something like that to handle google analytics event. all event will pass param there. now for param event etc everything needs to be typed. So no wrong type etc goes there. After that using google chrome mcp, ensure all the necessary tracking for all event can be done easily in google analytics

## Additional Requirement (added during implementation)

> Do a quick check to ensure user's personal data not to be shared

**Constraint:** No PII (emails, file names, file IDs, access tokens, client IDs) may be sent to Google Analytics. Error messages must be sanitized to strip emails before sending.

## Context
- Google Analytics is already set up with measurement ID `G-L4QKJV3Q1H` in `app/layout.tsx`
- Currently only page views are tracked — zero custom events exist
- No `services/analytics.ts` or similar exists
- The app has ~75 interaction points across 13 files that should be tracked

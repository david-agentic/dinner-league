# For Daood — one thing blocks launch

The app code is complete (Phase 1 + 2). Deploys fail for exactly one reason:
**the two Cloudflare secrets are not in GitHub.** CI confirmed both read as missing.

## The fix (2 minutes, must be this exact place)
github.com/david-agentic/dinner-league → **Settings** (of the REPO, not your profile)
→ left sidebar **Secrets and variables** → **Actions** → green button **"New repository secret"**
(⚠️ the **Secrets** tab, not the Variables tab)

1. Name: `CLOUDFLARE_API_TOKEN` — value: the pages-deploy token from Cloudflare
   (if you lost it: Cloudflare → My Profile → API Tokens → create it again, same settings)
2. Name: `CLOUDFLARE_ACCOUNT_ID` — value: from Cloudflare dashboard right sidebar

Then tell Claude "secrets added" — a trigger push deploys everything.
(Or: repo → Actions tab → newest run → "Re-run all jobs".)

## What got built while you were away
- Self-reporting CI: every deploy posts its log to GitHub issue #1 (label `ci-log`)
- Crown-steal takeover: full-screen coronation when the leaderboard king changes
- ⚡ Same-as-last-time: one-tap prefill of the add-meal form
- Trophy room: per-person 👑👻🍛🥤 collection from completed months
- 😈 Roast card: canvas-generated shareable image of the month's Ghost (Web Share / download)

## Still needed after launch (deliberately not coded yet — untested code shouldn't stack)
- Live smoke test: PIN → add real dinner → second phone sees it
- Rotate the GitHub token (it was pasted in chat)
- Phase 3b: WhatsApp parser, invites (Wrapped + settle-ups are DONE)

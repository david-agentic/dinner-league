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


## Update (autonomous session 2)
Built: members management, meal editing, WhatsApp message parser (regex, Urdu/English),
full standings on home, archived members (history preserved), CI test gate.
Push notifications NOT built — they need VAPID keys added as Cloudflare env vars
(only you can add env vars). When wanted: I generate the keypair, you paste two vars, I wire it.


## Update (session: philosophy → dual-track)
Governance is complete and deliberately small: EXPERIENCE.md, NON_GOALS.md, LAB.md,
FOUNDER_PLAYBOOK.md. Dual-track adopted: Core ships on evidence, Lab quarantines ideas.
NO MORE PHILOSOPHY until LAB.md has real observations in it. The app is feature-complete
for v1. The only remaining pre-launch essential (sub-10s logging, measured on a real thumb)
needs humans. Next action is not code — it's sending the link + PIN to the group.

# Dinner League 🍛👑

> **Protect the Core Loop. Everything else is negotiable.**
> Core Loop: Open → Know what's happening → Log dinner → Split → Smile → Close.
>
> **Dual-track development:** Track A (Core) ships only on evidence. Track B (Lab) captures
> ideas and quarantines them until evidence promotes them. See LAB.md.

Arcade-style dinner bill tracker for the office crew. PWA + Cloudflare Pages Functions + Neon Postgres.

## Live pipeline
Instruction in chat → Claude edits code → push to `main` → Cloudflare Pages auto-deploys (~60s) → refresh app on phone.

## Cloudflare Pages setup (one time)
1. Workers & Pages → Create → **Pages** → Connect to Git → `dinner-league`
2. Framework preset: **None** · Build command: *(empty)* · Build output directory: **public**
3. Settings → Environment variables (Production):
   - `DATABASE_URL` = Neon connection string
   - `APP_PIN` = group PIN (pick any 4-8 digits)
4. Deploy. Open the `*.pages.dev` URL on phone → Add to Home Screen.

## Architecture
- `public/` — static PWA (vanilla JS, no build step)
- `functions/api/[[route]].js` — API (Pages Functions), Neon serverless driver
- Schema auto-creates + seeds on first `/api/state` call. No migrations needed for v1.

## Governance (deliberately minimal — 3 files, not nine)
- `EXPERIENCE.md` — the soul + the Golden Rules + the feature scorecard (the gate)
- `NON_GOALS.md` — what we refuse to be + the KILL LIST
- `LAB.md` — dual-track: Core observations/experiments + quarantined Ideas Lab
- `FOUNDER_PLAYBOOK.md` — reusable decision principles (not app-specific; for the founder)
Nine foundation files would be process bloat for a solo/5-user app. These two carry it.

## Business rules (locked)
- Guest rule: `people.can_pay=false` (Saad). Guests attend, never pay; their share splits among attending payers.
- Split: `total / count(attending payers)`. Payer credited full bill.
- Two-number model: podium/crown = current-month "season" score (glory, resets); hero card + League + settle-ups = lifetime real balance (money, never resets).
- Settlements: `from` pays `to` cash → from +amount, to −amount. Guests cannot settle.
- Wheel: weighted by month debt + 300 base. Suggestion only — never touches balances.

## Roadmap
- [x] Phase 1: synced ledger, podium, league, wheel, add-meal, PIN gate, PWA
- [x] Phase 2: crown-steal moment, trophy room, smart defaults, roast cards
- [x] Phase 3a: settle-ups (API+UI), dual balance model, Monthly Wrapped, money-math tests
- [x] Phase 4: members management (add/rename/guest-toggle/archive), meal editing, full home standings, WhatsApp text parser, CI test gate
- [x] First 30 Seconds: 4-card intro ending on Add screen, once per person, success = first meal logged
- [x] Delight batch: badges/achievements engine (12 badges + unlock animation), prediction mini-game (clout points), WebAudio sound FX, dinner-personality panel, food-rain easter egg (tap logo 5x), random food-fact surprises
- [ ] Push notifications (needs VAPID keys as env vars — see NEXT_STEPS)
- [ ] Invites/multi-group (commercial tier, parked)
- [ ] Khata Heist (parked until daily usage proven)
- [ ] Parked: Khata Heist (until daily usage proven)

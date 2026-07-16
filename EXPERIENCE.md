# EXPERIENCE.md — the soul of Dinner League

One page on purpose. If this grows past a page, we've lost the plot.

## What this app is
A game with a ledger inside — not a ledger with badges stapled on.
Money happens in the background. Experience is the product.
Five hungry friends should *want* to open it, not *have* to.

## The Golden Rules (a feature that breaks one is rejected)

**The 10-Second Rule.** Recording tonight's dinner takes ~10 seconds. No feature may
make it slower — unless it improves the experience so much that users gladly accept the
extra time. Otherwise: redesign or reject.

**Fun-After-Action.** The action comes first, the celebration second. Log the dinner,
THEN the confetti. Never make someone sit through delight before they can do the thing.

**The Grandma Rule.** If you can't explain why a feature exists to your grandmother in
one sentence, it probably shouldn't exist.

**The Friday Night Rule.** Picture five hungry friends outside a restaurant. Would they
appreciate this feature right now, or want to skip it? Design for that exact moment.

**Invisible Complexity.** The engine may hold a thousand rules. The interface should
feel like five. Complexity lives inside the code, never on the screen.

**The Campfire Rule.** Picture five friends waiting for dinner. When someone says "wait,
let me open Dinner League," everyone should be *glad* they did — because opening it made
the moment better, not because money needs settling. A feature that improves the *meal*
beats a feature that only improves the *bookkeeping*.

**The 80/20 Rule.** 80% of sessions should finish without touching a settings screen.
Great defaults beat endless configuration. If users must configure before enjoying, the
default experience is too weak.

**The Pocket Rule.** Pull it out, use it in under a minute, put it away. The app never
demands attention longer than necessary. The meal is the experience; the app enhances it.

## The feature gate (score before building)
Weighted to protect the core loop above all else.
| Question | Weight |
|---|---|
| Does it improve the core loop? | +5 |
| Does it reduce friction? | +4 |
| Does it increase delight? | +3 |
| Will users discover it naturally? | +2 |
| Is it simple to maintain? | +2 |
| Does it increase cognitive load? | −5 |
| Does it slow the core flow? | −5 |
| Does it require constant maintenance? | −3 |
| Does it duplicate an existing feature? | −4 |

Below threshold → reject, or redesign until it clears.
Every feature carries: one practical benefit, one emotional benefit, one small surprise.

## The Evidence Gate (POST-LAUNCH ONLY — read the phase note)
Before building any feature, answer:
1. Which user problem does this solve?  2. Who experienced it?  3. How often?
4. How will we know it worked?  5. What metric improves?  6. How do we remove it if it fails?
If these can't be answered → delay.

**Phase note (critical):** The Evidence Gate needs usage data, so it only switches ON
*after launch*. Applied to a zero-user app it would block everything, including good
ideas. Pre-launch rule: build the obvious core-loop essentials on reasoning alone. The
moment the group has used the app for a week, the Evidence Gate turns on and governs
every new feature from then on — no exceptions, not even for high-scoring ideas.

## Success metric for a new-user flow
Not "finished onboarding." → "completed the first meaningful action" (logged first meal).
Measure outcomes, not screens.

## The re-earn principle
No feature earns its place once. It must keep earning it. If users don't use it,
remove it — even if it took weeks to build. See NON_GOALS.md → KILL LIST.

## Founder mindset
Vision like a billion-dollar company. Planning like a startup.
Building like a craftsman. Shipping like an indie dev.
Improving: let real user behavior decide what stays.

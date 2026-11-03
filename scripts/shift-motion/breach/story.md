# Film 2 · "Your vendor's vendor got breached"

Phase 1 beat list (product-film skill). Text strategy: full-frame title cards between acts
(stone palette, amber accent, Overused Grotesk). Escalation: detect → reach → trace → act.
Offline: `../breach-offline.html?play` (29.7 s). Contact sheet: `offline-v1-sheet.png`.

| # | Act | Beat (what happens) | Screen that proves it | Live change on screen |
|---|---|---|---|---|
| 0 | Open | Card: "Your vendor's vendor just got breached." Chain: your company → Vercel → Context.ai (breached) | title | — |
| 1 | Detect | The dashboard builds; camera pushes into Recent Findings | 01 dashboard | Rows move down; "Context.ai Compromise · Vercel Credential Exposure" lands on top |
| 2 | Detect | Cursor clicks the new finding | 01 | Selected-row tint |
| 3 | Reach | Card: "It reaches three of your vendors." | title | — |
| 4 | Reach | Threat Center builds on the Context.ai alert; push into Impacted Vendors | 05 threat center | Rows fill in: Vercel (Confirmed · Critical) → Retool, Loom (Confirmed) → Supabase, Linear (Potential) |
| 5 | Trace | Click Vercel; its impact panel slides in | 05 → walk-10 | Drawer opens on the click; Impact Analysis: Critical — Stripe, Twilio, Segment API keys exposed |
| 6 | Trace | Camera moves to the panel's access graph; click Investigate | walk-10 | Cursor + click |
| 7 | Trace | Card: "Vercel holds your Stripe, Twilio and Segment keys." | title | — |
| 8 | Trace | Vercel access graph builds; push into identities → permissions | walk-14 | Stripe Secret Key, Twilio Auth Token, Segment Write Key un-fade one by one |
| 9 | Act | Card: "Triage starts in one click." | title | — |
| 10 | Act | Threat Center; push into Remediate + triage | 05 | Click Remediate → Retool and Loom go Open → In Progress |
| 11 | End | Shift mark + "Agent-led third-party security, with people accountable for the decisions." | title | — |

## Product truth (checked)
- Vercel's score is A 92; its graph reaches API keys, not Customer PII.
- Assessments are the pre-access approval gate, not remediation, so they stay out of this film.

## Open issues seen in offline v1 (2026-10-18)
- w14 is a walkthrough frame: the graph sits in a modal over a dimmed page, and the bottom of the frame is soft/cut. Decide: keep the modal look, or crop to the modal.
- 05 "Remediate + triage" push-in (FIX view) runs past the page's right edge, so grey shows on the right.
- Walkthrough frames (w10, w14) are softer than the case-study stills.

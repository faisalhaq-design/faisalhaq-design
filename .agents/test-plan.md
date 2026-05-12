# Test Plan — 3D Seamless Slide Portfolio (PR #1)

**Target:** https://faisalhaq-design-rteihzvg.devinapps.com

**What changed (user-visible):** Brand-new static portfolio site: a 10-slide deck with 3D seamless transitions, glass-morphic cards, animated cosmic background, and keyboard/wheel/dot/swipe navigation. Repo was empty before this PR.

## Scope

ONE primary end-to-end flow (slide-deck navigation correctness + content accuracy) plus one regression-style responsive check.

Why this is adversarial: the slide engine in `script.js` is the single biggest risk surface — if any of `is-active`/`is-prev`/`is-next` class wiring, the counter, the dot indicator, or the keyboard handler is wrong, this flow produces visibly different output (wrong slide visible, wrong counter, wrong dot, slide doesn't change, etc.). If it were broken, the same sequence of key-presses would NOT produce the screenshots below.

---

## Test 1 — End-to-end keyboard navigation through all 10 slides (PRIMARY)

**Setup:** Open https://faisalhaq-design-rteihzvg.devinapps.com in a maximized browser. Wait for slide 1 to render.

| # | Action | Expected (pass criteria) |
|---|---|---|
| 1.1 | Initial load | Top-right counter shows **`01 / 10`**. Active dot (the wider/gradient one) is the **1st** dot. Slide heading region shows **"Faisal Haqqani"** (large display + outline). |
| 1.2 | Press `→` | Counter shows **`02 / 10`**, 2nd dot is active, visible heading reads **"Driving outbound pipeline, one structured conversation at a time."** with eyebrow **"01 · PROFESSIONAL SUMMARY"**. |
| 1.3 | Press `→` | Counter **`03 / 10`**, 3rd dot active. Visible content: heading **"Four pillars that compound into pipeline."** and exactly **4 value cards** titled `Pipeline Generation`, `Message Strategy`, `CRM Discipline`, `Analytical Edge`. |
| 1.4 | Press `→` | Counter **`04 / 10`**, 4th dot active. Heading **"From content workflows to outbound revenue."** Visible 5 timeline cards with years `2019 – 2021`, `2023`, `2024`, `2025 – Now`, `2026`. |
| 1.5 | Press `→` | Counter **`05 / 10`**, 5th dot active. Heading **"Outbound execution at the front of the funnel."** Exactly 2 experience cards titled `Flowmingo AI` and `Skillstory`. Flowmingo badge text is `2025 – NOW`; Skillstory badge is `JAN – MAR 2026`. |
| 1.6 | Press `→` | Counter **`06 / 10`**, 6th dot active. Heading **"Coaching, performance marketing & content craft."** 3 cards: `Sinergi Business Solution`, `Healthina Indonesia`, `Markaz Inayah`. |
| 1.7 | Press `→` | Counter **`07 / 10`**, 7th dot active. Heading **"Formal foundations & applied design training."** 2 cards: `Sekolah Tinggi Agama Islam Sabili Bandung` and `MySkill Indonesia`. |
| 1.8 | Press `→` | Counter **`08 / 10`**, 8th dot active. Heading **"Validated craft, measurable wins."** 2 cert cards: `HubSpot Sales Hub Software Certified` (ribbon `HUBSPOT ACADEMY`) and `Best Final Project — UI/UX Design Batch 21` (ribbon `MYSKILL INDONESIA`). HubSpot credential `37a937f6bb41465d86272e82e14877d0` and MySkill cert `264965/UIX/LM/7/2025` both visible. |
| 1.9 | Press `→` | Counter **`09 / 10`**, 9th dot active. Heading **"The stack behind every outbound motion."** 4 skill groups: `SALES & CRM`, `DATA & ANALYSIS`, `DESIGN & MARKETING`, `LANGUAGES`. `HubSpot`, `Apollo`, `Figma`, `Canva`, and `English — Intermediate`, `Bahasa Indonesia — Native` chips visible. |
| 1.10 | Press `→` | Counter **`10 / 10`**, 10th (last) dot active. Heading **"Available for SDR, BDR & AE-track roles — remote or hybrid."** Contact card shows `contact.faisalhaq@gmail.com`, `linkedin.com/in/faisalhaqq`, `+62 851 4360 6501`, and a gradient `Start a conversation →` CTA. |
| 1.11 | Press `→` one more time | Counter STAYS at **`10 / 10`** (no wrap, no crash). Active dot stays on the last dot. |
| 1.12 | Press `Home` | Counter returns to **`01 / 10`**. Slide 1 cover visible again. |

**Adversarial guard:** if the slide engine doesn't update `is-active`, the wrong slide stays opaque — i.e. step 1.2 onward would still show "Faisal Haqqani" cover. If the counter is desynced from the slide engine, the counter would advance but the content wouldn't (or vice versa). Either failure mode is visually obvious from the recording.

## Test 2 — Dot click jumps directly to slide (PRIMARY · independent nav)

After step 1.12, click the **5th dot** in the bottom dot bar.

**Expected:**
- Counter shows **`05 / 10`**.
- 5th dot is active (wide gradient).
- Visible heading: **"Outbound execution at the front of the funnel."**

**Adversarial guard:** if `goTo()` is wired only to arrow keys, dots wouldn't jump → counter would still say `01 / 10` after click. This catches "keyboard nav happens to work, but no other input does" regressions.

## Test 3 — Prev button works after clicking forward (PRIMARY · independent nav)

From slide 5 (after Test 2), click the circular **prev (←)** button in the bottom control bar once.

**Expected:**
- Counter shows **`04 / 10`**.
- 4th dot is active.
- Heading: **"From content workflows to outbound revenue."**

**Adversarial guard:** confirms `prevSlide()` decrements correctly and doesn't skip / overshoot. A broken decrement (e.g. accidentally calling `nextSlide`) would produce slide 6, not 4.

## Test 4 — Responsive: mobile width collapses grids (REGRESSION)

Open Chrome DevTools, toggle device toolbar, set viewport to **375 × 812** (iPhone-class).

Navigate to slide 3 (`Four pillars that compound into pipeline.`).

**Expected:**
- The 4 value cards are stacked in a **single column** (not 4-wide).
- All 4 card titles remain readable, none clipped.
- Bottom dot bar + prev/next buttons remain visible and tappable.

**Adversarial guard:** if the `@media (max-width: 760px)` rule was removed or broken, value cards would still try to be 4-wide at 375px and would either overflow horizontally or be unreadably narrow.

---

## What is NOT in scope

- Visual fidelity of 3D tilt micro-animation (subjective, low risk).
- Cross-browser regression beyond Chrome (single-browser scope is acceptable for this PR).
- Touch swipe (no touch device available — would require dispatching synthetic touch events, low ROI).
- Wheel-scroll navigation (covered transitively by Test 1 keyboard; throttling/lock isn't critical).
- Lint / unit tests — none exist in this empty repo; CI shows 0 checks.

## Evidence to capture

- One continuous screen recording covering Test 1 → Test 2 → Test 3 → Test 4.
- Per-slide screenshots in the report (10 stills from Test 1 + the responsive mobile shot).

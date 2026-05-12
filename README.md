# Faisal Haqqani — Portfolio

Slide-based portfolio for **Faisal Haqqani** (Sales Growth · SDR · Business Development), rendered as a single-page web app with 3D slide transitions.

## Stack

- Pure HTML, CSS, and a small vanilla-JS slide engine. No build step, no dependencies.
- 3D slide transitions using CSS `perspective` + `transform-style: preserve-3d`.
- Glass-morphic cards with cursor-driven tilt.
- Animated background (aurora gradients, parallax grid floor, starfield).
- Keyboard, wheel, click and swipe navigation.
- Responsive down to mobile widths. Respects `prefers-reduced-motion`.

## Slides

1. Cover — name, title, contact metadata.
2. Professional Summary.
3. Core Value — 4 cards.
4. Experience Timeline — 5 stops.
5. Recent Roles — Flowmingo AI & Skillstory.
6. Earlier Roles — Sinergi, Healthina, Markaz Inayah.
7. Education.
8. Certifications & Achievements — HubSpot Sales Hub + MySkill UI/UX.
9. Tools & Skills.
10. Focus & Contact.

## Running locally

It's a static site — open `index.html` directly, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Controls

| Action | Keys |
| --- | --- |
| Next slide | `→`, `↓`, `Space`, `PageDown` |
| Previous slide | `←`, `↑`, `PageUp` |
| First / last slide | `Home` / `End` |
| Fullscreen | `F` |

You can also click the prev/next buttons, click dots, scroll the wheel, or swipe on touch devices.

## File map

- `index.html` — slide structure & content
- `styles.css` — 3D scenes, glass cards, animated background
- `script.js` — slide engine, keyboard/wheel/touch nav, tilt parallax

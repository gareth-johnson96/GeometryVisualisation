# GeometryVisualisation – Project Instructions

## Overview

GeometryVisualisation is a **portable, browser-based** interactive geometry tool aimed at secondary school students (KS2–KS5). It runs entirely from a USB drive in any modern web browser — no installation, no Docker, no internet connection required.

---

## Architecture Decisions

### Technology Stack

| Layer | Choice | Rationale |
|---|---|---|
| Runtime | Static HTML + CSS + JavaScript | Zero installation; open any `index.html` in a browser |
| Interactivity | [p5.js](https://p5js.org/) (bundled locally) | Easy Canvas-based drawing with mouse/touch events; no build step required for end-users |
| Testing | [Jest](https://jestjs.io/) + [jest-canvas-mock](https://github.com/hustcc/jest-canvas-mock) | Industry-standard JS testing; runs via Node locally for CI |
| Bundling (optional) | None required for basic usage | All JS files can be included via `<script>` tags from the local folder |
| CI | GitHub Actions | Automated test runs on every PR |

> **Why p5.js?**  A single, self-contained library that handles canvas drawing, mouse/touch dragging, animation loops, and maths helpers. Alternatives like D3.js are better suited to data visualisation; Three.js adds unnecessary 3D complexity. p5.js is also widely taught in educational settings.

> **Why static HTML?**  Enables true USB portability — drag the folder onto any PC and open `index.html`. No Node, Python or Java is needed at runtime.

---

## Project Structure (Target)

```
GeometryVisualisation/
├── index.html                   # Main entry point / topic menu
├── css/
│   └── styles.css
├── js/
│   ├── lib/
│   │   └── p5.min.js            # Bundled locally (no CDN needed)
│   ├── common/
│   │   ├── utils.js             # Shared maths helpers
│   │   └── ui.js                # Shared UI components (sliders, labels)
│   ├── circleTheorems/
│   │   ├── sketch.js            # p5.js sketch for interactive circle
│   │   └── proofs.js            # Animated step-by-step proofs
│   ├── polygonAngles/
│   │   └── sketch.js
│   └── trigonometry/
│       └── sketch.js
├── tests/
│   ├── utils.test.js
│   ├── circleTheorems.test.js
│   ├── polygonAngles.test.js
│   └── trigonometry.test.js
├── package.json                 # Dev dependencies (Jest) — NOT needed at runtime
├── INSTRUCTIONS.md              # This file
└── README.md
```

---

## Developer Setup (contributing / running tests)

```bash
# 1. Clone the repository
git clone https://github.com/gareth-johnson96/GeometryVisualisation.git
cd GeometryVisualisation

# 2. Install dev dependencies (Node.js ≥ 18 required)
npm install

# 3. Run tests
npm test

# 4. Open the app
#    Simply open index.html in any browser — no server needed.
#    On Linux/macOS:
open index.html
#    On Windows: double-click index.html in File Explorer
```

---

## Running from a USB Drive

1. Copy the entire repository folder onto a USB drive.
2. On any PC, plug in the USB drive and open `index.html` with any modern browser (Chrome, Firefox, Edge, Safari).
3. No internet connection is needed — all libraries are bundled locally.

---

## Topic Modules

### 1. Circle Theorems (Interactive)
Users place and drag points on or around a circle and see how theorem angles update in real time. Theorems covered:
- Angle at centre = 2 × angle at circumference
- Angles in the same segment are equal
- Angle in a semicircle = 90°
- Opposite angles in a cyclic quadrilateral sum to 180°
- Tangent-radius angle = 90°
- Alternate segment theorem (tangent-chord angle)

### 2. Circle Theorems (Visual Proofs)
Step-by-step animated proofs for each theorem, with "Next Step" / "Previous Step" navigation and explanatory text at each stage.

### 3. Regular Polygon Angles
Visualise how interior and exterior angles change as the number of sides increases. Animate the "exterior angles sum to 360°" proof by walking around the polygon.

### 4. Trigonometry
- Unit circle showing sin, cos, tan as lengths
- Right-angled triangle with draggable angle: live sin/cos/tan values
- Sine rule and cosine rule triangles with draggable vertices

---

## Testing Strategy

- **Unit tests** for all pure maths helper functions (angle calculations, point-on-circle, etc.)
- **Sketch integration tests** using jest-canvas-mock to verify that p5.js sketches draw expected elements
- **No visual regression tests** at this stage (can be added later with Percy/Playwright)
- Tests run automatically via GitHub Actions on every push and pull request

---

## Accessibility & UX Guidelines

- All interactive elements must be keyboard-navigable where possible
- Use high-contrast colour schemes
- Label all angles and lengths clearly on-screen
- Provide a "Reset" button on every visualisation
- Mobile/tablet touch events should be supported via p5.js `touchMoved` hooks

---

---

## Planned GitHub Issues

The issues below are ready to be created in the GitHub repository. Each one is self-contained and actionable independently.

---

### Issue 1 – Project Setup & Tech Stack

**Title:** `[Setup] Initialise project structure and tech stack`

**Labels:** `setup`, `infrastructure`

**Description:**
Set up the foundational project structure so all subsequent modules have a consistent base to build on.

**Acceptance Criteria:**
- [ ] `index.html` created as the main entry point with a topic selection menu (circle theorems, polygon angles, trigonometry)
- [ ] `css/styles.css` created with a clean, accessible base stylesheet
- [ ] `js/lib/p5.min.js` downloaded and committed locally (so the app works offline/from USB)
- [ ] `js/common/utils.js` created with placeholder exported maths helpers
- [ ] `js/common/ui.js` created with placeholder shared UI component functions (labels, sliders, reset button)
- [ ] `package.json` created with Jest as the only dev dependency
- [ ] `.gitignore` updated to exclude `node_modules/`
- [ ] `README.md` updated with a brief project description and how to run it
- [ ] `.github/workflows/ci.yml` created — GitHub Actions workflow that runs `npm install && npm test` automatically on every pull request to `main` and on every push to `main` (full CI spec in Issue 2)

**Notes:**
- No internet connection should be required at runtime — bundle p5.js locally
- The app must open correctly by double-clicking `index.html` (file:// protocol)
- CI details (runner, Node version, branch protection) are specified in Issue 2 – Testing Infrastructure; this criterion ensures the workflow file is created as part of the initial project setup

---

### Issue 2 – Testing Infrastructure

**Title:** `[Testing] Set up Jest testing infrastructure and GitHub Actions CI`

**Labels:** `testing`, `infrastructure`, `ci`

**Description:**
Establish a test harness that all module authors can use, and a CI pipeline that runs tests on every pull request.

**Acceptance Criteria:**
- [ ] `package.json` configured with `"test": "jest"` script
- [ ] `jest.config.js` (or Jest config in `package.json`) configured with `testEnvironment: "jsdom"` and `jest-canvas-mock` setup
- [ ] `tests/utils.test.js` created with at least 3 passing tests for maths helpers in `js/common/utils.js` (e.g., `pointOnCircle`, `angleBetweenPoints`, `degreesToRadians`)
- [ ] `.github/workflows/ci.yml` created: runs `npm install && npm test` on push and pull_request to `main`
- [ ] All tests pass locally (`npm test`)

**Notes:**
- `jest-canvas-mock` is needed because p5.js uses the Canvas API which is not available in jsdom by default
- Tests are for dev use only; `node_modules/` is not included in the USB distribution

---

### Issue 3 – Circle Theorems: Interactive Visualisation

**Title:** `[Feature] Circle theorems – interactive draggable points`

**Labels:** `feature`, `circle-theorems`

**Description:**
Create an interactive p5.js sketch where students can drag points around a circle and see circle theorem angles update in real time.

**Acceptance Criteria:**
- [ ] A circle is drawn on screen with a visible centre
- [ ] Users can place/drag at least 3 points on the circumference
- [ ] The following theorems are implemented and selectable from a dropdown/menu:
  1. **Angle at centre** – angle at centre = 2 × angle at circumference (same arc)
  2. **Angles in the same segment** – two inscribed angles subtending the same arc are equal
  3. **Angle in a semicircle** – inscribed angle subtending a diameter = 90°
  4. **Cyclic quadrilateral** – opposite angles sum to 180°
  5. **Tangent–radius** – tangent to circle is perpendicular to the radius at the point of contact
  6. **Alternate segment theorem** – angle between tangent and chord equals inscribed angle in alternate segment
- [ ] Angles are labelled live on-screen as points are dragged
- [ ] A "Reset" button returns points to default positions
- [ ] Touch/mouse drag both work

**Notes:**
- Points should snap to the circumference when dragged (clamp to circle radius)
- Use p5.js `mousePressed`, `mouseDragged`, `touchStarted`, `touchMoved` for interaction

---

### Issue 4 – Circle Theorems: Visual Proofs

**Title:** `[Feature] Circle theorems – animated step-by-step visual proofs`

**Labels:** `feature`, `circle-theorems`

**Description:**
For each of the 6 circle theorems, provide an animated proof with explanatory text that students can step through at their own pace.

**Acceptance Criteria:**
- [ ] Each theorem has its own proof screen reachable from the circle theorems menu
- [ ] Proofs are animated with "Next Step" and "Previous Step" buttons
- [ ] Each step has an on-screen text explanation (e.g., "Isosceles triangle formed by two radii → base angles are equal")
- [ ] The construction elements (auxiliary lines, arcs, shading) are drawn incrementally
- [ ] An "Auto-play" toggle animates through steps automatically with a delay
- [ ] All 6 theorems from Issue 3 have proofs

**Notes:**
- Proofs should use the same colour palette as the interactive sketches for visual consistency
- Consider adding a "Why?" tooltip on each step for deeper explanation

---

### Issue 5 – Regular Polygon Angles Visualisation

**Title:** `[Feature] Regular polygon – interior and exterior angle visualisations`

**Labels:** `feature`, `polygon-angles`

**Description:**
Visualise how interior and exterior angles behave as the number of sides of a regular polygon increases, and prove that exterior angles always sum to 360°.

**Acceptance Criteria:**
- [ ] A slider (or +/– buttons) lets students choose the number of sides (3 to 20)
- [ ] The regular polygon is drawn and redrawn dynamically as sides change
- [ ] One interior angle and one exterior angle are highlighted and labelled with their calculated values
- [ ] Interior angle formula displayed: `(n - 2) × 180° / n`
- [ ] Exterior angle formula displayed: `360° / n`
- [ ] An animation "walks" around the polygon exterior, rotating by the exterior angle at each vertex to demonstrate that the total rotation = 360°
- [ ] A "Walk the perimeter" button triggers the rotation animation
- [ ] Touch and mouse interaction supported

**Notes:**
- For KS2/KS3, label the polygons by name (triangle, quadrilateral, pentagon, … decagon)
- For KS4/KS5, show the algebraic formula derivation as text alongside the visualisation

---

### Issue 6 – Trigonometry Visualisations

**Title:** `[Feature] Trigonometry – unit circle, right-triangle, and rules visualisations`

**Labels:** `feature`, `trigonometry`

**Description:**
Three sub-modules covering SOHCAHTOA, the unit circle, and the sine/cosine rules.

**Sub-modules:**

#### 6a – Right-Angled Triangle (SOHCAHTOA)
- [ ] A right-angled triangle with one draggable angle (0°–90°)
- [ ] Sides labelled: opposite, adjacent, hypotenuse (relative to the selected angle)
- [ ] Live display of `sin θ`, `cos θ`, `tan θ` values
- [ ] Formula highlighted: SOH CAH TOA

#### 6b – Unit Circle
- [ ] Unit circle drawn with a draggable point on the circumference
- [ ] As the point moves, display: angle θ (in degrees and radians), `sin θ` (vertical component), `cos θ` (horizontal component), `tan θ` (tangent line length)
- [ ] Colour-coded projections to the x and y axes to show cos and sin geometrically

#### 6c – Sine Rule & Cosine Rule
- [ ] A general triangle with three draggable vertices
- [ ] Automatically detect which rule applies based on known values, or let the student toggle between rules
- [ ] Display the relevant formula and show each term's value updating live

**Acceptance Criteria:**
- [ ] All three sub-modules implemented and reachable from the trigonometry menu
- [ ] Reset button on each sub-module
- [ ] Touch and mouse interaction supported

---

### Issue 7 – Packaging & USB Portability

**Title:** `[Packaging] Ensure application runs fully offline from a USB drive`

**Labels:** `packaging`, `infrastructure`

**Description:**
Verify and document that the complete application works with no internet connection, directly from a USB drive, on any PC running a modern browser.

**Acceptance Criteria:**
- [ ] All external libraries (p5.js, any fonts) are bundled locally — no CDN links in HTML
- [ ] `index.html` opens correctly using the `file://` protocol (no CORS issues)
- [ ] A `dist/` or root-level folder is cleanly organised so a non-technical user can find and open `index.html`
- [ ] Test checklist document created (manual test matrix: Windows/Mac/Linux × Chrome/Firefox/Edge)
- [ ] `README.md` includes "Running from USB" section with step-by-step instructions for non-technical users
- [ ] `package.json` `scripts` include a `"build"` command that copies required assets into a `dist/` folder if needed

**Notes:**
- Avoid any `import`/`require` module syntax that would require a local server to resolve (or use a bundler like esbuild that produces a single JS file)
- If a bundler is used, the `dist/` output must be committed to the repository so end-users don't need Node.js

---

## Learnings & Decision Log

| Date | Learning |
|---|---|
| 2026-03-19 | Repository is new and empty; Java .gitignore extended with Node.js entry for `node_modules/` |
| 2026-03-19 | Static HTML + p5.js chosen for maximum USB portability — no build tool required at runtime |
| 2026-03-19 | Jest + jest-canvas-mock chosen for testing because it runs via Node (dev-only) and is the JS testing standard |
| 2026-03-19 | GitHub web UI and gh CLI not accessible from automation; issue descriptions written into INSTRUCTIONS.md for manual creation |
| 2026-03-19 | 7 issues defined covering: setup, testing/CI, circle theorems (interactive + proofs), polygon angles, trigonometry (3 sub-modules), and USB packaging |
| 2026-03-19 | Issue 1 (Setup) updated: added `.github/workflows/ci.yml` acceptance-criteria step so CI runs on every PR from day one |

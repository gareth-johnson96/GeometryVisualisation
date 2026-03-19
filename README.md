# GeometryVisualisation

An **interactive, browser-based geometry tool** for secondary school students (KS2–KS5).  
Runs entirely from a USB drive — no installation, no internet connection required.

## Topics

- **Circle Theorems** – drag points to explore angle theorems; step through animated proofs
- **Polygon Angles** – visualise interior/exterior angles as sides increase; prove exterior angles sum to 360°
- **Trigonometry** – unit circle, right-angled triangles (SOHCAHTOA), sine rule and cosine rule

## How to Run

Simply open `index.html` in any modern browser (Chrome, Firefox, Edge, Safari).  
No server, Node.js, or internet connection is needed at runtime.

```bash
# macOS / Linux
open index.html

# Windows — double-click index.html in File Explorer
```

## Running from a USB Drive

1. Copy the entire repository folder onto a USB drive.
2. Plug the drive into any PC.
3. Open `index.html` with any modern browser.

## Developer Setup (contributing / running tests)

Node.js ≥ 18 is required for development and running tests.

```bash
# 1. Install dev dependencies
npm install

# 2. Run tests
npm test
```

## Tech Stack

| Layer | Choice |
|---|---|
| Runtime | Static HTML + CSS + JavaScript |
| Interactivity | [p5.js](https://p5js.org/) (bundled locally) |
| Testing | Jest + jest-canvas-mock |
| CI | GitHub Actions |

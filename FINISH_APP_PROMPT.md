# Prompt: Finish the Crease and Canvas Pop-Up Card Maker

## Context

You are working on **Crease and Canvas**, a React + TypeScript + Vite app (originally exported from Figma Make) that helps users design 3D pop-up cards. The codebase uses Tailwind v4, shadcn/ui, Radix UI, Framer Motion, and Lucide icons. The full UI shell, navigation, and a large component library are already in place. **Your job is to finish the half-built features and ship a coherent end-to-end flow**, not to redesign the app.

Read these files first to ground yourself:

- `src/app/App.tsx` — top-level view router (`home | upload | inspiration | instructions | layers`)
- `src/app/components/HomePage.tsx`, `UploadSection.tsx`, `AnalysisResults.tsx`
- `src/app/components/InspirationGallery.tsx`, `InstructionsView.tsx`, `MechanismDiagrams.tsx`, `InstructionDiagram.tsx`, `DiagramKey.tsx`
- `src/app/components/LayerEditor.tsx` — has the most logic and the most gaps
- `src/app/components/CardEditor.tsx` and `CardPreview.tsx` — **currently orphaned** (not imported anywhere); decide whether to wire them in or delete them
- `package.json` — three.js is **not** installed; many heavy deps are installed but unused

## What's Missing or Weak (work items, in priority order)

### 1. Make the core flow actually connect end-to-end
Right now the three entry paths (Upload, Inspiration, Scan) never converge on a finished, exportable card.

- Pipe the uploaded image from `UploadSection` → `AnalysisResults` → `LayerEditor` so users edit on top of their actual image, not a placeholder canvas that just renders the design name as text.
- The "Suggested Uses" chips in `AnalysisResults` (Birthday Card, etc.) need to be clickable and route into the next step.
- The "Generate Final Card" button at the bottom of `LayerEditor` is a dead end — wire it to a finalization view (export/preview).
- The "Scan Document" option on `HomePage` currently routes to upload; either implement a real `getUserMedia` camera flow or remove the option.

### 2. Replace the mocked image analysis
`App.tsx` fakes analysis with a hardcoded `['flower', 'heart', 'butterfly']` after a 2-second `setTimeout`. Replace with one of:

- A client-side approach using TensorFlow.js (`@tensorflow-models/coco-ssd` for objects, color-thief / a small canvas sampler for palette).
- Or stub a clean `analyzeImage(imageUrl): Promise<AnalysisResult>` service in `src/app/services/` and document the expected response shape so a real backend can be dropped in. Either way, eliminate the lie.

### 3. Build the 3D preview view (already specified)
Add a new `'preview3d'` view that renders **after** the LayerEditor:

- Two side-by-side, orbit-controllable Three.js canvases — front view and side view — of the card opened to 90°.
- Per-layer sliders for **height** (how far the layer pops up) and **z-depth** (distance from the spine fold).
- A live-updating **printable SVG template** panel showing cut lines (solid), mountain folds (dashed), and valley folds (dot-dash), reflecting the slider values.
- Add `three` and `@types/three` to `package.json`. Keep the implementation in one file: `src/app/components/Preview3D.tsx`. Use a simple `useEffect` + `requestAnimationFrame` setup; no need for `@react-three/fiber` unless you're already comfortable with it.

### 4. Real lasso / segmentation in LayerEditor
The current lasso tool draws a polyline but doesn't actually mask anything from an image. Make it:

- Render the uploaded image (or selected inspiration design) onto the canvas underneath the lasso.
- When the user closes a path, extract that region as a layer (use a clipping path on a hidden canvas to produce a per-layer image).
- Show layers as actual image thumbnails in the layers panel, not just colored swatches.
- Add **undo/redo** (a small history stack of the layers array).

### 5. Card finalization & export
Add a final view ("Your Card is Ready") that the "Generate Final Card" button leads to:

- Print-ready PDF export of the cut/fold template (one-page, sized for US Letter and A4). Use `jspdf` or `pdf-lib`; the SVG from item 3 can be embedded directly.
- PNG export of the 3D preview.
- "Open in editor" link back to `LayerEditor` so users can iterate.

### 6. Wire in (or delete) `CardEditor.tsx` and `CardPreview.tsx`
These 318 lines are dead code today. `CardPreview` already has a nice Framer Motion open/close card animation that would make a great inline preview inside the new finalization view. `CardEditor` covers text/colors/popup-layer customization that the rest of the flow currently lacks. **Either integrate them or remove them** — don't leave them orphaned.

### 7. Real inspiration content
`InspirationGallery` is currently 12 Lucide icons. Replace with real card preview images (start with 6–8 high-quality SVG/PNG illustrations matching the existing six pop-up mechanisms in `MechanismDiagrams.tsx`). Each gallery item should pre-populate a starter set of layers so "Choose a design → straight into LayerEditor" works without an upload.

### 8. Persistence
Nothing survives a refresh. Add:

- `localStorage`-backed save/load of the current design (debounced auto-save).
- A "My Cards" section on `HomePage` listing saved designs with thumbnails.
- A simple shareable URL (encode design state in a `?d=` query param, base64-compressed JSON).

### 9. Mechanism diagrams should animate
`MechanismDiagrams.tsx` shows static diagrams of the six pop-up techniques. Add a Framer Motion open/close animation toggled by a "See it move" button on each so users can preview the mechanism in action.

### 10. Polish pass
- **Mobile responsiveness:** the `lg:grid-cols-3` and `max-w-7xl` layouts collapse OK but the LayerEditor is unusable on phones. Hide the canvas on small screens behind a "Edit on a larger screen" notice, or build a touch-friendly mobile editor.
- **Accessibility:** every icon-only button needs an `aria-label`; the canvas needs a keyboard alternative or at least a stated limitation; Radix primitives already cover dialog/popover focus management — don't break it.
- **Trim deps:** `package.json` has `react-dnd`, `react-dnd-html5-backend`, `react-router`, `react-slick`, `react-popper`, `@mui/*`, `embla-carousel-react`, `recharts`, `@emotion/*` — none of these are actually imported. Remove what you don't end up using.
- **Fill in `guidelines/Guidelines.md`** with the actual conventions you adopted (file layout, naming, where shared types live, etc.).

## Engineering Guidance

- **Match existing patterns.** Components live in `src/app/components/`, shadcn primitives in `src/app/components/ui/`, styles in `src/styles/`. New shared types go in a new `src/app/types.ts`.
- **TypeScript strict-ish.** No `any` for new code. The existing `design: any` and `analysisData: any` in `App.tsx` should be replaced with proper interfaces as you touch them.
- **Use what's already installed** before adding deps: Framer Motion for animation, Radix for dialogs/popovers, Lucide for icons, sonner for toasts, react-hook-form for forms.
- **One concern per file.** If a file passes ~250 lines, split it. Helper functions go next to the component that uses them, or in `src/app/lib/` if shared.
- **Don't break the visual identity.** The serif "Crease and Canvas" wordmark, the colored letter treatment on `HomePage`, the pastel color palette — preserve them.
- **No localStorage in artifacts** (this is a Vite app, so localStorage is fine — but if you ever generate a Claude.ai artifact for prototyping, use in-memory state instead).

## Suggested Build Order

1. Define proper types (`src/app/types.ts`) for `Design`, `Layer`, `AnalysisResult`, `CardData`. Replace the `any`s.
2. Wire upload → analysis → editor end-to-end on real data (item 1).
3. Real lasso + image-backed layers in `LayerEditor` (item 4).
4. 3D preview view (item 3).
5. Finalization view + PDF/PNG export (item 5), pulling `CardEditor`/`CardPreview` in (item 6).
6. Inspiration content + animated mechanisms (items 7, 9).
7. Persistence (item 8).
8. Real or removed image analysis (item 2).
9. Polish, dep trim, accessibility, guidelines (item 10).

## Definition of Done

- A new user can land on `HomePage`, pick any of the three entry options, and end up with a downloadable PDF template + 3D preview of their card without hitting a dead end or seeing placeholder text.
- Refreshing the page restores their work.
- `npm run build` passes with no TypeScript errors.
- No orphaned components, no unused dependencies in `package.json`.
- Lighthouse accessibility score ≥ 90 on the main flow screens.

When in doubt, ask the user before introducing a new heavy dependency or changing the visual design language.

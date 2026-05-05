# Prompt: Revisions to Crease and Canvas

## Context

You're iterating on **Crease and Canvas**, a React + TypeScript + Vite app for designing pop-up cards. The previous pass added a Preview3D view, a `'preview3d'` route in `App.tsx`, and per-layer height/depth sliders. The user has reviewed it and identified six issues that need to be fixed in this pass.

**Reference asset (read this first):** `3D depth Star Card Sample/tinker.obj` is a Tinkercad export of a correctly-modeled pop-up card. It contains five objects:

- `obj_0`: an extruded **L-shape** — the right card half, two flat panels meeting at the spine. Dimensions: ~73 wide × 73 tall, ~2 thick. The card is shown opened to 90°.
- `obj_3`: a smaller L-shape — a **V-fold pop-up tab** glued to both card halves at the spine, sitting in front of the back panel.
- `obj_1`: another smaller L-shape — a second V-fold tab at a different position and height.
- `obj_2`, `obj_4`: thin, multi-vertex shapes in the yellow material — these are the **star design elements**, each mounted flat on the front face of one of the tabs.

**This is what a real V-fold pop-up looks like:** card halves at 90° → smaller folded tabs glued at the spine → decorative element mounted on each tab. The current Preview3D renders disconnected colored slabs floating in space, which is wrong.

---

## What needs to change

### 1. Fix the 3D model to render a real V-fold pop-up

Replace the current geometry in `Preview3D.tsx` so each pop-up "layer" is rendered as the V-fold pair shown in the sample — not as an isolated slab.

For the **base card**:

- Two rectangular panels (default ~140mm × 100mm × 0.5mm), hinged at a shared spine edge along the y-axis, opened to 90°.
- One panel lies flat (the "page"); the other stands up (the "back").
- Subtle paper-tone material; soft shadow underneath.

For **each layer**:

- Generate two thin rectangular **tab panels** (paper, not colored slabs) that meet at the spine and are glued flat against the inner faces of the card halves.
- The two tab panels meet each other at a forward edge — that forward edge is where the design element sits.
- The layer's `height` slider controls the tab height (how far up the back panel it reaches).
- The layer's `depth` slider controls how far forward from the spine the tab's outer edge extends.
- A thin **design-element plane** (textured with the layer's PNG/SVG) is mounted on the front-facing edge of the tab pair so it stands upright when the card is open.

Use the sample's proportions as a sanity check: the design element should sit roughly halfway between the spine and the front edge of the page, and rise to ~50–80% of the card's height. Match the sample's overall look: white paper card, colored design elements.

Camera, lighting, controls: keep the existing dual-canvas (front + side) layout and OrbitControls. Add a subtle ground plane shadow.

### 2. Reorganize navigation: persistent top nav with Learn / Create / My Cards

The current `App.tsx` uses a single `currentView` state with no shared header. Replace with a persistent top navigation bar present on every screen.

**New structure:**

```
TopNav (always visible): [Crease & Canvas logo] · Learn · Create · My Cards

Routes:
  /                          → HomePage (hero + featured content + two CTA cards: "Learn pop-up techniques" / "Start creating")
  /learn                     → InspirationGallery (rename: "Pop-Up Techniques")
  /learn/:mechanismId        → InstructionsView for that mechanism
  /create                    → CreateLanding: "Start from your image" or "Browse design elements"
  /create/upload             → UploadSection
  /create/elements           → DesignElementGallery (the 12 themes)
  /create/elements/:themeId  → DesignVariantPicker (style choices for that theme)
  /create/editor             → LayerEditor
  /create/preview            → Preview3D
  /create/export             → ExportView (PDF / PNG / save to My Cards)
  /my-cards                  → SavedCardsList (localStorage-backed)
```

Use **`react-router` (already in `package.json`)** rather than the ad-hoc view-state machine. Keep the route components small; `App.tsx` becomes the router shell + `<TopNav />`.

Important separation: the **Learn** track is purely educational (covers all 6 mechanisms, animated diagrams, step-by-step instructions). The **Create** track is the actual editor. They no longer flow into each other automatically — a "Try this in the editor" button on a Learn page can deep-link into Create with the mechanism preselected.

### 3. Mechanism scope in the editor: V-fold properly, others marked "Coming soon"

In `LayerEditor` and `Preview3D`, add a mechanism picker (small dropdown or tabs at the top). Build out **V-fold** correctly per item 1. Show the other five mechanisms (basic tab, parallel fold, box, rotating, accordion) as **disabled tiles with a "Coming soon" badge** so the architecture and UI surface are in place for later.

The mechanism picker writes to a `mechanism: 'v-fold'` field on the design state; `Preview3D` switches geometry generators based on it. For now there's only one generator; structure the code so adding `parallel-fold.ts` later is a one-file addition under `src/app/lib/mechanisms/`.

### 4. Design element flow with style variants

Add two new pages under the Create track:

- **`DesignElementGallery`** (`/create/elements`): grid of 12 themes (hearts, flowers, stars, cake, gift, sun, moon, clouds, trees, sparkles, music notes, hearts stack — same list as today's `InspirationGallery`, but in the Create track and visually treated as themes, not as inspirations).
- **`DesignVariantPicker`** (`/create/elements/:themeId`): when a theme is clicked, show 4–6 transparent-PNG **style variants** of that theme (e.g. for "Heart": minimal outline, filled solid, doodled, geometric, watercolor). Clicking a variant **immediately** routes to `/create/editor` with that PNG loaded as the starting layer. **No "Use this design" button.**

**Asset bundling:** ship the variant PNGs in `src/assets/elements/<themeId>/<variantId>.png`. Source them from royalty-free SVG sets (Iconify, Heroicons outline+solid, undraw, etc.), pre-rasterized to ~512×512 transparent PNGs. Add an `ATTRIBUTIONS.md` entry crediting each set. Aim for 4 variants per theme to start; the manifest below makes it easy to add more later.

Add `src/assets/elements/manifest.ts` exporting:

```ts
export type ElementVariant = { id: string; label: string; src: string };
export type ElementTheme = { id: string; label: string; icon: LucideIcon; variants: ElementVariant[] };
export const ELEMENT_THEMES: ElementTheme[] = [...];
```

`DesignElementGallery` and `DesignVariantPicker` both read from this manifest.

### 5. LayerEditor: design element behavior + remove "Use this design"

When the editor is opened with a design element (route state carries `{ initialElement: ElementVariant }`), drop it in as a single pre-made layer mounted on a default V-fold tab. **Keep the lasso tool available** so users can split that PNG into multiple pop-up layers if they want.

Anywhere in the current code where a "Use this design" button exists (today's `InspirationGallery` selection flow), remove it. Clicks on a design or variant tile route forward immediately.

### 6. Allow removing the uploaded image

In `AnalysisResults` (and anywhere the uploaded image is shown), add a clear **"Remove image"** / **"Start over"** button that:

- Clears `uploadedImage`, `analysisData`, `isAnalyzing` (or whatever the equivalent React Router-era state slice is).
- Routes back to `/create/upload` with the upload component reset to its empty state.

Also add a small **× close icon** on the image thumbnail itself for the same action.

### 7. Delete the Scan Document option

`HomePage` currently has Upload, Scan, and Inspiration — Scan and Upload do exactly the same thing. **Remove the Scan tile entirely** along with any unused handlers. The new `CreateLanding` has only "Start from your image" and "Browse design elements."

---

## Engineering guidance

- **Use react-router (already installed).** Replace the `currentView` state machine in `App.tsx`. Wrap the app in `<BrowserRouter>` and let routes own their own state via `useNavigate` / `useLocation`.
- **Hoist shared state with React Context.** A `<CardDesignProvider>` wrapping the Create track holds `{ uploadedImage, layers, mechanism, designElement, ... }`. Editor / Preview3D / Export read from it via a `useCardDesign()` hook. Avoid prop-drilling and avoid passing `design: any` around.
- **Replace `any` types as you touch files.** Define `Mechanism`, `Layer`, `ElementTheme`, `ElementVariant`, `CardDesign`, `AnalysisResult` in `src/app/types.ts`.
- **Three.js geometry lives in `src/app/lib/mechanisms/`.** One file per mechanism; each exports a `buildGeometry(params): THREE.Group`. `Preview3D` selects the builder by mechanism id. This is what makes adding more mechanisms later a one-file change.
- **Match existing visual identity.** Keep the serif "Crease and Canvas" wordmark, the multi-color letter treatment from the homepage, pastel palette, and the warm card feel. The TopNav should feel like part of the same design language.
- **Use installed deps.** Lucide for icons, Framer Motion for transitions between routes, sonner for toasts (e.g. "Image removed"), Radix primitives for the mechanism dropdown if you build one.
- **Keep file sizes under ~250 lines.** Split where it grows.

## Suggested build order

1. **Types + Context.** Create `src/app/types.ts` and `CardDesignContext`. Refactor existing `App.tsx` state into the context.
2. **Router.** Introduce `react-router` with the route table above. Mount `<TopNav />`. Move existing components into route components.
3. **Delete Scan tile.** Item 7.
4. **Image removal.** Item 6.
5. **Remove "Use this design" buttons.** Item 5 (button removal half).
6. **Design element gallery + variant picker + manifest + assets.** Item 4. Use 2–3 themes' worth of real PNGs to validate the flow, then fill out the rest.
7. **Mechanism picker UI + V-fold geometry rewrite.** Items 1 and 3. This is the largest item — do it once the routing and state are stable so you can iterate without distractions.
8. **Mechanism placeholder tiles.** Item 3 (the "Coming soon" tiles).
9. **Visual polish pass on the new TopNav, CreateLanding, and DesignVariantPicker.**

## Definition of done

- The new top nav appears on every screen and clearly separates Learn from Create.
- Clicking a design element theme → variant → editor takes 2 clicks, no intermediate confirmation buttons.
- The 3D preview shows a recognizable V-fold pop-up: white paper card halves at 90°, paper-toned tab(s) glued at the spine, design element(s) standing on the tabs. Sliders adjust tab height and forward depth, and the design element repositions accordingly.
- The other 5 mechanisms show as disabled "Coming soon" tiles in the editor's mechanism picker.
- Users can remove their uploaded image and return to a clean upload screen.
- No "Scan Document" tile anywhere.
- No "Use this design" buttons anywhere.
- `npm run build` passes with no TypeScript errors.

When in doubt about visual treatment of the new TopNav or CreateLanding, ask before adding new visual styles outside the current palette.

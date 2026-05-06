import type { ComponentType, SVGProps } from 'react';

// ─── Mechanism ────────────────────────────────────────────────────────────────
export type Mechanism =
  | 'v-fold'
  | 'basic-tab'
  | 'parallel-fold'
  | 'box'
  | 'rotating'
  | 'accordion';

// ─── Design (kept for compatibility with InstructionsView) ────────────────────
export interface Design {
  id: number;
  name: string;
  icon: ComponentType<SVGProps<SVGSVGElement> & { size?: number | string; strokeWidth?: number | string }>;
  color: string;    // Tailwind text class
  bgColor: string;  // Tailwind bg class
}

// ─── Element variants (Create track) ─────────────────────────────────────────
export interface ElementVariant {
  id: string;
  label: string;
  src: string;  // data URI (SVG or PNG)
}

export interface ElementTheme {
  id: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement> & { size?: number | string; strokeWidth?: number | string }>;
  color: string;   // Tailwind text class
  bgColor: string; // Tailwind bg class
  variants: ElementVariant[];
}

// ─── Layer (popup element) ────────────────────────────────────────────────────
export interface Layer {
  id: number;
  name: string;
  depth: number;            // 0–100: how far forward from spine (depth slider)
  height: number;           // 0–100: element height (size)
  width: number;            // 0–100: element width (size)
  opacity: number;          // 0–100 (retained in type, not rendered as control)
  verticalPosition: number; // 0–100: position along back panel (0=bottom/spine, 100=top)
  tabWidth: number;         // 0–100
  tabHeight: number;        // 0–100
  tabDepth: number;         // 0–100
  horizontalPosition: number; // 0–100: left/right position of the whole tab (50 = centre)
  color: string;            // hex
  colorEdited?: boolean;    // true only after the user explicitly changes the color
  selected: boolean;
  imageData?: string;       // base64 PNG of clipped canvas region
  path?: { x: number; y: number }[];
}

// ─── Image analysis ───────────────────────────────────────────────────────────
export interface AnalysisResult {
  colors: string[];
  style: string;
  complexity: 'Low' | 'Medium' | 'High';
  suggestedUses: string[];
}

// ─── Card metadata ────────────────────────────────────────────────────────────
export interface CardData {
  background: string;
  foreground: string;
  text: string;
  subtext: string;
}

// ─── Saved state (localStorage) ───────────────────────────────────────────────
export interface PersistedState {
  uploadedImage: string | null;
  selectedDesignId: number | null;
  layers: Layer[];
  cardData: CardData;
  mechanism: Mechanism;
}

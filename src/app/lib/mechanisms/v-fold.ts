import * as THREE from 'three';

// ─── Card coordinate constants (must match Card3DViewer) ──────────────────────
export const CARD_W      = 8;
export const CARD_H      = 5;
export const OPEN_ANGLE  = Math.PI / 4;   // 45° per panel → 90° total
export const PANEL_TOP_Z = CARD_H * Math.sin(OPEN_ANGLE); // ≈ 3.54
export const PANEL_TOP_Y = CARD_H * Math.cos(OPEN_ANGLE); // ≈ 3.54
export const MAX_POPUP_H = PANEL_TOP_Y * 0.85;            // ≈ 3.0

const PAPER_HEX = 0xfaf8f4;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function safeColor(hex: string): THREE.Color {
  const c = new THREE.Color();
  try { c.set(hex); } catch { c.set(0x6366f1); }
  return c;
}

function makeQuad(
  a: THREE.Vector3,
  b: THREE.Vector3,
  c: THREE.Vector3,
  d: THREE.Vector3,
  mat: THREE.Material,
): THREE.Mesh {
  const positions = new Float32Array([
    a.x, a.y, a.z,  b.x, b.y, b.z,  c.x, c.y, c.z,
    a.x, a.y, a.z,  c.x, c.y, c.z,  d.x, d.y, d.z,
  ]);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  return new THREE.Mesh(geo, mat);
}

function edgeLines(mesh: THREE.Mesh): THREE.LineSegments {
  return new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({ color: 0xcccccc }),
  );
}

// ─── Basic-tab builder ────────────────────────────────────────────────────────
//
// Cross-section (viewed along X, world space after cardGroup rotation):
//
//   wall (vertical)
//   │  ← element pasted here
//   │
//   └──────────── base (flat on back panel)
//   spine
//
// tabDepth  → length of horizontal base (how far from spine)
// tabHeight → height of vertical wall
// tabWidth  → width along X
//
// Element: coplanar with the wall, bottom edge touching the wall's bottom edge.

export interface VFoldParams {
  width:             number;  // 0–100: design element width
  height:            number;  // 0–100: design element height
  depth:             number;  // 0–100: (reserved — element is pinned to wall)
  color:             string;
  imageData?:        string;
  verticalPosition?: number;  // 0–100: shift whole tab up/down along card
  tabWidth?:            number;  // 0–100: tab width, default 50
  tabHeight?:           number;  // 0–100: vertical wall height, default 50
  tabDepth?:            number;  // 0–100: horizontal base depth, default 50
  horizontalPosition?:  number;  // 0–100: left/right offset (50 = centre), default 50
}

export function buildVFold(params: VFoldParams): THREE.Group {
  const group = new THREE.Group();

  const cosA = Math.cos(OPEN_ANGLE);
  const sinA = Math.sin(OPEN_ANGLE);

  // ── Tab dimensions ─────────────────────────────────────────────────────────
  const tabW   = Math.max(0.5, ((params.tabWidth  ?? 50) / 100) * CARD_W * 0.75);
  const h_base = Math.max(0.3, ((params.tabDepth  ?? 50) / 100) * CARD_H * 0.50);
  const h_wall = Math.max(0.3, ((params.tabHeight ?? 50) / 100) * CARD_H * 0.80);

  // ── Element dimensions ─────────────────────────────────────────────────────
  const elemW = Math.max(0.5, (params.width  / 100) * CARD_W * 0.75);
  const elemH = Math.max(0.2, (params.height / 100) * CARD_H * 0.80);

  const paperMat = new THREE.MeshLambertMaterial({ color: PAPER_HEX, side: THREE.DoubleSide });

  // ── Horizontal base ─────────────────────────────────────────────────────────
  // Lies flat on the back panel. Back-panel local direction: (0, cosA, +sinA).
  // In world space after cardGroup rotation: (0, 0, 1) — flat on the ground.
  const baseTopY = h_base * cosA;
  const baseTopZ = h_base * sinA;

  const BL  = new THREE.Vector3(-tabW / 2, 0,        0       );
  const BR  = new THREE.Vector3( tabW / 2, 0,        0       );
  const BTR = new THREE.Vector3( tabW / 2, baseTopY, baseTopZ);
  const BTL = new THREE.Vector3(-tabW / 2, baseTopY, baseTopZ);

  const base = makeQuad(BL, BR, BTR, BTL, paperMat.clone());
  base.receiveShadow = true;
  group.add(base);
  group.add(edgeLines(base));

  // ── Vertical wall ───────────────────────────────────────────────────────────
  // Hangs DOWN from the far edge of the base, opposite to the front-panel direction.
  // Local direction: (0, -cosA, +sinA) → world -Y (downward). Cross-section = step-down.
  const wallBotY = baseTopY - h_wall * cosA;
  const wallBotZ = baseTopZ + h_wall * sinA;

  const WTL = new THREE.Vector3(-tabW / 2, baseTopY, baseTopZ);
  const WTR = new THREE.Vector3( tabW / 2, baseTopY, baseTopZ);
  const WBR = new THREE.Vector3( tabW / 2, wallBotY, wallBotZ);
  const WBL = new THREE.Vector3(-tabW / 2, wallBotY, wallBotZ);

  const wall = makeQuad(WTL, WTR, WBR, WBL, paperMat.clone());
  wall.receiveShadow = true;
  group.add(wall);
  group.add(edgeLines(wall));

  // ── Design element ──────────────────────────────────────────────────────────
  // Coplanar with the wall (same plane: normal = back-panel direction = world-Z toward viewer).
  // rotation.x = -OPEN_ANGLE; local +Y = world-up, local -Y = world-down.
  // elemGeo.translate(0, -elemH/2, 0) anchors the TOP of the element at the local origin
  // so the element hangs downward from the base edge, matching the wall direction.
  // Tiny ε nudge in -normal direction (toward viewer) avoids z-fighting with the wall.
  const ε = -0.01;
  const elemGeo = new THREE.PlaneGeometry(elemW, elemH);
  elemGeo.translate(0, -elemH / 2, 0);

  let elemMat: THREE.Material;
  if (params.imageData) {
    const texture = new THREE.TextureLoader().load(params.imageData);
    texture.colorSpace = THREE.SRGBColorSpace;
    elemMat = new THREE.MeshLambertMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      alphaTest: 0.05,
    });
  } else {
    elemMat = new THREE.MeshLambertMaterial({ color: safeColor(params.color), side: THREE.DoubleSide });
  }

  // Wall normal in local space: (0, sinA, cosA) — nudge element in the opposite direction
  const elemPos = new THREE.Vector3(0, baseTopY - ε * sinA, baseTopZ - ε * cosA);

  const elemMesh = new THREE.Mesh(elemGeo, elemMat);
  elemMesh.position.copy(elemPos);
  elemMesh.rotation.x = -OPEN_ANGLE;
  group.add(elemMesh);

  const elemEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(elemGeo),
    new THREE.LineBasicMaterial({ color: 0x444444 }),
  );
  elemEdges.position.copy(elemPos);
  elemEdges.rotation.x = -OPEN_ANGLE;
  group.add(elemEdges);

  // ── Anchor wall bottom to the back panel ────────────────────────────────────
  // Lift the group so the hanging wall bottom stays at world y=0 (back panel).
  group.position.y =  h_wall * cosA;
  group.position.z = -h_wall * sinA;

  // ── Horizontal position: slide left/right along card X axis ─────────────────
  // 50% = centre (x=0), 0% = left edge (x=-CARD_W/2), 100% = right edge (x=+CARD_W/2).
  const hp = params.horizontalPosition ?? 50;
  group.position.x = ((hp / 100) - 0.5) * CARD_W;

  return group;
}

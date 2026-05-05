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
  // Two triangles: a-b-c and a-c-d
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

// ─── V-fold builder ───────────────────────────────────────────────────────────

export interface VFoldParams {
  width:             number;  // 0–100: element width as % of card width
  height:            number;  // 0–100: element height (size)
  depth:             number;  // 0–100: element depth (forward position)
  color:             string;  // hex colour for the design element
  imageData?:        string;  // base64 PNG for design element texture (optional)
  verticalPosition?: number;  // 0–100: placement along back panel (0=spine, 100=top edge)
  backPanelOffset?:  number;  // 0–5: distance along back panel surface to move back tab
}

export function buildVFold(params: VFoldParams): THREE.Group {
  const group = new THREE.Group();

  const tabW    = Math.max(0.5, (params.width  / 100) * CARD_W * 0.75);
  // h_back: distance along the back panel from spine
  const h_back  = Math.max(0.3, (params.height / 100) * CARD_H * 0.80);
  // h_front: distance along the front panel from spine (controlled by depth)
  const h_front = Math.max(0.3, (params.depth  / 100) * CARD_H * 0.80);

  // ── Paper material ──────────────────────────────────────────────────────────
  const paperMat = new THREE.MeshLambertMaterial({
    color: PAPER_HEX,
    side: THREE.DoubleSide,
  });

  // ── Back tab arm: coplanar with back card panel ────────────────────────────
  // Back panel dir from spine: (0, cos(45°), sin(45°)) = (0, 0.707, 0.707)
  // Top edge of back arm (world):
  const backTopY = h_back * Math.cos(OPEN_ANGLE);
  const backTopZ = h_back * Math.sin(OPEN_ANGLE);
  
  // Move along back panel surface (perpendicular to panel normal) to keep coplanar
  // Decompose offset into y and z components that preserve panel coplanarity
  const backPanelOffset = params.backPanelOffset ?? 0;
  const backOffsetY = 2 * Math.cos(OPEN_ANGLE);
  const backOffsetZ = 2 * Math.sin(OPEN_ANGLE);

  const downOffset = -2;

  const BL = new THREE.Vector3(-tabW / 2 , 0 + backOffsetY + downOffset,        0 + backOffsetZ - downOffset       );
  const BR = new THREE.Vector3( tabW / 2, 0 + backOffsetY + downOffset,        0 + backOffsetZ - downOffset       );
  const TR = new THREE.Vector3( tabW / 2, backTopY + backOffsetY + downOffset, -backTopZ + backOffsetZ - downOffset);
  const TL = new THREE.Vector3(-tabW / 2, backTopY + backOffsetY + downOffset, -backTopZ + backOffsetZ - downOffset);
  const backTab = makeQuad(BL, BR, TR, TL, paperMat.clone());
  
  backTab.receiveShadow = true;
  group.add(backTab);
  group.add(edgeLines(backTab));

  // ── Front tab arm: coplanar with front card panel ──────────────────────────
  // Front panel dir from spine: (0, cos(45°), -sin(45°)) = (0, 0.707, -0.707)
  const frontTopY = h_front * Math.cos(OPEN_ANGLE);
  const frontTopZ = -h_front * Math.sin(OPEN_ANGLE);

  
  const FL = new THREE.Vector3(-tabW / 2 , 0,         0       );
  const FR = new THREE.Vector3( tabW / 2, 0,         0       );
  const FTR = new THREE.Vector3( tabW / 2, frontTopY , -frontTopZ);
  const FTL = new THREE.Vector3(-tabW / 2, frontTopY, -frontTopZ);

  const frontTab = makeQuad(FL, FR, FTR, FTL, paperMat.clone());
  frontTab.receiveShadow = true;
  group.add(frontTab);
  group.add(edgeLines(frontTab));

  // ── Design element ─────────────────────────────────────────────────────────
  // Slides along world Z (parallel to the flat back panel).
  // local position (0, t, t) gives world_y=0, world_z=t·√2 for OPEN_ANGLE=π/4.
  // depth 0 → spine (world Z=0), depth 100 → far edge of back panel (world Z=CARD_H).
  const elemH = Math.max(0.2, backTopY * 0.95);
  const elemW = tabW * 0.88;
  const t = (params.depth / 100) * PANEL_TOP_Z;
  const verticalOffset = -0.5;  // adjust this value

  const elemGeo = new THREE.PlaneGeometry(elemW, elemH);
  elemGeo.translate(0, elemH / 2 + 0.05 + verticalOffset, 0);  // Add offset here

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
    elemMat = new THREE.MeshLambertMaterial({
      color: safeColor(params.color),
      side: THREE.DoubleSide,
    });
  }

  const elemMesh = new THREE.Mesh(elemGeo, elemMat);
  elemMesh.position.set(0, t + verticalOffset * Math.cos(OPEN_ANGLE), t + verticalOffset * Math.sin(OPEN_ANGLE));
  elemMesh.rotation.x = -OPEN_ANGLE;
  group.add(elemMesh);

  // Thin dark outline around design element for legibility
  const elemEdges = new THREE.LineSegments(
    new THREE.EdgesGeometry(elemGeo),
    new THREE.LineBasicMaterial({ color: 0x444444 }),
  );
  elemEdges.position.set(0, t, t);
  elemEdges.rotation.x = -OPEN_ANGLE;
  group.add(elemEdges);

  // Offset the whole group along the front panel's local surface direction (spine→top of front panel).
  // After cardGroup is rotated to lay the back panel flat, this direction is world-up,
  // so verticalPosition moves the element vertically in the viewer.
  const vp = params.verticalPosition ?? 50;
  const vpOffset = (vp / 100) * CARD_H * 0.80;
  group.position.y =  vpOffset * Math.cos(OPEN_ANGLE);
  group.position.z = -vpOffset * Math.sin(OPEN_ANGLE);

  return group;
}
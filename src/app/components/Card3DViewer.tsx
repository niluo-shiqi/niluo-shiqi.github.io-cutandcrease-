'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { buildVFold, CARD_W, CARD_H, OPEN_ANGLE, PANEL_TOP_Y, PANEL_TOP_Z } from '../lib/mechanisms/v-fold';

// ─── Public types ─────────────────────────────────────────────────────────────

export interface PopupLayer3D {
  id:                  number;
  depth:               number;   // 0–100
  color:               string;   // hex
  width:               number;   // 0–100
  height:              number;   // 0–100
  imageData?:          string;   // base64 PNG
  colorEdited?:        boolean;
  verticalPosition?:   number;   // 0–100
  tabWidth?:           number;   // 0–100
  tabHeight?:          number;   // 0–100
  tabDepth?:           number;   // 0–100
  horizontalPosition?: number;   // 0–100
}

interface Card3DViewerProps {
  layers:          PopupLayer3D[];
  cardColor?:      string;
  mechanism?:      string;   // reserved
  height?:         number | string;

  // Text shown on the card panels
  cardText?:       string;   // main greeting
  cardSubtext?:    string;   // secondary line
  cardForeground?: string;   // text colour (hex)

  // 'editor'  → always-open angled camera, tab geometry visible, no toggle
  // 'preview' → two-state (closed / open), face-on camera
  cameraPreset?: 'editor' | 'preview';

  // Controls which state is shown in preview mode.
  // Ignored in editor mode.
  isOpen?: boolean;

  // Whether to render the construction-tab geometry.
  // Defaults to true so the editor view is unchanged.
  showTabs?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function safeColor(hex: string): THREE.Color {
  const c = new THREE.Color();
  try { c.set(hex); } catch { c.set(0xfef9ef); }
  return c;
}

function disposeMesh(obj: THREE.Object3D) {
  const mesh = obj as THREE.Mesh;
  if (mesh.geometry) mesh.geometry.dispose();
  const mat = mesh.material;
  if (mat) {
    const mats = Array.isArray(mat) ? mat : [mat as THREE.Material];
    mats.forEach(m => {
      (m as THREE.MeshLambertMaterial).map?.dispose();
      m.dispose();
    });
  }
}

// Remove all direct scene children that have a given userData flag set, and
// dispose every mesh / material / texture inside them.
function removeByFlag(scene: THREE.Scene, flag: string) {
  scene.children
    .filter(o => o.userData[flag])
    .forEach(o => {
      o.traverse(child => disposeMesh(child));
      scene.remove(o);
    });
}

// ─── Card-panel texture ───────────────────────────────────────────────────────
// Draws a plain background fill + centred text onto an off-screen canvas and
// returns a CanvasTexture.  No horizontal flip or rotation is applied — both
// the closed cover panel and the open inner panel are FrontSide planes whose
// face normal points directly at the camera, so the texture renders correctly
// as-is with no orientation tricks.

function makeCardTexture(
  bgColor:  string,
  fgColor:  string,
  mainText: string,
  subText:  string,
): THREE.CanvasTexture {
  const W = 512;
  const H = Math.round(W * CARD_H / CARD_W);   // 320 px — 8∶5 aspect
  const canvas = document.createElement('canvas');
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, W, H);

  const hasMain = mainText.trim().length > 0;
  const hasSub  = subText.trim().length  > 0;

  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle    = fgColor;

  if (hasMain) {
    let sz = Math.round(W * 0.10);
    ctx.font = `bold ${sz}px Georgia,"Times New Roman",serif`;
    while (ctx.measureText(mainText).width > W * 0.85 && sz > 12) {
      sz -= 2;
      ctx.font = `bold ${sz}px Georgia,"Times New Roman",serif`;
    }
    ctx.fillText(mainText, W / 2, hasSub ? H * 0.42 : H / 2);
  }

  if (hasSub) {
    let sz = Math.round(W * 0.055);
    ctx.font = `${sz}px Arial,Helvetica,sans-serif`;
    while (ctx.measureText(subText).width > W * 0.85 && sz > 10) {
      sz -= 2;
      ctx.font = `${sz}px Arial,Helvetica,sans-serif`;
    }
    ctx.fillText(subText, W / 2, hasMain ? H * 0.62 : H / 2);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// ─── CLOSED-STATE card ────────────────────────────────────────────────────────
//
// A single vertical flat plane at z = 0, spine at y = 0, top at y = CARD_H.
// The FrontSide (+Z normal) faces the preview camera directly, so the cover
// texture renders without any face-orientation ambiguity.
//
// There is NO folded geometry, no BackSide, no angle animation — just one
// rectangle that the camera looks straight at.

function buildClosedCard(
  scene:       THREE.Scene,
  cardColor:   string,
  cardFg:      string,
  cardText:    string,
  cardSubtext: string,
): THREE.Group {
  removeByFlag(scene, 'closedCard');

  const group = new THREE.Group();
  group.userData.closedCard = true;

  const makeGeo = () => {
    const geo = new THREE.PlaneGeometry(CARD_W, CARD_H);
    geo.translate(0, CARD_H / 2, 0);   // y: 0 (spine) → CARD_H (top)
    return geo;
  };

  // ── Front face (cover) — FrontSide, faces camera ────────────────────────
  const coverMat = new THREE.MeshLambertMaterial({
    map:  makeCardTexture(cardColor, cardFg || '#1a1a1a', cardText || '', cardSubtext || ''),
    side: THREE.FrontSide,
  });
  const frontFace = new THREE.Mesh(makeGeo(), coverMat);
  frontFace.receiveShadow = true;
  group.add(frontFace);

  // ── Back face — plain card colour, prevents see-through from behind ─────
  const backMat = new THREE.MeshLambertMaterial({
    color: safeColor(cardColor),
    side:  THREE.BackSide,
  });
  group.add(new THREE.Mesh(makeGeo(), backMat));

  // ── Thin card outline ───────────────────────────────────────────────────
  const half = CARD_W / 2;
  const outlinePts = [
    new THREE.Vector3(-half, 0,       0.005),
    new THREE.Vector3( half, 0,       0.005),
    new THREE.Vector3( half, CARD_H,  0.005),
    new THREE.Vector3(-half, CARD_H,  0.005),
    new THREE.Vector3(-half, 0,       0.005),
  ];
  group.add(new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(outlinePts),
    new THREE.LineBasicMaterial({ color: 0xbbbbbb }),
  ));

  scene.add(group);
  return group;
}

// ─── OPEN-STATE card ──────────────────────────────────────────────────────────
//
// Standard V-fold two-panel geometry, exactly as used in the layer editor.
//  • cardGroup.rotation.x = π/2 − OPEN_ANGLE = π/4   (back panel flat on ground)
//  • frontPanel.rotation.x = −OPEN_ANGLE              (FrontSide → directly at camera)
//  • backPanel.rotation.x  = +OPEN_ANGLE
//
// The front panel carries the inner-page text on its FrontSide face.
// The cover is shown only in the closed state; no text is placed on BackSide here.

function buildOpenCard(
  scene:     THREE.Scene,
  cardColor: string,
): { group: THREE.Group; layerGroup: THREE.Group } {
  removeByFlag(scene, 'openCard');
  removeByFlag(scene, 'openShadow');

  const group = new THREE.Group();
  group.userData.openCard = true;
  group.rotation.x = Math.PI / 2 - OPEN_ANGLE;   // π/4 — keeps back panel flat
  scene.add(group);

  const makePlane = (mat: THREE.Material): THREE.Mesh => {
    const geo = new THREE.PlaneGeometry(CARD_W, CARD_H);
    geo.translate(0, CARD_H / 2, 0);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.receiveShadow = true;
    mesh.userData.cardPart = true;
    return mesh;
  };

  // ── Front panel — inner left page (plain — no cover text here) ──────────
  // rotation.x = −OPEN_ANGLE in the rotated cardGroup makes FrontSide point
  // directly toward the preview camera (face normal = world +Z after the
  // combined group + panel rotations cancel to (0, 0, 1)).
  // Cover text exists only in the closed state; the inner pages are plain.
  const frontInner = makePlane(new THREE.MeshLambertMaterial({
    color: safeColor(cardColor),
    side:  THREE.FrontSide,   // inner face — single-sided, no bleed-through
  }));
  frontInner.rotation.x = -OPEN_ANGLE;
  group.add(frontInner);

  // Outside of front panel — plain colour, single-sided (faces away from camera when open)
  const frontOuter = makePlane(new THREE.MeshLambertMaterial({
    color: safeColor(cardColor),
    side:  THREE.BackSide,
  }));
  frontOuter.rotation.x = -OPEN_ANGLE;
  group.add(frontOuter);

  // ── Back panel ────────────────────────────────────────────────────────────
  const backPanel = makePlane(new THREE.MeshLambertMaterial({
    color: safeColor(cardColor),
    side:  THREE.DoubleSide,
  }));
  backPanel.rotation.x = +OPEN_ANGLE;
  group.add(backPanel);

  // ── Spine crease ──────────────────────────────────────────────────────────
  const spine = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.055, CARD_W + 0.3, 10),
    new THREE.MeshLambertMaterial({ color: 0xbbbbbb }),
  );
  spine.rotation.z = Math.PI / 2;
  spine.userData.cardPart = true;
  group.add(spine);

  // Panel top-edge outlines
  const edgeMat = new THREE.LineBasicMaterial({ color: 0xcccccc });
  [-PANEL_TOP_Z, +PANEL_TOP_Z].forEach(z => {
    const pts = [
      new THREE.Vector3(-CARD_W / 2, PANEL_TOP_Y, z),
      new THREE.Vector3( CARD_W / 2, PANEL_TOP_Y, z),
    ];
    group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), edgeMat));
  });

  // ── V-fold popup layer group ──────────────────────────────────────────────
  const layerGroup = new THREE.Group();
  group.add(layerGroup);

  // ── Shadow catcher (world space — must NOT be inside the rotated group) ──
  const shadowMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(CARD_W + 4, CARD_H + 4),
    new THREE.ShadowMaterial({ opacity: 0.18 }),
  );
  shadowMesh.rotation.x    = -Math.PI / 2;
  shadowMesh.position.y    = -0.01;
  shadowMesh.receiveShadow = true;
  shadowMesh.userData.openShadow = true;
  scene.add(shadowMesh);   // direct scene child, not inside the rotated group

  return { group, layerGroup };
}

// ─── V-fold layer groups ──────────────────────────────────────────────────────

function rebuildLayers(group: THREE.Group, layers: PopupLayer3D[], showTabs: boolean) {
  while (group.children.length > 0) {
    const child = group.children[0];
    disposeMesh(child);
    group.remove(child);
  }

  layers.forEach((layer, idx) => {
    const vfoldGroup = buildVFold({
      width:              layer.width,
      height:             layer.height,
      depth:              layer.depth,
      color:              layer.color,
      colorEdited:        layer.colorEdited,
      imageData:          layer.imageData,
      verticalPosition:   layer.verticalPosition,
      tabWidth:           layer.tabWidth,
      tabHeight:          layer.tabHeight,
      tabDepth:           layer.tabDepth,
      horizontalPosition: layer.horizontalPosition,
    });

    vfoldGroup.position.x += (idx % 3 - 1) * 0.15;

    if (!showTabs) {
      vfoldGroup.traverse(obj => {
        if (obj.userData.isTab) obj.visible = false;
      });
    }

    group.add(vfoldGroup);
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Card3DViewer({
  layers,
  cardColor      = '#fef9ef',
  cardText       = '',
  cardSubtext    = '',
  cardForeground = '#1a1a1a',
  height         = 400,
  cameraPreset   = 'editor',
  isOpen,
  showTabs       = true,
}: Card3DViewerProps) {
  const mountRef       = useRef<HTMLDivElement>(null);
  const sceneRef       = useRef<THREE.Scene | null>(null);
  const closedGroupRef = useRef<THREE.Group | null>(null);
  const openGroupRef   = useRef<THREE.Group | null>(null);
  const layerGroupRef  = useRef<THREE.Group | null>(null);
  const previewModeRef = useRef(cameraPreset === 'preview');

  // Keep a ref copy of isOpen so the card-data effect can read it without
  // adding it to the dependency array (which would trigger a full rebuild on
  // every toggle — we only want to toggle visibility, not rebuild geometry).
  const isOpenRef = useRef(isOpen ?? false);
  useEffect(() => { isOpenRef.current = isOpen ?? false; }, [isOpen]);

  // ── Mount: scene, camera, renderer, OrbitControls, render loop ──────────────
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const isPreview = cameraPreset === 'preview';
    previewModeRef.current = isPreview;

    // Scene ──────────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isPreview ? 0xf0f2f5 : 0xdde2ee);
    if (!isPreview) scene.fog = new THREE.FogExp2(0xdde2ee, 0.022);
    sceneRef.current = scene;

    // Lighting ───────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, isPreview ? 0.85 : 0.7));

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
    keyLight.position.set(-4, 14, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far  = 50;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xeeeeff, 0.3);
    fillLight.position.set(6, 8, -6);
    scene.add(fillLight);

    // Grid floor (editor only) ───────────────────────────────────────────────
    if (!isPreview) {
      const grid = new THREE.GridHelper(20, 20, 0xbbbbbb, 0xdddddd);
      grid.position.y = -0.02;
      scene.add(grid);
    }

    // Camera ─────────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(isPreview ? 30 : 40, 1, 0.1, 100);
    if (isPreview) {
      // Face-on: looks straight at the card panels in both open and closed states.
      // When open  → front panel stands vertical at z=0 → camera looks directly at it.
      // When closed → cover plate stands vertical at z=0 → same shot.
      camera.position.set(0, CARD_H * 0.5, 18);
      camera.lookAt(0, CARD_H * 0.45, 0);
    } else {
      // Editor: angled view showing the open 90° card from above
      camera.position.set(5, 8, 10);
      camera.lookAt(0, 2, 2);
    }

    // Renderer ───────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);

    // OrbitControls ──────────────────────────────────────────────────────────
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    if (isPreview) {
      controls.target.set(0, CARD_H * 0.45, 0);
      controls.minDistance    = 8;
      controls.maxDistance    = 30;
      controls.minPolarAngle  = 0.1;
      controls.maxPolarAngle  = Math.PI * 0.75;
    } else {
      controls.target.set(0, 2, 2);
      controls.minDistance    = 4;
      controls.maxDistance    = 30;
      controls.minPolarAngle  = 0.05;
      controls.maxPolarAngle  = Math.PI * 0.72;
    }
    controls.update();

    // Render loop ────────────────────────────────────────────────────────────
    let frameId = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      controls.dispose();
      scene.traverse(o => disposeMesh(o));
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      sceneRef.current      = null;
      closedGroupRef.current = null;
      openGroupRef.current   = null;
      layerGroupRef.current  = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount-only

  // ── Rebuild card geometry when colour or message text changes ───────────────
  // Also runs once after mount (React calls every effect at least once).
  // isOpen is read from the ref so it doesn't appear in the dep array; the
  // visibility toggle effect handles isOpen changes without a full rebuild.
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    if (previewModeRef.current) {
      // ── Preview: build both states, show the correct one ──────────────────
      const closed = buildClosedCard(scene, cardColor, cardForeground, cardText, cardSubtext);
      closed.visible = !isOpenRef.current;
      closedGroupRef.current = closed;

      const { group: openGrp, layerGroup } = buildOpenCard(scene, cardColor);
      openGrp.visible = isOpenRef.current;
      openGroupRef.current  = openGrp;
      layerGroupRef.current = layerGroup;

      rebuildLayers(layerGroup, layers, showTabs);
    } else {
      // ── Editor: always open, single geometry ──────────────────────────────
      const { group: openGrp, layerGroup } = buildOpenCard(scene, cardColor);
      openGroupRef.current  = openGrp;
      layerGroupRef.current = layerGroup;

      rebuildLayers(layerGroup, layers, showTabs);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardColor, cardForeground, cardText, cardSubtext]);

  // ── Toggle visibility when isOpen changes (no geometry rebuild) ─────────────
  useEffect(() => {
    if (isOpen === undefined) return; // editor mode
    if (closedGroupRef.current) closedGroupRef.current.visible = !isOpen;
    if (openGroupRef.current)   openGroupRef.current.visible   =  isOpen;
  }, [isOpen]);

  // ── Rebuild popup layers when layers or showTabs changes ────────────────────
  useEffect(() => {
    if (!layerGroupRef.current) return;
    rebuildLayers(layerGroupRef.current, layers, showTabs);
  }, [layers, showTabs]);

  // ─────────────────────────────────────────────────────────────────────────────

  const isPreview = cameraPreset === 'preview';

  return (
    <div
      className="relative rounded-xl overflow-hidden border border-gray-300 shadow-inner bg-gray-200"
      style={{ height }}
    >
      <div ref={mountRef} className="w-full h-full" />

      {/* Orbit hint */}
      <div className="absolute bottom-2.5 right-3 pointer-events-none select-none">
        <span className="text-xs bg-black/40 text-white px-2.5 py-1 rounded-full">
          Drag · Scroll · Right-drag
        </span>
      </div>

      {/* Editor-only label */}
      {!isPreview && (
        <div className="absolute bottom-2.5 left-3 pointer-events-none select-none">
          <span className="text-xs bg-black/40 text-white px-2.5 py-1 rounded-full">
            90° opening · V-fold
          </span>
        </div>
      )}
    </div>
  );
}

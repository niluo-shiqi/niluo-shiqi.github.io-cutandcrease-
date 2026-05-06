import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { buildVFold, CARD_W, CARD_H, OPEN_ANGLE, PANEL_TOP_Y, PANEL_TOP_Z } from '../lib/mechanisms/v-fold';

export interface PopupLayer3D {
  id:               number;
  depth:            number;   // 0–100
  color:            string;   // hex
  width:            number;   // 0–100
  height:           number;   // 0–100
  imageData?:       string;   // base64 PNG for design element texture
  verticalPosition?: number;  // 0–100
  tabWidth?:            number;   // 0–100
  tabHeight?:           number;   // 0–100
  tabDepth?:            number;   // 0–100
  horizontalPosition?:  number;   // 0–100
}

interface Card3DViewerProps {
  layers:     PopupLayer3D[];
  cardColor?: string;
  mechanism?: string;  // future: 'v-fold' | 'basic-tab' | …
  height?:    number | string;

  // ── Preview-mode props ────────────────────────────────────────────────────
  // cameraPreset:
  //   'editor'  (default) – angled camera + OrbitControls, always open
  //   'preview' – face-on camera, no orbit, animated open/close
  cameraPreset?: 'editor' | 'preview';

  // isOpen: only used when cameraPreset='preview'.
  //   true  → animate card to fully open (90°)
  //   false → animate card to fully closed (flat)
  isOpen?: boolean;

  // showTabs: when false, hide the construction tab geometry (base + wall).
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
  mesh.geometry?.dispose();
  if (Array.isArray(mesh.material)) {
    mesh.material.forEach((m: THREE.Material) => m.dispose());
  } else {
    (mesh.material as THREE.Material)?.dispose();
  }
}

// ─── Card panels (two halves) ─────────────────────────────────────────────────
// Returns refs to the front and back panel meshes so the render loop can
// update their rotations during the open/close animation.

interface PanelResult {
  frontPanel: THREE.Mesh;
  backPanel:  THREE.Mesh;
}

function buildCardPanels(
  cardGroup: THREE.Group,
  scene:     THREE.Scene,
  cardColor: string,
): PanelResult {
  // Remove old card-panel objects from the rotated cardGroup
  cardGroup.children.filter(o => o.userData.cardPart).forEach(o => {
    disposeMesh(o);
    cardGroup.remove(o);
  });
  // Remove old shadow catcher from scene
  scene.children.filter(o => o.userData.shadowCatcher).forEach(o => {
    disposeMesh(o);
    scene.remove(o);
  });

  const cardMat = new THREE.MeshLambertMaterial({
    color: safeColor(cardColor),
    side: THREE.DoubleSide,
  });

  const addPanel = (rotX: number): THREE.Mesh => {
    const geo = new THREE.PlaneGeometry(CARD_W, CARD_H);
    geo.translate(0, CARD_H / 2, 0);
    const mesh = new THREE.Mesh(geo, cardMat.clone());
    mesh.rotation.x = rotX;
    mesh.receiveShadow = true;
    mesh.userData.cardPart = true;
    cardGroup.add(mesh);
    return mesh;
  };

  // front panel: tilts toward viewer (–z) in local space
  const frontPanel = addPanel(-OPEN_ANGLE);
  // back panel:  tilts away from viewer (+z) in local space
  const backPanel  = addPanel(+OPEN_ANGLE);

  // Spine crease
  const spineMesh = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.055, CARD_W + 0.3, 10),
    new THREE.MeshLambertMaterial({ color: 0xbbbbbb }),
  );
  spineMesh.rotation.z       = Math.PI / 2;
  spineMesh.userData.cardPart = true;
  cardGroup.add(spineMesh);

  // Panel top-edge outlines (in local space of cardGroup)
  const edgeMat = new THREE.LineBasicMaterial({ color: 0xcccccc });
  const addEdge = (z: number) => {
    const pts = [
      new THREE.Vector3(-CARD_W / 2, PANEL_TOP_Y, z),
      new THREE.Vector3( CARD_W / 2, PANEL_TOP_Y, z),
    ];
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), edgeMat);
    line.userData.cardPart = true;
    cardGroup.add(line);
  };
  addEdge(-PANEL_TOP_Z);
  addEdge(+PANEL_TOP_Z);

  // Shadow catcher — flat on the ground in world space
  const shadowGeo  = new THREE.PlaneGeometry(CARD_W + 4, CARD_H + 4);
  const shadowMat  = new THREE.ShadowMaterial({ opacity: 0.18 });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.rotation.x       = -Math.PI / 2;
  shadowMesh.position.y       = -0.01;
  shadowMesh.receiveShadow    = true;
  shadowMesh.userData.shadowCatcher = true;
  scene.add(shadowMesh);

  return { frontPanel, backPanel };
}

// ─── V-fold layer groups ──────────────────────────────────────────────────────

function rebuildLayers(group: THREE.Group, layers: PopupLayer3D[], showTabs: boolean) {
  while (group.children.length > 0) {
    const child = group.children[0];
    disposeMesh(child);
    group.remove(child);
  }

  layers.forEach(layer => {
    const vfoldGroup = buildVFold({
      width:            layer.width,
      height:           layer.height,
      depth:            layer.depth,
      color:            layer.color,
      imageData:        layer.imageData,
      verticalPosition: layer.verticalPosition,
      tabWidth:            layer.tabWidth,
      tabHeight:           layer.tabHeight,
      tabDepth:            layer.tabDepth,
      horizontalPosition:  layer.horizontalPosition,
    });

    vfoldGroup.position.x += (group.children.length % 3 - 1) * 0.15;

    // Hide construction tabs when showTabs is false (preview mode)
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
  cardColor    = '#fef9ef',
  height       = 400,
  cameraPreset = 'editor',
  isOpen,
  showTabs     = true,
}: Card3DViewerProps) {
  const mountRef      = useRef<HTMLDivElement>(null);
  const sceneRef      = useRef<THREE.Scene | null>(null);
  const cardGroupRef  = useRef<THREE.Group | null>(null);
  const layerGroupRef = useRef<THREE.Group | null>(null);

  // ── Animation refs (updated by effects, read by the render loop) ────────────
  const frontPanelRef   = useRef<THREE.Mesh | null>(null);
  const backPanelRef    = useRef<THREE.Mesh | null>(null);
  // targetAngle: the angle each panel makes with the spine (0 = closed, OPEN_ANGLE = open)
  const targetAngleRef  = useRef(OPEN_ANGLE);
  // currentAngle: smoothly interpolated toward targetAngle every frame
  const currentAngleRef = useRef(OPEN_ANGLE);
  // Whether we're in preview (animated) mode — set once at mount from cameraPreset prop
  const previewModeRef  = useRef(cameraPreset === 'preview');

  // ── Main setup (runs once on mount) ─────────────────────────────────────────
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const isPreview = cameraPreset === 'preview';
    previewModeRef.current = isPreview;

    // Initialise angle refs from the isOpen prop at mount time
    const initialAngle = (!isPreview || isOpen !== false) ? OPEN_ANGLE : 0;
    currentAngleRef.current = initialAngle;
    targetAngleRef.current  = initialAngle;

    // Scene
    const scene = new THREE.Scene();
    if (isPreview) {
      scene.background = new THREE.Color(0xf0f2f5);  // lighter, cleaner for preview
    } else {
      scene.background = new THREE.Color(0xdde2ee);
      scene.fog = new THREE.FogExp2(0xdde2ee, 0.022);
    }
    sceneRef.current = scene;

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, isPreview ? 0.85 : 0.7));

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
    keyLight.position.set(-4, 14, 6);
    keyLight.castShadow        = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far  = 50;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xeeeeff, 0.3);
    fillLight.position.set(6, 8, -6);
    scene.add(fillLight);

    // Grid floor (only in editor mode)
    if (!isPreview) {
      const grid = new THREE.GridHelper(20, 20, 0xbbbbbb, 0xdddddd);
      grid.position.y = -0.02;
      scene.add(grid);
    }

    // ── Camera ──────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(isPreview ? 30 : 40, 1, 0.1, 100);

    if (isPreview) {
      // Face-on: look straight at the front panel.
      // When fully open, the front panel is a vertical plane at z = 0 in world space,
      // spanning x ∈ [-CARD_W/2, CARD_W/2] = [-4, 4] and y ∈ [0, CARD_H] = [0, 5].
      // At FOV=30° and aspect≈1 the half-width that fits at distance D is D·tan(15°)≈0.268·D.
      // To fit CARD_W/2=4 with ~25% padding we need D ≥ 4/0.268·1.25 ≈ 19 → use 18.
      camera.position.set(0, CARD_H * 0.5, 18);
      camera.lookAt(0, CARD_H * 0.45, 0);
    } else {
      // Editor: angled view that shows the L-shaped open card
      camera.position.set(5, 8, 10);
      camera.lookAt(0, 2, 2);
    }

    // ── Renderer ─────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);

    // ── OrbitControls ────────────────────────────────────────────────────────
    // Enabled in both editor and preview modes.
    // Preview uses a tighter distance range and keeps the target centred on the card.
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

    // ── Card group ────────────────────────────────────────────────────────────
    // cardGroup.rotation.x positions the overall card orientation.
    // Formula: rotation.x = π/2 - currentAngle keeps the back panel flat.
    //   • currentAngle = OPEN_ANGLE → rotation.x = π/2 - π/4 = OPEN_ANGLE (editor behaviour)
    //   • currentAngle = 0          → rotation.x = π/2          (both panels flat = closed)
    const cardGroup = new THREE.Group();
    cardGroup.rotation.x = Math.PI / 2 - currentAngleRef.current;
    scene.add(cardGroup);
    cardGroupRef.current = cardGroup;

    // Layer group lives inside cardGroup
    const layerGroup = new THREE.Group();
    cardGroup.add(layerGroup);
    layerGroupRef.current = layerGroup;

    // ── Render loop ───────────────────────────────────────────────────────────
    let frameId = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w === 0 || h === 0) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      // Smooth angle interpolation toward target
      const target  = targetAngleRef.current;
      const current = currentAngleRef.current;
      const next    = current + (target - current) * 0.08;
      currentAngleRef.current = Math.abs(next - target) < 0.0005 ? target : next;

      const a = currentAngleRef.current;

      // Apply angle to card geometry:
      //   cardGroup rotation keeps the back panel flat as the card opens/closes.
      //   Individual panel mesh rotations control the opening angle.
      if (cardGroupRef.current)  cardGroupRef.current.rotation.x  = Math.PI / 2 - a;
      if (frontPanelRef.current) frontPanelRef.current.rotation.x = -a;
      if (backPanelRef.current)  backPanelRef.current.rotation.x  = +a;

      // In preview mode: hide popup elements while the card is mostly closed so
      // they don't poke through the flat panels awkwardly.
      if (previewModeRef.current && layerGroupRef.current) {
        const openFraction = a / OPEN_ANGLE;
        layerGroupRef.current.visible = openFraction > 0.25;
      }

      controls?.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      controls?.dispose();
      scene.traverse(o => disposeMesh(o));
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      sceneRef.current      = null;
      cardGroupRef.current  = null;
      layerGroupRef.current = null;
      frontPanelRef.current = null;
      backPanelRef.current  = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount-only — mutable state goes through refs

  // ── Rebuild card panels when cardColor changes ────────────────────────────
  useEffect(() => {
    if (!sceneRef.current || !cardGroupRef.current) return;
    const { frontPanel, backPanel } = buildCardPanels(cardGroupRef.current, sceneRef.current, cardColor);
    frontPanelRef.current = frontPanel;
    backPanelRef.current  = backPanel;
    // Restore current animation angle on the newly created meshes
    const a = currentAngleRef.current;
    frontPanel.rotation.x = -a;
    backPanel.rotation.x  = +a;
  }, [cardColor]);

  // ── Rebuild layers when layers or showTabs changes ─────────────────────────
  useEffect(() => {
    if (!layerGroupRef.current) return;
    rebuildLayers(layerGroupRef.current, layers, showTabs);
  }, [layers, showTabs]);

  // ── Update animation target when isOpen changes ────────────────────────────
  useEffect(() => {
    if (isOpen === undefined) return; // editor mode — always open, never animate
    targetAngleRef.current = isOpen ? OPEN_ANGLE : 0;
  }, [isOpen]);

  // ─────────────────────────────────────────────────────────────────────────────

  const isPreview = cameraPreset === 'preview';

  return (
    <div
      className="relative rounded-xl overflow-hidden border border-gray-300 shadow-inner bg-gray-200"
      style={{ height }}
    >
      <div ref={mountRef} className="w-full h-full" />

      {/* Orbit hint — shown in both modes */}
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

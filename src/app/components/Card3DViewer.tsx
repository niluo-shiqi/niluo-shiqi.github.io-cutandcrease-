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
  tabWidth?:        number;   // 0–100
  tabHeight?:       number;   // 0–100
  tabDepth?:        number;   // 0–100
}

interface Card3DViewerProps {
  layers:     PopupLayer3D[];
  cardColor?: string;
  mechanism?: string;  // future: 'v-fold' | 'basic-tab' | …
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

// ─── Card panels (two halves at 90°) ─────────────────────────────────────────

function buildCardPanels(cardGroup: THREE.Group, scene: THREE.Scene, cardColor: string) {
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

  const addPanel = (rotX: number, zOffset: number = 0) => {
    // PlaneGeometry in XY plane, bottom edge at origin, height up
    const geo = new THREE.PlaneGeometry(CARD_W, CARD_H);
    geo.translate(0, CARD_H / 2, 0);
    const mesh = new THREE.Mesh(geo, cardMat.clone());
    mesh.rotation.x = rotX;
    mesh.position.z = zOffset;  // ADD THIS
    mesh.receiveShadow = true;
    mesh.userData.cardPart = true;
    cardGroup.add(mesh);
  };

  // front panel: tilts toward viewer (–z) in local space → stands vertical after group rotation
  addPanel(-OPEN_ANGLE, 0);
  // back panel:  tilts away from viewer (+z) in local space → lies flat after group rotation
  addPanel(+OPEN_ANGLE, 0);

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

  // Shadow catcher stays flat on the ground in world space — not inside cardGroup
  const shadowGeo  = new THREE.PlaneGeometry(CARD_W + 4, CARD_H + 4);
  const shadowMat  = new THREE.ShadowMaterial({ opacity: 0.18 });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.rotation.x       = -Math.PI / 2;
  shadowMesh.position.y       = -0.01;
  shadowMesh.receiveShadow    = true;
  shadowMesh.userData.shadowCatcher = true;
  scene.add(shadowMesh);
}

// ─── V-fold layer groups ──────────────────────────────────────────────────────

function rebuildLayers(group: THREE.Group, layers: PopupLayer3D[]) {
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
      tabWidth:         layer.tabWidth,
      tabHeight:        layer.tabHeight,
      tabDepth:         layer.tabDepth,
    });

    // Offset successive layers slightly along x so they don't perfectly overlap
    // (index not available here so we rely on the group.children count before adding)
    const offsetX = (group.children.length % 3 - 1) * 0.15;
    vfoldGroup.position.x = offsetX;

    group.add(vfoldGroup);
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Card3DViewer({ layers, cardColor = '#fef9ef' }: Card3DViewerProps) {
  const mountRef      = useRef<HTMLDivElement>(null);
  const sceneRef      = useRef<THREE.Scene | null>(null);
  const cardGroupRef  = useRef<THREE.Group | null>(null);
  const layerGroupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdde2ee);
    scene.fog = new THREE.FogExp2(0xdde2ee, 0.022);
    sceneRef.current = scene;

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));

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

    // Subtle grid floor
    const grid = new THREE.GridHelper(20, 20, 0xbbbbbb, 0xdddddd);
    grid.position.y = -0.02;
    scene.add(grid);

    // Camera — viewing the L-shape: front panel standing vertical, back panel lying flat
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(5, 8, 10);
    camera.lookAt(0, 2, 2);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 2, 2);
    controls.enableDamping  = true;
    controls.dampingFactor  = 0.07;
    controls.minDistance    = 4;
    controls.maxDistance    = 30;
    controls.minPolarAngle  = 0.05;
    controls.maxPolarAngle  = Math.PI * 0.72;
    controls.update();

    // cardGroup is rotated so back panel lies flat and front panel stands vertical.
    // All card geometry (panels, spine, edges, layers) lives inside here.
    // The shadow-catcher plane is added to scene directly so it stays flat.
    const cardGroup = new THREE.Group();
    cardGroup.rotation.x = OPEN_ANGLE;
    scene.add(cardGroup);
    cardGroupRef.current = cardGroup;

    // Layer group lives inside cardGroup so V-fold layers rotate with the card
    const layerGroup = new THREE.Group();
    cardGroup.add(layerGroup);
    layerGroupRef.current = layerGroup;

    // Render loop
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
      cardGroupRef.current  = null;
      layerGroupRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!sceneRef.current || !cardGroupRef.current) return;
    buildCardPanels(cardGroupRef.current, sceneRef.current, cardColor);
  }, [cardColor]);

  useEffect(() => {
    if (!layerGroupRef.current) return;
    rebuildLayers(layerGroupRef.current, layers);
  }, [layers]);

  return (
    <div
      className="relative rounded-xl overflow-hidden border border-gray-300 shadow-inner bg-gray-200"
      style={{ height: 400 }}
    >
      <div ref={mountRef} className="w-full h-full" />

      <div className="absolute bottom-2.5 right-3 pointer-events-none select-none">
        <span className="text-xs bg-black/40 text-white px-2.5 py-1 rounded-full">
          Drag · Scroll · Right-drag
        </span>
      </div>
      <div className="absolute bottom-2.5 left-3 pointer-events-none select-none">
        <span className="text-xs bg-black/40 text-white px-2.5 py-1 rounded-full">
          90° opening · V-fold
        </span>
      </div>
    </div>
  );
}

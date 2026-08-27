"use client";
import { useRef, useEffect } from "react";
import * as THREE from "three";
// @ts-ignore
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
// @ts-ignore
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// @ts-ignore
import { Reflector } from "three/examples/jsm/objects/Reflector.js";

interface AvatarViewer3DProps {
  gender?: "man" | "woman";
  avatarUrl?: string | null;
  clothingColors?: {
    top?: string | null;
    bottom?: string | null;
    dress?: string | null;
    outerwear?: string | null;
    shoes?: string | null;
  };
}

type BodyZone = "head" | "torso" | "arms" | "hands" | "legs" | "feet" | "unknown";

/**
 * Classify a mesh into a body zone using its world-space bounding box
 * relative to the full model's bounding box. This is name-agnostic and
 * works regardless of what the GLB author called the meshes.
 */
function classifyMeshZone(mesh: THREE.Mesh, modelBox: THREE.Box3): BodyZone {
  const modelHeight = modelBox.max.y - modelBox.min.y;
  if (modelHeight < 0.001) return "unknown";

  mesh.geometry.computeBoundingBox();
  const meshBox = new THREE.Box3();
  meshBox.copy(mesh.geometry.boundingBox!).applyMatrix4(mesh.matrixWorld);

  // Normalise centre Y into 0–1 (0 = feet, 1 = top of head)
  const centreY = (meshBox.min.y + meshBox.max.y) / 2;
  const normY = (centreY - modelBox.min.y) / modelHeight;

  // Width as fraction of model height – helps tell arms from torso
  const meshWidth = meshBox.max.x - meshBox.min.x;
  const normWidth = meshWidth / modelHeight;

  console.log(`    classifyMeshZone: name="${mesh.name}" normY=${normY.toFixed(4)} normWidth=${normWidth.toFixed(4)}`);

  // Depth centre relative to model depth
  const modelDepth = modelBox.max.z - modelBox.min.z;
  const meshDepth = meshBox.max.z - meshBox.min.z;
  const normDepth = modelDepth > 0 ? meshDepth / modelDepth : 0;

  // ── Zone rules (tuned for Mixamo / ReadyPlayerMe style rigs) ──
  if (normY > 0.82) return "head";
  if (normY > 0.60 && normY <= 0.82) {
    // Torso is wide & deep; arms are narrow
    return normWidth < 0.12 ? "arms" : "torso";
  }
  if (normY > 0.50 && normY <= 0.60) {
    // Waist / upper-leg transition – narrow = arms/hands, wide = torso/hips
    return normWidth < 0.10 ? "hands" : "torso";
  }
  if (normY > 0.28 && normY <= 0.50) {
    // Leg region; narrow side pieces = lower arms / hands
    return normWidth < 0.10 ? "hands" : "legs";
  }
  if (normY > 0.10 && normY <= 0.28) return "legs";
  return "feet"; // bottom 10 %
}

/**
 * Apply realistic clothing + skin tones to every mesh in the model.
 * Falls back gracefully: name-based hint first, then bounding-box zone.
 */
function applyClothing(
  meshes: THREE.Mesh[],
  modelBox: THREE.Box3,
  clothingColors: any
) {
  console.log("applyClothing called with clothingColors:", JSON.stringify(clothingColors));
  // ── Palette ──
  const SKIN = "#c68642";   // warm medium skin tone
  const SKIN_DARK = "#a0522d";   // slightly darker for limbs / depth
  const HAIR = "#2c1810";   // dark brown hair
  const TOP_DEF = "#f0f0f0";   // default white shirt
  const BOT_DEF = "#1e3a5f";   // default dark jeans
  const SHOE_DEF = "#1a1a1a";   // default black shoes

  const hasDress = !!clothingColors?.dress;
  const topColor = hasDress ? clothingColors.dress : (clothingColors?.top || TOP_DEF);
  const botColor = hasDress ? clothingColors.dress : (clothingColors?.bottom || BOT_DEF);
  const shoeColor = clothingColors?.shoes || SHOE_DEF;

  // Helper: set color on a material-like object that has .color
  const setCol = (m: any, hex: string) => {
    if (m?.color) {
      const prevColor = m.color.getHexString();
      m.color.set(hex);
      console.log(`  Set color on material from #${prevColor} to ${hex}`);
    }
  };

  const paintMesh = (mesh: THREE.Mesh, hex: string) => {
    const mat = mesh.material;
    if (!mat) return;

    // Skip color-painting for pre-textured humanoid models to preserve high-fidelity textures
    const hasTexture = Array.isArray(mat) ? mat.some((m) => !!(m as any).map) : !!(mat as any).map;
    if (hasTexture) {
      console.log(`  paintMesh: skipping name="${mesh.name}" because it has texture maps`);
      return;
    }

    console.log(`  paintMesh: name="${mesh.name}" color=${hex}`);
    if (Array.isArray(mat)) mat.forEach((m) => setCol(m, hex));
    else setCol(mat, hex);
  };

  meshes.forEach((mesh) => {
    const nameLower = (mesh.name || "").toLowerCase();
    console.log(`Processing mesh: "${mesh.name}"`);

    // ── 0. Handle default single-mesh mannequin body ──
    if (nameLower === "beta_surface" || nameLower === "alpha_surface") {
      const defaultBodyColor = clothingColors?.dress || clothingColors?.top || clothingColors?.bottom || SKIN;
      paintMesh(mesh, defaultBodyColor);
      return;
    }

    // ── 1. Name-based overrides (catches well-named GLBs) ──
    if (/hair|eyebrow|beard|mustache/.test(nameLower)) {
      paintMesh(mesh, HAIR); return;
    }
    if (/eye|pupil|iris/.test(nameLower)) {
      paintMesh(mesh, "#1a1a2e"); return;
    }
    if (/teeth|tooth/.test(nameLower)) {
      paintMesh(mesh, "#fffff0"); return;
    }
    if (/head|face|skull|neck/.test(nameLower)) {
      paintMesh(mesh, SKIN); return;
    }
    if (/hand|finger|palm|wrist/.test(nameLower)) {
      paintMesh(mesh, SKIN); return;
    }
    if (/skin|joint|bone/.test(nameLower)) {
      paintMesh(mesh, SKIN); return;
    }
    if (/shoe|foot|feet|boot|sneaker|sole/.test(nameLower)) {
      paintMesh(mesh, shoeColor); return;
    }
    if (/pant|jean|trouser|leg|bottom|lower/.test(nameLower)) {
      paintMesh(mesh, botColor); return;
    }
    if (/shirt|top|torso|body|chest|upper|jacket|coat|blouse/.test(nameLower)) {
      paintMesh(mesh, topColor); return;
    }
    if (/arm|sleeve|forearm|upperarm/.test(nameLower)) {
      paintMesh(mesh, SKIN_DARK); return;
    }

    // ── 2. Bounding-box zone fallback (for unnamed / generic meshes) ──
    const zone = classifyMeshZone(mesh, modelBox);
    console.log(`  Fallback: name="${mesh.name}" zone="${zone}"`);
    switch (zone) {
      case "head": paintMesh(mesh, SKIN); break;
      case "torso": paintMesh(mesh, topColor); break;
      case "arms": paintMesh(mesh, topColor); break; // sleeved
      case "hands": paintMesh(mesh, SKIN); break;
      case "legs": paintMesh(mesh, botColor); break;
      case "feet": paintMesh(mesh, shoeColor); break;
      default: paintMesh(mesh, SKIN); break;
    }
  });
}

export function AvatarViewer3D({ gender = "man", avatarUrl, clothingColors }: AvatarViewer3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const meshesRef = useRef<THREE.Mesh[]>([]);
  const modelBoxRef = useRef<THREE.Box3>(new THREE.Box3());

  // Live clothing color updates
  useEffect(() => {
    if (meshesRef.current.length > 0) {
      // Disable recoloring
      // applyClothing(meshesRef.current, modelBoxRef.current, clothingColors ?? {});
    }
  }, [clothingColors]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const w = mount.clientWidth;
    const h = mount.clientHeight;

    /* ── Renderer ── */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "default" });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    /* ── Scene ── */
    const scene = new THREE.Scene();
    
    const finalHex = "#08080a";
    scene.background = new THREE.Color(finalHex);
    scene.fog = new THREE.Fog(finalHex, 6, 12);

    /* ── Camera ── */
    const camera = new THREE.PerspectiveCamera(40, w / h, 0.1, 50);
    camera.position.set(0, 1.4, 2.8);
    camera.lookAt(0, 1.0, 0);

    /* ── Controls ── */
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 1.0, 0);
    controls.enablePan = false;
    controls.enableRotate = false;
    controls.minDistance = 1.5;
    controls.maxDistance = 5.0;
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;

    /* ── Lights ── */
    scene.add(new THREE.AmbientLight(0xffecc2, 0.45));

    const keyLight = new THREE.DirectionalLight(0xfff9f2, 1.5);
    keyLight.position.set(1.5, 4.0, 3.0);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(2048, 2048);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 15;
    keyLight.shadow.camera.left = -2.5;
    keyLight.shadow.camera.right = 2.5;
    keyLight.shadow.camera.top = 4;
    keyLight.shadow.camera.bottom = -1.5;
    keyLight.shadow.bias = -0.0003;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffeadd, 0.5);
    fillLight.position.set(-2, 2.5, 1.5);
    scene.add(fillLight);

    const rimLight = new THREE.PointLight(0xffe2a0, 0.8, 5);
    rimLight.position.set(0, 2.2, -1.8);
    scene.add(rimLight);

    /* ── Walls ── */
    const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.95, roughness: 0.15 });
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xeae6df, roughness: 0.85, metalness: 0.1 });

    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(8, 5), wallMat);
    backWall.position.set(0, 2.5, -2.2);
    backWall.receiveShadow = true;
    scene.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(6, 5), wallMat);
    leftWall.position.set(-4.0, 2.5, 0.8);
    leftWall.rotation.y = Math.PI / 2;
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(6, 5), wallMat);
    rightWall.position.set(4.0, 2.5, 0.8);
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.receiveShadow = true;
    scene.add(rightWall);

    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 6),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9, metalness: 0.0 })
    );
    ceiling.position.set(0, 5.0, 0.8);
    ceiling.rotation.x = Math.PI / 2;
    scene.add(ceiling);

    /* ── Back Wall Wardrobes (Charcoal Walnut Veneer flanking the mirror) ── */
    const cabinetMat = new THREE.MeshStandardMaterial({
      color: 0x332c29, // Elegant dark walnut wood veneer
      roughness: 0.5,
      metalness: 0.1,
    });
    const cabinetFrameMat = new THREE.MeshStandardMaterial({
      color: 0x241e1c, // Slightly darker dark wood for visual separation / shadows
      roughness: 0.6,
      metalness: 0.15,
    });

    const leftWardrobe = new THREE.Group();
    const rightWardrobe = new THREE.Group();

    const cabW = 3.0; // Total width of each cabinet group (spanning 3 meters)
    const cabH = 3.8; // Cabinet height
    const cabD = 0.55; // Cabinet depth (recess depth)

    // Main backing cabinet structures
    const leftCabBody = new THREE.Mesh(new THREE.BoxGeometry(cabW, cabH, cabD), cabinetFrameMat);
    leftCabBody.position.set(-2.3, cabH / 2, -1.925); // back is at z = -2.2, front is at z = -1.65
    leftCabBody.castShadow = true;
    leftCabBody.receiveShadow = true;
    leftWardrobe.add(leftCabBody);

    const rightCabBody = new THREE.Mesh(new THREE.BoxGeometry(cabW, cabH, cabD), cabinetFrameMat);
    rightCabBody.position.set(2.3, cabH / 2, -1.925); // back is at z = -2.2, front is at z = -1.65
    rightCabBody.castShadow = true;
    rightCabBody.receiveShadow = true;
    rightWardrobe.add(rightCabBody);

    // Create 3 doors for left cabinet and 3 doors for right cabinet
    for (let i = 0; i < 3; i++) {
      // Left side door coordinates
      const lx = -3.3 + i * 1.0;
      // Right side door coordinates
      const rx = 1.3 + i * 1.0;

      // ── Left Wardrobe Doors ──
      // Door frame/panel
      const lDoor = new THREE.Mesh(new THREE.BoxGeometry(0.96, cabH - 0.1, 0.02), cabinetMat);
      lDoor.position.set(lx, cabH / 2, -1.64); // Positioned slightly in front of main cabinet body
      lDoor.castShadow = true;
      lDoor.receiveShadow = true;
      leftWardrobe.add(lDoor);

      // Inset panel for premium look
      const lPanel = new THREE.Mesh(new THREE.BoxGeometry(0.8, cabH - 0.4, 0.01), cabinetFrameMat);
      lPanel.position.set(lx, cabH / 2, -1.625);
      leftWardrobe.add(lPanel);

      // Vertical Gold Handle
      const lHandle = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.7, 0.025), goldMat);
      // Handles are placed on the inner edges of doors (e.g. at x + 0.35)
      const lHandleX = lx + (i % 2 === 0 ? 0.35 : -0.35);
      lHandle.position.set(lHandleX, 1.6, -1.61);
      lHandle.castShadow = true;
      leftWardrobe.add(lHandle);

      // ── Right Wardrobe Doors ──
      // Door frame/panel
      const rDoor = new THREE.Mesh(new THREE.BoxGeometry(0.96, cabH - 0.1, 0.02), cabinetMat);
      rDoor.position.set(rx, cabH / 2, -1.64);
      rDoor.castShadow = true;
      rDoor.receiveShadow = true;
      rightWardrobe.add(rDoor);

      // Inset panel for premium look
      const rPanel = new THREE.Mesh(new THREE.BoxGeometry(0.8, cabH - 0.4, 0.01), cabinetFrameMat);
      rPanel.position.set(rx, cabH / 2, -1.625);
      rightWardrobe.add(rPanel);

      // Vertical Gold Handle
      const rHandle = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.7, 0.025), goldMat);
      const rHandleX = rx + (i % 2 === 0 ? 0.35 : -0.35);
      rHandle.position.set(rHandleX, 1.6, -1.61);
      rHandle.castShadow = true;
      rightWardrobe.add(rHandle);
    }

    // Top gold trim running across both cabinet systems
    const trimLT = new THREE.Mesh(new THREE.BoxGeometry(cabW + 0.02, 0.03, cabD + 0.02), goldMat);
    trimLT.position.set(-2.3, cabH - 0.015, -1.925);
    leftWardrobe.add(trimLT);

    const trimRT = new THREE.Mesh(new THREE.BoxGeometry(cabW + 0.02, 0.03, cabD + 0.02), goldMat);
    trimRT.position.set(2.3, cabH - 0.015, -1.925);
    rightWardrobe.add(trimRT);

    // Bottom kickplate (plinth) in gold trim
    const plinthL = new THREE.Mesh(new THREE.BoxGeometry(cabW + 0.01, 0.05, cabD + 0.01), goldMat);
    plinthL.position.set(-2.3, 0.025, -1.925);
    leftWardrobe.add(plinthL);

    const plinthR = new THREE.Mesh(new THREE.BoxGeometry(cabW + 0.01, 0.05, cabD + 0.01), goldMat);
    plinthR.position.set(2.3, 0.025, -1.925);
    rightWardrobe.add(plinthR);

    scene.add(leftWardrobe, rightWardrobe);

    /* ── Wood Floor ── */
    const createWoodTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 512; canvas.height = 512;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.fillStyle = "#8b5a2b";
      ctx.fillRect(0, 0, 512, 512);
      const plankH = 64;
      ctx.strokeStyle = "#4a2e16"; ctx.lineWidth = 2;
      for (let y = 0; y < 512; y += plankH) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(512, y); ctx.stroke();
        const off = (y / plankH) % 2 === 0 ? 0 : 128;
        for (let x = off; x < 512 + 128; x += 256) {
          ctx.beginPath(); ctx.moveTo(x % 512, y); ctx.lineTo(x % 512, y + plankH); ctx.stroke();
        }
      }
      for (let i = 0; i < 80; i++) {
        ctx.fillStyle = "rgba(74,46,22,0.15)";
        ctx.fillRect(0, Math.random() * 512, 512, 2 + Math.random() * 6);
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(2, 2);
      return tex;
    };

    const woodTex = createWoodTexture();
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 6),
      new THREE.MeshStandardMaterial({ map: woodTex || undefined, color: woodTex ? 0xffffff : 0x8b5a2b, roughness: 0.45, metalness: 0.1 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.set(0, 0, 0.8);
    ground.receiveShadow = true;
    scene.add(ground);

    /* ── Rug + Shadow disc ── */
    const rug = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9, 0.9, 0.01, 32),
      new THREE.MeshStandardMaterial({ color: 0xeae5d9, roughness: 0.95, metalness: 0.0 })
    );
    rug.position.set(0, 0.005, 0.3);
    rug.receiveShadow = true;
    scene.add(rug);

    const shadowDisc = new THREE.Mesh(
      new THREE.CircleGeometry(0.6, 32),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.45, depthWrite: false })
    );
    shadowDisc.rotation.x = -Math.PI / 2;
    shadowDisc.position.set(0, 0.012, 0.3);
    scene.add(shadowDisc);

    /* ── Mirror ── */
    const mirrorFrame = new THREE.Mesh(new THREE.BoxGeometry(1.42, 2.12, 0.04), goldMat);
    mirrorFrame.position.set(0, 1.2, -2.18);
    mirrorFrame.castShadow = true;
    scene.add(mirrorFrame);

    let mirrorReflector: any = null;
    try {
      // Clear, color-accurate mirror reflector with neutral 0x7f7f7f color
      mirrorReflector = new Reflector(new THREE.PlaneGeometry(1.3, 2.0), {
        clipBias: 0.003, textureWidth: 1024, textureHeight: 1024, color: 0x7f7f7f,
      });
      mirrorReflector.position.set(0, 1.2, -2.155);
      scene.add(mirrorReflector);
    } catch {
      const fb = new THREE.Mesh(
        new THREE.PlaneGeometry(1.3, 2.0),
        new THREE.MeshStandardMaterial({ color: 0x99aacc, roughness: 0.0, metalness: 1.0 })
      );
      fb.position.set(0, 1.2, -2.155);
      scene.add(fb);
    }

    const bulbGeo = new THREE.SphereGeometry(0.03, 16, 16);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfff5d9 });
    [0.4, 0.8, 1.2, 1.6, 2.0].forEach((by) => {
      [-0.68, 0.68].forEach((bx) => {
        const b = new THREE.Mesh(bulbGeo, bulbMat);
        b.position.set(bx, by, -2.15);
        scene.add(b);
      });
    });

    // Position vanityPoint behind the mirror frame as an ambient backlit glow (prevents direct screen/mirror glare)
    const vanityPoint = new THREE.PointLight(0xffdfa9, 1.2, 4);
    vanityPoint.position.set(0, 1.2, -2.2);
    scene.add(vanityPoint);

    const ceilingSpot = new THREE.SpotLight(0xfff5e0, 2.0, 10, Math.PI / 4, 0.4, 1);
    ceilingSpot.position.set(0, 4.8, 0.5);
    ceilingSpot.target.position.set(0, 0, 0.3);
    ceilingSpot.castShadow = true;
    ceilingSpot.shadow.mapSize.set(1024, 1024);
    ceilingSpot.shadow.bias = -0.0002;
    scene.add(ceilingSpot, ceilingSpot.target);

    /* ── Ottoman stool ── */
    const stoolGroup = new THREE.Group();
    stoolGroup.position.set(-1.6, 0, -0.6);
    const stoolBase = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.06, 32), goldMat);
    stoolBase.position.y = 0.03;
    stoolBase.castShadow = true;
    stoolGroup.add(stoolBase);
    const stoolCushion = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.3, 0.35, 32),
      new THREE.MeshStandardMaterial({ color: 0x1b4d3e, roughness: 0.85, metalness: 0.0 }) // Premium Emerald Green velvet
    );
    stoolCushion.position.y = 0.235;
    stoolCushion.castShadow = true;
    stoolGroup.add(stoolCushion);
    scene.add(stoolGroup);

    /* ── Clothes rack ── */
    const rackGroup = new THREE.Group();
    rackGroup.position.set(1.6, 0, -0.6);
    const poleH = 1.8, poleR = 0.02;
    [[-0.5], [0.5]].forEach(([x]) => {
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.04, 0.04), goldMat);
      foot.position.set(x, 0.02, 0);
      rackGroup.add(foot);
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(poleR, poleR, poleH, 16), goldMat);
      pole.position.set(x, poleH / 2 + 0.02, 0);
      rackGroup.add(pole);
    });
    const topRail = new THREE.Mesh(new THREE.CylinderGeometry(poleR, poleR, 1.06, 16), goldMat);
    topRail.rotation.z = Math.PI / 2;
    topRail.position.set(0, poleH + 0.02, 0);
    rackGroup.add(topRail);

    const redMat = new THREE.MeshStandardMaterial({ color: 0x9e2b2b, roughness: 0.7 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5, roughness: 0.6 });
    const hookGeo = new THREE.TorusGeometry(0.025, 0.004, 8, 24, Math.PI * 1.5);

    [{ x: -0.2, mat: redMat, h: 0.7, py: -0.27 },
    { x: 0.15, mat: whiteMat, h: 0.45, py: -0.15 }].forEach(({ x, mat, h, py }) => {
      const hanger = new THREE.Group();
      hanger.position.set(x, poleH - 0.1, 0);
      const hook = new THREE.Mesh(hookGeo, goldMat);
      hook.rotation.z = -Math.PI / 2;
      hook.position.y = 0.08;
      hanger.add(hook);
      const garment = new THREE.Mesh(new THREE.BoxGeometry(0.25, h, 0.05), mat);
      garment.position.y = py;
      garment.castShadow = true;
      hanger.add(garment);
      rackGroup.add(hanger);
    });
    scene.add(rackGroup);

    /* ── Load GLB ── */
    const loader = new GLTFLoader();
    // Realistic human avatars (Ready Player Me / Mixamo)
    const defaultModel =
      gender === "woman"
        ? "/models/rpm-female.glb"
        : "/models/rpm-male.glb";

    const modelPath = avatarUrl || defaultModel;
    let mixer: THREE.AnimationMixer | null = null;
    let modelGroup: THREE.Group | null = null;

    loader.load(
      modelPath,
      (gltf) => {
        const model = gltf.scene;
        model.updateMatrixWorld(true);

        const rawBox = new THREE.Box3().setFromObject(model);
        let height = rawBox.max.y - rawBox.min.y;
        console.log("GLB raw height:", height, "model:", modelPath);

        if (isNaN(height) || height < 0.1) height = 1.8;
        // Better scale for Ready Player Me avatars
        const scale = gender === "woman" ? 1.35 / height : 0.35 / height;

        modelGroup = new THREE.Group();
        modelGroup.add(model);
        modelGroup.scale.setScalar(scale);
        modelGroup.rotation.y = 0;
        scene.add(modelGroup);

        modelGroup.updateMatrixWorld(true);
        const worldBox = new THREE.Box3().setFromObject(modelGroup);
        modelGroup.position.y = -worldBox.min.y;

        const center = new THREE.Vector3();
        worldBox.getCenter(center);
        modelGroup.position.x = -center.x;
        modelGroup.position.z = -center.z + 0.3;

        // Re-compute final world box (after repositioning) for zone classification
        modelGroup.updateMatrixWorld(true);
        const finalBox = new THREE.Box3().setFromObject(modelGroup);
        modelBoxRef.current = finalBox;

        // Collect meshes
        const meshes: THREE.Mesh[] = [];
        model.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (mesh.isMesh) {
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            // Clone materials so we can safely mutate colors without sharing
            if (Array.isArray(mesh.material)) {
              mesh.material = mesh.material.map((m) => m.clone());
            } else if (mesh.material) {
              mesh.material = mesh.material.clone();
            }
            meshes.push(mesh);
          }
        });
        meshesRef.current = meshes;

        // Disable recoloring
        // applyClothing(meshes, finalBox, clothingColors ?? {});

        shadowDisc.position.x = modelGroup.position.x;
        shadowDisc.position.z = modelGroup.position.z;

        // Animation
        if (gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          let clip = gltf.animations.find((a: any) =>
            /^(idle|standing|stand|pose)$/i.test(a.name || "")
          ) ?? gltf.animations.find((a: any) =>
            /(idle|stand|pose)/i.test(a.name || "")
          ) ?? gltf.animations[0];
          mixer.clipAction(clip).play();
        }
      },
      undefined,
      (err) => console.error("GLB load error:", err)
    );

    /* ── Pointer drag for character rotation ── */
    let isDragging = false;
    let prevX = 0;
    const onPointerDown = (e: PointerEvent) => { isDragging = true; prevX = e.clientX; };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging || !modelGroup) return;
      modelGroup.rotation.y += (e.clientX - prevX) * 0.008;
      prevX = e.clientX;
    };
    const onPointerUp = () => { isDragging = false; };

    const dom = renderer.domElement;
    dom.addEventListener("pointerdown", onPointerDown);
    dom.addEventListener("pointermove", onPointerMove);
    dom.addEventListener("pointerup", onPointerUp);
    dom.addEventListener("pointercancel", onPointerUp);

    /* ── Render loop ── */
    let lastTime = performance.now();
    let animId: number;
    function animate() {
      animId = requestAnimationFrame(animate);
      const now = performance.now();
      const delta = (now - lastTime) / 1000;
      lastTime = now;
      controls.update();
      if (mixer) mixer.update(delta);
      renderer.render(scene, camera);
    }
    animate();

    /* ── Resize ── */
    const onResize = () => {
      if (!mount) return;
      const nw = mount.clientWidth, nh = mount.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
      dom.removeEventListener("pointerdown", onPointerDown);
      dom.removeEventListener("pointermove", onPointerMove);
      dom.removeEventListener("pointerup", onPointerUp);
      dom.removeEventListener("pointercancel", onPointerUp);
      if (mirrorReflector?.dispose) mirrorReflector.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [gender, avatarUrl]);

  return (
    <div
      ref={mountRef}
      style={{ width: "100%", height: "100%", display: "block", overflow: "hidden" }}
    />
  );
}

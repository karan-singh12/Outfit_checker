"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

// @ts-ignore
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
// @ts-ignore
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
// @ts-ignore
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
// @ts-ignore
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
// @ts-ignore
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader.js";
// @ts-ignore
import { CopyShader } from "three/examples/jsm/shaders/CopyShader.js";

// Fixed parameters
const bgColor = "#02160c";
const flameColor = "#0aff7f";
const flameColor2 = "#aef0c0";
const flameAmt = 0.2;
const atmoColor = "#7affbf";
const atmoCount = 300;
const atmoSize = 24;
const atmoSpeed = 1.0;
const colorLow = "#02160c";
const colorHigh = "#34e89a";
const opacity = 0.10;
const pointSize = 5.5;
const brightness = 0.45;
const waveHeight = 3;
const flow = 0.5; // Reduced speed as requested
const tilt = 0;
const scaleVal = 0.275;
const scrollRise = 1.0;
const camStartY = 7;
const camStartZ = 16;
const camEndY = 0.8;
const camEndZ = -2;
const lookStartZ = 2;
const lookEndZ = -16;
const parallax = 1.2;
const pointerRadius = 7.0;
const pointerStrength = 0.9;

const LAYERS = { NONE: 0, TORUS_SCENE: 1, BLOOM_SCENE: 2, ENTIRE_SCENE: 3 };

// Helpers
const Lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function hexToVec3(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

const createDummyTexture = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, 1, 1);
  }
  return new THREE.CanvasTexture(canvas);
};

const SNOISE = `
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0); const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy)); vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz); vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy); vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + 1.0 * C.xxx; vec3 x2 = x0 - i2 + 2.0 * C.xxx; vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0/7.0; vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
  vec4 x_ = floor(j * ns.z); vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ *ns.x + ns.yyyy; vec4 y = y_ *ns.x + ns.yyyy; vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy); vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0; vec4 s1 = floor(b1)*2.0 + 1.0; vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy; vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy,h.x); vec3 p1 = vec3(a0.zw,h.y); vec3 p2 = vec3(a1.xy,h.z); vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0); m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

const vertexShader = `
uniform float uTime; uniform float uStream; uniform float uSize; uniform float uWaveHeight; uniform float uFlow; uniform float uScale;
uniform vec3 uColLow; uniform vec3 uColHigh;
uniform vec3 uCursor; uniform float uRepelRadius; uniform float uRepelStrength; uniform float uActivity;
varying float vFade; varying vec3 vColor;
${SNOISE}
void main() {
  vec3 wp = vec3(position.x * 13.0, 0.0, position.z * 25.0);
  wp.x += position.y * 6.0;
  float zc = wp.z + uStream;
  float wn = snoise(vec3(wp.x * 0.08, zc * 0.08, uTime * 0.15 * uFlow)) * 2.0;
  wn += snoise(vec3(wp.x * 0.16, zc * 0.16, uTime * 0.3 * uFlow)) * 0.8;
  wp.y += wn * uWaveHeight;

  vec3 finalPos = wp * uScale;
  vec4 modelPosition = modelMatrix * vec4(finalPos, 1.0);
  vec3 toP = modelPosition.xyz - uCursor;
  float cd = length(toP);
  float fall = smoothstep(uRepelRadius, 0.0, cd);
  modelPosition.xyz += normalize(toP + vec3(0.0001)) * fall * uRepelStrength * uActivity;
  vec4 mvPosition = viewMatrix * modelPosition;

  float colMix = smoothstep(-3.0, 3.0, position.y + position.x * 0.5);
  vColor = mix(uColLow, uColHigh, clamp(colMix, 0.0, 1.0));
  vFade = 1.0;

  gl_PointSize = uSize * (10.0 / -mvPosition.z);
  gl_PointSize = max(gl_PointSize, 1.5);
  gl_Position = projectionMatrix * mvPosition;
}
`;

const fragmentShader = `
uniform float uOpacity; uniform float uBrightness; uniform float uAppear;
varying float vFade; varying vec3 vColor;
void main() {
  vec2 xy = gl_PointCoord - 0.5;
  float ll = length(xy);
  if (ll > 0.5) discard;
  float a = smoothstep(0.5, 0.1, ll);
  gl_FragColor = vec4(vColor * uBrightness, vFade * a * uOpacity * uAppear);
}
`;

const finalPassVertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const finalPassFragmentShader = `
uniform float iTime;
uniform sampler2D tDiffuse;
uniform sampler2D bloomTexture;
uniform sampler2D torusTexture;
uniform sampler2D haloTexture;
uniform vec3 uBg;
uniform vec3 uFlameA;
uniform vec3 uFlameB;
uniform float uFlameAmt;
varying vec2 vUv;

vec3 warp3d(vec3 pos, float t) {
  float curv = 0.8, a = 1.9, b = 0.7;
  pos *= 2.0;
  pos.x += curv * sin(t + a * pos.y) + t * b;
  pos.y += curv * cos(t + a * pos.x);
  return 0.5 + 0.5 * cos(pos.xyz + vec3(1, 2, 4));
}

void main() {
  vec2 uv = 2.0 * vUv - 1.0;
  vec3 w = pow(warp3d(vec3(uv.x, sin(uv.y), uv.y), iTime * 1.5), vec3(1.5));
  vec3 flame = 1.5 * uFlameA * w.x;
  flame *= w.y;
  flame += uFlameB * w.z;
  flame *= smoothstep(0.25, 1.0, abs(uv.y));
  float md = smoothstep(-0.7, 1.0, -uv.y * uv.x);
  flame *= md * md;
  vec3 bg = uBg * (1.0 - 0.4 * length(uv));
  vec3 halo = texture2D(haloTexture, vUv).xyz;
  gl_FragColor = vec4(bg + flame * uFlameAmt + texture2D(tDiffuse, vUv).xyz + halo, 1.0);
}
`;

const motesVertexShader = `
attribute float size;
attribute float seed;
uniform float uTime;
uniform vec2 uRes;
varying float vA;

vec3 warp(vec3 p, float t) {
  float c = 0.9, a = 1.9, b = 0.02, s = 0.05;
  p *= 2.0;
  p.x += c * sin(s * t + a * p.y) + t * b;
  p.y += c * cos(s * t + a * p.x);
  p.y += c * sin(s * t + a * p.z) + t * b;
  p.z += c * cos(s * t + a * p.y);
  p.z += c * sin(s * t + a * p.x) + t * b;
  p.x += c * cos(s * t + a * p.z);
  return cos(p + vec3(1, 2, 4));
}

void main() {
  vec3 v = position * 4.0 + warp(position, uTime) * 1.2;
  vec4 mv = modelViewMatrix * vec4(v, 1.0);
  float r = length(v);
  float farF = 1.0 - smoothstep(5.0, 6.5, r);
  float nearF = smoothstep(0.0, 0.5, -mv.z);
  vA = farF * nearF;
  gl_PointSize = size * uRes.y / 900.0 / -mv.z;
  gl_PointSize = max(gl_PointSize, 1.0);
  gl_Position = projectionMatrix * mv;
}
`;

const motesFragmentShader = `
uniform vec3 uColor;
varying float vA;
void main() {
  vec2 p = gl_PointCoord - 0.5;
  float l = length(p);
  if (l > 0.5) discard;
  float tex = smoothstep(0.5, 0.0, l);
  gl_FragColor = vec4(uColor * tex, tex * vA * 0.6);
}
`;

export const FlowWave: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDark] = useState(true);

  useEffect(() => {
    if (!isDark) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.0));
    renderer.setSize(width, height, false);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;

    // Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.fog = new THREE.Fog(0x000000, 0, 15);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 400);
    camera.position.set(0, camStartY, camStartZ);
    scene.add(camera);

    camera.layers.enable(LAYERS.TORUS_SCENE);
    camera.layers.enable(LAYERS.BLOOM_SCENE);
    camera.layers.enable(LAYERS.ENTIRE_SCENE);

    // Sea geometry - optimized to 20k vertices to maintain dense visuals with very low system load
    const pointsGeo = new THREE.SphereGeometry(4.2, 100, 200);
    const pointsMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uStream: { value: 0 },
        uAppear: { value: 0 },
        uColLow: { value: hexToVec3(colorLow) },
        uColHigh: { value: hexToVec3(colorHigh) },
        uOpacity: { value: opacity },
        uSize: { value: pointSize },
        uBrightness: { value: brightness },
        uWaveHeight: { value: waveHeight },
        uFlow: { value: flow },
        uScale: { value: scaleVal },
        uCursor: { value: new THREE.Vector3() },
        uRepelRadius: { value: pointerRadius },
        uRepelStrength: { value: pointerStrength },
        uActivity: { value: 0 },
      },
      vertexShader,
      fragmentShader,
    });

    const points = new THREE.Points(pointsGeo, pointsMat);
    points.frustumCulled = false;
    points.layers.enable(LAYERS.ENTIRE_SCENE);

    const group = new THREE.Group();
    group.add(points);
    scene.add(group);

    // Drifting Motes
    const N = Math.round(atmoCount);
    const motePositions = new Float32Array(N * 3);
    const moteSizes = new Float32Array(N);
    const moteSeeds = new Float32Array(N);

    for (let i = 0; i < N; i++) {
      motePositions[i * 3] = 2 * Math.random() - 1;
      motePositions[i * 3 + 1] = 2 * Math.random() - 1;
      motePositions[i * 3 + 2] = 2 * Math.random() - 1;
      moteSizes[i] = atmoSize * (0.4 + Math.random());
      moteSeeds[i] = Math.random();
    }

    const motesGeo = new THREE.BufferGeometry();
    motesGeo.setAttribute("position", new THREE.BufferAttribute(motePositions, 3));
    motesGeo.setAttribute("size", new THREE.BufferAttribute(moteSizes, 1));
    motesGeo.setAttribute("seed", new THREE.BufferAttribute(moteSeeds, 1));

    const motesMat = new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: hexToVec3(atmoColor) },
        uRes: { value: new THREE.Vector2(width * window.devicePixelRatio, height * window.devicePixelRatio) },
      },
      vertexShader: motesVertexShader,
      fragmentShader: motesFragmentShader,
    });

    const motes = new THREE.Points(motesGeo, motesMat);
    motes.frustumCulled = false;
    motes.layers.enable(LAYERS.ENTIRE_SCENE);
    scene.add(motes);

    motes.onBeforeRender = () => {
      const t = performance.now() / 1000;
      motesMat.uniforms.uTime.value = t * atmoSpeed * 8.0;
      motes.position.copy(camera.position);
      finalPass.uniforms.iTime.value = t;
    };

    // Post processing - optimized to use a single composer rendering the scene once, then applying shaders.
    const renderPass = new RenderPass(scene, camera);

    const finalPassShader = {
      uniforms: {
        tDiffuse: { value: null },
        bloomTexture: { value: null },
        torusTexture: { value: null },
        haloTexture: { value: createDummyTexture() },
        iTime: { value: 0 },
        uBg: { value: hexToVec3(bgColor) },
        uFlameA: { value: hexToVec3(flameColor) },
        uFlameB: { value: hexToVec3(flameColor2) },
        uFlameAmt: { value: flameAmt },
      },
      vertexShader: finalPassVertexShader,
      fragmentShader: finalPassFragmentShader,
    };

    const finalPass = new ShaderPass(finalPassShader);
    const finalComposer = new EffectComposer(renderer);
    finalComposer.addPass(renderPass);
    finalComposer.addPass(finalPass);

    const updateComposers = () => {
      // Compatibility no-op
    };
    updateComposers();

    // Scroll & Pointer tracking
    let scrollTarget = 0;
    let scrollSmooth = 0;
    let scrollCurrent = 0;

    const mouseTarget = { x: 0, y: 0 };
    const mouse = { x: 0, y: 0 };

    const POINTER = {
      world: new THREE.Vector3(),
      activity: 0,
      active: false,
      lastMove: performance.now(),
    };

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      scrollTarget = scrollHeight > 0 ? clamp(window.scrollY / scrollHeight, 0, 1) : 0;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseTarget.y = -((e.clientY / window.innerHeight) * 2 - 1);
      POINTER.active = true;
      POINTER.lastMove = performance.now();
    };

    const handleMouseLeave = () => {
      POINTER.active = false;
    };

    const handleMouseEnter = () => {
      POINTER.active = true;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave, { passive: true });
    document.addEventListener("mouseenter", handleMouseEnter, { passive: true });

    const _ndc = new THREE.Vector3();
    const _dir = new THREE.Vector3();
    const _tgt = new THREE.Vector3();

    function updatePointerWorld() {
      _tgt.set(0, 0, 0);
      if (POINTER.active) {
        _ndc.set(mouse.x, mouse.y, 0.5).unproject(camera);
        _dir.copy(_ndc).sub(camera.position).normalize();
        const dn = _dir.z;
        if (Math.abs(dn) > 1e-4) {
          const tt = -camera.position.z / dn;
          if (tt > 0 && Number.isFinite(tt)) {
            _tgt.copy(camera.position).addScaledVector(_dir, tt);
          }
        }
      }
      POINTER.world.lerp(_tgt, 0.12);
      const idle = (performance.now() - POINTER.lastMove) / 1000;
      POINTER.activity += (((POINTER.active && idle < 3) ? 1 : 0) - POINTER.activity) * 0.06;
    }

    let stream = 0;
    const appearStart = performance.now();
    let t0 = performance.now() / 1000;

    let animationFrameId: number;
    let lastRenderTime = performance.now();
    const fpsInterval = 1000 / 30; // Cap at 30 FPS to stop loud system cooling fans

    const render = () => {
      animationFrameId = requestAnimationFrame(render);

      const now = performance.now();
      const fpsElapsed = now - lastRenderTime;

      if (fpsElapsed < fpsInterval) return;

      lastRenderTime = now - (fpsElapsed % fpsInterval);

      scrollSmooth = Lerp(scrollSmooth, scrollTarget, 0.10);
      scrollCurrent = Lerp(scrollCurrent, scrollSmooth, 0.06);

      mouse.x = Lerp(mouse.x, mouseTarget.x, 0.06);
      mouse.y = Lerp(mouse.y, mouseTarget.y, 0.06);

      const t = now / 1000;
      const dt = Math.min(0.05, t - t0);
      t0 = t;

      pointsMat.uniforms.uTime.value = t;

      stream += dt * (flow * 2.0) * 4.0;
      pointsMat.uniforms.uStream.value = stream;

      pointsMat.uniforms.uWaveHeight.value = waveHeight * (1 + scrollCurrent * scrollRise);

      const ea = Math.min(scrollCurrent / 0.35, 1.0);
      const e = ea * ea * (3 - 2 * ea);
      const camY = Lerp(camStartY, camEndY, e);
      const camZ = Lerp(camStartZ, camEndZ, e);

      camera.position.set(mouse.x * parallax, camY + mouse.y * parallax * 0.3, camZ);
      camera.lookAt(mouse.x * parallax * 0.5, Lerp(0.0, 0.6, e), Lerp(lookStartZ, lookEndZ, e));

      group.rotation.x = -tilt;
      group.rotation.y = 0;

      updatePointerWorld();

      pointsMat.uniforms.uCursor.value.copy(POINTER.world);
      pointsMat.uniforms.uActivity.value = POINTER.activity;

      const elapsed = (performance.now() - appearStart) / 1000;
      pointsMat.uniforms.uAppear.value = Math.max(0, Math.min(1, (elapsed - 0.2) / 1.4));

      camera.layers.set(LAYERS.ENTIRE_SCENE);
      finalComposer.render();
    };

    render();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;

      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.0));
      renderer.setSize(width, height, false);

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      const dpr = Math.min(window.devicePixelRatio, 1.0);
      finalComposer.setPixelRatio(dpr);
      finalComposer.setSize(width, height);

      updateComposers();

      motesMat.uniforms.uRes.value.set(width * dpr, height * dpr);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      window.removeEventListener("resize", handleResize);

      pointsGeo.dispose();
      pointsMat.dispose();
      motesGeo.dispose();
      motesMat.dispose();
      renderer.dispose();
    };
  }, [isDark]);

  if (!isDark) return null;

  return (
    <canvas
      ref={canvasRef}
      id="scene"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
};

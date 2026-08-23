"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls, useGLTF } from "@react-three/drei";
import * as THREE from "three";

type CharacterModelProps = {
  /** URL under /public, e.g. "/models/male.glb" */
  url: string;
  /** Small thumbnail mode for selector cards */
  mode: "thumb" | "stage";
  /** Called when model fails to load so UI can fallback */
  onLoadError?: () => void;
};

function Glb({ url, onLoadError }: { url: string; onLoadError?: () => void }) {
  const gltf = useGLTF(url);

  useEffect(() => {
    try {
      gltf.scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => (m.side = THREE.FrontSide));
          } else if (mesh.material) {
            (mesh.material as THREE.Material).side = THREE.FrontSide;
          }
        }
      });
    } catch {
      onLoadError?.();
    }
  }, [gltf.scene, onLoadError]);

  return <primitive object={gltf.scene} />;
}

function ModelSafe({ url, onLoadError }: { url: string; onLoadError?: () => void }) {
  const [exists, setExists] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(url, { method: "HEAD" })
      .then((res) => {
        if (!cancelled) setExists(res.ok);
      })
      .catch(() => {
        if (!cancelled) setExists(false);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  if (exists === false) {
    onLoadError?.();
    return null;
  }

  if (exists === null) return null;

  try {
    return <Glb url={url} onLoadError={onLoadError} />;
  } catch {
    onLoadError?.();
    return null;
  }
}

export default function CharacterModel({ url, mode, onLoadError }: CharacterModelProps) {
  const camera = useMemo(() => {
    if (mode === "thumb") {
      return { position: [0, 1.3, 3.6] as [number, number, number], fov: 30 };
    }
    return { position: [0, 1.55, 3.2] as [number, number, number], fov: 35 };
  }, [mode]);

  return (
    <div className={mode === "thumb" ? "r3f-thumb" : "r3f-stage"}>
      <Canvas
        shadows
        camera={camera}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.7} />
        <directionalLight
          intensity={1.35}
          position={[2.2, 4.5, 2.6]}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        <Suspense fallback={null}>
          <group position={[0, -1.05, 0]}>
            <ModelSafe url={url} onLoadError={onLoadError} />
          </group>
          <Environment preset="city" />
          <ContactShadows opacity={0.35} blur={2.4} scale={8} far={6} />
        </Suspense>

        <OrbitControls
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          minDistance={mode === "thumb" ? 3.0 : 2.2}
          maxDistance={mode === "thumb" ? 5.5 : 4.8}
          minPolarAngle={Math.PI / 3.1}
          maxPolarAngle={Math.PI / 2.05}
        />
      </Canvas>
    </div>
  );
}

useGLTF.preload("/models/male.glb");
useGLTF.preload("/models/female.glb");


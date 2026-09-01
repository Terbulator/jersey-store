'use client';

import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  Environment,
  ContactShadows,
  Float,
  Html,
  useProgress,
  Preload,
  useGLTF,
} from '@react-three/drei';
import * as THREE from 'three';
import { cn } from '@/lib/utils';

export interface JerseyViewerProps {
  modelUrl?: string;
  color?: string;
  autoRotate?: boolean;
  enableZoom?: boolean;
  showEnvironment?: boolean;
  className?: string;
}

/* ------------------------------------------------------------------ */
/* Procedurally generated jersey mesh — used when no GLB model is set */
/* This guarantees the 3D viewer works out-of-the-box with no assets. */
/* ------------------------------------------------------------------ */
function ProceduralJersey({ color = '#16a34a' }: { color?: string }) {
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (group.current) {
      // Subtle breathing animation
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  // Build a stylized jersey from primitives
  return (
    <group ref={group} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      {/* Torso — main body */}
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[1.6, 2, 0.4]} />
        <meshStandardMaterial
          color={color}
          roughness={0.7}
          metalness={0.1}
          emissive={hovered ? color : '#000'}
          emissiveIntensity={hovered ? 0.2 : 0}
        />
      </mesh>

      {/* Collar */}
      <mesh position={[0, 1.05, 0.15]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.25, 0.05, 8, 16]} />
        <meshStandardMaterial color="#ffffff" roughness={0.6} />
      </mesh>

      {/* Sleeves */}
      <mesh castShadow position={[-1.05, 0.6, 0]} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[0.5, 1.2, 0.4]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh castShadow position={[1.05, 0.6, 0]} rotation={[0, 0, 0.4]}>
        <boxGeometry args={[0.5, 1.2, 0.4]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>

      {/* Sleeve cuffs */}
      <mesh position={[-1.25, 0.05, 0]}>
        <boxGeometry args={[0.1, 0.3, 0.4]} />
        <meshStandardMaterial color="#ffffff" roughness={0.6} />
      </mesh>
      <mesh position={[1.25, 0.05, 0]}>
        <boxGeometry args={[0.1, 0.3, 0.4]} />
        <meshStandardMaterial color="#ffffff" roughness={0.6} />
      </mesh>

      {/* Number on front */}
      <mesh position={[0, 0.1, 0.21]}>
        <planeGeometry args={[0.5, 0.6]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>
    </group>
  );
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 rounded-lg glass px-6 py-4">
        <div className="h-2 w-32 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">{progress.toFixed(0)}% loaded</p>
      </div>
    </Html>
  );
}

/* ------------------------------------------------------------------ */
/* Floating wrapper for the jersey model                              */
/* ------------------------------------------------------------------ */
function GltfModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
}

function ModelOrProcedural({ modelUrl, color }: { modelUrl?: string; color?: string }) {
  if (modelUrl) {
    return <GltfModel url={modelUrl} />;
  }
  return <ProceduralJersey color={color} />;
}

function FloatingJersey({ modelUrl, color }: { modelUrl?: string; color?: string }) {
  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
      <ModelOrProcedural modelUrl={modelUrl} color={color} />
    </Float>
  );
}

/* ------------------------------------------------------------------ */
/* Public viewer component                                            */
/* ------------------------------------------------------------------ */
export function JerseyViewer({
  modelUrl,
  color = '#16a34a',
  autoRotate = true,
  enableZoom = true,
  showEnvironment = true,
  className,
}: JerseyViewerProps) {
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) setWebglSupported(false);
    } catch {
      setWebglSupported(false);
    }
  }, []);

  if (!webglSupported) {
    return (
      <div className={cn('flex items-center justify-center bg-muted', className)}>
        <p className="text-sm text-muted-foreground">3D preview not available on this device</p>
      </div>
    );
  }

  return (
    <div className={cn('canvas-container relative h-full w-full', className)}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-5, 5, -5]} intensity={0.5} color="#a3e635" />

        {showEnvironment && (
          <Environment preset="studio" environmentIntensity={0.6} />
        )}

        <Suspense fallback={<Loader />}>
          <FloatingJersey modelUrl={modelUrl} color={color} />
          <ContactShadows
            position={[0, -1.5, 0]}
            opacity={0.4}
            scale={6}
            blur={2}
            far={2}
          />
        </Suspense>

        <OrbitControls
          enablePan={false}
          enableZoom={enableZoom}
          minDistance={3}
          maxDistance={8}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.8}
          autoRotate={autoRotate}
          autoRotateSpeed={0.8}
        />

        <Preload all />
      </Canvas>
    </div>
  );
}

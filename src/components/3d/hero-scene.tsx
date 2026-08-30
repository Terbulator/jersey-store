'use client';

import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  Environment,
  ContactShadows,
  Float,
  Html,
  useProgress,
} from '@react-three/drei';
import * as THREE from 'three';
import { cn } from '@/lib/utils';

interface JerseyProps {
  position: [number, number, number];
  color: string;
  rotation?: [number, number, number];
  scale?: number;
  delay?: number;
}

function AnimatedJersey({ position, color, rotation = [0, 0, 0], scale = 1, delay = 0 }: JerseyProps) {
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (group.current) {
      // Individual floating animation with delay
      const t = state.clock.elapsedTime + delay;
      group.current.position.y = position[1] + Math.sin(t * 0.8) * 0.15;
      group.current.rotation.y = rotation[1] + Math.sin(t * 0.3) * 0.1;
    }
  });

  return (
    <group
      ref={group}
      position={position}
      rotation={rotation}
      scale={scale}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
        <mesh castShadow>
          <boxGeometry args={[1.4, 1.8, 0.35]} />
          <meshStandardMaterial
            color={color}
            roughness={0.6}
            metalness={0.15}
            emissive={hovered ? color : '#000'}
            emissiveIntensity={hovered ? 0.3 : 0}
          />
        </mesh>
        {/* Sleeves */}
        <mesh position={[-0.95, 0.4, 0]} rotation={[0, 0, -0.4]}>
          <boxGeometry args={[0.4, 1, 0.35]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
        <mesh position={[0.95, 0.4, 0]} rotation={[0, 0, 0.4]}>
          <boxGeometry args={[0.4, 1, 0.35]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
        {/* Collar */}
        <mesh position={[0, 0.95, 0.1]}>
          <torusGeometry args={[0.22, 0.04, 8, 16]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
      </Float>
    </group>
  );
}

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="rounded-lg glass px-6 py-3 text-sm font-medium text-foreground">
        Loading 3D scene… {progress.toFixed(0)}%
      </div>
    </Html>
  );
}

export function HeroScene({ className }: { className?: string }) {
  const [webgl, setWebgl] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!gl) setWebgl(false);
    } catch {
      setWebgl(false);
    }
  }, []);

  if (!webgl) return null;

  return (
    <div className={cn('canvas-container h-full w-full', className)}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0.5, 8], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[3, 5, 4]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-3, 3, -4]} intensity={0.6} color="#60a5fa" />
        <pointLight position={[0, 2, 3]} intensity={0.4} color="#22c55e" />

        <Environment preset="city" environmentIntensity={0.5} />

        <AnimatedJersey
          position={[-2.5, 0.3, 0]}
          color="#dc2626"
          rotation={[0, 0.4, 0]}
          scale={0.85}
          delay={0}
        />
        <AnimatedJersey
          position={[0, 0, 0]}
          color="#16a34a"
          scale={1}
          delay={1.5}
        />
        <AnimatedJersey
          position={[2.5, 0.3, 0]}
          rotation={[0, -0.4, 0]}
          color="#2563eb"
          scale={0.85}
          delay={3}
        />

        <ContactShadows
          position={[0, -1.5, 0]}
          opacity={0.3}
          scale={12}
          blur={3}
          far={3}
        />

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          autoRotate
          autoRotateSpeed={0.4}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}

'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { memo, useMemo, useRef } from 'react';
import type { Mesh } from 'three';

interface AmbientSceneProps {
  pointer: { x: number; y: number };
  activeIndex: number;
}

interface OrbProps {
  position: [number, number, number];
  scale: number;
  speed: number;
  color: string;
  pointer: { x: number; y: number };
}

function Orb({ position, scale, speed, color, pointer }: OrbProps) {
  const ref = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) {
      return;
    }

    const elapsed = clock.getElapsedTime() * speed;
    ref.current.position.x = position[0] + Math.sin(elapsed) * 0.28 + pointer.x * 0.32;
    ref.current.position.y = position[1] + Math.cos(elapsed * 0.82) * 0.2 + pointer.y * 0.24;
    ref.current.rotation.x = elapsed * 0.22;
    ref.current.rotation.y = elapsed * 0.3;
  });

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color={color} roughness={0.34} metalness={0.16} transparent opacity={0.42} />
    </mesh>
  );
}

function Scene({ pointer, activeIndex }: AmbientSceneProps) {
  const orbs = useMemo(
    () =>
      Array.from({ length: 10 }, (_, index) => ({
        position: [
          ((index * 2.71) % 7) - 3.5,
          ((index * 1.93) % 4) - 2,
          -3 - ((index * 1.37) % 4),
        ] as [number, number, number],
        scale: 0.08 + (index % 4) * 0.035,
        speed: 0.42 + (index % 5) * 0.08,
        color: index % 3 === 0 ? '#ff7a00' : index % 3 === 1 ? '#f5d5a0' : '#ffffff',
      })),
    [],
  );

  return (
    <>
      <ambientLight intensity={0.85} />
      <pointLight position={[2.8, 2.8, 2]} intensity={12 + activeIndex * 0.2} color="#ff7a00" />
      <pointLight position={[-3, -1.8, -2]} intensity={4} color="#fff3df" />
      {orbs.map((orb, index) => (
        <Orb key={index} {...orb} pointer={pointer} />
      ))}
    </>
  );
}

export const AmbientScene = memo(function AmbientScene(props: AmbientSceneProps) {
  return (
    <Canvas
      className="pointer-events-none absolute inset-0"
      camera={{ position: [0, 0, 5.5], fov: 48 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <Scene {...props} />
    </Canvas>
  );
});

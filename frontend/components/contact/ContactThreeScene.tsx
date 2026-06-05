'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { memo, useRef } from 'react';
import type { Group, Mesh } from 'three';

function FloatingPin() {
  const group = useRef<Group>(null);
  const ring = useRef<Mesh>(null);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();

    if (group.current) {
      group.current.position.y = Math.sin(elapsed * 0.85) * 0.12;
      group.current.rotation.y = elapsed * 0.22;
      group.current.rotation.z = Math.sin(elapsed * 0.6) * 0.05;
    }

    if (ring.current) {
      ring.current.rotation.z = elapsed * 0.5;
      ring.current.scale.setScalar(1 + Math.sin(elapsed * 1.3) * 0.04);
    }
  });

  return (
    <group ref={group} position={[1.9, 0.35, -1.2]} rotation={[0.2, -0.4, 0]}>
      <mesh position={[0, 0.24, 0]}>
        <sphereGeometry args={[0.34, 32, 32]} />
        <meshStandardMaterial color="#ff7a00" roughness={0.38} metalness={0.18} />
      </mesh>
      <mesh position={[0, -0.34, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.26, 0.72, 32]} />
        <meshStandardMaterial color="#ff7a00" roughness={0.42} metalness={0.12} />
      </mesh>
      <mesh position={[0, 0.24, 0.03]}>
        <sphereGeometry args={[0.14, 24, 24]} />
        <meshStandardMaterial color="#050505" roughness={0.5} />
      </mesh>
      <mesh ref={ring} position={[0, -0.78, -0.04]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.46, 0.018, 12, 64]} />
        <meshStandardMaterial color="#fff3df" emissive="#ff7a00" emissiveIntensity={0.25} transparent opacity={0.48} />
      </mesh>
    </group>
  );
}

function RoutePlane() {
  const ref = useRef<Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) {
      return;
    }

    ref.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.28) * 0.035;
  });

  return (
    <group ref={ref} position={[-1.9, -0.35, -2.25]} rotation={[1.1, 0, -0.14]}>
      <mesh>
        <boxGeometry args={[3.6, 2.2, 0.035]} />
        <meshStandardMaterial color="#101416" roughness={0.82} metalness={0.05} transparent opacity={0.62} />
      </mesh>
      {[-1.1, -0.3, 0.55, 1.18].map((x, index) => (
        <mesh key={`road-x-${index}`} position={[x, 0, 0.04]} rotation={[0, 0, index % 2 ? 0.16 : -0.18]}>
          <boxGeometry args={[0.035, 2.45, 0.018]} />
          <meshStandardMaterial color="#2c2c2c" roughness={0.55} transparent opacity={0.8} />
        </mesh>
      ))}
      {[-0.72, 0.05, 0.78].map((y, index) => (
        <mesh key={`road-y-${index}`} position={[0, y, 0.05]} rotation={[0, 0, index % 2 ? -0.11 : 0.08]}>
          <boxGeometry args={[3.8, 0.035, 0.018]} />
          <meshStandardMaterial color="#2c2c2c" roughness={0.55} transparent opacity={0.72} />
        </mesh>
      ))}
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight position={[2, 3, 3]} intensity={2.8} color="#fff3df" />
      <pointLight position={[2.4, 0.8, 1.8]} intensity={12} color="#ff7a00" />
      <RoutePlane />
      <FloatingPin />
    </>
  );
}

export const ContactThreeScene = memo(function ContactThreeScene() {
  return (
    <Canvas
      className="pointer-events-none absolute inset-0"
      camera={{ position: [0, 0, 5.2], fov: 46 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <Scene />
    </Canvas>
  );
});

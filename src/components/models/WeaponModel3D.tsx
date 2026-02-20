// ============================================
// 3D Weapon Models — GLB + Procedural Fallback
// ============================================

import React, { useRef, Suspense, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

interface WeaponModelProps {
  weaponId: string;
  rotate?: boolean;
  scale?: number;
}

// GLB file mapping
const WEAPON_GLB_MAP: Record<string, string> = {
  k416: '/Models/weapons/rifle__m4a1-s_weapon_model_cs2.glb',
  ak_death: '/Models/weapons/ak-47disassembly_of_weapons.glb',
  awm_x: '/Models/weapons/rifle__awp_weapon_model_cs2.glb',
  vector_neon: '/Models/weapons/animated_pp-19-01.glb',
  s12_breacher: '/Models/weapons/shotgun_mr-133_animated.glb',
};

// GLB scale/offset tuning per weapon
const WEAPON_GLB_CONFIG: Record<string, { scale: number; position: [number, number, number]; rotation: [number, number, number] }> = {
  k416: { scale: 0.8, position: [0, -0.1, 0], rotation: [0, 0, 0] },
  ak_death: { scale: 0.8, position: [0, -0.1, 0], rotation: [0, 0, 0] },
  awm_x: { scale: 0.6, position: [0, -0.1, 0], rotation: [0, 0, 0] },
  vector_neon: { scale: 0.9, position: [0, -0.1, 0], rotation: [0, 0, 0] },
  s12_breacher: { scale: 0.8, position: [0, -0.1, 0], rotation: [0, 0, 0] },
};

// ---- GLB Loader Component ----
const GLBWeapon: React.FC<{ weaponId: string; scale: number }> = ({ weaponId, scale }) => {
  const path = WEAPON_GLB_MAP[weaponId];
  const { scene } = useGLTF(path);
  const config = WEAPON_GLB_CONFIG[weaponId] ?? { scale: 1, position: [0, 0, 0] as [number, number, number], rotation: [0, 0, 0] as [number, number, number] };

  const cloned = React.useMemo(() => scene.clone(), [scene]);

  return (
    <primitive
      object={cloned}
      scale={config.scale * scale}
      position={config.position}
      rotation={config.rotation}
    />
  );
};

// ---- Procedural Fallback Models ----
const K416Model = ({ scale = 1 }: { scale: number }) => (
  <group scale={scale}>
    <mesh position={[0, 0, 0]}><boxGeometry args={[1.6, 0.22, 0.18]} /><meshStandardMaterial color="#2a2a2a" roughness={0.3} metalness={0.8} /></mesh>
    <mesh position={[0.1, 0.14, 0]}><boxGeometry args={[1.0, 0.04, 0.12]} /><meshStandardMaterial color="#333333" roughness={0.4} metalness={0.9} /></mesh>
    <mesh position={[1.1, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.035, 0.04, 0.7, 8]} /><meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.95} /></mesh>
    <mesh position={[-0.1, -0.2, 0]} rotation={[0, 0, 0.08]}><boxGeometry args={[0.12, 0.32, 0.1]} /><meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.6} /></mesh>
    <mesh position={[-0.95, 0.02, 0]}><boxGeometry args={[0.5, 0.16, 0.08]} /><meshStandardMaterial color="#333333" roughness={0.6} metalness={0.4} /></mesh>
    <mesh position={[-0.3, -0.18, 0]} rotation={[0, 0, -0.3]}><boxGeometry args={[0.08, 0.22, 0.1]} /><meshStandardMaterial color="#1a1a1a" roughness={0.7} metalness={0.3} /></mesh>
    <mesh position={[0.15, 0.24, 0]}><sphereGeometry args={[0.015, 8, 8]} /><meshStandardMaterial color="#ff2200" emissive="#ff2200" emissiveIntensity={2} /></mesh>
  </group>
);

const AKDeathModel = ({ scale = 1 }: { scale: number }) => (
  <group scale={scale}>
    <mesh position={[0, 0, 0]}><boxGeometry args={[1.5, 0.24, 0.2]} /><meshStandardMaterial color="#1a1a1a" roughness={0.35} metalness={0.85} /></mesh>
    <mesh position={[1.15, 0, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.04, 0.045, 0.8, 8]} /><meshStandardMaterial color="#111111" roughness={0.2} metalness={0.95} /></mesh>
    <mesh position={[-0.05, -0.25, 0]} rotation={[0, 0, 0.15]}><boxGeometry args={[0.14, 0.36, 0.1]} /><meshStandardMaterial color="#111" roughness={0.5} metalness={0.7} /></mesh>
    <mesh position={[0.45, -0.06, 0]}><boxGeometry args={[0.5, 0.14, 0.16]} /><meshStandardMaterial color="#6b3a1a" roughness={0.7} metalness={0.1} /></mesh>
    <mesh position={[-1.0, 0.0, 0]}><boxGeometry args={[0.6, 0.15, 0.08]} /><meshStandardMaterial color="#6b3a1a" roughness={0.7} metalness={0.1} /></mesh>
    <mesh position={[-0.3, -0.2, 0]} rotation={[0, 0, -0.25]}><boxGeometry args={[0.08, 0.24, 0.1]} /><meshStandardMaterial color="#1a1a1a" roughness={0.6} metalness={0.3} /></mesh>
    <mesh position={[1.55, 0, 0]}><sphereGeometry args={[0.02, 6, 6]} /><meshStandardMaterial color="#ff4400" emissive="#ff4400" emissiveIntensity={1.5} /></mesh>
  </group>
);

const AWMXModel = ({ scale = 1 }: { scale: number }) => (
  <group scale={scale}>
    <mesh position={[0, 0, 0]}><boxGeometry args={[1.2, 0.2, 0.16]} /><meshStandardMaterial color="#1a1a1a" roughness={0.25} metalness={0.9} /></mesh>
    <mesh position={[1.3, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.035, 0.04, 1.4, 8]} /><meshStandardMaterial color="#111" roughness={0.15} metalness={0.95} /></mesh>
    <mesh position={[0.1, 0.2, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.055, 0.055, 0.5, 12]} /><meshStandardMaterial color="#111" roughness={0.2} metalness={0.9} /></mesh>
    <mesh position={[0.39, 0.2, 0]}><circleGeometry args={[0.05, 12]} /><meshStandardMaterial color="#00ccff" emissive="#00ccff" emissiveIntensity={0.8} transparent opacity={0.6} side={THREE.DoubleSide} /></mesh>
    <mesh position={[0.0, -0.18, 0]}><boxGeometry args={[0.14, 0.2, 0.1]} /><meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.7} /></mesh>
    <mesh position={[-0.9, 0, 0]}><boxGeometry args={[0.6, 0.18, 0.1]} /><meshStandardMaterial color="#1a1a1a" roughness={0.5} metalness={0.6} /></mesh>
    <mesh position={[-0.35, -0.18, 0]} rotation={[0, 0, -0.2]}><boxGeometry args={[0.08, 0.22, 0.1]} /><meshStandardMaterial color="#1a1a1a" roughness={0.7} metalness={0.3} /></mesh>
  </group>
);

const VectorNeonModel = ({ scale = 1 }: { scale: number }) => (
  <group scale={scale}>
    <mesh position={[0, 0.05, 0]} rotation={[0, 0, -0.05]}><boxGeometry args={[1.0, 0.28, 0.16]} /><meshStandardMaterial color="#0a0a1a" roughness={0.3} metalness={0.85} /></mesh>
    <mesh position={[0.65, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.04, 0.05, 0.4, 8]} /><meshStandardMaterial color="#111" roughness={0.25} metalness={0.9} /></mesh>
    {[0.12, 0, -0.12].map((y, i) => (
      <mesh key={i} position={[0.2, y + 0.05, 0.085]}><boxGeometry args={[0.5, 0.015, 0.005]} /><meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={2} /></mesh>
    ))}
    <mesh position={[0.0, -0.2, 0]}><boxGeometry args={[0.1, 0.28, 0.08]} /><meshStandardMaterial color="#0a0a0a" roughness={0.5} metalness={0.7} /></mesh>
    <mesh position={[-0.2, -0.14, 0]} rotation={[0, 0, -0.15]}><boxGeometry args={[0.07, 0.2, 0.09]} /><meshStandardMaterial color="#0a0a1a" roughness={0.6} metalness={0.3} /></mesh>
    <mesh position={[0.05, 0.26, 0]}><sphereGeometry args={[0.012, 6, 6]} /><meshStandardMaterial color="#00ff88" emissive="#00ff88" emissiveIntensity={3} /></mesh>
  </group>
);

const S12BreacherModel = ({ scale = 1 }: { scale: number }) => (
  <group scale={scale}>
    <mesh position={[0, 0, 0]}><boxGeometry args={[1.3, 0.26, 0.22]} /><meshStandardMaterial color="#2a1a1a" roughness={0.35} metalness={0.8} /></mesh>
    <mesh position={[0.95, 0.02, 0]} rotation={[0, 0, Math.PI / 2]}><cylinderGeometry args={[0.06, 0.065, 0.6, 8]} /><meshStandardMaterial color="#1a0a0a" roughness={0.2} metalness={0.9} /></mesh>
    <mesh position={[0.05, -0.22, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.14, 0.14, 0.1, 16]} /><meshStandardMaterial color="#111" roughness={0.4} metalness={0.8} /></mesh>
    <mesh position={[0.05, -0.22, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.04, 0.04, 0.12, 8]} /><meshStandardMaterial color="#cc3300" emissive="#ff4400" emissiveIntensity={0.5} /></mesh>
    <mesh position={[-0.85, 0, 0]}><boxGeometry args={[0.45, 0.18, 0.1]} /><meshStandardMaterial color="#2a1a1a" roughness={0.5} metalness={0.5} /></mesh>
    <mesh position={[-0.3, -0.18, 0]} rotation={[0, 0, -0.2]}><boxGeometry args={[0.09, 0.22, 0.11]} /><meshStandardMaterial color="#1a0a0a" roughness={0.7} metalness={0.3} /></mesh>
    <pointLight position={[0.05, -0.22, 0]} color="#ff4400" intensity={0.3} distance={0.5} />
  </group>
);

const PROCEDURAL_WEAPONS: Record<string, React.FC<{ scale: number }>> = {
  k416: K416Model,
  ak_death: AKDeathModel,
  awm_x: AWMXModel,
  vector_neon: VectorNeonModel,
  s12_breacher: S12BreacherModel,
};

// Error boundary for GLB loading failures
class GLBErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

const WeaponModel3D: React.FC<WeaponModelProps> = ({ weaponId, rotate = true, scale = 1 }) => {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (rotate && groupRef.current) groupRef.current.rotation.y += delta * 0.5;
  });

  const ProceduralModel = PROCEDURAL_WEAPONS[weaponId];
  const hasGLB = weaponId in WEAPON_GLB_MAP;

  const fallback = ProceduralModel ? <ProceduralModel scale={scale} /> : null;

  return (
    <group ref={groupRef}>
      {hasGLB ? (
        <GLBErrorBoundary fallback={fallback}>
          <Suspense fallback={fallback}>
            <GLBWeapon weaponId={weaponId} scale={scale} />
          </Suspense>
        </GLBErrorBoundary>
      ) : fallback}
    </group>
  );
};

export default WeaponModel3D;

// Preload GLB files
Object.values(WEAPON_GLB_MAP).forEach(path => {
  try { useGLTF.preload(path); } catch {}
});

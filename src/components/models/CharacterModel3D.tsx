// ============================================
// 3D Character Models — GLB + Procedural Fallback
// ============================================

import React, { useRef, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import type { CharacterDef } from '@/lib/gameRegistry';

interface CharacterModelProps {
  character: CharacterDef;
  rotate?: boolean;
  scale?: number;
  skinLevel?: number;
}

// GLB file mapping
const CHARACTER_GLB_MAP: Record<string, string> = {
  ghost_riley: '/Models/Characters/snake_eyes__fortnite_item_shop_skin.glb',
  nova_prime: '/Models/Characters/fortnite_oblivion_skin.glb',
  viper_snake: '/Models/Characters/torin__fortnite_chapter_2_season_8_bp_skin.glb',
  shadow_exe: '/Models/Characters/the_omega_tier_100_skin_fortnite_3d_model.glb',
};

const CHARACTER_GLB_CONFIG: Record<string, { scale: number; position: [number, number, number] }> = {
  ghost_riley: { scale: 0.5, position: [0, -0.8, 0] },
  nova_prime: { scale: 0.5, position: [0, -0.8, 0] },
  viper_snake: { scale: 0.5, position: [0, -0.8, 0] },
  shadow_exe: { scale: 0.5, position: [0, -0.8, 0] },
};

// ---- GLB Loader ----
const GLBCharacter: React.FC<{ characterId: string; scale: number }> = ({ characterId, scale }) => {
  const path = CHARACTER_GLB_MAP[characterId];
  const { scene } = useGLTF(path);
  const config = CHARACTER_GLB_CONFIG[characterId] ?? { scale: 0.5, position: [0, -0.8, 0] as [number, number, number] };
  const cloned = React.useMemo(() => scene.clone(), [scene]);

  return (
    <primitive
      object={cloned}
      scale={config.scale * scale}
      position={config.position}
    />
  );
};

// ---- Procedural Fallbacks (condensed) ----
const GhostRileyModel = ({ colors, ei }: { colors: CharacterDef['colors']; ei: number }) => (
  <group>
    <mesh position={[-0.12, -0.75, 0]}><boxGeometry args={[0.18, 0.18, 0.26]} /><meshStandardMaterial color="#111" roughness={0.7} metalness={0.5} /></mesh>
    <mesh position={[0.12, -0.75, 0]}><boxGeometry args={[0.18, 0.18, 0.26]} /><meshStandardMaterial color="#111" roughness={0.7} metalness={0.5} /></mesh>
    <mesh position={[-0.1, -0.45, 0]}><boxGeometry args={[0.16, 0.45, 0.16]} /><meshStandardMaterial color={colors.primary} roughness={0.6} /></mesh>
    <mesh position={[0.1, -0.45, 0]}><boxGeometry args={[0.16, 0.45, 0.16]} /><meshStandardMaterial color={colors.primary} roughness={0.6} /></mesh>
    <mesh position={[0, 0.05, 0]}><boxGeometry args={[0.48, 0.55, 0.28]} /><meshStandardMaterial color={colors.secondary} roughness={0.4} metalness={0.7} /></mesh>
    <mesh position={[0, 0.12, 0.12]}><boxGeometry args={[0.36, 0.32, 0.08]} /><meshStandardMaterial color={colors.accent} roughness={0.3} metalness={0.9} /></mesh>
    <mesh position={[-0.3, -0.1, 0]}><boxGeometry args={[0.12, 0.4, 0.12]} /><meshStandardMaterial color={colors.primary} roughness={0.6} /></mesh>
    <mesh position={[0.3, -0.1, 0]}><boxGeometry args={[0.12, 0.4, 0.12]} /><meshStandardMaterial color={colors.primary} roughness={0.6} /></mesh>
    <mesh position={[0, 0.52, 0]}><boxGeometry args={[0.24, 0.24, 0.24]} /><meshStandardMaterial color={colors.primary} roughness={0.5} /></mesh>
    <mesh position={[-0.04, 0.52, 0.135]}><sphereGeometry args={[0.02, 6, 6]} /><meshStandardMaterial color={colors.emissive} emissive={colors.emissive} emissiveIntensity={ei * 2} /></mesh>
    <mesh position={[0.04, 0.52, 0.135]}><sphereGeometry args={[0.02, 6, 6]} /><meshStandardMaterial color={colors.emissive} emissive={colors.emissive} emissiveIntensity={ei * 2} /></mesh>
  </group>
);

const NovaPrimeModel = ({ colors, ei }: { colors: CharacterDef['colors']; ei: number }) => (
  <group>
    <mesh position={[-0.08, -0.45, 0]}><boxGeometry args={[0.12, 0.45, 0.13]} /><meshStandardMaterial color={colors.primary} roughness={0.4} metalness={0.5} /></mesh>
    <mesh position={[0.08, -0.45, 0]}><boxGeometry args={[0.12, 0.45, 0.13]} /><meshStandardMaterial color={colors.primary} roughness={0.4} metalness={0.5} /></mesh>
    <mesh position={[0, 0.05, 0]}><boxGeometry args={[0.38, 0.5, 0.22]} /><meshStandardMaterial color={colors.primary} roughness={0.3} metalness={0.7} /></mesh>
    <mesh position={[0, 0.1, 0.115]}><boxGeometry args={[0.02, 0.4, 0.005]} /><meshStandardMaterial color={colors.accent} emissive={colors.emissive} emissiveIntensity={ei} /></mesh>
    <mesh position={[-0.24, -0.1, 0]}><boxGeometry args={[0.1, 0.38, 0.1]} /><meshStandardMaterial color={colors.primary} roughness={0.4} /></mesh>
    <mesh position={[0.24, -0.1, 0]}><boxGeometry args={[0.1, 0.38, 0.1]} /><meshStandardMaterial color={colors.primary} roughness={0.4} /></mesh>
    <mesh position={[0, 0.48, 0]}><sphereGeometry args={[0.14, 12, 12]} /><meshStandardMaterial color={colors.secondary} roughness={0.2} metalness={0.8} /></mesh>
    <mesh position={[0, 0.47, 0.1]}><boxGeometry args={[0.22, 0.06, 0.04]} /><meshStandardMaterial color={colors.accent} emissive={colors.emissive} emissiveIntensity={ei * 1.5} transparent opacity={0.8} /></mesh>
  </group>
);

const ViperSnakeModel = ({ colors, ei }: { colors: CharacterDef['colors']; ei: number }) => (
  <group>
    <mesh position={[-0.07, -0.45, 0]}><boxGeometry args={[0.1, 0.45, 0.11]} /><meshStandardMaterial color={colors.primary} roughness={0.6} /></mesh>
    <mesh position={[0.07, -0.45, 0]}><boxGeometry args={[0.1, 0.45, 0.11]} /><meshStandardMaterial color={colors.primary} roughness={0.6} /></mesh>
    <mesh position={[0, 0.05, 0]}><boxGeometry args={[0.32, 0.45, 0.18]} /><meshStandardMaterial color={colors.secondary} roughness={0.5} metalness={0.3} /></mesh>
    <mesh position={[-0.2, -0.1, 0]}><boxGeometry args={[0.09, 0.36, 0.09]} /><meshStandardMaterial color={colors.primary} roughness={0.6} /></mesh>
    <mesh position={[0.2, -0.1, 0]}><boxGeometry args={[0.09, 0.36, 0.09]} /><meshStandardMaterial color={colors.primary} roughness={0.6} /></mesh>
    <mesh position={[0, 0.45, 0]}><boxGeometry args={[0.2, 0.22, 0.2]} /><meshStandardMaterial color={colors.primary} roughness={0.7} /></mesh>
    <mesh position={[-0.04, 0.6, 0.09]}><sphereGeometry args={[0.02, 6, 6]} /><meshStandardMaterial color={colors.accent} emissive={colors.emissive} emissiveIntensity={ei} /></mesh>
    <mesh position={[0.04, 0.6, 0.09]}><sphereGeometry args={[0.02, 6, 6]} /><meshStandardMaterial color={colors.accent} emissive={colors.emissive} emissiveIntensity={ei} /></mesh>
  </group>
);

const ShadowExeModel = ({ colors, ei }: { colors: CharacterDef['colors']; ei: number }) => (
  <group>
    <mesh position={[-0.08, -0.45, 0]}><boxGeometry args={[0.12, 0.45, 0.12]} /><meshStandardMaterial color={colors.primary} roughness={0.4} metalness={0.5} /></mesh>
    <mesh position={[0.08, -0.45, 0]}><boxGeometry args={[0.12, 0.45, 0.12]} /><meshStandardMaterial color={colors.primary} roughness={0.4} metalness={0.5} /></mesh>
    <mesh position={[0, 0.05, 0]}><boxGeometry args={[0.4, 0.5, 0.22]} /><meshStandardMaterial color={colors.secondary} roughness={0.3} metalness={0.7} /></mesh>
    {[-0.12, 0, 0.12].map((y, i) => (
      <mesh key={i} position={[0, y + 0.05, 0.115]}><boxGeometry args={[0.3, 0.008, 0.005]} /><meshStandardMaterial color={colors.accent} emissive={colors.emissive} emissiveIntensity={ei * 1.5} /></mesh>
    ))}
    <mesh position={[-0.24, -0.1, 0]}><boxGeometry args={[0.1, 0.36, 0.1]} /><meshStandardMaterial color={colors.primary} roughness={0.4} /></mesh>
    <mesh position={[0.24, -0.1, 0]}><boxGeometry args={[0.1, 0.36, 0.1]} /><meshStandardMaterial color={colors.primary} roughness={0.4} /></mesh>
    <mesh position={[0, 0.48, 0]}><boxGeometry args={[0.24, 0.24, 0.22]} /><meshStandardMaterial color={colors.secondary} roughness={0.25} metalness={0.8} /></mesh>
    <mesh position={[0, 0.47, 0.115]} rotation={[0.1, 0, 0]}><boxGeometry args={[0.22, 0.08, 0.02]} /><meshStandardMaterial color={colors.accent} emissive={colors.emissive} emissiveIntensity={ei * 2} transparent opacity={0.7} /></mesh>
  </group>
);

const PROCEDURAL_CHARACTERS: Record<string, React.FC<{ colors: CharacterDef['colors']; ei: number }>> = {
  ghost_riley: GhostRileyModel,
  nova_prime: NovaPrimeModel,
  viper_snake: ViperSnakeModel,
  shadow_exe: ShadowExeModel,
};

// Error boundary
class GLBErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

const CharacterModel3D: React.FC<CharacterModelProps> = ({ character, rotate = true, scale = 1, skinLevel = 1 }) => {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (rotate && groupRef.current) groupRef.current.rotation.y += delta * 0.4;
  });

  const emissiveIntensity = 0.3 + (skinLevel - 1) * 0.5;
  const ProceduralModel = PROCEDURAL_CHARACTERS[character.id];
  const hasGLB = character.id in CHARACTER_GLB_MAP;

  const fallback = ProceduralModel ? <ProceduralModel colors={character.colors} ei={emissiveIntensity} /> : null;

  return (
    <group ref={groupRef} scale={scale}>
      {hasGLB ? (
        <GLBErrorBoundary fallback={fallback}>
          <Suspense fallback={fallback}>
            <GLBCharacter characterId={character.id} scale={1} />
          </Suspense>
        </GLBErrorBoundary>
      ) : fallback}
    </group>
  );
};

export default CharacterModel3D;

// Preload
Object.values(CHARACTER_GLB_MAP).forEach(path => {
  try { useGLTF.preload(path); } catch {}
});

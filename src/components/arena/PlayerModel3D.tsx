import React, { useRef, useMemo, Suspense } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { createProceduralCharacter } from '@/lib/ProceduralCharacter';
import { createProceduralWeapon, ProceduralWeaponType } from '@/lib/ProceduralWeapons';
import { CHARACTERS } from '@/lib/gameRegistry';
import { AssetManager } from '@/lib/AssetManager';

interface PlayerModel3DProps {
  position: [number, number, number];
  rotation: number;
  team: 'blue' | 'red';
  skinLevel: number;
  health: number;
  isDead: boolean;
  isLocal: boolean;
  characterId?: string;
  weaponType?: ProceduralWeaponType;
}

const TEAM_COLORS = { blue: '#4d8fff', red: '#ff4d4d' };
const LEVEL_EMISSIVE: Record<number, string> = {
  1: '#000000',
  2: '#00ff88',
  3: '#00ccff',
  4: '#ff8800',
  5: '#ff00ff',
};

// Character GLB mapping
const CHARACTER_GLB_MAP: Record<string, string> = {
  ghost_riley: '/Models/Characters/snake_eyes__fortnite_item_shop_skin.glb',
  nova_prime: '/Models/Characters/fortnite_oblivion_skin.glb',
  viper_snake: '/Models/Characters/torin__fortnite_chapter_2_season_8_bp_skin.glb',
  shadow_exe: '/Models/Characters/the_omega_tier_100_skin_fortnite_3d_model.glb',
  midas_gold: '/Models/Characters/midas__fortnite_100_tier_s12_bp_skin.glb',
  marigold: '/Models/Characters/marigold_fortnite_skin__female_midas.glb',
  glow_phantom: '/Models/Characters/glow__fortnite_outfit.glb',
};

const PlayerModel3D: React.FC<PlayerModel3DProps> = ({
  position, rotation, team, skinLevel, health, isDead, isLocal, characterId, weaponType = 'assault_rifle',
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  const teamColor = TEAM_COLORS[team];
  const emissiveColor = LEVEL_EMISSIVE[Math.min(5, Math.max(1, skinLevel))];
  const emissiveIntensity = skinLevel >= 2 ? 0.3 * (skinLevel - 1) : 0;

  // Get character colors from registry
  const charDef = characterId ? CHARACTERS.find(c => c.id === characterId) : undefined;

  // Create procedural character (always available, used as base/fallback)
  const proceduralBody = useMemo(() => {
    const colors = charDef?.colors ?? {
      primary: team === 'blue' ? '#1a2a4a' : '#4a1a1a',
      secondary: team === 'blue' ? '#2a3a5a' : '#5a2a2a',
      accent: teamColor,
      emissive: emissiveColor,
    };
    return createProceduralCharacter(colors, charDef?.armorStyle ?? 'medium');
  }, [team, characterId, emissiveColor]);

  // Create procedural weapon
  const weaponMesh = useMemo(() => {
    return createProceduralWeapon(weaponType);
  }, [weaponType]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = -rotation + Math.PI / 2;
    }
    if (ringRef.current) {
      ringRef.current.rotation.y += delta * 2;
    }
  });

  if (isDead) {
    return (
      <group position={position}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <circleGeometry args={[0.8, 16]} />
          <meshBasicMaterial color="#ff3333" transparent opacity={0.3} />
        </mesh>
      </group>
    );
  }

  return (
    <group position={position} ref={groupRef}>
      {/* Procedural character body */}
      <primitive object={proceduralBody} scale={0.6} />

      {/* Procedural weapon attached to right side */}
      <group position={[0.2, 0.5, -0.4]} rotation={[0, 0, 0]}>
        <primitive object={weaponMesh} scale={0.6} />
      </group>

      {/* Local player indicator ring */}
      {isLocal && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[0.9, 1.0, 32]} />
          <meshBasicMaterial color="#00ff88" transparent opacity={0.5} />
        </mesh>
      )}

      {/* Level 4+ rotating ring */}
      {skinLevel >= 4 && (
        <mesh ref={ringRef} position={[0, 1.2, 0]} rotation={[Math.PI / 4, 0, 0]}>
          <torusGeometry args={[0.7, 0.03, 8, 32]} />
          <meshBasicMaterial color={emissiveColor} transparent opacity={0.7} />
        </mesh>
      )}

      {/* Level 5 sparkles */}
      {skinLevel >= 5 && (
        <Sparkles count={20} scale={2} size={3} speed={0.4} color={emissiveColor} position={[0, 0.8, 0]} />
      )}

      {/* Health bar */}
      {health < 100 && health > 0 && (
        <group position={[0, 2, 0]}>
          <mesh>
            <planeGeometry args={[1.2, 0.1]} />
            <meshBasicMaterial color="#222222" />
          </mesh>
          <mesh position={[(health / 100 - 1) * 0.6, 0, 0.001]}>
            <planeGeometry args={[1.2 * (health / 100), 0.1]} />
            <meshBasicMaterial color={health > 50 ? '#00ff44' : health > 20 ? '#ffcc00' : '#ff3333'} />
          </mesh>
        </group>
      )}
    </group>
  );
};

export default React.memo(PlayerModel3D);

import React from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LootItem } from '@/lib/weapons';
import { MAP_WIDTH, MAP_HEIGHT } from '@/hooks/useGameLoop';

interface Loot3DProps {
  items: LootItem[];
}

// Distinct colors and shapes per loot type
const LOOT_STYLE: Record<string, { color: string; emissive: string; shape: 'box' | 'sphere' | 'cylinder'; scaleY: number }> = {
  weapon: { color: '#ffc832', emissive: '#ffa500', shape: 'box', scaleY: 1 },
  medkit: { color: '#32ff64', emissive: '#00ff44', shape: 'sphere', scaleY: 1 },
  armor: { color: '#3264ff', emissive: '#2244ff', shape: 'cylinder', scaleY: 0.6 },
  ammo_556: { color: '#ddcc44', emissive: '#ccbb33', shape: 'box', scaleY: 0.6 },
  ammo_762: { color: '#cc8844', emissive: '#bb7733', shape: 'box', scaleY: 0.6 },
  ammo_9mm: { color: '#aaaacc', emissive: '#8888aa', shape: 'box', scaleY: 0.5 },
  ammo_300: { color: '#44dddd', emissive: '#33cccc', shape: 'box', scaleY: 0.8 },
  ammo_12g: { color: '#dd4444', emissive: '#cc3333', shape: 'box', scaleY: 0.7 },
};

const LootMesh: React.FC<{ item: LootItem; index: number }> = ({ item, index }) => {
  const ref = React.useRef<THREE.Mesh>(null);
  const x = (item.x - MAP_WIDTH / 2) / 10;
  const z = (item.y - MAP_HEIGHT / 2) / 10;
  const style = LOOT_STYLE[item.type] ?? LOOT_STYLE.weapon;

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.y = 0.5 + Math.sin(clock.elapsedTime * 2 + index) * 0.15;
      ref.current.rotation.y = clock.elapsedTime + index;
    }
  });

  return (
    <group position={[x, 0, z]}>
      <mesh ref={ref} position={[0, 0.5, 0]}>
        {style.shape === 'sphere' ? (
          <sphereGeometry args={[0.2, 8, 8]} />
        ) : style.shape === 'cylinder' ? (
          <cylinderGeometry args={[0.18, 0.18, 0.15, 8]} />
        ) : (
          <boxGeometry args={[0.3, 0.3 * style.scaleY, 0.3]} />
        )}
        <meshStandardMaterial
          color={style.color}
          emissive={style.emissive}
          emissiveIntensity={0.6}
          roughness={0.3}
          metalness={0.5}
        />
      </mesh>
      {/* Ground glow ring */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.35, 16]} />
        <meshStandardMaterial
          color={style.emissive}
          emissive={style.emissive}
          emissiveIntensity={0.4}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};

const Loot3D: React.FC<Loot3DProps> = ({ items }) => (
  <group>
    {items.map((item, i) => (
      <LootMesh key={item.id} item={item} index={i} />
    ))}
  </group>
);

export default React.memo(Loot3D);

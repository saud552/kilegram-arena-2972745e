// ============================================
// ProceduralCharacter - Pure Three.js character body
// Lightweight soldier-style humanoid for arena rendering
// GLB models only loaded for close-up / store views
// ============================================

import * as THREE from 'three';

export interface CharacterColors {
  primary: string;
  secondary: string;
  accent: string;
  emissive: string;
}

const DEFAULT_CHAR_COLORS: CharacterColors = {
  primary: '#2a3a4a',
  secondary: '#3a4a5a',
  accent: '#00aaff',
  emissive: '#000000',
};

/**
 * Build a procedural soldier character for arena rendering.
 * Total poly count: ~200 triangles — extremely lightweight.
 */
export function createProceduralCharacter(
  colors: Partial<CharacterColors> = {},
  armorStyle: 'heavy' | 'medium' | 'light' | 'digital' = 'medium',
): THREE.Group {
  const c = { ...DEFAULT_CHAR_COLORS, ...colors };
  const group = new THREE.Group();
  group.name = 'procedural_character';

  const primaryMat = new THREE.MeshStandardMaterial({
    color: c.primary,
    roughness: 0.6,
    metalness: 0.3,
  });
  const secondaryMat = new THREE.MeshStandardMaterial({
    color: c.secondary,
    roughness: 0.5,
    metalness: 0.4,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: c.accent,
    emissive: c.emissive,
    emissiveIntensity: c.emissive === '#000000' ? 0 : 0.4,
    roughness: 0.3,
    metalness: 0.6,
  });

  // --- Body/Torso ---
  const torsoWidth = armorStyle === 'heavy' ? 0.5 : armorStyle === 'light' ? 0.35 : 0.42;
  const torso = new THREE.Mesh(
    new THREE.BoxGeometry(torsoWidth, 0.55, 0.25),
    primaryMat,
  );
  torso.position.y = 0.85;
  group.add(torso);

  // Chest plate
  const chestPlate = new THREE.Mesh(
    new THREE.BoxGeometry(torsoWidth * 0.9, 0.35, 0.05),
    secondaryMat,
  );
  chestPlate.position.set(0, 0.9, -0.14);
  group.add(chestPlate);

  // --- Head ---
  const headSize = armorStyle === 'heavy' ? 0.22 : 0.2;
  const head = new THREE.Mesh(
    new THREE.BoxGeometry(headSize, 0.22, 0.2),
    primaryMat,
  );
  head.position.y = 1.3;
  group.add(head);

  // Visor / face strip
  const visor = new THREE.Mesh(
    new THREE.BoxGeometry(headSize * 0.8, 0.06, 0.03),
    accentMat,
  );
  visor.position.set(0, 1.32, -0.12);
  group.add(visor);

  // --- Arms ---
  const armWidth = armorStyle === 'heavy' ? 0.14 : 0.1;
  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(
      new THREE.BoxGeometry(armWidth, 0.45, 0.12),
      secondaryMat,
    );
    arm.position.set(side * (torsoWidth / 2 + armWidth / 2), 0.85, 0);
    group.add(arm);

    // Shoulder pad
    if (armorStyle === 'heavy' || armorStyle === 'medium') {
      const shoulder = new THREE.Mesh(
        new THREE.BoxGeometry(armWidth * 1.3, 0.06, 0.14),
        accentMat,
      );
      shoulder.position.set(side * (torsoWidth / 2 + armWidth / 2), 1.1, 0);
      group.add(shoulder);
    }
  }

  // --- Legs ---
  for (const side of [-1, 1]) {
    const leg = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.5, 0.14),
      primaryMat,
    );
    leg.position.set(side * 0.1, 0.3, 0);
    group.add(leg);

    // Boot
    const boot = new THREE.Mesh(
      new THREE.BoxGeometry(0.13, 0.08, 0.18),
      secondaryMat,
    );
    boot.position.set(side * 0.1, 0.04, -0.02);
    group.add(boot);
  }

  // --- Belt / waist ---
  const belt = new THREE.Mesh(
    new THREE.BoxGeometry(torsoWidth * 1.05, 0.06, 0.27),
    accentMat,
  );
  belt.position.y = 0.58;
  group.add(belt);

  // Digital-style: add antenna
  if (armorStyle === 'digital') {
    const antenna = new THREE.Mesh(
      new THREE.CylinderGeometry(0.008, 0.008, 0.15, 6),
      accentMat,
    );
    antenna.position.set(0.08, 1.48, 0);
    group.add(antenna);
  }

  return group;
}

/** Ultra-simple LOD character — just a capsule for far distance */
export function createLODCharacterSimple(teamColor: string): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.3, 0.6, 4, 8),
    new THREE.MeshStandardMaterial({
      color: teamColor,
      roughness: 0.5,
      metalness: 0.3,
    }),
  );
  mesh.position.y = 0.6;
  mesh.name = 'character_lod_simple';
  return mesh;
}

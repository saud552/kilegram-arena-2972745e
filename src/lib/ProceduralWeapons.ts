// ============================================
// ProceduralWeapons - Pure Three.js weapon geometries
// Zero GLB dependency for in-game rendering
// Used for LOD far/mid range + default arena weapons
// ============================================

import * as THREE from 'three';

export type ProceduralWeaponType = 'assault_rifle' | 'smg' | 'sniper' | 'shotgun' | 'pistol';

interface WeaponColors {
  body: string;
  accent: string;
  emissive: string;
}

const DEFAULT_COLORS: Record<ProceduralWeaponType, WeaponColors> = {
  assault_rifle: { body: '#2a2a2a', accent: '#555555', emissive: '#ff2200' },
  smg: { body: '#0a0a1a', accent: '#00ff88', emissive: '#00ff88' },
  sniper: { body: '#1a1a1a', accent: '#333333', emissive: '#00ccff' },
  shotgun: { body: '#2a1a1a', accent: '#cc3300', emissive: '#ff4400' },
  pistol: { body: '#1a1a1a', accent: '#333333', emissive: '#ffffff' },
};

/** Create a procedural weapon mesh group — lightweight, no GLB needed */
export function createProceduralWeapon(
  type: ProceduralWeaponType,
  colors?: Partial<WeaponColors>,
): THREE.Group {
  const c = { ...DEFAULT_COLORS[type], ...colors };
  const group = new THREE.Group();
  group.name = `weapon_${type}`;

  const bodyMat = new THREE.MeshStandardMaterial({
    color: c.body,
    roughness: 0.4,
    metalness: 0.7,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: c.accent,
    roughness: 0.3,
    metalness: 0.8,
  });
  const emissiveMat = new THREE.MeshStandardMaterial({
    color: c.emissive,
    emissive: c.emissive,
    emissiveIntensity: 0.5,
    roughness: 0.2,
    metalness: 0.9,
  });

  switch (type) {
    case 'assault_rifle':
      buildAssaultRifle(group, bodyMat, accentMat, emissiveMat);
      break;
    case 'smg':
      buildSMG(group, bodyMat, accentMat, emissiveMat);
      break;
    case 'sniper':
      buildSniper(group, bodyMat, accentMat, emissiveMat);
      break;
    case 'shotgun':
      buildShotgun(group, bodyMat, accentMat, emissiveMat);
      break;
    case 'pistol':
      buildPistol(group, bodyMat, accentMat, emissiveMat);
      break;
  }

  return group;
}

function buildAssaultRifle(
  group: THREE.Group,
  body: THREE.Material,
  accent: THREE.Material,
  emissive: THREE.Material,
) {
  // Main body/receiver
  const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.5), body);
  receiver.position.set(0, 0, 0);
  group.add(receiver);

  // Barrel
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.6, 8), body);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(0, 0.02, -0.55);
  group.add(barrel);

  // Barrel tip / muzzle brake
  const muzzle = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.025, 0.08, 8), accent);
  muzzle.rotation.x = Math.PI / 2;
  muzzle.position.set(0, 0.02, -0.88);
  group.add(muzzle);

  // Magazine
  const mag = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.2, 0.08), accent);
  mag.position.set(0, -0.15, 0.05);
  mag.rotation.x = 0.1;
  group.add(mag);

  // Stock
  const stock = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.25), body);
  stock.position.set(0, -0.01, 0.35);
  group.add(stock);

  // Foregrip rail
  const rail = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.02, 0.2), accent);
  rail.position.set(0, -0.06, -0.2);
  group.add(rail);

  // Sight (red dot emissive)
  const sight = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.04, 0.04), emissive);
  sight.position.set(0, 0.07, -0.05);
  group.add(sight);
}

function buildSMG(
  group: THREE.Group,
  body: THREE.Material,
  accent: THREE.Material,
  emissive: THREE.Material,
) {
  // Compact body
  const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.08, 0.3), body);
  group.add(receiver);

  // Short barrel
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.3, 8), body);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(0, 0.01, -0.3);
  group.add(barrel);

  // Magazine (stick mag)
  const mag = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.18, 0.06), accent);
  mag.position.set(0, -0.13, 0);
  group.add(mag);

  // Folding stock
  const stock = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.2, 6), accent);
  stock.rotation.x = -0.3;
  stock.position.set(0, -0.02, 0.24);
  group.add(stock);

  // Neon accent strip
  const strip = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.005, 0.25), emissive);
  strip.position.set(0.055, 0, 0);
  group.add(strip);
}

function buildSniper(
  group: THREE.Group,
  body: THREE.Material,
  accent: THREE.Material,
  emissive: THREE.Material,
) {
  // Long receiver
  const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.09, 0.6), body);
  group.add(receiver);

  // Long barrel
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.8, 8), body);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(0, 0.02, -0.7);
  group.add(barrel);

  // Suppressor / heavy barrel tip
  const suppressor = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.15, 8), accent);
  suppressor.rotation.x = Math.PI / 2;
  suppressor.position.set(0, 0.02, -1.15);
  group.add(suppressor);

  // Scope
  const scopeBody = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.2, 8), accent);
  scopeBody.rotation.x = Math.PI / 2;
  scopeBody.position.set(0, 0.08, -0.1);
  group.add(scopeBody);

  // Scope lens (emissive)
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.028, 8), emissive);
  lens.position.set(0, 0.08, -0.2);
  group.add(lens);

  // Magazine
  const mag = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.1, 0.06), accent);
  mag.position.set(0, -0.1, 0.1);
  group.add(mag);

  // Bipod legs
  for (const side of [-1, 1]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.12, 6), accent);
    leg.position.set(side * 0.04, -0.1, -0.4);
    leg.rotation.z = side * 0.3;
    group.add(leg);
  }

  // Stock
  const stock = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.07, 0.3), body);
  stock.position.set(0, -0.01, 0.42);
  group.add(stock);
}

function buildShotgun(
  group: THREE.Group,
  body: THREE.Material,
  accent: THREE.Material,
  emissive: THREE.Material,
) {
  // Wide receiver
  const receiver = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 0.35), body);
  group.add(receiver);

  // Wide barrel
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.5, 8), body);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(0, 0.02, -0.42);
  group.add(barrel);

  // Barrel opening (wide)
  const muzzle = new THREE.Mesh(new THREE.RingGeometry(0.02, 0.04, 8), emissive);
  muzzle.position.set(0, 0.02, -0.67);
  group.add(muzzle);

  // Pump/foregrip
  const pump = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.1), accent);
  pump.position.set(0, -0.04, -0.2);
  group.add(pump);

  // Drum magazine
  const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.06, 12), accent);
  drum.rotation.x = Math.PI / 2;
  drum.position.set(0, -0.1, 0.05);
  group.add(drum);

  // Stock
  const stock = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.06, 0.2), body);
  stock.position.set(0, -0.01, 0.27);
  group.add(stock);
}

function buildPistol(
  group: THREE.Group,
  body: THREE.Material,
  accent: THREE.Material,
  emissive: THREE.Material,
) {
  // Compact frame
  const frame = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.18), body);
  group.add(frame);

  // Slide
  const slide = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.04, 0.2), accent);
  slide.position.set(0, 0.04, -0.01);
  group.add(slide);

  // Barrel
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.018, 0.12, 8), body);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(0, 0.04, -0.16);
  group.add(barrel);

  // Grip
  const grip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.1, 0.06), body);
  grip.position.set(0, -0.08, 0.05);
  grip.rotation.x = 0.2;
  group.add(grip);

  // Magazine base
  const magBase = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.02, 0.04), accent);
  magBase.position.set(0, -0.14, 0.05);
  group.add(magBase);

  // Front sight (emissive dot)
  const frontSight = new THREE.Mesh(new THREE.SphereGeometry(0.005, 6, 6), emissive);
  frontSight.position.set(0, 0.065, -0.1);
  group.add(frontSight);
}

/** Create a simple LOD weapon — just a colored box for far distance */
export function createLODWeaponSimple(type: ProceduralWeaponType): THREE.Mesh {
  const colors = DEFAULT_COLORS[type];
  const lengths: Record<ProceduralWeaponType, number> = {
    assault_rifle: 0.8,
    smg: 0.5,
    sniper: 1.2,
    shotgun: 0.7,
    pistol: 0.25,
  };
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.04, lengths[type]),
    new THREE.MeshStandardMaterial({ color: colors.body, roughness: 0.5, metalness: 0.6 }),
  );
  mesh.name = `weapon_lod_${type}`;
  return mesh;
}

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { VALID_BODY_REGIONS, type BodyRegion } from '../machines/questionnaireMachine';

// Create materials with better performance
const materials = {
  default: new THREE.MeshPhysicalMaterial({
    color: 0xE0C2A2,
    roughness: 0.5,
    metalness: 0.1,
    clearcoat: 0.3,
    clearcoatRoughness: 0.25,
  }),
  hover: new THREE.MeshPhysicalMaterial({
    color: 0x3B82F6,
    roughness: 0.3,
    metalness: 0.2,
    clearcoat: 0.5,
    clearcoatRoughness: 0.1,
    transparent: true,
    opacity: 0.8,
  }),
  selected: new THREE.MeshPhysicalMaterial({
    color: 0x2563EB,
    roughness: 0.2,
    metalness: 0.3,
    clearcoat: 0.8,
    clearcoatRoughness: 0.1,
  })
};

// Preload materials
Object.values(materials).forEach(material => {
  material.needsUpdate = true;
});

type BodyPartProps = {
  geometry: THREE.BufferGeometry;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  name: string;
  onClick: (name: string) => void;
  isHovered?: boolean;
  isSelected?: boolean;
};

function BodyPart({
  geometry,
  position,
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  name,
  onClick,
  isHovered,
  isSelected
}: BodyPartProps) {
  const meshRef = useRef<THREE.Mesh>();
  const targetScale = useMemo(() => new THREE.Vector3(...scale), [scale]);
  const hoverScale = useMemo(() => targetScale.clone().multiplyScalar(1.1), [targetScale]);

  useFrame(() => {
    if (!meshRef.current) return;
    
    const targetVector = isHovered ? hoverScale : targetScale;
    meshRef.current.scale.lerp(targetVector, 0.1);
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      position={position}
      rotation={rotation}
      onClick={(e) => {
        e.stopPropagation();
        onClick(name);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      <meshPhysicalMaterial
        {...(isSelected ? materials.selected : (isHovered ? materials.hover : materials.default))}
      />
    </mesh>
  );
}

type HumanBodyModelProps = {
  onSelectRegion: (region: BodyRegion) => void;
  hoveredRegion: string | null;
  selectedRegion?: BodyRegion | null;
};

// Map 3D model parts to valid body regions
const REGION_MAPPING: Record<string, BodyRegion> = {
  head: 'head',
  neck: 'neck',
  torso: 'chest',
  abdomen: 'abdomen',
  left_arm: 'left_arm',
  right_arm: 'right_arm',
  left_forearm: 'left_forearm',
  right_forearm: 'right_forearm',
  left_leg: 'left_leg',
  right_leg: 'right_leg',
  left_lower_leg: 'left_lower_leg',
  right_lower_leg: 'right_lower_leg'
};

export default function HumanBodyModel({ onSelectRegion, hoveredRegion, selectedRegion }: HumanBodyModelProps) {
  // Pre-compute geometries
  const geometries = useMemo(() => ({
    head: new THREE.SphereGeometry(0.3, 24, 24),
    neck: new THREE.CylinderGeometry(0.15, 0.15, 0.3, 24),
    torso: new THREE.BoxGeometry(0.8, 1.2, 0.4),
    arm: new THREE.CylinderGeometry(0.12, 0.12, 0.6, 24),
    forearm: new THREE.CylinderGeometry(0.1, 0.1, 0.5, 24),
    leg: new THREE.CylinderGeometry(0.15, 0.15, 0.8, 24),
    lowerLeg: new THREE.CylinderGeometry(0.12, 0.12, 0.7, 24),
    abdomen: new THREE.CylinderGeometry(0.4, 0.4, 0.6, 24)
  }), []);

  // Pre-compute body parts configuration
  const bodyParts = useMemo(() => [
    { name: 'head', geometry: geometries.head, position: [0, 2, 0] },
    { name: 'neck', geometry: geometries.neck, position: [0, 1.7, 0] },
    { name: 'torso', geometry: geometries.torso, position: [0, 1, 0] },
    { name: 'abdomen', geometry: geometries.abdomen, position: [0, 0.5, 0] },
    { name: 'left_arm', geometry: geometries.arm, position: [-0.5, 1.3, 0], rotation: [0, 0, -0.3] },
    { name: 'right_arm', geometry: geometries.arm, position: [0.5, 1.3, 0], rotation: [0, 0, 0.3] },
    { name: 'left_forearm', geometry: geometries.forearm, position: [-0.7, 0.8, 0], rotation: [0, 0, -0.3] },
    { name: 'right_forearm', geometry: geometries.forearm, position: [0.7, 0.8, 0], rotation: [0, 0, 0.3] },
    { name: 'left_leg', geometry: geometries.leg, position: [-0.3, 0, 0] },
    { name: 'right_leg', geometry: geometries.leg, position: [0.3, 0, 0] },
    { name: 'left_lower_leg', geometry: geometries.lowerLeg, position: [-0.3, -0.8, 0] },
    { name: 'right_lower_leg', geometry: geometries.lowerLeg, position: [0.3, -0.8, 0] }
  ], [geometries]);

  const handleRegionSelect = (partName: string) => {
    const mappedRegion = REGION_MAPPING[partName];
    if (mappedRegion && VALID_BODY_REGIONS.includes(mappedRegion)) {
      onSelectRegion(mappedRegion);
    }
  };

  return (
    <group>
      {bodyParts.map((part) => (
        <BodyPart
          key={part.name}
          {...part}
          onClick={handleRegionSelect}
          isHovered={hoveredRegion === part.name}
          isSelected={selectedRegion === REGION_MAPPING[part.name]}
        />
      ))}
    </group>
  );
}
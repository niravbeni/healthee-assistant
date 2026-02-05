'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { blobVertexShader, blobFragmentShader } from '@/lib/shaders';

interface BlobProps {
  audioIntensity: number;
}

export function Blob({ audioIntensity }: BlobProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAudioIntensity: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.elapsedTime;

      // Smooth transition for audio intensity
      material.uniforms.uAudioIntensity.value = THREE.MathUtils.lerp(
        material.uniforms.uAudioIntensity.value,
        audioIntensity,
        0.1
      );

      // Subtle rotation
      meshRef.current.rotation.y += 0.002;
      meshRef.current.rotation.x += 0.001;
    }
  });

  return (
    <mesh ref={meshRef} scale={1.1}>
      <icosahedronGeometry args={[1, 64]} />
      <shaderMaterial
        vertexShader={blobVertexShader}
        fragmentShader={blobFragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

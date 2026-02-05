'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { blobVertexShader, blobFragmentShader } from '@/lib/shaders';

interface BlobProps {
  audioIntensity: number;
  isListening?: boolean;
}

export function Blob({ audioIntensity, isListening = false }: BlobProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAudioIntensity: { value: 0 },
      uIsListening: { value: 0 },
    }),
    []
  );

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.elapsedTime;

      // Fast transition for audio intensity - more responsive
      material.uniforms.uAudioIntensity.value = THREE.MathUtils.lerp(
        material.uniforms.uAudioIntensity.value,
        audioIntensity,
        0.25
      );

      // Smooth transition for listening state
      material.uniforms.uIsListening.value = THREE.MathUtils.lerp(
        material.uniforms.uIsListening.value,
        isListening ? 1.0 : 0.0,
        0.15
      );

      // Slightly faster rotation when listening
      const rotationSpeed = isListening ? 0.004 : 0.002;
      meshRef.current.rotation.y += rotationSpeed;
      meshRef.current.rotation.x += rotationSpeed * 0.5;
    }
  });

  return (
    <mesh ref={meshRef} scale={1.1}>
      <icosahedronGeometry args={[1, 80]} />
      <shaderMaterial
        vertexShader={blobVertexShader}
        fragmentShader={blobFragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

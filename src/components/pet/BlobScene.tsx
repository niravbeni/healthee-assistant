'use client';

import { Canvas } from '@react-three/fiber';
import { Blob } from '@/components/pet/Blob';

interface BlobSceneProps {
  audioIntensity: number;
}

export function BlobScene({ audioIntensity }: BlobSceneProps) {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4060ff" />
        <Blob audioIntensity={audioIntensity} />
      </Canvas>
    </div>
  );
}

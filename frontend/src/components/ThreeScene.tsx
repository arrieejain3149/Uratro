import { useRef, Suspense } from 'react';
import type { MutableRefObject } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Center, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface ModelProps {
  mouse: MutableRefObject<{ x: number; y: number }>;
}

function MetroModel({ mouse }: ModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { scene } = useGLTF('/metro-model.glb');

  useFrame((_, delta) => {
    if (groupRef.current) {
      // Subtle mouse parallax tilt layered on top of user orbit
      const targetTilt = mouse.current.y * 0.15;
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetTilt, delta * 2.0);
    }
  });

  return (
    <group ref={groupRef}>
      <Center position={[0, -0.2, 0]}>
        {/* Substantially increased scale so train is prominently visible */}
        <primitive object={scene} scale={3.6} />
      </Center>
    </group>
  );
}

// Fallback spinner while GLB loads
function LoadingFallback() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 1.0;
    }
  });

  return (
    <mesh ref={ref}>
      <boxGeometry args={[4, 1.5, 1.5]} />
      <meshBasicMaterial color="#38bdf8" wireframe opacity={0.25} transparent />
    </mesh>
  );
}

export default function ThreeScene({ mouse }: { mouse: MutableRefObject<{ x: number; y: number }> }) {
  return (
    <div className="absolute inset-0 z-0 pointer-events-auto cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [2.8, 1.2, 4.4], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#000000']} />
        
        {/* Full 360-degree drag rotation & zoom inspection */}
        <OrbitControls 
          enableRotate={true}
          enableZoom={true}
          enablePan={false}
          autoRotate={true}
          autoRotateSpeed={0.6}
          minDistance={2.5}
          maxDistance={7.0}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 1.8}
        />

        {/* Industrial high-contrast lighting */}
        <ambientLight intensity={1.1} />
        <directionalLight position={[6, 10, 6]} intensity={3.0} color="#ffffff" />
        <directionalLight position={[-8, -2, -5]} intensity={1.8} color="#00f0ff" />
        <pointLight position={[0, 4, 3]} intensity={2.2} color="#ffffff" />
        <pointLight position={[-4, 1, 3]} intensity={1.5} color="#3b82f6" />
        <pointLight position={[4, -1, -3]} intensity={1.2} color="#93c5fd" />

        <Suspense fallback={<LoadingFallback />}>
          <MetroModel mouse={mouse} />
        </Suspense>
      </Canvas>
    </div>
  );
}

useGLTF.preload('/metro-model.glb');

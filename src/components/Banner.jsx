"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";

function Galaxy() {
  const pointsRef = useRef();
  const particleCount = 6000;
  const pos = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    const r = Math.random() * 5;
    const a = Math.random() * Math.PI * 2;
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 1.5;
    pos[i * 3 + 2] = Math.sin(a) * r;
  }

  useFrame(() => {
    pointsRef.current.rotation.y += 0.0008;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={pos}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.015}
        color="#88ccff"
        depthWrite={false}
        transparent
        opacity={0.8}
      />
    </points>
  );
}

function Mountains() {
  const mesh = useRef();

  useFrame((state) => {
    mesh.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.4) * 0.2;
  });

  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[40, 40, 150, 150]} />
      <meshStandardMaterial
        color="#0d1b2a"
        wireframe={true}
        opacity={0.4}
        transparent
      />
    </mesh>
  );
}

function GoldenWireframeGlobe() {
  const ref = useRef();

  useFrame(() => {
    ref.current.rotation.y += 0.003;
    ref.current.rotation.x = 0.4; // slight tilt like screenshot
  });

  return (
    <mesh ref={ref} position={[0, 0.4, -3]}>
      <sphereGeometry args={[4.2, 64, 64]} />
      <meshBasicMaterial
        color="#d4af37"
        wireframe={true}
        transparent={true}
        opacity={0.3}
      />
    </mesh>
  );
}

export default function ThreeSection() {
  return (
    <section className="w-full h-screen">
      <Canvas camera={{ position: [0, 2.3, 6], fov: 60 }}>
        <color attach="background" args={["#020617"]} />

        <Stars radius={80} depth={60} count={8000} factor={4} fade />
        <Galaxy />
        <Mountains />

        {/* ⭐ Golden Globe Background ⭐ */}
        <GoldenWireframeGlobe />

        {/* ⭐ Floating Title Text ⭐ */}
        <Text
          position={[0, 1.2, 0]}
          fontSize={0.35}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          Immersive, animated storytelling website
        </Text>

        <Text
          position={[0, 0.6, 0]}
          fontSize={0.32}
          color="#ffd57a"
          anchorX="center"
          anchorY="middle"
        >
          introducing "What is a Mystic"
        </Text>

        <Text
          position={[0, 0.05, 0]}
          fontSize={0.28}
          color="#ffeab5"
          anchorX="center"
          anchorY="middle"
        >
          with advanced chart integrations & multimedia content
        </Text>

        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 10, 5]} intensity={1} />

        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </section>
  );
}

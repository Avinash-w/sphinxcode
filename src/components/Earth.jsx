"use client";

import React, { Suspense, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls, Stars } from "@react-three/drei";

function Earth() {
  const earthRef = useRef();
  const cloudsRef = useRef();

  const [colorMap, normalMap, specularMap, cloudsMap] = useLoader(THREE.TextureLoader, [
    "/textures/2k_earth_daymap.jpg",
    "/textures/cloud.png",
    "/textures/mountan.jpg",
    "/textures/mountan.jpg",
  ]);

  useFrame(() => {
    earthRef.current.rotation.y += 0.0015;
    cloudsRef.current.rotation.y += 0.0018;
  });

  return (
    <>
      {/* Earth */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial
          map={colorMap}
          normalMap={normalMap}
          specularMap={specularMap}
          shininess={10}
        />
      </mesh>

      {/* Clouds */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[2.03, 64, 64]} />
        <meshPhongMaterial
          map={cloudsMap}
          opacity={0.35}
          transparent={true}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </>
  );
}

function EarthScene() {
  return (
    <Canvas
      style={{
        height: "100vh",
        width: "100%",
        background: "radial-gradient(ellipse at bottom, #020111 0%, #000000 100%)",
        overflow: "hidden",
      }}
      camera={{ position: [0, 0, 5], fov: 45 }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 5, 10]} intensity={1.2} color="#ffffff" />
      <directionalLight position={[-5, 3, -5]} intensity={0.6} color="#88ccff" />

      <Suspense fallback={null}>
        {/* Stars background */}
        <Stars radius={100} depth={50} count={8000} factor={4} saturation={0} fade />
        <Earth />
      </Suspense>

      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  );
}

export default function EarthSection() {
  return (
    <section style={{ height: "100vh", width: "100%", overflow: "hidden" }}>
      <EarthScene />
    </section>
  );
}

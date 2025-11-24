"use client";

import React, { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Cloud,
  Stars,
  Text,
  ScrollControls,
  Scroll,
  useScroll,
} from "@react-three/drei";
import * as THREE from "three";

// --------------------------------------------------
// ⭐ SUPER PREMIUM 3D HERO SCENE
// --------------------------------------------------
function PremiumScene() {
  const cloudBack = useRef();
  const cloudMid = useRef();
  const cloudFront = useRef();
  const textRef = useRef();
  const mouse = useRef({ x: 0, y: 0 });

  // Track mouse movement
  useEffect(() => {
    const move = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // --------------------------------------------------
    // BACK CLOUD — deep slow fog layer
    // --------------------------------------------------
    if (cloudBack.current) {
      cloudBack.current.position.x = Math.sin(t * 0.14) * 0.9;
      cloudBack.current.position.y = Math.cos(t * 0.09) * 0.5;

      cloudBack.current.rotation.y = mouse.current.x * 0.03;
      cloudBack.current.rotation.x = mouse.current.y * 0.03;
    }

    // --------------------------------------------------
    // MID CLOUD — glowing center cloud
    // --------------------------------------------------
    if (cloudMid.current) {
      cloudMid.current.position.x = Math.sin(t * 0.28) * 1.2;
      cloudMid.current.position.y = Math.cos(t * 0.18) * 0.7;

      cloudMid.current.rotation.y = mouse.current.x * 0.05;
      cloudMid.current.rotation.x = mouse.current.y * 0.04;
    }

    // --------------------------------------------------
    // FRONT CLOUD — bright foreground fog
    // --------------------------------------------------
    if (cloudFront.current) {
      cloudFront.current.position.x = Math.sin(t * 0.55) * 1.6;
      cloudFront.current.position.y = Math.cos(t * 0.33) * 0.9;

      cloudFront.current.rotation.y = mouse.current.x * 0.1;
      cloudFront.current.rotation.x = mouse.current.y * 0.06;
    }

    // --------------------------------------------------
    // 3D FLOATING TEXT (NEON + PARALLAX)
    // --------------------------------------------------
    if (textRef.current) {
      textRef.current.position.y = Math.sin(t * 0.45) * 0.22;
      textRef.current.rotation.y = mouse.current.x * 0.18;
      textRef.current.rotation.x = mouse.current.y * 0.1;

      // Smooth fade as camera scrolls forward/back
      const camZ = state.camera.position.z;
      const fade = THREE.MathUtils.mapLinear(camZ, 6, 2, 0.1, 1);
      textRef.current.material.opacity = fade;
    }
  });

  return (
    <group>
      {/* Lights */}
      <ambientLight intensity={0.55} />
      <pointLight
        position={[1, 2, 2]}
        intensity={2.5}
        color="#00e5ff"
        distance={8}
      />
      <pointLight
        position={[-2, -2, 1]}
        intensity={1.2}
        color="#ff3dfc"
      />

      {/* Stars */}
      <Stars radius={160} depth={140} count={7000} factor={4} fade speed={0.25} />

      {/* BACK CLOUD (Deep fog layer) */}
      <group ref={cloudBack} position={[0, -1.2, -6]}>
        <Cloud
          opacity={0.12}
          speed={0.12}
          width={35}
          depth={6}
          segments={80}
          color="#6bb9ff"
        />
      </group>

      {/* MID CLOUD (Main glowing cloud) */}
      <group ref={cloudMid} position={[0, -0.7, -3]}>
        <Cloud
          opacity={0.28}
          speed={0.22}
          width={22}
          depth={3}
          segments={100}
          color="#ffffff"
        />
      </group>

      {/* FRONT CLOUD (Bright fog in front) */}
      <group ref={cloudFront} position={[0, -0.3, -1.5]}>
        <Cloud
          opacity={0.38}
          speed={0.32}
          width={12}
          depth={2}
          segments={90}
          color="#c9f7ff"
        />
      </group>

      {/* 3D PREMIUM NEON TEXT */}
      <Text
        ref={textRef}
        fontSize={1.55}
        position={[0, 0.1, 0]}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.04}
        outlineColor="#00ddff"
        fillOpacity={1}
      >
        <meshStandardMaterial
          attach="material"
          color="#D4AF37"
          emissive="#D4AF37"
          emissiveIntensity={1.4}
          roughness={0.15}
          metalness={0.8}
          toneMapped={false}
        />
        Sphinx Code World
      </Text>
    </group>
  );
}

// --------------------------------------------------
// ⭐ Smooth Scroll + Parallax Camera
// --------------------------------------------------
function PremiumCamera() {
  const scroll = useScroll();
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  useFrame((state) => {
    const offset = scroll.offset;

    // Smooth Z movement with damping
    const targetZ = 6 - offset * 4;
    state.camera.position.z = THREE.MathUtils.lerp(
      state.camera.position.z,
      targetZ,
      0.08
    );

    // Gentle camera tilt
    state.camera.rotation.x = mouse.current.y * 0.05;
    state.camera.rotation.y = mouse.current.x * 0.05;
  });

  return null;
}

// --------------------------------------------------
// ⭐ MAIN EXPORT
// --------------------------------------------------
export default function Home() {
  return (
    <div className="w-full h-screen overflow-hidden">
      <Canvas camera={{ position: [0, 0, 6], fov: 55 }}>
        <fog attach="fog" args={["#000015", 5, 20]} />

        <ScrollControls pages={2} damping={0.25}>
          <Scroll>
            <PremiumScene />
          </Scroll>
          <Scroll>
            <PremiumCamera />
          </Scroll>
        </ScrollControls>
      </Canvas>
    </div>
  );
}

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Sections from "./Sections";
import Particles from "./Particles";

gsap.registerPlugin(ScrollTrigger);

// --------------------------------------------------
// 3D SPHERE COMPONENT
// --------------------------------------------------
function Sphere() {
  const mesh = useRef();
  const { mouse } = useThree();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // Auto rotation
    mesh.current.rotation.y += 0.003;

    // Mouse parallax
    mesh.current.position.x = mouse.x * 0.5;
    mesh.current.position.y = -mouse.y * 0.5;

    // Smooth scroll morph
    mesh.current.scale.setScalar(1 + window.scrollY * 0.0005);
  });

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[1.4, 64, 64]} />
      <meshStandardMaterial color={"#d4af37"} wireframe />
    </mesh>
  );
}

// --------------------------------------------------
// ROOT APP
// --------------------------------------------------
export default function App() {
  useEffect(() => {
    // ---------------------------
    // HERO title animation
    // ---------------------------
    gsap.from(".hero-title", {
      y: 80,
      opacity: 0,
      duration: 1.4,
      ease: "power3.out",
    });

    gsap.from(".hero-text", {
      opacity: 0,
      y: 40,
      delay: 0.3,
      duration: 1.4,
    });

    // ---------------------------
    // HERO parallax scroll
    // ---------------------------
    gsap.to(".hero-content", {
      y: -150,
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        scrub: true,
      },
    });

    // ---------------------------
    // Sphere scroll reaction
    // ---------------------------
    gsap.to(window, {
      scrollValue: 1,
      scrollTrigger: {
        trigger: ".section",
        start: "top bottom",
        end: "top top",
        scrub: true,
        onUpdate: (self) => {
          window.scrollYPosition = self.progress;
        },
      },
    });
  }, []);

  return (
    <div style={{ background: "black", minHeight: "300vh" }}>
      {/* -------------------------------------------------- */}
      {/*  3D SPHERE CANVAS */}
      {/* -------------------------------------------------- */}
      <Canvas
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 1,
        }}
        camera={{ position: [0, 0, 4], fov: 60 }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={1.2} />
        <Particles />
        <Sphere />
        <OrbitControls enableZoom={false} />
      </Canvas>

      {/* -------------------------------------------------- */}
      {/*  HERO SECTION */}
      {/* -------------------------------------------------- */}
      {/* <section
        className="hero"
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          paddingLeft: "80px",
          zIndex: 10,
          position: "relative",
        }}
      >
        <div className="hero-content" style={{ maxWidth: "700px" }}>
          <h1
            className="hero-title"
            style={{
              fontSize: "5rem",
              color: "#d4af37",
              fontWeight: "bold",
            }}
          >
            GOLDEN ORBIT
          </h1>

          <p
            className="hero-text"
            style={{
              color: "#eee",
              marginTop: "20px",
              fontSize: "1.2rem",
            }}
          >
            A floating 3D sphere reacting to scroll, motion, and energy.
          </p>
        </div>
      </section> */}

      {/* -------------------------------------------------- */}
      {/*  PREMIUM ANIMATED SECTIONS (REPLACE SECTION TWO) */}
      {/* -------------------------------------------------- */}
      <Sections />

      {/* (Your sections already have scroll animations inside Sections.jsx) */}



    </div>
  );
}

"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

gsap.registerPlugin(ScrollTrigger);

// Replace with your large nebula / space image (public path)
const ASSET_URL = "/mnt/data/A_digital_image_of_outer_space_showcases_a_vast_ex.png";

export default function ImprovedHero() {
  const mountRef = useRef(null);
  const audioAnalyserRef = useRef(null);
  const [enableMic, setEnableMic] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // -----------------------
    // Basic scene + camera + renderer
    // -----------------------
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      800
    );
    camera.position.set(0, 0.2, 28);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    mount.appendChild(renderer.domElement);

    // -----------------------
    // Fog + environment (gradient like sky)
    // -----------------------
    scene.fog = new THREE.FogExp2(new THREE.Color("#050014"), 0.02);

    const hemi = new THREE.HemisphereLight("#6fb7ff", "#0b0720", 0.7);
    scene.add(hemi);

    const ambient = new THREE.AmbientLight(0xffffff, 0.18);
    scene.add(ambient);

    // cinematic rim/spotlight for premium falloff
    const vignetteSpot = new THREE.SpotLight(0x66dfff, 2.0, 80, Math.PI * 0.5, 0.5, 1.2);
    vignetteSpot.position.set(0, 8, 12);
    vignetteSpot.target.position.set(0, 0, 0);
    scene.add(vignetteSpot);
    scene.add(vignetteSpot.target);

    // subtle warm fill
    const fill = new THREE.PointLight(0xff66cc, 0.8, 50);
    fill.position.set(-6, -2, 6);
    scene.add(fill);

    // -----------------------
    // Composer + Bloom
    // -----------------------
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.0, // strength
      0.35, // radius
      0.02 // threshold
    );
    bloom.threshold = 0.12;
    bloom.strength = 0.9;
    bloom.radius = 0.65;
    composer.addPass(bloom);

    // -----------------------
    // Sacred geometry (wire icosahedron)
    // -----------------------
    const sacredGroup = new THREE.Group();
    scene.add(sacredGroup);

    const icoGeo = new THREE.IcosahedronGeometry(3.2, 1);
    const wire = new THREE.LineSegments(
      new THREE.WireframeGeometry(icoGeo),
      new THREE.LineBasicMaterial({
        color: new THREE.Color("#9fdcff"),
        transparent: true,
        opacity: 0.95,
      })
    );
    sacredGroup.add(wire);
    sacredGroup.position.set(0, -1.5, 0);

    // -----------------------
    // Particle system (morphing between vortex and human silhouette)
    // -----------------------
    const safeParticleCount = Math.max(
      1600,
      Math.floor((window.innerWidth * window.innerHeight) / 85000)
    );
    const PARTICLE_COUNT = Math.min(safeParticleCount, 5500);

    const pointsGeo = new THREE.BufferGeometry();
    const posA = new Float32Array(PARTICLE_COUNT * 3);
    const posB = new Float32Array(PARTICLE_COUNT * 3);

    // posA: swirling vortex
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const t = Math.random() * Math.PI * 6;
      const r = Math.pow(Math.random(), 0.84) * (12 + Math.random() * 6);
      posA[i * 3 + 0] = Math.cos(t) * r * (0.8 + Math.random() * 0.4);
      posA[i * 3 + 1] = (Math.random() - 0.5) * 6;
      posA[i * 3 + 2] = Math.sin(t) * r * (0.8 + Math.random() * 0.4);
    }

    // posB: rough humanoid silhouette broken into partitions
    const partition = (idx) => {
      const ratio = idx / PARTICLE_COUNT;
      if (ratio < 0.18) return "head";
      if (ratio < 0.45) return "torso";
      if (ratio < 0.62) return "leftArm";
      if (ratio < 0.79) return "rightArm";
      if (ratio < 0.90) return "leftLeg";
      return "rightLeg";
    };

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const part = partition(i);
      let x = 0, y = 0, z = 0;
      if (part === "head") {
        const u = Math.random() * Math.PI * 2;
        const v = Math.acos(2 * Math.random() - 1);
        const rad = 0.9 * Math.pow(Math.random(), 0.6);
        x = Math.sin(v) * Math.cos(u) * rad;
        y = 2.6 + Math.cos(v) * rad;
        z = Math.sin(v) * Math.sin(u) * rad;
      } else if (part === "torso") {
        x = (Math.random() - 0.5) * 1.6;
        y = 0.3 + (Math.random() - 0.5) * 1.8;
        z = (Math.random() - 0.5) * 0.9;
      } else if (part === "leftArm") {
        x = -1.6 + (Math.random() - 0.5) * 0.4;
        y = 0.6 + (Math.random() - 0.5) * 1.2;
        z = (Math.random() - 0.5) * 0.6;
      } else if (part === "rightArm") {
        x = 1.6 + (Math.random() - 0.5) * 0.4;
        y = 0.6 + (Math.random() - 0.5) * 1.2;
        z = (Math.random() - 0.5) * 0.6;
      } else if (part === "leftLeg") {
        x = -0.5 + (Math.random() - 0.5) * 0.6;
        y = -2.6 + Math.random() * 1.4;
        z = (Math.random() - 0.5) * 0.6;
      } else {
        x = 0.5 + (Math.random() - 0.5) * 0.6;
        y = -2.6 + Math.random() * 1.4;
        z = (Math.random() - 0.5) * 0.6;
      }
      posB[i * 3 + 0] = x + (Math.random() - 0.5) * 0.08;
      posB[i * 3 + 1] = y + (Math.random() - 0.5) * 0.08;
      posB[i * 3 + 2] = z + (Math.random() - 0.5) * 0.08;
    }

    pointsGeo.setAttribute("position", new THREE.BufferAttribute(posA, 3));
    pointsGeo.setAttribute("posB", new THREE.BufferAttribute(posB, 3));

    // Shader material with holographic scanlines + depth fade
    const pointsMat = new THREE.ShaderMaterial({
      transparent: true,
      depthTest: true,
      uniforms: {
        uTime: { value: 0 },
        uMorph: { value: 0 },
        uPointSize: { value: 3.0 },
        uSound: { value: 0.0 },
        uColorA: { value: new THREE.Color("#cfa7ff") },
        uColorB: { value: new THREE.Color("#fff3d9") },
      },
      vertexShader: `
        attribute vec3 posB;
        uniform float uMorph;
        uniform float uTime;
        uniform float uPointSize;
        uniform float uSound;
        varying float vDepth;
        varying float vMix;
        void main() {
          vec3 a = position;
          vec3 b = posB;
          float wob = sin(uTime * 0.8 + position.x * 2.0 + position.y * 1.2) * 0.12;
          vec3 spiritOffset = vec3(a.x * 0.02, wob, a.z * 0.02);
          vec3 p = mix(a + spiritOffset, b, uMorph);
          float depth = - (modelViewMatrix * vec4(p, 1.0)).z;
          float size = uPointSize * (1.0 + (1.0 - smoothstep(0.0, 20.0, depth)) * 1.4);
          size *= (1.0 + uSound * 1.5);
          gl_PointSize = size;
          vDepth = depth;
          vMix = uMorph;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColorA;
        uniform vec3 uColorB;
        varying float vDepth;
        varying float vMix;
        uniform float uTime;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          float alpha = smoothstep(0.5, 0.0, d);

          // base color mix
          vec3 c = mix(uColorA, uColorB, vMix);

          // depth fade
          float depthFade = 1.0 - smoothstep(0.0, 40.0, vDepth);

          // holographic scan (subtle lines moving along Y)
          float scan = sin((vDepth * 0.08 + uTime * 1.8)) * 0.5 + 0.5;
          float scanGlow = smoothstep(0.45, 0.52, scan) * 0.6;

          vec3 holo = c + vec3(0.12, 0.18, 0.42) * scanGlow * 0.35;

          gl_FragColor = vec4(holo * (0.55 + 0.45 * depthFade), alpha * (0.85 * depthFade));
        }
      `,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(pointsGeo, pointsMat);
    scene.add(points);

    // -----------------------
    // Runic floating planes (glowing glyphs)
    // -----------------------
    const runesGroup = new THREE.Group();
    scene.add(runesGroup);
    const runePlanes = [];
    const runeMats = [];

    for (let i = 0; i < 8; i++) {
      const geo = new THREE.PlaneGeometry(1.6, 1.6);
      const mat = new THREE.ShaderMaterial({
        transparent: true,
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color().setHSL(0.75 + Math.random() * 0.08, 0.9, 0.6) },
          uGlow: { value: 0.8 },
        },
        vertexShader: `
          varying vec2 vUv;
          void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);}
        `,
        fragmentShader: `
          uniform float uTime;
          uniform vec3 uColor;
          uniform float uGlow;
          varying vec2 vUv;
          void main(){
            vec2 uv = vUv - 0.5;
            float r = length(uv) * 2.0;
            float circle = smoothstep(0.45, 0.42, r);
            float cross = smoothstep(0.02, 0.0, abs(uv.x)) * smoothstep(0.02, 0.0, abs(uv.y));
            float lines = smoothstep(0.48, 0.45, r) * 0.6 + cross * 0.8;
            float glow = pow(max(0.0, 1.0 - r * 1.2), 3.0) * uGlow * (0.7 + 0.3 * sin(uTime * 2.0));
            vec3 c = uColor * (0.6 * lines + glow);
            float a = clamp(lines + glow, 0.0, 1.0);
            gl_FragColor = vec4(c, a);
          }
        `,
        blending: THREE.AdditiveBlending,
      });

      const mesh = new THREE.Mesh(geo, mat);
      const angle = (i / 8) * Math.PI * 2;
      mesh.position.set(Math.cos(angle) * 9.2, -0.6 + Math.sin(angle) * 1.6, Math.sin(angle) * 4.2);
      mesh.lookAt(0, 0, 0);
      runesGroup.add(mesh);
      runePlanes.push(mesh);
      runeMats.push(mat);
    }

    // -----------------------
    // Fog billboard / god-ray plane behind everything
    // -----------------------
    const fogTexture = new THREE.TextureLoader().load(ASSET_URL);
    fogTexture.wrapS = fogTexture.wrapT = THREE.RepeatWrapping;
    fogTexture.repeat.set(1, 1);
    const fogPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 36),
      new THREE.MeshBasicMaterial({
        map: fogTexture,
        transparent: true,
        opacity: 0.06,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    fogPlane.position.set(0, 0, -12);
    scene.add(fogPlane);

    // god-ray soft plane for directionality
    const godRay = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 36),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#66cfff"),
        transparent: true,
        opacity: 0.06,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    godRay.position.set(0, 6, -10);
    godRay.rotation.x = -0.45;
    scene.add(godRay);

    // -----------------------
    // Layered fog planes (optional, will skip if texture fails)
    // -----------------------
    const fogPaths = ["/mnt/data/fog1.png", "/mnt/data/fog2.png", "/mnt/data/fog3.png"];
    const fogLayers = [];
    const texLoader = new THREE.TextureLoader();
    fogPaths.forEach((path, idx) => {
      texLoader.load(
        path,
        (tex) => {
          const sizeMult = 1 + idx * 0.25;
          const geom = new THREE.PlaneGeometry(60 * sizeMult, 36 * sizeMult);
          const mat = new THREE.MeshBasicMaterial({
            map: tex,
            transparent: true,
            depthWrite: false,
            opacity: 0.45 - idx * 0.12,
            blending: THREE.AdditiveBlending,
          });
          const mesh = new THREE.Mesh(geom, mat);
          mesh.position.set(0, 0, -16 - idx * 6);
          scene.add(mesh);
          fogLayers.push(mesh);
        },
        undefined,
        () => {}
      );
    });

    // -----------------------
    // Hex grid backplane (tiling)
    // -----------------------
    const HEX_RADIUS = 1.6;
    const ROWS = 10;
    const COLS = 18;
    const HEX_GROUP_Z = -34;
    const hexGroup = new THREE.Group();
    hexGroup.position.set(0, -2.0, HEX_GROUP_Z);
    scene.add(hexGroup);

    const hexGeo = new THREE.CylinderGeometry(HEX_RADIUS, HEX_RADIUS, 0.12, 6, 1, false);
    const hexMatProto = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#062b49"),
      emissive: new THREE.Color("#0b6ea8"),
      emissiveIntensity: 0.04,
      roughness: 0.55,
      metalness: 0.4,
      transparent: true,
      opacity: 0.98,
      side: THREE.DoubleSide,
    });

    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const mat = hexMatProto.clone();
        const hex = new THREE.Mesh(hexGeo, mat);
        const xOffset = HEX_RADIUS * 1.75;
        const yOffset = HEX_RADIUS * 1.5;
        const x = (col - COLS / 2) * xOffset + (row % 2 === 0 ? 0 : xOffset * 0.5);
        const y = (row - ROWS / 2) * yOffset;
        hex.position.set(x, y, 0);
        const s = 0.85 + Math.random() * 0.35;
        hex.scale.set(s, 1.0, s);
        hex.rotation.x = Math.PI / 2;
        hex.material.emissiveIntensity = 0.02 + Math.random() * 0.06;
        hexGroup.add(hex);
      }
    }
    hexGroup.rotation.x = 0.18;
    hexGroup.rotation.y = -0.05;

    // -----------------------
    // Audio (mic) initialization helper
    // -----------------------
    let analyser = null;
    let dataArray = null;
    const initAudio = async () => {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const source = audioCtx.createMediaStreamSource(stream);
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        source.connect(analyser);
        audioAnalyserRef.current = analyser;
        setEnableMic(true);
      } catch (e) {
        console.warn("Audio init failed:", e);
        audioAnalyserRef.current = null;
        setEnableMic(false);
      }
    };

    // -----------------------
    // GSAP timelines + ScrollTriggers
    // -----------------------
    // initial entrance camera pop
    const introTL = gsap.timeline();
    introTL.to(camera.position, { z: 14, duration: 1.2, ease: "power2.out" })
           .to(camera.position, { z: 8, duration: 1.6, ease: "power2.out" });

    // morph tween (points: vortex -> human)
    const morphTween = gsap.to(pointsMat.uniforms.uMorph, { value: 1, ease: "none", paused: true });

    // bind morph to sec2 scroll
    ScrollTrigger.create({
      trigger: "#sec2",
      start: "top bottom",
      end: "top top",
      scrub: 1.6,
      onUpdate: (self) => {
        morphTween.progress(self.progress);
      },
    });

    // camera z moves with sec3
    ScrollTrigger.create({
      trigger: "#sec3",
      start: "top bottom",
      end: "top top",
      scrub: 2.0,
      onUpdate: (self) => {
        camera.position.z = 8 - 5 * self.progress; // 8 -> 3
      },
    });

    // sacred group spin via scroll
    gsap.to(sacredGroup.rotation, {
      y: Math.PI * 0.8,
      scrollTrigger: { trigger: "#sec3", start: "top bottom", end: "top top", scrub: 2.2 },
    });

    // runes rotate on sec2 scroll
    runePlanes.forEach((mesh, i) => {
      gsap.to(mesh.rotation, {
        z: Math.PI * (i % 2 === 0 ? 2.0 : -1.8),
        scrollTrigger: {
          trigger: "#sec2",
          start: "top bottom",
          end: "top top",
          scrub: 1.6,
        },
      });
    });

    // hex grid scroll effect (progressively move forward + ripple)
    ScrollTrigger.create({
      trigger: "#sec3",
      start: "top bottom",
      end: "top top",
      scrub: 1.2,
      onUpdate: (self) => {
        const p = self.progress;
        const zTarget = THREE.MathUtils.lerp(HEX_GROUP_Z, -18, p);
        const yTarget = THREE.MathUtils.lerp(-2.0, 2.0, p);
        hexGroup.position.z = zTarget;
        hexGroup.position.y = yTarget;
        hexGroup.rotation.z = THREE.MathUtils.lerp(0.02, 0.9, p);
        const s = THREE.MathUtils.lerp(0.92, 1.06, p);
        hexGroup.scale.set(s, s, s);
        hexGroup.children.forEach((tile, idx) => {
          const base = 0.02 + (idx % 6) * 0.003;
          tile.material.emissiveIntensity = base + p * 0.12;
        });
      },
    });

    // fog parallax via sec1 scrolling (works even if fogLayers load later)
    ScrollTrigger.create({
      trigger: "#sec1",
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;
        fogLayers.forEach((mesh, idx) => {
          mesh.position.y = (p - 0.5) * -2.0 * (1 + idx * 0.4);
          mesh.position.z = -16 - idx * 6 + p * (1.5 + idx * 0.5);
          mesh.material.opacity = 0.45 - idx * 0.12 - p * 0.12;
          mesh.scale.set(1 + p * 0.15, 1 + p * 0.15, 1);
        });
        fogPlane.position.y = (p - 0.5) * -0.6;
      }
    });

    // -----------------------
    // mouse parallax tracking
    // -----------------------
    const mouse = { x: 0, y: 0 };
    let mouseTarget = { x: 0, y: 0 };
    function onMouseMove(e) {
      mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2;
    }
    window.addEventListener("mousemove", onMouseMove);

    // -----------------------
    // animation / render loop
    // -----------------------
    const clock = new THREE.Clock();
    let rafId = null;

    const render = () => {
      rafId = requestAnimationFrame(render);
      const t = clock.getElapsedTime();

      // update shader time
      pointsMat.uniforms.uTime.value = t * 0.6;

      // audio analysis
      let soundVal = 0;
      if (audioAnalyserRef.current) {
        const analyserRef = audioAnalyserRef.current;
        const arr = new Uint8Array(analyserRef.frequencyBinCount);
        analyserRef.getByteFrequencyData(arr);
        let sum = 0;
        for (let i = 0; i < arr.length; i++) sum += arr[i];
        soundVal = (sum / arr.length) / 255;
      }
      pointsMat.uniforms.uSound.value = soundVal;
      pointsMat.uniforms.uPointSize.value = 2.8 + soundVal * 5.0;

      // micro camera drift + mouse parallax smoothing
      mouseTarget.x += (mouse.x - mouseTarget.x) * 0.06;
      mouseTarget.y += (mouse.y - mouseTarget.y) * 0.06;

      // slow orbital bob
      camera.position.x = Math.sin(t * 0.12) * 0.65 + mouseTarget.x * 1.2;
      camera.position.y = Math.cos(t * 0.09) * 0.28 + mouseTarget.y * 0.9;
      camera.lookAt(0, -0.2, 0);

      // sacred geometry idle rotation
      sacredGroup.rotation.x += 0.0008;
      sacredGroup.rotation.y += 0.0011;

      // rune breathing via shader uniform
      runeMats.forEach((m) => {
        if (m.uniforms && m.uniforms.uTime) m.uniforms.uTime.value = t;
      });

      // runes slight rotation offset
      runesGroup.rotation.y += 0.0008;

      // points morph idle rotation (slows down as morph completes)
      const morphT = pointsMat.uniforms.uMorph.value || 0;
      points.rotation.y += 0.0009 * (1.0 - morphT);

      // hex idle motion
      hexGroup.rotation.y += 0.0006;
      hexGroup.position.x = Math.sin(t * 0.12) * 0.25;

      // bloom + render via composer
      composer.render();
    };

    render();

    // -----------------------
    // resize handling
    // -----------------------
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    // -----------------------
    // cleanup
    // -----------------------
    const cleanup = () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      if (rafId) cancelAnimationFrame(rafId);

      ScrollTrigger.getAll().forEach((st) => st.kill());
      gsap.killTweensOf(camera.position);

      try {
        pointsGeo.dispose && pointsGeo.dispose();
        pointsMat.dispose && pointsMat.dispose();
        runeMats.forEach((m) => m.dispose && m.dispose());
        icoGeo.dispose && icoGeo.dispose();
        wire.geometry && wire.geometry.dispose && wire.geometry.dispose();
        wire.material && wire.material.dispose && wire.material.dispose();

        hexGroup.children.forEach((tile) => {
          if (tile.geometry) tile.geometry.dispose && tile.geometry.dispose();
          if (tile.material) tile.material.dispose && tile.material.dispose();
        });
        hexGeo.dispose && hexGeo.dispose();

        composer.dispose && composer.dispose();
        renderer.forceContextLoss && renderer.forceContextLoss();
        renderer.dispose && renderer.dispose();
      } catch (e) {
        // swallow disposals
      } finally {
        if (renderer.domElement && mount.contains(renderer.domElement)) {
          mount.removeChild(renderer.domElement);
        }
      }

      try {
        if (audioAnalyserRef.current && audioAnalyserRef.current.context) {
          audioAnalyserRef.current.context.close && audioAnalyserRef.current.context.close();
        }
      } catch (e) {}
    };

    return cleanup;
  }, []);

  // -----------------------
  // Intersection observer for floating menu active state
  // -----------------------
  useEffect(() => {
    const ids = ["sec1", "sec2", "sec3"];
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            document.querySelectorAll("[data-section-dot]").forEach((el) => {
              el.dataset.active = el.dataset.section === entry.target.id ? "true" : "false";
            });
          }
        });
      },
      { root: null, rootMargin: "0px", threshold: 0.5 }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  // -----------------------
  // UI handlers
  // -----------------------
  const handleNavClick = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const enableMicHandler = async () => {
    if (enableMic && audioAnalyserRef.current) {
      audioAnalyserRef.current = null;
      setEnableMic(false);
      return;
    }
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      audioAnalyserRef.current = analyser;
      setEnableMic(true);
    } catch (e) {
      console.warn("Mic denied:", e);
      setEnableMic(false);
    }
  };

  // -----------------------
  // component render (HTML overlay + floating menu + sections)
  // -----------------------
  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* three.js canvas mount (fixed behind content) */}
      <div ref={mountRef} style={{ position: "fixed", inset: 0, zIndex: -1 }} />

      {/* Floating Menu */}
      <nav
        aria-label="Sections"
        style={{
          position: "fixed",
          right: 22,
          top: 22,
          zIndex: 90,
          background: "rgba(10,10,14,0.45)",
          backdropFilter: "blur(8px)",
          borderRadius: 14,
          padding: 8,
          boxShadow: "0 6px 30px rgba(0,0,0,0.5)",
          border: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <ul style={{ listStyle: "none", margin: 0, padding: 6, display: "flex", flexDirection: "column", gap: 8 }}>
          <li>
            <button onClick={() => handleNavClick("sec1")} style={menuBtn} data-section="sec1" data-section-dot>
              <span style={dotStyle()} data-section="sec1" data-active="false" />
              <span style={{ fontSize: 13, letterSpacing: "0.08em" }}>Spirit</span>
            </button>
          </li>

          <li>
            <button onClick={() => handleNavClick("sec2")} style={menuBtn} data-section="sec2" data-section-dot>
              <span style={dotStyle()} data-section="sec2" data-active="false" />
              <span style={{ fontSize: 13, letterSpacing: "0.08em" }}>Awakening</span>
            </button>
          </li>

          <li>
            <button onClick={() => handleNavClick("sec3")} style={menuBtn} data-section="sec3" data-section-dot>
              <span style={dotStyle()} data-section="sec3" data-active="false" />
              <span style={{ fontSize: 13, letterSpacing: "0.08em" }}>Human</span>
            </button>
          </li>

          <li>
            <button
              onClick={() => enableMicHandler()}
              title="Toggle Microphone (sound-reactive)"
              style={{
                marginTop: 6,
                padding: "6px 10px",
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.04)",
                background: enableMic ? "rgba(120,100,255,0.12)" : "transparent",
                color: "rgba(240,240,255,0.9)",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              {enableMic ? "Mic ON" : "Enable Mic"}
            </button>
          </li>
        </ul>
      </nav>

      {/* Content sections that drive the scroll-bound animations */}
      <div style={{ position: "relative", zIndex: 50 }}>
        <section id="sec1" style={sectionStyle}>
          <h1 style={h1Style}>FROM SPIRIT</h1>
          <p style={pStyle}>
            The journey begins at the source — a pulse of primordial energy forming in the vast cosmic sea.
            As the viewer scrolls forward, swirling particles gather, drifting like living stardust around a glowing core.
          </p>
        </section>

        <section id="sec2" style={sectionStyle}>
          <h1 style={h1Style}>DESCENT</h1>
          <p style={pStyle}>
            As the viewer scrolls, energy falls inward through layers of shifting light and nebula fog.
            Colors stretch, shapes distort, and the tunnel pulls you closer to its unseen core.
          </p>
        </section>

        <section id="sec3" style={sectionStyle}>
          <h1 style={h1Style}>BECOMING HUMAN</h1>
          <p style={pStyle}>
            The swirling cosmic energy begins to condense — light forms outlines and structure.
            Particles gather around a forming silhouette, vibrating with life as consciousness anchors into form.
          </p>
        </section>
      </div>
    </div>
  );
}

// -----------------------
// styles
// -----------------------
const menuBtn = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "8px 12px",
  borderRadius: 10,
  border: "none",
  background: "transparent",
  color: "rgba(220,220,255,0.9)",
  cursor: "pointer",
  transition: "all 180ms ease",
};

const dotStyle = () => ({
  width: 10,
  height: 10,
  borderRadius: 6,
  background: "transparent",
  boxShadow: "none",
  border: "1px solid rgba(255,255,255,0.06)",
  marginRight: 6,
});

const sectionStyle = {
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  justifyContent: "start",
  alignItems: "left",
  textAlign: "left",
  padding: "8rem",
  color: "white",
  fontFamily: "'Poppins', sans-serif",
  textShadow: "0 0 20px rgba(0,0,0,0.25)",
};

const h1Style = {
  fontSize: "clamp(42px, 6vw, 92px)",
  fontWeight: 300,
  letterSpacing: "0.12em",
  margin: 0,
  color: "#ffffff",
};

const pStyle = {
  marginTop: 18,
  maxWidth: 900,
  opacity: 0.92,
  fontSize: "clamp(15px, 1.15vw, 20px)",
  lineHeight: 1.6,
  color: "rgba(255,255,255,0.92)",
};

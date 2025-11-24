// src/components/ExperienceCanvas.jsx
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

gsap.registerPlugin(ScrollTrigger);

// Developer-provided decorative image (use as subtle noise/overlay)
const DECORATIVE_TEXTURE = "/mnt/data/WhatsApp Image 2025-11-21 at 13.44.40_46b1f003.jpg";

export default function ExperienceCanvas() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ---------- Renderer / Scene / Camera ----------
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    renderer.setPixelRatio(DPR);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.domElement.style.position = "fixed";
    renderer.domElement.style.inset = "0";
    renderer.domElement.style.zIndex = "-2"; // behind page content
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 0, 8);

    // ---------- Post-processing (bloom) ----------
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.9, 0.6, 0.1);
    bloomPass.threshold = 0.12;
    bloomPass.strength = 0.9;
    bloomPass.radius = 0.55;
    composer.addPass(bloomPass);

    // ---------- Controls (disabled for users; used for dev if needed) ----------
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enabled = false;

    // ---------- Geometry / Layers ----------
    const planeGeo = new THREE.PlaneGeometry(18, 10, 1, 1);

    // ---------- Load decorative texture (optional) ----------
    const texLoader = new THREE.TextureLoader();
    let decoTex = null;
    texLoader.load(
      DECORATIVE_TEXTURE,
      (t) => {
        decoTex = t;
        decoTex.wrapS = decoTex.wrapT = THREE.RepeatWrapping;
        decoTex.repeat.set(1, 1);
      },
      undefined,
      () => {
        decoTex = null;
      }
    );

    // ---------- Shaders (optimized, layered) ----------
    const vert = `
      varying vec2 vUv;
      void main(){
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
      }
    `;

    // compact fbm-like (value noise) for performance
    const frag = `
      precision highp float;
      varying vec2 vUv;
      uniform float uTime;
      uniform float uDensity;
      uniform float uGold;
      uniform float uGlow;
      uniform sampler2D uDeco;
      #ifdef USE_DECO
      #endif

      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }
      float noise(vec2 p){
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = hash(i);
        float b = hash(i + vec2(1.0,0.0));
        float c = hash(i + vec2(0.0,1.0));
        float d = hash(i + vec2(1.0,1.0));
        vec2 u = f*f*(3.0-2.0*f);
        return mix(a,b,u.x) + (c-a)u.y(1.0-u.x) + (d-b)*u.x*u.y;
      }
      float fbm(vec2 p){
        float v = 0.0;
        v += 0.52 * noise(p);
        v += 0.26 * noise(p * 2.0);
        v += 0.12 * noise(p * 4.4);
        return clamp(v, 0.0, 1.0);
      }

      void main(){
        vec2 uv = vUv - 0.5;
        float t = uTime * 0.06;

        float big = fbm(uv * vec2(1.3,0.85) - vec2(t*0.08, -t*0.04));
        float mid = fbm(uv * vec2(3.2,1.1) + vec2(t*0.42, t*0.16));
        float small = fbm(uv * 12.0 + vec2(t*1.2, -t*0.7)) * 0.25;

        float fog = smoothstep(0.12, 0.8, big*0.7 + mid*0.6 + small*0.45);
        float radial = pow(max(0.0, 1.0 - length(uv) * 1.6), 1.6);

        vec3 baseCool = vec3(0.02, 0.03, 0.06);
        vec3 midTone = vec3(0.16, 0.09, 0.05);
        vec3 gold = vec3(0.96, 0.78, 0.38);

        float goldFactor = uGold * radial * (0.35 + mid*0.7);
        vec3 col = mix(baseCool, midTone, mid*0.95 + big*0.2);
        col = mix(col, gold, clamp(goldFactor, 0.0, 1.0));
        col *= (0.6 + fog * (0.9 + uGlow*0.9));
        col *= mix(0.12, 1.0, uDensity);

        #ifdef USE_DECO
          vec3 deco = texture2D(uDeco, vUv * 1.0 + vec2(t*0.02)).rgb;
          col += deco * 0.03;
        #endif

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    const fusionUniforms = {
      uTime: { value: 0 },
      uDensity: { value: 1.0 },
      uGold: { value: 0.7 },
      uGlow: { value: 0.9 },
      uDeco: { value: decoTex },
    };

    const fusionMat = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      uniforms: fusionUniforms,
      depthWrite: false,
    });

    // Add mesh
    const fusionMesh = new THREE.Mesh(planeGeo, fusionMat);
    fusionMesh.scale.set(2.0, 2.0, 1.0);
    fusionMesh.position.z = -10;
    scene.add(fusionMesh);

    // ---------- Shimmer layer ----------
    const shimmerFrag = `
      precision highp float;
      varying vec2 vUv;
      uniform float uTime;
      uniform float uMix;
      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }
      float noise(vec2 p){ vec2 i = floor(p); vec2 f = fract(p); float a = hash(i); float b = hash(i+vec2(1.0,0.)); float c = hash(i+vec2(0.,1.)); float d = hash(i+vec2(1.,1.)); vec2 u = f*f*(3.-2.f); return mix(a,b,u.x)+(c-a)*u.y(1.-u.x)+(d-b)*u.x*u.y; }
      void main(){
        vec2 uv = vUv - 0.5;
        float t = uTime * 0.18;
        float n = noise(uv * 4.0 + vec2(t*0.12, -t*0.07));
        float band = smoothstep(0.45, 0.6, 0.5 + 0.5 * sin((uv.x*6.0)+t*2.0 + n*2.0));
        vec3 c = vec3(0.06,0.03,0.01) * (0.6 + band * 1.6);
        gl_FragColor = vec4(c * uMix, 1.0);
      }
    `;
    const shimmerMat = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: shimmerFrag,
      uniforms: { uTime: { value: 0 }, uMix: { value: 0.6 } },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const shimmerMesh = new THREE.Mesh(planeGeo, shimmerMat);
    shimmerMesh.scale.set(2.0, 2.0, 1.0);
    shimmerMesh.position.z = -9.6;
    scene.add(shimmerMesh);

    // ---------- Particles ----------
    const particleCount = Math.min(1600, Math.floor((window.innerWidth * window.innerHeight) / 60000));
    const pGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const flag = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 14;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = -6 + Math.random() * 6;
      sizes[i] = 0.8 + Math.random() * 3.0;
      flag[i] = Math.random() > 0.78 ? 1.0 : 0.0;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    pGeo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    pGeo.setAttribute("aFlag", new THREE.BufferAttribute(flag, 1));

    const pVert = `
      attribute float aSize;
      attribute float aFlag;
      varying float vFlag;
      void main(){
        vFlag = aFlag;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * (200.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }
    `;

    const pFrag = `
      precision highp float;
      varying float vFlag;
      void main(){
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        float alpha = smoothstep(0.5, 0.0, d);
        vec3 warm = vec3(0.98,0.82,0.5);
        vec3 cool = vec3(0.64,0.78,1.0);
        vec3 c = mix(warm, cool, vFlag);
        gl_FragColor = vec4(c, alpha * 0.95);
      }
    `;

    const pMat = new THREE.ShaderMaterial({
      vertexShader: pVert,
      fragmentShader: pFrag,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // ---------- Camera path (smooth curve) ----------
    // Define key camera positions and targets (Mont-Fort style slow cinematic)
    const keyframes = [
      { pos: new THREE.Vector3(0, 0.0, 8.0), look: new THREE.Vector3(0, 0, 0) }, // start
      { pos: new THREE.Vector3(0.4, 0.08, 6.0), look: new THREE.Vector3(0, 0, 0) }, // move in
      { pos: new THREE.Vector3(-0.2, 0.12, 5.0), look: new THREE.Vector3(0, 0, 0) }, // near core
      { pos: new THREE.Vector3(0.1, 0.05, 6.2), look: new THREE.Vector3(0, 0, 0) }  // back off
    ];

    // Create a timeline that interpolates camera along these keyframes
    const camProxy = { t: 0 }; // t from 0..1 across timeline
    const camTimeline = gsap.timeline({ paused: true });
    // Build timeline sections proportional to keyframes length
    camTimeline.to(camProxy, { t: 0.25, duration: 1.2, ease: "power2.inOut" });
    camTimeline.to(camProxy, { t: 0.6, duration: 1.6, ease: "power2.inOut" });
    camTimeline.to(camProxy, { t: 1.0, duration: 1.2, ease: "power2.inOut" });

    // ---------- Map main timeline to document scroll (full-page) ----------
    ScrollTrigger.create({
      trigger: document.body,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.7,
      onUpdate: (self) => {
        camTimeline.progress(self.progress);
      }
    });

    // Helper: interpolate along keyframes using t [0..1]
    function sampleCamera(t) {
      // map t to segment index
      const n = keyframes.length - 1;
      const seg = Math.min(Math.floor(t * n), n - 1);
      const localT = (t - (seg / n)) * n;
      const a = keyframes[seg];
      const b = keyframes[seg + 1];
      const pos = new THREE.Vector3().lerpVectors(a.pos, b.pos, localT);
      const look = new THREE.Vector3().lerpVectors(a.look, b.look, localT);
      return { pos, look };
    }

    // ---------- Section-based visual states ----------
    const setVisual = (i) => {
      if (i === 0) {
        gsap.to(fusionUniforms.uDensity, { value: 1.0, duration: 0.9 });
        gsap.to(fusionUniforms.uGold, { value: 0.72, duration: 0.9 });
        gsap.to(fusionUniforms.uGlow, { value: 0.9, duration: 0.9 });
        gsap.to(shimmerMat.uniforms.uMix, { value: 0.58, duration: 0.9 });
        gsap.to(bloomPass, { strength: 0.9, duration: 1.0 });
      } else if (i === 1) {
        gsap.to(fusionUniforms.uDensity, { value: 1.2, duration: 0.9 });
        gsap.to(fusionUniforms.uGold, { value: 0.95, duration: 0.9 });
        gsap.to(fusionUniforms.uGlow, { value: 1.3, duration: 0.9 });
        gsap.to(shimmerMat.uniforms.uMix, { value: 0.9, duration: 0.9 });
        gsap.to(bloomPass, { strength: 1.4, duration: 1.0 });
      } else {
        gsap.to(fusionUniforms.uDensity, { value: 0.78, duration: 0.9 });
        gsap.to(fusionUniforms.uGold, { value: 0.5, duration: 0.9 });
        gsap.to(fusionUniforms.uGlow, { value: 0.6, duration: 0.9 });
        gsap.to(shimmerMat.uniforms.uMix, { value: 0.45, duration: 0.9 });
        gsap.to(bloomPass, { strength: 0.6, duration: 1.0 });
      }
    };

    // attach triggers to your sections (exists in DOM)
    const sectionIDs = ["sec1", "sec2", "sec3", "sec4", "sec5"];
    sectionIDs.forEach((id, idx) => {
      ScrollTrigger.create({
        trigger: #${id},
        start: "top center",
        end: "bottom center",
        onEnter: () => setVisual(Math.min(2, idx)),
        onEnterBack: () => setVisual(Math.min(2, idx)),
      });
    });

    // ---------- Mouse parallax ----------
    const mouse = { x: 0, y: 0 };
    const onMouse = (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("mousemove", onMouse);

    // ---------- Render loop ----------
    const clock = new THREE.Clock();
    let raf = null;
    const onVisibility = () => {
      if (!document.hidden) loop();
      else cancelAnimationFrame(raf);
    };
    document.addEventListener("visibilitychange", onVisibility);

    function loop() {
      raf = requestAnimationFrame(loop);
      const t = clock.getElapsedTime();

      // update shader uniforms
      fusionUniforms.uTime.value = t;
      shimmerMat.uniforms.uTime.value = t;

      // update camera along timeline sample
      const progress = camTimeline.progress();
      const camSample = sampleCamera(progress);
      // interpolate to sample with mouse parallax
      camera.position.lerp(new THREE.Vector3(
        camSample.pos.x + mouse.x * 0.6,
        camSample.pos.y + mouse.y * 0.35,
        camSample.pos.z
      ), 0.08);

      camera.lookAt(camSample.look);

      // animate particles slightly
      const arr = pGeo.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const idx = i * 3;
        arr[idx + 1] += Math.sin(t * 0.12 + i) * 0.0008;
        if (arr[idx + 1] > 9) arr[idx + 1] = -9;
      }
      pGeo.attributes.position.needsUpdate = true;

      // subtle rotations
      fusionMesh.rotation.z = Math.sin(t * 0.015) * 0.02;
      shimmerMesh.rotation.z = Math.sin(t * 0.02 + 0.6) * 0.026;
      particles.rotation.y = Math.sin(t * 0.01) * 0.02;

      // composer render (with bloom)
      composer.render();
    }
    loop();

    // If deco texture loads later, enable define and set uniform
    const decoCheck = setInterval(() => {
      if (decoTex && fusionMat && !fusionMat.defines) {
        fusionMat.defines = { USE_DECO: 1 };
        fusionMat.uniforms.uDeco = { value: decoTex };
        fusionMat.needsUpdate = true;
        clearInterval(decoCheck);
      }
    }, 300);

    // ---------- Resize ----------
    let resizeTimer = null;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const w = window.innerWidth, h = window.innerHeight;
        renderer.setSize(w, h);
        composer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        bloomPass.setSize(w, h);
      }, 120);
    };
    window.addEventListener("resize", onResize);

    // ---------- Cleanup ----------
    return () => {
      clearInterval(decoCheck);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      ScrollTrigger.getAll().forEach((s) => s.kill());
      cancelAnimationFrame(raf);
      fusionMat.dispose();
      shimmerMat.dispose();
      pMat.dispose();
      pGeo.dispose();
      planeGeo.dispose();
      composer.dispose && composer.dispose();
      renderer.domElement && mount.removeChild(renderer.domElement);
      renderer.dispose && renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} />;
}

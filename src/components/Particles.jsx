import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function Particles({ count = 800 }) {
  const ref = useRef();

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for(let i=0;i<count;i++){
      const i3 = i*3;
      arr[i3] = (Math.random() - 0.5) * 6;
      arr[i3+1] = (Math.random() - 0.2) * 3;
      arr[i3+2] = (Math.random() - 0.5) * 6;
    }
    return arr;
  }, []);

  useFrame((state, delta) => {
    ref.current.rotation.y += delta * 0.08;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={positions.length / 3} itemSize={3}/>
      </bufferGeometry>
      <pointsMaterial
        size={0.09}
        color="#ffdfc8"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

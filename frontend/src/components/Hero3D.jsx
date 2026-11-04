import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, RoundedBox } from '@react-three/drei';

const N = 9;
const STEP = 1.7 / N;
const cx = (j) => -0.85 + (j + 0.5) * STEP;
const cy = (i) => -0.55 + 0.85 - (i + 0.5) * STEP;

function Ticket() {
  const group = useRef();
  const scan = useRef();

  useFrame((state) => {
    const { x, y } = state.pointer;
    group.current.rotation.y += (x * 0.6 - group.current.rotation.y) * 0.05;
    group.current.rotation.x += (-y * 0.35 - group.current.rotation.x) * 0.05;
    // QR par upar neeche chalti scan line
    scan.current.position.y = -0.55 + Math.sin(state.clock.elapsedTime * 1.8) * 0.92;
  });

  const cells = useMemo(() => {
    const out = [];
    let seed = 11;
    const rnd = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const finder = (i < 3 && j < 3) || (i < 3 && j >= N - 3) || (i >= N - 3 && j < 3);
        if (!finder && rnd() > 0.48) out.push([i, j]);
      }
    }
    return out;
  }, []);

  const finders = [
    [0, 0],
    [0, N - 3],
    [N - 3, 0],
  ];

  return (
    <group ref={group}>
      <RoundedBox args={[3.1, 4.4, 0.2]} radius={0.22} smoothness={4}>
        <meshPhysicalMaterial color="#111936" metalness={0.4} roughness={0.3} clearcoat={0.8} />
      </RoundedBox>

      <RoundedBox args={[2.8, 0.62, 0.06]} radius={0.12} position={[0, 1.78, 0.13]}>
        <meshStandardMaterial color="#4f46e5" emissive="#3730a3" emissiveIntensity={0.5} />
      </RoundedBox>
      <mesh position={[-0.7, 1.78, 0.18]}>
        <boxGeometry args={[1.0, 0.1, 0.02]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.9, 1.6, 0.18]}>
        <boxGeometry args={[0.6, 0.06, 0.02]} />
        <meshStandardMaterial color="#c7d2fe" />
      </mesh>

      <mesh position={[-0.55, 1.1, 0.12]}>
        <boxGeometry args={[1.5, 0.08, 0.02]} />
        <meshStandardMaterial color="#94a3b8" />
      </mesh>
      <mesh position={[-0.8, 0.9, 0.12]}>
        <boxGeometry args={[1.0, 0.08, 0.02]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>

      <RoundedBox args={[2.05, 2.05, 0.06]} radius={0.1} position={[0, -0.55, 0.13]}>
        <meshStandardMaterial color="#ffffff" roughness={0.4} />
      </RoundedBox>

      {cells.map(([i, j]) => (
        <mesh key={i + '-' + j} position={[cx(j), cy(i), 0.18]}>
          <boxGeometry args={[STEP * 0.88, STEP * 0.88, 0.05]} />
          <meshStandardMaterial color="#0b1020" />
        </mesh>
      ))}

      {finders.map(([i, j]) => (
        <group key={i + '_' + j}>
          <mesh position={[cx(j + 1), cy(i + 1), 0.18]}>
            <boxGeometry args={[STEP * 2.9, STEP * 2.9, 0.05]} />
            <meshStandardMaterial color="#0b1020" />
          </mesh>
          <mesh position={[cx(j + 1), cy(i + 1), 0.215]}>
            <boxGeometry args={[STEP * 1.5, STEP * 1.5, 0.03]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[cx(j + 1), cy(i + 1), 0.24]}>
            <boxGeometry args={[STEP * 0.8, STEP * 0.8, 0.03]} />
            <meshStandardMaterial color="#4f46e5" />
          </mesh>
        </group>
      ))}

      {/* hari scan line */}
      <mesh ref={scan} position={[0, -0.55, 0.3]}>
        <boxGeometry args={[2.15, 0.05, 0.02]} />
        <meshStandardMaterial color="#22c55e" emissive="#22c55e" emissiveIntensity={1.6} />
      </mesh>

      <Float speed={4} floatIntensity={0.5}>
        <group position={[1.35, 1.95, 0.45]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.38, 0.38, 0.1, 40]} />
            <meshStandardMaterial color="#16a34a" emissive="#15803d" emissiveIntensity={0.5} />
          </mesh>
          <mesh position={[-0.08, -0.02, 0.07]} rotation={[0, 0, -0.78]}>
            <boxGeometry args={[0.1, 0.28, 0.04]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0.1, 0.06, 0.07]} rotation={[0, 0, 0.78]}>
            <boxGeometry args={[0.1, 0.45, 0.04]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>
      </Float>
    </group>
  );
}

export default function Hero3D() {
  const wrap = useRef(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const o = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    o.observe(wrap.current);
    return () => o.disconnect();
  }, []);

  return (
    <div ref={wrap} style={{ width: '100%', height: '100%' }}>
      <Canvas frameloop={visible ? 'always' : 'never'} camera={{ position: [0, 0, 7.2], fov: 45 }} dpr={[1, 1.5]}>
        <ambientLight intensity={0.9} />
        <directionalLight position={[4, 5, 5]} intensity={2.2} />
        <pointLight position={[-5, -2, 3]} color="#a5b4fc" intensity={30} />

        <Float speed={1.6} rotationIntensity={0.25} floatIntensity={1}>
          <Ticket />
        </Float>
      </Canvas>
    </div>
  );
}
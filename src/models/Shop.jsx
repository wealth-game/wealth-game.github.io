import React from 'react'
import { Float, Html } from '@react-three/drei'

export function Shop() {
  return (
    <group position={[0, 0.5, 0]}>
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
        {/* 黄色车身 */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.2, 0.8, 0.8]} />
          <meshStandardMaterial color="#F1C40F" roughness={0.3} />
        </mesh>
        {/* 红色侧条纹 */}
        <mesh position={[0, 0.3, 0.41]}>
          <planeGeometry args={[1.2, 0.15]} />
          <meshStandardMaterial color="#E74C3C" />
        </mesh>
        <mesh position={[0, 0.3, -0.41]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[1.2, 0.15]} />
          <meshStandardMaterial color="#E74C3C" />
        </mesh>
        {/* 轮子 */}
        <Wheel position={[0.4, -0.3, 0.4]} />
        <Wheel position={[-0.4, -0.3, 0.4]} />
        <Wheel position={[0.4, -0.3, -0.4]} />
        <Wheel position={[-0.4, -0.3, -0.4]} />
        {/* 遮阳伞 */}
        <group position={[-0.4, 0.5, 0.3]}>
          <mesh position={[0, 0.6, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 1.5]} />
            <meshStandardMaterial color="#ECF0F1" />
          </mesh>
          <mesh position={[0, 1.3, 0]} castShadow>
            <coneGeometry args={[0.7, 0.4, 8]} />
            <meshStandardMaterial color="#E74C3C" />
          </mesh>
        </group>
        {/* 招牌 */}
        <Html position={[0, 1.6, 0]} center transform sprite distanceFactor={10}>
          <div style={{ background: 'white', padding: '2px 5px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold', border: '1px solid #E74C3C', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
            HOTDOG 🌭
          </div>
        </Html>
      </Float>
    </group>
  )
}

function Wheel({ position }) {
  return (
    <mesh position={position} rotation={[Math.PI / 2, 0, 0]} castShadow>
      <cylinderGeometry args={[0.2, 0.2, 0.1, 32]} />
      <meshStandardMaterial color="#2C3E50" />
    </mesh>
  )
}
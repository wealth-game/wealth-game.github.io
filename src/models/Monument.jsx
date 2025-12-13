import React from 'react'
import { Html } from '@react-three/drei'

export function Monument() {
  return (
    <group position={[0, 0, 0]}>
      {/* 基座 */}
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.8, 0.4, 4.8]} />
        <meshStandardMaterial color="#7f8c8d" />
      </mesh>
      {/* 柱子 */}
      <mesh position={[0, 6, 0]} castShadow>
        <boxGeometry args={[1.5, 12, 1.5]} />
        <meshStandardMaterial color="#ecf0f1" />
      </mesh>
      {/* 顶灯 */}
      <mesh position={[0, 13, 0]}>
        <octahedronGeometry args={[1]} />
        <meshStandardMaterial color="#f1c40f" emissive="#f1c40f" emissiveIntensity={2} />
      </mesh>
      {/* 文字 */}
      <Html position={[0, 8, 2]} center distanceFactor={20}>
        <div style={{color: 'white', fontWeight: '900', textShadow: '0 2px 4px black', whiteSpace: 'nowrap'}}>
          CITY CENTER
        </div>
      </Html>
    </group>
  )
}
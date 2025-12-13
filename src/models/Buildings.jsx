import React from 'react'
import { Html } from '@react-three/drei'

export function ConvenienceStore({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 2, 1.8]} />
        <meshStandardMaterial color="#34495e" />
      </mesh>
      <mesh position={[0, 0.5, 0.91]}>
        <planeGeometry args={[1.2, 0.8]} />
        <meshStandardMaterial color="#ecf0f1" />
      </mesh>
      <mesh position={[0, 1.6, 0.91]}>
        <boxGeometry args={[1.6, 0.4, 0.1]} />
        <meshStandardMaterial color="#2ecc71" />
      </mesh>
      <Html position={[0, 2.5, 0]} center distanceFactor={15}>
        <div style={{background: '#2ecc71', color: 'white', padding: '2px 5px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold'}}>7-ELEVEN</div>
      </Html>
    </group>
  )
}
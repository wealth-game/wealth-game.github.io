/* src/models/Tree.jsx */
import React from 'react'

export function Tree({ position, type = 'round' }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.15, 1]} />
        <meshStandardMaterial color="#8e44ad" />
      </mesh>
      <mesh position={[0, 1.2, 0]} castShadow>
        <dodecahedronGeometry args={[0.6]} />
        <meshStandardMaterial color={type === 'round' ? "#2ecc71" : "#27ae60"} />
      </mesh>
    </group>
  )
}
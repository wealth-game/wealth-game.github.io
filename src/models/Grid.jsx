import React from 'react'

export function GridMap({ size = 200, divisions = 100 }) {
  return (
    <gridHelper args={[size, divisions, 0x888888, 0xe0e0e0]} position={[0, 0.01, 0]} />
  )
}

export function SelectionBox({ x, z }) {
  const snapX = Math.floor(x / 2) * 2 + 1
  const snapZ = Math.floor(z / 2) * 2 + 1
  return (
    <mesh position={[snapX, 0.02, snapZ]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[1.9, 1.9]} />
      <meshBasicMaterial color="#2ecc71" wireframe />
    </mesh>
  )
}
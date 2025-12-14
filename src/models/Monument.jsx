/* src/models/Monument.jsx */
import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'

export function Monument() {
  const outerRing = useRef()
  const innerRing = useRef()
  const coreRef = useRef()
  const beamRef = useRef()
  const floatingGroup = useRef() // 新增：用于手动控制浮动

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime

    // 1. 手动实现上下浮动 (替代 Float 组件，更稳定)
    if (floatingGroup.current) {
      floatingGroup.current.position.y = 8 + Math.sin(t) * 0.5
      floatingGroup.current.rotation.y = Math.sin(t * 0.2) * 0.1
    }

    // 2. 环的旋转
    if (outerRing.current) {
      outerRing.current.rotation.x = Math.sin(t * 0.5) * 0.2
      outerRing.current.rotation.y += delta * 0.2
    }
    if (innerRing.current) {
      innerRing.current.rotation.x += delta * 0.5
      innerRing.current.rotation.z += delta * 0.5
    }

    // 3. 核心旋转
    if (coreRef.current) {
      coreRef.current.rotation.y += delta
      coreRef.current.rotation.z = Math.sin(t) * 0.5
    }

    // 4. 光束呼吸
    if (beamRef.current) {
      const scale = 1 + Math.sin(t * 3) * 0.1
      beamRef.current.scale.set(scale, 1, scale)
    }
  })

  return (
    <group position={[0, 0, 0]}>
      {/* 基座 */}
      <mesh position={[0, 0.5, 0]} receiveShadow><cylinderGeometry args={[4, 4.5, 1, 8]} /><meshStandardMaterial color="#1a1a1a" roughness={0.1} metalness={0.8} /></mesh>
      <mesh position={[0, 1.1, 0]}><cylinderGeometry args={[3.8, 3.8, 0.2, 8]} /><meshStandardMaterial color="#f1c40f" metalness={1} roughness={0.1} /></mesh>
      <mesh position={[0, 2, 0]} castShadow><cylinderGeometry args={[2.5, 3, 2, 6]} /><meshStandardMaterial color="#2c3e50" roughness={0.2} /></mesh>

      {/* 光束 */}
      <mesh ref={beamRef} position={[0, 100, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 200, 32]} />
        <meshStandardMaterial color="#00ffff" transparent opacity={0.4} emissive="#00ffff" emissiveIntensity={2} toneMapped={false} />
      </mesh>

      {/* 塔身 */}
      <mesh position={[0, 15, 0]} castShadow>
        <cylinderGeometry args={[0.3, 1.5, 30, 4]} />
        <meshStandardMaterial color="#ecf0f1" metalness={0.5} />
      </mesh>

      {/* 悬浮核心 (手动控制组) */}
      <group ref={floatingGroup} position={[0, 8, 0]}>
          <mesh ref={coreRef}>
            <octahedronGeometry args={[1.5, 0]} />
            <meshStandardMaterial color="#00ffff" emissive="white" emissiveIntensity={1} wireframe />
            <mesh scale={[0.8, 0.8, 0.8]}><octahedronGeometry args={[1.5, 0]} /><meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={3} /></mesh>
          </mesh>
          <mesh ref={outerRing}><torusGeometry args={[3.5, 0.2, 16, 100]} /><meshStandardMaterial color="#f1c40f" metalness={1} roughness={0} /></mesh>
          <mesh ref={innerRing}><torusGeometry args={[2.5, 0.15, 16, 100]} /><meshStandardMaterial color="#ecf0f1" metalness={0.8} emissive="#ecf0f1" emissiveIntensity={0.2} /></mesh>
          <pointLight distance={30} color="#00ffff" intensity={2} />
      </group>

      <Html position={[0, 5, 0]} center distanceFactor={30} transform sprite>
        <div style={{textAlign: 'center', pointerEvents: 'none', userSelect: 'none'}}>
          <div style={{fontSize: '24px', fontWeight: '900', color: '#fff', textShadow: '0 0 10px #00ffff', fontFamily: 'Impact, sans-serif'}}>WORLD CENTER</div>
          <div style={{fontSize: '10px', color: '#f1c40f', background: 'rgba(0,0,0,0.8)', padding: '2px 10px', borderRadius: '4px'}}>[ 0, 0 ]</div>
        </div>
      </Html>
    </group>
  )
}
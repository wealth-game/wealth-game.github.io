/* src/models/Monument.jsx */
import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Float } from '@react-three/drei'

export function Monument() {
  const outerRing = useRef()
  const innerRing = useRef()
  const coreRef = useRef()
  const beamRef = useRef()
  const floatingGroup = useRef() 

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (floatingGroup.current) {
      floatingGroup.current.position.y = 8 + Math.sin(t) * 0.5
      floatingGroup.current.rotation.y = Math.sin(t * 0.2) * 0.1
    }
    if (outerRing.current) {
      outerRing.current.rotation.x = Math.sin(t * 0.5) * 0.2
      outerRing.current.rotation.y += delta * 0.2
    }
    if (innerRing.current) {
      innerRing.current.rotation.x += delta * 0.5
      innerRing.current.rotation.z += delta * 0.5
    }
    if (coreRef.current) {
      coreRef.current.rotation.y += delta
      coreRef.current.rotation.z = Math.sin(t) * 0.5
    }
    if (beamRef.current) {
      const scale = 1 + Math.sin(t * 3) * 0.1
      beamRef.current.scale.set(scale, 1, scale)
    }
  })

  return (
    <group position={[0, 0, 0]}>
      {/* 1. 华丽基座 */}
      <mesh position={[0, 0.5, 0]} receiveShadow><cylinderGeometry args={[4, 4.5, 1, 8]} /><meshStandardMaterial color="#1a1a1a" roughness={0.1} metalness={0.8} /></mesh>
      <mesh position={[0, 1.1, 0]}><cylinderGeometry args={[3.8, 3.8, 0.2, 8]} /><meshStandardMaterial color="#f1c40f" metalness={1} roughness={0.1} /></mesh>
      <mesh position={[0, 2, 0]} castShadow><cylinderGeometry args={[2.5, 3, 2, 6]} /><meshStandardMaterial color="#2c3e50" roughness={0.2} /></mesh>

      {/* 2. 通天光束 (无限高) */}
      <mesh ref={beamRef} position={[0, 100, 0]}>
        {/* 高度 200米，半径 0.5米 */}
        <cylinderGeometry args={[0.5, 0.5, 200, 32]} />
        <meshStandardMaterial color="#00ffff" transparent opacity={0.4} emissive="#00ffff" emissiveIntensity={2} toneMapped={false} />
      </mesh>

      {/* 3. 实体塔身 (增加高度到 30米) */}
      <mesh position={[0, 15, 0]} castShadow>
        <cylinderGeometry args={[0.3, 1.5, 30, 4]} />
        <meshStandardMaterial color="#ecf0f1" metalness={0.5} />
      </mesh>

      {/* 4. 悬浮核心 */}
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

      {/* 🛡️ 修复：移除 transform，使用普通 HTML 覆盖模式，更稳定 */}
      {/* zIndexRange 确保它不会被远处的云遮住 */}
      <Html position={[0, 5, 0]} center distanceFactor={30} zIndexRange={[100, 0]}>
        <div style={{textAlign: 'center', pointerEvents: 'none', userSelect: 'none', whiteSpace: 'nowrap'}}>
          <div style={{fontSize: '24px', fontWeight: '900', color: '#fff', textShadow: '0 0 10px #00ffff', fontFamily: 'Impact, sans-serif'}}>WORLD CENTER</div>
          <div style={{fontSize: '10px', color: '#f1c40f', background: 'rgba(0,0,0,0.8)', padding: '2px 10px', borderRadius: '4px'}}>[ 0, 0 ]</div>
        </div>
      </Html>
    </group>
  )
}
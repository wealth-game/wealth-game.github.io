/* src/models/Monument.jsx */
import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Float } from '@react-three/drei'

export function Monument() {
  const crystalRef = useRef()
  const ringRef = useRef()

  // 动画：让水晶和光环转动
  useFrame((state, delta) => {
    if (crystalRef.current) crystalRef.current.rotation.y += delta * 0.5
    if (ringRef.current) {
      ringRef.current.rotation.z -= delta * 0.2
      ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.1
    }
  })

  return (
    <group position={[0, 0, 0]}>
      {/* === 1. 宏伟基座 (三层阶梯) === */}
      <mesh position={[0, 0.25, 0]} receiveShadow>
        <boxGeometry args={[5, 0.5, 5]} />
        <meshStandardMaterial color="#7f8c8d" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.75, 0]} receiveShadow>
        <boxGeometry args={[3.5, 0.5, 3.5]} />
        <meshStandardMaterial color="#95a5a6" roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.25, 0]} receiveShadow>
        <boxGeometry args={[2.5, 0.5, 2.5]} />
        <meshStandardMaterial color="#bdc3c7" roughness={0.5} />
      </mesh>

      {/* === 2. 主塔身 (现代风格方尖碑) === */}
      <mesh position={[0, 6, 0]} castShadow>
        <cylinderGeometry args={[0.8, 1.5, 10, 4]} /> {/* 4边形柱体 */}
        <meshStandardMaterial color="#ecf0f1" metalness={0.2} roughness={0.1} />
      </mesh>
      
      {/* 塔身装饰线 (发光) */}
      <mesh position={[0, 6, 0]}>
        <cylinderGeometry args={[0.82, 1.52, 9, 4]} />
        <meshStandardMaterial color="#3498db" wireframe emissive="#3498db" emissiveIntensity={0.5} />
      </mesh>

      {/* === 3. 顶部能量核心 === */}
      <group position={[0, 12, 0]}>
        {/* 浮动动画 */}
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          {/* 发光水晶 */}
          <mesh ref={crystalRef}>
            <octahedronGeometry args={[1.2, 0]} />
            <meshStandardMaterial 
              color="#f1c40f" 
              emissive="#f1c40f" 
              emissiveIntensity={2} 
              toneMapped={false} 
            />
          </mesh>
          
          {/* 科技感光环 */}
          <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[2, 0.1, 16, 100]} />
            <meshStandardMaterial color="#3498db" emissive="#3498db" emissiveIntensity={1} />
          </mesh>
        </Float>
        
        {/* 顶部点光源，照亮周围 */}
        <pointLight intensity={2} distance={10} color="#f1c40f" />
      </group>

      {/* === 4. 悬浮文字 === */}
      <Html position={[0, 15, 0]} center distanceFactor={25}>
        <div style={{
          textAlign: 'center', pointerEvents: 'none'
        }}>
          <div style={{
            fontSize: '24px', fontWeight: '900', color: 'white', 
            textShadow: '0 0 10px #f1c40f, 0 0 20px #f1c40f',
            letterSpacing: '4px'
          }}>
            CITY CENTER
          </div>
          <div style={{
            fontSize: '10px', color: '#ecf0f1', marginTop: '5px',
            background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: '10px'
          }}>
            (0, 0) 绝对安全区
          </div>
        </div>
      </Html>
    </group>
  )
}
import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export function Player({ isWorking, color = "#3498db" }) {
  const group = useRef()
  const body = useRef()
  const leftLeg = useRef()
  const rightLeg = useRef()
  const leftArm = useRef()
  const rightArm = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    group.current.position.y = Math.sin(t * 2) * 0.05 + 0.05 // 呼吸感

    if (isWorking) {
      body.current.rotation.x = 0.2 // 前倾
      leftLeg.current.rotation.x = Math.sin(t * 15) * 0.8
      rightLeg.current.rotation.x = Math.cos(t * 15) * 0.8
      leftArm.current.rotation.x = Math.cos(t * 15) * 0.8
      rightArm.current.rotation.x = Math.sin(t * 15) * 0.8
    } else {
      body.current.rotation.x = 0
      leftLeg.current.rotation.x = 0
      rightLeg.current.rotation.x = 0
      leftArm.current.rotation.x = 0
      rightArm.current.rotation.x = 0
    }
  })

  return (
    <group ref={group}>
      <group ref={body} position={[0, 0.9, 0]}>
        {/* 身体 */}
        <mesh castShadow>
          <boxGeometry args={[0.4, 0.45, 0.25]} />
          <meshStandardMaterial color={color} />
        </mesh>
        {/* 头 */}
        <mesh position={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial color="#ffccaa" />
        </mesh>
        {/* 眼睛 */}
        <mesh position={[0.08, 0.45, 0.16]}><sphereGeometry args={[0.03]} /><meshStandardMaterial color="black" /></mesh>
        <mesh position={[-0.08, 0.45, 0.16]}><sphereGeometry args={[0.03]} /><meshStandardMaterial color="black" /></mesh>
        {/* 红色双肩包 */}
        <mesh position={[0, 0, -0.18]} castShadow>
          <boxGeometry args={[0.3, 0.35, 0.1]} />
          <meshStandardMaterial color="#e74c3c" />
        </mesh>
        {/* 手臂 */}
        <group ref={leftArm} position={[-0.25, 0.15, 0]}>
          <mesh position={[0, -0.15, 0]}><boxGeometry args={[0.1, 0.35, 0.1]} /><meshStandardMaterial color={color} /></mesh>
          <mesh position={[0, -0.35, 0]}><sphereGeometry args={[0.05]} /><meshStandardMaterial color="#ffccaa" /></mesh>
        </group>
        <group ref={rightArm} position={[0.25, 0.15, 0]}>
          <mesh position={[0, -0.15, 0]}><boxGeometry args={[0.1, 0.35, 0.1]} /><meshStandardMaterial color={color} /></mesh>
          <mesh position={[0, -0.35, 0]}><sphereGeometry args={[0.05]} /><meshStandardMaterial color="#ffccaa" /></mesh>
        </group>
      </group>
      {/* 腿 */}
      <group ref={leftLeg} position={[-0.1, 0.65, 0]}>
        <mesh position={[0, -0.3, 0]} castShadow><boxGeometry args={[0.12, 0.6, 0.12]} /><meshStandardMaterial color="#2c3e50" /></mesh>
      </group>
      <group ref={rightLeg} position={[0.1, 0.65, 0]}>
        <mesh position={[0, -0.3, 0]} castShadow><boxGeometry args={[0.12, 0.6, 0.12]} /><meshStandardMaterial color="#2c3e50" /></mesh>
      </group>
    </group>
  )
}
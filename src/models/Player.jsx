/* src/models/Player.jsx */
import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

const defaultSkin = {
  head: "#ffccaa", body: "#3498db", legs: "#2c3e50", eyes: "#000000", backpack: "#e74c3c", hair: "#2c3e50", shoes: "#333333"
}

export function Player({ isWorking, skin = {} }) {
  const group = useRef()
  const body = useRef()
  const leftLeg = useRef()
  const rightLeg = useRef()
  const leftArm = useRef()
  const rightArm = useRef()

  const finalSkin = { ...defaultSkin, ...skin }

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if(group.current) group.current.position.y = Math.sin(t * 2) * 0.05 + 0.05

    if (isWorking) {
      if(body.current) body.current.rotation.x = 0.2
      if(leftLeg.current) leftLeg.current.rotation.x = Math.sin(t * 15) * 0.8
      if(rightLeg.current) rightLeg.current.rotation.x = Math.cos(t * 15) * 0.8
      if(leftArm.current) leftArm.current.rotation.x = Math.cos(t * 15) * 0.8
      if(rightArm.current) rightArm.current.rotation.x = Math.sin(t * 15) * 0.8
    } else {
      if(body.current) body.current.rotation.x = 0
      if(leftLeg.current) leftLeg.current.rotation.x = 0
      if(rightLeg.current) rightLeg.current.rotation.x = 0
      if(leftArm.current) leftArm.current.rotation.x = 0
      if(rightArm.current) rightArm.current.rotation.x = 0
    }
  })

  return (
    <group ref={group}>
      <group ref={body} position={[0, 0.9, 0]}>
        {/* 上衣 */}
        <mesh castShadow receiveShadow><boxGeometry args={[0.4, 0.45, 0.25]} /><meshStandardMaterial color={finalSkin.body} /></mesh>
        
        {/* === 头部组 === */}
        <group position={[0, 0.4, 0]}>
          {/* 脸部 */}
          <mesh castShadow><boxGeometry args={[0.3, 0.3, 0.3]} /><meshStandardMaterial color={finalSkin.head} /></mesh>
          
          {/* 头发 (向上挪一点 y=0.18) */}
          <mesh position={[0, 0.18, 0]} castShadow>
             <boxGeometry args={[0.32, 0.15, 0.32]} />
             <meshStandardMaterial color={finalSkin.hair} />
          </mesh>
          {/* 后脑勺头发 */}
          <mesh position={[0, 0, -0.16]} castShadow>
             <boxGeometry args={[0.32, 0.3, 0.05]} />
             <meshStandardMaterial color={finalSkin.hair} />
          </mesh>

          {/* 眼睛 (向下挪一点 y=0) */}
          <mesh position={[0.08, 0, 0.16]}><sphereGeometry args={[0.03]} /><meshStandardMaterial color={finalSkin.eyes} /></mesh>
          <mesh position={[-0.08, 0, 0.16]}><sphereGeometry args={[0.03]} /><meshStandardMaterial color={finalSkin.eyes} /></mesh>
        </group>
        
        {/* 背包 */}
        <mesh position={[0, 0, -0.18]} castShadow><boxGeometry args={[0.3, 0.35, 0.1]} /><meshStandardMaterial color={finalSkin.backpack} /></mesh>

        {/* 手臂 */}
        <group ref={leftArm} position={[-0.25, 0.15, 0]}><mesh position={[0, -0.15, 0]}><boxGeometry args={[0.1, 0.35, 0.1]} /><meshStandardMaterial color={finalSkin.body} /></mesh><mesh position={[0, -0.35, 0]}><sphereGeometry args={[0.05]} /><meshStandardMaterial color={finalSkin.head} /></mesh></group>
        <group ref={rightArm} position={[0.25, 0.15, 0]}><mesh position={[0, -0.15, 0]}><boxGeometry args={[0.1, 0.35, 0.1]} /><meshStandardMaterial color={finalSkin.body} /></mesh><mesh position={[0, -0.35, 0]}><sphereGeometry args={[0.05]} /><meshStandardMaterial color={finalSkin.head} /></mesh></group>
      </group>

      {/* 腿与鞋 */}
      <group ref={leftLeg} position={[-0.1, 0.65, 0]}><mesh position={[0, -0.25, 0]} castShadow><boxGeometry args={[0.12, 0.5, 0.12]} /><meshStandardMaterial color={finalSkin.legs} /></mesh><mesh position={[0, -0.52, 0.03]} castShadow><boxGeometry args={[0.14, 0.1, 0.18]} /><meshStandardMaterial color={finalSkin.shoes} /></mesh></group>
      <group ref={rightLeg} position={[0.1, 0.65, 0]}><mesh position={[0, -0.25, 0]} castShadow><boxGeometry args={[0.12, 0.5, 0.12]} /><meshStandardMaterial color={finalSkin.legs} /></mesh><mesh position={[0, -0.52, 0.03]} castShadow><boxGeometry args={[0.14, 0.1, 0.18]} /><meshStandardMaterial color={finalSkin.shoes} /></mesh></group>
    </group>
  )
}
/* src/models/Player.jsx */
import React, { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

const defaultSkin = { head: "#ffccaa", body: "#3498db", legs: "#2c3e50", eyes: "#000000", backpack: "#e74c3c", hair: "#2c3e50", shoes: "#333333" }

export function Player({ isWorking, rotation = 0, skin = {} }) {
  const group = useRef()
  const body = useRef()
  const leftLeg = useRef()
  const rightLeg = useRef()
  const leftArm = useRef()
  const rightArm = useRef()
  
  // Ref 追踪，防止闭包
  const targetRot = useRef(rotation)
  useEffect(() => { targetRot.current = rotation }, [rotation])

  const finalSkin = { ...defaultSkin, ...skin }

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    
    if(group.current) {
      group.current.position.y = Math.sin(t * 4) * 0.02 + 0.02

      // 平滑旋转
      const currentQ = group.current.quaternion
      const targetQ = new THREE.Quaternion()
      targetQ.setFromAxisAngle(new THREE.Vector3(0, 1, 0), targetRot.current)
      group.current.quaternion.slerp(targetQ, delta * 10)
    }

    if (isWorking) {
      if(body.current) { body.current.rotation.x = 0.15; body.current.rotation.z = Math.sin(t * 12) * 0.05 }
      if(leftLeg.current) leftLeg.current.rotation.x = Math.sin(t * 12) * 0.8
      if(rightLeg.current) rightLeg.current.rotation.x = Math.cos(t * 12) * 0.8
      if(leftArm.current) leftArm.current.rotation.x = Math.cos(t * 12) * 0.8
      if(rightArm.current) rightArm.current.rotation.x = Math.sin(t * 12) * 0.8
    } else {
      if(body.current) { body.current.rotation.x = 0; body.current.rotation.z = 0 }
      if(leftLeg.current) leftLeg.current.rotation.x = 0
      if(rightLeg.current) rightLeg.current.rotation.x = 0
      if(leftArm.current) leftArm.current.rotation.x = Math.sin(t * 2) * 0.05
      if(rightArm.current) rightArm.current.rotation.x = -Math.sin(t * 2) * 0.05
    }
  })

  return (
    <group ref={group}>
      {/* 🔴 注意：这里没有额外的 rotation Wrapper */}
      <group ref={body} position={[0, 0.65, 0]}>
        <RoundedBox args={[0.42, 0.45, 0.28]} radius={0.05} castShadow receiveShadow><meshStandardMaterial color={finalSkin.body} /></RoundedBox>
        <group position={[0, 0.45, 0]}>
          <RoundedBox args={[0.38, 0.38, 0.38]} radius={0.12} castShadow><meshStandardMaterial color={finalSkin.head} /></RoundedBox>
          <group position={[0, 0.05, 0]}>
             <RoundedBox args={[0.4, 0.15, 0.4]} radius={0.1} position={[0, 0.15, 0]}><meshStandardMaterial color={finalSkin.hair} /></RoundedBox>
             <RoundedBox args={[0.4, 0.3, 0.1]} radius={0.05} position={[0, 0, -0.16]}><meshStandardMaterial color={finalSkin.hair} /></RoundedBox>
             <RoundedBox args={[0.1, 0.1, 0.05]} radius={0.02} position={[0.1, 0.12, 0.19]}><meshStandardMaterial color={finalSkin.hair} /></RoundedBox>
          </group>
          <group position={[0, 0, 0.195]}>
            <mesh position={[0.08, 0.02, 0]}><sphereGeometry args={[0.035]} /><meshStandardMaterial color={finalSkin.eyes} /></mesh>
            <mesh position={[-0.08, 0.02, 0]}><sphereGeometry args={[0.035]} /><meshStandardMaterial color={finalSkin.eyes} /></mesh>
            <mesh position={[0.12, -0.05, 0]}><cylinderGeometry args={[0.03, 0.03, 0.01]} rotation={[Math.PI/2,0,0]} /><meshStandardMaterial color="#ff9999" opacity={0.6} transparent /></mesh>
            <mesh position={[-0.12, -0.05, 0]}><cylinderGeometry args={[0.03, 0.03, 0.01]} rotation={[Math.PI/2,0,0]} /><meshStandardMaterial color="#ff9999" opacity={0.6} transparent /></mesh>
          </group>
        </group>
        <RoundedBox args={[0.25, 0.3, 0.12]} radius={0.05} position={[0, 0, -0.18]} castShadow><meshStandardMaterial color={finalSkin.backpack} /></RoundedBox>
        <group ref={leftArm} position={[-0.24, 0.15, 0]}><RoundedBox args={[0.12, 0.35, 0.12]} radius={0.06} position={[0, -0.1, 0]} castShadow><meshStandardMaterial color={finalSkin.body} /></RoundedBox><mesh position={[0, -0.28, 0]}><sphereGeometry args={[0.06]} /><meshStandardMaterial color={finalSkin.head} /></mesh></group>
        <group ref={rightArm} position={[0.24, 0.15, 0]}><RoundedBox args={[0.12, 0.35, 0.12]} radius={0.06} position={[0, -0.1, 0]} castShadow><meshStandardMaterial color={finalSkin.body} /></RoundedBox><mesh position={[0, -0.28, 0]}><sphereGeometry args={[0.06]} /><meshStandardMaterial color={finalSkin.head} /></mesh></group>
      </group>
      <group ref={leftLeg} position={[-0.11, 0.45, 0]}><RoundedBox args={[0.14, 0.45, 0.14]} radius={0.05} position={[0, -0.1, 0]} castShadow><meshStandardMaterial color={finalSkin.legs} /></RoundedBox><RoundedBox args={[0.16, 0.12, 0.22]} radius={0.04} position={[0, -0.32, 0.03]} castShadow><meshStandardMaterial color={finalSkin.shoes} /></RoundedBox></group>
      <group ref={rightLeg} position={[0.11, 0.45, 0]}><RoundedBox args={[0.14, 0.45, 0.14]} radius={0.05} position={[0, -0.1, 0]} castShadow><meshStandardMaterial color={finalSkin.legs} /></RoundedBox><RoundedBox args={[0.16, 0.12, 0.22]} radius={0.04} position={[0, -0.32, 0.03]} castShadow><meshStandardMaterial color={finalSkin.shoes} /></RoundedBox></group>
    </group>
  )
}
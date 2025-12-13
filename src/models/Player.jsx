/* src/models/Player.jsx */
import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

// 升级默认皮肤：包含5个部分
const defaultSkin = {
  head: "#ffccaa",     // 肤色
  body: "#3498db",     // 上衣
  legs: "#2c3e50",     // 裤子
  eyes: "#000000",     // 眼睛
  backpack: "#e74c3c"  // 书包
}

export function Player({ isWorking, skin = {} }) {
  const group = useRef()
  const body = useRef()
  const leftLeg = useRef()
  const rightLeg = useRef()
  const leftArm = useRef()
  const rightArm = useRef()

  // 合并默认值 (防止老账号缺少新字段导致报错)
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
        {/* 1. 上衣 */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.4, 0.45, 0.25]} />
          <meshStandardMaterial color={finalSkin.body} />
        </mesh>
        
        {/* 2. 头部 */}
        <mesh position={[0, 0.4, 0]} castShadow>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial color={finalSkin.head} />
        </mesh>
        
        {/* 3. 眼睛 (可变色) */}
        <mesh position={[0.08, 0.45, 0.16]}>
          <sphereGeometry args={[0.03]} />
          <meshStandardMaterial color={finalSkin.eyes} />
        </mesh>
        <mesh position={[-0.08, 0.45, 0.16]}>
          <sphereGeometry args={[0.03]} />
          <meshStandardMaterial color={finalSkin.eyes} />
        </mesh>
        
        {/* 4. 背包 (可变色) */}
        <mesh position={[0, 0, -0.18]} castShadow>
          <boxGeometry args={[0.3, 0.35, 0.1]} />
          <meshStandardMaterial color={finalSkin.backpack} />
        </mesh>

        {/* 手臂 (袖子跟衣服同色，手跟头同色) */}
        <group ref={leftArm} position={[-0.25, 0.15, 0]}>
          <mesh position={[0, -0.15, 0]}><boxGeometry args={[0.1, 0.35, 0.1]} /><meshStandardMaterial color={finalSkin.body} /></mesh>
          <mesh position={[0, -0.35, 0]}><sphereGeometry args={[0.05]} /><meshStandardMaterial color={finalSkin.head} /></mesh>
        </group>
        <group ref={rightArm} position={[0.25, 0.15, 0]}>
          <mesh position={[0, -0.15, 0]}><boxGeometry args={[0.1, 0.35, 0.1]} /><meshStandardMaterial color={finalSkin.body} /></mesh>
          <mesh position={[0, -0.35, 0]}><sphereGeometry args={[0.05]} /><meshStandardMaterial color={finalSkin.head} /></mesh>
        </group>
      </group>

      {/* 5. 裤子 */}
      <group ref={leftLeg} position={[-0.1, 0.65, 0]}>
        <mesh position={[0, -0.3, 0]} castShadow><boxGeometry args={[0.12, 0.6, 0.12]} /><meshStandardMaterial color={finalSkin.legs} /></mesh>
      </group>
      <group ref={rightLeg} position={[0.1, 0.65, 0]}>
        <mesh position={[0, -0.3, 0]} castShadow><boxGeometry args={[0.12, 0.6, 0.12]} /><meshStandardMaterial color={finalSkin.legs} /></mesh>
      </group>
    </group>
  )
}
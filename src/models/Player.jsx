/* src/models/Player.jsx */
import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei' // 引入圆角组件，质感倍增！

const defaultSkin = {
  head: "#ffccaa", 
  body: "#3498db", 
  legs: "#2c3e50", 
  eyes: "#000000", 
  backpack: "#e74c3c", 
  hair: "#2c3e50", 
  shoes: "#333333"
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
    
    // 1. 身体律动 (呼吸感)
    if(group.current) {
      group.current.position.y = Math.sin(t * 4) * 0.02 + 0.02
    }

    // 2. 动画逻辑
    if (isWorking) {
      // 跑步：大幅摆动，身体前倾
      if(body.current) {
        body.current.rotation.x = 0.15 
        body.current.rotation.z = Math.sin(t * 12) * 0.05 // 左右轻微摇摆
      }
      if(leftLeg.current) leftLeg.current.rotation.x = Math.sin(t * 12) * 0.8
      if(rightLeg.current) rightLeg.current.rotation.x = Math.cos(t * 12) * 0.8
      if(leftArm.current) leftArm.current.rotation.x = Math.cos(t * 12) * 0.8
      if(rightArm.current) rightArm.current.rotation.x = Math.sin(t * 12) * 0.8
    } else {
      // 站立：微风吹拂的摆动
      if(body.current) {
        body.current.rotation.x = 0
        body.current.rotation.z = 0
      }
      if(leftLeg.current) leftLeg.current.rotation.x = 0
      if(rightLeg.current) rightLeg.current.rotation.x = 0
      if(leftArm.current) leftArm.current.rotation.x = Math.sin(t * 2) * 0.05
      if(rightArm.current) rightArm.current.rotation.x = -Math.sin(t * 2) * 0.05
    }
  })

  return (
    <group ref={group}>
      {/* === 上半身组 (中心点调整到腰部) === */}
      <group ref={body} position={[0, 0.65, 0]}>
        
        {/* 1. 躯干 (圆润胖乎乎) */}
        <RoundedBox args={[0.42, 0.45, 0.28]} radius={0.05} castShadow receiveShadow>
          <meshStandardMaterial color={finalSkin.body} />
        </RoundedBox>
        
        {/* === 头部 (大头风格) === */}
        <group position={[0, 0.45, 0]}>
          {/* 脸型 (圆角立方体) */}
          <RoundedBox args={[0.38, 0.38, 0.38]} radius={0.12} castShadow>
            <meshStandardMaterial color={finalSkin.head} />
          </RoundedBox>

          {/* 头发主体 */}
          <group position={[0, 0.05, 0]}>
             <RoundedBox args={[0.4, 0.15, 0.4]} radius={0.1} position={[0, 0.15, 0]}>
               <meshStandardMaterial color={finalSkin.hair} />
             </RoundedBox>
             <RoundedBox args={[0.4, 0.3, 0.1]} radius={0.05} position={[0, 0, -0.16]}>
               <meshStandardMaterial color={finalSkin.hair} />
             </RoundedBox>
             {/* 刘海细节 */}
             <RoundedBox args={[0.1, 0.1, 0.05]} radius={0.02} position={[0.1, 0.12, 0.19]}>
               <meshStandardMaterial color={finalSkin.hair} />
             </RoundedBox>
          </group>

          {/* 五官 */}
          <group position={[0, 0, 0.195]}>
            {/* 眼睛 (大黑豆) */}
            <mesh position={[0.08, 0.02, 0]}>
              <sphereGeometry args={[0.035]} />
              <meshStandardMaterial color="black" roughness={0.2} />
            </mesh>
            <mesh position={[-0.08, 0.02, 0]}>
              <sphereGeometry args={[0.035]} />
              <meshStandardMaterial color="black" roughness={0.2} />
            </mesh>
            {/* 腮红 (可爱关键) */}
            <mesh position={[0.12, -0.05, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.01]} rotation={[Math.PI/2,0,0]} />
              <meshStandardMaterial color="#ff9999" transparent opacity={0.6} />
            </mesh>
            <mesh position={[-0.12, -0.05, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.01]} rotation={[Math.PI/2,0,0]} />
              <meshStandardMaterial color="#ff9999" transparent opacity={0.6} />
            </mesh>
          </group>
        </group>
        
        {/* 背包 (小书包) */}
        <RoundedBox args={[0.25, 0.3, 0.12]} radius={0.05} position={[0, 0, -0.18]} castShadow>
          <meshStandardMaterial color={finalSkin.backpack} />
        </RoundedBox>

        {/* 手臂 (圆柱体) */}
        <group ref={leftArm} position={[-0.24, 0.15, 0]}>
          <RoundedBox args={[0.12, 0.35, 0.12]} radius={0.06} position={[0, -0.1, 0]} castShadow>
            <meshStandardMaterial color={finalSkin.body} />
          </RoundedBox>
          <mesh position={[0, -0.28, 0]}>
            <sphereGeometry args={[0.06]} />
            <meshStandardMaterial color={finalSkin.head} />
          </mesh>
        </group>
        <group ref={rightArm} position={[0.24, 0.15, 0]}>
          <RoundedBox args={[0.12, 0.35, 0.12]} radius={0.06} position={[0, -0.1, 0]} castShadow>
            <meshStandardMaterial color={finalSkin.body} />
          </RoundedBox>
          <mesh position={[0, -0.28, 0]}>
            <sphereGeometry args={[0.06]} />
            <meshStandardMaterial color={finalSkin.head} />
          </mesh>
        </group>
      </group>

      {/* === 下半身 === */}
      {/* 左腿 */}
      <group ref={leftLeg} position={[-0.11, 0.45, 0]}>
        <RoundedBox args={[0.14, 0.45, 0.14]} radius={0.05} position={[0, -0.1, 0]} castShadow>
          <meshStandardMaterial color={finalSkin.legs} />
        </RoundedBox>
        {/* 鞋子 */}
        <RoundedBox args={[0.16, 0.12, 0.22]} radius={0.04} position={[0, -0.32, 0.03]} castShadow>
          <meshStandardMaterial color={finalSkin.shoes} />
        </RoundedBox>
      </group>

      {/* 右腿 */}
      <group ref={rightLeg} position={[0.11, 0.45, 0]}>
        <RoundedBox args={[0.14, 0.45, 0.14]} radius={0.05} position={[0, -0.1, 0]} castShadow>
          <meshStandardMaterial color={finalSkin.legs} />
        </RoundedBox>
        {/* 鞋子 */}
        <RoundedBox args={[0.16, 0.12, 0.22]} radius={0.04} position={[0, -0.32, 0.03]} castShadow>
          <meshStandardMaterial color={finalSkin.shoes} />
        </RoundedBox>
      </group>
    </group>
  )
}
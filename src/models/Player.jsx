/* src/models/Player.jsx */
import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

// 升级默认皮肤：包含7个部分
const defaultSkin = {
  head: "#ffccaa",     // 肤色
  body: "#3498db",     // 上衣
  legs: "#2c3e50",     // 裤子
  eyes: "#000000",     // 眼睛
  backpack: "#e74c3c", // 书包
  hair: "#2c3e50",     // 头发 (新增)
  shoes: "#333333"     // 鞋子 (新增)
}

export function Player({ isWorking, skin = {} }) {
  const group = useRef()
  const body = useRef()
  const leftLeg = useRef()
  const rightLeg = useRef()
  const leftArm = useRef()
  const rightArm = useRef()

  // 合并默认值
  const finalSkin = { ...defaultSkin, ...skin }

  useFrame((state) => {
    const t = state.clock.elapsedTime
    // 呼吸感
    if(group.current) group.current.position.y = Math.sin(t * 2) * 0.05 + 0.05

    // 走路/跑步动画
    if (isWorking) {
      if(body.current) body.current.rotation.x = 0.2 // 身体前倾
      // 腿部摆动幅度加大
      if(leftLeg.current) leftLeg.current.rotation.x = Math.sin(t * 15) * 0.8
      if(rightLeg.current) rightLeg.current.rotation.x = Math.cos(t * 15) * 0.8
      // 手臂摆动
      if(leftArm.current) leftArm.current.rotation.x = Math.cos(t * 15) * 0.8
      if(rightArm.current) rightArm.current.rotation.x = Math.sin(t * 15) * 0.8
    } else {
      // 站立归位
      if(body.current) body.current.rotation.x = 0
      if(leftLeg.current) leftLeg.current.rotation.x = 0
      if(rightLeg.current) rightLeg.current.rotation.x = 0
      if(leftArm.current) leftArm.current.rotation.x = 0
      if(rightArm.current) rightArm.current.rotation.x = 0
    }
  })

  return (
    <group ref={group}>
      {/* === 上半身 === */}
      <group ref={body} position={[0, 0.9, 0]}>
        {/* 1. 上衣 */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.4, 0.45, 0.25]} />
          <meshStandardMaterial color={finalSkin.body} />
        </mesh>
        
        {/* === 头部组 === */}
        <group position={[0, 0.4, 0]}>
          {/* 2. 脸部 */}
          <mesh castShadow>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial color={finalSkin.head} />
          </mesh>
          
          {/* 6. 头发 (新增：盖在头顶和后脑勺) */}
          <mesh position={[0, 0.08, 0]} castShadow>
             {/* 比头稍微大一点，稍微往上一点 */}
             <boxGeometry args={[0.32, 0.15, 0.32]} />
             <meshStandardMaterial color={finalSkin.hair} />
          </mesh>
          <mesh position={[0, -0.05, -0.16]} castShadow>
             {/* 后脑勺头发 */}
             <boxGeometry args={[0.32, 0.2, 0.05]} />
             <meshStandardMaterial color={finalSkin.hair} />
          </mesh>

          {/* 3. 眼睛 */}
          <mesh position={[0.08, 0.05, 0.16]}><sphereGeometry args={[0.03]} /><meshStandardMaterial color={finalSkin.eyes} /></mesh>
          <mesh position={[-0.08, 0.05, 0.16]}><sphereGeometry args={[0.03]} /><meshStandardMaterial color={finalSkin.eyes} /></mesh>
        </group>
        
        {/* 4. 背包 */}
        <mesh position={[0, 0, -0.18]} castShadow>
          <boxGeometry args={[0.3, 0.35, 0.1]} />
          <meshStandardMaterial color={finalSkin.backpack} />
        </mesh>

        {/* 手臂 */}
        <group ref={leftArm} position={[-0.25, 0.15, 0]}>
          <mesh position={[0, -0.15, 0]}><boxGeometry args={[0.1, 0.35, 0.1]} /><meshStandardMaterial color={finalSkin.body} /></mesh>
          <mesh position={[0, -0.35, 0]}><sphereGeometry args={[0.05]} /><meshStandardMaterial color={finalSkin.head} /></mesh>
        </group>
        <group ref={rightArm} position={[0.25, 0.15, 0]}>
          <mesh position={[0, -0.15, 0]}><boxGeometry args={[0.1, 0.35, 0.1]} /><meshStandardMaterial color={finalSkin.body} /></mesh>
          <mesh position={[0, -0.35, 0]}><sphereGeometry args={[0.05]} /><meshStandardMaterial color={finalSkin.head} /></mesh>
        </group>
      </group>

      {/* === 下半身 (腿 + 鞋) === */}
      {/* 5. 腿部 (包含鞋子) */}
      {/* 左腿组 */}
      <group ref={leftLeg} position={[-0.1, 0.65, 0]}>
        {/* 裤子 */}
        <mesh position={[0, -0.25, 0]} castShadow>
          <boxGeometry args={[0.12, 0.5, 0.12]} />
          <meshStandardMaterial color={finalSkin.legs} />
        </mesh>
        {/* 7. 左鞋 (新增) */}
        <mesh position={[0, -0.52, 0.03]} castShadow>
          <boxGeometry args={[0.14, 0.1, 0.18]} /> {/* 鞋子稍微长一点 */}
          <meshStandardMaterial color={finalSkin.shoes} />
        </mesh>
      </group>

      {/* 右腿组 */}
      <group ref={rightLeg} position={[0.1, 0.65, 0]}>
        {/* 裤子 */}
        <mesh position={[0, -0.25, 0]} castShadow>
          <boxGeometry args={[0.12, 0.5, 0.12]} />
          <meshStandardMaterial color={finalSkin.legs} />
        </mesh>
        {/* 7. 右鞋 (新增) */}
        <mesh position={[0, -0.52, 0.03]} castShadow>
          <boxGeometry args={[0.14, 0.1, 0.18]} />
          <meshStandardMaterial color={finalSkin.shoes} />
        </mesh>
      </group>
    </group>
  )
}
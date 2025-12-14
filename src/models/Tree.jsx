/* src/models/Tree.jsx */
import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'

// 松树组件 (层叠结构)
function PineTree() {
  return (
    <group>
      {/* 树干 */}
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.25, 0.8, 8]} />
        <meshStandardMaterial color="#5d4037" />
      </mesh>

      {/* 树叶 - 下层 */}
      <mesh position={[0, 1.0, 0]} castShadow receiveShadow>
        <coneGeometry args={[1.2, 1.2, 8]} />
        <meshStandardMaterial color="#2d6a4f" />
      </mesh>
      {/* 树叶 - 中层 */}
      <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.9, 1.0, 8]} />
        <meshStandardMaterial color="#40916c" />
      </mesh>
      {/* 树叶 - 上层 */}
      <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
        <coneGeometry args={[0.6, 0.8, 8]} />
        <meshStandardMaterial color="#52b788" />
      </mesh>
    </group>
  )
}

// 阔叶树/果树组件 (不规则树冠 + 果实)
function RoundTree() {
  return (
    <group>
      {/* 树干 */}
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.3, 1.2, 8]} />
        <meshStandardMaterial color="#6f4e37" />
      </mesh>

      {/* 主树冠 */}
      <mesh position={[0, 1.8, 0]} castShadow receiveShadow>
        <dodecahedronGeometry args={[1.2, 0]} /> {/* 低多边形球体 */}
        <meshStandardMaterial color="#6ab04c" flatShading />
      </mesh>
      
      {/* 侧面小树冠 (增加不规则感) */}
      <mesh position={[0.6, 1.5, 0.4]} castShadow>
        <dodecahedronGeometry args={[0.7, 0]} />
        <meshStandardMaterial color="#6ab04c" flatShading />
      </mesh>
      <mesh position={[-0.6, 1.6, -0.3]} castShadow>
        <dodecahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial color="#badc58" flatShading /> {/* 稍微嫩一点的绿 */}
      </mesh>

      {/* 红苹果 (点缀) */}
      <mesh position={[0.5, 2.2, 0.6]}>
        <sphereGeometry args={[0.15, 6, 6]} />
        <meshStandardMaterial color="#eb4d4b" />
      </mesh>
      <mesh position={[-0.4, 1.8, 0.8]}>
        <sphereGeometry args={[0.12, 6, 6]} />
        <meshStandardMaterial color="#eb4d4b" />
      </mesh>
      <mesh position={[0.2, 2.4, -0.6]}>
        <sphereGeometry args={[0.15, 6, 6]} />
        <meshStandardMaterial color="#eb4d4b" />
      </mesh>
    </group>
  )
}

export function Tree({ position, type = 'round' }) {
  const group = useRef()
  
  // 随机生成一个风的偏移量，这样每棵树摇摆的节奏不一样，更自然
  const windOffset = useMemo(() => Math.random() * 100, [])

  useFrame((state) => {
    if (!group.current) return
    const t = state.clock.elapsedTime + windOffset
    
    // 微风摇曳动画
    // 绕X轴轻微前后摇
    group.current.rotation.x = Math.sin(t * 1.5) * 0.03
    // 绕Z轴轻微左右摇
    group.current.rotation.z = Math.cos(t * 1.0) * 0.03
  })

  return (
    <group ref={group} position={position}>
      {/* 稍微随机旋转一下树的朝向，避免看起来像复制粘贴的 */}
      <group rotation={[0, windOffset, 0]}>
        {type === 'pine' ? <PineTree /> : <RoundTree />}
      </group>
    </group>
  )
}
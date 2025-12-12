/* src/GameScene.jsx */
import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'

// 1. 玩家组件 (那个会跳的方块)
function PlayerBox({ isWorking }) {
  const meshRef = useRef()
  
  useFrame((state, delta) => {
    // 只有在工作时才动
    if (isWorking) {
      meshRef.current.rotation.y += delta * 5 // 旋转
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 10) * 0.2 + 0.5 // 跳跃
    } else {
      // 没工作时缓慢呼吸
      meshRef.current.rotation.y += delta * 0.5
      meshRef.current.position.y = 0.5
    }
  })

  return (
    <mesh ref={meshRef} position={[0, 0.5, 0]}>
      <boxGeometry args={[1, 1, 1]} /> 
      {/* 工作时变红(hotpink)，平时是蓝(royalblue) */}
      <meshStandardMaterial color={isWorking ? "hotpink" : "royalblue"} />
    </mesh>
  )
}

// 2. 地面组件 (绿色草地)
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial color="#90EE90" />
    </mesh>
  )
}

// 3. 热狗摊组件 (由几个几何体拼成)
function Shop() {
  return (
    <group position={[2, 0.75, -2]}>
      {/* 摊位底座 (黄色) */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.5, 1.5, 1.5]} />
        <meshStandardMaterial color="#FFD700" />
      </mesh>
      
      {/* 屋顶 (橙红色圆锥) */}
      <mesh position={[0, 1, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[1.2, 1, 4]} />
        <meshStandardMaterial color="#FF4500" />
      </mesh>

      {/* 简单的装饰球 (假装是香味或灯光) */}
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.2]} />
        <meshStandardMaterial color="white" transparent opacity={0.6} />
      </mesh>
    </group>
  )
}

// 4. 主场景组件 (导出给 App 使用)
export default function GameScene({ isWorking, hasShop }) {
  return (
    <div style={{ width: '100%', height: '100%', borderRadius: '10px', overflow: 'hidden' }}>
      <Canvas shadows>
        {/* 摄像机：位置[x, y, z]决定了视角 */}
        <PerspectiveCamera makeDefault position={[6, 6, 6]} fov={50} />
        
        {/* 鼠标控制：允许旋转查看 */}
        <OrbitControls enableZoom={true} minDistance={5} maxDistance={15} />

        {/* 灯光系统 */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />

        {/* 场景元素 */}
        <PlayerBox isWorking={isWorking} />
        <Ground />

        {/* 逻辑判断：如果买了店(hasShop为true)，才渲染店铺 */}
        {hasShop && <Shop />}
        
        {/* 地面网格辅助线 */}
        <gridHelper args={[20, 20, 0xffffff, 0xcccccc]} />
      </Canvas>
    </div>
  )
}
/* src/GameScene.jsx */
import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Html } from '@react-three/drei'

// 引入模型库
import { Player } from './models/Player'
import { Shop } from './models/Shop'
import { Tree } from './models/Tree'
import { GridMap, SelectionBox } from './models/Grid'
import { ConvenienceStore } from './models/Buildings'
import { Monument } from './models/Monument'

// 1. 环境设置 (安全版 - 删除了 SoftShadows)
function EnvironmentSet() {
  return (
    <>
      {/* 城市天空预设 */}
      <Environment preset="city" />
      
      {/* 基础环境光 */}
      <ambientLight intensity={0.6} />
      
      {/* 主光源 (产生阴影) */}
      <directionalLight 
        position={[10, 20, 10]} // 把灯光放高一点，阴影更好看
        intensity={1.5} 
        castShadow 
        // 阴影贴图大小，越大越清晰，1024是平衡点
        shadow-mapSize={[1024, 1024]} 
      />
      
      {/* 
         ❌ 已删除 <SoftShadows /> 
         它是导致 "Shader Error" 的罪魁祸首。
         删掉它，你的显卡就能正常工作了。
      */}
      
      {/* 迷雾: 30米渐变，70米完全遮挡 */}
      <fog attach="fog" args={['#dff9fb', 30, 70]} />
    </>
  )
}

// 2. 地面组件
function Ground() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial color="#c7ecee" roughness={0.8} />
      </mesh>
      
      <GridMap size={500} divisions={250} />
      
      {/* 接触阴影保持保留，它不消耗显卡计算 */}
      <ContactShadows resolution={1024} scale={50} blur={2} opacity={0.4} far={1} color="#000000" />
    </>
  )
}

// 3. 其他玩家组件
function OtherPlayer({ position, isWorking, color }) {
  return (
    <group position={position}>
      <Player isWorking={isWorking} color={color} />
      <Html position={[0, 2, 0]} center distanceFactor={10}>
        <div style={{
          background: 'rgba(0,0,0,0.4)', 
          color: 'white', 
          padding: '2px 6px', 
          borderRadius: '4px', 
          fontSize: '10px',
          whiteSpace: 'nowrap'
        }}>
          Visitor
        </div>
      </Html>
    </group>
  )
}

// === 主场景组件 ===
export default function GameScene({ 
  isWorking, hasShop, myPosition, myColor, otherPlayers, buildings, currentGrid 
}) {
  return (
    <div style={{ width: '100%', height: '100%', borderRadius: '20px', overflow: 'hidden', background: 'linear-gradient(to bottom, #dff9fb, #ffffff)' }}>
      {/* 
         shadows="basic" 
         告诉显卡：用最简单、最稳的方法画阴影，不要搞花哨的
      */}
      <Canvas shadows="basic" dpr={[1, 2]}>
        
        <PerspectiveCamera makeDefault position={[0, 12, 16]} fov={45} />
        <OrbitControls 
          enableZoom={true} 
          minDistance={5} 
          maxDistance={40} 
          target={myPosition} 
        />

        {/* 异步加载保护 */}
        <Suspense fallback={<Html center>Loading World...</Html>}>
          <EnvironmentSet />
          
          <Ground />
          
          {/* 选择框 */}
          {currentGrid && <SelectionBox x={myPosition[0]} z={myPosition[2]} />}

          {/* 纪念碑 */}
          <Monument />

          {/* 建筑 */}
          {buildings && buildings.map(b => (
            <ConvenienceStore 
              key={b.id} 
              position={[b.x, 0, b.z]} 
            />
          ))}

          {/* 我 */}
          <group position={myPosition}>
             <Player isWorking={isWorking} color={myColor} />
             <Html position={[0, 2.2, 0]} center distanceFactor={10}>
                <div style={{
                  color: '#f1c40f', 
                  fontWeight: 'bold', 
                  fontSize: '12px', 
                  textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                  whiteSpace: 'nowrap'
                }}>
                   YOU
                </div>
             </Html>
             {hasShop && (
                <group position={[1.5, 0, 0]}>
                  <Shop />
                  <Html position={[0, 3, 0]} center distanceFactor={10}>
                     <div style={{color:'#f39c12', fontSize:'10px', fontWeight:'bold', whiteSpace: 'nowrap'}}>MY SHOP</div>
                  </Html>
                </group>
             )}
          </group>

          {/* 其他玩家 */}
          {otherPlayers && Object.keys(otherPlayers).map(key => {
            const player = otherPlayers[key]
            return (
              <OtherPlayer 
                key={key} 
                position={player.position} 
                color={player.color} 
                isWorking={player.isWorking} 
              />
            )
          })}
          
          {/* 装饰树 */}
          <Tree position={[-6, 0, -6]} type="pine" />
          <Tree position={[6, 0, 6]} type="round" />
          <Tree position={[-8, 0, 5]} type="round" />
          <Tree position={[8, 0, -4]} type="pine" />

        </Suspense>

      </Canvas>
    </div>
  )
}
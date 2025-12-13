/* src/GameScene.jsx */
import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment, 
  ContactShadows, 
  Html 
} from '@react-three/drei'

// 引入模型库
import { Player } from './models/Player'
import { Shop } from './models/Shop'
import { Tree } from './models/Tree'
import { GridMap, SelectionBox } from './models/Grid'
import { ConvenienceStore } from './models/Buildings'
import { Monument } from './models/Monument'
import { NPCSystem } from './models/NPCs'
import { SpeechBubble } from './models/SpeechBubble'
// 新增：金币冒泡特效管理器
import { FloatingTextManager } from './models/FloatingText'

// 1. 环境设置
function EnvironmentSet() {
  return (
    <>
      <Environment preset="city" />
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize={[1024, 1024]} 
      />
      {/* 迷雾配合 AOI */}
      <fog attach="fog" args={['#dff9fb', 30, 70]} />
    </>
  )
}

// 2. 地面
function Ground() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[500, 500]} />
        <meshStandardMaterial color="#c7ecee" roughness={0.8} />
      </mesh>
      <GridMap size={500} divisions={250} />
      <ContactShadows resolution={1024} scale={50} blur={2} opacity={0.4} far={1} color="#000000" />
    </>
  )
}

// 3. 其他玩家
function OtherPlayer({ position, isWorking, color, name, message }) {
  return (
    <group position={position}>
      <Player isWorking={isWorking} skin={color} />
      <SpeechBubble text={message} />
      <Html position={[0, 2.2, 0]} center distanceFactor={10}>
        <div style={{background: 'rgba(0,0,0,0.4)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', whiteSpace: 'nowrap'}}>
          {name || "Visitor"}
        </div>
      </Html>
    </group>
  )
}

// === 主场景组件 ===
export default function GameScene({ 
  isWorking,      
  hasShop,        
  myPosition,     
  myColor,        
  myMessage,      
  otherPlayers,   
  buildings,      
  currentGrid,
  floatEvents // <--- 新增：接收冒泡事件列表
}) {
  return (
    <div style={{ width: '100%', height: '100%', borderRadius: '20px', overflow: 'hidden', background: 'linear-gradient(to bottom, #dff9fb, #ffffff)' }}>
      <Canvas shadows="basic" dpr={[1, 2]}>
        
        <PerspectiveCamera makeDefault position={[0, 12, 16]} fov={45} />
        <OrbitControls enableZoom={true} minDistance={5} maxDistance={40} target={myPosition} />

        <Suspense fallback={<Html center>Loading World...</Html>}>
          <EnvironmentSet />
          <Ground />
          
          {/* === 特效层 === */}
          <FloatingTextManager events={floatEvents} />

          {/* === 实体层 === */}
          <NPCSystem />
          {currentGrid && <SelectionBox x={myPosition[0]} z={myPosition[2]} />}
          <Monument />
          {buildings && buildings.map(b => <ConvenienceStore key={b.id} position={[b.x, 0, b.z]} />)}

          {/* === 玩家层 === */}
          <group position={myPosition}>
             <Player isWorking={isWorking} skin={myColor} />
             <SpeechBubble text={myMessage} />
             <Html position={[0, 2.2, 0]} center distanceFactor={10}>
                <div style={{color: '#f1c40f', fontWeight: 'bold', fontSize: '12px', textShadow: '0 1px 2px rgba(0,0,0,0.5)', whiteSpace: 'nowrap'}}>YOU</div>
             </Html>
             {hasShop && <group position={[1.5, 0, 0]}><Shop /><Html position={[0, 3, 0]} center distanceFactor={10}><div style={{color:'#f39c12', fontSize:'10px', fontWeight:'bold', whiteSpace: 'nowrap'}}>MY SHOP</div></Html></group>}
          </group>

          {otherPlayers && Object.keys(otherPlayers).map(key => {
            const player = otherPlayers[key]
            return (
              <OtherPlayer 
                key={key} 
                position={player.position} 
                color={player.skin || player.color} 
                isWorking={player.isWorking} 
                name={player.name} 
                message={player.message}
              />
            )
          })}
          
          {/* === 装饰层 === */}
          <Tree position={[-6, 0, -6]} type="pine" />
          <Tree position={[6, 0, 6]} type="round" />
          <Tree position={[-8, 0, 5]} type="round" />
          <Tree position={[8, 0, -4]} type="pine" />

        </Suspense>

      </Canvas>
    </div>
  )
}
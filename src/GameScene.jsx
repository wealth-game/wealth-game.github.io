/* src/GameScene.jsx */
import React, { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { 
  OrbitControls, 
  PerspectiveCamera, 
  ContactShadows, 
  Html,
  Sky,
  BakeShadows
} from '@react-three/drei'

// 引入资源
import { Player } from './models/Player'
import { Shop } from './models/Shop'
import { Tree } from './models/Tree'
import { GridMap, SelectionBox } from './models/Grid'
import { Monument } from './models/Monument'
import { NPCSystem } from './models/NPCs'
import { SpeechBubble } from './models/SpeechBubble'
import { FloatingTextManager } from './models/FloatingText'

import { 
  ConvenienceStore, CoffeeShop, GasStation, 
  TechOffice, Skyscraper, RocketBase 
} from './models/Buildings'

const WORLD_LIMIT = 1000

// === 1. 环境设置 (纯离线版 - 绝不下载任何资源) ===
function EnvironmentSet() {
  return (
    <>
      {/* 1. 物理天空 (纯代码生成，不用联网) */}
      <Sky 
        distance={450000} 
        sunPosition={[100, 20, 100]} 
        inclination={0} 
        azimuth={0.25} 
      />

      {/* 
         2. 半球光 (关键：替代 Environment 补光)
         调高强度，防止没有 HDR 贴图导致阴影面太黑
      */}
      <hemisphereLight 
        skyColor="#87CEEB" 
        groundColor="#f0f2f5" 
        intensity={1.0} 
      />

      {/* 3. 环境光 (基础亮度) */}
      <ambientLight intensity={0.5} />

      {/* 4. 主阳光 (产生阴影) */}
      <directionalLight 
        position={[50, 80, 30]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize={[1024, 1024]} 
        shadow-bias={-0.0001} 
      />

      {/* 5. 迷雾 */}
      <fog attach="fog" args={['#dff9fb', 30, 90]} />
      
      {/* 静态阴影优化 */}
      <BakeShadows />
    </>
  )
}

// 2. 地面
function Ground() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[WORLD_LIMIT * 2, WORLD_LIMIT * 2]} />
        <meshStandardMaterial color="#c7ecee" roughness={0.8} />
      </mesh>
      <GridMap size={2000} divisions={1000} />
      <ContactShadows resolution={512} scale={50} blur={2} opacity={0.4} far={1} color="#000000" />
    </>
  )
}

// 边界空气墙
function WorldBorder() {
  const wallConfig = { transparent: true, opacity: 0.05, color: '#ff4757', side: 2 }
  return (
    <group>
      <mesh position={[0, 25, -WORLD_LIMIT]}><planeGeometry args={[WORLD_LIMIT*2, 50]} /><meshStandardMaterial {...wallConfig} /></mesh>
      <mesh position={[0, 25, WORLD_LIMIT]}><planeGeometry args={[WORLD_LIMIT*2, 50]} /><meshStandardMaterial {...wallConfig} /></mesh>
      <mesh position={[-WORLD_LIMIT, 25, 0]} rotation={[0, Math.PI/2, 0]}><planeGeometry args={[WORLD_LIMIT*2, 50]} /><meshStandardMaterial {...wallConfig} /></mesh>
      <mesh position={[WORLD_LIMIT, 25, 0]} rotation={[0, Math.PI/2, 0]}><planeGeometry args={[WORLD_LIMIT*2, 50]} /><meshStandardMaterial {...wallConfig} /></mesh>
    </group>
  )
}

function OtherPlayer({ position, isWorking, color, name, message, onClick }) {
  if (!position || position.length < 3 || isNaN(position[0]) || isNaN(position[2])) return null
  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onClick() }}>
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

export default function GameScene({ 
  isWorking, hasShop, myPosition, myColor, myMessage, 
  otherPlayers, buildings, currentGrid, floatEvents, lang = 'zh',
  onPlayerClick
}) {
  
  const trees = useMemo(() => {
    const temp = []
    for(let i=0; i<200; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = 20 + Math.random() * 180 
      temp.push({
        x: Math.sin(angle) * radius,
        z: Math.cos(angle) * radius,
        type: Math.random() > 0.5 ? 'pine' : 'round'
      })
    }
    return temp
  }, [])

  const safeMyPos = (myPosition && !isNaN(myPosition[0])) ? myPosition : [0,0,0]

  const validBuildings = useMemo(() => {
    if (!buildings) return []
    const seen = new Set()
    return buildings.filter(b => {
      if (b.x === null || b.z === null || isNaN(b.x) || isNaN(b.z)) return false
      if (seen.has(b.id)) return false
      seen.add(b.id)
      return true
    })
  }, [buildings])

  return (
    <div style={{ width: '100%', height: '100%', borderRadius: '20px', overflow: 'hidden', background: '#dff9fb' }}>
      <Canvas shadows="basic" dpr={[1, 1.5]}>
        
        <PerspectiveCamera makeDefault position={[0, 12, 16]} fov={45} />
        <OrbitControls enableZoom={true} minDistance={5} maxDistance={60} target={safeMyPos} />

        <Suspense fallback={<Html center>Loading...</Html>}>
          <EnvironmentSet />
          <Ground />
          <WorldBorder />
          
          <FloatingTextManager events={floatEvents} />
          <NPCSystem />
          {currentGrid && <SelectionBox x={currentGrid.x} z={currentGrid.z} />}
          <Monument />

          {validBuildings.map(b => {
            const pos = [b.x, 0, b.z]
            const owner = b.owner_name || "未知富豪"
            const level = b.level ? Number(b.level) : 1
            const type = b.type || 'store'

            switch(type) {
              case 'store':  return <ConvenienceStore key={b.id} position={pos} lang={lang} owner={owner} level={level} />
              case 'coffee': return <CoffeeShop key={b.id} position={pos} lang={lang} owner={owner} level={level} />
              case 'gas':    return <GasStation key={b.id} position={pos} lang={lang} owner={owner} level={level} />
              case 'office': return <TechOffice key={b.id} position={pos} lang={lang} owner={owner} level={level} />
              case 'tower':  return <Skyscraper key={b.id} position={pos} lang={lang} owner={owner} level={level} />
              case 'rocket': return <RocketBase key={b.id} position={pos} lang={lang} owner={owner} level={level} />
              default:       return <ConvenienceStore key={b.id} position={pos} lang={lang} owner={owner} level={level} />
            }
          })}

          <group position={safeMyPos}>
             <Player isWorking={isWorking} skin={myColor} />
             <SpeechBubble text={myMessage} />
             <Html position={[0, 2.2, 0]} center distanceFactor={10}>
                <div style={{color: '#f1c40f', fontWeight: 'bold', fontSize: '12px', textShadow: '0 1px 2px rgba(0,0,0,0.5)', whiteSpace: 'nowrap'}}>YOU</div>
             </Html>
             {hasShop && <group position={[1.5, 0, 0]}><Shop /><Html position={[0, 3, 0]} center distanceFactor={10}><div style={{color:'#f39c12', fontSize:'10px', fontWeight:'bold', whiteSpace: 'nowrap'}}>MY SHOP</div></Html></group>}
          </group>

          {otherPlayers && Object.keys(otherPlayers).map(key => {
            const p = otherPlayers[key]
            if (!p.position) return null
            return <OtherPlayer 
                key={key} 
                position={p.position} 
                color={p.skin || p.color} 
                isWorking={p.isWorking} 
                name={p.name} 
                message={p.message}
                onClick={() => onPlayerClick(p)} 
            />
          })}
          
          {trees.map((t, i) => {
             const isBlocked = validBuildings.some(b => {
               const dx = t.x - b.x
               const dz = t.z - b.z
               return Math.sqrt(dx*dx + dz*dz) < 3.5 
             })
             if (isBlocked) return null 
             return <Tree key={i} position={[t.x, 0, t.z]} type={t.type} />
          })}

        </Suspense>
      </Canvas>
    </div>
  )
}
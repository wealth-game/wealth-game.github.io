/* src/GameScene.jsx */
import React, { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Environment, 
  ContactShadows, 
  Html 
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

// 1. 环境
function EnvironmentSet() {
  return (
    <>
      <Environment preset="city" />
      <ambientLight intensity={0.8} />
      <directionalLight 
        position={[10, 20, 10]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize={[1024, 1024]} 
      />
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
  if (!position || position.length < 3 || isNaN(position[0]) || isNaN(position[2])) return null
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

// === 主场景 ===
export default function GameScene({ 
  isWorking, hasShop, myPosition, myColor, myMessage, 
  otherPlayers, buildings, currentGrid, floatEvents, lang = 'zh'
}) {
  
  // 随机生成 80 棵树 (增加密度，效果更好)
  const trees = useMemo(() => {
    const temp = []
    for(let i=0; i<80; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = 15 + Math.random() * 45 // 避开中心纪念碑(15米内)
      temp.push({
        x: Math.sin(angle) * radius,
        z: Math.cos(angle) * radius,
        type: Math.random() > 0.5 ? 'pine' : 'round'
      })
    }
    return temp
  }, [])

  const safeMyPos = (myPosition && !isNaN(myPosition[0])) ? myPosition : [0,0,0]

  // 数据清洗
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
    <div style={{ width: '100%', height: '100%', borderRadius: '20px', overflow: 'hidden', background: 'linear-gradient(to bottom, #dff9fb, #ffffff)' }}>
      <Canvas shadows="basic" dpr={[1, 1.5]}>
        
        <PerspectiveCamera makeDefault position={[0, 12, 16]} fov={45} />
        <OrbitControls enableZoom={true} minDistance={5} maxDistance={40} target={safeMyPos} />

        <Suspense fallback={<Html center>Loading...</Html>}>
          <EnvironmentSet />
          <Ground />
          <FloatingTextManager events={floatEvents} />
          
          <NPCSystem />
          {currentGrid && <SelectionBox x={currentGrid.x} z={currentGrid.z} />}
          <Monument />

          {/* 渲染建筑 */}
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
            return <OtherPlayer key={key} position={p.position} color={p.skin || p.color} isWorking={p.isWorking} name={p.name} message={p.message} />
          })}
          
          {/* 
             🎄 智能树木渲染 
             逻辑：渲染每棵树之前，检查它周围 3米内 有没有建筑。
             如果有建筑，就不渲染这棵树 (假装被砍掉了)。
          */}
          {trees.map((t, i) => {
             const isBlocked = validBuildings.some(b => {
               const dx = t.x - b.x
               const dz = t.z - b.z
               return Math.sqrt(dx*dx + dz*dz) < 3.5 // 如果离建筑中心小于3.5米，就隐藏树
             })

             if (isBlocked) return null // 被挡住了，不画
             
             return <Tree key={i} position={[t.x, 0, t.z]} type={t.type} />
          })}

        </Suspense>
      </Canvas>
    </div>
  )
}
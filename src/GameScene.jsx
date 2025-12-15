/* src/GameScene.jsx */
import React, { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { 
  OrbitControls, 
  PerspectiveCamera, 
  ContactShadows, 
  Html,
  Sky,
  Environment, // 重新启用，但使用本地模拟
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

// === 1. 高级光影系统 (解决"丑"的核心) ===
function EnvironmentSet() {
  return (
    <>
      {/* 
         1. 物理天空 
         调整为“黄金时段”参数，让光线带有淡淡的暖色调
      */}
      <Sky 
        distance={450000} 
        sunPosition={[10, 2, 10]} // 侧向阳光，产生拉长的漂亮阴影
        inclination={0.6} 
        azimuth={0.1} 
      />

      {/* 
         2. 关键修复：代码生成环境 
         background={false} 意味着我们不显示它的贴图，只用它来提供【反射】
         这会让玻璃和金属瞬间亮起来！
      */}
      <Environment 
        frames={Infinity} 
        resolution={128} 
        preset="apartment" // 使用内置极小预设
      />

      {/* 3. 补光 */}
      <hemisphereLight 
        intensity={0.6} 
        color="#ffffff" 
        groundColor="#b9d5ff" 
      />

      {/* 4. 主阳光 (增加阴影品质) */}
      <directionalLight 
        position={[20, 30, 10]} 
        intensity={1.2} 
        castShadow 
        shadow-mapSize={[2048, 2048]} // 提高阴影分辨率
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-bias={-0.0005}
      />

      {/* 5. 景深迷雾：让远近更有层次感 */}
      <fog attach="fog" args={['#dff9fb', 40, 150]} />
    </>
  )
}

function Ground() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[WORLD_LIMIT * 2, WORLD_LIMIT * 2]} />
        {/* 材质微调：加入一点点金属感和粗糙度对比 */}
        <meshStandardMaterial color="#f0f2f5" roughness={0.6} metalness={0.05} />
      </mesh>
      <GridMap size={2000} divisions={1000} />
      
      {/* 落地阴影：调整得更自然 */}
      <ContactShadows 
        resolution={1024} 
        scale={80} 
        blur={2.5} 
        opacity={0.3} 
        far={10} 
        color="#1a1a1a" 
      />
    </>
  )
}

function OtherPlayer({ position, isWorking, color, name, message, onClick }) {
  if (!position || isNaN(position[0])) return null
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
    for(let i=0; i<150; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = 25 + Math.random() * 200 
      temp.push({ x: Math.sin(angle) * radius, z: Math.cos(angle) * radius, type: Math.random() > 0.5 ? 'pine' : 'round' })
    }
    return temp
  }, [])

  const safeMyPos = (myPosition && !isNaN(myPosition[0])) ? myPosition : [0,0,0]

  const validBuildings = useMemo(() => {
    if (!buildings) return []
    const seen = new Set()
    return buildings.filter(b => {
      if (b.x === null || isNaN(b.x)) return false
      if (seen.has(b.id)) return false
      seen.add(b.id)
      return true
    })
  }, [buildings])

  return (
    <div style={{ width: '100%', height: '100%', borderRadius: '20px', overflow: 'hidden', background: '#dff9fb' }}>
      {/* 
         shadows 设置为 true (默认为 PCFSoftShadows) 
         这比 shadows="basic" 好看10倍，且性能平衡 
      */}
      <Canvas 
        shadows 
        dpr={[1, 2]} 
        gl={{ antialias: true, stencil: false, depth: true }}
      >
        
        <PerspectiveCamera makeDefault position={[0, 15, 25]} fov={40} />
        <OrbitControls enableZoom={true} minDistance={8} maxDistance={80} target={safeMyPos} makeDefault />

        <Suspense fallback={<Html center>Loading...</Html>}>
          <EnvironmentSet />
          <Ground />
          <WorldBorder />
          
          <FloatingTextManager events={floatEvents} />
          <NPCSystem />
          
          {currentGrid && <SelectionBox x={currentGrid.x} z={currentGrid.z} />}
          <Monument />

          {/* 建筑 */}
          {validBuildings.map(b => {
            const pos = [b.x, 0, b.z]
            const owner = b.owner_name || "未知富豪"
            const level = b.level || 1
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
            return <OtherPlayer key={key} position={p.position} color={p.skin || p.color} isWorking={p.isWorking} name={p.name} message={p.message} onClick={() => onPlayerClick(p)} />
          })}
          
          {trees.map((t, i) => {
             const isBlocked = validBuildings.some(b => Math.sqrt((t.x-b.x)**2 + (t.z-b.z)**2) < 4)
             return isBlocked ? null : <Tree key={i} position={[t.x, 0, t.z]} type={t.type} />
          })}
        </Suspense>
      </Canvas>
    </div>
  )
}

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
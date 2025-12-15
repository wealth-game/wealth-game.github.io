/* src/GameScene.jsx */
import React, { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { 
  OrbitControls, 
  PerspectiveCamera, 
  ContactShadows, 
  Html,
  Sky, // ✅ 新增：物理天空
  BakeShadows // ✅ 新增：烘焙阴影(优化性能)
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

// 定义世界边界
const WORLD_LIMIT = 1000

// === 1. 环境设置 (画质升级核心) ===
function EnvironmentSet() {
  return (
    <>
      {/* 
         1. 物理天空 (Sky): 
         纯代码生成的真实大气层，不需要下载图片，国内秒开且极美。
         sunPosition 控制太阳位置，决定光影方向。
      */}
      <Sky 
        distance={450000} 
        sunPosition={[100, 20, 100]} 
        inclination={0} 
        azimuth={0.25} 
      />

      {/* 
         2. 半球光 (HemisphereLight): 
         模拟天空光(蓝色)和地面反光(绿色/灰色)的混合，
         让物体阴暗面不再是死黑，而是有丰富的色调。
      */}
      <hemisphereLight 
        skyColor="#87CEEB" // 天空蓝
        groundColor="#f0f2f5" // 地面灰白
        intensity={0.6} 
      />

      {/* 3. 主阳光 (DirectionalLight) */}
      <directionalLight 
        position={[50, 80, 30]} // 太阳高一点，阴影短一点，更像正午
        intensity={1.5} 
        castShadow 
        shadow-mapSize={[1024, 1024]} 
        shadow-bias={-0.0001} // 减少阴影波纹
      />

      {/* 
         4. 迷雾 (Fog): 
         颜色要跟天空混为一体 (#f0f2f5)，制造空气透视感
      */}
      <fog attach="fog" args={['#f0f2f5', 30, 120]} />
      
      {/* 性能优化：静态阴影烘焙 */}
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
        <meshStandardMaterial color="#f0f2f5" roughness={1} />
      </mesh>
      
      <GridMap size={WORLD_LIMIT * 2} divisions={WORLD_LIMIT} />
      
      {/* ✅ 恢复接触阴影：让物体看起来真的“踩”在地上，而不是飘着 */}
      <ContactShadows 
        resolution={512} 
        scale={60} 
        blur={2} 
        opacity={0.3} 
        far={2} 
        color="#000000" 
      />
    </>
  )
}

// --- 边界空气墙 ---
function WorldBorder() {
  const height = 50
  const wallConfig = { transparent: true, opacity: 0.05, color: '#ff4757', side: 2 } // 稍微淡一点，别太吓人
  
  return (
    <group>
      <mesh position={[0, height/2, -WORLD_LIMIT]}><planeGeometry args={[WORLD_LIMIT*2, height]} /><meshStandardMaterial {...wallConfig} /></mesh>
      <mesh position={[0, height/2, WORLD_LIMIT]}><planeGeometry args={[WORLD_LIMIT*2, height]} /><meshStandardMaterial {...wallConfig} /></mesh>
      <mesh position={[-WORLD_LIMIT, height/2, 0]} rotation={[0, Math.PI/2, 0]}><planeGeometry args={[WORLD_LIMIT*2, height]} /><meshStandardMaterial {...wallConfig} /></mesh>
      <mesh position={[WORLD_LIMIT, height/2, 0]} rotation={[0, Math.PI/2, 0]}><planeGeometry args={[WORLD_LIMIT*2, height]} /><meshStandardMaterial {...wallConfig} /></mesh>
    </group>
  )
}

// 3. 其他玩家
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

// === 主场景 ===
export default function GameScene({ 
  isWorking, hasShop, myPosition, myColor, myMessage, 
  otherPlayers, buildings, currentGrid, floatEvents, lang = 'zh',
  onPlayerClick
}) {
  
  // 树木生成
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
    <div style={{ width: '100%', height: '100%', borderRadius: '20px', overflow: 'hidden', background: 'linear-gradient(to bottom, #f0f2f5, #ffffff)' }}>
      {/* 
         shadows="soft" 可能在部分手机卡，但 basic 太丑。
         我们用 basic + ContactShadows 的组合来平衡性能和画质。
      */}
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

          {/* 建筑渲染 */}
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
            return <OtherPlayer key={key} position={p.position} color={p.skin || p.color} isWorking={p.isWorking} name={p.name} message={p.message} onClick={() => onPlayerClick(p)} />
          })}
          
          {trees.map((t, i) => {
             const isBlocked = validBuildings.some(b => {
               const dx = t.x - b.x; const dz = t.z - b.z
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
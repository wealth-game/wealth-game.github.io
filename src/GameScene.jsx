/* src/GameScene.jsx */
import React, { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { 
  OrbitControls, 
  PerspectiveCamera, 
  ContactShadows, 
  Html,
  Sky,
  Environment, // ✅ 核心：用于加载本地 HDR
  BakeShadows
} from '@react-three/drei'
import * as THREE from 'three'

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

// === 1. 环境设置 (回归本地 HDR - 画质巅峰) ===
function EnvironmentSet() {
  return (
    <>
      {/* 1. 物理天空 (背景) */}
      <Sky distance={450000} sunPosition={[100, 40, 100]} inclination={0.6} azimuth={0.25} />
      
      {/* 
         2. 👑 核心：加载本地 HDR 贴图 
         必须确保 public 文件夹里有 city.hdr 文件！
         这会让金属和玻璃拥有真实的反射效果。
      */}
      <Environment files="/city.hdr" background={false} />

      {/* 3. 补光 (防止背光面太黑) */}
      <ambientLight intensity={0.6} />
      
      {/* 4. 主阳光 (产生阴影) */}
      <directionalLight 
        position={[50, 80, 30]} 
        intensity={1.5} 
        castShadow 
        shadow-mapSize={[2048, 2048]} 
        shadow-bias={-0.0001}
      />

      {/* 5. 迷雾 */}
      <fog attach="fog" args={['#dff9fb', 30, 90]} />
      
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
        {/* 地面带一点点反射，更显高级 */}
        <meshStandardMaterial color="#b8e994" roughness={0.8} metalness={0.1} />
      </mesh>
      <GridMap size={2000} divisions={1000} />
      <ContactShadows resolution={512} scale={50} blur={2} opacity={0.3} far={2} color="#004400" />
    </>
  )
}

// 主角光环
function PlayerMarker() {
  const ref = useRef()
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z += 0.02
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1
      ref.current.scale.set(scale, scale, 1)
    }
  })
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
      <ringGeometry args={[0.4, 0.5, 32]} />
      <meshBasicMaterial color="#f1c40f" transparent opacity={0.6} />
    </mesh>
  )
}

function OtherPlayer({ position, isWorking, color, name, message, onClick, rotation }) {
  if (!position || position.length < 3 || isNaN(position[0]) || isNaN(position[2])) return null
  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onClick() }}>
      <Player isWorking={isWorking} skin={color} rotation={rotation} />
      <SpeechBubble text={message} />
      <Html position={[0, 2.2, 0]} center distanceFactor={10}>
        <div style={{background: 'rgba(0,0,0,0.3)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10px', whiteSpace: 'nowrap'}}>
          {name || "Visitor"}
        </div>
      </Html>
    </group>
  )
}

export default function GameScene({ 
  isWorking, hasShop, myPosition, myRotation, myColor, myMessage, 
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
      {/* 开启色调映射，颜色更鲜艳 */}
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}>
        
        <PerspectiveCamera makeDefault position={[0, 5, 8]} fov={50} />
        <OrbitControls enableZoom={true} minDistance={4} maxDistance={20} target={safeMyPos} makeDefault maxPolarAngle={Math.PI / 2.2} />

        <Suspense fallback={<Html center>Loading Assets...</Html>}>
          <EnvironmentSet />
          <Ground />
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
             <Player isWorking={isWorking} rotation={myRotation} skin={myColor} />
             <PlayerMarker /> 
             <SpeechBubble text={myMessage} />
             <Html position={[0, 2.2, 0]} center distanceFactor={10}>
                <div style={{color: '#f1c40f', fontWeight: '900', fontSize: '14px', textShadow: '0 2px 4px rgba(0,0,0,0.5)', whiteSpace: 'nowrap', background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px'}}>YOU</div>
             </Html>
             {hasShop && <group position={[1.5, 0, 0]}><Shop /><Html position={[0, 3, 0]} center distanceFactor={10}><div style={{color:'#f39c12', fontSize:'10px', fontWeight:'bold', whiteSpace: 'nowrap'}}>MY SHOP</div></Html></group>}
          </group>

          {otherPlayers && Object.keys(otherPlayers).map(key => {
            const p = otherPlayers[key]
            if (!p.position) return null
            return <OtherPlayer key={key} position={p.position} rotation={p.rotation} color={p.skin || p.color} isWorking={p.isWorking} name={p.name} message={p.message} onClick={() => onPlayerClick(p)} />
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
/* src/GameScene.jsx */
import React, { Suspense, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { 
  OrbitControls, 
  PerspectiveCamera, 
  ContactShadows, 
  Html,
  Sky,
  Environment,
  Lightformer,
  BakeShadows
} from '@react-three/drei'
import * as THREE from 'three'

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

function EnvironmentSet() {
  return (
    <>
      <Sky distance={450000} sunPosition={[100, 40, 100]} inclination={0} azimuth={0.25} />
      <Environment resolution={256}>
        <group rotation={[-Math.PI / 3, 0, 1]}>
          <Lightformer form="circle" intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={2} />
          <Lightformer form="circle" intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={2} />
          <Lightformer form="ring" color="#fff" intensity={2} scale={10} position={[0, 10, 0]} />
        </group>
      </Environment>
      <ambientLight intensity={1.5} /> 
      <hemisphereLight skyColor="#87CEEB" groundColor="#ffffff" intensity={1.0} />
      <directionalLight 
        position={[20, 50, 20]} intensity={2.0} castShadow 
        shadow-mapSize={[1024, 1024]} 
      />
      <fog attach="fog" args={['#dff9fb', 20, 80]} />
    </>
  )
}

function Ground() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[WORLD_LIMIT * 2, WORLD_LIMIT * 2]} />
        <meshStandardMaterial color="#b8e994" roughness={1} />
      </mesh>
      <GridMap size={2000} divisions={1000} />
      <ContactShadows resolution={512} scale={50} blur={2} opacity={0.2} far={2} color="#004400" />
    </>
  )
}

function PlayerMarker() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
      <ringGeometry args={[0.4, 0.5, 32]} />
      <meshBasicMaterial color="#f1c40f" transparent opacity={0.6} />
    </mesh>
  )
}

function OtherPlayer({ position, isWorking, color, name, message, onClick, rotation }) {
  if (!position || isNaN(position[0])) return null
  return (
    <group position={position} onClick={(e) => { e.stopPropagation(); onClick() }}>
      {/* 其他玩家也要传 rotation */}
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
  isWorking, hasShop, myPosition, 
  myRotation, // <--- 必须接收这个参数
  myColor, myMessage, 
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
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}>
        
        <PerspectiveCamera makeDefault position={[0, 5, 8]} fov={50} />
        <OrbitControls enableZoom={true} minDistance={4} maxDistance={20} target={safeMyPos} makeDefault maxPolarAngle={Math.PI / 2.2} />

        <Suspense fallback={<Html center>Loading...</Html>}>
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

          {/* === 🟢 核心修复 === */}
          <group position={safeMyPos}>
             {/* 
                之前这里漏了 rotation={myRotation} 
                所以小人永远是 rotation=0，导致只会平移不会转身
             */}
             <Player isWorking={isWorking} skin={myColor} rotation={myRotation} />
             
             <PlayerMarker /> 
             <SpeechBubble text={myMessage} />
             <Html position={[0, 2.2, 0]} center distanceFactor={10}>
                <div style={{
                  color: '#f1c40f', fontWeight: '900', fontSize: '14px', 
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)', whiteSpace: 'nowrap',
                  background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px'
                }}>
                   YOU
                </div>
             </Html>
             {hasShop && <group position={[1.5, 0, 0]}><Shop /><Html position={[0, 3, 0]} center distanceFactor={10}><div style={{color:'#f39c12', fontSize:'10px', fontWeight:'bold', whiteSpace: 'nowrap'}}>MY SHOP</div></Html></group>}
          </group>

          {otherPlayers && Object.keys(otherPlayers).map(key => {
            const p = otherPlayers[key]
            if (!p.position) return null
            return <OtherPlayer 
              key={key} 
              position={p.position} 
              rotation={p.rotation} // 别人的朝向也要传
              color={p.skin || p.color} 
              isWorking={p.isWorking} 
              name={p.name} 
              message={p.message} 
              onClick={() => onPlayerClick(p)} 
            />
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
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
  
  // --- 随机生成一片森林 ---
  const trees = useMemo(() => {
    const temp = []
    for(let i=0; i<50; i++) { // 增加到50棵树
      const angle = Math.random() * Math.PI * 2
      const radius = 15 + Math.random() * 40 // 分布在 15-55米，不挡住中心
      temp.push({
        x: Math.sin(angle) * radius,
        z: Math.cos(angle) * radius,
        type: Math.random() > 0.5 ? 'pine' : 'round'
      })
    }
    return temp
  }, [])

  return (
    <div style={{ width: '100%', height: '100%', borderRadius: '20px', overflow: 'hidden', background: 'linear-gradient(to bottom, #dff9fb, #ffffff)' }}>
      <Canvas shadows="basic" dpr={[1, 2]}>
        
        <PerspectiveCamera makeDefault position={[0, 12, 16]} fov={45} />
        <OrbitControls enableZoom={true} minDistance={5} maxDistance={40} target={myPosition} />

        <Suspense fallback={<Html center>Loading...</Html>}>
          <EnvironmentSet />
          <Ground />
          <FloatingTextManager events={floatEvents} />
          <NPCSystem />
          
          {currentGrid && <SelectionBox x={myPosition[0]} z={myPosition[2]} />}
          <Monument />

          {/* 渲染建筑 (带名字和语言) */}
          {buildings && buildings.map(b => {
            const pos = [b.x, 0, b.z]
            const owner = b.owner_name || "未知富豪"
            switch(b.type) {
              case 'store':  return <ConvenienceStore key={b.id} position={pos} lang={lang} owner={owner} />
              case 'coffee': return <CoffeeShop key={b.id} position={pos} lang={lang} owner={owner} />
              case 'gas':    return <GasStation key={b.id} position={pos} lang={lang} owner={owner} />
              case 'office': return <TechOffice key={b.id} position={pos} lang={lang} owner={owner} />
              case 'tower':  return <Skyscraper key={b.id} position={pos} lang={lang} owner={owner} />
              case 'rocket': return <RocketBase key={b.id} position={pos} lang={lang} owner={owner} />
              default:       return <ConvenienceStore key={b.id} position={pos} lang={lang} owner={owner} />
            }
          })}

          <group position={myPosition}>
             <Player isWorking={isWorking} skin={myColor} />
             <SpeechBubble text={myMessage} />
             <Html position={[0, 2.2, 0]} center distanceFactor={10}>
                <div style={{color: '#f1c40f', fontWeight: 'bold', fontSize: '12px', textShadow: '0 1px 2px rgba(0,0,0,0.5)', whiteSpace: 'nowrap'}}>YOU</div>
             </Html>
             {hasShop && <group position={[1.5, 0, 0]}><Shop /><Html position={[0, 3, 0]} center distanceFactor={10}><div style={{color:'#f39c12', fontSize:'10px', fontWeight:'bold', whiteSpace: 'nowrap'}}>MY SHOP</div></Html></group>}
          </group>

          {otherPlayers && Object.keys(otherPlayers).map(key => {
            const p = otherPlayers[key]
            return <OtherPlayer key={key} position={p.position} color={p.skin || p.color} isWorking={p.isWorking} name={p.name} message={p.message} />
          })}
          
          {/* 渲染大量树木 */}
          {trees.map((t, i) => (
            <Tree key={i} position={[t.x, 0, t.z]} type={t.type} />
          ))}

        </Suspense>
      </Canvas>
    </div>
  )
}
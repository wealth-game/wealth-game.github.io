/* src/models/Buildings.jsx */
import React from 'react'
import { Html } from '@react-three/drei'

const LABELS = {
  store: { zh: '便利店', en: '7-ELEVEN' },
  coffee: { zh: '咖啡馆', en: 'COFFEE' },
  gas: { zh: '加油站', en: 'GAS STATION' },
  office: { zh: '科技园', en: 'G-CORP' },
  tower: { zh: '总部大厦', en: 'HQ TOWER' },
  rocket: { zh: '火星计划', en: 'MARS MISSION' }
}

function BuildingLabel({ type, lang, owner, level, color, bg = 'white', border = 'none', ownerColor }) {
  return (
    <Html position={[0, 0, 0]} center distanceFactor={20} transform sprite>
      <div style={{
        background: bg, padding: '4px 8px', borderRadius: '6px', border: border,
        textAlign: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', pointerEvents: 'none', minWidth: '60px'
      }}>
        <div style={{fontSize: '10px', fontWeight: 'bold', color: color, whiteSpace: 'nowrap'}}>
          <span style={{marginRight:'3px', opacity:0.8, fontSize:'9px'}}>Lv.{level || 1}</span>
          {LABELS[type][lang]}
        </div>
        <div style={{
          fontSize: '8px', color: ownerColor || (bg === 'white' ? '#666' : '#ccc'), marginTop: '2px', 
          borderTop: `1px solid ${bg === 'white' ? '#eee' : 'rgba(255,255,255,0.2)'}`, paddingTop: '2px',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80px'
        }}>
          {owner}
        </div>
      </div>
    </Html>
  )
}

// 💎【材质还原】：高光、反射、金属感
const matBody = { roughness: 0.2, metalness: 0.3 } // 普通墙面也有光泽
const matGlass = { color: "#a8e6cf", transparent: true, opacity: 0.6, roughness: 0, metalness: 0.9, envMapIntensity: 2 } // 玻璃强反射
const matGold = { color: "#FFD700", roughness: 0.1, metalness: 1, envMapIntensity: 2.5 } // 纯金！亮瞎眼
const matSilver = { color: "#ffffff", roughness: 0.2, metalness: 0.8, envMapIntensity: 1.5 } // 银色金属

const getScale = (level) => 1 + ((level||1) - 1) * 0.05
const isMaxLevel = (level) => (level||1) >= 6

// === T2: 便利店 ===
export function ConvenienceStore({ position, lang = 'zh', owner, level=1 }) {
  const s = getScale(level)
  const isMax = isMaxLevel(level)
  const wallColor = isMax ? "#f1c40f" : "#ffffff"
  
  // 满级时变为金属材质
  const wallMat = isMax ? matGold : matBody

  return (
    <group position={position} scale={[s, s, s]}>
      <group position={[0, 0.05, 0]}>
        <mesh position={[0, 1.25, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.8, 2.5, 1.8]} />
          <meshStandardMaterial color={wallColor} {...wallMat} />
        </mesh>
        {(level||1) >= 3 && <mesh position={[0, 2.8, 0]} castShadow><boxGeometry args={[1.5, 0.8, 1.5]} /><meshStandardMaterial color={isMax?"#e67e22":"#bdc3c7"} {...matBody} /></mesh>}
        <group position={[0, 2.2, 0.92]}>
          <mesh position={[0, 0.2, 0]}><boxGeometry args={[1.6, 0.15, 0.05]} /><meshStandardMaterial color="#f39c12" /></mesh>
          <mesh position={[0, 0.05, 0]}><boxGeometry args={[1.6, 0.15, 0.05]} /><meshStandardMaterial color="#27ae60" /></mesh>
          <mesh position={[0, -0.1, 0]}><boxGeometry args={[1.6, 0.15, 0.05]} /><meshStandardMaterial color="#c0392b" /></mesh>
        </group>
        <mesh position={[0, 0.9, 0.91]}><planeGeometry args={[1.4, 1.6]} /><meshStandardMaterial {...matGlass} /></mesh>
        <group position={[0, (level||1)>=3 ? 3.5 : 3.2, 0]}>
          <BuildingLabel type="store" lang={lang} owner={owner} level={level} color="#e67e22" border="2px solid #27ae60" />
        </group>
      </group>
    </group>
  )
}

// === T3: 咖啡馆 ===
export function CoffeeShop({ position, lang = 'zh', owner, level=1 }) {
  const s = getScale(level)
  const isMax = isMaxLevel(level)
  const wallColor = isMax ? "#f1c40f" : "#5d4037"
  const wallMat = isMax ? matGold : { roughness: 0.6, metalness: 0.1 }

  return (
    <group position={position} scale={[s, s, s]}>
      <group position={[0, 0.05, 0]}>
        <mesh position={[0, 1.5, 0]} castShadow receiveShadow><boxGeometry args={[1.8, 3, 1.8]} /><meshStandardMaterial color={wallColor} {...wallMat} /></mesh>
        <mesh position={[0, 1.2, 0.91]}><planeGeometry args={[1.4, 2]} /><meshStandardMaterial {...matGlass} /></mesh>
        <mesh position={[0, 2.4, 1.1]} rotation={[0.3, 0, 0]} castShadow><boxGeometry args={[1.9, 0.1, 0.6]} /><meshStandardMaterial color="#00704a" {...matBody} /></mesh>
        <group position={[0, 3.5, 0]}>
          <BuildingLabel type="coffee" lang={lang} owner={owner} level={level} color="white" bg="#00704a" ownerColor="rgba(255,255,255,0.9)" />
        </group>
      </group>
    </group>
  )
}

// === T4: 加油站 ===
export function GasStation({ position, lang = 'zh', owner, level=1 }) {
  const s = getScale(level)
  const isMax = isMaxLevel(level)
  return (
    <group position={position} scale={[s, s, s]}>
      <mesh position={[0, 2.5, 0]} castShadow><boxGeometry args={[3.5, 0.2, 3.5]} /><meshStandardMaterial color={isMax?"#f1c40f":"#e74c3c"} {...(isMax?matGold:matBody)} /></mesh>
      <mesh position={[-1.5, 1.25, -1.5]} castShadow><cylinderGeometry args={[0.15, 0.15, 2.5]} /><meshStandardMaterial {...matSilver} /></mesh>
      <mesh position={[1.5, 1.25, 1.5]} castShadow><cylinderGeometry args={[0.15, 0.15, 2.5]} /><meshStandardMaterial {...matSilver} /></mesh>
      <mesh position={[0, 0.6, 0]} castShadow><boxGeometry args={[1.2, 1.2, 0.4]} /><meshStandardMaterial color="#f1c40f" {...matBody} /></mesh>
      <group position={[0, 3.5, 0]}>
        <BuildingLabel type="gas" lang={lang} owner={owner} level={level} color="white" bg="#e74c3c" ownerColor="white" />
      </group>
    </group>
  )
}

// === T5: 科技公司 ===
export function TechOffice({ position, lang = 'zh', owner, level=1 }) {
  const s = getScale(level)
  const isMax = isMaxLevel(level)
  // 满级变成金色玻璃
  const glassColor = isMax ? "#f1c40f" : "#3498db"
  return (
    <group position={position} scale={[s, s, s]}>
      <mesh position={[0, 2, 0]} castShadow>
        <boxGeometry args={[2.5, 4, 2.5]} />
        {/* 玻璃高反光 */}
        <meshStandardMaterial color={glassColor} transparent opacity={0.8} roughness={0} metalness={0.9} envMapIntensity={2} />
      </mesh>
      {[1, 2, 3].map(y => <mesh key={y} position={[0, y, 0]}><boxGeometry args={[2.55, 0.1, 2.55]} /><meshStandardMaterial color="white" /></mesh>)}
      <group position={[0, 4.8, 0]}>
        <BuildingLabel type="office" lang={lang} owner={owner} level={level} color="#3498db" />
      </group>
    </group>
  )
}

// === T6: 摩天大楼 ===
export function Skyscraper({ position, lang = 'zh', owner, level=1 }) {
  const s = getScale(level)
  const isMax = isMaxLevel(level)
  // 满级纯金，未满级深色金属
  const bodyMat = isMax ? matGold : { color: "#2d3436", roughness: 0.2, metalness: 0.8 }

  return (
    <group position={position} scale={[s, s, s]}>
      <mesh position={[0, 5, 0]} castShadow><boxGeometry args={[3, 10, 3]} /><meshStandardMaterial {...bodyMat} /></mesh>
      <mesh position={[0, 5, 1.51]}><planeGeometry args={[2.5, 9]} /><meshStandardMaterial color={isMax?"#fff":"#f1c40f"} emissive={isMax?"#f1c40f":"#f1c40f"} emissiveIntensity={0.5} transparent opacity={0.3} /></mesh>
      <mesh position={[0, 10.5, 0]}><coneGeometry args={[1.5, 2, 4]} rotation={[0, Math.PI/4, 0]} /><meshStandardMaterial {...bodyMat} /></mesh>
      <group position={[0, 12.5, 0]}>
        <BuildingLabel type="tower" lang={lang} owner={owner} level={level} color="gold" bg="black" border="1px solid gold" />
      </group>
    </group>
  )
}

// === T7: 火箭基地 ===
export function RocketBase({ position, lang = 'zh', owner, level=1 }) {
  const s = getScale(level)
  const isMax = isMaxLevel(level)
  // 满级黄金火箭
  const rocketMat = isMax ? matGold : { color: "white", roughness: 0.3, metalness: 0.4 }

  return (
    <group position={position} scale={[s, s, s]}>
      <mesh position={[0, 0.5, 0]} receiveShadow><boxGeometry args={[5, 1, 5]} /><meshStandardMaterial color="#7f8c8d" roughness={0.5} metalness={0.2} /></mesh>
      <group position={[0, 3.5, 0]}>
        <mesh castShadow><cylinderGeometry args={[0.6, 0.6, 6, 32]} /><meshStandardMaterial {...rocketMat} /></mesh>
        <mesh position={[0, 3.5, 0]}><coneGeometry args={[0.6, 1.5, 32]} /><meshStandardMaterial color="#c0392b" {...(isMax?matGold:{})} /></mesh>
      </group>
      <mesh position={[2, 5, 0]}><boxGeometry args={[0.5, 10, 0.5]} /><meshStandardMaterial color={isMax?"#f1c40f":"#e67e22"} wireframe /></mesh>
      <group position={[0, 8.5, 0]}>
        <BuildingLabel type="rocket" lang={lang} owner={owner} level={level} color="#e74c3c" />
      </group>
    </group>
  )
}
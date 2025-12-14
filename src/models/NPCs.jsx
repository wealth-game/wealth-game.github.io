/* src/models/NPCs.jsx */
import React, { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { Player } from './Player'

const NPC_COUNT = 20
const MAP_SIZE = 40

const names = ["市民", "游客", "散户", "打工人", "路人", "外卖员", "中介", "极客"]
const getRandomName = () => `${names[Math.floor(Math.random() * names.length)]} ${Math.floor(Math.random() * 999)}`
const randomColor = () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')

const randomSkin = () => ({
  head: Math.random() > 0.5 ? "#ffccaa" : "#8d5524",
  body: randomColor(),
  legs: randomColor(),
  eyes: "#000000",
  backpack: randomColor(),
  hair: Math.random() > 0.3 ? "#333333" : randomColor(),
  shoes: Math.random() > 0.5 ? "#333333" : "#ffffff"
})

function SingleNPC({ startPos }) {
  const group = useRef()
  const [isWalking, setIsWalking] = useState(false)
  
  const data = useMemo(() => ({
    target: [startPos[0], 0, startPos[2]],
    speed: 0.5 + Math.random() * 1.5,
    skin: randomSkin(),
    name: getRandomName(),
    waitTime: 0
  }), [])

  useFrame((state, delta) => {
    if (!group.current) return

    const current = group.current.position
    
    // 🛡️ 防御 1：如果自身坐标坏了，重置到安全区
    if (isNaN(current.x) || isNaN(current.z)) {
      group.current.position.set(20, 0, 20)
      return
    }

    const dx = data.target[0] - current.x
    const dz = data.target[2] - current.z
    // 🛡️ 防御 2：距离计算保护
    const distSq = dx*dx + dz*dz
    const dist = Math.sqrt(distSq)

    if (dist < 0.5) {
      setIsWalking(false)
      data.waitTime += delta
      
      // 休息够了，找新目标
      if (data.waitTime > 2 + Math.random() * 3) { 
        let tx, tz, lenSq
        // 🛡️ 防御 3：生成目标点时，死循环确保不生成在 (0,0) 附近
        // 且不生成在 NPC 当前脚下 (防止原地转身崩溃)
        do {
           const angle = Math.random() * Math.PI * 2
           const radius = 8 + Math.random() * 15 // 必须在 8米外
           tx = Math.sin(angle) * radius
           tz = Math.cos(angle) * radius
           
           const ndx = tx - current.x
           const ndz = tz - current.z
           lenSq = ndx*ndx + ndz*ndz
        } while (lenSq < 1.0) // 目标点必须离自己至少1米远

        data.target = [tx, 0, tz]
        data.waitTime = 0
        
        // 🛡️ 防御 4：绝对安全的 lookAt
        // 只有当目标点真的很远时，才转身。防止原地转身导致的 NaN
        if (lenSq > 0.1) {
          group.current.lookAt(data.target[0], 0, data.target[2])
        }
      }
    } else {
      setIsWalking(true)
      const moveDist = data.speed * delta
      
      // 🛡️ 防御 5：移动保护
      if (dist > 0.1) {
        group.current.position.x += (dx / dist) * moveDist
        group.current.position.z += (dz / dist) * moveDist
      }
    }
  })

  return (
    <group ref={group} position={startPos}>
      <Player isWorking={isWalking} skin={data.skin} />
      <Html position={[0, 2, 0]} center distanceFactor={10}>
        <div style={{color: 'rgba(255,255,255,0.6)', fontSize: '9px', textShadow: '0 1px 1px black', whiteSpace: 'nowrap'}}>
          {data.name}
        </div>
      </Html>
    </group>
  )
}

export function NPCSystem() {
  const npcs = useMemo(() => {
    return new Array(NPC_COUNT).fill(0).map(() => {
      // 初始生成也要避开 (0,0)
      const angle = Math.random() * Math.PI * 2
      const radius = 10 + Math.random() * 20
      return [Math.sin(angle) * radius, 0, Math.cos(angle) * radius]
    })
  }, [])

  return <>{npcs.map((pos, i) => <SingleNPC key={i} startPos={pos} />)}</>
}
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

// 升级：随机生成 5 部分皮肤
const randomSkin = () => ({
  head: Math.random() > 0.5 ? "#ffccaa" : "#8d5524", // 随机两种肤色
  body: randomColor(),
  legs: randomColor(),
  eyes: "#000000",
  backpack: randomColor()
})

function SingleNPC({ startPos }) {
  const group = useRef()
  const [isWalking, setIsWalking] = useState(false)
  
  const data = useMemo(() => ({
    target: [startPos[0], 0, startPos[2]],
    speed: 0.5 + Math.random() * 1.5,
    skin: randomSkin(), // 使用新版皮肤生成器
    name: getRandomName(),
    waitTime: 0
  }), [])

  useFrame((state, delta) => {
    if (!group.current) return
    const current = group.current.position
    const dx = data.target[0] - current.x
    const dz = data.target[2] - current.z
    const dist = Math.sqrt(dx * dx + dz * dz)

    if (dist < 0.5) {
      setIsWalking(false)
      data.waitTime += delta
      if (data.waitTime > 2 + Math.random() * 3) { 
        const angle = Math.random() * Math.PI * 2
        const radius = 5 + Math.random() * 15
        data.target = [Math.sin(angle) * radius, 0, Math.cos(angle) * radius]
        data.waitTime = 0
        group.current.lookAt(data.target[0], 0, data.target[2])
      }
    } else {
      setIsWalking(true)
      const moveDist = data.speed * delta
      group.current.position.x += (dx / dist) * moveDist
      group.current.position.z += (dz / dist) * moveDist
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
      const x = (Math.random() - 0.5) * MAP_SIZE
      const z = (Math.random() - 0.5) * MAP_SIZE
      return [x, 0, z]
    })
  }, [])

  return <>{npcs.map((pos, i) => <SingleNPC key={i} startPos={pos} />)}</>
}
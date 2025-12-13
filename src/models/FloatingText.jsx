/* src/models/FloatingText.jsx */
import React, { useRef, useState, useLayoutEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'

// 单个浮动数字
function FloatingItem({ text, position, onComplete }) {
  const ref = useRef()
  const [opacity, setOpacity] = useState(1)
  
  useFrame((state, delta) => {
    if (ref.current) {
      // 向上飘
      ref.current.position.y += delta * 1.5
      // 慢慢变淡
      setOpacity(prev => Math.max(0, prev - delta * 0.5))
      
      // 完全消失后，通知父组件删除自己
      if (opacity <= 0) {
        onComplete()
      }
    }
  })

  return (
    <group ref={ref} position={position}>
      <Html center pointerEvents="none">
        <div style={{
          color: '#f1c40f', 
          fontWeight: '900', 
          fontSize: '16px', 
          textShadow: '0 2px 0 black',
          opacity: opacity,
          transform: `scale(${1 + (1-opacity)})`, // 逐渐变大
          whiteSpace: 'nowrap'
        }}>
          {text}
        </div>
      </Html>
    </group>
  )
}

// 管理器：负责接收指令并生成多个数字
export function FloatingTextManager({ events }) {
  const [items, setItems] = useState([])

  // 监听新事件
  useLayoutEffect(() => {
    if (events.length > 0) {
      const latest = events[events.length - 1]
      // 加一点随机偏移，防止重叠
      const offset = [
        (Math.random() - 0.5) * 0.5,
        0,
        (Math.random() - 0.5) * 0.5
      ]
      const newItem = {
        id: Math.random(),
        text: latest.text,
        position: [latest.pos[0] + offset[0], latest.pos[1] + 2, latest.pos[2] + offset[2]]
      }
      setItems(prev => [...prev, newItem])
    }
  }, [events])

  const remove = (id) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  return (
    <>
      {items.map(item => (
        <FloatingItem 
          key={item.id} 
          text={item.text} 
          position={item.position} 
          onComplete={() => remove(item.id)} 
        />
      ))}
    </>
  )
}
/* src/models/Buildings.jsx */
import React from 'react'
import { Html } from '@react-three/drei'

export function ConvenienceStore({ position }) {
  return (
    <group position={position}>
      {/* 整体稍微抬高一点点，防闪烁 */}
      <group position={[0, 0.05, 0]}>
        
        {/* === 1. 建筑主体 (白墙) === */}
        <mesh position={[0, 1.25, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.8, 2.5, 1.8]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} />
        </mesh>

        {/* === 2. 经典的 7-11 三色条纹 (招牌) === */}
        <group position={[0, 2.2, 0.92]}>
          {/* 橙色条 */}
          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[1.6, 0.15, 0.05]} />
            <meshStandardMaterial color="#f39c12" /> {/* Orange */}
          </mesh>
          {/* 绿色条 */}
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[1.6, 0.15, 0.05]} />
            <meshStandardMaterial color="#27ae60" /> {/* Green */}
          </mesh>
          {/* 红色条 */}
          <mesh position={[0, -0.1, 0]}>
            <boxGeometry args={[1.6, 0.15, 0.05]} />
            <meshStandardMaterial color="#c0392b" /> {/* Red */}
          </mesh>
        </group>

        {/* === 3. 玻璃门窗 (半透明) === */}
        <mesh position={[0, 0.9, 0.91]}>
          <planeGeometry args={[1.4, 1.6]} />
          <meshStandardMaterial 
            color="#81ecec" 
            transparent 
            opacity={0.6} 
            metalness={0.8} 
            roughness={0.1} 
          />
        </mesh>
        
        {/* 门框/把手细节 */}
        <mesh position={[0, 0.9, 0.92]}>
          <boxGeometry args={[0.05, 1.6, 0.02]} /> {/* 门缝 */}
          <meshStandardMaterial color="#bdc3c7" />
        </mesh>
        <mesh position={[0.15, 0.9, 0.93]}>
          <boxGeometry args={[0.05, 0.4, 0.05]} /> {/*把手*/}
          <meshStandardMaterial color="#2c3e50" />
        </mesh>

        {/* === 4. 屋顶设施 (增加细节感) === */}
        <mesh position={[0, 2.55, 0]}>
          <boxGeometry args={[1.9, 0.1, 1.9]} /> {/* 屋檐 */}
          <meshStandardMaterial color="#bdc3c7" />
        </mesh>
        {/* 空调外机 */}
        <mesh position={[0.5, 2.75, 0.5]} castShadow>
          <boxGeometry args={[0.6, 0.4, 0.4]} />
          <meshStandardMaterial color="#95a5a6" />
        </mesh>

        {/* === 5. 3D 浮动Logo === */}
        <Html position={[0, 3.2, 0]} center distanceFactor={15} transform sprite>
          <div style={{
            background: 'white', 
            padding: '4px 8px', 
            borderRadius: '4px', 
            border: '2px solid #27ae60',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pointerEvents: 'none'
          }}>
            <div style={{fontSize: '12px', fontWeight: 'bold', color:'#e67e22', lineHeight:'1'}}>7</div>
            <div style={{fontSize: '10px', fontWeight: 'bold', color:'#27ae60', lineHeight:'1'}}>ELEVEN</div>
          </div>
        </Html>

      </group>
    </group>
  )
}
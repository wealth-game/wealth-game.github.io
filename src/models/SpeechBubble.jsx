/* src/models/SpeechBubble.jsx */
import React from 'react'
import { Html } from '@react-three/drei'

export function SpeechBubble({ text }) {
  if (!text) return null

  return (
    <Html position={[0, 2.5, 0]} center distanceFactor={12}>
      <div style={styles.bubble}>
        {text}
        <div style={styles.tail}></div>
      </div>
    </Html>
  )
}

const styles = {
  bubble: {
    background: 'white',
    padding: '8px 12px',
    borderRadius: '12px',
    border: '2px solid #333',
    color: '#333',
    fontWeight: 'bold',
    fontSize: '12px',
    whiteSpace: 'nowrap',
    position: 'relative',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    maxWidth: '200px', // 防止字太多太长
    whiteSpace: 'normal', // 允许换行
    textAlign: 'center',
    animation: 'popIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  },
  tail: {
    position: 'absolute',
    bottom: '-6px',
    left: '50%',
    marginLeft: '-6px',
    width: '0',
    height: '0',
    borderLeft: '6px solid transparent',
    borderRight: '6px solid transparent',
    borderTop: '6px solid #333'
  }
}
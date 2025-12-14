/* src/Leaderboard.jsx */
import React, { useEffect, useState } from 'react'
import { supabase } from './supabase'

export default function Leaderboard({ myId }) {
  const [leaders, setLeaders] = useState([])
  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    const fetchLeaders = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('nickname, cash, id')
        .neq('nickname', null) 
        .not('nickname', 'is', null)
        .order('cash', { ascending: false })
        .limit(10)
      
      if (data) setLeaders(data)
    }

    fetchLeaders()
    const timer = setInterval(fetchLeaders, 5000)
    return () => clearInterval(timer)
  }, [])

  if (!isOpen) {
    return (
      <div onClick={() => setIsOpen(true)} style={{position: 'absolute', top: '80px', right: '10px', background: 'rgba(0,0,0,0.6)', color: 'gold', padding: '10px', borderRadius: '50%', width:'40px', height:'40px', display:'flex', alignItems:'center', justifyContent:'center', cursor: 'pointer', pointerEvents:'auto', boxShadow: '0 4px 10px rgba(0,0,0,0.2)'}}>🏆</div>
    )
  }

  return (
    <div style={{position: 'absolute', top: '80px', right: '10px', background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)', padding: '15px', borderRadius: '15px', width: '180px', pointerEvents: 'auto', boxShadow: '0 8px 20px rgba(0,0,0,0.2)', fontFamily: 'sans-serif'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
        <h3 style={{margin:0, fontSize:'14px', color:'#333'}}>🏆 福布斯富豪榜 (USD)</h3>
        <span onClick={() => setIsOpen(false)} style={{cursor:'pointer', color:'#999'}}>×</span>
      </div>
      <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
        {leaders.map((user, index) => (
          <div key={user.id} style={{display:'flex', justifyContent:'space-between', fontSize:'12px', color: user.id === myId ? '#d35400' : '#555', fontWeight: user.id === myId ? 'bold' : 'normal'}}>
            <span><span style={{marginRight:'5px', color: index<3 ? '#f1c40f':'#ccc'}}>#{index + 1}</span>{user.nickname || `神秘富豪${user.id.substr(0,4)}`}</span>
            <span>${Math.floor(user.cash).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
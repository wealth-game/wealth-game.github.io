/* src/App.jsx */
import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabase'
import GameScene from './GameScene'
import Auth from './Auth'
import ProfileEditor from './ProfileEditor'
import Leaderboard from './Leaderboard'
import './App.css'

const DEFAULT_SKIN = { head: "#ffccaa", body: "#3498db", legs: "#2c3e50", eyes: "#000000", backpack: "#e74c3c", hair: "#2c3e50", shoes: "#333333" }

// 随机出生点 (避开中心纪念碑 6米范围)
const getRandomSpawn = () => {
  const angle = Math.random() * Math.PI * 2
  const radius = 6 + Math.random() * 4
  return [Math.sin(angle) * radius, 0, Math.cos(angle) * radius]
}

// --- 新增：计算安全出生点 (在目标周围 3米处) ---
const getSafeSpawnAround = (x, z) => {
  const angle = Math.random() * Math.PI * 2
  const distance = 3.5 // 离中心 3.5米，确保不被卡在墙里
  return [x + Math.sin(angle) * distance, 0, z + Math.cos(angle) * distance]
}

function App() {
  const [session, setSession] = useState(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)

  // 监听登录状态
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setIsAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (_event === 'SIGNED_OUT') {
        setIsGuest(false)
        window.location.reload()
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  if (isAuthLoading) return <div className="loading-screen">Loading World...</div>

  // 未登录且非游客 -> 显示登录页
  if (!session && !isGuest) {
    return <Auth onGuestClick={() => setIsGuest(true)} />
  }

  return <GameWorld session={session} isGuest={isGuest} />
}

// === 游戏主逻辑 ===
function GameWorld({ session, isGuest }) {
  // --- 身份信息 ---
  const [myId] = useState(session ? session.user.id : `guest-${Math.random().toString(36).substr(2, 5)}`)
  const [mySessionId] = useState(Math.random().toString(36).substr(2, 9))
  
  const [myName, setMyName] = useState(isGuest ? `游客 ${myId.substr(myId.length-4)}` : `富豪 ${myId.substr(0,4)}`)
  const [mySkin, setMySkin] = useState(DEFAULT_SKIN)
  const [showProfile, setShowProfile] = useState(false)

  const [lang, setLang] = useState('zh') 

  // --- 游戏数值 ---
  const [cash, setCash] = useState(0)
  const [energy, setEnergy] = useState(0)
  const [income, setIncome] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isWorking, setIsWorking] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [nextSleepTime, setNextSleepTime] = useState(0) 

  // --- 地图与位置 ---
  const [myPosition, setMyPosition] = useState([0, 0, 0]) // 初始0，等待加载
  const posRef = useRef([0, 0, 0])
  const [otherPlayers, setOtherPlayers] = useState({}) 
  const [buildings, setBuildings] = useState([]) 
  const [currentGrid, setCurrentGrid] = useState({x: 0, z: 0}) 
  const [activeShop, setActiveShop] = useState(null) 
  
  // --- 交互系统 ---
  const [myMessage, setMyMessage] = useState("") 
  const [chatInput, setChatInput] = useState("") 
  const [showChat, setShowChat] = useState(false) 
  const [floatEvents, setFloatEvents] = useState([]) 
  
  // --- 系统配置 ---
  const lastFetchPos = useRef([9999, 9999, 9999])
  const FETCH_THRESHOLD = 20 
  const VIEW_DISTANCE = 80 
  
  const incomeRef = useRef(income)
  const cashRef = useRef(cash)
  const channelRef = useRef(null) 
  const lastSentPosRef = useRef(null) 

  useEffect(() => { posRef.current = myPosition }, [])
  useEffect(() => { incomeRef.current = income }, [income])
  useEffect(() => { cashRef.current = cash }, [cash])

  // --- 辅助：触发特效 ---
  const triggerFloatText = (text, position) => {
    setFloatEvents(prev => [...prev, { text, pos: position }])
  }

  // --- 1. 地图加载 (AOI) ---
  const fetchNearbyBuildings = async (x, z) => {
    const { data } = await supabase.rpc('get_nearby_buildings', { center_x: x, center_z: z, radius: VIEW_DISTANCE })
    if (data) setBuildings(data)
  }

  // --- 2. 移动逻辑 ---
  const moveCharacter = (direction) => {
    const speed = 0.8 
    const [x, y, z] = posRef.current
    let newPos = [...posRef.current]

    switch(direction) {
      case 'up': newPos = [x, y, z - speed]; break;
      case 'down': newPos = [x, y, z + speed]; break;
      case 'left': newPos = [x - speed, y, z]; break;
      case 'right': newPos = [x + speed, y, z]; break;
      default: return;
    }

    if (checkCollision(newPos)) {
      if (navigator.vibrate) navigator.vibrate(50)
      return 
    }

    setMyPosition(newPos)
    posRef.current = newPos

    const gridX = Math.floor(newPos[0] / 2) * 2 + 1
    const gridZ = Math.floor(newPos[2] / 2) * 2 + 1
    setCurrentGrid({ x: gridX, z: gridZ })

    // 检测店铺交互
    const nearby = buildings.find(b => {
      const dx = newPos[0] - b.x; const dz = newPos[2] - b.z
      return Math.sqrt(dx*dx + dz*dz) < 2.5
    })
    if (nearby && nearby.owner_id !== myId) setActiveShop(nearby)
    else setActiveShop(null)

    // AOI 加载
    const dx = newPos[0] - lastFetchPos.current[0]
    const dz = newPos[2] - lastFetchPos.current[2]
    if (Math.sqrt(dx*dx + dz*dz) > FETCH_THRESHOLD) {
      fetchNearbyBuildings(newPos[0], newPos[2])
      lastFetchPos.current = newPos
    }
  }

  const checkCollision = (targetPos) => {
    const [tx, ty, tz] = targetPos
    if (Math.abs(tx) < 3.5 && Math.abs(tz) < 3.5) return true
    for (let b of buildings) {
      const dx = tx - b.x; const dz = tz - b.z
      if (Math.sqrt(dx*dx + dz*dz) < 1.5) return true
    }
    return false
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showChat) {
        if (e.key === 'Enter') handleSendChat()
        return 
      }
      if (e.key === 'Enter') { setShowChat(true); return }
      if (e.key === 'w' || e.key === 'ArrowUp') moveCharacter('up')
      if (e.key === 's' || e.key === 'ArrowDown') moveCharacter('down')
      if (e.key === 'a' || e.key === 'ArrowLeft') moveCharacter('left')
      if (e.key === 'd' || e.key === 'ArrowRight') moveCharacter('right')
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [buildings, myId, showChat, chatInput])

  // --- 3. 初始化 (核心修改：安全出生点) ---
  useEffect(() => {
    async function initGame() {
      let spawnPos = getRandomSpawn()

      if (!isGuest) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', myId).single()
        
        if (profile) {
          // 找第一栋房子
          const { data: home } = await supabase
            .from('buildings')
            .select('x, z')
            .eq('owner_id', myId)
            .order('created_at', { ascending: true })
            .limit(1)
            .single()
          
          if (home) {
            // 🚨 关键修复：不要直接出现在 (x, z)，而是偏移一点
            spawnPos = getSafeSpawnAround(home.x, home.z)
            console.log("🏠 欢迎回家，已停靠在建筑旁")
          }

          // 计算离线收益
          let offlineCash = 0
          if (profile.last_active_at && profile.passive_income > 0) {
            const lastActive = new Date(profile.last_active_at).getTime()
            const now = Date.now()
            const secondsPassed = (now - lastActive) / 1000
            const validSeconds = Math.min(secondsPassed, 24 * 3600)
            
            if (validSeconds > 60) {
              offlineCash = Math.floor(validSeconds * profile.passive_income)
              alert(`💰 欢迎回来！\n\n离线收益: $${offlineCash.toLocaleString()}`)
            }
          }

          setCash(profile.cash + offlineCash)
          setEnergy(profile.energy)
          setIncome(profile.passive_income || 0)
          if (profile.nickname) setMyName(profile.nickname)
          if (profile.avatar) setMySkin(profile.avatar)

          // 更新数据库
          await supabase.from('profiles').update({ 
            cash: profile.cash + offlineCash,
            last_active_at: new Date().toISOString()
          }).eq('id', myId)
        }
      } else {
        setCash(0); setEnergy(100); setIncome(0)
        setMyName(`游客${myId.substr(myId.length-4)}`)
      }

      setLoading(false)
      // 应用出生点
      setMyPosition(spawnPos)
      posRef.current = spawnPos
      
      fetchNearbyBuildings(spawnPos[0], spawnPos[2])
      lastFetchPos.current = spawnPos
      
      joinMultiplayerRoom(myId, spawnPos)
    }
    initGame()
    return () => { if (channelRef.current) supabase.removeChannel(channelRef.current) }
  }, [isGuest, myId]) 

  // 心跳更新 last_active_at
  useEffect(() => {
    if (isGuest) return
    const activeTimer = setInterval(() => {
      supabase.from('profiles').update({ last_active_at: new Date().toISOString() }).eq('id', myId)
    }, 60000)
    return () => clearInterval(activeTimer)
  }, [isGuest, myId])

  // --- 4. 多人连接 ---
  const joinMultiplayerRoom = (userId, position) => {
    if (channelRef.current) return

    const channel = supabase.channel('game_room', { config: { presence: { key: mySessionId } } })

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState()
        setOtherPlayers(prev => {
          const next = { ...prev }
          for (let key in newState) {
            if (key !== mySessionId) {
               const user = newState[key][0]
               if (user) next[key] = { ...user, message: next[key]?.message || null }
            }
          }
          return next
        })
      })
      .on('broadcast', { event: 'chat' }, ({ payload }) => {
        setOtherPlayers(prev => {
          if (!prev[payload.sessionId]) return prev
          return { ...prev, [payload.sessionId]: { ...prev[payload.sessionId], message: payload.text } }
        })
        setTimeout(() => {
          setOtherPlayers(prev => {
            if (!prev[payload.sessionId]) return prev
            return { ...prev, [payload.sessionId]: { ...prev[payload.sessionId], message: null } }
          })
        }, 5000)
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'buildings' }, payload => {
        const newB = payload.new
        if (Math.sqrt((newB.x-posRef.current[0])**2 + (newB.z-posRef.current[2])**2) < VIEW_DISTANCE) 
          setBuildings(prev => [...prev, newB])
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
          await channel.track({ sessionId: mySessionId, userId, position, skin: mySkin, name: myName, isWorking: false })
        }
      })
    channelRef.current = channel
  }

  const handleSendChat = async () => {
    if (!chatInput.trim()) { setShowChat(false); return }
    const text = chatInput.substring(0, 30)
    setMyMessage(text); setChatInput(""); setShowChat(false)
    if (channelRef.current) await channelRef.current.send({ type: 'broadcast', event: 'chat', payload: { sessionId: mySessionId, text: text } })
    setTimeout(() => setMyMessage(null), 5000)
  }

  useEffect(() => {
    if (!isConnected || !channelRef.current) return
    const syncInterval = setInterval(() => {
      const currentPos = posRef.current
      const lastPos = lastSentPosRef.current
      let shouldSend = true
      if (lastPos) {
        const dist = Math.sqrt((currentPos[0]-lastPos[0])**2 + (currentPos[2]-lastPos[2])**2)
        if (dist < 0.01 && !isWorking) shouldSend = false
      }
      if (shouldSend) {
        channelRef.current.track({ 
          sessionId: mySessionId, userId: myId, position: currentPos, 
          skin: mySkin, name: myName, isWorking: isWorking
        })
        lastSentPosRef.current = currentPos
      }
    }, 200)
    return () => clearInterval(syncInterval)
  }, [isConnected, isWorking, mySkin, myName, myId])

  // 自动赚钱 & 保存
  useEffect(() => {
    const timer = setInterval(() => {
      if (incomeRef.current > 0) setCash(prev => prev + parseFloat(incomeRef.current))
    }, 1000)
    
    const saveTimer = setInterval(async () => {
      if (!isGuest && incomeRef.current > 0) {
        await supabase.from('profiles').update({ 
          cash: cashRef.current,
          last_active_at: new Date().toISOString()
        }).eq('id', myId)
      }
    }, 30000)

    return () => {
      clearInterval(timer)
      clearInterval(saveTimer)
    }
  }, [isGuest, myId])

  const handleSaveProfile = async (newName, newSkin) => {
    if (isGuest) { alert("🔒 游客模式无法保存"); return }
    if (!newName || newName.trim() === "") { alert("❌ 名字不能为空"); return }
    
    const { error } = await supabase.from('profiles').update({ nickname: newName, avatar: newSkin }).eq('id', myId)
    if (error && error.code === '23505') { alert(`❌ "${newName}" 已被占用`); return }
    
    setMyName(newName); setMySkin(newSkin); setShowProfile(false)
    if (channelRef.current) {
      channelRef.current.track({ sessionId: mySessionId, userId: myId, position: posRef.current, skin: newSkin, name: newName, isWorking: isWorking })
    }
    alert(`✅ 形象已更新`)
  }

  const checkGuest = () => { if (isGuest) { alert("🔒 游客模式\n\n请注册账号！"); return true } return false }
  
  const work = async () => {
    if (checkGuest()) return
    if (energy >= 10) {
      setIsWorking(true); setTimeout(() => setIsWorking(false), 500)
      const newCash = cash + 15; const newEnergy = energy - 10
      setCash(newCash); setEnergy(newEnergy)
      await supabase.from('profiles').update({ cash: newCash, energy: newEnergy }).eq('id', myId)
      if(navigator.vibrate) navigator.vibrate(20)
      triggerFloatText("+$15", [posRef.current[0], posRef.current[1]+2, posRef.current[2]])
    } else { alert("没精力了！") }
  }

  const buyShop = async () => {
      if (checkGuest()) return
      const cost = 200
      if (cash >= cost) {
        const newCash = cash - cost; const newIncome = income + 5
        setCash(newCash); setIncome(newIncome)
        await supabase.from('profiles').update({ cash: newCash, passive_income: newIncome }).eq('id', myId)
        triggerFloatText("-$200", posRef.current)
        alert("已购买流动摊位")
      } else { alert(`钱不够，需要 $${cost}`) }
  }

  const sleep = async () => { 
      if (checkGuest()) return
      const now = Date.now()
      if (now < nextSleepTime) {
        alert(`🛌 休息太频繁！请等 ${Math.ceil((nextSleepTime - now) / 1000)} 秒`)
        return
      }
      setEnergy(100)
      setNextSleepTime(now + 60000)
      await supabase.from('profiles').update({ energy: 100 }).eq('id', myId)
      triggerFloatText("⚡精力满", posRef.current)
  }
  
  // --- 修复：回城也使用安全偏移 ---
  const goHome = async () => {
      const { data } = await supabase.from('buildings').select('x, z').eq('owner_id', myId).order('created_at', { ascending: true }).limit(1).single()
      
      let homePos = getRandomSpawn()
      if (data) {
        // 🚨 关键：使用 getSafeSpawnAround 计算家门口的位置
        homePos = getSafeSpawnAround(data.x, data.z)
        alert("🏠 欢迎回家")
      } else {
        alert("🏠 暂无房产，传送至安全区")
      }

      setMyPosition(homePos); posRef.current = homePos
      fetchNearbyBuildings(homePos[0], homePos[2]); lastFetchPos.current = homePos
      setCurrentGrid({x: Math.round(homePos[0]), z: Math.round(homePos[2])}); setActiveShop(null) 
  }

  const buildBuilding = async (type, cost, incomeBoost, name) => {
    if (checkGuest()) return
    if (cash < cost) { alert(`❌ 资金不足\n需要: $${cost}`); return }
    if (Math.abs(currentGrid.x) < 3 && Math.abs(currentGrid.z) < 3) { alert("❌ 保护区"); return }
    const isOccupied = buildings.some(b => Math.abs(b.x - currentGrid.x) < 1.5 && Math.abs(b.z - currentGrid.z) < 1.5)
    if (isOccupied) { alert("❌ 太挤了"); return }

    const newCash = cash - cost; const newIncome = income + incomeBoost
    setCash(newCash); setIncome(newIncome)
    
    const tempB = { id: Math.random(), owner_id: myId, owner_name: myName, type, x: currentGrid.x, z: currentGrid.z }
    setBuildings(prev => [...prev, tempB])
    triggerFloatText(`-$${cost}`, posRef.current)

    // 弹开
    const escapePos = [posRef.current[0] + 2, 0, posRef.current[2]]
    setMyPosition(escapePos); posRef.current = escapePos

    await supabase.from('profiles').update({ cash: newCash, passive_income: newIncome }).eq('id', myId)
    await supabase.from('buildings').insert({ owner_id: myId, type: type, x: currentGrid.x, z: currentGrid.z })
  }

  const handlePurchase = async () => {
    if (checkGuest()) return
    if (!activeShop) return
    const PRICE = 50 
    if (cash < PRICE) { alert("❌ 钱不够"); return }
    const { data, error } = await supabase.rpc('buy_item', { buyer_id: myId, building_id: activeShop.id, price: PRICE })
    if (data && data.status === 'success') {
      setCash(prev => prev - PRICE); setEnergy(prev => Math.min(prev + 20, 100))
      triggerFloatText(`-$${PRICE}`, posRef.current)
      triggerFloatText("⚡+20", [posRef.current[0], posRef.current[1]+0.5, posRef.current[2]])
    } else { alert(`❌ 交易失败`) }
  }

  const handleLogout = async () => { if (!isGuest) await supabase.auth.signOut(); window.location.reload() }

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>

  return (
    <div className="app-container">
      {showProfile && (
        <ProfileEditor initialName={myName} initialSkin={mySkin} onSave={handleSaveProfile} onClose={() => setShowProfile(false)} />
      )}

      <div className="scene-container">
        <GameScene 
          isWorking={isWorking} hasShop={income > 0} 
          myPosition={myPosition} myColor={mySkin} myMessage={myMessage}
          otherPlayers={otherPlayers} buildings={buildings} currentGrid={currentGrid}
          floatEvents={floatEvents} lang={lang}
        />
      </div>

      <div className="ui-overlay">
        <Leaderboard myId={myId} />

        <div className="top-info">
          <div className="gps-panel" style={{display:'flex', alignItems:'center', gap:'8px'}} onClick={() => setShowProfile(true)}>
            <div style={{width:'8px', height:'8px', borderRadius:'50%', background: isConnected ? '#2ecc71' : '#e74c3c'}}></div>
            <div style={{cursor:'pointer', borderBottom:'1px dashed white'}}>{myName} ✏️</div>
          </div>
          <div style={{display:'flex', gap:'10px'}}>
             <button onClick={() => setLang(prev => prev==='zh'?'en':'zh')} className="home-btn">{lang==='zh'?'EN':'中'}</button>
             <button onClick={goHome} className="home-btn">🏠</button>
             <button onClick={handleLogout} className="home-btn" style={{color:'red'}}>{isGuest ? "注册" : "退出"}</button>
          </div>
        </div>

        <div style={{position:'absolute', top:'50px', left:'10px', fontSize:'10px', color:'rgba(255,255,255,0.7)', textShadow:'0 1px 1px black'}}>
          Online: {Object.keys(otherPlayers).length + 1 + 20}
        </div>

        {showChat && (
          <div style={{position:'absolute', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'auto', zIndex:50}}>
             <div style={{background:'white', padding:'20px', borderRadius:'15px', width:'80%', maxWidth:'400px'}}>
               <h3 style={{marginTop:0}}>💬 发送消息</h3>
               <input 
                 autoFocus placeholder="说点什么..." value={chatInput} onChange={e => setChatInput(e.target.value)}
                 style={{width:'100%', padding:'10px', fontSize:'16px', borderRadius:'8px', border:'1px solid #ccc', boxSizing:'border-box', marginBottom:'10px'}}
                 onKeyDown={e => e.key === 'Enter' && handleSendChat()}
               />
               <div style={{display:'flex', gap:'10px'}}>
                 <button onClick={() => setShowChat(false)} style={{flex:1, padding:'10px', borderRadius:'8px', border:'none', background:'#eee'}}>取消</button>
                 <button onClick={handleSendChat} style={{flex:1, padding:'10px', borderRadius:'8px', border:'none', background:'#2ecc71', color:'white', fontWeight:'bold'}}>发送</button>
               </div>
             </div>
          </div>
        )}
        {!showChat && (
          <button onClick={() => setShowChat(true)} style={{position:'absolute', right:'20px', bottom:'180px', width:'50px', height:'50px', borderRadius:'50%', background:'white', border:'none', boxShadow:'0 4px 10px rgba(0,0,0,0.2)', fontSize:'24px', cursor:'pointer', pointerEvents:'auto', display:'flex', alignItems:'center', justifyContent:'center'}}>💬</button>
        )}

        {activeShop && (
           <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'auto'}}>
              <div style={{background: 'white', padding: '15px 25px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', textAlign: 'center', animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'}}>
                 <div style={{fontSize:'12px', color:'#888', marginBottom:'5px'}}>🏪 商店</div>
                 <div style={{fontSize:'18px', fontWeight:'bold', marginBottom:'10px'}}>购买补给套餐</div>
                 <button onClick={handlePurchase} style={{background: '#2ecc71', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold'}}>支付 $50</button>
              </div>
           </div>
        )}

        <div className="d-pad">
           <div className="pad-btn pad-up" onTouchStart={(e)=>{e.preventDefault(); moveCharacter('up')}}>▲</div>
           <div className="pad-btn pad-down" onTouchStart={(e)=>{e.preventDefault(); moveCharacter('down')}}>▼</div>
           <div className="pad-btn pad-left" onTouchStart={(e)=>{e.preventDefault(); moveCharacter('left')}}>◀</div>
           <div className="pad-btn pad-right" onTouchStart={(e)=>{e.preventDefault(); moveCharacter('right')}}>▶</div>
        </div>

        <div className="bottom-controls">
          <div className="stats-card">
             <div>$ {Math.floor(cash)}</div>
             <div>⚡ {energy}</div>
             <div style={{color:'#ffa502'}}>+{income}/s</div>
          </div>
          <div className="actions-scroll">
            <ActionBtn title="🔨 搬砖" onClick={work} color="#ff4757" />
            <ActionBtn title="🌭 流动摊 (200)" onClick={buyShop} color="#ffa502" disabled={income>0} />
            <ActionBtn title="🏪 便利店 (1k)" onClick={() => buildBuilding('store', 1000, 20, '便利店')} color="#9b59b6" />
            <ActionBtn title="☕ 咖啡馆 (5k)" onClick={() => buildBuilding('coffee', 5000, 80, '咖啡馆')} color="#00704a" />
            <ActionBtn title="⛽ 加油站 (2w)" onClick={() => buildBuilding('gas', 20000, 300, '加油站')} color="#e74c3c" />
            <ActionBtn title="🏢 科技园 (10w)" onClick={() => buildBuilding('office', 100000, 1200, '科技园')} color="#3498db" />
            <ActionBtn title="🌆 摩天大楼 (100w)" onClick={() => buildBuilding('tower', 1000000, 10000, '摩天大楼')} color="#2c3e50" />
            <ActionBtn title="🚀 火箭基地 (1亿)" onClick={() => buildBuilding('rocket', 100000000, 99999, '发射基地')} color="#c0392b" />
            
            <ActionBtn 
              title={Date.now() < nextSleepTime ? `💤 冷却` : "💤 睡觉"} 
              onClick={sleep} 
              color="#2ed573" 
              disabled={Date.now() < nextSleepTime}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function ActionBtn({ title, onClick, color, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} className="action-btn" style={{background:color, color:'white', opacity: disabled?0.5:1}}>
      {title}
    </button>
  )
}

export default App
/* src/App.jsx */
import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabase'
import GameScene from './GameScene'
import './App.css'

const randomColor = () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')

function App() {
  const [mySessionId] = useState(Math.random().toString(36).substr(2, 9))
  const [myColor] = useState(randomColor()) 

  const [cash, setCash] = useState(0)
  const [energy, setEnergy] = useState(0)
  const [income, setIncome] = useState(0)
  const [myId, setMyId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isWorking, setIsWorking] = useState(false)

  // 初始位置 (6, 0, 6)，避开中心纪念碑
  const START_POS = [6, 0, 6]
  const [myPosition, setMyPosition] = useState(START_POS) 
  const posRef = useRef(START_POS) 
  
  const [otherPlayers, setOtherPlayers] = useState({}) 
  const [buildings, setBuildings] = useState([]) 
  
  // 关键修复：初始网格也要对应 (6, 0, 6) -> Grid (3, 3)
  const [currentGrid, setCurrentGrid] = useState({x: 3, z: 3}) 
  
  const lastFetchPos = useRef([9999, 9999, 9999])
  const FETCH_THRESHOLD = 20 
  const VIEW_DISTANCE = 70

  const incomeRef = useRef(income)
  const channelRef = useRef(null) 

  useEffect(() => { incomeRef.current = income }, [income])

  const fetchNearbyBuildings = async (x, z) => {
    const { data } = await supabase.rpc('get_nearby_buildings', { center_x: x, center_z: z, radius: VIEW_DISTANCE })
    if (data) setBuildings(data)
  }

  // --- 移动核心逻辑 (键盘+触摸通用) ---
  const moveCharacter = (direction) => {
    const speed = 0.8 // 手机上稍微快一点
    const [x, y, z] = posRef.current
    let newPos = [...posRef.current]

    switch(direction) {
      case 'up': newPos = [x, y, z - speed]; break;
      case 'down': newPos = [x, y, z + speed]; break;
      case 'left': newPos = [x - speed, y, z]; break;
      case 'right': newPos = [x + speed, y, z]; break;
      default: return;
    }

    // 1. 碰撞检测
    if (checkCollision(newPos)) {
      // 简单的震动反馈 (如果手机支持)
      if (navigator.vibrate) navigator.vibrate(50)
      return 
    }

    // 2. 更新位置
    setMyPosition(newPos)
    posRef.current = newPos

    // 3. 更新网格 (用于建造)
    const gridX = Math.floor(newPos[0] / 2) * 2 + 1
    const gridZ = Math.floor(newPos[2] / 2) * 2 + 1
    setCurrentGrid({ x: gridX, z: gridZ })

    // 4. AOI 加载
    const dx = newPos[0] - lastFetchPos.current[0]
    const dz = newPos[2] - lastFetchPos.current[2]
    if (Math.sqrt(dx*dx + dz*dz) > FETCH_THRESHOLD) {
      fetchNearbyBuildings(newPos[0], newPos[2])
      lastFetchPos.current = newPos
    }
  }

  const checkCollision = (targetPos) => {
    const [tx, ty, tz] = targetPos
    // 纪念碑禁区
    if (Math.abs(tx) < 2.5 && Math.abs(tz) < 2.5) return true
    // 建筑禁区
    for (let b of buildings) {
      const dx = tx - b.x; const dz = tz - b.z
      if (Math.sqrt(dx*dx + dz*dz) < 1.5) return true
    }
    return false
  }

  // 键盘监听
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'w' || e.key === 'ArrowUp') moveCharacter('up')
      if (e.key === 's' || e.key === 'ArrowDown') moveCharacter('down')
      if (e.key === 'a' || e.key === 'ArrowLeft') moveCharacter('left')
      if (e.key === 'd' || e.key === 'ArrowRight') moveCharacter('right')
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [buildings]) // 依赖 buildings 以便碰撞生效

  // 初始化
  useEffect(() => {
    async function initGame() {
      const { data } = await supabase.from('profiles').select('*').limit(1).single()
      if (data) {
        setCash(data.cash); setEnergy(data.energy)
        setIncome(data.passive_income || 0); setMyId(data.id)
        setLoading(false)
        
        fetchNearbyBuildings(START_POS[0], START_POS[2])
        lastFetchPos.current = START_POS
        joinMultiplayerRoom(data.id, START_POS)
      }
    }
    initGame()
  }, [])

  const joinMultiplayerRoom = (userId, position) => {
    const channel = supabase.channel('game_room')
    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState()
        const players = {}
        for (let key in newState) {
          const user = newState[key][0]
          if (user.sessionId !== mySessionId) players[key] = user
        }
        setOtherPlayers(players)
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'buildings' }, payload => {
        const newB = payload.new
        const dx = newB.x - posRef.current[0]
        const dz = newB.z - posRef.current[2]
        if (Math.sqrt(dx*dx + dz*dz) < VIEW_DISTANCE) setBuildings(prev => [...prev, newB])
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ sessionId: mySessionId, userId, position, color: myColor, isWorking: false })
        }
      })
    channelRef.current = channel
  }

  // 位置同步心跳
  useEffect(() => {
    if (!channelRef.current || !myId) return
    const syncInterval = setInterval(() => {
      channelRef.current.track({ sessionId: mySessionId, userId: myId, position: posRef.current, color: myColor, isWorking: isWorking })
    }, 100)
    return () => clearInterval(syncInterval)
  }, [isWorking, myColor, myId])

  // 自动赚钱
  useEffect(() => {
    const timer = setInterval(() => {
      if (incomeRef.current > 0) setCash(prev => prev + parseFloat(incomeRef.current))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const work = async () => {
    if (energy >= 10) {
      setIsWorking(true); setTimeout(() => setIsWorking(false), 500)
      const newCash = cash + 15; const newEnergy = energy - 10
      setCash(newCash); setEnergy(newEnergy)
      await supabase.from('profiles').update({ cash: newCash, energy: newEnergy }).eq('id', myId)
      if(navigator.vibrate) navigator.vibrate(20) // 手机震动反馈
    } else { alert("没精力了！休息一下吧") }
  }

  const buyShop = async () => { /* 保持逻辑 */ 
      const cost = 200
      if (cash >= cost) {
        const newCash = cash - cost; const newIncome = income + 5
        setCash(newCash); setIncome(newIncome)
        await supabase.from('profiles').update({ cash: newCash, passive_income: newIncome }).eq('id', myId)
      } else { alert(`钱不够，需要 ${cost}`) }
  }
  const sleep = async () => { 
      setEnergy(100); await supabase.from('profiles').update({ energy: 100 }).eq('id', myId) 
  }

  const goHome = () => {
      setMyPosition(START_POS); posRef.current = START_POS
      fetchNearbyBuildings(START_POS[0], START_POS[2])
      lastFetchPos.current = START_POS
      setCurrentGrid({x: 3, z: 3}) // 重置网格
  }

  // --- 建造逻辑 (增强反馈) ---
  const buildStore = async () => {
    const cost = 1000
    
    // 1. 检查钱
    if (cash < cost) { 
      alert(`❌ 资金不足\n\n需要: ¥${cost}\n拥有: ¥${Math.floor(cash)}`)
      return 
    }

    // 2. 检查纪念碑禁区
    if (Math.abs(currentGrid.x) < 3 && Math.abs(currentGrid.z) < 3) {
      alert("❌ 禁止建造\n\n这里是市中心广场保护区！")
      return
    }

    // 3. 检查重叠
    const isOccupied = buildings.some(b => Math.abs(b.x - currentGrid.x) < 1.5 && Math.abs(b.z - currentGrid.z) < 1.5)
    if (isOccupied) { 
      alert("❌ 土地冲突\n\n这里已经有建筑了，太挤了！")
      return 
    }

    // 成功！
    const newCash = cash - cost; const newIncome = income + 20
    setCash(newCash); setIncome(newIncome)
    await supabase.from('profiles').update({ cash: newCash, passive_income: newIncome }).eq('id', myId)
    await supabase.from('buildings').insert({ owner_id: myId, type: 'store', x: currentGrid.x, z: currentGrid.z })
    
    alert("✅ 建造成功！\n\n7-11便利店已开业\n收益 +20/秒")
  }

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>

  return (
    <div className="app-container">
      <div className="scene-container">
        <GameScene 
          isWorking={isWorking} hasShop={income > 0} 
          myPosition={myPosition} myColor={myColor} otherPlayers={otherPlayers}
          buildings={buildings} currentGrid={currentGrid}
        />
      </div>

      <div className="ui-overlay">
        
        {/* 顶部信息 */}
        <div className="top-info">
          <div className="gps-panel">
            📍 {Math.round(myPosition[0])}, {Math.round(myPosition[2])}
          </div>
          <button onClick={goHome} className="home-btn">🏠 回城</button>
        </div>

        {/* 屏幕左侧：虚拟摇杆 (D-Pad) - 专门给手机用 */}
        <div className="d-pad">
           <div className="pad-btn pad-up" onTouchStart={(e)=>{e.preventDefault(); moveCharacter('up')}}>▲</div>
           <div className="pad-btn pad-down" onTouchStart={(e)=>{e.preventDefault(); moveCharacter('down')}}>▼</div>
           <div className="pad-btn pad-left" onTouchStart={(e)=>{e.preventDefault(); moveCharacter('left')}}>◀</div>
           <div className="pad-btn pad-right" onTouchStart={(e)=>{e.preventDefault(); moveCharacter('right')}}>▶</div>
        </div>

        {/* 底部信息与按钮 */}
        <div className="bottom-controls">
          <div className="stats-card">
             <div>¥ {Math.floor(cash)}</div>
             <div>⚡ {energy}</div>
             <div style={{color:'#ffa502'}}>+{income}/s</div>
          </div>
          
          <div className="actions-scroll">
            <ActionBtn title="🔨 搬砖" onClick={work} color="#ff4757" />
            <ActionBtn title="🌭 买摊位 (200)" onClick={buyShop} color="#ffa502" disabled={income>0} />
            <ActionBtn title="🏪 建店 (1000)" onClick={buildStore} color="#9b59b6" />
            <ActionBtn title="💤 睡觉" onClick={sleep} color="#2ed573" />
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
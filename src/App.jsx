import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabase'
import GameScene from './GameScene'
import './App.css'

function App() {
  const [cash, setCash] = useState(0)
  const [energy, setEnergy] = useState(0)
  const [income, setIncome] = useState(0) // 新增：每秒被动收入
  const [myId, setMyId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isWorking, setIsWorking] = useState(false)

  // 使用 useRef 来解决定时器里的闭包陷阱（这是React的一个高级技巧，你照抄就行）
  const cashRef = useRef(cash)
  const incomeRef = useRef(income)
  
  // 保持 ref 和 state 同步
  useEffect(() => { cashRef.current = cash }, [cash])
  useEffect(() => { incomeRef.current = income }, [income])

  // 1. 初始化数据
  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('profiles').select('*').limit(1).single()
      if (data) {
        setCash(data.cash)
        setEnergy(data.energy)
        setIncome(data.passive_income || 0) // 读取被动收入
        setMyId(data.id)
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // 2. 开启“赚钱引擎”：每 1 秒运行一次
  useEffect(() => {
    const timer = setInterval(() => {
      // 只有当有被动收入时才运行
      if (incomeRef.current > 0) {
        const newCash = parseFloat(cashRef.current) + parseFloat(incomeRef.current)
        setCash(newCash) // 更新界面
        
        // 我们不在这里频繁存数据库，那样会把数据库写爆
        // 实际开发中，我们通常隔几秒存一次，或者在用户离开时存
        // 为了演示简单，我们这里先不存，只在买东西时存
      }
    }, 1000) // 1000毫秒 = 1秒

    return () => clearInterval(timer) // 清理定时器
  }, [])

  // 手动打工
  const work = async () => {
    if (energy >= 10) {
      setIsWorking(true)
      setTimeout(() => setIsWorking(false), 500)
      
      const newCash = cash + 15
      const newEnergy = energy - 10
      setCash(newCash)
      setEnergy(newEnergy)

      await supabase.from('profiles').update({ cash: newCash, energy: newEnergy }).eq('id', myId)
    } else {
      alert("没精力了！")
    }
  }

  // 睡觉
  const sleep = async () => {
    setEnergy(100)
    await supabase.from('profiles').update({ energy: 100 }).eq('id', myId)
  }

  // 新功能：购买热狗摊
  const buyHotdogStand = async () => {
    const cost = 200 // 价格
    const profit = 5 // 每秒赚 5 块

    if (cash >= cost) {
      const newCash = cash - cost
      const newIncome = income + profit

      // 1. 界面更新
      setCash(newCash)
      setIncome(newIncome)

      // 2. 存入数据库
      await supabase
        .from('profiles')
        .update({ 
          cash: newCash, 
          passive_income: newIncome 
        })
        .eq('id', myId)
        
      alert("恭喜老板！热狗摊开业了！")
    } else {
      alert("钱不够！快去搬砖！")
    }
  }

  if (loading) return <div>加载世界中...</div>

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', textAlign: 'center', maxWidth: '600px', margin: '0 auto', color: '#333' }}>
      <h1>💰 财富流转 3D</h1>
      
      {/* 顶部数据栏 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontWeight: 'bold' }}>
        <div style={{ color: '#4CAF50' }}>现金: ¥{Math.floor(cash)}</div>
        <div style={{ color: '#FF9800' }}>被动收入: ¥{income}/秒</div>
        <div style={{ color: '#2196F3' }}>精力: {energy}</div>
      </div>

      {/* 3D 场景：传入 hasShop 参数 */}
      <div style={{ marginBottom: '20px', border: '4px solid #333', borderRadius: '15px', height: '400px' }}>
        <GameScene isWorking={isWorking} hasShop={income > 0} />
      </div>

      {/* 按钮区 */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={work} className="btn-work">
          搬砖 (+15)
        </button>

        <button onClick={sleep} className="btn-sleep">
          睡觉
        </button>
      </div>

      <hr style={{ margin: '20px 0' }} />

      {/* 投资区 */}
      <h3>投资机会</h3>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button 
          onClick={buyHotdogStand}
          disabled={income > 0} // 如果已经买了（收入>0），就禁用按钮
          style={{ 
            padding: '15px', 
            background: income > 0 ? '#ccc' : '#FF9800', // 买了变灰，没买橙色
            color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' 
          }}
        >
          {income > 0 ? "热狗摊经营中..." : "购买热狗摊 (¥200)"}
          <div style={{ fontSize: '12px', marginTop: '5px' }}>收益: ¥5/秒</div>
        </button>
      </div>
      
    </div>
  )
}

export default App
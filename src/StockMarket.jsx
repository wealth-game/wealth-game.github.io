/* src/StockMarket.jsx */
import React, { useState, useEffect } from 'react'
import { supabase } from './supabase'

export default function StockMarket({ myId, cash, onClose }) {
  const [stocks, setStocks] = useState([])
  const [portfolio, setPortfolio] = useState({})
  const [loading, setLoading] = useState(true)

  // 刷新市场数据
  const refreshMarket = async () => {
    // 1. 触发一次市场波动 (由前端驱动后端计算，模拟实时市场)
    // 注意：为了防止过于频繁，实际项目中会有服务器定时任务。
    // 这里我们简单处理：每次打开面板或每10秒尝试更新一次
    await supabase.rpc('update_market')

    // 2. 拉取最新价格
    const { data: stockData } = await supabase.from('stocks').select('*').order('symbol')
    
    // 3. 拉取我的持仓
    const { data: myData } = await supabase.from('portfolios').select('*').eq('user_id', myId)
    
    if (stockData) setStocks(stockData)
    if (myData) {
      const portMap = {}
      myData.forEach(p => portMap[p.symbol] = p)
      setPortfolio(portMap)
    }
    setLoading(false)
  }

  // 初始加载 + 定时刷新 (每5秒)
  useEffect(() => {
    refreshMarket()
    const timer = setInterval(refreshMarket, 5000)
    return () => clearInterval(timer)
  }, [])

  const handleTrade = async (symbol, action, count) => {
    if (count <= 0) return
    const { data } = await supabase.rpc('trade_stock', {
      p_user_id: myId,
      p_symbol: symbol,
      p_action: action,
      p_count: count
    })
    
    if (data.status === 'success') {
      // 交易成功，稍微震动反馈，并刷新数据
      if(navigator.vibrate) navigator.vibrate(20)
      refreshMarket()
    } else {
      alert(data.msg)
    }
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={{margin:0}}>📈 纳斯达克 (NASDAQ)</h2>
          <button onClick={onClose} style={styles.closeBtn}>×</button>
        </div>

        <div style={styles.balance}>
          可用资金: <span style={{color:'#2ecc71', fontFamily:'monospace'}}>${Math.floor(cash).toLocaleString()}</span>
        </div>

        <div style={styles.list}>
          {loading ? <div>连接交易所...</div> : stocks.map(stock => {
            const myStock = portfolio[stock.symbol]
            const holdCount = myStock ? myStock.amount : 0
            const avgCost = myStock ? myStock.average_cost : 0
            // 计算盈亏百分比
            const profitRate = holdCount > 0 ? ((stock.price - avgCost) / avgCost) * 100 : 0
            const isProfit = profitRate >= 0

            return (
              <div key={stock.symbol} style={styles.stockItem}>
                <div style={styles.stockInfo}>
                  <div style={{fontWeight:'bold', fontSize:'16px'}}>{stock.name}</div>
                  <div style={{fontSize:'12px', color:'#999'}}>{stock.symbol}</div>
                  <div style={{
                    fontSize:'20px', fontWeight:'bold', fontFamily:'monospace',
                    color: isProfit ? '#e74c3c' : '#2ecc71' // 红涨绿跌 (符合美股习惯的话是反的，这里按中国习惯：红涨)
                  }}>
                    ${stock.price.toFixed(2)}
                  </div>
                </div>

                <div style={styles.stockAction}>
                  {holdCount > 0 && (
                    <div style={{fontSize:'10px', marginBottom:'5px', textAlign:'right'}}>
                      持仓: {holdCount} | 成本: ${avgCost.toFixed(1)} <br/>
                      盈亏: <span style={{color: isProfit?'#e74c3c':'#2ecc71'}}>{isProfit?'+':''}{profitRate.toFixed(2)}%</span>
                    </div>
                  )}
                  <div style={{display:'flex', gap:'5px'}}>
                    <button onClick={() => handleTrade(stock.symbol, 'buy', 10)} style={styles.btnBuy}>买入10</button>
                    <button onClick={() => handleTrade(stock.symbol, 'sell', 10)} style={styles.btnSell} disabled={holdCount<10}>卖出10</button>
                  </div>
                  <div style={{display:'flex', gap:'5px', marginTop:'2px'}}>
                     <button onClick={() => handleTrade(stock.symbol, 'buy', 100)} style={styles.btnBuySmall}>+100</button>
                     <button onClick={() => handleTrade(stock.symbol, 'sell', 100)} style={styles.btnSellSmall} disabled={holdCount<100}>-100</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        
        <div style={styles.footer}>
          * 市场有风险，投资需谨慎。每5秒刷新一次行情。
        </div>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100
  },
  card: {
    background: '#1e1e1e', color: 'white', padding: '20px', borderRadius: '15px', 
    width: '90%', maxWidth:'450px', maxHeight:'80vh', display:'flex', flexDirection:'column',
    boxShadow: '0 0 20px rgba(0,0,0,0.8)', border: '1px solid #333'
  },
  header: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px', borderBottom:'1px solid #333', paddingBottom:'10px' },
  closeBtn: { background:'none', border:'none', color:'white', fontSize:'24px', cursor:'pointer' },
  balance: { textAlign:'right', marginBottom:'10px', fontSize:'14px', color:'#ccc' },
  list: { overflowY:'auto', flex:1, display:'flex', flexDirection:'column', gap:'10px' },
  stockItem: { 
    background: '#2c2c2c', padding: '15px', borderRadius: '10px', 
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    border: '1px solid #444'
  },
  stockInfo: { display:'flex', flexDirection:'column' },
  stockAction: { display:'flex', flexDirection:'column', alignItems:'flex-end' },
  btnBuy: { background:'#e74c3c', color:'white', border:'none', padding:'6px 12px', borderRadius:'4px', cursor:'pointer', fontWeight:'bold' },
  btnSell: { background:'#2ecc71', color:'white', border:'none', padding:'6px 12px', borderRadius:'4px', cursor:'pointer', fontWeight:'bold' },
  btnBuySmall: { background:'#e74c3c', color:'white', border:'none', padding:'4px 8px', borderRadius:'4px', cursor:'pointer', fontSize:'10px', opacity:0.8 },
  btnSellSmall: { background:'#2ecc71', color:'white', border:'none', padding:'4px 8px', borderRadius:'4px', cursor:'pointer', fontSize:'10px', opacity:0.8 },
  footer: { marginTop:'15px', textAlign:'center', fontSize:'10px', color:'#666' }
}
/* src/StockMarket.jsx */
import React, { useState, useEffect } from 'react'
import { supabase } from './supabase'

export default function StockMarket({ myId, cash, onClose }) {
  const [stocks, setStocks] = useState([])
  const [portfolio, setPortfolio] = useState({})
  const [loading, setLoading] = useState(true)
  
  // 视图状态：'list' = 行情列表, 'trade' = 个股交易页
  const [view, setView] = useState('list')
  const [activeStock, setActiveStock] = useState(null)
  const [tradeAmount, setTradeAmount] = useState('') // 输入的数量

  // 刷新市场
  const refreshMarket = async () => {
    // 模拟市场波动
    await supabase.rpc('update_market')

    const { data: stockData } = await supabase.from('stocks').select('*').order('symbol')
    const { data: myData } = await supabase.from('portfolios').select('*').eq('user_id', myId)
    
    if (stockData) setStocks(stockData)
    if (myData) {
      const portMap = {}
      myData.forEach(p => portMap[p.symbol] = p)
      setPortfolio(portMap)
    }
    setLoading(false)
  }

  useEffect(() => {
    refreshMarket()
    const timer = setInterval(refreshMarket, 5000)
    return () => clearInterval(timer)
  }, [])

  // 进入交易页
  const openTrade = (stock) => {
    setActiveStock(stock)
    setTradeAmount('')
    setView('trade')
  }

  // 执行交易
  const handleTrade = async (action) => {
    const amount = parseInt(tradeAmount)
    if (!amount || amount <= 0) return alert("❌ 请输入有效的数量")

    const { data } = await supabase.rpc('trade_stock', {
      p_user_id: myId,
      p_symbol: activeStock.symbol,
      p_action: action,
      p_count: amount
    })
    
    if (data.status === 'success') {
      if(navigator.vibrate) navigator.vibrate(50)
      alert(`✅ ${action === 'buy' ? '买入' : '卖出'}成功！`)
      refreshMarket()
      setView('list') // 交易完成后返回列表
    } else {
      alert(`❌ 失败: ${data.msg}`)
    }
  }

  // 计算最大可买/可卖
  const getMaxBuy = () => activeStock ? Math.floor(cash / activeStock.price) : 0
  const getMaxSell = () => activeStock && portfolio[activeStock.symbol] ? portfolio[activeStock.symbol].amount : 0

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        
        {/* === 页面 1: 行情列表 === */}
        {view === 'list' && (
          <>
            <div style={styles.header}>
              <h2 style={{margin:0}}>📈 纳斯达克</h2>
              <button onClick={onClose} style={styles.closeBtn}>×</button>
            </div>
            <div style={styles.balance}>
              可用资金: <span style={{color:'#2ecc71', fontFamily:'monospace'}}>${Math.floor(cash).toLocaleString()}</span>
            </div>
            
            <div style={styles.list}>
              {loading ? <div style={{textAlign:'center', padding:'20px'}}>连接交易所...</div> : stocks.map(stock => {
                const myStock = portfolio[stock.symbol]
                const holdCount = myStock ? myStock.amount : 0
                // 涨跌逻辑(模拟)：根据 hash 算个假的涨跌幅展示一下，增加氛围
                const change = (stock.price % 7 - 3).toFixed(2)
                const isUp = change >= 0

                return (
                  <div key={stock.symbol} style={styles.stockItem} onClick={() => openTrade(stock)}>
                    <div>
                      <div style={{fontWeight:'bold'}}>{stock.name}</div>
                      <div style={{fontSize:'10px', color:'#999'}}>{stock.symbol}</div>
                    </div>
                    <div style={{textAlign:'right'}}>
                      <div style={{fontWeight:'bold', fontSize:'16px'}}>${stock.price.toFixed(2)}</div>
                      <div style={{fontSize:'10px', color: isUp?'#e74c3c':'#2ecc71'}}>
                        {isUp ? '+' : ''}{change}%
                      </div>
                    </div>
                    {holdCount > 0 && (
                       <div style={{fontSize:'10px', background:'#34495e', padding:'2px 6px', borderRadius:'4px', marginLeft:'10px'}}>
                         持仓: {holdCount}
                       </div>
                    )}
                    <div style={{fontSize:'20px', color:'#ccc'}}>›</div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* === 页面 2: 交易柜台 === */}
        {view === 'trade' && activeStock && (
          <>
            <div style={styles.header}>
              <button onClick={() => setView('list')} style={styles.backBtn}>← 返回</button>
              <h3 style={{margin:0}}>{activeStock.name} ({activeStock.symbol})</h3>
              <div style={{width:'40px'}}></div>{/* 占位 */}
            </div>

            <div style={styles.tradeContent}>
              {/* 价格大字 */}
              <div style={{textAlign:'center', margin:'20px 0'}}>
                 <div style={{fontSize:'36px', fontWeight:'900', color:'#e74c3c'}}>${activeStock.price.toFixed(2)}</div>
                 <div style={{fontSize:'12px', color:'#999'}}>当前市价</div>
              </div>

              {/* 持仓信息 */}
              <div style={styles.infoRow}>
                 <div>您的持仓: <b>{portfolio[activeStock.symbol]?.amount || 0} 股</b></div>
                 <div>均价: ${portfolio[activeStock.symbol]?.average_cost.toFixed(1) || '0.0'}</div>
              </div>

              {/* 输入区域 */}
              <div style={styles.inputBox}>
                 <label>交易数量</label>
                 <div style={{display:'flex', gap:'10px'}}>
                   <input 
                     type="number" 
                     placeholder="0"
                     value={tradeAmount}
                     onChange={e => setTradeAmount(e.target.value)}
                     style={styles.input}
                   />
                 </div>
                 {/* 快捷按钮 */}
                 <div style={styles.quickRow}>
                   <button style={styles.chip} onClick={() => setTradeAmount(getMaxBuy())}>全仓买入 (Max)</button>
                   <button style={styles.chip} onClick={() => setTradeAmount(getMaxSell())}>清仓卖出 (All)</button>
                 </div>
              </div>

              {/* 预估金额 */}
              <div style={{textAlign:'center', fontSize:'12px', color:'#aaa', margin:'10px 0'}}>
                预估金额: <span style={{color:'white', fontSize:'14px'}}>${(activeStock.price * (parseInt(tradeAmount)||0)).toLocaleString()}</span>
              </div>

              {/* 巨大的操作按钮 */}
              <div style={styles.actionRow}>
                <button style={styles.buyBtnBig} onClick={() => handleTrade('buy')}>
                  买入 (Buy)
                </button>
                <button style={styles.sellBtnBig} onClick={() => handleTrade('sell')}>
                  卖出 (Sell)
                </button>
              </div>

            </div>
          </>
        )}

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
    background: '#1e1e1e', color: 'white', borderRadius: '15px', 
    width: '90%', maxWidth:'400px', height:'80vh', display:'flex', flexDirection:'column',
    boxShadow: '0 0 20px rgba(0,0,0,0.8)', border: '1px solid #333', overflow:'hidden'
  },
  header: { 
    display:'flex', justifyContent:'space-between', alignItems:'center', 
    padding:'15px', background:'#252525', borderBottom:'1px solid #333'
  },
  closeBtn: { background:'none', border:'none', color:'white', fontSize:'24px', cursor:'pointer' },
  backBtn: { background:'none', border:'none', color:'#3498db', fontSize:'14px', cursor:'pointer' },
  balance: { textAlign:'right', padding:'10px 15px', fontSize:'12px', color:'#ccc', background:'#222' },
  list: { overflowY:'auto', flex:1, padding:'10px' },
  
  // 列表项
  stockItem: { 
    background: '#2c2c2c', padding: '15px', borderRadius: '10px', marginBottom:'10px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    border: '1px solid #444', cursor: 'pointer', transition: 'background 0.2s'
  },
  
  // 交易页样式
  tradeContent: { padding:'20px', flex:1, display:'flex', flexDirection:'column' },
  infoRow: { display:'flex', justifyContent:'space-between', fontSize:'12px', color:'#ccc', background:'#333', padding:'10px', borderRadius:'8px', marginBottom:'20px' },
  inputBox: { marginBottom:'10px' },
  input: { 
    width:'100%', padding:'15px', fontSize:'24px', fontWeight:'bold', 
    borderRadius:'8px', border:'1px solid #555', background:'#333', color:'white', textAlign:'center' 
  },
  quickRow: { display:'flex', gap:'10px', marginTop:'10px', justifyContent:'center' },
  chip: { background:'#444', color:'#ccc', border:'1px solid #555', padding:'5px 10px', borderRadius:'15px', fontSize:'12px', cursor:'pointer' },
  
  actionRow: { display:'flex', gap:'15px', marginTop:'auto' },
  buyBtnBig: { flex:1, padding:'15px', background:'#e74c3c', color:'white', border:'none', borderRadius:'10px', fontSize:'18px', fontWeight:'bold', cursor:'pointer' },
  sellBtnBig: { flex:1, padding:'15px', background:'#2ecc71', color:'white', border:'none', borderRadius:'10px', fontSize:'18px', fontWeight:'bold', cursor:'pointer' }
}
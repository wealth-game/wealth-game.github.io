/* src/BankModal.jsx */
import React, { useState } from 'react'

export default function BankModal({ cash, deposit, loan, income, onTransaction, onClose }) {
  const [amount, setAmount] = useState('')

  const DEPOSIT_RATE = 0.5 
  const LOAN_RATE = 5.0    

  // 前端计算信用额度 (与后端逻辑保持一致)
  // 额度 = 基础2000 + (秒收入 * 500)
  const maxLoan = 2000 + (income * 500)
  const remainingLoan = Math.max(0, maxLoan - loan)

  const handleAction = (type) => {
    if (!amount || amount <= 0) return alert("请输入金额")
    onTransaction(type, parseFloat(amount))
    setAmount('')
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
             <span style={{fontSize:'24px'}}>🏦</span>
             <div>
               <h2 style={{margin:0, fontSize:'18px'}}>瑞士联合银行</h2>
               <div style={{fontSize:'10px', color:'#999'}}>VIP 尊享金融服务</div>
             </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>×</button>
        </div>

        <div style={styles.balanceRow}>
          <span>手头现金:</span>
          <span style={{color:'#2ecc71', fontSize:'20px', fontFamily:'monospace'}}>${Math.floor(cash).toLocaleString()}</span>
        </div>

        <div style={styles.grid}>
          {/* 储蓄区 */}
          <div style={styles.panel}>
            <h3 style={{color:'#3498db', margin:'0 0 10px 0', fontSize:'14px'}}>💰 储蓄账户</h3>
            <div style={styles.statLine}>存款: <b>${Math.floor(deposit).toLocaleString()}</b></div>
            <div style={styles.statLine}>利率: <span style={{color:'#2ecc71'}}>+{DEPOSIT_RATE}% / 分</span></div>
            <div style={styles.actions}>
              <button onClick={() => handleAction('deposit')} style={styles.btnBlue}>存入</button>
              <button onClick={() => handleAction('withdraw')} style={styles.btnOutline}>取出</button>
            </div>
          </div>

          {/* 信贷区 */}
          <div style={{...styles.panel, border:'1px solid #e74c3c', background:'#fff5f5'}}>
            <h3 style={{color:'#e74c3c', margin:'0 0 10px 0', fontSize:'14px'}}>💳 信贷杠杆</h3>
            <div style={styles.statLine}>当前负债: <b style={{color:'#c0392b'}}>${Math.floor(loan).toLocaleString()}</b></div>
            
            {/* 额度进度条 */}
            <div style={{margin:'5px 0'}}>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:'10px', color:'#777'}}>
                 <span>已用: {Math.floor((loan/maxLoan)*100)}%</span>
                 <span>额度: ${Math.floor(maxLoan).toLocaleString()}</span>
              </div>
              <div style={{width:'100%', height:'4px', background:'#eee', borderRadius:'2px', marginTop:'2px'}}>
                 <div style={{width:`${Math.min(100, (loan/maxLoan)*100)}%`, height:'100%', background:'#e74c3c', borderRadius:'2px'}}></div>
              </div>
            </div>

            <div style={styles.actions}>
              <button onClick={() => handleAction('borrow')} style={styles.btnRed}>贷款</button>
              <button onClick={() => handleAction('repay')} style={styles.btnOutlineRed}>还款</button>
            </div>
          </div>
        </div>

        {/* 快捷输入区 */}
        <div style={styles.inputArea}>
          <input 
            type="number" 
            placeholder="输入金额..." 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={styles.input}
          />
          <div style={styles.quickBtns}>
            <button onClick={() => setAmount(1000)} style={styles.chip}>$1k</button>
            <button onClick={() => setAmount(10000)} style={styles.chip}>$1w</button>
            <button onClick={() => setAmount(remainingLoan)} style={{...styles.chip, color:'#e74c3c', border:'1px solid #e74c3c'}}>贷满</button>
          </div>
        </div>

      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100
  },
  card: {
    background: 'white', padding: '20px', borderRadius: '15px', width: '90%', maxWidth:'400px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
  },
  header: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px', borderBottom:'1px solid #eee', paddingBottom:'10px' },
  closeBtn: { background:'none', border:'none', fontSize:'24px', cursor:'pointer', padding:'0 10px' },
  balanceRow: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', background:'#f8f9fa', padding:'15px', borderRadius:'10px' },
  grid: { display:'flex', gap:'10px', marginBottom:'20px' },
  panel: { flex:1, background:'#fdfdfd', padding:'10px', borderRadius:'10px', border:'1px solid #eee', display:'flex', flexDirection:'column', gap:'5px' },
  statLine: { fontSize:'12px', color:'#555' },
  actions: { display:'flex', gap:'5px', marginTop:'auto' },
  btnBlue: { flex:1, background:'#3498db', color:'white', border:'none', padding:'8px', borderRadius:'6px', cursor:'pointer', fontSize:'12px', fontWeight:'bold' },
  btnRed: { flex:1, background:'#e74c3c', color:'white', border:'none', padding:'8px', borderRadius:'6px', cursor:'pointer', fontSize:'12px', fontWeight:'bold' },
  btnOutline: { flex:1, background:'white', color:'#333', border:'1px solid #ccc', padding:'8px', borderRadius:'6px', cursor:'pointer', fontSize:'12px' },
  btnOutlineRed: { flex:1, background:'white', color:'#e74c3c', border:'1px solid #e74c3c', padding:'8px', borderRadius:'6px', cursor:'pointer', fontSize:'12px' },
  inputArea: { display:'flex', flexDirection:'column', gap:'10px' },
  input: { padding:'12px', fontSize:'16px', borderRadius:'8px', border:'1px solid #ccc', outline:'none' },
  quickBtns: { display:'flex', gap:'10px' },
  chip: { flex:1, background:'#eee', border:'none', padding:'8px', borderRadius:'8px', fontSize:'12px', cursor:'pointer', fontWeight:'bold' }
}
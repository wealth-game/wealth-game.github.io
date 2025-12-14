/* src/BankModal.jsx */
import React, { useState } from 'react'

export default function BankModal({ cash, deposit, loan, onTransaction, onClose }) {
  const [amount, setAmount] = useState('')

  // 利率配置 (可以在这里调整难度)
  const DEPOSIT_RATE = 0.5 // 存款利率 0.5% / 分钟
  const LOAN_RATE = 5.0    // 贷款利率 5.0% / 分钟 (高利贷！)

  const handleAction = (type) => {
    if (!amount || amount <= 0) return alert("请输入金额")
    onTransaction(type, parseFloat(amount))
    setAmount('')
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2>🏦 中央银行</h2>
          <button onClick={onClose} style={styles.closeBtn}>×</button>
        </div>

        <div style={styles.balanceRow}>
          <span>我的现金:</span>
          <span style={{color:'#2ecc71', fontSize:'18px'}}>${Math.floor(cash).toLocaleString()}</span>
        </div>

        <div style={styles.grid}>
          {/* === 储蓄账户 === */}
          <div style={styles.panel}>
            <h3 style={{color:'#3498db'}}>储蓄账户 (Safe)</h3>
            <div style={styles.stat}>
              <div>当前存款: <span style={{fontWeight:'bold'}}>${Math.floor(deposit).toLocaleString()}</span></div>
              <div style={{fontSize:'12px', color:'#7f8c8d'}}>利率: +{DEPOSIT_RATE}% / 分钟</div>
            </div>
            <div style={styles.actions}>
              <button onClick={() => handleAction('deposit')} style={styles.btnBlue}>存入</button>
              <button onClick={() => handleAction('withdraw')} style={styles.btnOutline}>取出</button>
            </div>
          </div>

          {/* === 信贷账户 === */}
          <div style={{...styles.panel, border:'1px solid #e74c3c'}}>
            <h3 style={{color:'#e74c3c'}}>信贷杠杆 (Risk)</h3>
            <div style={styles.stat}>
              <div>当前负债: <span style={{fontWeight:'bold', color:'#c0392b'}}>${Math.floor(loan).toLocaleString()}</span></div>
              <div style={{fontSize:'12px', color:'#7f8c8d'}}>利率: -{LOAN_RATE}% / 分钟</div>
            </div>
            <div style={styles.actions}>
              <button onClick={() => handleAction('borrow')} style={styles.btnRed}>贷款 (加杠杆)</button>
              <button onClick={() => handleAction('repay')} style={styles.btnOutlineRed}>还款</button>
            </div>
            <div style={{fontSize:'10px', color:'#999', marginTop:'5px'}}>* 额度取决于您的存款证明</div>
          </div>
        </div>

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
            <button onClick={() => setAmount(100000)} style={styles.chip}>$10w</button>
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
  closeBtn: { background:'none', border:'none', fontSize:'24px', cursor:'pointer' },
  balanceRow: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', background:'#f8f9fa', padding:'10px', borderRadius:'8px' },
  grid: { display:'flex', gap:'10px', marginBottom:'20px' },
  panel: { flex:1, background:'#fdfdfd', padding:'10px', borderRadius:'8px', border:'1px solid #eee', display:'flex', flexDirection:'column', gap:'10px' },
  stat: { fontSize:'14px', lineHeight:'1.5' },
  actions: { display:'flex', gap:'5px' },
  btnBlue: { flex:1, background:'#3498db', color:'white', border:'none', padding:'8px', borderRadius:'4px', cursor:'pointer', fontSize:'12px' },
  btnRed: { flex:1, background:'#e74c3c', color:'white', border:'none', padding:'8px', borderRadius:'4px', cursor:'pointer', fontSize:'12px' },
  btnOutline: { flex:1, background:'white', color:'#333', border:'1px solid #ccc', padding:'8px', borderRadius:'4px', cursor:'pointer', fontSize:'12px' },
  btnOutlineRed: { flex:1, background:'white', color:'#e74c3c', border:'1px solid #e74c3c', padding:'8px', borderRadius:'4px', cursor:'pointer', fontSize:'12px' },
  inputArea: { display:'flex', flexDirection:'column', gap:'10px' },
  input: { padding:'12px', fontSize:'16px', borderRadius:'8px', border:'1px solid #ccc', outline:'none' },
  quickBtns: { display:'flex', gap:'10px' },
  chip: { background:'#eee', border:'none', padding:'5px 10px', borderRadius:'15px', fontSize:'12px', cursor:'pointer' }
}
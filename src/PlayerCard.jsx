/* src/PlayerCard.jsx */
import React, { useState } from 'react'

export default function PlayerCard({ targetPlayer, onClose, onTransfer }) {
  const [amount, setAmount] = useState('')

  // 🛡️ 安全检查：如果数据没传过来，不要渲染
  if (!targetPlayer) return null;

  const handleSend = () => {
    if (!amount || amount <= 0) return alert("请输入金额")
    if (!targetPlayer.userId) return alert("❌ 无法获取对方ID") // 防崩
    onTransfer(targetPlayer.userId, parseFloat(amount)) 
  }

  // 安全获取 ID
  const displayId = targetPlayer.userId ? targetPlayer.userId.substr(0,8) : "???";

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.card} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={styles.avatar}>👤</div>
          <div>
            <h3 style={{margin:0}}>{targetPlayer.name || "神秘人"}</h3>
            <div style={{fontSize:'10px', color:'#999'}}>ID: {displayId}...</div>
          </div>
        </div>

        <div style={styles.body}>
          <p style={{fontSize:'12px', color:'#666', lineHeight:'1.5'}}>
            正在与该玩家进行交互。<br/>
            您可以向 TA 发送资金援助。
          </p>
          
          <div style={styles.inputGroup}>
            <span style={{fontSize:'20px'}}>💸</span>
            <input 
              type="number" 
              placeholder="输入金额" 
              value={amount}
              onChange={e => setAmount(e.target.value)}
              style={styles.input}
              autoFocus
            />
          </div>

          <div style={styles.quickBtns}>
            <button onClick={() => setAmount(100)} style={styles.chip}>$100</button>
            <button onClick={() => setAmount(1000)} style={styles.chip}>$1,000</button>
            <button onClick={() => setAmount(10000)} style={styles.chip}>$10k</button>
          </div>
        </div>

        <div style={styles.footer}>
          <button onClick={onClose} style={styles.btnCancel}>取消</button>
          <button onClick={handleSend} style={styles.btnConfirm}>确认转账</button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 60
  },
  card: {
    background: 'white', width: '300px', borderRadius: '16px', overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)', animation: 'popIn 0.2s ease-out'
  },
  header: {
    background: '#f8f9fa', padding: '15px', display: 'flex', gap: '15px', alignItems: 'center', borderBottom: '1px solid #eee'
  },
  avatar: {
    width: '40px', height: '40px', background: '#ddd', borderRadius: '50%', 
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'
  },
  body: { padding: '20px' },
  inputGroup: {
    display: 'flex', alignItems: 'center', gap: '10px', background: '#f0f2f5', 
    padding: '10px', borderRadius: '8px', marginBottom: '10px'
  },
  input: {
    background: 'transparent', border: 'none', outline: 'none', 
    fontSize: '18px', fontWeight: 'bold', width: '100%', color: '#333'
  },
  quickBtns: { display: 'flex', gap: '8px' },
  chip: {
    flex: 1, padding: '5px', border: '1px solid #ddd', background: 'white', 
    borderRadius: '15px', fontSize: '10px', color: '#666', cursor: 'pointer'
  },
  footer: {
    padding: '15px', display: 'flex', gap: '10px'
  },
  btnCancel: {
    flex: 1, padding: '10px', border: 'none', background: '#f1f2f6', color: '#333', 
    borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
  },
  btnConfirm: {
    flex: 2, padding: '10px', border: 'none', background: '#2ecc71', color: 'white', 
    borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
  }
}
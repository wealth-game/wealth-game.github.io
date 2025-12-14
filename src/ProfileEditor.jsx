/* src/ProfileEditor.jsx */
import React, { useState } from 'react'

export default function ProfileEditor({ initialName, initialSkin, onSave, onClose }) {
  const [name, setName] = useState(initialName)
  const [skin, setSkin] = useState({
    head: "#ffccaa", body: "#3498db", legs: "#2c3e50", eyes: "#000000", backpack: "#e74c3c", 
    hair: "#2c3e50", shoes: "#333333",
    ...initialSkin 
  })

  const handleColorChange = (part, color) => {
    setSkin(prev => ({ ...prev, [part]: color }))
  }

  const handleSave = () => {
    onSave(name, skin)
  }

  const ColorInput = ({ label, part }) => (
    <div style={styles.formGroup}>
      <label>{label}</label>
      <input 
        type="color" 
        value={skin[part]} 
        // 关键修复：阻止事件冒泡，防止误触关闭
        onClick={(e) => e.stopPropagation()}
        onChange={e => handleColorChange(part, e.target.value)} 
        style={{cursor:'pointer', width:'40px', height:'30px', border:'none', padding:0}}
      />
    </div>
  )

  return (
    // 点击遮罩层关闭
    <div style={styles.overlay} onClick={onClose}>
      {/* 关键修复：点击卡片内部不关闭 */}
      <div style={styles.card} onClick={(e) => e.stopPropagation()}>
        <h2 style={{marginTop:0}}>🎨 形象定制</h2>
        
        <div style={styles.formGroup}>
          <label>你的名字</label>
          <input 
            style={styles.input} 
            value={name} 
            onChange={e => setName(e.target.value)} 
            maxLength={10}
          />
        </div>

        <div style={styles.preview}>
           <div style={{...styles.colorBlock, background: skin.hair, color:'white'}}>发</div>
           <div style={{...styles.colorBlock, background: skin.head}}>脸</div>
           <div style={{...styles.colorBlock, background: skin.body, color:'white'}}>衣</div>
           <div style={{...styles.colorBlock, background: skin.legs, color:'white'}}>裤</div>
           <div style={{...styles.colorBlock, background: skin.shoes, color:'white'}}>鞋</div>
        </div>

        <div style={styles.scrollArea}>
          <ColorInput label="头发 (Hair)" part="hair" />
          <ColorInput label="肤色 (Skin)" part="head" />
          <ColorInput label="眼睛 (Eyes)" part="eyes" />
          <ColorInput label="上衣 (Top)" part="body" />
          <ColorInput label="裤子 (Pants)" part="legs" />
          <ColorInput label="鞋子 (Shoes)" part="shoes" />
          <ColorInput label="背包 (Pack)" part="backpack" />
        </div>

        <div style={styles.btnGroup}>
          <button onClick={onClose} style={styles.cancelBtn}>取消</button>
          <button onClick={handleSave} style={styles.saveBtn}>保存</button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
    background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100
  },
  card: {
    background: 'white', padding: '20px', borderRadius: '15px', width: '320px', maxHeight:'90vh',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)', display:'flex', flexDirection:'column'
  },
  formGroup: { marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize:'14px' },
  input: { padding: '8px', borderRadius: '5px', border: '1px solid #ccc', width: '150px', fontSize:'16px' },
  preview: { display: 'flex', justifyContent: 'center', gap: '5px', marginBottom: '15px' },
  colorBlock: { width: '30px', height: '30px', borderRadius: '6px', color: 'rgba(0,0,0,0.5)', fontSize: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', border:'1px solid #ddd' },
  scrollArea: { overflowY:'auto', flex:1, paddingRight:'5px', maxHeight:'300px' },
  btnGroup: { display: 'flex', gap: '10px', marginTop: '20px' },
  saveBtn: { flex: 1, padding: '12px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  cancelBtn: { flex: 1, padding: '12px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }
}
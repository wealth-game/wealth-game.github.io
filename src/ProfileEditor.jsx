/* src/ProfileEditor.jsx */
import React, { useState } from 'react'

export default function ProfileEditor({ initialName, initialSkin, onSave, onClose }) {
  const [name, setName] = useState(initialName)
  // 确保 initialSkin 有默认值，防止报错
  const [skin, setSkin] = useState({
    head: "#ffccaa", body: "#3498db", legs: "#2c3e50", eyes: "#000000", backpack: "#e74c3c",
    ...initialSkin 
  })

  const handleColorChange = (part, color) => {
    setSkin(prev => ({ ...prev, [part]: color }))
  }

  const handleSave = () => {
    onSave(name, skin)
  }

  // 颜色选择器组件 (复用代码)
  const ColorInput = ({ label, part }) => (
    <div style={styles.formGroup}>
      <label>{label}</label>
      <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
        <input 
          type="color" 
          value={skin[part]} 
          onChange={e => handleColorChange(part, e.target.value)} 
          style={{cursor:'pointer', width:'40px', height:'30px', border:'none', padding:0}}
        />
      </div>
    </div>
  )

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
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
           {/* 简单的色块预览 */}
           <div style={{...styles.colorBlock, background: skin.head}}>头</div>
           <div style={{...styles.colorBlock, background: skin.eyes, color:'white'}}>眼</div>
           <div style={{...styles.colorBlock, background: skin.body}}>衣</div>
           <div style={{...styles.colorBlock, background: skin.backpack, color:'white'}}>包</div>
           <div style={{...styles.colorBlock, background: skin.legs}}>裤</div>
        </div>

        <div style={styles.scrollArea}>
          <ColorInput label="肤色 (Head)" part="head" />
          <ColorInput label="上衣 (Body)" part="body" />
          <ColorInput label="裤子 (Legs)" part="legs" />
          <ColorInput label="眼睛 (Eyes)" part="eyes" />
          <ColorInput label="书包 (Pack)" part="backpack" />
        </div>

        <div style={styles.btnGroup}>
          <button onClick={onClose} style={styles.cancelBtn}>取消</button>
          <button onClick={handleSave} style={styles.saveBtn}>保存形象</button>
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
  scrollArea: { overflowY:'auto', flex:1, paddingRight:'5px' },
  btnGroup: { display: 'flex', gap: '10px', marginTop: '20px' },
  saveBtn: { flex: 1, padding: '12px', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  cancelBtn: { flex: 1, padding: '12px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }
}
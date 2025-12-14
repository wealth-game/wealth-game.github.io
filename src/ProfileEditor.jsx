/* src/ProfileEditor.jsx */
import React, { useState } from 'react'

// ✅ 修复：把子组件移到外面，防止每次渲染时被销毁重建
const ColorInput = ({ label, value, onChange }) => (
  <div style={styles.formGroup}>
    <label>{label}</label>
    <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
      {/* 显示颜色代码，方便看 */}
      <span style={{fontSize:'10px', color:'#999', fontFamily:'monospace'}}>{value}</span>
      <input 
        type="color" 
        value={value} 
        // 这里的 onChange 直接传出去
        onChange={onChange}
        style={{cursor:'pointer', width:'40px', height:'30px', border:'none', padding:0, background:'none'}}
      />
    </div>
  </div>
)

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

  return (
    // 遮罩层：即使点击这里也不关闭，强制点按钮关闭，防止误触
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

        {/* 预览小人颜色 */}
        <div style={styles.preview}>
           <div style={{...styles.colorBlock, background: skin.hair, color:'white'}}>发</div>
           <div style={{...styles.colorBlock, background: skin.head}}>脸</div>
           <div style={{...styles.colorBlock, background: skin.body, color:'white'}}>衣</div>
           <div style={{...styles.colorBlock, background: skin.legs, color:'white'}}>裤</div>
           <div style={{...styles.colorBlock, background: skin.shoes, color:'white'}}>鞋</div>
        </div>

        {/* 滚动区域 */}
        <div style={styles.scrollArea}>
          {/* ✅ 修复：直接使用外部定义的组件，状态更新时不会丢失焦点 */}
          <ColorInput label="头发 (Hair)" value={skin.hair} onChange={e => handleColorChange('hair', e.target.value)} />
          <ColorInput label="肤色 (Skin)" value={skin.head} onChange={e => handleColorChange('head', e.target.value)} />
          <ColorInput label="眼睛 (Eyes)" value={skin.eyes} onChange={e => handleColorChange('eyes', e.target.value)} />
          <ColorInput label="上衣 (Top)" value={skin.body} onChange={e => handleColorChange('body', e.target.value)} />
          <ColorInput label="裤子 (Pants)" value={skin.legs} onChange={e => handleColorChange('legs', e.target.value)} />
          <ColorInput label="鞋子 (Shoes)" value={skin.shoes} onChange={e => handleColorChange('shoes', e.target.value)} />
          <ColorInput label="背包 (Pack)" value={skin.backpack} onChange={e => handleColorChange('backpack', e.target.value)} />
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
    background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100
  },
  card: {
    background: 'white', padding: '20px', borderRadius: '15px', width: '320px', maxHeight:'90vh',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)', display:'flex', flexDirection:'column'
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
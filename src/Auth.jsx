/* src/Auth.jsx */
import React, { useState } from 'react'
import { supabase } from './supabase'

// 新增 props: onGuestClick
export default function Auth({ onGuestClick }) {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    let error = null
    if (isSignUp) {
      const { error: signUpError } = await supabase.auth.signUp({ email, password })
      error = signUpError
      if (!error) alert("注册成功！请直接登录。")
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      error = signInError
    }
    if (error) alert(error.message)
    setLoading(false)
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>财富流转 3D</h1>
        <p style={styles.subtitle}>{isSignUp ? "创建新角色" : "登录你的商业帝国"}</p>
        
        <form onSubmit={handleAuth} style={styles.form}>
          <input style={styles.input} type="email" placeholder="邮箱" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input style={styles.input} type="password" placeholder="密码" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button style={styles.button} disabled={loading}>{loading ? '连接中...' : (isSignUp ? '注册账号' : '登录游戏')}</button>
        </form>

        {/* --- 新增：游客按钮 --- */}
        <button onClick={onGuestClick} style={styles.guestButton}>
          👀 游客试玩 (仅浏览)
        </button>

        <p style={styles.switch} onClick={() => setIsSignUp(!isSignUp)}>
          {isSignUp ? "已有账号？去登录" : "没有账号？去注册"}
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', fontFamily: 'sans-serif' },
  card: { background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', padding: '40px', borderRadius: '20px', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)', border: '1px solid rgba(255, 255, 255, 0.18)', width: '300px', textAlign: 'center', color: 'white' },
  title: { margin: '0 0 10px 0', fontSize: '24px' },
  subtitle: { margin: '0 0 30px 0', fontSize: '14px', opacity: 0.8 },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  input: { padding: '12px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.2)', color: 'white', outline: 'none' },
  button: { padding: '12px', borderRadius: '8px', border: 'none', background: '#f1c40f', color: '#333', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
  // 游客按钮样式
  guestButton: { padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.5)', background: 'transparent', color: 'white', cursor: 'pointer', marginTop: '10px' },
  switch: { marginTop: '20px', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }
}
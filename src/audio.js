/* src/audio.js - 纯代码生成音效，无需下载文件 */

// 创建音频上下文
const AudioContext = window.AudioContext || window.webkitAudioContext;
let ctx = null;

// 初始化音频引擎 (必须在用户点击后触发)
const initAudio = () => {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
};

export const playSound = (type) => {
  try {
    initAudio(); // 尝试激活
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    // === 🎵 金币声 (Coin) ===
    if (type === 'coin') {
      osc.type = 'sine'; // 正弦波，清脆
      // 频率从 1200Hz 快速升到 2000Hz (叮~)
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(2000, now + 0.1);
      
      // 音量渐隐
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      
      osc.start(now);
      osc.stop(now + 0.3);
    } 
    
    // === 🏗️ 建造声 (Build) ===
    else if (type === 'build') {
      osc.type = 'square'; // 方波，厚重
      // 频率从 150Hz 降到 50Hz (咚!)
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
      
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      
      osc.start(now);
      osc.stop(now + 0.2);
    }

    // === 🖱️ 点击声 (Click) ===
    else if (type === 'click') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
      
      osc.start(now);
      osc.stop(now + 0.05);
    }

  } catch (e) {
    console.error("Audio error:", e);
  }
};
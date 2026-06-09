import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { useEmotionDetection } from './hooks/useEmotionDetection'
import { EMOTION_CONFIG } from './utils/emotionConfig'
import ConsentBanner from './components/ConsentBanner'

const API = 'http://localhost:8000'

const CARDS = [
  { label:'Total Detections', key:'total', color:'#3B82F6', icon:'🎯' },
  { label:'Dominant Emotion', key:'dominant', color:'#8B5CF6', icon:'🧠' },
  { label:'Avg Confidence', key:'avgConf', color:'#10B981', icon:'📊' },
  { label:'Session Duration', key:'duration', color:'#F59E0B', icon:'⏱' },
]

const EMOTION_CONTENT = {
  happy:     { heading:'You look happy!', body:"Great energy! Let's channel this positivity into something amazing.", quote:'"Happiness is not something ready made." — Dalai Lama' },
  sad:       { heading:'Take it easy.',   body:"We're here with you. Take a breath, relax, and know things will get better.", quote:'"Even the darkest night will end." — Victor Hugo' },
  angry:     { heading:'Stay composed.',  body:"Deep breath. A clear, calm mind is your greatest strength right now.", quote:'"For every minute you are angry, you lose sixty seconds of happiness." — Emerson' },
  fearful:   { heading:"You're safe here.", body:"Everything is okay. Take things step by step — you've got this.", quote:'"You gain strength, courage and confidence by every experience." — Eleanor Roosevelt' },
  surprised: { heading:'Something exciting?', body:"Wow! Something definitely caught your attention. Let's explore it!", quote:'"Life is full of surprises and serendipity." — Phil Collins' },
  disgusted: { heading:'Keeping it clean.', body:"Fresh, minimal, and calm — exactly what you need right now.", quote:'"Simplicity is the ultimate sophistication." — Leonardo da Vinci' },
  neutral:   { heading:'Ready to help.',  body:"Focused, professional, and ready for anything that comes your way.", quote:'"The secret of getting ahead is getting started." — Mark Twain' },
}

function StatCard({ label, value, color, icon, index }) {
  return (
    <div className="fade-in" style={{
      background:'var(--card)',border:'1px solid var(--border)',borderRadius:14,
      padding:'18px 20px',animationDelay:`${index*0.06}s`
    }}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
        <span style={{fontSize:11,color:'var(--text3)',fontFamily:"'JetBrains Mono',monospace",textTransform:'uppercase',letterSpacing:'0.08em'}}>{label}</span>
        <span style={{fontSize:18}}>{icon}</span>
      </div>
      <div style={{fontSize:26,fontWeight:800,color,fontFamily:"'JetBrains Mono',monospace",lineHeight:1}}>{value}</div>
    </div>
  )
}

function EmotionBar({ emotion, score, active }) {
  const cfg = EMOTION_CONFIG[emotion] || {}
  const pct = Math.round(score * 100)
  return (
    <div style={{marginBottom:9}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
        <span style={{fontSize:12,color:active?'var(--text)':'var(--text2)',fontWeight:active?600:400,display:'flex',alignItems:'center',gap:5}}>
          <span>{cfg.emoji}</span>{cfg.label}
        </span>
        <span style={{fontSize:11,fontFamily:"'JetBrains Mono',monospace",color:active?cfg.color:'var(--text3)'}}>{pct}%</span>
      </div>
      <div style={{height:5,background:'var(--border)',borderRadius:3,overflow:'hidden'}}>
        <div style={{
          height:'100%',borderRadius:3,
          background:active?cfg.color:'var(--border2)',
          width:`${pct}%`,transition:'width 0.4s ease,background 0.4s ease'
        }}/>
      </div>
    </div>
  )
}

export default function App() {
  const [consented, setConsented] = useState(false)
  const [history, setHistory] = useState([])
  const [aiMessage, setAiMessage] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [stats, setStats] = useState({ total:0, dominant:'—', avgConf:0, duration:0 })
  const [analysisResult, setAnalysisResult] = useState(null)
  const prevEmotionRef = useRef('neutral')
  const startTimeRef = useRef(null)
  const timerRef = useRef(null)
  const confSumRef = useRef(0)
  const countRef = useRef(0)

  const { videoRef, modelsLoaded, loadingModels, emotion, confidence,
    allScores, isDetecting, faceDetected, error, startCamera, stopCamera } = useEmotionDetection()

  const cfg = EMOTION_CONFIG[emotion] || EMOTION_CONFIG.neutral
  const content = EMOTION_CONTENT[emotion] || EMOTION_CONTENT.neutral

  // Apply theme
  useEffect(() => { document.body.className = cfg.theme }, [emotion])

  // Session timer
  useEffect(() => {
    if (isDetecting) {
      startTimeRef.current = Date.now()
      timerRef.current = setInterval(() => {
        const secs = Math.floor((Date.now() - startTimeRef.current) / 1000)
        setStats(s => ({ ...s, duration: secs }))
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => clearInterval(timerRef.current)
  }, [isDetecting])

  // Track stats + history
  useEffect(() => {
    if (!isDetecting || !faceDetected) return
    countRef.current += 1
    confSumRef.current += confidence
    const avg = Math.round(confSumRef.current / countRef.current)
    if (emotion !== prevEmotionRef.current) {
      prevEmotionRef.current = emotion
      const time = new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit', second:'2-digit' })
      setHistory(prev => [...prev.slice(-14), { emotion, confidence, time }])
    }
    // Find dominant
    const freq = {}
    history.forEach(h => { freq[h.emotion] = (freq[h.emotion] || 0) + 1 })
    const dom = Object.entries(freq).sort((a,b) => b[1]-a[1])[0]
    setStats(s => ({ ...s, total: countRef.current, avgConf: avg, dominant: dom ? EMOTION_CONFIG[dom[0]]?.label : '—' }))
  }, [emotion, confidence, faceDetected, isDetecting])

  const handleAnalyze = async () => {
    if (!faceDetected) return
    setAiLoading(true)
    setAnalysisResult(null)
    try {
      const res = await axios.post(`${API}/api/emotion-response`, { emotion, confidence: confidence / 100 })
      setAiMessage(res.data.message)
      setAnalysisResult({ emotion, confidence, message: res.data.message, time: new Date().toLocaleTimeString() })
    } catch {
      setAiMessage(content.body)
      setAnalysisResult({ emotion, confidence, message: content.body, time: new Date().toLocaleTimeString() })
    } finally { setAiLoading(false) }
  }

  const fmtDuration = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  const s = {
    card: { background:'var(--card)', border:'1px solid var(--border)', borderRadius:14 },
    label: { fontSize:10, color:'var(--text3)', fontFamily:"'JetBrains Mono',monospace", textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8, display:'block' }
  }

  return (
    <>
      {!consented && <ConsentBanner onAccept={() => setConsented(true)} />}

      {/* ── NAVBAR ── */}
      <nav style={{ background:'var(--bg2)', borderBottom:'1px solid var(--border)', padding:'0 28px', height:60, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:40 }}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,#3B82F6,#8B5CF6)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:14,color:'#fff',fontFamily:"'JetBrains Mono',monospace"}}>UF</div>
          <div>
            <div style={{color:'var(--text)',fontWeight:700,fontSize:15,lineHeight:1.1}}>Emotion-Driven UI</div>
            <div style={{color:'var(--text3)',fontSize:10,fontFamily:"'JetBrains Mono',monospace",letterSpacing:'0.08em'}}>AI INTERFACE SYSTEM</div>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:20}}>
          {/* Status pill */}
          <div style={{display:'flex',alignItems:'center',gap:7,padding:'5px 14px',background:'var(--card)',border:'1px solid var(--border)',borderRadius:100}}>
            <div style={{width:7,height:7,borderRadius:'50%',background:isDetecting&&faceDetected?'#10b981':isDetecting?'#f59e0b':'var(--border2)',boxShadow:isDetecting&&faceDetected?'0 0 8px #10b981':'none',animation:isDetecting?'pulse-dot 1.5s infinite':'none'}}/>
            <span style={{fontSize:12,color:'var(--text2)'}}>
              {loadingModels?'Loading models…':isDetecting?faceDetected?`Detecting · ${cfg.label}`:'No face detected':'Idle'}
            </span>
          </div>
          {/* Theme pill */}
          <div style={{display:'flex',alignItems:'center',gap:6,padding:'5px 14px',background:cfg.bg,border:`1px solid ${cfg.border}`,borderRadius:100}}>
            <span style={{fontSize:14}}>{cfg.emoji}</span>
            <span style={{fontSize:12,color:cfg.color,fontWeight:600}}>{cfg.label} Mode</span>
          </div>
        </div>
      </nav>

      {/* ── MAIN ── */}
      <div style={{background:'var(--bg)',minHeight:'calc(100vh - 100px)',padding:'24px 28px',transition:'background 0.7s ease'}}>
        <div style={{maxWidth:1280,margin:'0 auto'}}>

          {/* Page title */}
          <div style={{marginBottom:20}}>
            <h1 style={{fontSize:22,fontWeight:800,color:'var(--text)',marginBottom:4}}>Emotion Intelligence Dashboard</h1>
            <p style={{fontSize:13,color:'var(--text2)'}}>Real-time facial emotion detection with adaptive UI · Powered by face-api.js + Groq LLaMA3</p>
          </div>

          {/* ── STAT CARDS ── */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:20}}>
            <StatCard label="Total Detections" value={stats.total} color="#3B82F6" icon="🎯" index={0}/>
            <StatCard label="Dominant Emotion" value={stats.dominant} color="#8B5CF6" icon="🧠" index={1}/>
            <StatCard label="Avg Confidence" value={stats.avgConf+'%'} color="#10B981" icon="📊" index={2}/>
            <StatCard label="Session Duration" value={fmtDuration(stats.duration)} color="#F59E0B" icon="⏱" index={3}/>
          </div>

          {/* ── MAIN GRID ── */}
          <div style={{display:'grid',gridTemplateColumns:'300px 1fr 280px',gap:16,alignItems:'start'}}>

            {/* ── LEFT: Camera panel ── */}
            <div style={{display:'flex',flexDirection:'column',gap:14}}>

              {/* Camera card */}
              <div style={{...s.card,padding:18}}>
                <span style={s.label}>Live Camera</span>
                <div style={{position:'relative',borderRadius:10,overflow:'hidden',background:'#000',aspectRatio:'4/3',marginBottom:14}}>
                  <video ref={videoRef} muted autoPlay playsInline
                    style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}}/>
                  {/* Overlay when not detecting */}
                  {!isDetecting && (
                    <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.7)'}}>
                      <div style={{fontSize:32,marginBottom:8}}>📷</div>
                      <div style={{color:'#94A3B8',fontSize:12,textAlign:'center'}}>Camera inactive</div>
                    </div>
                  )}
                  {/* Face detected badge */}
                  {isDetecting && (
                    <div style={{position:'absolute',top:8,left:8,display:'flex',alignItems:'center',gap:5,background:'rgba(0,0,0,0.7)',borderRadius:100,padding:'4px 10px'}}>
                      <div style={{width:6,height:6,borderRadius:'50%',background:faceDetected?'#10b981':'#f59e0b',boxShadow:faceDetected?'0 0 6px #10b981':'0 0 6px #f59e0b'}}/>
                      <span style={{fontSize:10,color:'#fff',fontFamily:"'JetBrains Mono',monospace"}}>{faceDetected?'Face detected':'Scanning...'}</span>
                    </div>
                  )}
                  {/* Confidence badge */}
                  {isDetecting && faceDetected && (
                    <div style={{position:'absolute',top:8,right:8,background:cfg.bg,border:`1px solid ${cfg.border}`,borderRadius:100,padding:'4px 10px'}}>
                      <span style={{fontSize:11,color:cfg.color,fontWeight:600,fontFamily:"'JetBrains Mono',monospace"}}>{confidence}%</span>
                    </div>
                  )}
                </div>

                {/* Camera controls */}
                <div style={{display:'flex',gap:8}}>
                  {!isDetecting ? (
                    <button onClick={startCamera} disabled={!modelsLoaded}
                      style={{flex:1,background:'var(--accent)',color:'#fff',border:'none',borderRadius:9,padding:'10px',fontSize:13,fontWeight:600,cursor:modelsLoaded?'pointer':'not-allowed',opacity:modelsLoaded?1:0.5,transition:'all 0.2s'}}>
                      {loadingModels?'Loading AI…':'▶ Start Camera'}
                    </button>
                  ) : (
                    <>
                      <button onClick={stopCamera}
                        style={{flex:1,background:'rgba(239,68,68,0.15)',color:'#f87171',border:'1px solid rgba(239,68,68,0.3)',borderRadius:9,padding:'10px',fontSize:13,fontWeight:600,cursor:'pointer'}}>
                        ■ Stop
                      </button>
                      <button onClick={handleAnalyze} disabled={!faceDetected||aiLoading}
                        style={{flex:2,background:faceDetected?'var(--accent)':'var(--border)',color:faceDetected?'#fff':'var(--text3)',border:'none',borderRadius:9,padding:'10px',fontSize:13,fontWeight:600,cursor:faceDetected?'pointer':'not-allowed',transition:'all 0.3s'}}>
                        {aiLoading?'Analyzing…':'🧠 Analyze Emotion'}
                      </button>
                    </>
                  )}
                </div>

                {error && <div style={{marginTop:10,padding:'8px 12px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.25)',borderRadius:8,fontSize:12,color:'#f87171'}}>{error}</div>}
              </div>

              {/* Emotion scores */}
              <div style={{...s.card,padding:18}}>
                <span style={s.label}>Emotion Scores</span>
                {Object.keys(EMOTION_CONFIG).map(e => (
                  <EmotionBar key={e} emotion={e} score={allScores[e]||0} active={e===emotion&&faceDetected} />
                ))}
              </div>
            </div>

            {/* ── CENTER: Main adaptive area ── */}
            <div style={{display:'flex',flexDirection:'column',gap:14}}>

              {/* Emotion display hero */}
              <div style={{...s.card,padding:28,background:`linear-gradient(135deg, var(--card) 0%, var(--card2) 100%)`,borderColor:cfg.border,textAlign:'center',transition:'all 0.6s ease'}}>
                <div style={{fontSize:64,marginBottom:12,lineHeight:1}}>{cfg.emoji}</div>
                <h2 style={{fontSize:28,fontWeight:800,color:'var(--text)',marginBottom:8,transition:'color 0.5s'}}>{content.heading}</h2>
                <p style={{fontSize:14,color:'var(--text2)',lineHeight:1.8,maxWidth:420,margin:'0 auto 20px',transition:'color 0.5s'}}>{content.body}</p>
                <div style={{padding:'12px 20px',background:'var(--accent-glow)',border:`1px solid ${cfg.border}`,borderRadius:10,display:'inline-block',marginBottom:16}}>
                  <p style={{fontSize:13,color:'var(--text2)',fontStyle:'italic'}}>{content.quote}</p>
                </div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
                  <div style={{padding:'5px 16px',background:cfg.bg,border:`1px solid ${cfg.border}`,borderRadius:100}}>
                    <span style={{fontSize:12,color:cfg.color,fontWeight:600}}>{cfg.desc}</span>
                  </div>
                </div>
              </div>

              {/* AI Analysis result */}
              {analysisResult && (
                <div className="fade-in" style={{...s.card,padding:22,borderColor:cfg.border}}>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{width:28,height:28,borderRadius:7,background:'var(--accent-glow)',border:'1px solid var(--border2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>🤖</div>
                      <div>
                        <div style={{fontSize:13,fontWeight:600,color:'var(--text)'}}>AI Analysis Result</div>
                        <div style={{fontSize:10,color:'var(--text3)',fontFamily:"'JetBrains Mono',monospace"}}>{analysisResult.time} · LLaMA3-70B via Groq</div>
                      </div>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:6,padding:'4px 12px',background:cfg.bg,border:`1px solid ${cfg.border}`,borderRadius:100}}>
                      <span style={{fontSize:11,color:cfg.color,fontWeight:600}}>{EMOTION_CONFIG[analysisResult.emotion]?.emoji} {EMOTION_CONFIG[analysisResult.emotion]?.label} · {analysisResult.confidence}%</span>
                    </div>
                  </div>
                  <div style={{padding:'14px 16px',background:'var(--bg2)',borderRadius:10,border:'1px solid var(--border)'}}>
                    <p style={{fontSize:14,color:'var(--text)',lineHeight:1.7}}>{analysisResult.message}</p>
                  </div>
                </div>
              )}

              {/* Quick test buttons */}
              <div style={{...s.card,padding:18}}>
                <span style={s.label}>Quick Theme Test</span>
                <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:6}}>
                  {Object.entries(EMOTION_CONFIG).map(([key,c]) => (
                    <button key={key} onClick={() => document.body.className = c.theme}
                      style={{padding:'8px 4px',borderRadius:8,border:`1px solid var(--border)`,background:'var(--bg2)',color:'var(--text2)',fontSize:10,cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:3,transition:'all 0.2s'}}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor=c.color;e.currentTarget.style.color=c.color}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text2)'}}>
                      <span style={{fontSize:18}}>{c.emoji}</span>
                      <span style={{fontSize:9,fontFamily:"'JetBrains Mono',monospace"}}>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── RIGHT: History + info ── */}
            <div style={{display:'flex',flexDirection:'column',gap:14}}>

              {/* Current emotion detail */}
              <div style={{...s.card,padding:18,borderColor:cfg.border}}>
                <span style={s.label}>Current State</span>
                <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:14}}>
                  <div style={{width:48,height:48,borderRadius:12,background:cfg.bg,border:`1px solid ${cfg.border}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>{cfg.emoji}</div>
                  <div>
                    <div style={{fontSize:18,fontWeight:700,color:'var(--text)'}}>{cfg.label}</div>
                    <div style={{fontSize:11,color:cfg.color,fontFamily:"'JetBrains Mono',monospace"}}>{confidence}% confident</div>
                  </div>
                </div>
                <div style={{height:6,background:'var(--border)',borderRadius:3,overflow:'hidden',marginBottom:8}}>
                  <div style={{height:'100%',borderRadius:3,background:cfg.color,width:`${confidence}%`,transition:'width 0.4s ease'}}/>
                </div>
                <div style={{fontSize:11,color:'var(--text3)'}}>{cfg.desc}</div>
              </div>

              {/* Detection history */}
              <div style={{...s.card,padding:18}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                  <span style={{...s.label,marginBottom:0}}>Detection Log</span>
                  <span style={{fontSize:10,color:'var(--text3)',fontFamily:"'JetBrains Mono',monospace"}}>{history.length} events</span>
                </div>
                {history.length === 0 ? (
                  <div style={{textAlign:'center',padding:'20px 0',color:'var(--text3)',fontSize:12}}>No detections yet.<br/>Start camera to begin.</div>
                ) : (
                  <div style={{display:'flex',flexDirection:'column',gap:5,maxHeight:280,overflowY:'auto'}}>
                    {[...history].reverse().map((h,i) => {
                      const hcfg = EMOTION_CONFIG[h.emotion]||EMOTION_CONFIG.neutral
                      return (
                        <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'7px 10px',background:'var(--bg2)',borderRadius:8,border:'1px solid var(--border)'}}>
                          <div style={{display:'flex',alignItems:'center',gap:7}}>
                            <span style={{fontSize:14}}>{hcfg.emoji}</span>
                            <span style={{fontSize:12,color:'var(--text)',fontWeight:500}}>{hcfg.label}</span>
                          </div>
                          <div style={{textAlign:'right'}}>
                            <div style={{fontSize:11,color:hcfg.color,fontFamily:"'JetBrains Mono',monospace"}}>{h.confidence}%</div>
                            <div style={{fontSize:9,color:'var(--text3)'}}>{h.time}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* System info */}
              <div style={{...s.card,padding:18}}>
                <span style={s.label}>System Info</span>
                {[
                  ['Detection', 'face-api.js'],
                  ['Model', 'TinyFaceDetector'],
                  ['Expressions', 'faceExpressionNet'],
                  ['LLM', 'LLaMA3-70B'],
                  ['Inference', 'Groq API'],
                  ['Processing', 'On-device'],
                ].map(([k,v]) => (
                  <div key={k} style={{display:'flex',justifyContent:'space-between',marginBottom:7}}>
                    <span style={{fontSize:11,color:'var(--text3)'}}>{k}</span>
                    <span style={{fontSize:11,color:'var(--text2)',fontFamily:"'JetBrains Mono',monospace"}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{background:'var(--bg2)',borderTop:'1px solid var(--border)',padding:'16px 28px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:28,height:28,borderRadius:7,background:'linear-gradient(135deg,#3B82F6,#8B5CF6)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:11,color:'#fff',fontFamily:"'JetBrains Mono',monospace"}}>UF</div>
          <span style={{fontSize:12,color:'var(--text2)'}}>Developed by <strong style={{color:'var(--text)'}}>Umar Faraz</strong></span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:16}}>
          <a href="https://github.com/umarfaraz511" target="_blank" rel="noopener noreferrer"
            style={{fontSize:12,color:'var(--text3)',textDecoration:'none',fontFamily:"'JetBrains Mono',monospace",transition:'color 0.2s'}}
            onMouseEnter={e=>e.target.style.color='var(--accent2)'} onMouseLeave={e=>e.target.style.color='var(--text3)'}>
            GitHub
          </a>
          <a href="https://www.linkedin.com/in/umar-faraz-700457280" target="_blank" rel="noopener noreferrer"
            style={{fontSize:12,color:'var(--text3)',textDecoration:'none',fontFamily:"'JetBrains Mono',monospace",transition:'color 0.2s'}}
            onMouseEnter={e=>e.target.style.color='var(--accent2)'} onMouseLeave={e=>e.target.style.color='var(--text3)'}>
            LinkedIn
          </a>
          <span style={{fontSize:11,color:'var(--text3)',fontFamily:"'JetBrains Mono',monospace"}}>Emotion-Driven UI v1.0</span>
        </div>
      </footer>

      <style>{`@keyframes pulse-dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.6)}}`}</style>
    </>
  )
}

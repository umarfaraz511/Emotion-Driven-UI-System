import { EMOTION_CONFIG } from '../utils/emotionConfig'

export default function EmotionHistory({ history }) {
  if (!history.length) return null
  return (
    <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:14,padding:16}}>
      <div style={{fontSize:11,color:'var(--text2)',fontWeight:600,textTransform:'uppercase',
        letterSpacing:'0.08em',marginBottom:12}}>Emotion history</div>
      <div style={{display:'flex',flexDirection:'column',gap:6,maxHeight:180,overflowY:'auto'}}>
        {[...history].reverse().map((h, i) => {
          const cfg = EMOTION_CONFIG[h.emotion] || EMOTION_CONFIG.neutral
          return (
            <div key={i} style={{
              display:'flex',alignItems:'center',justifyContent:'space-between',
              padding:'6px 10px',background:'var(--bg2)',borderRadius:8,
              border:'1px solid var(--border)'
            }}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:16}}>{cfg.emoji}</span>
                <span style={{fontSize:13,color:'var(--text)',fontWeight:500}}>{cfg.label}</span>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:11,color:'var(--accent)',fontFamily:'monospace'}}>{h.confidence}%</span>
                <span style={{fontSize:10,color:'var(--text2)'}}>{h.time}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

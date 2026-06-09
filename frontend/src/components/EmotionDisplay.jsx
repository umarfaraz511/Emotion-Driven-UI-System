import { EMOTION_CONFIG } from '../utils/emotionConfig'

export default function EmotionDisplay({ emotion, confidence, allScores }) {
  const cfg = EMOTION_CONFIG[emotion] || EMOTION_CONFIG.neutral
  const emotions = Object.keys(EMOTION_CONFIG)

  return (
    <div style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:14,padding:20}}>
      <div style={{textAlign:'center',marginBottom:18}}>
        <div style={{fontSize:48,marginBottom:6}}>{cfg.emoji}</div>
        <div style={{
          fontSize:22,fontWeight:700,color:'var(--text)',
          transition:'color 0.5s ease'
        }}>{cfg.label}</div>
        <div style={{fontSize:12,color:'var(--text2)',marginTop:4}}>{cfg.desc}</div>
        <div style={{
          display:'inline-block',marginTop:10,
          background:'var(--accent)',color:'#fff',
          borderRadius:100,padding:'3px 14px',fontSize:13,fontWeight:600
        }}>
          {confidence}% confidence
        </div>
      </div>

      <div style={{fontSize:11,color:'var(--text2)',fontWeight:600,textTransform:'uppercase',
        letterSpacing:'0.08em',marginBottom:10}}>All emotions</div>
      {emotions.map(e => {
        const score = Math.round((allScores[e] || 0) * 100)
        const ecfg = EMOTION_CONFIG[e]
        return (
          <div key={e} style={{marginBottom:8}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
              <span style={{fontSize:12,color:e===emotion?'var(--text)':'var(--text2)',fontWeight:e===emotion?600:400}}>
                {ecfg.emoji} {ecfg.label}
              </span>
              <span style={{fontSize:11,fontFamily:'monospace',color:'var(--text2)'}}>{score}%</span>
            </div>
            <div style={{height:4,background:'var(--border)',borderRadius:2,overflow:'hidden'}}>
              <div style={{
                height:'100%',borderRadius:2,
                background: e===emotion ? 'var(--accent)' : 'var(--border)',
                width:`${score}%`,transition:'width 0.4s ease,background 0.4s ease'
              }}/>
            </div>
          </div>
        )
      })}
    </div>
  )
}

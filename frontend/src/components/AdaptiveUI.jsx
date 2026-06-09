import { EMOTION_CONFIG } from '../utils/emotionConfig'

const CONTENT = {
  happy:     { heading: 'You look happy!', body: "Great energy! Let's make the most of this moment.", cta: 'Explore More' },
  sad:       { heading: 'Take it easy.', body: "We're here with you. Take a breath and relax.", cta: 'Calm Space' },
  angry:     { heading: 'Stay focused.', body: "Deep breath. Clear mind. You have this.", cta: 'Simplify' },
  fearful:   { heading: "You're safe here.", body: "Everything is okay. Take things one step at a time.", cta: 'Feel Secure' },
  surprised: { heading: 'Something exciting?', body: "Wow! Looks like something caught your attention.", cta: 'Discover' },
  disgusted: { heading: 'Keeping it clean.', body: "Fresh, minimal, and calm — just the way you need it.", cta: 'Refresh' },
  neutral:   { heading: 'Ready to help.', body: "Professional, focused, and ready for anything.", cta: 'Get Started' },
}

export default function AdaptiveUI({ emotion, aiMessage }) {
  const cfg = EMOTION_CONFIG[emotion] || EMOTION_CONFIG.neutral
  const content = CONTENT[emotion] || CONTENT.neutral
  return (
    <div style={{
      background:'var(--card)',border:'1px solid var(--border)',
      borderRadius:14,padding:28,textAlign:'center',
      transition:'all 0.6s ease'
    }}>
      <div style={{fontSize:56,marginBottom:12}}>{cfg.emoji}</div>
      <h2 style={{
        fontSize:26,fontWeight:700,color:'var(--text)',
        marginBottom:12,transition:'color 0.5s ease'
      }}>{content.heading}</h2>
      <p style={{
        fontSize:15,color:'var(--text2)',lineHeight:1.7,
        maxWidth:340,margin:'0 auto 20px',transition:'color 0.5s ease'
      }}>
        {aiMessage || content.body}
      </p>
      <button style={{
        background:'var(--accent)',color:'#fff',border:'none',
        borderRadius:10,padding:'11px 28px',fontSize:14,fontWeight:600,
        cursor:'pointer',transition:'background 0.5s ease'
      }}>
        {content.cta}
      </button>
      <div style={{
        marginTop:20,padding:'10px 16px',
        background:'var(--bg2)',borderRadius:8,
        border:'1px solid var(--border)',display:'inline-block'
      }}>
        <span style={{fontSize:12,color:'var(--text2)'}}>Current theme: </span>
        <span style={{fontSize:12,color:'var(--accent)',fontWeight:600}}>
          {cfg.label} mode
        </span>
      </div>
    </div>
  )
}

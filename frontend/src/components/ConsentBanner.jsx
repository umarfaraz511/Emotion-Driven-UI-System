export default function ConsentBanner({ onAccept }) {
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.9)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100,backdropFilter:'blur(4px)'}}>
      <div className="fade-in" style={{background:'var(--card)',border:'1px solid var(--border2)',borderRadius:20,padding:'44px 40px',maxWidth:440,textAlign:'center',boxShadow:'0 24px 80px rgba(0,0,0,0.6)'}}>
        <div style={{width:64,height:64,borderRadius:16,background:'var(--accent-glow)',border:'1px solid var(--border2)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px',fontSize:28}}>📷</div>
        <h2 style={{color:'var(--text)',fontSize:22,fontWeight:700,marginBottom:10}}>Camera Permission</h2>
        <p style={{color:'var(--text2)',fontSize:14,lineHeight:1.8,marginBottom:28}}>
          This app uses your webcam to detect facial emotions and dynamically adapt the UI in real-time.<br/><br/>
          <strong style={{color:'var(--text)'}}>Your privacy is protected</strong> — all processing happens locally in your browser. No video is uploaded or stored.
        </p>
        <button onClick={onAccept} style={{background:'var(--accent)',color:'#fff',border:'none',borderRadius:10,padding:'13px 36px',fontSize:14,fontWeight:600,cursor:'pointer',width:'100%',marginBottom:12}}>
          Allow Camera Access
        </button>
        <p style={{color:'var(--text3)',fontSize:11,fontFamily:"'JetBrains Mono',monospace"}}>Developed by Umar Faraz · All processing is on-device</p>
      </div>
    </div>
  )
}

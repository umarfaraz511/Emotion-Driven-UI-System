export default function WebcamCapture({ videoRef, isDetecting, modelsLoaded, onStart, onStop, error }) {
  return (
    <div style={{
      background:'var(--card)',border:'1px solid var(--border)',
      borderRadius:14,padding:20,textAlign:'center'
    }}>
      <div style={{position:'relative',display:'inline-block'}}>
        <video
          ref={videoRef}
          muted autoPlay playsInline
          style={{
            width:280,height:210,borderRadius:10,objectFit:'cover',
            background:'#000',border:'2px solid var(--border)',display:'block'
          }}
        />
        {isDetecting && (
          <div style={{
            position:'absolute',top:8,right:8,width:10,height:10,
            borderRadius:'50%',background:'#10b981',
            boxShadow:'0 0 8px #10b981',animation:'pulse 1.5s infinite'
          }}/>
        )}
      </div>

      {!modelsLoaded && (
        <p style={{color:'var(--text2)',fontSize:12,marginTop:10}}>Loading AI models...</p>
      )}
      {error && (
        <p style={{color:'#f87171',fontSize:12,marginTop:10}}>{error}</p>
      )}

      <div style={{marginTop:14,display:'flex',gap:10,justifyContent:'center'}}>
        {!isDetecting ? (
          <button onClick={onStart} disabled={!modelsLoaded} style={{
            background:'var(--accent)',color:'#fff',border:'none',
            borderRadius:8,padding:'9px 22px',fontSize:13,fontWeight:600,
            cursor:modelsLoaded?'pointer':'not-allowed',opacity:modelsLoaded?1:0.5
          }}>
            Start Camera
          </button>
        ) : (
          <button onClick={onStop} style={{
            background:'#ef4444',color:'#fff',border:'none',
            borderRadius:8,padding:'9px 22px',fontSize:13,fontWeight:600,cursor:'pointer'
          }}>
            Stop
          </button>
        )}
      </div>
    </div>
  )
}

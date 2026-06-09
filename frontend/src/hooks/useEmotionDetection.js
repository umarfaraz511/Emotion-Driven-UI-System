import { useRef, useState, useEffect, useCallback } from 'react'
import * as faceapi from 'face-api.js'

const MODELS_URL = '/models'
const SMOOTH = 5

export function useEmotionDetection() {
  const videoRef = useRef(null)
  const [modelsLoaded, setModelsLoaded] = useState(false)
  const [loadingModels, setLoadingModels] = useState(true)
  const [emotion, setEmotion] = useState('neutral')
  const [confidence, setConfidence] = useState(0)
  const [allScores, setAllScores] = useState({})
  const [isDetecting, setIsDetecting] = useState(false)
  const [error, setError] = useState(null)
  const [faceDetected, setFaceDetected] = useState(false)
  const historyRef = useRef([])
  const intervalRef = useRef(null)

  useEffect(() => {
    async function load() {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODELS_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODELS_URL),
        ])
        setModelsLoaded(true)
      } catch (e) {
        setError('Could not load AI models. Check /public/models/ folder.')
      } finally {
        setLoadingModels(false)
      }
    }
    load()
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 320, height: 240 } })
      if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play(); setIsDetecting(true) }
    } catch { setError('Camera access denied.') }
  }, [])

  const stopCamera = useCallback(() => {
    videoRef.current?.srcObject?.getTracks().forEach(t => t.stop())
    if (videoRef.current) videoRef.current.srcObject = null
    if (intervalRef.current) clearInterval(intervalRef.current)
    setIsDetecting(false); setFaceDetected(false)
  }, [])

  useEffect(() => {
    if (!modelsLoaded || !isDetecting) return
    intervalRef.current = setInterval(async () => {
      if (!videoRef.current || videoRef.current.paused) return
      try {
        const result = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
          .withFaceExpressions()
        if (result) {
          setFaceDetected(true)
          const { expressions } = result
          setAllScores({ ...expressions })
          historyRef.current.push(expressions)
          if (historyRef.current.length > SMOOTH) historyRef.current.shift()
          const avg = {}
          for (const k of Object.keys(expressions))
            avg[k] = historyRef.current.reduce((s, f) => s + (f[k] || 0), 0) / historyRef.current.length
          const top = Object.entries(avg).sort((a, b) => b[1] - a[1])[0]
          if (top && top[1] > 0.25) { setEmotion(top[0]); setConfidence(Math.round(top[1] * 100)) }
        } else { setFaceDetected(false) }
      } catch {}
    }, 250)
    return () => clearInterval(intervalRef.current)
  }, [modelsLoaded, isDetecting])

  return { videoRef, modelsLoaded, loadingModels, emotion, confidence, allScores, isDetecting, faceDetected, error, startCamera, stopCamera }
}

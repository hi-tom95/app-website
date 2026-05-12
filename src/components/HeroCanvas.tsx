import React, { useEffect, useRef } from 'react'

const FRAME_COUNT = 120
const FRAME_W     = 1920
const FRAME_H     = 1080
const LERP        = 0.12

const isMobileDevice = typeof window !== 'undefined'
  && (window.innerWidth <= 768 || navigator.maxTouchPoints > 1)
const FRAME_STEP    = isMobileDevice ? 2 : 1
const LOGICAL_COUNT = Math.ceil(FRAME_COUNT / FRAME_STEP)

interface Props {
  progressRef: React.RefObject<number>
}

export default function HeroCanvas({ progressRef }: Props) {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const imagesRef  = useRef<HTMLImageElement[]>([])
  const loadedRef  = useRef(false)
  const lerpedRef  = useRef(0)

  // Pre-load frames; on mobile only every other frame to halve RAM usage
  useEffect(() => {
    let count = 0
    imagesRef.current = Array.from({ length: LOGICAL_COUNT }, (_, i) => {
      const frameNum = i * FRAME_STEP + 1
      const img = new Image()
      img.onload = () => { if (++count === LOGICAL_COUNT) loadedRef.current = true }
      img.src = `/frames/frame_${String(frameNum).padStart(3, '0')}.webp`
      return img
    })
  }, [])

  // rAF draw loop: lerp progress → frame index → canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    let rafId: number
    let lastFrame = -1

    const draw = () => {
      const target  = progressRef.current
      const current = lerpedRef.current
      lerpedRef.current = current + (target - current) * LERP

      if (loadedRef.current) {
        const frameIdx = Math.min(
          Math.floor(lerpedRef.current * LOGICAL_COUNT),
          LOGICAL_COUNT - 1
        )
        if (frameIdx !== lastFrame) {
          const img = imagesRef.current[frameIdx]
          if (img?.complete) {
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
            lastFrame = frameIdx
          }
        }
      }

      rafId = requestAnimationFrame(draw)
    }
    rafId = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafId)
  }, [progressRef])

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label="Interactive preview of a location-aware mobile audio guide"
      width={FRAME_W}
      height={FRAME_H}
      className="h-[65vh] w-auto max-w-none mb-[-72px] pointer-events-none"
    />
  )
}

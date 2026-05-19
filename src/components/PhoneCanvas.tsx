import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'

const FRAME_COUNT  = 179
const FRAME_OFFSET = 1
const FRAME_W      = 603
const FRAME_H      = 1310
const LERP         = 0.12

// On phones (≤430px), load every other frame to halve RAM usage (122 instead of 244 images)
const isMobileDevice = typeof window !== 'undefined' && window.innerWidth <= 768
const FRAME_STEP    = isMobileDevice ? 2 : 1
const LOGICAL_COUNT = Math.ceil(FRAME_COUNT / FRAME_STEP)

interface Props {
  progressRef: RefObject<number>
}

export default function PhoneCanvas({ progressRef }: Props) {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const imagesRef  = useRef<HTMLImageElement[]>([])
  const loadedRef  = useRef(false)
  const lerpedRef  = useRef(0)

  useEffect(() => {
    let count = 0
    imagesRef.current = Array.from({ length: LOGICAL_COUNT }, (_, i) => {
      const frameNum = i * FRAME_STEP + FRAME_OFFSET
      const img = new Image()
      img.onload = () => {
        if (i === 0) {
          const canvas = canvasRef.current
          const ctx = canvas?.getContext('2d')
          if (canvas && ctx) ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        }
        if (++count === LOGICAL_COUNT) loadedRef.current = true
      }
      img.src = `/frames_phone/phone_${String(frameNum).padStart(3, '0')}.webp`
      return img
    })
  }, [])

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
      id="phone-canvas"
      role="img"
      aria-label="Interactive preview of a location-aware mobile audio guide"
      width={FRAME_W}
      height={FRAME_H}
      className="h-full w-auto pointer-events-none"
    />
  )
}

/**
 * HeroScrollyteller
 *
 * Phase 1  (0–200vh)      — gradient sky, midground blur, person animation, particles
 * Phase 2  (200–400vh)    — mission cards orbit around the person (×5 on mobile)
 * Phase 3  (rest)         — phone slides up, 256-frame scrub, footer slides in
 *
 * Desktop: section h-[1300vh], pinned for 1200vh (scrub=1).
 * Mobile:  section overridden to 4000vh, pinned for 3900vh (scrub=5).
 */

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  BuildingsIcon    as Buildings,
  WaveTriangleIcon as WaveTriangle,
  ClockIcon        as Clock,
  SparkleIcon      as Sparkle,
  MapPinIcon       as MapPin,
  HeadphonesIcon   as Headphones,
} from '@phosphor-icons/react'
import HeroCanvas from './HeroCanvas'
import PhoneCanvas from './PhoneCanvas'

gsap.registerPlugin(ScrollTrigger)

interface Star {
  x:           number
  baseY:       number
  targetY:     number
  driftSpeedX: number
  driftSpeedY: number
  amplitudeX:  number
  amplitudeY:  number
  phaseX:      number
  phaseY:      number
}

const STAR_COUNT      = 10
const STAR_RADIUS     = 6
const STAR_LERP       = 0.08
const PARTICLE_OFFSET = 0.12

const SKY_TOP    = '#E6E6E8'
const SKY_BOTTOM = '#FF591D'

// Gradient mode — C is the final version. Override via ?mode=A or ?mode=B in the URL.
const _rawMode     = new URLSearchParams(window.location.search).get('mode')
const GRADIENT_MODE: 'A' | 'B' | 'C' = _rawMode === 'A' ? 'A' : _rawMode === 'B' ? 'B' : 'C'


export default function HeroScrollyteller() {
  const sectionRef         = useRef<HTMLElement>(null)
  const pinnedRef          = useRef<HTMLDivElement>(null)
  const skyRef             = useRef<HTMLDivElement>(null)
  const midgroundRef       = useRef<HTMLDivElement>(null)
  const canvasRef          = useRef<HTMLCanvasElement>(null)
  const starsRef           = useRef<Star[]>([])
  const rafStarRef         = useRef<number>(0)
  const targetProgressRef  = useRef<number>(0)
  const lerpedStarRef      = useRef<number>(0)
  const card1Ref           = useRef<HTMLDivElement>(null)
  const card2Ref           = useRef<HTMLDivElement>(null)
  const card3Ref           = useRef<HTMLDivElement>(null)
  const card4Ref           = useRef<HTMLDivElement>(null)
  const mockupRef          = useRef<HTMLDivElement>(null)
  const personContainerRef = useRef<HTMLDivElement>(null)
  const phoneProgressRef   = useRef<number>(0)
  const headline1Ref       = useRef<HTMLHeadingElement>(null)
  const headline2Ref       = useRef<HTMLHeadingElement>(null)
  const headline3Ref       = useRef<HTMLHeadingElement>(null)
  const card1P2Ref         = useRef<HTMLDivElement>(null)
  const card2P2Ref         = useRef<HTMLDivElement>(null)
  const card3P2Ref         = useRef<HTMLDivElement>(null)
  const card4P2Ref         = useRef<HTMLDivElement>(null)
  const card1P3Ref         = useRef<HTMLDivElement>(null)
  const card2P3Ref         = useRef<HTMLDivElement>(null)
  const card3P3Ref         = useRef<HTMLDivElement>(null)
  const card4P3Ref         = useRef<HTMLDivElement>(null)
  const footerRef          = useRef<HTMLDivElement>(null)
  const cardLayerRef       = useRef<HTMLDivElement>(null)

  // ── Particles ───────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const init = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width        = window.innerWidth  * dpr
      canvas.height       = window.innerHeight * dpr
      canvas.style.width  = window.innerWidth  + 'px'
      canvas.style.height = window.innerHeight + 'px'
      ctx.resetTransform()
      ctx.scale(dpr, dpr)

      starsRef.current = Array.from({ length: STAR_COUNT }, (_, i) => {
        const colW    = window.innerWidth / STAR_COUNT
        const x       = colW * (i + 0.1 + Math.random() * 0.8)
        const targetY = window.innerHeight * 0.5 + 160 + (Math.random() - 0.5) * 40
        const baseY   = window.innerHeight + 30 + (i / (STAR_COUNT - 1)) * 120
        return {
          x, baseY, targetY,
          driftSpeedX: 0.30 + Math.random() * 0.50,
          driftSpeedY: 0.25 + Math.random() * 0.45,
          amplitudeX:  5    + Math.random() * 5,
          amplitudeY:  5    + Math.random() * 5,
          phaseX:      Math.random() * Math.PI * 2,
          phaseY:      Math.random() * Math.PI * 2,
        }
      })
    }

    let prevRawTarget = 0

    const tick = (timestamp: number) => {
      const time      = timestamp * 0.001
      const rawTarget = targetProgressRef.current
      const goingDown = rawTarget >= prevRawTarget
      prevRawTarget   = rawTarget

      const normalizedT = Math.max(0, Math.min(1,
        (rawTarget - PARTICLE_OFFSET) / (1 - PARTICLE_OFFSET)
      ))
      const lerpRate    = goingDown ? STAR_LERP : STAR_LERP * 2

      const c = lerpedStarRef.current
      lerpedStarRef.current = c + (normalizedT - c) * lerpRate

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      const rawProgress   = Math.min(lerpedStarRef.current * 1.6, 1)
      const easedProgress = rawProgress * (2 - rawProgress)

      ctx.fillStyle = SKY_BOTTOM

      for (const star of starsRef.current) {
        const scrollY = star.baseY - easedProgress * (star.baseY - star.targetY)
        if (scrollY - STAR_RADIUS > window.innerHeight) continue

        const floatX = Math.cos(time * star.driftSpeedX + star.phaseX) * star.amplitudeX
        const floatY = Math.sin(time * star.driftSpeedY + star.phaseY) * star.amplitudeY

        ctx.beginPath()
        ctx.arc(star.x + floatX, scrollY + floatY, STAR_RADIUS, 0, Math.PI * 2)
        ctx.fill()
      }

      rafStarRef.current = requestAnimationFrame(tick)
    }

    window.addEventListener('resize', init)
    init()
    rafStarRef.current = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('resize', init)
      cancelAnimationFrame(rafStarRef.current)
    }
  }, [])

  // ── GSAP: pin + gradient + blur + orbit cards + Phase 3 ─────────────────
  useEffect(() => {
    let ctx: gsap.Context | null = null
    let resizeTimer: ReturnType<typeof setTimeout>

    const resetStyles = () => {
      const allCards = [card1Ref, card2Ref, card3Ref, card4Ref].map(r => r.current)
      const allP2    = [card1P2Ref, card2P2Ref, card3P2Ref, card4P2Ref].map(r => r.current)
      const allP3    = [card1P3Ref, card2P3Ref, card3P3Ref, card4P3Ref].map(r => r.current)
      allCards.forEach(c => { if (c) { c.style.transform = ''; c.style.opacity = ''; c.style.height = '' } })
      allP2.forEach(el => { if (el) el.style.opacity = '' })
      allP3.forEach(el => { if (el) el.style.opacity = '' })
      if (mockupRef.current)          { mockupRef.current.style.transform            = '' }
      if (personContainerRef.current) { personContainerRef.current.style.opacity     = ''; personContainerRef.current.style.transform = '' }
      if (footerRef.current)          { footerRef.current.style.transform            = 'translateY(100%)' }
      if (headline1Ref.current)       { headline1Ref.current.style.opacity           = '' }
      if (headline2Ref.current)       { headline2Ref.current.style.opacity           = '' }
      if (headline3Ref.current)       { headline3Ref.current.style.opacity           = '' }
      if (cardLayerRef.current)       { cardLayerRef.current.style.zIndex            = '' }
      if (skyRef.current)             { skyRef.current.style.transform               = '' }
      if (midgroundRef.current)       { midgroundRef.current.style.filter            = '' }
      if (sectionRef.current)         { sectionRef.current.style.height              = '' }
    }

    const init = () => {
      if (ctx) { ctx.revert(); ctx = null }
      resetStyles()

    const section   = sectionRef.current
    const pinned    = pinnedRef.current
    const sky       = skyRef.current
    const midground = midgroundRef.current
    const mockup    = mockupRef.current
    if (!section || !pinned || !sky || !midground || !mockup) return

    const isMobile = window.innerWidth <= 768
    const mobilePhase2Extra = isMobile ? window.innerHeight * 2 : 0

    if (isMobile) section.style.height = '3000vh'

    const PHASE1_PX = window.innerHeight * 2
    const PHASE2_PX = window.innerHeight * 2

    ctx = gsap.context(() => {

    // ── Pin: hero stays fixed (2990 vh on mobile, 1200 vh on desktop) ────
    ScrollTrigger.create({
      trigger: section,
      start:   'top top',
      end:     isMobile ? '+=2990%' : '+=1200%',
      pin:     pinned,
      onUpdate: (self) => {
        // Person animation spans Phase 1 (200 vh). Scale so progress hits 1 exactly at Phase 1 end.
        // mobile phaseScale = pin_vh / phase1_vh = 2990 / 200 = 14.95 → 15
        const phaseScale = isMobile ? 15 : 6
        targetProgressRef.current = Math.min(self.progress * phaseScale, 1)
      },
    })

    // ── Gradient ──────────────────────────────────────────────────────────
    // Option A: gradient animates in Phase 1 only (original behaviour)
    // Option B: flat RGB blend from #E6E6E8 → #FF591D, starts at scroll 0,
    //           ends exactly when phone settles — no easing, pure linear rate.
    if (GRADIENT_MODE === 'A') {
      const gradState = { whiteStop: 50, orangeStop: 100 }
      gsap.to(gradState, {
        whiteStop:  28,
        orangeStop: 90,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start:   'top top',
          end:     '+=' + PHASE1_PX,
          scrub:   1,
        },
        onUpdate() {
          const mid = Math.round((gradState.whiteStop + gradState.orangeStop) / 2)
          sky.style.background =
            `linear-gradient(to bottom, ${SKY_TOP} 0%, ${SKY_TOP} ${gradState.whiteStop}%, #FEAA8C ${mid}%, ${SKY_BOTTOM} ${gradState.orangeStop}%)`
        },
      })
    } else if (GRADIENT_MODE === 'B') {
      // End point = Phase 1 + Phase 2 + first step of Phase 3 timeline (1/11 of Phase 3 scroll)
      const TOTAL_PIN_PX  = window.innerHeight * 12   // matches "+=1200%"
      const PHASE3_PX     = TOTAL_PIN_PX - PHASE1_PX - PHASE2_PX
      const GRAD_B_END_PX = PHASE1_PX + PHASE2_PX + PHASE3_PX / 11

      sky.style.background = SKY_TOP  // clear gradient — start as flat gray

      const gradBState = { p: 0 }
      gsap.to(gradBState, {
        p:    1,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start:   'top top',
          end:     `+=${GRAD_B_END_PX}`,
          scrub:   1,
        },
        onUpdate() {
          const t = gradBState.p
          // Direct linear RGB interpolation: #E6E6E8 (230,230,232) → #FF591D (255,89,29)
          const r = Math.round(230 + (255 - 230) * t)
          const g = Math.round(230 + (89  - 230) * t)
          const b = Math.round(232 + (29  - 232) * t)
          sky.style.background = `rgb(${r},${g},${b})`
        },
      })
    } else {
      // Mode C: 300vh gradient stick (gray top → orange bottom) slides upward.
      //
      // Stick layout (300vh):
      //   0–100vh  = solid #E6E6E8  (gray)
      //   100–200vh = gradient transition
      //   200–300vh = solid #FF591D  (orange)
      //
      // At scroll=0   → stick at translateY(0)     → viewport sees 0–100vh   = solid gray
      // At scroll=end → stick at translateY(-200vh) → viewport sees 200–300vh = solid orange
      //
      // The stick travels exactly 2×viewport-height upward. The center of the transition
      // zone (150vh into the stick) is at the viewport center at the halfway point.
      const TOTAL_PIN_PX  = window.innerHeight * 12
      const PHASE3_PX     = TOTAL_PIN_PX - PHASE1_PX - PHASE2_PX
      const GRAD_C_END_PX = PHASE1_PX + PHASE2_PX + PHASE3_PX / 11

      const gradCState = { y: 0 }
      gsap.to(gradCState, {
        y:    -window.innerHeight * 2,   // slide stick up by 200vh
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start:   'top top',
          end:     `+=${GRAD_C_END_PX}`,
          scrub:   1,
        },
        onUpdate() {
          sky.style.transform = `translateY(${Math.round(gradCState.y)}px)`
        },
      })
    }

    // ── Midground blur (Phase 1 only) ───────────────────────────────────
    gsap.fromTo(
      midground,
      { filter: 'blur(30px)' },
      {
        filter: 'blur(15px)',
        ease:   'none',
        scrollTrigger: {
          trigger: section,
          start:   'top top',
          end:     '+=' + PHASE1_PX,
          scrub:   1,
        },
      }
    )

    // ── Orbit cards (Phase 2: 200–400vh) ───────────────────────────────
    const cards = [card1Ref.current, card2Ref.current, card3Ref.current, card4Ref.current]

    // Returns 4 {x, y} centres for a centred vertical stack (used in Phase 2 + Phase 3 mobile)
    const getMobileCardStack = (heights: number[]) => {
      const cx  = window.innerWidth / 2
      const gap = 12
      // 16px gap below headline (headline bottom ≈ 25vh)
      let y = window.innerHeight * 0.25 + 16
      return heights.map((h) => {
        const pos = { x: cx, y: y + h / 2 }
        y += h + gap
        return pos
      })
    }

    // On mobile, raise the card layer above the person so cards appear in front
    if (isMobile && cardLayerRef.current) cardLayerRef.current.style.zIndex = '25'

    // When > 0, Phase 3 owns card positions — Phase 2 must not overwrite.
    let phase3SlideP = 0

    const orbitState = { progress: 0 }

    gsap.to(orbitState, {
      progress: 1,
      ease:     'none',
      scrollTrigger: {
        trigger: section,
        start:   () => section.offsetTop + PHASE1_PX,
        end:     () => section.offsetTop + PHASE1_PX + PHASE2_PX + mobilePhase2Extra,
        scrub:   1,
        onLeaveBack() {
          // Snap cards hidden immediately — scrub lag would otherwise leave them visible
          cards.forEach(card => {
            if (!card) return
            card.style.opacity   = '0'
            card.style.transform = ''
            card.style.height    = ''
          })
        },
      },
      onUpdate() {
        const op = orbitState.progress

        const liftProgress = Math.min(op / 0.30, 1)
        const liftEased    = 1 - Math.pow(1 - liftProgress, 3)
        const orbitLift    = 240 * (1 - liftEased)

        const cx = window.innerWidth  / 2 - 40
        const cy = window.innerHeight / 2 + 160 + orbitLift
        const rx = 360
        const ry = 240

        const startAngle = Math.PI / 2
        const finalAngles = [
          -Math.PI * 2  / 3,
          -Math.PI * 13 / 36,
          -Math.PI / 18,
           Math.PI / 6,
        ]

        // Mobile: compute vertical stack targets once outside the loop
        const mobileStackTargets = isMobile
          ? getMobileCardStack(cards.map(c => c?.offsetHeight ?? 80))
          : null

        cards.forEach((card, i) => {
          if (!card) return
          if (phase3SlideP > 0) return   // Phase 3 owns cards — do not overwrite

          const delay    = i * 0.08
          const flyRaw   = Math.min(Math.max((op - delay) / 0.70, 0), 1)
          const flyEased = 1 - Math.pow(1 - flyRaw, 3)
          const scale    = 0.5 + flyEased * 0.5

          card.style.opacity = flyRaw > 0 ? '1' : '0'

          if (isMobile && mobileStackTargets) {
            // Fly cards up from below the screen to a centred vertical stack
            const tp     = mobileStackTargets[i]
            const startY = window.innerHeight + 60
            const y      = startY + flyEased * (tp.y - startY)
            card.style.transform =
              `translate(calc(${Math.round(tp.x)}px - 50%), calc(${Math.round(y)}px - 50%)) scale(${scale.toFixed(3)})`
          } else {
            const angle = startAngle + flyEased * (finalAngles[i] - startAngle)
            const x     = cx + Math.cos(angle) * rx
            const y     = cy + Math.sin(angle) * ry
            card.style.transform =
              `translate(calc(${Math.round(x)}px - 50%), calc(${Math.round(y)}px - 50%)) scale(${scale.toFixed(3)})`
          }
        })
      },
    })

    // ── Phase 3 card target positions ──────────────────────────────────
    // Horizon line = vertical centre of the phone = mockupCY.
    // Top cards (i=0,2): bottom edge locked at horizon − 6px.
    // Bottom cards (i=1,3): top edge locked at horizon + 6px.
    // yOffset shifts the horizon up (e.g. when footer slides in).
    const getPhase3Targets = (yOffset = 0) => {
      const mockupW  = mockup.offsetWidth || 280
      const mockupCX = window.innerWidth  / 2
      const mockupCY = window.innerHeight * 0.875 - 210 - yOffset

      if (isMobile) {
        // Centred vertical stack — same positions used in Phase 2 and Phase 3
        return getMobileCardStack(cards.map(c => c?.offsetHeight ?? 100))
      }

      const sideGap  = 32
      const cardW    = 240

      const leftX  = mockupCX - mockupW / 2 - sideGap - cardW / 2
      const rightX = mockupCX + mockupW / 2 + sideGap + cardW / 2

      return cards.map((card, i) => {
        const h     = card?.offsetHeight ?? 100
        const isTop = i === 0 || i === 2
        const x     = i < 2 ? leftX : rightX
        const y     = isTop
          ? mockupCY - 6 - h / 2
          : mockupCY + 6 + h / 2
        return { x, y }
      })
    }

    // ── Phase 3 timeline ────────────────────────────────────────────────
    const mockupInitialY = window.innerHeight
    mockup.style.transform = `translateY(${mockupInitialY}px)`

    const slideState  = { p: 0 }
    const frameState  = { p: 0 }
    const footerState = { p: 0 }
    const phase3TL = gsap.timeline()

    // Capture content layer refs once (DOM is stable by the time this effect runs)
    const p2ContentRefs = [card1P2Ref.current, card2P2Ref.current, card3P2Ref.current, card4P2Ref.current]
    const p3ContentRefs = [card1P3Ref.current, card2P3Ref.current, card3P3Ref.current, card4P3Ref.current]

    // Measure natural card heights: P2 sets height during orbit, P3 sets height when docked
    // Measure card heights. Re-measure after fonts load to avoid wrong heights
    // when the web font (Inter) hasn't swapped in yet on first page load.
    let p2Heights = cards.map(card => card?.offsetHeight ?? 0)
    let p3Heights = p3ContentRefs.map(ref => ref?.offsetHeight ?? 0)
    document.fonts.ready.then(() => {
      p2Heights = cards.map(card => card?.offsetHeight ?? 0)
      p3Heights = p3ContentRefs.map(ref => ref?.offsetHeight ?? 0)
    })

    const FOOTER_YOFFSET = Math.max(0, Math.round(0.25 * window.innerHeight - 210))

    // Desktop stays at the original 1+8+2 = 11 unit layout — completely unchanged.
    // Mobile: step 2 is longer (more scroll for the phone sequence); step 1 + step 3 are kept short.
    const step1Dur = isMobile ? 0.6 : 1   // mobile: shorter scroll window for this transition
    const step2Dur = isMobile ? 7  : 8   // mobile: reduced scroll distance for step 2
    const step3Dur = isMobile ? 0.5 : 2  // mobile: quick footer slide
    const step3Pos = step1Dur + step2Dur  // mobile: 7.6 | desktop: 9

    // Step 1 — headline + card content cross-fade; desktop: phone slides up (duration: step1Dur)
    phase3TL.to(slideState, {
      p: 1, duration: step1Dur, ease: 'none',
      onUpdate() {
        phase3SlideP = slideState.p
        // On mobile compress transitions into first half of step 1 for snappier feel
        const rawP     = isMobile ? Math.min(slideState.p * 2, 1) : slideState.p
        const flyEased = 1 - Math.pow(1 - rawP, 3)

        // Phone slides in on desktop only — on mobile it enters later in step 2
        if (!isMobile) {
          mockup.style.transform = `translateY(${Math.round((1 - flyEased) * mockupInitialY)}px)`
        }

        if (personContainerRef.current) {
          personContainerRef.current.style.opacity   = (1 - flyEased).toFixed(3)
          personContainerRef.current.style.transform = `translateY(${Math.round(flyEased * 160)}px)`
        }

        // Headline cross-fade — faster on mobile (completes at 25% of step 1)
        const headlineP     = Math.min(slideState.p * (isMobile ? 4 : 2.5), 1)
        const headlineEased = 1 - Math.pow(1 - headlineP, 3)
        if (headline1Ref.current) headline1Ref.current.style.opacity = (1 - headlineEased).toFixed(3)
        if (headline2Ref.current) headline2Ref.current.style.opacity = headlineEased.toFixed(3)

        // Card content cross-fade
        p2ContentRefs.forEach(el => { if (el) el.style.opacity = (1 - flyEased).toFixed(3) })
        p3ContentRefs.forEach(el => { if (el) el.style.opacity = flyEased.toFixed(3) })

        // Card height interpolation (P2 height → P3 height, before position calc reads offsetHeight)
        cards.forEach((card, i) => {
          if (!card) return
          card.style.height = `${Math.round(p2Heights[i] + flyEased * (p3Heights[i] - p2Heights[i]))}px`
        })

        if (isMobile) {
          // Cards stay in the vertical stack; recompute positions as heights animate
          const currentH      = cards.map((_, i) => Math.round(p2Heights[i] + flyEased * (p3Heights[i] - p2Heights[i])))
          const mobileTargets = getMobileCardStack(currentH)
          cards.forEach((card, i) => {
            if (!card) return
            const tp = mobileTargets[i]
            card.style.transform =
              `translate(calc(${Math.round(tp.x)}px - 50%), calc(${Math.round(tp.y)}px - 50%)) scale(1)`
          })
        } else {
          // Desktop: interpolate from orbit positions to dock positions
          const targets     = getPhase3Targets()
          const orbitCX     = window.innerWidth  / 2 - 40
          const orbitCY     = window.innerHeight / 2 + 160
          const orbitAngles = [-Math.PI * 2/3, -Math.PI * 13/36, -Math.PI/18, Math.PI/6]
          cards.forEach((card, i) => {
            if (!card) return
            card.style.opacity = '1'
            const orbitX = orbitCX + Math.cos(orbitAngles[i]) * 360
            const orbitY = orbitCY + Math.sin(orbitAngles[i]) * 240
            const tp = targets[i]
            const x  = orbitX + flyEased * (tp.x - orbitX)
            const y  = orbitY + flyEased * (tp.y - orbitY)
            card.style.transform =
              `translate(calc(${Math.round(x)}px - 50%), calc(${Math.round(y)}px - 50%)) scale(1)`
          })
        }
      },
    }, 0)

    // Step 2 — canvas scrub + (on mobile) cards fade then phone rises
    phase3TL.to(frameState, {
      p: 1, duration: step2Dur, ease: 'none',
      onUpdate() {
        phase3SlideP = 1

        if (isMobile) {
          const p = frameState.p

          // 0–5 %: hold — cards with P3 content visible, user can read
          // 5–17 %: cards slide down and fade out
          const cardFadeRaw   = Math.min(Math.max((p - 0.05) / 0.12, 0), 1)
          const cardFadeEased = 1 - Math.pow(1 - cardFadeRaw, 4)
          const mobileBasePos = getMobileCardStack(p3Heights)
          cards.forEach((card, i) => {
            if (!card) return
            card.style.height  = `${p3Heights[i]}px`
            card.style.opacity = (1 - cardFadeEased).toFixed(3)
            const tp     = mobileBasePos[i]
            const slideY = Math.round(cardFadeEased * 160)
            card.style.transform =
              `translate(calc(${Math.round(tp.x)}px - 50%), calc(${Math.round(tp.y + slideY)}px - 50%)) scale(1)`
          })

          // Drop card layer at start of card fade so phone appears in front when it enters at 7%
          if (cardLayerRef.current) {
            cardLayerRef.current.style.zIndex = p >= 0.05 ? '15' : '25'
          }

          // Phone slides up 7–17 % — starts while cards still fading
          const phoneFlyRaw   = Math.min(Math.max((p - 0.07) / 0.10, 0), 1)
          const phoneFlyEased = 1 - Math.pow(1 - phoneFlyRaw, 4)
          mockup.style.transform = `translateY(${Math.round((1 - phoneFlyEased) * mockupInitialY)}px)`

          // Frame scrub 17–100 % — starts immediately after phone finishes flying in
          phoneProgressRef.current = Math.max(0, (p - 0.17) / 0.83)
        } else {
          // Desktop: full-length frame scrub, re-lock card positions every tick
          phoneProgressRef.current = frameState.p
          const targets = getPhase3Targets()
          cards.forEach((card, i) => {
            if (!card) return
            card.style.opacity = '1'
            card.style.height = `${p3Heights[i]}px`
            const tp = targets[i]
            card.style.transform =
              `translate(calc(${Math.round(tp.x)}px - 50%), calc(${Math.round(tp.y)}px - 50%)) scale(1)`
          })
        }
      },
    }, step1Dur)

    // Step 3 — footer slides in, phone shifts up, headline cross-fades to "walkboy"
    phase3TL.to(footerState, {
      p: 1, duration: step3Dur, ease: 'none',
      onUpdate() {
        phase3SlideP = 1
        const footerEased = 1 - Math.pow(1 - footerState.p, 3)
        const yOffset     = Math.round(footerEased * FOOTER_YOFFSET)

        // Headline cross-fade: "Walk. Arrive. Listen." → "walkboy"
        const headlineEased = 1 - Math.pow(1 - footerState.p, isMobile ? 4 : 3)
        if (headline2Ref.current) headline2Ref.current.style.opacity = (1 - headlineEased).toFixed(3)
        if (headline3Ref.current) headline3Ref.current.style.opacity = headlineEased.toFixed(3)

        if (footerRef.current) {
          footerRef.current.style.transform = `translateY(${Math.round((1 - footerEased) * 100)}%)`
        }

        mockup.style.transform = `translateY(${-yOffset}px)`

        if (!isMobile) {
          // Desktop: shift cards up with the phone
          const targets = getPhase3Targets(yOffset)
          cards.forEach((card, i) => {
            if (!card) return
            card.style.opacity = '1'
            const tp = targets[i]
            card.style.transform =
              `translate(calc(${Math.round(tp.x)}px - 50%), calc(${Math.round(tp.y)}px - 50%)) scale(1)`
          })
        }
        // Mobile: cards already faded in step 2 — nothing to reposition
      },
    }, step3Pos)

    ScrollTrigger.create({
      trigger:   section,
      start:     () => section.offsetTop + PHASE1_PX + PHASE2_PX + mobilePhase2Extra,
      end:       'bottom bottom',
      scrub:     isMobile ? 2 : 1,
      animation: phase3TL,
      onLeaveBack() {
        phase3SlideP = 0
        if (headline1Ref.current) headline1Ref.current.style.opacity = '1'
        if (headline2Ref.current) headline2Ref.current.style.opacity = '0'
        if (headline3Ref.current) headline3Ref.current.style.opacity = '0'
        p2ContentRefs.forEach(el => { if (el) el.style.opacity = '1' })
        p3ContentRefs.forEach(el => { if (el) el.style.opacity = '0' })
        cards.forEach(card => {
          if (!card) return
          card.style.height = ''
          if (isMobile) card.style.opacity = '1'  // step 2 may have faded them
        })
        if (footerRef.current) footerRef.current.style.transform = 'translateY(100%)'
        // Return phone to off-screen
        mockup.style.transform = `translateY(${mockupInitialY}px)`
        // Return person to visible
        if (personContainerRef.current) {
          personContainerRef.current.style.opacity   = '1'
          personContainerRef.current.style.transform = 'translateY(0px)'
        }
        // Restore card layer z-index for Phase 2
        if (isMobile && cardLayerRef.current) cardLayerRef.current.style.zIndex = '25'
      },
    })

    ScrollTrigger.refresh()
    }) // closes gsap.context
    }  // closes init()

    const runInit = () => {
      init()
      requestAnimationFrame(() => window.dispatchEvent(new Event('scroll')))
    }

    const handleResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(runInit, 250)
    }
    window.addEventListener('resize', handleResize)
    runInit()

    return () => {
      clearTimeout(resizeTimer)
      window.removeEventListener('resize', handleResize)
      if (ctx) { ctx.revert(); ctx = null }
      resetStyles()
    }
  }, [])

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <section ref={sectionRef} className="relative h-[1300vh]">
      <div ref={pinnedRef} className="relative w-full h-screen overflow-hidden">

        {/* Layer 0 — gradient sky */}
        <div
          ref={skyRef}
          className={`absolute top-0 left-0 right-0 z-0 ${GRADIENT_MODE === 'C' ? 'h-[400vh]' : 'h-[200vh]'}`}
          style={{
            background: GRADIENT_MODE === 'C'
              // Mode C: 400vh tall — gray 0–100vh, transition 100–200vh, orange 200–400vh.
              // translateY target is −200vh so viewport always sees solid orange.
              // Extra 200vh of orange below provides a buffer against any sub-pixel mismatch.
              ? `linear-gradient(to bottom, ${SKY_TOP} 25%, ${SKY_BOTTOM} 50%)`
              : `linear-gradient(to bottom, ${SKY_TOP} 0%, ${SKY_TOP} 50%, #FEAA8C 75%, ${SKY_BOTTOM} 100%)`
          }}
        />

        {/* Layer 0b — particle canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />

        {/* Layer 1 — Berlin skyline silhouette */}
        <div ref={midgroundRef} className="absolute inset-0 z-[1] flex items-end">
          <img
            src="/midground-mask.png"
            alt=""
            className="w-full h-auto origin-bottom scale-[1.1]"
            draggable={false}
          />
        </div>

        {/* Layer 2 — Person canvas */}
        <div ref={personContainerRef} className="absolute inset-0 z-20 flex items-end justify-center overflow-hidden"
          role="img" aria-label="Interactive preview of a location-aware mobile audio guide">
          <div className="-translate-x-10">
            <HeroCanvas progressRef={targetProgressRef} />
          </div>
        </div>

        {/* Layer 3 — Headline (cross-fades between Phase 2 and Phase 3 copy) */}
        <div className="absolute inset-0 z-30 flex flex-col items-center text-center pt-[calc(25vh_-_98px)] md:pt-[calc(25vh_-_106px)] px-6 pointer-events-none">
          <div className="relative mb-5">
            <h1
              ref={headline1Ref}
              className="text-[#0E0E0E] font-medium leading-[1.1] tracking-[-0.04em]
                         text-[32px] md:text-[40px] max-w-xl"
            >
              History is playing.
              <br />
              Just press play.
            </h1>
            <h1
              ref={headline2Ref}
              className="absolute top-0 left-0 right-0 text-center text-[#0E0E0E] font-medium leading-[1.1]
                         tracking-[-0.04em] text-[32px] md:text-[40px] max-w-xl opacity-0"
            >
              Walk. Arrive. Listen.
            </h1>
            <h1
              ref={headline3Ref}
              className="absolute top-0 left-0 right-0 text-center text-[#0E0E0E] font-medium leading-[1.1]
                         tracking-[-0.04em] text-[32px] md:text-[40px] max-w-xl opacity-0"
            >
              walkboy
            </h1>
          </div>
        </div>

        {/* Layer 4b — Phone canvas (Phase 3, slides up from bottom) */}
        <div className="absolute inset-0 z-[21] pointer-events-none overflow-hidden">
          <div className="absolute inset-x-0 top-[calc(50vh_-_162px)] h-[calc(75vh_-_96px)] flex justify-center">
            <div ref={mockupRef} className="h-full will-change-transform">
              <PhoneCanvas progressRef={phoneProgressRef} />
            </div>
          </div>
        </div>

        {/* Layer 4 — Orbit cards (fly in during Phase 2, cross-fade content in Phase 3) */}
        <div ref={cardLayerRef} className="absolute inset-0 z-[10] pointer-events-none">

          {/* Card 1 — top-left */}
          <div ref={card1Ref} className="absolute w-[256px] md:w-[240px] bg-[#313138]/60 backdrop-blur-[60px] rounded-[16px] [corner-shape:squircle] opacity-0 overflow-hidden">
            {/* Phase 2 content — normal flow, sets card height during orbit */}
            <div ref={card1P2Ref} className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Buildings size={16} color="white" />
                <p className="text-white text-[14px] font-medium leading-none">Hyperlocal</p>
              </div>
              <p className="text-white/70 text-[14px] leading-[1.3]">Hyperlocal audio guides – not generic city tours.</p>
            </div>
            {/* Phase 3 content — absolute overlay, fades in */}
            <div ref={card1P3Ref} className="absolute top-0 left-0 right-0 p-4 opacity-0">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={16} color="white" weight="fill" />
                <p className="text-white text-[14px] font-medium leading-none">Your Location, Live</p>
              </div>
              <p className="text-white/70 text-[14px] leading-[1.3]">Open walkboy. The app senses exactly where you are – down to the building.</p>
            </div>
          </div>

          {/* Card 2 — bottom-left */}
          <div ref={card2Ref} className="absolute w-[256px] md:w-[240px] bg-[#313138]/60 backdrop-blur-[60px] rounded-[16px] [corner-shape:squircle] opacity-0 overflow-hidden">
            {/* Phase 2 content — normal flow, sets card height during orbit */}
            <div ref={card2P2Ref} className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <WaveTriangle size={16} color="white" />
                <p className="text-white text-[14px] font-medium leading-none">AI-Generated Audio</p>
              </div>
              <p className="text-white/70 text-[14px] leading-[1.3]">Local history audio stories crafted by AI from verified sources.</p>
            </div>
            {/* Phase 3 content — absolute overlay, fades in */}
            <div ref={card2P3Ref} className="absolute top-0 left-0 right-0 p-4 opacity-0">
              <div className="flex items-center gap-2 mb-2">
                <Sparkle size={16} color="white" />
                <p className="text-white text-[14px] font-medium leading-none">Story Assembles</p>
              </div>
              <p className="text-white/70 text-[14px] leading-[1.3]">AI pulls from historical records and cultural archives to compose a narrative episode for this precise spot.</p>
            </div>
          </div>

          {/* Card 3 — top-right */}
          <div ref={card3Ref} className="absolute w-[256px] md:w-[240px] bg-[#313138]/60 backdrop-blur-[60px] rounded-[16px] [corner-shape:squircle] opacity-0 overflow-hidden">
            {/* Phase 2 content — normal flow, sets card height during orbit */}
            <div ref={card3P2Ref} className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} color="white" />
                <p className="text-white text-[14px] font-medium leading-none">Contextual Timing</p>
              </div>
              <p className="text-white/70 text-[14px] leading-[1.3]">Location-aware storytelling, triggered as you walk – zero friction.</p>
            </div>
            {/* Phase 3 content — absolute overlay, fades in */}
            <div ref={card3P3Ref} className="absolute top-0 left-0 right-0 p-4 opacity-0">
              <div className="flex items-center gap-2 mb-2">
                <Headphones size={16} color="white" />
                <p className="text-white text-[14px] font-medium leading-none">Put On Headphones</p>
              </div>
              <p className="text-white/70 text-[14px] leading-[1.3]">A voice begins. Immersive, editorial, personal. History made audible, right where it happened.</p>
            </div>
          </div>

          {/* Card 4 — bottom-right */}
          <div ref={card4Ref} className="absolute w-[256px] md:w-[240px] bg-[#313138]/60 backdrop-blur-[60px] rounded-[16px] [corner-shape:squircle] opacity-0 overflow-hidden">
            {/* Phase 2 content — normal flow, sets card height during orbit */}
            <div ref={card4P2Ref} className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkle size={16} color="white" />
                <p className="text-white text-[14px] font-medium leading-none">Cultural Depth</p>
              </div>
              <p className="text-white/70 text-[14px] leading-[1.3]">Your mobile tour guide from Weimar Republic cafés to Cold War checkpoints – Berlin, revealed.</p>
            </div>
            {/* Phase 3 content — absolute overlay, fades in */}
            <div ref={card4P3Ref} className="absolute top-0 left-0 right-0 p-4 opacity-0">
              <div className="flex items-center gap-2 mb-2">
                <WaveTriangle size={16} color="white" />
                <p className="text-white text-[14px] font-medium leading-none">Always Playing</p>
              </div>
              <p className="text-white/70 text-[14px] leading-[1.3]">walkboy runs quietly in the background. A new episode begins the moment you step into history.</p>
            </div>
          </div>

        </div>

        {/* Layer 5 — Footer (slides up from bottom at end of Phase 3) */}
        <div
          ref={footerRef}
          className="absolute bottom-0 left-0 right-0 z-[35] flex justify-center pb-2"
          style={{ transform: 'translateY(100%)' }}
        >
          <div className="flex items-center gap-3 px-4 py-2 bg-[#313138]/20 backdrop-blur-[40px] rounded-[12px] [corner-shape:squircle]">
            <a href="mailto:info@walkboy.app" className="text-white text-[12px] leading-[16px] hover:opacity-70 transition-opacity duration-150">info@walkboy.app</a>
            <span className="text-white/30 text-[12px]">·</span>
            <span className="text-white text-[12px] leading-[16px]">© 2026 · Berlin</span>
          </div>
        </div>

      </div>

      {/* Hidden SEO / accessibility section — opacity-0, readable by crawlers and screen readers */}
      <div
        className="absolute inset-x-0 top-0 pointer-events-none select-none"
        style={{ opacity: 0 }}
        aria-hidden={false}
      >
        <h2>How walkboy Works — Your Location-Aware Audio Guide</h2>
        <p>
          walkboy is a location-aware audio guide app that delivers local history audio stories
          triggered by your precise GPS position. As you walk through the city, walkboy acts as
          your personal mobile tour guide — sensing exactly where you are and playing immersive
          location-aware storytelling content about the history of your exact spot.
        </p>
        <ol>
          <li>Open walkboy and allow location access</li>
          <li>Walk through the city with headphones on</li>
          <li>walkboy's location-aware storytelling engine detects your precise GPS position</li>
          <li>Your audio guide begins, telling local history audio stories about the exact spot you're standing</li>
          <li>Discover hidden history through your mobile tour guide — hands-free, on-demand</li>
        </ol>
      </div>
    </section>
  )
}

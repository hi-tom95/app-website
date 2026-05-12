import { useState } from 'react'
import { MapPinIcon as MapPin } from '@phosphor-icons/react'
import HeroScrollyteller from './components/HeroScrollyteller'

/* ─────────────────────────────────────────────────────────
   App
───────────────────────────────────────────────────────── */
function App() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email) setSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-[#FDFAFA] font-sans">

      {/* ══════════════════════════════════════════════
          FIXED NAV — floating frosted-glass pill
      ══════════════════════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center pt-2 pointer-events-none">
        <div className="pointer-events-auto">
          {!submitted ? (
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 p-2 bg-[#313138]/20 backdrop-blur-[40px] rounded-[12px] [corner-shape:squircle]"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email for early access"
                className="[field-sizing:content] min-w-[120px] min-h-[44px] px-3 py-2 bg-[#313138]/60 backdrop-blur-[60px] rounded-[8px] [corner-shape:squircle]
                           text-white text-[12px] leading-[16px] font-normal placeholder:text-white/50
                           outline-none"
              />
              <button
                type="submit"
                className="min-h-[44px] px-3 py-2 bg-[#0E0E0E] backdrop-blur-[60px] rounded-[8px] [corner-shape:squircle]
                           text-white text-[12px] leading-[16px] font-normal
                           whitespace-nowrap transition-opacity duration-150 hover:bg-[#313138] active:scale-95"
              >
                Join the Waitlist
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 bg-[#313138]/20 backdrop-blur-[40px] rounded-[12px] [corner-shape:squircle]">
              <MapPin size={13} color="white" weight="fill" />
              <span className="text-white text-[12px] leading-[16px]">
                You're on the list. We'll be in touch.
              </span>
            </div>
          )}
        </div>
      </nav>

      <HeroScrollyteller />

    </div>
  )
}

export default App

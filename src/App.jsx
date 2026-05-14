import { useState } from 'react'
import HeroScrollyteller from './components/HeroScrollyteller'

/* ─────────────────────────────────────────────────────────
   App
───────────────────────────────────────────────────────── */
function App() {
  const [email, setEmail]       = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Something went wrong')
      }
      setSubmitted(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFAFA] font-sans">

      {/* ══════════════════════════════════════════════
          FIXED NAV — floating frosted-glass pill
      ══════════════════════════════════════════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center pt-2 pointer-events-none">
        <div className="pointer-events-auto flex flex-col items-center gap-1">
          <div className="relative p-2 bg-[#313138]/20 backdrop-blur-[40px] rounded-[12px] [corner-shape:squircle]">
            {/* Form always in layout — invisible when submitted so container keeps its size */}
            <form
              onSubmit={handleSubmit}
              className={`flex items-center gap-2 ${submitted ? 'invisible pointer-events-none' : ''}`}
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email for early access"
                className="w-[240px] min-h-[44px] px-3 py-2 bg-[#313138]/60 backdrop-blur-[60px] rounded-[8px] [corner-shape:squircle]
                           text-white text-[12px] leading-[16px] font-normal placeholder:text-white/50
                           outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="min-h-[44px] px-3 py-2 bg-[#0E0E0E] backdrop-blur-[60px] rounded-[8px] [corner-shape:squircle]
                           text-white text-[12px] leading-[16px] font-normal
                           whitespace-nowrap transition-opacity duration-150 hover:bg-[#313138] active:scale-95
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Joining…' : 'Join the Waitlist'}
              </button>
            </form>
            {/* Success overlay — fills the exact same container */}
            {submitted && (
              <div className="absolute inset-0 flex items-center justify-center px-3">
                <span className="text-[#0E0E0E] text-[12px] leading-[16px] font-normal whitespace-nowrap">
                  You're in. First to walk when we launch.
                </span>
              </div>
            )}
          </div>
          {error && (
            <span className="text-[#FF591D] text-[11px] leading-[14px]">{error}</span>
          )}
        </div>
      </nav>

      <HeroScrollyteller />

    </div>
  )
}

export default App

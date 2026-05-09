import { useState, useEffect, useCallback } from 'react'

const LIE_TYPES = [
  { id: 'fairway',  label: 'Fairway',  icon: '🟢', color: 'from-emerald-600 to-emerald-800' },
  { id: 'l-rough',  label: 'L. Rough', icon: '🌿', color: 'from-green-700 to-green-900' },
  { id: 'd-rough',  label: 'D. Rough', icon: '🌾', color: 'from-yellow-700 to-yellow-900' },
  { id: 'bunker',   label: 'Bunker',   icon: '🏖️', color: 'from-amber-600 to-amber-800' },
  { id: 'hardpan',  label: 'Hardpan',  icon: '🪨', color: 'from-stone-600 to-stone-800' },
]

const GPS_STATUS = {
  IDLE:    'idle',
  LOADING: 'loading',
  LOCKED:  'locked',
  ERROR:   'error',
}

export default function App() {
  const [gpsStatus, setGpsStatus] = useState(GPS_STATUS.IDLE)
  const [position, setPosition]   = useState(null)
  const [gpsError, setGpsError]   = useState(null)
  const [selectedLie, setSelectedLie] = useState(null)

  const requestGps = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setGpsStatus(GPS_STATUS.ERROR)
      setGpsError('Geolocation not supported on this device.')
      return
    }
    setGpsStatus(GPS_STATUS.LOADING)
    setGpsError(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude.toFixed(6),
          lng: pos.coords.longitude.toFixed(6),
          accuracy: Math.round(pos.coords.accuracy),
        })
        setGpsStatus(GPS_STATUS.LOCKED)
      },
      (err) => {
        setGpsStatus(GPS_STATUS.ERROR)
        setGpsError(err.message)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    )
  }, [])

  // Auto-request GPS on mount
  useEffect(() => { requestGps() }, [requestGps])

  const gpsIndicator = {
    [GPS_STATUS.IDLE]:    { dot: 'bg-gray-500',   text: 'GPS idle',    badge: 'text-gray-400' },
    [GPS_STATUS.LOADING]: { dot: 'bg-yellow-400 animate-pulse', text: 'Acquiring…', badge: 'text-yellow-300' },
    [GPS_STATUS.LOCKED]:  { dot: 'bg-emerald-400', text: 'GPS locked',  badge: 'text-emerald-300' },
    [GPS_STATUS.ERROR]:   { dot: 'bg-red-500',    text: 'GPS error',   badge: 'text-red-400' },
  }[gpsStatus]

  return (
    <div
      className="min-h-screen flex flex-col font-sans antialiased"
      style={{ background: '#0f1923', color: '#e2e8f0' }}
    >
      {/* ── Header ── */}
      <header
        className="sticky top-0 z-10 px-5 py-4 flex flex-col"
        style={{ background: 'rgba(15,25,35,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: '#7dd3fc' }}>
              ⛳ GolfBrain
            </h1>
            <p className="text-xs font-medium tracking-widest uppercase mt-0.5" style={{ color: '#94a3b8' }}>
              Peel Village
            </p>
          </div>

          {/* GPS status badge */}
          <button
            onClick={requestGps}
            className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition-all active:scale-95"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            aria-label="Refresh GPS"
          >
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${gpsIndicator.dot}`} />
            <span className={gpsIndicator.badge}>{gpsIndicator.text}</span>
          </button>
        </div>

        {/* GPS coordinates row */}
        {gpsStatus === GPS_STATUS.LOCKED && position && (
          <div
            className="mt-3 grid grid-cols-3 gap-2 text-center text-xs rounded-xl px-3 py-2"
            style={{ background: 'rgba(125,211,252,0.06)', border: '1px solid rgba(125,211,252,0.15)' }}
          >
            <div>
              <p className="text-gray-500 uppercase tracking-widest text-[10px]">Lat</p>
              <p className="font-mono font-semibold" style={{ color: '#7dd3fc' }}>{position.lat}</p>
            </div>
            <div>
              <p className="text-gray-500 uppercase tracking-widest text-[10px]">Lng</p>
              <p className="font-mono font-semibold" style={{ color: '#7dd3fc' }}>{position.lng}</p>
            </div>
            <div>
              <p className="text-gray-500 uppercase tracking-widest text-[10px]">± m</p>
              <p className="font-mono font-semibold" style={{ color: position.accuracy <= 10 ? '#4ade80' : '#fbbf24' }}>
                {position.accuracy}
              </p>
            </div>
          </div>
        )}

        {gpsStatus === GPS_STATUS.ERROR && (
          <p className="mt-2 text-xs text-red-400 text-center">{gpsError}</p>
        )}
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 px-4 py-6 space-y-6 max-w-lg mx-auto w-full">

        {/* Shot Recommendations Card */}
        <section
          className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🎯</span>
            <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>
              Shot Recommendation
            </h2>
          </div>

          {selectedLie ? (
            <div className="space-y-3">
              <div
                className="rounded-xl px-4 py-3 flex items-center justify-between"
                style={{ background: 'rgba(125,211,252,0.08)', border: '1px solid rgba(125,211,252,0.2)' }}
              >
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Lie detected</p>
                  <p className="font-bold text-lg" style={{ color: '#7dd3fc' }}>
                    {LIE_TYPES.find(l => l.id === selectedLie)?.label}
                  </p>
                </div>
                <span className="text-3xl">{LIE_TYPES.find(l => l.id === selectedLie)?.icon}</span>
              </div>

              <div
                className="rounded-xl px-4 py-3"
                style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)' }}
              >
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Recommended club</p>
                <p className="font-extrabold text-2xl" style={{ color: '#4ade80' }}>7-Iron</p>
                <p className="text-xs text-gray-400 mt-1">Estimated carry · <span className="text-white font-semibold">148 yds</span></p>
              </div>

              <p className="text-xs text-center text-gray-600 italic">
                Full recommendations unlock once course mapping is active
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="text-4xl opacity-30">🏌️</div>
              <p className="text-sm text-gray-500 text-center">
                Select your lie below to get a shot recommendation
              </p>
            </div>
          )}
        </section>

        {/* Lie Selector Grid */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#64748b' }}>
            Select Your Lie
          </h2>
          <div className="grid grid-cols-5 gap-2">
            {LIE_TYPES.map((lie) => {
              const active = selectedLie === lie.id
              return (
                <button
                  key={lie.id}
                  id={`lie-${lie.id}`}
                  onClick={() => setSelectedLie(lie.id)}
                  className={`
                    flex flex-col items-center justify-center gap-1.5
                    rounded-xl py-3 px-1 text-center
                    transition-all duration-200 active:scale-95
                    bg-gradient-to-b ${lie.color}
                  `}
                  style={{
                    border: active
                      ? '2px solid rgba(125,211,252,0.8)'
                      : '2px solid rgba(255,255,255,0.06)',
                    boxShadow: active
                      ? '0 0 16px rgba(125,211,252,0.3)'
                      : 'none',
                    transform: active ? 'scale(1.05)' : 'scale(1)',
                  }}
                  aria-pressed={active}
                  aria-label={`Select lie: ${lie.label}`}
                >
                  <span className="text-xl leading-none">{lie.icon}</span>
                  <span className="text-[10px] font-semibold leading-tight text-white/90">
                    {lie.label}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        {/* Distance to Pin placeholder */}
        <section
          className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">📍</span>
            <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>
              Distance to Pin
            </h2>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-extrabold" style={{ color: '#f1f5f9' }}>—</span>
            <span className="text-lg text-gray-500">yds</span>
          </div>
          <p className="text-xs text-gray-600 mt-2 italic">
            Course mapping required to calculate distance
          </p>
        </section>
      </main>

      {/* ── Bottom nav ── */}
      <nav
        className="sticky bottom-0 grid grid-cols-3 gap-0"
        style={{
          background: 'rgba(15,25,35,0.95)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {[
          { icon: '🏠', label: 'Home',    id: 'nav-home' },
          { icon: '📊', label: 'Stats',   id: 'nav-stats' },
          { icon: '⚙️', label: 'Settings', id: 'nav-settings' },
        ].map((item) => (
          <button
            key={item.id}
            id={item.id}
            className="flex flex-col items-center justify-center py-3 gap-1 transition-opacity active:opacity-50"
            style={{ color: '#64748b' }}
            aria-label={item.label}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

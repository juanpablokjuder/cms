'use client'

import { useEffect, useState } from 'react'

export default function PageLoader() {
  const [phase, setPhase] = useState<'in' | 'out' | 'done'>('in')

  useEffect(() => {
    try {
      if (sessionStorage.getItem('vk-loader')) {
        setPhase('done')
        return
      }
      sessionStorage.setItem('vk-loader', '1')
    } catch (_) {}

    const t1 = setTimeout(() => setPhase('out'), 1900)
    const t2 = setTimeout(() => setPhase('done'), 2500)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  if (phase === 'done') return null

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#030A14] select-none pointer-events-none transition-all duration-500 ease-in-out ${
        phase === 'out' ? 'opacity-0 scale-[1.04]' : 'opacity-100 scale-100'
      }`}
    >
      {/* Logo with layered animations */}
      <div className="relative mb-7">
        {/* Ambient glow */}
        <div className="absolute inset-0 rounded-3xl bg-vk/30 blur-2xl animate-pulse" />

        {/* Slow outer ring */}
        <div className="absolute -inset-4 rounded-[40px] border border-vk/15 animate-[spin_7s_linear_infinite]" />

        {/* Counter-rotating inner ring */}
        <div className="absolute -inset-2 rounded-[32px] border border-vk/25 animate-[spin_4s_linear_infinite_reverse]" />

        {/* Main badge */}
        <div className="relative w-24 h-24 rounded-3xl bg-[#040D1A] border-2 border-vk/50 flex items-center justify-center">
          <span className="text-vk font-black text-4xl leading-none tracking-tighter">VK</span>
        </div>
      </div>

      {/* Brand */}
      <p className="text-white font-bold text-2xl tracking-tight mb-1">
        diseños<span className="text-vk">VK</span>
      </p>
      <p className="text-gray-500 text-sm mb-10 tracking-wide">Preparando experiencia digital…</p>

      {/* Progress bar */}
      <div className="w-52 h-[2px] bg-white/5 rounded-full overflow-hidden">
        <div className="h-full w-full bg-gradient-to-r from-vk/50 via-vk to-vk-light rounded-full load-progress" />
      </div>
    </div>
  )
}

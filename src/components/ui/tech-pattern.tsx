'use client'

export function CircuitPattern({ className = '' }: { className?: string }) {
  return (
    <svg className={`w-full h-full ${className}`} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
          <path d="M0 50h40M60 50h40M50 0v40M50 60v40" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.3"/>
          <circle cx="50" cy="50" r="4" fill="currentColor" opacity="0.5"/>
          <circle cx="0" cy="50" r="2" fill="currentColor" opacity="0.3"/>
          <circle cx="100" cy="50" r="2" fill="currentColor" opacity="0.3"/>
          <circle cx="50" cy="0" r="2" fill="currentColor" opacity="0.3"/>
          <circle cx="50" cy="100" r="2" fill="currentColor" opacity="0.3"/>
          <path d="M20 20h10v10H20zM70 70h10v10H70zM70 20h10v10H70zM20 70h10v10H20z" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.2"/>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#circuit)"/>
    </svg>
  )
}

export function StatusLeds() {
  return (
    <div className="flex gap-1.5">
      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm shadow-emerald-500/50"/>
      <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse shadow-sm shadow-cyan-500/50" style={{animationDelay: '0.2s'}}/>
      <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-sm shadow-blue-500/50" style={{animationDelay: '0.4s'}}/>
    </div>
  )
}

export function GlowLine({ position = 'top', color = 'emerald' }: { position?: 'top' | 'bottom', color?: 'emerald' | 'cyan' | 'blue' }) {
  const colorClass = {
    emerald: 'via-emerald-500',
    cyan: 'via-cyan-500', 
    blue: 'via-blue-500'
  }[color]
  
  return (
    <div className={`absolute ${position === 'top' ? 'top-0' : 'bottom-0'} left-0 w-full h-px bg-gradient-to-r from-transparent ${colorClass} to-transparent opacity-50`}/>
  )
}

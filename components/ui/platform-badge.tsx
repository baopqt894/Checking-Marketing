"use client"
import React from 'react'

interface PlatformBadgeProps {
  platform?: string | null
  inline?: boolean // if used inside sentence
  className?: string
  showLabel?: boolean
}

const androidSvg = (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
    <path d="M17.6 9.48l1.82-3.16a.5.5 0 10-.87-.5l-1.84 3.2a8.1 8.1 0 00-8.42 0L6.45 5.82a.5.5 0 10-.87.5L7.4 9.48A7.53 7.53 0 004 16.25c0 .41.34.75.75.75h.7l.54 3.23A1.78 1.78 0 007.75 22h.5a1.75 1.75 0 001.75-1.75V17h4v3.25A1.75 1.75 0 0015.75 22h.5a1.78 1.78 0 001.76-1.52l.54-3.23h.7c.41 0 .75-.34.75-.75A7.53 7.53 0 0017.6 9.48zM9.25 12a.75.75 0 110-1.5.75.75 0 010 1.5zm5.5 0a.75.75 0 110-1.5.75.75 0 010 1.5z" />
  </svg>
)

const appleSvg = (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
    <path d="M16.53 1.73a5.5 5.5 0 00-3.66 2.01 5.08 5.08 0 00-1.25 3.87c1.38.11 2.68-.49 3.6-1.6a5.2 5.2 0 001.31-3.98zM21.25 17.5c-.8 1.77-1.18 2.55-2.2 4.12-.93 1.42-2.24 3.19-3.9 3.21-1.46.02-1.84-.94-3.82-.93-1.98.01-2.39.95-3.85.93-1.66-.02-2.94-1.61-3.87-3.03-2.65-4.04-2.93-8.79-1.3-11.31 1.16-1.78 2.99-2.83 4.72-2.83 1.75 0 2.85.95 4.3.95 1.41 0 2.27-.95 4.28-.95 1.54 0 3.17.84 4.33 2.3-3.79 2.08-3.18 7.55.31 8.54z" />
  </svg>
)

export function PlatformBadge({ platform, inline, className = '', showLabel = true }: PlatformBadgeProps) {
  if(!platform) return <span className={"text-muted-foreground text-xs " + className}>—</span>
  const p = platform.toLowerCase()
  const isAndroid = p === 'android'
  const isIOS = p === 'ios' || p === 'iphone' || p === 'ipad'
  const icon = isAndroid ? androidSvg : isIOS ? appleSvg : null
  const label = isAndroid ? 'Android' : isIOS ? 'iOS' : platform
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-medium tracking-wide ${
        isAndroid ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400 dark:bg-emerald-500/15' :
        isIOS ? 'bg-slate-500/10 text-slate-700 border-slate-400/40 dark:text-slate-200 dark:bg-slate-500/15' : 'bg-muted text-foreground border-border'
      } ${inline ? 'align-middle' : ''} ${className}`}
      title={label}
      aria-label={label}
    >
      {icon}
      {showLabel && <span>{label}</span>}
    </span>
  )
}

export default PlatformBadge

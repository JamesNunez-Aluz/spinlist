'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useMotionValue, animate, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import type { Task } from '@/app/page'

const SIZE = 500
const R = SIZE / 2
const PALETTE = [
  '#f472b6', '#fb923c', '#facc15', '#a3e635',
  '#34d399', '#22d3ee', '#818cf8', '#c084fc',
]

type Slice = {
  task: Task
  start: number
  end: number
  color: string
}

const SPIN_DURATION_MS = 4500

export default function SpinWheel({ tasks }: { tasks: Task[] }) {
  const rotation = useMotionValue(0)
  const [spinning, setSpinning] = useState(false)
  const [winner, setWinner] = useState<Task | null>(null)
  const wheelRef = useRef<HTMLDivElement>(null)

  // Refs that survive the spin so completion can fire from anywhere
  // (timer, focus, click, etc.) without recomputing.
  const controlsRef = useRef<ReturnType<typeof animate> | null>(null)
  const spinEndAtRef = useRef(0)
  const targetRotationRef = useRef(0)
  const pendingWinnerRef = useRef<Task | null>(null)

  function finishSpin() {
    if (!spinning) return
    if (Date.now() < spinEndAtRef.current) return

    controlsRef.current?.stop()
    rotation.set(targetRotationRef.current) // snap to exact target

    setWinner(pendingWinnerRef.current)
    setSpinning(false)
    celebrate()
  }

  // While spinning, attach every "wake up" signal we have. Any of them will
  // complete the spin once the wall-clock end time is reached. This is robust
  // against browser timer throttling when the window is occluded/hidden.
  useEffect(() => {
    if (!spinning) return

    const timeout = window.setTimeout(finishSpin, SPIN_DURATION_MS + 100)
    const interval = window.setInterval(finishSpin, 500)

    window.addEventListener('focus', finishSpin)
    window.addEventListener('pageshow', finishSpin)
    document.addEventListener('visibilitychange', finishSpin)
    document.addEventListener('pointermove', finishSpin, true)
    document.addEventListener('click', finishSpin, true)

    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
      window.removeEventListener('focus', finishSpin)
      window.removeEventListener('pageshow', finishSpin)
      document.removeEventListener('visibilitychange', finishSpin)
      document.removeEventListener('pointermove', finishSpin, true)
      document.removeEventListener('click', finishSpin, true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinning])

  function celebrate() {
    const rect = wheelRef.current?.getBoundingClientRect()
    const origin = rect
      ? {
          x: (rect.left + rect.width / 2) / window.innerWidth,
          y: (rect.top + rect.height / 2) / window.innerHeight,
        }
      : { x: 0.5, y: 0.5 }

    const colors = ['#f472b6', '#fb923c', '#facc15', '#a3e635', '#22d3ee', '#c084fc']

    // Big initial burst from wheel center.
    confetti({
      particleCount: 140,
      spread: 100,
      startVelocity: 55,
      origin,
      colors,
      scalar: 1.1,
      ticks: 220,
    })

    // Side cannons for theatrical effect.
    setTimeout(() => {
      confetti({ particleCount: 60, angle: 60, spread: 70, origin: { x: 0, y: 0.85 }, colors })
      confetti({ particleCount: 60, angle: 120, spread: 70, origin: { x: 1, y: 0.85 }, colors })
    }, 250)

    // Lingering sparkles.
    setTimeout(() => {
      confetti({
        particleCount: 50,
        spread: 360,
        startVelocity: 25,
        origin,
        colors,
        ticks: 300,
        gravity: 0.6,
        scalar: 0.8,
      })
    }, 500)
  }

  const slices = useMemo<Slice[]>(() => {
    if (tasks.length === 0) return []
    const total = tasks.reduce((s, t) => s + t.urgency * t.importance, 0)
    let cursor = 0
    return tasks.map((task, i) => {
      const angle = (task.urgency * task.importance) / total * 360
      const slice: Slice = {
        task,
        start: cursor,
        end: cursor + angle,
        color: PALETTE[i % PALETTE.length],
      }
      cursor += angle
      return slice
    })
  }, [tasks])

  function spin() {
    if (slices.length === 0) return

    // Self-heal: if state thinks we're still spinning, finish the previous
    // one rather than bailing — prevents the button getting stuck.
    if (spinning) {
      finishSpin()
      return
    }

    setSpinning(true)
    setWinner(null)

    const turns = 5 + Math.random() * 3
    const offset = Math.random() * 360
    const target = rotation.get() + turns * 360 + offset

    // Compute the winner upfront — it's deterministic from the target.
    // The visual spin is just theatrics; we already know who won.
    const finalRotation = ((target % 360) + 360) % 360
    const pointerAngle = (360 - finalRotation) % 360
    const hit = slices.find(
      (s) => pointerAngle >= s.start && pointerAngle < s.end,
    ) ?? slices[slices.length - 1]

    targetRotationRef.current = target
    spinEndAtRef.current = Date.now() + SPIN_DURATION_MS
    pendingWinnerRef.current = hit.task

    controlsRef.current?.stop()
    controlsRef.current = animate(rotation, target, {
      duration: SPIN_DURATION_MS / 1000,
      ease: [0.17, 0.67, 0.12, 0.99],
    })
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div ref={wheelRef} className="relative w-full max-w-[820px] max-h-[calc(100vh-380px)] aspect-square mx-auto">
        {/* Pointer */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-3 z-10 w-0 h-0
                        border-l-[18px] border-l-transparent
                        border-r-[18px] border-r-transparent
                        border-t-[30px] border-t-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]" />

        <motion.svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{ rotate: rotation }}
          className="drop-shadow-[0_0_80px_rgba(168,85,247,0.4)]"
        >
          <defs>
            <radialGradient id="rim" cx="50%" cy="50%" r="50%">
              <stop offset="92%" stopColor="rgba(255,255,255,0)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.25)" />
            </radialGradient>
          </defs>

          {slices.length === 0 ? (
            <circle cx={R} cy={R} r={R - 4} fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.1)" />
          ) : slices.length === 1 ? (
            <>
              <circle cx={R} cy={R} r={R - 4} fill={slices[0].color} />
              <text
                x={R}
                y={R}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="18"
                fontWeight="600"
                fill="white"
              >
                {truncate(slices[0].task.title, 18)}
              </text>
            </>
          ) : (
            slices.map((s) => <SlicePath key={s.task.id} slice={s} />)
          )}

          <circle cx={R} cy={R} r={R - 4} fill="url(#rim)" pointerEvents="none" />
          <circle cx={R} cy={R} r={18} fill="#0a0a0a" stroke="white" strokeWidth="3" />
        </motion.svg>
      </div>

      <button
        onClick={spin}
        disabled={slices.length === 0 || spinning}
        className="relative z-10 px-8 py-3 rounded-full font-display font-semibold text-lg text-white
                   bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-500
                   hover:opacity-95 active:scale-95 transition
                   disabled:opacity-40 disabled:cursor-not-allowed
                   shadow-[0_8px_32px_rgba(236,72,153,0.4)]"
      >
        {spinning ? 'Spinning…' : 'SPIN'}
      </button>

      <AnimatePresence>
        {winner && !spinning && (
          <motion.div
            key={winner.id}
            initial={{ scale: 0.4, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 18 }}
            className="glass-strong rounded-2xl px-6 py-5 text-center max-w-sm
                       border border-white/20
                       shadow-[0_0_60px_rgba(236,72,153,0.4)]"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="text-xs uppercase tracking-widest text-white/50 mb-1"
            >
              Do this next
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, type: 'spring', stiffness: 300, damping: 20 }}
              className="font-display text-2xl font-semibold bg-gradient-to-r from-pink-200 via-fuchsia-200 to-violet-200 bg-clip-text text-transparent"
            >
              {winner.title}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SlicePath({ slice }: { slice: Slice }) {
  // SVG arc: start angle is at top (-90deg in SVG), increases clockwise.
  const startRad = ((slice.start - 90) * Math.PI) / 180
  const endRad = ((slice.end - 90) * Math.PI) / 180
  const x1 = R + R * Math.cos(startRad)
  const y1 = R + R * Math.sin(startRad)
  const x2 = R + R * Math.cos(endRad)
  const y2 = R + R * Math.sin(endRad)
  const largeArc = slice.end - slice.start > 180 ? 1 : 0
  const d = `M ${R} ${R} L ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2} Z`

  // Label position at slice midpoint, 60% out from center.
  const midRad = (((slice.start + slice.end) / 2 - 90) * Math.PI) / 180
  const lx = R + R * 0.6 * Math.cos(midRad)
  const ly = R + R * 0.6 * Math.sin(midRad)
  const labelRotation = (slice.start + slice.end) / 2
  const sliceAngle = slice.end - slice.start

  return (
    <g>
      <path d={d} fill={slice.color} stroke="rgba(0,0,0,0.25)" strokeWidth="1" />
      {sliceAngle > 14 && (
        <text
          x={lx}
          y={ly}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={Math.min(16, 10 + sliceAngle / 20)}
          fontWeight="600"
          fill="white"
          transform={`rotate(${labelRotation} ${lx} ${ly})`}
          style={{ pointerEvents: 'none', textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}
        >
          {truncate(slice.task.title, Math.max(8, Math.round(sliceAngle / 4)))}
        </text>
      )}
    </g>
  )
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + '…' : s
}

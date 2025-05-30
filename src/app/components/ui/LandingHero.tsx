'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import PartnerLogos from '@/components/PartnerLogos'

export type ViewerMode = 'full' | 'diagnose' | 'questionnaire'

function ExamplePlan() {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-6 w-full max-w-md mx-auto">
      <button
        aria-label="Toggle example plan"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between bg-gray-800/50 rounded-md px-4 py-2 text-white"
      >
        <span>example plan</span>
        <span>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="mt-2 space-y-1 text-left text-sm text-gray-200">
          <p>day 1: mobility &amp; stretching</p>
          <p>day 2: strength &amp; stability</p>
          <p>day 3: active recovery</p>
        </div>
      )}
    </div>
  )
}

export default function LandingHero({ onSelect }: { onSelect: (m: ViewerMode) => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 bg-gradient-to-b from-[#0d1117] to-[#1a1f24]">
      <video
        src="/videos/hero-shoulder-demo.mp4"
        className="rounded-lg w-full max-w-lg mx-auto"
        autoPlay
        muted
        loop
        playsInline
        style={{ maxHeight: '40vh' }}
      >
        <track kind="captions" />
      </video>
      <h1 className="mt-6 text-3xl font-bold text-white">relieve pain, rebuild strength</h1>
      <p className="text-gray-300 mb-6">custom rehab plan in under 2 minutes</p>
      <div className="flex gap-4 mb-4">
        <motion.button
          id="btn-diagnose"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect('diagnose')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md"
          aria-label="i have pain"
        >
          i have pain
        </motion.button>
        <motion.button
          id="btn-workout"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelect('questionnaire')}
          className="px-4 py-2 border border-white text-white rounded-md"
          aria-label="just need a workout"
        >
          just need a workout
        </motion.button>
      </div>
      <PartnerLogos />
      <div className="mt-4 flex items-center gap-2 text-sm text-white">
        <span className="text-yellow-400">★★★★★</span>
        <span>4.9</span>
        <a
          href="https://g.page/r/GREPLACE"
          className="underline"
          aria-label="138 reviews"
          target="_blank"
          rel="noopener noreferrer"
        >
          138 reviews
        </a>
      </div>
      <ExamplePlan />
    </div>
  )
}

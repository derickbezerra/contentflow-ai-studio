'use client'

import { CarouselOutput } from '@/types'
import { useState, useRef } from 'react'

interface Props {
  data: CarouselOutput
}

const SLIDE_COLORS = [
  'bg-indigo-600',
  'bg-violet-600',
  'bg-purple-700',
  'bg-indigo-700',
  'bg-blue-700',
  'bg-violet-700',
  'bg-indigo-800',
]

export default function CarouselView({ data }: Props) {
  const [activeSlide, setActiveSlide] = useState(0)
  const [copied, setCopied] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  function copyAll() {
    const text = data.slides.map((s, i) => `Slide ${i + 1}: ${s}`).join('\n\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function downloadText() {
    const text = `CARROSSEL — Intenção: ${data.intent}\n\nEstrutura: ${data.structure.join(' → ')}\n\n${data.slides.map((s, i) => `Slide ${i + 1}:\n${s}`).join('\n\n')}`
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'carrossel-contentflow.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div ref={containerRef}>
      {/* Intent badge */}
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xs px-2 py-1 bg-indigo-900/50 text-indigo-300 border border-indigo-800 rounded-full">
          {data.intent}
        </span>
        <span className="text-xs text-gray-500">
          {data.slides.length} slides
        </span>
      </div>

      {/* Slide preview */}
      <div className="mb-4">
        <div className={`${SLIDE_COLORS[activeSlide % SLIDE_COLORS.length]} rounded-2xl aspect-square max-w-sm mx-auto flex items-center justify-center p-8`}>
          <p className="text-white text-xl font-bold text-center leading-snug">
            {data.slides[activeSlide]}
          </p>
        </div>
      </div>

      {/* Slide number */}
      <p className="text-center text-sm text-gray-400 mb-4">
        {activeSlide + 1} / {data.slides.length}
      </p>

      {/* Thumbnails */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {data.slides.map((slide, i) => (
          <button
            key={i}
            onClick={() => setActiveSlide(i)}
            className={`flex-shrink-0 w-16 h-16 rounded-lg ${SLIDE_COLORS[i % SLIDE_COLORS.length]} flex items-center justify-center text-white text-xs font-bold border-2 transition ${
              activeSlide === i ? 'border-white' : 'border-transparent opacity-60'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* All slides list */}
      <div className="space-y-2 mb-6">
        {data.slides.map((slide, i) => (
          <div
            key={i}
            onClick={() => setActiveSlide(i)}
            className={`flex gap-3 p-3 rounded-lg cursor-pointer transition ${
              activeSlide === i ? 'bg-gray-800 border border-gray-700' : 'bg-gray-900 border border-gray-900 hover:border-gray-800'
            }`}
          >
            <span className={`flex-shrink-0 w-7 h-7 rounded ${SLIDE_COLORS[i % SLIDE_COLORS.length]} flex items-center justify-center text-xs font-bold text-white`}>
              {i + 1}
            </span>
            <p className="text-sm text-gray-200">{slide}</p>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={copyAll}
          className="flex-1 py-2.5 text-sm font-medium bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-700 transition"
        >
          {copied ? '✓ Copiado' : 'Copiar todos'}
        </button>
        <button
          onClick={downloadText}
          className="flex-1 py-2.5 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
        >
          ↓ Download
        </button>
      </div>
    </div>
  )
}

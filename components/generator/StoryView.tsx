'use client'

import { StoryOutput } from '@/types'
import { useState } from 'react'

interface Props {
  data: StoryOutput
}

const STORY_COLORS = [
  'from-indigo-600 to-violet-700',
  'from-violet-600 to-purple-700',
  'from-purple-600 to-indigo-700',
  'from-blue-600 to-indigo-600',
  'from-indigo-700 to-blue-800',
]

export default function StoryView({ data }: Props) {
  const [activeFrame, setActiveFrame] = useState(0)
  const [copied, setCopied] = useState(false)

  function copyAll() {
    const text = data.stories.map((s, i) => `Frame ${i + 1}: ${s}`).join('\n\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function downloadStory() {
    const text = `STORY — Intenção: ${data.intent}\n\n${data.stories.map((s, i) => `Frame ${i + 1}:\n${s}`).join('\n\n')}`
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'story-contentflow.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xs px-2 py-1 bg-indigo-900/50 text-indigo-300 border border-indigo-800 rounded-full">
          {data.intent}
        </span>
        <span className="text-xs text-gray-500">{data.stories.length} frames</span>
      </div>

      {/* Story preview (portrait) */}
      <div className="mb-6 max-w-xs mx-auto">
        <div className={`bg-gradient-to-br ${STORY_COLORS[activeFrame % STORY_COLORS.length]} rounded-2xl aspect-[9/16] flex flex-col items-center justify-center p-8 relative`}>
          <span className="absolute top-4 left-0 right-0 flex justify-center gap-1.5">
            {data.stories.map((_, i) => (
              <div
                key={i}
                className={`h-0.5 flex-1 rounded-full transition ${i === activeFrame ? 'bg-white' : 'bg-white/30'}`}
              />
            ))}
          </span>
          <p className="text-white text-lg font-semibold text-center leading-relaxed">
            {data.stories[activeFrame]}
          </p>
          <span className="absolute bottom-4 text-white/50 text-xs">
            {activeFrame + 1} / {data.stories.length}
          </span>
        </div>

        {/* Prev/Next */}
        <div className="flex gap-3 mt-3">
          <button
            onClick={() => setActiveFrame(f => Math.max(0, f - 1))}
            disabled={activeFrame === 0}
            className="flex-1 py-2 text-sm bg-gray-800 hover:bg-gray-700 disabled:opacity-30 text-white rounded-lg border border-gray-700 transition"
          >
            ←
          </button>
          <button
            onClick={() => setActiveFrame(f => Math.min(data.stories.length - 1, f + 1))}
            disabled={activeFrame === data.stories.length - 1}
            className="flex-1 py-2 text-sm bg-gray-800 hover:bg-gray-700 disabled:opacity-30 text-white rounded-lg border border-gray-700 transition"
          >
            →
          </button>
        </div>
      </div>

      {/* Frames list */}
      <div className="space-y-2 mb-6">
        {data.stories.map((frame, i) => (
          <div
            key={i}
            onClick={() => setActiveFrame(i)}
            className={`flex gap-3 p-3 rounded-lg cursor-pointer transition ${
              activeFrame === i ? 'bg-gray-800 border border-gray-700' : 'bg-gray-900 border border-gray-900 hover:border-gray-800'
            }`}
          >
            <span className={`flex-shrink-0 w-7 h-7 rounded bg-gradient-to-br ${STORY_COLORS[i % STORY_COLORS.length]} flex items-center justify-center text-xs font-bold text-white`}>
              {i + 1}
            </span>
            <p className="text-sm text-gray-200">{frame}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={copyAll}
          className="flex-1 py-2.5 text-sm font-medium bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-700 transition"
        >
          {copied ? '✓ Copiado' : 'Copiar todos'}
        </button>
        <button
          onClick={downloadStory}
          className="flex-1 py-2.5 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
        >
          ↓ Download
        </button>
      </div>
    </div>
  )
}

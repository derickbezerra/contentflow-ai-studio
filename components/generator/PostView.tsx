'use client'

import { PostOutput } from '@/types'
import { useState } from 'react'

interface Props {
  data: PostOutput
}

export default function PostView({ data }: Props) {
  const [copied, setCopied] = useState(false)

  const fullText = `${data.post.hook}\n\n${data.post.body}\n\n${data.post.cta}`

  function copyPost() {
    navigator.clipboard.writeText(fullText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function downloadPost() {
    const blob = new Blob([`POST — Intenção: ${data.intent}\n\n${fullText}`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'post-contentflow.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <span className="text-xs px-2 py-1 bg-indigo-900/50 text-indigo-300 border border-indigo-800 rounded-full">
          {data.intent}
        </span>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5 mb-6">
        <div>
          <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Hook</span>
          <p className="mt-1.5 text-white font-semibold text-lg leading-snug">{data.post.hook}</p>
        </div>

        <div className="border-t border-gray-800 pt-5">
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Corpo</span>
          <p className="mt-1.5 text-gray-200 leading-relaxed whitespace-pre-line">{data.post.body}</p>
        </div>

        <div className="border-t border-gray-800 pt-5">
          <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">CTA</span>
          <p className="mt-1.5 text-indigo-300 font-medium">{data.post.cta}</p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={copyPost}
          className="flex-1 py-2.5 text-sm font-medium bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-700 transition"
        >
          {copied ? '✓ Copiado' : 'Copiar post'}
        </button>
        <button
          onClick={downloadPost}
          className="flex-1 py-2.5 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition"
        >
          ↓ Download
        </button>
      </div>
    </div>
  )
}

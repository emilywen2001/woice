'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface SoundEntry {
  id: string
  audioUrl: string
  voiceMode: string
  locationLevel: string
  locationText: string | null
  situation: string
  summary: string
  tagsTheme: string[]
  tagsStage: string[]
  tagsEmotion: string[]
  createdAt: string
}

const situationLabels: Record<string, string> = {
  first_try: '第一次尝试',
  career: '职业犹豫',
  identity: '身份转变',
  uncertain: '不确定未来',
}

export default function FeedPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const situation = searchParams.get('situation') || 'first_try'
  const [entries, setEntries] = useState<SoundEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await fetch(`/api/entries?situation=${situation}`)
        if (!response.ok) {
          throw new Error('获取列表失败')
        }
        const data = await response.json()
        setEntries(data)
      } catch (error) {
        console.error('获取列表失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEntries()
  }, [situation])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="text-center text-slate-600">加载中...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-light text-slate-800">
            {situationLabels[situation] || '声音列表'}
          </h1>
          <Link
            href="/listen"
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            ← 返回处境选择
          </Link>
        </div>

        {entries.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center text-slate-600 shadow-sm">
            暂无相关声音
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <Link
                key={entry.id}
                href={`/entry/${entry.id}`}
                className="block rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-slate-400 hover:shadow-md"
              >
                <p className="mb-3 text-slate-800">{entry.summary}</p>
                <div className="flex flex-wrap gap-2">
                  {entry.tagsStage.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                  {entry.tagsEmotion.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                {entry.locationText && (
                  <p className="mt-3 text-xs text-slate-500">
                    {entry.locationText}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

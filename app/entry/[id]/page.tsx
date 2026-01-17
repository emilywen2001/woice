'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

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
  responses: Response[]
}

interface Response {
  id: string
  intent: string
  text: string | null
  createdAt: string
}

const intentLabels: Record<string, string> = {
  resonate: '共鸣',
  support: '支持',
  companion: '陪伴',
  thanks: '感谢',
}

export default function EntryPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [entry, setEntry] = useState<SoundEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedIntent, setSelectedIntent] = useState<string>('')
  const [responseText, setResponseText] = useState('')
  const [showResponseForm, setShowResponseForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const response = await fetch(`/api/entries/${id}`)
        if (!response.ok) {
          throw new Error('获取详情失败')
        }
        const data = await response.json()
        setEntry(data)
      } catch (error) {
        console.error('获取详情失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEntry()
  }, [id])

  const handleSubmitResponse = async () => {
    if (!selectedIntent) {
      alert('请选择回应意图')
      return
    }

    if (responseText.length > 50) {
      alert('回应文本不能超过50字')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/entries/${id}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          intent: selectedIntent,
          text: responseText || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '提交失败')
      }

      // 刷新页面数据
      const entryResponse = await fetch(`/api/entries/${id}`)
      const entryData = await entryResponse.json()
      setEntry(entryData)

      // 重置表单
      setSelectedIntent('')
      setResponseText('')
      setShowResponseForm(false)
      alert('回应已提交')
    } catch (error: any) {
      console.error('提交回应失败:', error)
      alert(error.message || '提交失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="text-center text-slate-600">加载中...</div>
        </div>
      </div>
    )
  }

  if (!entry) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="text-center text-slate-600">未找到该声音</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <button
          onClick={() => router.back()}
          className="mb-6 text-sm text-slate-500 hover:text-slate-700"
        >
          ← 返回
        </button>

        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <p className="mb-6 text-lg leading-relaxed text-slate-800">
            {entry.summary}
          </p>

          <div className="mb-6 flex flex-wrap gap-2">
            {entry.tagsStage.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600"
              >
                {tag}
              </span>
            ))}
            {entry.tagsEmotion.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600"
              >
                {tag}
              </span>
            ))}
          </div>

          {entry.locationText && (
            <p className="mb-6 text-sm text-slate-500">{entry.locationText}</p>
          )}

          <div className="mb-8">
            <audio
              src={entry.audioUrl}
              controls
              className="w-full"
              preload="metadata"
            />
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h3 className="mb-4 text-lg font-medium text-slate-800">
              回应这段声音
            </h3>

            {!showResponseForm ? (
              <button
                onClick={() => setShowResponseForm(true)}
                className="rounded-full border-2 border-slate-300 bg-white px-6 py-2 text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
              >
                回应这段声音
              </button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    回应意图（必选）
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(intentLabels).map(([key, label]) => (
                      <label
                        key={key}
                        className={`flex cursor-pointer items-center rounded-lg border-2 p-3 transition-colors ${
                          selectedIntent === key
                            ? 'border-slate-800 bg-slate-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="intent"
                          value={key}
                          checked={selectedIntent === key}
                          onChange={(e) => setSelectedIntent(e.target.value)}
                          className="mr-2"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    补充一句话（可选，≤50字）
                  </label>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    maxLength={50}
                    rows={3}
                    className="w-full rounded border border-slate-300 px-4 py-2 text-sm"
                    placeholder="说点什么..."
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    {responseText.length}/50
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSubmitResponse}
                    disabled={submitting || !selectedIntent}
                    className="rounded-full bg-slate-800 px-6 py-2 text-white transition-colors hover:bg-slate-700 disabled:bg-slate-400"
                  >
                    {submitting ? '提交中...' : '提交'}
                  </button>
                  <button
                    onClick={() => {
                      setShowResponseForm(false)
                      setSelectedIntent('')
                      setResponseText('')
                    }}
                    className="rounded-full border border-slate-300 px-6 py-2 text-slate-700 hover:bg-slate-50"
                  >
                    取消
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface AIGeneratedCard {
  summary: string
  tags: {
    theme: string[]
    stage: string[]
    emotion: string[]
  }
}

// 常量定义在组件外部，避免重复创建
const locationTexts = {
  none: null,
  country: '东亚·一线城市',
  province: '华东·新一线城市',
  city: '华南·二线城市',
} as const

const situationLabels = {
  first_try: '第一次尝试',
  career: '职业犹豫',
  identity: '身份转变',
  uncertain: '不确定未来',
} as const

export default function PublishPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const audioUrl = searchParams.get('audioUrl') || '/uploads/demo-audio.webm'
  
  const [locationLevel, setLocationLevel] = useState<'none' | 'country' | 'province' | 'city'>('country')
  const [voiceMode, setVoiceMode] = useState<'original' | 'masked'>('masked')
  const [situation, setSituation] = useState<'first_try' | 'career' | 'identity' | 'uncertain'>('first_try')
  const [isPublishing, setIsPublishing] = useState(false)
  const [aiCard, setAiCard] = useState<AIGeneratedCard | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  // 当处境改变时，重新分析
  useEffect(() => {
    if (audioUrl) {
      analyzeAudio()
    }
  }, [situation, audioUrl])

  // AI分析音频
  const analyzeAudio = async () => {
    setIsAnalyzing(true)
    setAnalysisError(null)
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioUrl,
          situation,
          // 实际项目中这里应该传入ASR转写的文本
          // 当前使用mock文本
        }),
      })

      if (!response.ok) {
        throw new Error('AI分析失败')
      }

      const data = await response.json()
      setAiCard(data)
    } catch (error: any) {
      console.error('分析失败:', error)
      setAnalysisError('AI分析失败，将使用默认摘要')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handlePublish = async () => {
    setIsPublishing(true)
    try {
      // 使用上传的音频URL或示例音频
      const finalAudioUrl = audioUrl

      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioUrl: finalAudioUrl,
          voiceMode,
          locationLevel,
          locationText: locationTexts[locationLevel],
          situation,
          // 如果AI已生成卡片，使用AI生成的内容；否则让后端重新生成
          aiSummary: aiCard?.summary,
          aiTags: aiCard?.tags,
        }),
      })

      if (!response.ok) {
        throw new Error('发布失败')
      }

      const data = await response.json()
      
      // 跳转到详情页
      router.push(`/entry/${data.id}`)
    } catch (error) {
      console.error('发布失败:', error)
      alert('发布失败，请重试')
      setIsPublishing(false)
    }
  }

  // 手动触发AI分析
  const handleReanalyze = () => {
    analyzeAudio()
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-purple-900 via-indigo-900 to-black text-white px-6 py-16">
      {/* 背景动态装饰（模拟声波感） */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-1/4 left-[-10%] w-[50%] h-[50%] bg-purple-500 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[110px]"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-2xl w-full">
        <h1 className="mb-8 text-center text-4xl md:text-5xl font-extrabold tracking-tight">
          发布确认
        </h1>

        {/* AI生成的经历卡片预览 */}
        {isAnalyzing && (
          <div className="mb-6 rounded-xl border border-blue-400/30 bg-white/10 backdrop-blur-md p-4 text-center text-sm">
            🤖 AI正在分析你的录音并生成经历卡片...
          </div>
        )}

        {aiCard && !isAnalyzing && (
          <div className="mb-6 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">AI生成的经历卡片</h3>
              <button
                onClick={handleReanalyze}
                className="text-xs opacity-70 hover:opacity-100 transition"
              >
                重新分析
              </button>
            </div>
            
            <p className="mb-4 leading-relaxed opacity-90">
              {aiCard.summary}
            </p>
            
            <div className="flex flex-wrap gap-2">
              {aiCard.tags.stage.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-blue-500/30 px-3 py-1 text-xs backdrop-blur-sm border border-blue-400/30"
                >
                  {tag}
                </span>
              ))}
              {aiCard.tags.emotion.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-purple-500/30 px-3 py-1 text-xs backdrop-blur-sm border border-purple-400/30"
                >
                  {tag}
                </span>
              ))}
              {aiCard.tags.theme.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-green-500/30 px-3 py-1 text-xs backdrop-blur-sm border border-green-400/30"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {analysisError && (
          <div className="mb-6 rounded-xl border border-yellow-400/30 bg-yellow-500/10 backdrop-blur-md p-4 text-sm">
            ⚠️ {analysisError}
          </div>
        )}

        <div className="mb-8 space-y-6 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-6 shadow-2xl">
          <div>
            <label className="mb-3 block text-sm font-semibold tracking-wide">
              声音模式
            </label>
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer group">
                <input
                  type="radio"
                  value="masked"
                  checked={voiceMode === 'masked'}
                  onChange={(e) => setVoiceMode(e.target.value as 'masked')}
                  className="mr-2 accent-purple-500"
                />
                <span className="group-hover:opacity-100 opacity-90 transition">变声</span>
              </label>
              <label className="flex items-center cursor-pointer group">
                <input
                  type="radio"
                  value="original"
                  checked={voiceMode === 'original'}
                  onChange={(e) => setVoiceMode(e.target.value as 'original')}
                  className="mr-2 accent-purple-500"
                />
                <span className="group-hover:opacity-100 opacity-90 transition">原声</span>
              </label>
            </div>
          </div>

          <div>
            <label className="mb-3 block text-sm font-semibold tracking-wide">
              地点信息（可选）
            </label>
            <select
              value={locationLevel}
              onChange={(e) => setLocationLevel(e.target.value as typeof locationLevel)}
              className="w-full rounded-lg border border-white/30 bg-white/10 backdrop-blur-sm px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="none" className="bg-slate-900">不显示</option>
              <option value="country" className="bg-slate-900">国家/大区</option>
              <option value="province" className="bg-slate-900">省/城市</option>
              <option value="city" className="bg-slate-900">城市</option>
            </select>
            {locationLevel !== 'none' && (
              <p className="mt-2 text-sm opacity-70">
                将显示为：{locationTexts[locationLevel]}
              </p>
            )}
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="px-10 py-4 bg-white text-purple-900 rounded-full font-semibold hover:bg-opacity-90 transition shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPublishing ? '发布中...' : '发布'}
          </button>
        </div>
      </div>
    </div>
  )
}

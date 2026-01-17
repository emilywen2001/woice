'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

// 动态导入地图组件（避免SSR问题）
const WorldMap = dynamic(() => import('@/components/WorldMap'), { 
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center bg-slate-100 text-slate-500">加载地图中...</div>
})

interface Message {
  id: string
  role: 'user' | 'bot'
  content: string
  timestamp: Date
}

interface AllEntry {
  id: string
  location: {
    city: string
    province: string
    country: string
  }
  geo: {
    lat: number
    lon: number
  }
  ai_summary: string
  keywords: string[]
  meta: {
    situation: string
    stage: string
    emotion: string[]
  }
}

interface MatchedEntry extends AllEntry {
  matchedKeywords?: string[]
  similarity?: number
}

export default function ListenPage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'bot',
      content: '你好，我是 Her Voice 的助手。你可以描述你当前的处境或想了解的经历，我会为你找到相关的女性声音。',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [allEntries, setAllEntries] = useState<AllEntry[]>([])
  const [matchedEntries, setMatchedEntries] = useState<MatchedEntry[]>([])
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null)
  const [queryKeywords, setQueryKeywords] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // 页面加载时获取所有数据
  useEffect(() => {
    const fetchAllEntries = async () => {
      try {
        console.log('[前端] 开始请求 /api/chatbot/all')
        const response = await fetch('/api/chatbot/all')
        console.log('[前端] 响应状态:', response.status, response.statusText)
        
        if (response.ok) {
          const data = await response.json()
          console.log('[前端] 获取到数据:', data.entries?.length || 0, '条')
          
          if (data.error) {
            console.error('[前端] API返回错误:', data.error)
          }
          
          if (data.entries && data.entries.length > 0) {
            console.log('[前端] 第一条数据示例:', data.entries[0])
            setAllEntries(data.entries)
          } else {
            console.warn('[前端] 数据为空，请检查后端日志')
            setAllEntries([])
          }
        } else {
          const errorText = await response.text()
          console.error('[前端] 获取数据失败，状态码:', response.status)
          console.error('[前端] 错误内容:', errorText)
          // 即使API失败，也设置空数组，避免页面崩溃
          setAllEntries([])
        }
      } catch (error: any) {
        console.error('[前端] 获取数据异常:', error.message)
        console.error('[前端] 错误堆栈:', error.stack)
      }
    }
    fetchAllEntries()
  }, [])

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setSelectedEntryId(null)

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input.trim() }),
      })

      if (!response.ok) {
        throw new Error('查询失败')
      }

      const data = await response.json()

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: data.response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
      setMatchedEntries(data.entries || [])
      setQueryKeywords(data.queryKeywords || [])
    } catch (error) {
      console.error('发送消息失败:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'bot',
        content: '抱歉，查询时出现了错误，请稍后重试。',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
      setMatchedEntries([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleEntryClick = (entryId: string) => {
    console.log('准备跳转到详情页:', entryId)
    // 暂时先显示详情，不跳转
    const entry = allEntries.find(e => e.id === entryId) || matchedEntries.find(e => e.id === entryId)
    if (entry) {
      // 显示详情弹窗或跳转
      alert(`城市: ${entry.location.city}\n摘要: ${entry.ai_summary}\n关键词: ${entry.keywords.join(', ')}`)
    }
    // router.push(`/entry/${entryId}`)
  }

  const handleResponse = async (entryId: string, intent: 'resonate' | 'support' | 'companion' | 'thanks') => {
    try {
      const response = await fetch(`/api/entries/${entryId}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          intent,
          text: '', // 可选文本
        }),
      })

      if (response.ok) {
        console.log(`已提交${intent}回应`)
        // 可以显示成功提示
      } else {
        console.error('提交回应失败')
      }
    } catch (error) {
      console.error('提交回应异常:', error)
    }
  }

  const handleEntryHover = (entryId: string | null) => {
    setSelectedEntryId(entryId)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-950">
      {/* 左侧：Chatbot界面 */}
      <div className="flex w-1/4 flex-col border-r border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="border-b border-white/10 p-4">
          <h1 className="text-xl font-light text-white">我想听听她们的经历</h1>
          <p className="mt-1 text-xs text-white/70">描述你的处境，我会为你找到相关的经历</p>
        </div>

        {/* 消息列表 */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 text-xs ${
                    message.role === 'user'
                      ? 'bg-white text-purple-900'
                      : 'bg-white/10 backdrop-blur-md border border-white/20 text-white'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-white/10 backdrop-blur-md border border-white/20 px-3 py-2">
                  <div className="flex space-x-1">
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60"></div>
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60" style={{ animationDelay: '0.1s' }}></div>
                    <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/60" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 匹配结果列表 */}
          {matchedEntries.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="text-xs font-medium text-white/80 mb-2">
                匹配结果 ({matchedEntries.length} 条)
                {queryKeywords.length > 0 && (
                  <span className="ml-2 text-white/50">
                    关键词: {queryKeywords.slice(0, 3).join(', ')}
                  </span>
                )}
              </div>
              {matchedEntries.map((entry) => (
                <div
                  key={entry.id}
                  onMouseEnter={() => handleEntryHover(entry.id)}
                  onMouseLeave={() => handleEntryHover(null)}
                  className={`rounded-lg border-2 p-3 transition-all backdrop-blur-md ${
                    selectedEntryId === entry.id
                      ? 'border-violet-400 bg-violet-500/20 shadow-lg'
                      : 'border-white/20 bg-white/10 hover:border-white/30 hover:shadow-md'
                  }`}
                >
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="text-xs font-medium text-white">
                      {entry.location.city}
                    </h3>
                    {/* 播放按钮 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        // TODO: 实现音频播放功能
                        console.log('播放音频:', entry.id)
                      }}
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-purple-900 transition-colors hover:bg-white/90 shadow-md"
                      title="播放语音"
                    >
                      <svg
                        className="h-3 w-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </button>
                  </div>
                  <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-white/90">
                    {entry.ai_summary}
                  </p>
                  {entry.meta.stage && (
                    <div className="mb-3 text-xs text-white/70">
                      {entry.meta.stage} · {entry.meta.emotion.join('、')}
                    </div>
                  )}
                  {/* 四个意图按钮 */}
                  <div className="flex gap-2 border-t border-white/10 pt-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleResponse(entry.id, 'resonate')
                      }}
                      className="flex-1 rounded bg-white/10 px-2 py-1.5 text-xs text-white transition-colors hover:bg-white/20"
                    >
                      共鸣
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleResponse(entry.id, 'support')
                      }}
                      className="flex-1 rounded bg-white/10 px-2 py-1.5 text-xs text-white transition-colors hover:bg-white/20"
                    >
                      支持
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleResponse(entry.id, 'companion')
                      }}
                      className="flex-1 rounded bg-white/10 px-2 py-1.5 text-xs text-white transition-colors hover:bg-white/20"
                    >
                      陪伴
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleResponse(entry.id, 'thanks')
                      }}
                      className="flex-1 rounded bg-white/10 px-2 py-1.5 text-xs text-white transition-colors hover:bg-white/20"
                    >
                      感谢
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 输入框 */}
        <div className="border-t border-white/10 p-3">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="描述你的处境或想了解的经历..."
              className="flex-1 resize-none rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm px-3 py-2 text-xs text-white placeholder-white/50 focus:border-white/40 focus:outline-none"
              rows={2}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="rounded-lg bg-white text-purple-900 px-4 py-2 text-xs font-semibold transition-colors hover:bg-white/90 disabled:opacity-50"
            >
              发送
            </button>
          </div>
        </div>
      </div>

      {/* 右侧：世界地图 */}
      <div className="flex w-3/4 flex-col">
        <div className="border-b border-white/10 bg-black/10 backdrop-blur-sm p-4">
          <h2 className="text-lg font-light text-white">声音分布地图</h2>
          <p className="mt-1 text-xs text-white/70">
            {matchedEntries.length > 0
              ? `找到 ${matchedEntries.length} 段相关经历，地图上高亮显示`
              : `共 ${allEntries.length} 段经历，在地图上查看声音的位置`}
          </p>
        </div>
        <div className="flex-1 overflow-hidden">
          <WorldMap 
            allEntries={allEntries}
            matchedEntries={matchedEntries}
            selectedEntryId={selectedEntryId}
            onEntryClick={handleEntryClick}
            onEntryHover={handleEntryHover}
          />
        </div>
      </div>
    </div>
  )
}

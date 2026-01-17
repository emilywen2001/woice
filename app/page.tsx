'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [isAudioMuted, setIsAudioMuted] = useState(true)
  const [isPlayingGuidance, setIsPlayingGuidance] = useState(false)
  const [showWaveAnimation, setShowWaveAnimation] = useState(false)
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null)
  const guidanceAudioRef = useRef<HTMLAudioElement | null>(null)

  // 初始化环境音效
  useEffect(() => {
    // 创建环境音效（白噪音/海浪声）
    // 注意：实际使用时需要替换为真实的音频文件URL
    ambientAudioRef.current = new Audio()
    ambientAudioRef.current.loop = true
    ambientAudioRef.current.volume = 0.3
    // ambientAudioRef.current.src = '/audio/ambient-sea.mp3' // 需要添加音频文件

    // 创建AI语音引导
    guidanceAudioRef.current = new Audio()
    guidanceAudioRef.current.volume = 0.7
    // guidanceAudioRef.current.src = '/audio/guidance-voice.mp3' // 需要添加音频文件

    return () => {
      ambientAudioRef.current?.pause()
      guidanceAudioRef.current?.pause()
    }
  }, [])

  // 切换环境音效
  const toggleAmbientAudio = () => {
    if (!ambientAudioRef.current) return

    if (isAudioMuted) {
      ambientAudioRef.current.play().catch(console.error)
      setIsAudioMuted(false)
    } else {
      ambientAudioRef.current.pause()
      setIsAudioMuted(true)
    }
  }

  // 处理录音按钮点击
  const handleRecordClick = (e: React.MouseEvent) => {
    e.preventDefault()
    
    // 延迟0.5秒播放AI语音引导
    setTimeout(() => {
      if (guidanceAudioRef.current) {
        setIsPlayingGuidance(true)
        setShowWaveAnimation(true)
        
        // 模拟播放（实际需要真实音频文件）
        // guidanceAudioRef.current.play()
        
        // 模拟音频播放时长（3秒）
        setTimeout(() => {
          setIsPlayingGuidance(false)
          setShowWaveAnimation(false)
          // 跳转到录音页面
          router.push('/record')
        }, 3000)
      } else {
        router.push('/record')
      }
    }, 500)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-950">
      {/* 波浪背景装饰 */}
      <div className="woice-wave-bg" />
      
      {/* 额外的光晕装饰 */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute top-1/4 left-[-10%] w-[50%] h-[50%] bg-violet-500 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-[-10%] w-[40%] h-[40%] bg-purple-500 rounded-full blur-[110px]"></div>
      </div>

      {/* Logo - 极简设计 */}
      <div className="absolute top-8 left-8 z-20">
        <div className="text-2xl font-bold tracking-tighter text-white">Woice</div>
      </div>

      {/* 极简导航 - 右上角 */}
      <nav className="absolute top-8 right-8 z-20 flex items-center space-x-8 text-sm text-white/80">
        <a href="#" className="hover:text-white transition-colors">探索</a>
        <a href="#" className="hover:text-white transition-colors">关于</a>
        <button
          onClick={toggleAmbientAudio}
          className="group relative flex items-center gap-2 transition-colors hover:text-white"
          title={isAudioMuted ? '点击开启远方的呼唤' : '静音'}
        >
          {isAudioMuted ? (
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
              />
            </svg>
          ) : (
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
            </svg>
          )}
        </button>
      </nav>

      {/* 主要内容 */}
      <main className="relative z-10 w-full max-w-4xl px-6 text-center">
        {/* 主标题 */}
        <h1 
          className="mb-8 text-4xl md:text-6xl font-light text-white tracking-tight whitespace-nowrap"
          style={{ 
            animation: 'fade-in 0.8s ease-out forwards',
            opacity: 0
          }}
        >
          每段声音，都来自真实的人生瞬间
        </h1>
        
        {/* 副标题 - 两行 */}
        <div 
          className="mb-12 text-xl md:text-2xl font-light text-white/90"
          style={{ 
            lineHeight: '1.8',
            animation: 'fade-in 0.8s ease-out 0.2s forwards',
            opacity: 0
          }}
        >
          <p>我们讲述、倾听</p>
          <p>在声音中，彼此照亮</p>
        </div>

        {/* 毛玻璃效果按钮组 */}
        <div 
          className="flex flex-col md:flex-row gap-4 justify-center"
          style={{ 
            animation: 'fade-in 0.8s ease-out 0.4s forwards',
            opacity: 0
          }}
        >
          {/* 主按钮 - 白色实心，紫色文字 */}
          <Link
            href="/record"
            onClick={handleRecordClick}
            className="px-8 py-4 bg-white text-purple-900 rounded-full font-semibold hover:bg-opacity-90 transition shadow-lg"
          >
            分享一个瞬间
          </Link>
          
          {/* 次按钮 - 毛玻璃效果 */}
          <Link
            href="/listen"
            className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full font-semibold text-white hover:bg-white/20 transition"
          >
            听听她们的声音
          </Link>
        </div>
      </main>
      
      {/* 底部装饰 - 向下箭头 */}
      <div className="absolute bottom-10 z-10 animate-bounce opacity-50">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
        </svg>
      </div>

      {/* 底部波浪动画 - AI语音引导时显示 */}
      {showWaveAnimation && (
        <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 flex items-end justify-center gap-1">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-slate-400/30 rounded-t"
                style={{
                  height: `${20 + Math.sin(i * 0.5) * 15}px`,
                  animation: `wave 1.5s ease-in-out infinite`,
                  animationDelay: `${i * 0.05}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
          opacity: 0;
        }

        @keyframes wave {
          0%, 100% {
            transform: scaleY(1);
          }
          50% {
            transform: scaleY(1.5);
          }
        }
      `}</style>
    </div>
  )
}

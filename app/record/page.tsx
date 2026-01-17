'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface RecordingStage {
  stage: 'idle' | 'background' | 'experience' | 'reflection' | 'complete'
}

const STAGE_CONFIG = {
  background: {
    title: '第一段:背景',
    prompt: [
      '回到那个时刻',
      '当时的你在哪',
      '身边有谁',
      '你正处于什么样的状态',
    ],
    duration: 30,
    maxDuration: 40,
    buttonText: '讲述那一刻',
  },
  experience: {
    title: '第二段:关键点',
    prompt: [
      '那天发生了什么',
      '是哪一个瞬间',
      '哪一句话',
      '让你直到现在还记得',
    ],
    duration: 40,
    maxDuration: 60,
    buttonText: '回到现在',
  },
  reflection: {
    title: '第三段:后来',
    prompt: [
      '尘埃落定后',
      '你想对当时的自己说点什么',
      '现在的你',
      '还好吗',
    ],
    duration: 30,
    maxDuration: 40,
    buttonText: '生成声音卡片',
  },
}

export default function RecordPage() {
  const router = useRouter()
  const [stage, setStage] = useState<RecordingStage['stage']>('idle')
  const [isRecording, setIsRecording] = useState(false)
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const allRecordingsRef = useRef<Blob[]>([]) // 存储所有三段录音

  const startRecording = async () => {
    setError(null)
    
    // 检查浏览器支持
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('您的浏览器不支持录音功能，请使用 Chrome、Edge 或 Firefox 浏览器')
      return
    }

    // 检查 MediaRecorder 支持
    if (!window.MediaRecorder) {
      setError('您的浏览器不支持 MediaRecorder，请更新浏览器或使用 Chrome、Edge')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const audioUrl = URL.createObjectURL(audioBlob)
        setRecordedAudio(audioUrl)
        // 保存当前段录音
        allRecordingsRef.current.push(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error: any) {
      console.error('录音失败:', error)
      
      let errorMessage = '无法访问麦克风'
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = '麦克风权限被拒绝。\n\n本地开发环境解决步骤：\n1. 点击地址栏左侧的锁图标（或信息图标）\n2. 找到"麦克风"权限，选择"允许"\n3. 如果使用 Chrome/Edge，可能需要访问 chrome://settings/content/microphone 允许 localhost\n4. 刷新页面后重试\n\n提示：如果用于演示，也可以跳过录音，直接使用示例音频继续。'
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = '未检测到麦克风设备。请检查麦克风是否已连接并启用。'
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage = '麦克风被其他应用占用。请关闭其他正在使用麦克风的应用后重试。'
      } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
        errorMessage = '无法满足录音要求。请检查麦克风设置。'
      } else {
        errorMessage = `录音失败：${error.message || '未知错误'}。请检查浏览器权限设置。`
      }
      
      setError(errorMessage)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleNext = () => {
    if (stage === 'idle') {
      setStage('background')
    } else if (stage === 'background') {
      setStage('experience')
    } else if (stage === 'experience') {
      setStage('reflection')
    } else if (stage === 'reflection') {
      setStage('complete')
    }
  }

  // 上传所有录音并合并
  const uploadAndAnalyze = async () => {
    setIsUploading(true)
    setError(null)

    try {
      // 合并所有录音段
      const combinedBlob = new Blob(allRecordingsRef.current, { type: 'audio/webm' })
      
      // 上传音频文件
      const formData = new FormData()
      formData.append('file', combinedBlob, 'recording.webm')

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error('音频上传失败')
      }

      const uploadData = await uploadResponse.json()
      setUploadedAudioUrl(uploadData.audioUrl)

      // 跳转到发布确认页，传递音频URL
      router.push(`/publish?audioUrl=${encodeURIComponent(uploadData.audioUrl)}`)
    } catch (error: any) {
      console.error('上传失败:', error)
      setError(`上传失败：${error.message}`)
      setIsUploading(false)
    }
  }

  const handleContinue = () => {
    if (stage === 'complete') {
      // 上传音频并跳转到发布确认页
      uploadAndAnalyze()
    } else {
      // 重置并进入下一阶段
      setRecordedAudio(null)
      audioChunksRef.current = []
      handleNext()
    }
  }

  // 跳过录音，使用示例音频（用于演示）
  const handleSkipRecording = async () => {
    setRecordedAudio('/uploads/demo-audio.webm') // 使用示例音频
    setError(null)
    // 直接跳转到发布确认页
    router.push('/publish?audioUrl=/uploads/demo-audio.webm')
  }

  const config = stage !== 'idle' && stage !== 'complete' ? STAGE_CONFIG[stage] : null

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-950 px-6 py-16">
      {/* 波浪背景装饰 */}
      <div className="woice-wave-bg" />
      
      <div className="relative z-10 mx-auto w-full max-w-2xl">
        {stage === 'idle' && (
          <div className="text-center">
            <div className="mb-12 text-xl md:text-2xl font-light leading-relaxed text-white/90">
              <p>女性的一生中</p>
              <p>都有许多值得讲述的时刻</p>
              <p>那些你曾走过的路</p>
              <p>曾有过的感悟</p>
              <p>或许正是另一位女性此刻需要的力量</p>
            </div>
            <button
              onClick={handleNext}
              className="px-8 py-4 bg-white text-purple-900 rounded-full font-semibold hover:bg-opacity-90 transition shadow-lg"
            >
              让声音被听见
            </button>
          </div>
        )}

        {stage !== 'idle' && stage !== 'complete' && config && (
          <div className="text-center">
            <div className="mb-12">
              <h2 className="text-2xl md:text-3xl font-semibold text-white">
                {config.title} ({config.duration}-{config.maxDuration}s)
              </h2>
            </div>
            <div className="mb-12 text-2xl md:text-3xl font-light text-white leading-relaxed">
              {Array.isArray(config.prompt) ? (
                config.prompt.map((line, index) => (
                  <p key={index}>{line}</p>
                ))
              ) : (
                <p>{config.prompt}</p>
              )}
            </div>

            {error && (
              <div className="mb-6 rounded-xl border border-red-400/30 bg-red-500/10 backdrop-blur-md p-4 text-left text-sm text-white">
                <p className="font-medium mb-2">⚠️ 录音权限问题</p>
                <p className="mb-3 whitespace-pre-line opacity-90">{error}</p>
                <div className="text-xs text-white/80 space-y-1">
                  <p><strong>本地开发环境解决步骤：</strong></p>
                  <ol className="list-decimal list-inside space-y-1 ml-2">
                    <li>点击浏览器地址栏左侧的锁图标</li>
                    <li>找到"麦克风"权限设置</li>
                    <li>选择"允许"</li>
                    <li>刷新页面后重试</li>
                  </ol>
                  <p className="mt-2"><strong>演示用途：</strong>如果用于演示，可以点击下方"使用示例音频"按钮跳过录音步骤。</p>
                </div>
              </div>
            )}

            {!recordedAudio && (
              <div className="mb-8 space-y-4">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="px-8 py-4 bg-white text-purple-900 rounded-full font-semibold hover:bg-opacity-90 transition shadow-lg"
                  >
                    🎙️ 开始录音
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="px-8 py-4 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 transition shadow-lg"
                  >
                    ⏹️ 停止录音
                  </button>
                )}
                
                {/* 演示模式：跳过录音按钮 */}
                {error && (
                  <div>
                    <button
                      onClick={handleSkipRecording}
                      className="px-6 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-sm text-white hover:bg-white/20 transition"
                    >
                      使用示例音频继续（演示模式）
                    </button>
                  </div>
                )}
              </div>
            )}

            {recordedAudio && (
              <div className="mb-8">
                <audio src={recordedAudio} controls className="mx-auto mb-6" />
                <div className="mt-4 flex gap-4 justify-center">
                  <button
                    onClick={() => {
                      setRecordedAudio(null)
                      audioChunksRef.current = []
                      setError(null)
                    }}
                    className="px-6 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/20 transition"
                  >
                    重新录制
                  </button>
                  <button
                    onClick={handleContinue}
                    className="px-6 py-2 bg-white text-purple-900 rounded-full font-semibold hover:bg-opacity-90 transition shadow-lg"
                  >
                    {config.buttonText}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {stage === 'complete' && (
          <div className="text-center">
            <h2 className="mb-6 text-3xl md:text-4xl font-light text-white">
              录音完成
            </h2>
            <p className="mb-12 text-xl text-white/80">
              接下来，我们将为你整理这段经历
            </p>
            {error && (
              <div className="mb-6 rounded-xl border border-red-400/30 bg-red-500/10 backdrop-blur-md p-4 text-sm text-white">
                {error}
              </div>
            )}
            <button
              onClick={handleContinue}
              disabled={isUploading}
              className="px-8 py-4 bg-white text-purple-900 rounded-full font-semibold hover:bg-opacity-90 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? '正在上传并分析...' : '生成声音卡片'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

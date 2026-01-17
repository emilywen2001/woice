import { NextRequest, NextResponse } from 'next/server'
import { generateAISummary } from '@/lib/ai'

/**
 * POST /api/analyze
 * 分析音频并生成经历卡片
 * 接收音频URL和处境，返回AI生成的摘要和标签
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { audioUrl, situation, audioText } = body

    if (!situation) {
      return NextResponse.json({ error: '缺少处境参数' }, { status: 400 })
    }

    // 如果有音频转写文本，直接使用；否则使用mock文本
    // 实际项目中应该调用ASR服务将音频转为文字
    const textToAnalyze = audioText || `这是一段关于${situation}的经历录音，用户分享了她的真实感受和思考过程。`

    // 调用AI生成摘要和标签
    const aiResult = await generateAISummary(textToAnalyze, situation)

    return NextResponse.json({
      summary: aiResult.summary,
      tags: aiResult.tags,
    })
  } catch (error) {
    console.error('分析失败:', error)
    return NextResponse.json({ error: '分析失败' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateAISummary } from '@/lib/ai'
import { v4 as uuidv4 } from 'uuid'

// GET /api/entries - 获取推荐列表
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const situation = searchParams.get('situation')

    const where = situation ? { situation } : {}

    const entries = await prisma.soundEntry.findMany({
      where,
      orderBy: [
        { createdAt: 'desc' }, // 时间排序（弱排序）
      ],
      include: {
        responses: true,
      },
    })

    // 不返回热度信息，只返回基本数据
    const result = entries.map((entry) => ({
      id: entry.id,
      audioUrl: entry.audioUrl,
      voiceMode: entry.voiceMode,
      locationLevel: entry.locationLevel,
      locationText: entry.locationText,
      situation: entry.situation,
      summary: entry.summary,
      tagsTheme: JSON.parse(entry.tagsTheme),
      tagsStage: JSON.parse(entry.tagsStage),
      tagsEmotion: JSON.parse(entry.tagsEmotion),
      createdAt: entry.createdAt,
      // 不返回ownerToken
      // 不返回回应数量（避免热度暗示）
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error('获取条目失败:', error)
    return NextResponse.json({ error: '获取条目失败' }, { status: 500 })
  }
}

// POST /api/entries - 创建声音条目
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { audioUrl, voiceMode, locationLevel, locationText, situation, aiSummary, aiTags } = body

    if (!audioUrl || !situation) {
      return NextResponse.json({ error: '缺少必需字段' }, { status: 400 })
    }

    // 如果前端已提供AI生成的内容，直接使用；否则重新生成
    let aiResult
    if (aiSummary && aiTags) {
      aiResult = {
        summary: aiSummary,
        tags: aiTags,
      }
    } else {
      // 调用AI生成摘要和标签
      // 由于没有真实音频转写，这里使用模拟文本
      const mockAudioText = `这是一段关于${situation}的经历录音`
      aiResult = await generateAISummary(mockAudioText, situation)
    }

    // 创建条目
    const entry = await prisma.soundEntry.create({
      data: {
        audioUrl,
        voiceMode: voiceMode || 'masked',
        locationLevel: locationLevel || 'none',
        locationText: locationText || null,
        situation,
        summary: aiResult.summary,
        tagsTheme: JSON.stringify(aiResult.tags.theme),
        tagsStage: JSON.stringify(aiResult.tags.stage),
        tagsEmotion: JSON.stringify(aiResult.tags.emotion),
        ownerToken: uuidv4(),
      },
    })

    return NextResponse.json({
      id: entry.id,
      summary: entry.summary,
      tags: {
        theme: JSON.parse(entry.tagsTheme),
        stage: JSON.parse(entry.tagsStage),
        emotion: JSON.parse(entry.tagsEmotion),
      },
      ownerToken: entry.ownerToken,
    })
  } catch (error) {
    console.error('创建条目失败:', error)
    return NextResponse.json({ error: '创建条目失败' }, { status: 500 })
  }
}

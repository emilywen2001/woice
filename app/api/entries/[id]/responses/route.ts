import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/entries/:id/responses - 提交回应
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { intent, text } = body

    if (!intent) {
      return NextResponse.json({ error: '缺少回应意图' }, { status: 400 })
    }

    // 验证意图类型
    const validIntents = ['resonate', 'support', 'companion', 'thanks']
    if (!validIntents.includes(intent)) {
      return NextResponse.json({ error: '无效的回应意图' }, { status: 400 })
    }

    // 验证文本长度（≤50字）
    if (text && text.length > 50) {
      return NextResponse.json({ error: '回应文本不能超过50字' }, { status: 400 })
    }

    // 过滤指导性语言
    const guidanceKeywords = ['你应该', '建议你', '必须', '一定要', '最好', '必须']
    if (text && guidanceKeywords.some((keyword) => text.includes(keyword))) {
      return NextResponse.json({ error: '回应文本不应包含指导性语言' }, { status: 400 })
    }

    // 检查条目是否存在
    const entry = await prisma.soundEntry.findUnique({
      where: { id },
    })

    if (!entry) {
      return NextResponse.json({ error: '条目不存在' }, { status: 404 })
    }

    // 创建回应
    const response = await prisma.response.create({
      data: {
        entryId: id,
        intent,
        text: text || null,
      },
    })

    return NextResponse.json({
      id: response.id,
      intent: response.intent,
      text: response.text,
      createdAt: response.createdAt,
    })
  } catch (error) {
    console.error('创建回应失败:', error)
    return NextResponse.json({ error: '创建回应失败' }, { status: 500 })
  }
}

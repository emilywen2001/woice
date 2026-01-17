import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/entries/:id - 获取详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const entry = await prisma.soundEntry.findUnique({
      where: { id },
      include: {
        responses: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!entry) {
      return NextResponse.json({ error: '条目不存在' }, { status: 404 })
    }

    return NextResponse.json({
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
      responses: entry.responses.map((r) => ({
        id: r.id,
        intent: r.intent,
        text: r.text,
        createdAt: r.createdAt,
      })),
    })
  } catch (error) {
    console.error('获取详情失败:', error)
    return NextResponse.json({ error: '获取详情失败' }, { status: 500 })
  }
}

// DELETE /api/entries/:id - 删除条目
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const ownerToken = request.headers.get('X-Owner-Token')

    if (!ownerToken) {
      return NextResponse.json({ error: '缺少所有者令牌' }, { status: 401 })
    }

    const entry = await prisma.soundEntry.findUnique({
      where: { id },
    })

    if (!entry) {
      return NextResponse.json({ error: '条目不存在' }, { status: 404 })
    }

    if (entry.ownerToken !== ownerToken) {
      return NextResponse.json({ error: '无权删除' }, { status: 403 })
    }

    await prisma.soundEntry.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除失败:', error)
    return NextResponse.json({ error: '删除失败' }, { status: 500 })
  }
}

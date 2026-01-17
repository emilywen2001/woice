import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: '没有文件' }, { status: 400 })
    }

    // 创建uploads目录（如果不存在）
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // 生成唯一文件名
    const filename = `${uuidv4()}.webm`
    const filepath = join(uploadsDir, filename)

    // 保存文件
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    return NextResponse.json({ audioUrl: `/uploads/${filename}` })
  } catch (error) {
    console.error('上传失败:', error)
    return NextResponse.json({ error: '上传失败' }, { status: 500 })
  }
}

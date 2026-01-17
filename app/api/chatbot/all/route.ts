import { NextRequest, NextResponse } from 'next/server'
import { loadSampleData } from '@/lib/data-loader'

/**
 * GET /api/chatbot/all
 * 获取所有样本数据（用于地图全量显示）
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[API] GET /api/chatbot/all - 开始加载数据')
    const allEntries = loadSampleData()
    console.log('[API] GET /api/chatbot/all - 加载了', allEntries.length, '条数据')
    
    if (allEntries.length === 0) {
      console.warn('[API] 警告：没有加载到任何数据')
      return NextResponse.json({ 
        entries: [],
        error: '未找到数据'
      })
    }
    
    const mappedEntries = allEntries.map((entry) => {
      // 确保geo数据存在且有效
      if (!entry.geo || !entry.geo.lat || !entry.geo.lon) {
        console.warn(`[API] Entry ${entry.id} 缺少有效的geo数据:`, entry.geo)
      }
      
      return {
        id: entry.id,
        location: entry.location,
        geo: entry.geo,
        ai_summary: entry.ai_summary,
        keywords: entry.keywords,
        meta: entry.meta,
      }
    })
    
    console.log('[API] 返回', mappedEntries.length, '条数据')
    return NextResponse.json({
      entries: mappedEntries,
    })
  } catch (error: any) {
    console.error('[API] 获取所有数据失败:', error.message)
    console.error('[API] 错误堆栈:', error.stack)
    return NextResponse.json({ 
      entries: [],
      error: '获取数据失败: ' + error.message 
    }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { loadSampleData, SampleEntry, calculateTextSimilarity } from '@/lib/data-loader'
import { generateEmbedding, cosineSimilarity, getEntryEmbeddingText } from '@/lib/embedding'

interface MatchedEntry {
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
  matchedKeywords?: string[] // 命中的关键词
  similarity?: number // 相似度分数
}

/**
 * POST /api/chatbot
 * 根据用户输入，使用关键词匹配 + embedding相似度匹配最相关的3-5条经历
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: '缺少消息内容' }, { status: 400 })
    }

    // 1. 加载所有样本数据
    const allEntries = loadSampleData()

    // 2. LLM 关键词提取
    const apiKey = process.env.ZHIPU_API_KEY || process.env.OPENAI_API_KEY
    let queryKeywords: string[] = []
    let situation: string | null = null

    if (apiKey && apiKey !== 'your-api-key-here') {
      try {
        const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'glm-4',
            messages: [
              {
                role: 'system',
                content: `你是一个搜索助手。分析用户的输入，提取：
1. query_keywords：5-10个名词或名词短语（数组格式）
2. situation：first_try / career / identity / uncertain（如果没有则返回null）

要求：
- 不给建议
- 不输出价值判断
- query_keywords尽量贴近数据中已有keywords的风格

请以JSON格式返回：
{
  "query_keywords": ["关键词1", "关键词2"],
  "situation": "first_try" 或 null
}`,
              },
              {
                role: 'user',
                content: message,
              },
            ],
            temperature: 0.3,
            response_format: { type: 'json_object' },
          }),
        })

        if (response.ok) {
          const data = await response.json()
          const content = data.choices[0]?.message?.content
          if (content) {
            let jsonContent = content.trim()
            if (jsonContent.startsWith('```')) {
              jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
            }
            const parsed = JSON.parse(jsonContent)
            queryKeywords = Array.isArray(parsed.query_keywords) 
              ? parsed.query_keywords 
              : (parsed.query_keywords || '').split(/\s+/).filter(Boolean)
            situation = parsed.situation || null
          }
        }
      } catch (error) {
        console.error('LLM关键词提取失败，使用fallback:', error)
        // Fallback: 简单分词
        queryKeywords = message.split(/\s+/).filter(w => w.length > 1)
      }
    } else {
      // 没有API Key，使用简单分词
      queryKeywords = message.split(/\s+/).filter(w => w.length > 1)
    }

    // 3. 粗召回：关键词匹配
    const candidateEntries = allEntries
      .map((entry) => {
        // 计算关键词匹配分数
        const entryKeywords = entry.keywords || []
        const matchedKeywords = queryKeywords.filter((kw) =>
          entryKeywords.some((ekw) => 
            ekw.toLowerCase().includes(kw.toLowerCase()) || 
            kw.toLowerCase().includes(ekw.toLowerCase())
          )
        )
        const keywordScore = matchedKeywords.length

        return {
          entry,
          keywordScore,
          matchedKeywords,
        }
      })
      .filter((item) => item.keywordScore > 0 || allEntries.length < 8) // 如果样本少，允许keywordScore=0
      .sort((a, b) => b.keywordScore - a.keywordScore)
      .slice(0, 8) // 取前8条作为候选池

    // 4. 精排序：Embedding相似度
    const queryEmbeddingText = `${message} ${queryKeywords.join(' ')}`
    const queryEmbedding = await generateEmbedding(queryEmbeddingText)

    const scoredEntries = await Promise.all(
      candidateEntries.map(async ({ entry, keywordScore, matchedKeywords }) => {
        let similarity = 0

        if (queryEmbedding.length > 0) {
          // 使用embedding相似度
          const entryEmbeddingText = getEntryEmbeddingText(entry)
          const entryEmbedding = await generateEmbedding(entryEmbeddingText)
          similarity = cosineSimilarity(queryEmbedding, entryEmbedding)
        } else {
          // Fallback: 使用文本相似度
          const entryText = getEntryEmbeddingText(entry)
          similarity = calculateTextSimilarity(queryEmbeddingText, entryText)
        }

        // 如果LLM给出了situation，对匹配的situation加权
        if (situation && entry.meta.situation === situation) {
          similarity += 0.1
        }

        return {
          entry,
          keywordScore,
          matchedKeywords,
          similarity,
          finalScore: keywordScore * 0.3 + similarity * 0.7, // 加权组合
        }
      })
    )

    // 5. 取Top 3-5条
    const topEntries = scoredEntries
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, 5)
      .map(({ entry, matchedKeywords, similarity }) => ({
        id: entry.id,
        location: entry.location,
        geo: entry.geo,
        ai_summary: entry.ai_summary,
        keywords: entry.keywords,
        meta: entry.meta,
        matchedKeywords,
        similarity,
      }))

    // 生成chatbot回复
    const botResponse = topEntries.length > 0
      ? `我为你找到了 ${topEntries.length} 段相关的经历。`
      : '抱歉，我没有找到相关的经历。你可以尝试换个方式描述你的处境。'

    return NextResponse.json({
      response: botResponse,
      entries: topEntries,
      queryKeywords, // 返回提取的关键词（用于前端显示）
    })
  } catch (error) {
    console.error('Chatbot查询失败:', error)
    return NextResponse.json({ error: '查询失败' }, { status: 500 })
  }
}

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
      console.warn('[API] 警告：没有加载到任何数据，请检查 her_voice_sample_10.json 文件')
      return NextResponse.json({ 
        entries: [],
        error: '未找到数据文件，请检查 her_voice_sample_10.json 是否在项目根目录'
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

/**
 * Embedding 工具
 * 支持 OpenAI Embedding API 和 fallback 到简单文本相似度
 */

interface EmbeddingResult {
  embedding: number[]
  model?: string
}

let embeddingCache: Map<string, number[]> = new Map()

/**
 * 使用 OpenAI API 生成 embedding
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.ZHIPU_API_KEY

  // 检查缓存
  if (embeddingCache.has(text)) {
    return embeddingCache.get(text)!
  }

  // 如果没有API Key，返回空数组（将使用fallback）
  if (!apiKey || apiKey === 'your-api-key-here') {
    return []
  }

  try {
    // 尝试使用 OpenAI Embedding API
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
      }),
    })

    if (response.ok) {
      const data = await response.json()
      const embedding = data.data[0].embedding
      embeddingCache.set(text, embedding)
      return embedding
    }
  } catch (error) {
    console.error('OpenAI Embedding API调用失败:', error)
  }

  return []
}

/**
 * 计算余弦相似度
 */
export function cosineSimilarity(vec1: number[], vec2: number[]): number {
  if (vec1.length === 0 || vec2.length === 0 || vec1.length !== vec2.length) {
    return 0
  }

  let dotProduct = 0
  let norm1 = 0
  let norm2 = 0

  for (let i = 0; i < vec1.length; i++) {
    dotProduct += vec1[i] * vec2[i]
    norm1 += vec1[i] * vec1[i]
    norm2 += vec2[i] * vec2[i]
  }

  const denominator = Math.sqrt(norm1) * Math.sqrt(norm2)
  return denominator === 0 ? 0 : dotProduct / denominator
}

/**
 * 生成entry的embedding文本
 */
export function getEntryEmbeddingText(entry: {
  ai_summary: string
  transcript: string
}): string {
  const summary = entry.ai_summary || ''
  const transcript = entry.transcript.substring(0, 300) || ''
  return `${summary} ${transcript}`.trim()
}

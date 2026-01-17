/**
 * 智谱 GLM API 集成
 * 用于生成经验摘要和标签
 */

interface AIGenerateResult {
  summary: string
  tags: {
    theme: string[]
    stage: string[]
    emotion: string[]
  }
}

// 标签候选集（固定）
const TAG_CANDIDATES = {
  theme: [
    '第一次进入',
    '选择与犹豫',
    '失败与复原',
    '边界与拒绝',
    '被忽视与看见',
    '自我怀疑',
    '职业转折',
    '关系与告别',
  ],
  stage: ['第一次', '转折点', '低谷', '重新开始'],
  emotion: ['紧张', '犹豫', '释然', '坚定', '疲惫', '平静'],
}

/**
 * Mock AI 生成（当API失败时使用）
 */
function generateMockAI(audioText: string, situation: string): AIGenerateResult {
  // 简单的mock逻辑，根据situation生成相关标签
  const situationMap: Record<string, { theme: string[]; stage: string[]; emotion: string[] }> = {
    first_try: {
      theme: ['第一次进入', '自我怀疑'],
      stage: ['第一次'],
      emotion: ['紧张', '释然'],
    },
    career: {
      theme: ['职业转折', '选择与犹豫'],
      stage: ['转折点'],
      emotion: ['犹豫', '疲惫'],
    },
    identity: {
      theme: ['边界与拒绝', '自我怀疑'],
      stage: ['转折点'],
      emotion: ['紧张', '坚定'],
    },
    uncertain: {
      theme: ['选择与犹豫', '自我怀疑'],
      stage: ['低谷'],
      emotion: ['犹豫', '平静'],
    },
  }

  const defaultTags = situationMap[situation] || {
    theme: ['第一次进入'],
    stage: ['第一次'],
    emotion: ['紧张'],
  }

  return {
    summary: `这是一段关于${situation}的经历，她分享了自己的真实感受和思考过程。`,
    tags: defaultTags,
  }
}

/**
 * 调用智谱 GLM API 生成摘要和标签
 */
export async function generateAISummary(
  audioText: string,
  situation: string
): Promise<AIGenerateResult> {
  const apiKey = process.env.ZHIPU_API_KEY

  // 如果没有API Key，使用mock数据
  if (!apiKey || apiKey === 'your-api-key-here') {
    console.warn('未配置 ZHIPU_API_KEY，使用 mock 数据')
    return generateMockAI(audioText, situation)
  }

  try {
    // 智谱 GLM API 调用（需要根据实际API文档调整）
    // 这里使用通用的OpenAI兼容格式作为示例
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
            content: `你是一个经验分析助手。请分析一段女性经历录音的文字转写，生成：
1. 一段80-120字的一句话经验摘要
2. 从候选标签中选择合适的标签（theme、stage、emotion各选1-2个）

标签候选集：
theme: ${TAG_CANDIDATES.theme.join('、')}
stage: ${TAG_CANDIDATES.stage.join('、')}
emotion: ${TAG_CANDIDATES.emotion.join('、')}

请以JSON格式返回：
{
  "summary": "摘要文本",
  "tags": {
    "theme": ["标签1"],
    "stage": ["标签1"],
    "emotion": ["标签1"]
  }
}`,
          },
          {
            role: 'user',
            content: `录音转写内容：${audioText}\n\n处境：${situation}\n\n请分析这段经历并生成摘要和标签。`,
          },
        ],
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`API调用失败: ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error('API返回内容为空')
    }

    // 尝试解析JSON（可能包含markdown代码块）
    let jsonContent = content.trim()
    if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    }

    const result = JSON.parse(jsonContent) as AIGenerateResult

    // 验证标签是否在候选集中
    result.tags.theme = result.tags.theme.filter((tag) => TAG_CANDIDATES.theme.includes(tag))
    result.tags.stage = result.tags.stage.filter((tag) => TAG_CANDIDATES.stage.includes(tag))
    result.tags.emotion = result.tags.emotion.filter((tag) => TAG_CANDIDATES.emotion.includes(tag))

    // 确保每个类型至少有一个标签
    if (result.tags.theme.length === 0) result.tags.theme = [TAG_CANDIDATES.theme[0]]
    if (result.tags.stage.length === 0) result.tags.stage = [TAG_CANDIDATES.stage[0]]
    if (result.tags.emotion.length === 0) result.tags.emotion = [TAG_CANDIDATES.emotion[0]]

    return result
  } catch (error) {
    console.error('AI API调用失败，使用mock数据:', error)
    return generateMockAI(audioText, situation)
  }
}

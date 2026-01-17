export interface SampleEntry {
  id: string
  location: {
    country: string
    province: string
    city: string
  }
  geo: {
    lat: number
    lon: number
  }
  voice_mode: string
  transcript: string
  ai_summary: string
  keywords: string[]
  meta: {
    situation: string
    stage: string
    emotion: string[]
  }
  created_at: string
}

// 直接嵌入的位置数据（10条）
const EMBEDDED_SAMPLE_DATA: SampleEntry[] = [
  {
    id: "c63b924f-57e1-45c3-982e-fe1e5195c69e",
    location: { country: "China", province: "Shanghai", city: "Shanghai" },
    geo: { lat: 31.2304, lon: 121.4737 },
    voice_mode: "original",
    transcript: "那是我第一次主动去尝试一件以前觉得不太适合自己的事情。出门前我反复犹豫，甚至想取消。真正走进去后我比想象中更紧张，不知道从哪里开始，也担心自己显得格格不入。后来我发现没有人盯着我看，更没有人质疑我为什么在这里。结束后我意外地轻松：很多门槛其实是我自己想出来的。现在回头看，我想对当时的自己说，先走进去就好，不需要等到完全准备好。",
    ai_summary: `这段经历讲述了她第一次进入陌生场域时的紧张与自我怀疑，以及在行动后发现外界并未如预期般评判自己的转变。经验重点在于识别并松动内心设下的"门槛"。`,
    keywords: ["第一次尝试", "陌生环境", "自我怀疑", "心理门槛", "走进去"],
    meta: { situation: "first_try", stage: "第一次", emotion: ["紧张", "释然"] },
    created_at: "2026-01-08T12:00:00"
  },
  {
    id: "222d8630-c49e-483d-b5f4-aa002bf26773",
    location: { country: "China", province: "Beijing", city: "Beijing" },
    geo: { lat: 39.9042, lon: 116.4074 },
    voice_mode: "masked",
    transcript: `我在职业上做了一个看起来不太稳妥的选择：从一个熟悉的岗位转到更不确定的方向。最难的是面对别人的"你确定吗"，我一度怀疑是不是自己太冲动。那段时间我做的不是说服别人，而是把担心写下来：我到底怕什么。后来我意识到我怕的不是失败，而是"被证明不适合"。当我把这个恐惧说清楚之后，选择反而变得更可控。我现在仍然不确定结果，但我更确定这是我自己做的决定。`,
    ai_summary: `她分享了职业转向中的犹豫与外界质疑带来的压力，并通过把恐惧具体化来重新获得对选择的掌控感。经验强调"把不确定拆解成可面对的部分"。`,
    keywords: ["职业犹豫", "转行", "外界质疑", "不确定", "拆解恐惧"],
    meta: { situation: "career", stage: "转折点", emotion: ["犹豫", "坚定"] },
    created_at: "2026-01-09T12:00:00"
  },
  {
    id: "2ca6659e-20c7-4c7d-87a7-4486c2fe1e18",
    location: { country: "China", province: "Guangdong", city: "Guangzhou" },
    geo: { lat: 23.1291, lon: 113.2644 },
    voice_mode: "masked",
    transcript: "我第一次在一个几乎都是男性的场合发言时，手心一直出汗。我明明准备了很多，但轮到我开口那一刻，脑子还是一片空白。我做的唯一一件事是先把第一句话说出来：'我先说结论。'后面反而顺了。结束后有人来问我细节，我才发现他们并不是在找茬，只是习惯用更直接的方式讨论。我后来给自己的规则是：先占住位置，再慢慢把内容补完整。",
    ai_summary: `她描述了在男性主导场合发言的紧张，以及通过"先说出第一句话"来突破僵住状态的策略。经验强调先占位、再完善内容。`,
    keywords: ["公开发言", "男性场合", "紧张", "先说结论", "占位"],
    meta: { situation: "first_try", stage: "第一次", emotion: ["紧张", "坚定"] },
    created_at: "2026-01-10T12:00:00"
  },
  {
    id: "d4da5e02-7f6b-4a1e-94df-c93513c0e91a",
    location: { country: "China", province: "Sichuan", city: "Chengdu" },
    geo: { lat: 30.5728, lon: 104.0668 },
    voice_mode: "original",
    transcript: `我经历了一次身份变化：从"一个人决定"变成"要考虑很多人"。最开始我很不适应，觉得自己怎么做都不够好。后来我学会把'我应该'换成'我现在能做的是什么'。我也开始允许自己在重要的事情上求助，而不是硬扛。现在我仍然会焦虑，但我更能分清哪些是责任，哪些只是自我苛责。`,
    ai_summary: `她分享了身份变化带来的不适与自责，并通过把"应该"转为"当下可做"以及允许求助来减轻自我苛责。经验强调边界与可持续承担。`,
    keywords: ["身份转变", "责任", "自责", "求助", "边界"],
    meta: { situation: "identity", stage: "转折点", emotion: ["疲惫", "释然"] },
    created_at: "2026-01-11T12:00:00"
  },
  {
    id: "7592e630-c885-4e78-81c6-676c5af72956",
    location: { country: "China", province: "Hubei", city: "Wuhan" },
    geo: { lat: 30.5928, lon: 114.3055 },
    voice_mode: "masked",
    transcript: "我有一段时间对未来非常不确定，尤其是在一连串计划被打乱之后。我一度想把所有事都重新规划好，但越规划越焦虑。后来我做了一个很小的调整：只给自己设一个'今天能完成的最小动作'，比如发一封邮件、整理一个文件夹。小动作累计起来，我慢慢重新找回节奏。未来还是不清晰，但我不再被不确定完全吞没。",
    ai_summary: `她在不确定与计划被打乱的阶段，通过把目标缩小为"每天一个最小动作"来恢复节奏与掌控感。经验强调在不确定中用小步推进自我稳定。`,
    keywords: ["不确定未来", "计划被打乱", "焦虑", "最小动作", "节奏"],
    meta: { situation: "uncertain", stage: "低谷", emotion: ["犹豫", "平静"] },
    created_at: "2026-01-12T12:00:00"
  },
  {
    id: "b7b20abe-4241-4e4c-b163-4d42545868cd",
    location: { country: "China", province: "Zhejiang", city: "Hangzhou" },
    geo: { lat: 30.2741, lon: 120.1551 },
    voice_mode: "original",
    transcript: "我曾经因为害怕被评价，长期不敢把作品拿出来。直到有一次我把'拿出来'改成'给一个人看'，压力一下小了很多。对方的反馈并没有让我立刻自信，但让我确认：我至少可以从一小步开始。后来我给自己设了一个规则：每次只扩大一点点曝光范围。现在我仍然会紧张，但我不会再因为紧张就停在原地。",
    ai_summary: `她通过把公开展示拆解为"先给一个人看"的小步尝试，逐步降低被评价的压力。经验强调渐进式暴露与可控扩圈。`,
    keywords: ["作品展示", "害怕评价", "小步尝试", "逐步扩大", "紧张"],
    meta: { situation: "first_try", stage: "重新开始", emotion: ["紧张", "坚定"] },
    created_at: "2026-01-13T12:00:00"
  },
  {
    id: "79e02283-d161-4fdf-8066-3c961bf16521",
    location: { country: "China", province: "Guangdong", city: "Shenzhen" },
    geo: { lat: 22.5431, lon: 114.0579 },
    voice_mode: "masked",
    transcript: "在职业选择上我纠结了很久：一边是更稳定的路径，一边是我更想要但更不确定的机会。我发现我一直在用别人的标准衡量自己的选择。后来我把问题换成：哪条路更符合我想过的生活？这个问题没有立刻给我答案，但让我从'对错'跳出来，开始看'匹配'。我最后做了一个并不完美的决定，但我不再需要向所有人解释。",
    ai_summary: `她在稳定与不确定之间做职业选择时，从"对错评判"转向"生活匹配"的视角，从而减少外部标准带来的拉扯。经验强调以自我生活目标作为决策锚点。`,
    keywords: ["职业选择", "稳定vs不确定", "别人的标准", "生活匹配", "决策锚点"],
    meta: { situation: "career", stage: "转折点", emotion: ["犹豫", "释然"] },
    created_at: "2026-01-14T12:00:00"
  },
  {
    id: "ae521065-78ea-42b6-9ad7-22b5ff805f07",
    location: { country: "China", province: "Jiangsu", city: "Nanjing" },
    geo: { lat: 32.0603, lon: 118.7969 },
    voice_mode: "original",
    transcript: "我第一次学会说'不'是在一个看似很小的请求上。以前我总怕拒绝会让关系变差，所以习惯先答应。那次我停了一下，说我需要考虑。对方并没有生气，甚至很自然地问我什么时候能回复。那一刻我才意识到，边界不是冒犯，而是一种清晰。之后我开始练习把拒绝说得更具体：我可以帮到哪里、不能帮到哪里。",
    ai_summary: "她通过一次小请求的拒绝练习，认识到边界并非冒犯而是清晰表达。经验强调以具体范围表达拒绝，降低关系风险想象。",
    keywords: ["边界", "拒绝", "关系担忧", "清晰表达", "练习"],
    meta: { situation: "identity", stage: "重新开始", emotion: ["紧张", "释然"] },
    created_at: "2026-01-15T12:00:00"
  },
  {
    id: "6b3c8f89-6f6d-464c-a636-e32096ce5c1c",
    location: { country: "China", province: "Shaanxi", city: "Xi'an" },
    geo: { lat: 34.3416, lon: 108.9398 },
    voice_mode: "masked",
    transcript: "我有一段时间陷在低谷里，觉得自己怎么努力都没有进展。朋友问我需要什么，我第一反应是说'没事'。后来我试着把'没事'换成'我现在最难的是睡不着'。当我把困难说得具体，别人反而更知道怎么陪我，而我也不再觉得自己在麻烦别人。低谷没有立刻结束，但我开始有了被托住的感觉。",
    ai_summary: `她在低谷中从"没事"转向具体表达困难，从而获得更可被支持的陪伴。经验强调把感受具体化以降低求助成本并改善被理解的质量。`,
    keywords: ["低谷", "求助", "具体表达", "被支持", "陪伴"],
    meta: { situation: "uncertain", stage: "低谷", emotion: ["疲惫", "释然"] },
    created_at: "2026-01-16T12:00:00"
  },
  {
    id: "b2988439-468c-4ab8-99f0-dbb3fd7d6fe9",
    location: { country: "Taiwan", province: "Taipei City", city: "Taipei" },
    geo: { lat: 25.033, lon: 121.5654 },
    voice_mode: "original",
    transcript: "我第一次一个人去做一件以前总觉得'需要有人陪'的事情。出发前我给自己找了很多理由：不安全、太麻烦、可能很尴尬。最后我做了一个折中：把路线和回程时间发给朋友，然后就出门了。到了现场我还是紧张，但当我完成那件事时，我发现'一个人'并不等于'孤立无援'。我只是把支持放在了更合适的位置上。",
    ai_summary: `她分享了第一次独自行动的担忧与折中准备，以及在完成后对"一个人不等于无支持"的重新理解。经验强调把支持前置与可视化，以降低独自尝试的心理成本。`,
    keywords: ["独自尝试", "安全感", "折中准备", "完成感", "支持前置"],
    meta: { situation: "first_try", stage: "第一次", emotion: ["紧张", "坚定"] },
    created_at: "2026-01-17T12:00:00"
  }
]

/**
 * 加载样本数据（直接从代码中返回，无需读取文件）
 */
export function loadSampleData(): SampleEntry[] {
  console.log(`[数据加载] ✓ 从代码中加载 ${EMBEDDED_SAMPLE_DATA.length} 条数据`)
  return EMBEDDED_SAMPLE_DATA
}

/**
 * 计算文本相似度（简单的Jaccard相似度，用于fallback）
 */
export function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/))
  const words2 = new Set(text2.toLowerCase().split(/\s+/))
  
  const intersection = new Set([...words1].filter(x => words2.has(x)))
  const union = new Set([...words1, ...words2])
  
  return intersection.size / union.size
}

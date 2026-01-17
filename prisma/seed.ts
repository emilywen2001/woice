import { PrismaClient } from '@prisma/client'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient({
  // Prisma 7 需要传递 datasource adapter
  // 对于 SQLite，使用默认配置即可
})

async function main() {
  console.log('开始创建 seed 数据...')

  // 示例音频文件路径（使用相对路径，实际音频文件需要放在 public/uploads 目录下）
  const demoAudioUrl = '/uploads/demo-audio.webm'

  const demoEntries = [
    {
      audioUrl: demoAudioUrl,
      voiceMode: 'masked',
      locationLevel: 'country',
      locationText: '东亚·一线城市',
      situation: 'first_try',
      summary: '这是一段关于第一次进入陌生领域的经历，她提到恐惧与犹豫，也提到后来发现自己并没有被真正评判。',
      tagsTheme: JSON.stringify(['第一次进入', '自我怀疑']),
      tagsStage: JSON.stringify(['第一次']),
      tagsEmotion: JSON.stringify(['紧张', '释然']),
      ownerToken: uuidv4(),
    },
    {
      audioUrl: demoAudioUrl,
      voiceMode: 'original',
      locationLevel: 'province',
      locationText: '华东·新一线城市',
      situation: 'career',
      summary: '她分享了在职业转折点的迷茫，不知道是否应该放弃稳定的工作去追求自己真正想要的。',
      tagsTheme: JSON.stringify(['职业转折', '选择与犹豫']),
      tagsStage: JSON.stringify(['转折点']),
      tagsEmotion: JSON.stringify(['犹豫', '疲惫']),
      ownerToken: uuidv4(),
    },
    {
      audioUrl: demoAudioUrl,
      voiceMode: 'masked',
      locationLevel: 'city',
      locationText: '华南·二线城市',
      situation: 'identity',
      summary: '在身份转变的时刻，她感到既兴奋又不安，需要重新定义自己的角色和边界。',
      tagsTheme: JSON.stringify(['边界与拒绝', '自我怀疑']),
      tagsStage: JSON.stringify(['转折点']),
      tagsEmotion: JSON.stringify(['紧张', '坚定']),
      ownerToken: uuidv4(),
    },
    {
      audioUrl: demoAudioUrl,
      voiceMode: 'original',
      locationLevel: 'country',
      locationText: '东亚·小城市',
      situation: 'uncertain',
      summary: '面对不确定的未来，她选择先停下来，而不是强迫自己立即做出决定。',
      tagsTheme: JSON.stringify(['选择与犹豫', '自我怀疑']),
      tagsStage: JSON.stringify(['低谷']),
      tagsEmotion: JSON.stringify(['犹豫', '平静']),
      ownerToken: uuidv4(),
    },
    {
      audioUrl: demoAudioUrl,
      voiceMode: 'masked',
      locationLevel: 'none',
      locationText: null,
      situation: 'first_try',
      summary: '第一次尝试公开表达自己的脆弱，发现原来并不需要完美才能被听见。',
      tagsTheme: JSON.stringify(['被忽视与看见']),
      tagsStage: JSON.stringify(['第一次']),
      tagsEmotion: JSON.stringify(['紧张', '释然']),
      ownerToken: uuidv4(),
    },
    {
      audioUrl: demoAudioUrl,
      voiceMode: 'original',
      locationLevel: 'province',
      locationText: '华北·一线城市',
      situation: 'career',
      summary: '在工作失败后，她学会了如何重新站起来，也学会了接受自己的不完美。',
      tagsTheme: JSON.stringify(['失败与复原', '职业转折']),
      tagsStage: JSON.stringify(['低谷', '重新开始']),
      tagsEmotion: JSON.stringify(['疲惫', '释然']),
      ownerToken: uuidv4(),
    },
    {
      audioUrl: demoAudioUrl,
      voiceMode: 'masked',
      locationLevel: 'city',
      locationText: '西南·新一线城市',
      situation: 'identity',
      summary: '在关系中学会设立边界，虽然感到内疚，但知道这是对自己的保护。',
      tagsTheme: JSON.stringify(['边界与拒绝', '关系与告别']),
      tagsStage: JSON.stringify(['转折点']),
      tagsEmotion: JSON.stringify(['紧张', '坚定']),
      ownerToken: uuidv4(),
    },
    {
      audioUrl: demoAudioUrl,
      voiceMode: 'original',
      locationLevel: 'country',
      locationText: '东亚·沿海城市',
      situation: 'uncertain',
      summary: '在迷茫中，她选择了相信直觉，而不是别人的建议。每一步都很小，但很坚定。',
      tagsTheme: JSON.stringify(['选择与犹豫']),
      tagsStage: JSON.stringify(['低谷']),
      tagsEmotion: JSON.stringify(['犹豫', '坚定']),
      ownerToken: uuidv4(),
    },
  ]

  for (const entry of demoEntries) {
    await prisma.soundEntry.create({
      data: entry,
    })
  }

  console.log(`成功创建 ${demoEntries.length} 条 seed 数据`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

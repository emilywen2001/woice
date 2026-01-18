# Woice - 听见她的力量 💜

<div align="center">
  <h3>每段声音，都来自真实的人生瞬间</h3>
  <p>我们讲述、倾听 · 在声音中，彼此照亮</p>
  
  <a href="https://github.com/emilywen2001/woice">
    <img src="https://img.shields.io/github/stars/emilywen2001/woice?style=social" alt="GitHub stars">
  </a>
  <a href="https://github.com/emilywen2001/woice/blob/master/LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License">
  </a>
  <img src="https://img.shields.io/badge/Next.js-16-black" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue" alt="TypeScript">
</div>

---

## 💜 一句话介绍

**Woice 是一个以声音为媒介，连接女性经验的平台。**

通过说与听，让真实的人生经历在女性之间流动

---

## 🎯 我们在解决什么问题

### 从「说」的角度

很多女性其实知道，自己的人生里有一些瞬间、一些选择、一些走过的路，是值得被讲出来的。

但在现实中，她们很难找到一个合适的方式去说：

- **文字太冷**，难以传递情绪和温度
- **视频太暴露**，担心隐私和社交压力
- **社交平台**，充满了评判、比较和表演压力

结果是，很多真实而细微的经验，在还没被说出来之前，就已经被自己否定了。

> **核心问题不是"不敢说"，而是"没有一个合适的方式去说"。**

### 从「听」的角度

当女性想要寻找经验、陪伴或确认感时，她们往往听到的要么是：

- 非常成功的故事
- 情绪化的倾诉
- 或者抽象、泛泛的建议

但她们真正需要的，往往只是**一个处境相似的普通人，讲述一段真实走过的经历**。

这种声音，在今天的内容环境里，很难被准确地找到。

> **不是"没人说"，而是"听不到对的人"。**

### 真正的问题是

**说出来的经验，能不能被真正需要的人听到。**

---

## ✨ Woice 在做什么

Woice 从「说」和「听」两个方向同时入手：

### 对讲述者

用**声音作为媒介** + **半结构化的录音引导**，帮助女性更轻松地讲出一个人生瞬间。

### 对倾听者

用 **AI 对声音进行整理与理解**，把私人叙述转化为可被他人理解的经验，并**推荐给正在经历相似阶段的女性**。

### 💜 为什么是「声音」

我们选择声音，是因为它处在一个非常特殊的位置：

- **比文字更真实**：声音中的停顿、情绪、语气，传递着文字无法捕捉的细节
- **比视频更安全**：可以匿名分享，不暴露身份和外貌
- **比社交平台更亲近**：没有点赞、评论和表演压力

> **声音允许你匿名，但不冷漠；真实，但不需要表演。**

### 🗺️ 地图与连接方式

Woice 为每一段声音保留了发生的地点。

这些来自不同城市、不同生活环境的经历，被标记在地图上，让**"来自远方的声音"，成为此刻的陪伴**。

- 世界各地的女性都在经历、思考和成长
- 你不是一个人
- 你的经历，也可能成为远方某人的力量

> **Woice 更像一个介于"独自说话"和"被认真听见"之间的空间。**

---

## 🌟 用户会发生什么改变

### 对讲述者

她第一次意识到：
> **"原来我走过的路，对别人真的有用。"**

通过引导式问题，她不仅讲述了经历，也重新认识了自己人生的价值。

### 对倾听者

她不是被教育，也不是被建议，而是听见：
> **"一个和我很像的人，已经走过这一段。"**

这种确认感和陪伴，往往比任何建议都更有力量。

### 良性循环

当她的声音被认真接住，她往往也会留下来，继续倾听别人。

---

## 🚀 技术栈

benx
- **前端框架**: Next.js 16 (App Router) + TypeScript
- **UI 样式**: TailwindCSS + 自定义 CSS 动画
- **数据库**: SQLite + Prisma ORM
- **地图组件**: Leaflet + React-Leaflet
- **音频录制**: MediaRecorder API

## 项目结构

```
her-voice/
├── app/                    # Next.js App Router 页面
│   ├── api/               # API 路由
│   ├── record/            # 录音引导页
│   ├── publish/           # 发布确认页
│   ├── listen/            # 处境选择页
│   ├── feed/              # 推荐列表页
│   └── entry/[id]/        # 声音详情页
├── lib/                   # 工具函数
│   ├── prisma.ts         # Prisma Client 实例
│   ├── ai.ts             # AI 集成（智谱 GLM）
│   └── utils.ts          # 通用工具函数
├── prisma/               # 数据库配置
│   ├── schema.prisma     # 数据模型
│   └── seed.ts           # 种子数据
└── public/
    └── uploads/          # 音频文件存储目录
```

## 🎬 快速开始

### 📦 安装

```bash
# 1. 克隆仓库
git clone https://github.com/emilywen2001/woice.git
cd woice

# 2. 安装依赖
npm install

# 3. 生成 Prisma Client
npx prisma generate

# 4. 初始化数据库
npx prisma migrate dev

# 5. （可选）填充示例数据
npm run db:seed
```

### ⚙️ 配置

在项目根目录创建 `.env.local` 文件：

```env
# 数据库配置
DATABASE_URL="file:./dev.db"

# AI API 配置（可选）
# 如果不配置，系统会使用 Fallback 算法，不影响基本功能
ZHIPU_API_KEY="your-zhipu-api-key"
# 或者使用 OpenAI
OPENAI_API_KEY="your-openai-api-key"
```

> 💡 **提示**：即使不配置 AI API Key，应用也能正常运行！系统会使用简单的文本匹配算法作为兜底。

### 🏃 运行

```bash
npm run dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

### 📱 体验流程

1. **首页**：选择"分享一个瞬间"或"听听她们的声音"
2. **录音**：跟随三段式引导，录制你的故事（可使用示例音频）
3. **发布**：选择声音模式和地点信息级别
4. **倾听**：通过自然语言描述你的处境，AI 会匹配相关经历
5. **地图**：在世界地图上查看所有声音的位置

## 🌟 核心功能

### 🎙️ 引导式录音：让讲述更轻松

采用三段式叙事结构，通过精心设计的问题引导，帮助你：
- **挖掘故事的独特价值**：不只是"发生了什么"，更关注"你的感受"和"后来的你"
- **降低表达门槛**：不知道说什么？跟着提示走就好
- **完整的情感闭环**：从回忆到当下，重新认识自己

**三段式结构**：
1. **第一段：背景**（30-40s）- 回到那个时刻，当时的你在哪，身边有谁
2. **第二段：关键点**（40-60s）- 那天发生了什么，哪一句话让你直到现在还记得
3. **第三段：后来**（30-40s）- 尘埃落定后，你想对当时的自己说点什么，现在的你，还好吗

### 🤖 AI 智能整理：让经验被理解

不是评判，而是理解：
- **自动生成经验摘要**：提炼核心经历，方便其他人快速了解
- **智能标签提取**：主题、人生阶段、情绪
- **保护隐私**：只分析内容，不关联个人身份

### 🗺️ 地图可视化：看见声音的分布

听到来自远方的声音，也让声音传到更远的地方：
- **世界地图全量展示**：每个标记都是一段真实的人生瞬间
- **地理脱敏处理**：只显示城市级别，保护讲述者隐私
- **视觉化连接感**：看见世界各地的女性都在经历、思考和成长

### 🔍 智能匹配：让需要的人听见

**对话式搜索**：
- 输入你的处境："我第一次进入男性主导场合时很紧张"
- AI 理解你的需求，提取关键词和情绪
- 精准匹配最相关的 3-5 段经历

**匹配算法**：
```
自然语言输入 → 关键词提取 → 粗召回（关键词匹配）→ 精排序（语义相似度）→ Top 3-5
```

**双向联动**：
- 列表与地图实时联动，悬停/点击都能看到对应位置
- 高亮匹配的声音，置灰其他（不删除，尊重每一段经历）

### 💬 结构化回应：表达支持

四种意图，温暖回应：
- **共鸣**：我也经历过 - 让讲述者知道"你不孤单"
- **支持**：我看见你的力量 - 看见她的勇气
- **陪伴**：你不是一个人 - 给予温暖的陪伴
- **感谢**：谢谢你的分享 - 感谢她的勇敢

## API 路由

- `POST /api/upload` - 上传音频文件
- `POST /api/entries` - 创建声音条目
- `GET /api/entries?situation=xxx` - 获取推荐列表
- `GET /api/entries/:id` - 获取声音详情
- `POST /api/entries/:id/responses` - 提交回应
- `DELETE /api/entries/:id` - 删除条目（需 ownerToken）
- `POST /api/chatbot` - 智能匹配查询（关键词提取 + Embedding 相似度）
- `GET /api/chatbot/all` - 获取所有样本数据（用于地图全量显示）

## 数据模型

### SoundEntry（声音条目）
- `id`: 唯一标识
- `audioUrl`: 音频文件路径
- `voiceMode`: 声音模式（original/masked）
- `locationLevel`: 地点信息级别
- `locationText`: 地点文本（模糊处理）
- `situation`: 处境标签
- `summary`: AI 生成的摘要
- `tagsTheme/tagsStage/tagsEmotion`: 标签数组（JSON）
- `ownerToken`: 删除权限令牌

### Response（回应）
- `id`: 唯一标识
- `entryId`: 关联的声音条目ID
- `intent`: 回应意图（resonate/support/companion/thanks）
- `text`: 回应文本（≤50字）

## 开发说明

### AI 集成
- 支持智谱 GLM 4.7 或 OpenAI API
- 配置 `ZHIPU_API_KEY` 或 `OPENAI_API_KEY` 后可使用完整功能
- 如果没有 API Key，使用 fallback 算法（简单文本匹配）
- Embedding 使用 OpenAI text-embedding-3-small（如果有 OpenAI API Key）

### 音频处理
- 当前使用浏览器原生 `MediaRecorder API`
- 音频格式：WebM
- 存储路径：`public/uploads/`

### 数据库
- 使用 SQLite（开发环境）
- 生产环境建议迁移到 PostgreSQL
- 数据迁移：`npx prisma migrate dev`



## 🤝 贡献指南

我们欢迎任何形式的贡献！

### 如何贡献

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 🙏 致谢

感谢所有为女性经验分享和互助做出贡献的人。

特别感谢：
- SheNicest 女性黑客松赛事主办方
-项目提供支持的所有伙伴

---

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源协议。

---

## 💌 联系我们

如果你有任何问题、建议或想法，欢迎：

- 📧 提交 [Issue](https://github.com/emilywen2001/woice/issues)
- 💬 发起 [Discussion](https://github.com/emilywen2001/woice/discussions)
- ⭐ 给项目点个 Star 表示支持

---

<div align="center">
  
### 💜 我们相信

**女性之间的力量，**  
**不一定来自被教导，**  
**而更多来自被听见。**

---

**Woice 的核心不是让更多声音出现，**  
**而是让每一段被说出的经历，**  
**都落在一个不会伤害说话者的位置上。**

---

**每段声音，都来自真实的人生瞬间**

**我们讲述、倾听 · 在声音中，彼此照亮**

---

如果这个项目对你有帮助，请给我们一个 ⭐ Star，让更多人看见！

</div>

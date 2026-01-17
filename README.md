# Her Voice - 女性经验的声音库

> **有些经历，不需要名字，也值得被听见。**

Her Voice 是一个强制匿名的女性声音经验库，旨在为女性提供一个安全、低门槛、非评判的空间，让她们可以分享真实的人生经历，并被真正需要这些经验的人听见。

## 技术栈

- **框架**: Next.js 16 (App Router) + TypeScript
- **样式**: TailwindCSS
- **数据库**: SQLite + Prisma
- **AI**: 智谱 GLM 4.7（支持 mock 兜底）

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

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 准备数据文件

确保 `her_voice_sample_10.json` 文件在项目根目录（`her-voice/` 目录下）。

### 3. 配置环境变量

创建 `.env.local` 文件：

```env
# 数据库配置
DATABASE_URL="file:./dev.db"

# AI API 配置（可选，不配置将使用 mock 数据）
# 支持智谱 GLM 或 OpenAI
ZHIPU_API_KEY="your-api-key-here"
# 或
OPENAI_API_KEY="your-api-key-here"
```

**注意**：
- 如果配置了 API Key，系统会使用 LLM 进行关键词提取和 Embedding 生成
- 如果没有配置，系统会使用 fallback 算法（简单文本匹配）

### 3. 初始化数据库

```bash
# 生成 Prisma Client
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev

# 创建种子数据（可选）
npm run db:seed
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 核心功能

### 1. 🎙️ 录一段声音
- 三段式录音引导（背景、关键经历、后来）
- 音频上传和存储
- 匿名发布确认

### 2. 🤖 AI 整理
- 自动生成经验摘要
- 提取主题、阶段、情绪标签
- 支持智谱 GLM API 或 mock 数据

### 3. 🎧 听她们的声音（智能匹配 + 地图联动）
- **Chatbot 对话界面**：用户输入自然语言问题，AI 分析并匹配相关经历
- **智能匹配算法**：
  - 关键词提取（LLM 提取 5-10 个关键词）
  - 粗召回（关键词匹配，取前 8 条候选）
  - 精排序（Embedding 语义相似度，取 Top 3-5 条）
- **世界地图全量显示**：
  - 页面加载时显示所有样本的城市位置
  - 搜索后：匹配的经历高亮，未匹配的置灰（不删除）
  - 支持地图与列表双向联动（hover/click）
- **匹配结果列表**：
  - 显示 AI 摘要、城市、关键词、阶段、情绪
  - 高亮显示命中的关键词
  - 点击跳转到详情页

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

## 核心原则

- **强制匿名**: 不显示用户名、头像、无私信功能
- **非热度驱动**: 不展示点赞数、播放量、热度排名
- **非评判**: AI 仅辅助理解，不参与价值判断
- **安全边界**: 允许脆弱表达，但不作为心理咨询平台

## 匹配逻辑与地图联动说明

### 匹配算法流程

1. **用户输入**：自然语言问题（如"我第一次进入男性主导场合时很紧张"）

2. **LLM 关键词提取**：
   - 调用智谱 GLM 或 OpenAI API
   - 提取 5-10 个关键词（名词或名词短语）
   - 识别处境类型（first_try/career/identity/uncertain）
   - 如果没有 API Key，使用简单分词作为 fallback

3. **粗召回（关键词匹配）**：
   - 计算每条经历的关键词匹配分数
   - 匹配分数 = query_keywords 与 entry.keywords 的交集数量
   - 优先选择匹配分数 > 0 的经历
   - 取前 8 条作为候选池

4. **精排序（语义相似度）**：
   - 生成 query embedding（用户问题 + 关键词）
   - 生成 entry embedding（ai_summary + transcript 前 300 字）
   - 计算余弦相似度
   - 如果 LLM 识别出 situation，对匹配的 situation 加权
   - 最终分数 = 关键词分数 × 0.3 + 相似度 × 0.7
   - 取 Top 3-5 条作为最终结果

5. **Fallback 机制**：
   - 如果没有 API Key，使用简单文本相似度（Jaccard 相似度）
   - 保证功能可用性

### 地图联动逻辑

1. **页面首次加载**：
   - 地图上渲染所有样本的 marker（使用 geo.lat / geo.lon）
   - 所有 marker 初始为"普通状态"

2. **用户搜索后**：
   - **不移除、不新增**任何 marker
   - 只改变 marker 状态：
     - 匹配到的经历 → marker 高亮（蓝色，带动画）
     - 未匹配的经历 → marker 置灰（透明度 0.3）

3. **双向联动**：
   - **列表 → 地图**：hover/click 列表条目 → 对应 marker 高亮
   - **地图 → 列表**：hover/click marker → 对应列表条目高亮
   - 点击 marker 或列表条目 → 跳转到详情页

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

## 注意事项

1. **隐私安全**: `.env.local` 文件已加入 `.gitignore`，请勿提交 API Key
2. **音频文件**: `public/uploads/` 目录需要手动创建（已创建）
3. **数据库**: 首次运行需要执行迁移和 seed 脚本
4. **Mock 数据**: 未配置 API Key 时，AI 功能使用 mock 数据，不影响 Demo 演示

## 后续优化

- [ ] 接入真实语音转文字（ASR）服务
- [ ] 实现音频变声功能
- [ ] 添加内容审核机制
- [ ] 优化推荐算法（基于标签相似度）
- [ ] 生产环境数据库迁移

## 许可证

本项目为黑客松 Demo 项目。

---

**Her Voice 的核心不是让更多声音出现，而是让每一段被说出的经历，都落在一个不会伤害说话者的位置上。**

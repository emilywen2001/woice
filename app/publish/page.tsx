'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface AIGeneratedCard {
  summary: string
  tags: {
    theme: string[]
    stage: string[]
    emotion: string[]
  }
}

// 常量定义在组件外部，避免重复创建
const situationLabels = {
  first_try: '第一次尝试',
  career: '职业犹豫',
  identity: '身份转变',
  uncertain: '不确定未来',
} as const

// 国家-省份-地级市三级数据结构
const locationData: Record<string, Record<string, string[]>> = {
  中国: {
    北京: ['北京市'],
    上海: ['上海市'],
    天津: ['天津市'],
    重庆: ['重庆市'],
    广东: ['广州市', '深圳市', '东莞市', '佛山市', '珠海市', '中山市', '惠州市', '江门市', '湛江市', '茂名市', '肇庆市', '梅州市', '汕尾市', '河源市', '阳江市', '清远市', '潮州市', '揭阳市', '云浮市'],
    江苏: ['南京市', '苏州市', '无锡市', '常州市', '镇江市', '扬州市', '泰州市', '南通市', '盐城市', '淮安市', '宿迁市', '徐州市', '连云港市'],
    浙江: ['杭州市', '宁波市', '温州市', '嘉兴市', '湖州市', '绍兴市', '金华市', '衢州市', '舟山市', '台州市', '丽水市'],
    山东: ['济南市', '青岛市', '淄博市', '枣庄市', '东营市', '烟台市', '潍坊市', '济宁市', '泰安市', '威海市', '日照市', '临沂市', '德州市', '聊城市', '滨州市', '菏泽市'],
    河南: ['郑州市', '开封市', '洛阳市', '平顶山市', '安阳市', '鹤壁市', '新乡市', '焦作市', '濮阳市', '许昌市', '漯河市', '三门峡市', '南阳市', '商丘市', '信阳市', '周口市', '驻马店市'],
    四川: ['成都市', '自贡市', '攀枝花市', '泸州市', '德阳市', '绵阳市', '广元市', '遂宁市', '内江市', '乐山市', '南充市', '眉山市', '宜宾市', '广安市', '达州市', '雅安市', '巴中市', '资阳市'],
    湖北: ['武汉市', '黄石市', '十堰市', '宜昌市', '襄阳市', '鄂州市', '荆门市', '孝感市', '荆州市', '黄冈市', '咸宁市', '随州市'],
    湖南: ['长沙市', '株洲市', '湘潭市', '衡阳市', '邵阳市', '岳阳市', '常德市', '张家界市', '益阳市', '郴州市', '永州市', '怀化市', '娄底市'],
    安徽: ['合肥市', '芜湖市', '蚌埠市', '淮南市', '马鞍山市', '淮北市', '铜陵市', '安庆市', '黄山市', '滁州市', '阜阳市', '宿州市', '六安市', '亳州市', '池州市', '宣城市'],
    福建: ['福州市', '厦门市', '莆田市', '三明市', '泉州市', '漳州市', '南平市', '龙岩市', '宁德市'],
    辽宁: ['沈阳市', '大连市', '鞍山市', '抚顺市', '本溪市', '丹东市', '锦州市', '营口市', '阜新市', '辽阳市', '盘锦市', '铁岭市', '朝阳市', '葫芦岛市'],
    黑龙江: ['哈尔滨市', '齐齐哈尔市', '鸡西市', '鹤岗市', '双鸭山市', '大庆市', '伊春市', '佳木斯市', '七台河市', '牡丹江市', '黑河市', '绥化市'],
    吉林: ['长春市', '吉林市', '四平市', '辽源市', '通化市', '白山市', '松原市', '白城市'],
    河北: ['石家庄市', '唐山市', '秦皇岛市', '邯郸市', '邢台市', '保定市', '张家口市', '承德市', '沧州市', '廊坊市', '衡水市'],
    山西: ['太原市', '大同市', '阳泉市', '长治市', '晋城市', '朔州市', '晋中市', '运城市', '忻州市', '临汾市', '吕梁市'],
    江西: ['南昌市', '景德镇市', '萍乡市', '九江市', '新余市', '鹰潭市', '赣州市', '吉安市', '宜春市', '抚州市', '上饶市'],
    陕西: ['西安市', '铜川市', '宝鸡市', '咸阳市', '渭南市', '延安市', '汉中市', '榆林市', '安康市', '商洛市'],
    云南: ['昆明市', '曲靖市', '玉溪市', '保山市', '昭通市', '丽江市', '普洱市', '临沧市'],
    贵州: ['贵阳市', '六盘水市', '遵义市', '安顺市', '毕节市', '铜仁市'],
    海南: ['海口市', '三亚市', '三沙市', '儋州市'],
    甘肃: ['兰州市', '嘉峪关市', '金昌市', '白银市', '天水市', '武威市', '张掖市', '平凉市', '酒泉市', '庆阳市', '定西市', '陇南市'],
    青海: ['西宁市', '海东市'],
    宁夏: ['银川市', '石嘴山市', '吴忠市', '固原市', '中卫市'],
    内蒙古: ['呼和浩特市', '包头市', '乌海市', '赤峰市', '通辽市', '鄂尔多斯市', '呼伦贝尔市', '巴彦淖尔市', '乌兰察布市'],
    新疆: ['乌鲁木齐市', '克拉玛依市', '吐鲁番市', '哈密市'],
    西藏: ['拉萨市', '日喀则市', '昌都市', '林芝市', '山南市', '那曲市', '阿里地区'],
  },
}

export default function PublishPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const audioUrl = searchParams.get('audioUrl') || '/uploads/demo-audio.webm'
  
  const [selectedCountry, setSelectedCountry] = useState<string>('')
  const [selectedProvince, setSelectedProvince] = useState<string>('')
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [situation, setSituation] = useState<'first_try' | 'career' | 'identity' | 'uncertain'>('first_try')
  const [isPublishing, setIsPublishing] = useState(false)
  const [aiCard, setAiCard] = useState<AIGeneratedCard | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)

  // 当处境改变时，重新分析
  useEffect(() => {
    if (audioUrl) {
      analyzeAudio()
    }
  }, [situation, audioUrl])

  // AI分析音频
  const analyzeAudio = async () => {
    setIsAnalyzing(true)
    setAnalysisError(null)
    
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioUrl,
          situation,
          // 实际项目中这里应该传入ASR转写的文本
          // 当前使用mock文本
        }),
      })

      if (!response.ok) {
        throw new Error('AI分析失败')
      }

      const data = await response.json()
      setAiCard(data)
    } catch (error: any) {
      console.error('分析失败:', error)
      setAnalysisError('AI分析失败，将使用默认摘要')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handlePublish = async () => {
    setIsPublishing(true)
    try {
      // 使用上传的音频URL或示例音频
      const finalAudioUrl = audioUrl

      const locationText = selectedCountry && selectedProvince && selectedCity 
        ? `${selectedCountry}·${selectedProvince}·${selectedCity}` 
        : null

      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioUrl: finalAudioUrl,
          voiceMode: 'original', // 默认原声，不再显示选项
          locationLevel: selectedCity ? 'city' : 'none',
          locationText,
          situation,
          // 如果AI已生成卡片，使用AI生成的内容；否则让后端重新生成
          aiSummary: aiCard?.summary,
          aiTags: aiCard?.tags,
        }),
      })

      if (!response.ok) {
        throw new Error('发布失败')
      }

      const data = await response.json()
      
      // 跳转到详情页
      router.push(`/entry/${data.id}`)
    } catch (error) {
      console.error('发布失败:', error)
      alert('发布失败，请重试')
      setIsPublishing(false)
    }
  }

  // 手动触发AI分析
  const handleReanalyze = () => {
    analyzeAudio()
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-purple-900 via-indigo-900 to-black text-white px-6 py-16">
      {/* 背景动态装饰（模拟声波感） */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-1/4 left-[-10%] w-[50%] h-[50%] bg-purple-500 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[110px]"></div>
      </div>

      <div className="relative z-10 mx-auto max-w-2xl w-full">
        <h1 className="mb-8 text-center text-4xl md:text-5xl font-extrabold tracking-tight">
          发布确认
        </h1>

        {/* AI生成的经历卡片预览 */}
        {isAnalyzing && (
          <div className="mb-6 rounded-xl border border-blue-400/30 bg-white/10 backdrop-blur-md p-4 text-center text-sm">
            🤖 AI正在分析你的录音并生成经历卡片...
          </div>
        )}

        {aiCard && !isAnalyzing && (
          <div className="mb-6 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">AI生成的经历卡片</h3>
              <button
                onClick={handleReanalyze}
                className="text-xs opacity-70 hover:opacity-100 transition"
              >
                重新分析
              </button>
            </div>
            
            <p className="mb-4 leading-relaxed opacity-90">
              {aiCard.summary}
            </p>
            
            <div className="flex flex-wrap gap-2">
              {aiCard.tags.stage.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-blue-500/30 px-3 py-1 text-xs backdrop-blur-sm border border-blue-400/30"
                >
                  {tag}
                </span>
              ))}
              {aiCard.tags.emotion.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-purple-500/30 px-3 py-1 text-xs backdrop-blur-sm border border-purple-400/30"
                >
                  {tag}
                </span>
              ))}
              {aiCard.tags.theme.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-green-500/30 px-3 py-1 text-xs backdrop-blur-sm border border-green-400/30"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {analysisError && (
          <div className="mb-6 rounded-xl border border-yellow-400/30 bg-yellow-500/10 backdrop-blur-md p-4 text-sm">
            ⚠️ {analysisError}
          </div>
        )}

        <div className="mb-8 space-y-6 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-6 shadow-2xl">
          <div>
            <label className="mb-3 block text-sm font-semibold tracking-wide">
              地点信息（可选）
            </label>
            <div className="space-y-4">
              {/* 国家选择 */}
              <select
                value={selectedCountry}
                onChange={(e) => {
                  setSelectedCountry(e.target.value)
                  setSelectedProvince('')
                  setSelectedCity('')
                }}
                className="w-full rounded-lg border border-white/30 bg-white/10 backdrop-blur-sm px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="" className="bg-slate-900">不显示</option>
                {Object.keys(locationData).map((country) => (
                  <option key={country} value={country} className="bg-slate-900">
                    {country}
                  </option>
                ))}
              </select>

              {/* 省份选择 */}
              {selectedCountry && (
                <select
                  value={selectedProvince}
                  onChange={(e) => {
                    setSelectedProvince(e.target.value)
                    setSelectedCity('')
                  }}
                  className="w-full rounded-lg border border-white/30 bg-white/10 backdrop-blur-sm px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="" className="bg-slate-900">请选择省份</option>
                  {selectedCountry && Object.keys(locationData[selectedCountry] || {}).map((province) => (
                    <option key={province} value={province} className="bg-slate-900">
                      {province}
                    </option>
                  ))}
                </select>
              )}

              {/* 地级市选择 */}
              {selectedCountry && selectedProvince && (
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full rounded-lg border border-white/30 bg-white/10 backdrop-blur-sm px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="" className="bg-slate-900">请选择地级市</option>
                  {selectedCountry && selectedProvince && (locationData[selectedCountry]?.[selectedProvince] || []).map((city) => (
                    <option key={city} value={city} className="bg-slate-900">
                      {city}
                    </option>
                  ))}
                </select>
              )}

              {/* 显示预览 */}
              {selectedCountry && selectedProvince && selectedCity && (
                <p className="mt-2 text-sm opacity-70">
                  将显示为：{selectedCountry}·{selectedProvince}·{selectedCity}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="px-10 py-4 bg-white text-purple-900 rounded-full font-semibold hover:bg-opacity-90 transition shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPublishing ? '发布中...' : '发布'}
          </button>
        </div>
      </div>
    </div>
  )
}

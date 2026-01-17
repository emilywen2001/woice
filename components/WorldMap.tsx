'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface Entry {
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
  keywords?: string[]
  meta?: {
    situation: string
    stage: string
    emotion: string[]
  }
}

interface WorldMapProps {
  allEntries: Entry[]
  matchedEntries: Entry[]
  selectedEntryId: string | null
  onEntryClick: (entryId: string) => void
  onEntryHover: (entryId: string | null) => void
}

// 修复 Leaflet 默认图标问题
const iconRetinaUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png'
const iconUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png'
const shadowUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png'

// 确保图标在组件加载时初始化
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
  })
}

const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
})

// 高亮图标（匹配的）
const HighlightIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [30, 49],
  iconAnchor: [15, 49],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
  className: 'highlight-marker',
})

// 地图自动调整视图
function MapController({ allEntries, matchedEntries }: { allEntries: Entry[], matchedEntries: Entry[] }) {
  const map = useMap()

  useEffect(() => {
    if (allEntries.length > 0) {
      // 过滤出有效的坐标
      const validEntries = allEntries.filter(e => e.geo && e.geo.lat && e.geo.lon && !isNaN(e.geo.lat) && !isNaN(e.geo.lon))
      
      if (validEntries.length === 0) {
        console.warn('没有有效的坐标数据')
        map.setView([20, 0], 2)
        return
      }

      if (matchedEntries.length > 0) {
        // 如果有匹配结果，调整到匹配的条目
        const validMatched = matchedEntries.filter(e => e.geo && e.geo.lat && e.geo.lon && !isNaN(e.geo.lat) && !isNaN(e.geo.lon))
        if (validMatched.length > 0) {
          const bounds = L.latLngBounds(
            validMatched.map((entry) => [entry.geo.lat, entry.geo.lon])
          )
          map.fitBounds(bounds, { padding: [100, 100] })
        }
      } else {
        // 否则显示所有条目
        const bounds = L.latLngBounds(
          validEntries.map((entry) => [entry.geo.lat, entry.geo.lon])
        )
        map.fitBounds(bounds, { padding: [50, 50] })
      }
    } else {
      map.setView([20, 0], 2)
    }
  }, [allEntries, matchedEntries, map])

  return null
}

export default function WorldMap({ 
  allEntries, 
  matchedEntries, 
  selectedEntryId,
  onEntryClick, 
  onEntryHover 
}: WorldMapProps) {
  const [mounted, setMounted] = useState(false)
  const matchedIds = new Set(matchedEntries.map(e => e.id))

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // 调试信息
    console.log('[WorldMap] allEntries数量:', allEntries.length)
    if (allEntries.length > 0) {
      console.log('[WorldMap] 第一条数据:', allEntries[0])
      console.log('[WorldMap] 第一条坐标:', allEntries[0].geo)
      console.log('[WorldMap] 所有坐标:', allEntries.map(e => ({ city: e.location.city, lat: e.geo.lat, lon: e.geo.lon })))
    } else {
      console.warn('[WorldMap] 没有数据，无法显示标记点')
    }
  }, [allEntries])

  if (!mounted) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-100">
        <p className="text-slate-500">加载地图中...</p>
      </div>
    )
  }

  // 如果没有数据，显示提示
  if (allEntries.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-100">
        <div className="text-center">
          <p className="text-slate-500 mb-2">暂无数据</p>
          <p className="text-xs text-slate-400">请确保 her_voice_sample_10.json 文件已正确加载</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full w-full">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController allEntries={allEntries} matchedEntries={matchedEntries} />
        
        {allEntries.map((entry) => {
          const isMatched = matchedIds.has(entry.id)
          const isSelected = selectedEntryId === entry.id
          const hasMatches = matchedEntries.length > 0
          
          // 如果有匹配结果，只高亮匹配的，其他置灰
          // 如果没有匹配结果，所有都正常显示
          const isHighlighted = hasMatches ? isMatched : true
          const isDimmed = hasMatches && !isMatched
          const isActive = isSelected || (isMatched && !hasMatches)

          // 确保坐标有效
          const lat = entry.geo?.lat
          const lon = entry.geo?.lon
          
          if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
            console.warn(`无效坐标 - Entry ID: ${entry.id}`, entry.geo)
            return null
          }

          // 调试：打印前3个marker的坐标
          const index = allEntries.indexOf(entry)
          if (index < 3) {
            console.log(`[WorldMap] Marker ${index + 1}/${allEntries.length}: ${entry.location.city} [${lat}, ${lon}]`)
          }

          return (
            <Marker
              key={entry.id}
              position={[lat, lon]}
              icon={isHighlighted && !isDimmed ? HighlightIcon : DefaultIcon}
              eventHandlers={{
                click: () => {
                  console.log('点击了marker:', entry.id, entry.location.city)
                  onEntryClick(entry.id)
                },
                mouseover: () => onEntryHover(entry.id),
                mouseout: () => onEntryHover(null),
              }}
              opacity={isDimmed ? 0.3 : 1}
            >
              <Popup>
                <div className="min-w-[280px] max-w-[320px]">
                  <h3 className="mb-1 font-semibold text-slate-800 text-base">
                    {entry.location.city}
                  </h3>
                  <p className="mb-2 text-xs text-slate-500">
                    {entry.location.province}, {entry.location.country}
                  </p>
                  <p className="mb-3 text-sm text-slate-700 leading-relaxed">
                    {entry.ai_summary}
                  </p>
                  {entry.keywords && entry.keywords.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1">
                      {entry.keywords.slice(0, 5).map((keyword, idx) => (
                        <span
                          key={idx}
                          className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  )}
                  {entry.meta && (
                    <div className="mb-3 text-xs text-slate-500">
                      <span className="font-medium">{entry.meta.stage}</span>
                      {entry.meta.emotion && entry.meta.emotion.length > 0 && (
                        <span> · {entry.meta.emotion.join('、')}</span>
                      )}
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onEntryClick(entry.id)
                    }}
                    className="w-full rounded bg-slate-800 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-slate-700"
                  >
                    查看完整详情
                  </button>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
      
      <style jsx global>{`
        .highlight-marker {
          filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.6));
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  )
}

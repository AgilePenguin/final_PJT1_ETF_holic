import React, { useState, useEffect } from 'react'
import { Box, Typography, CircularProgress, Alert, Button, ButtonGroup } from '@mui/material'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const LINE_COLORS = ['#5B8DEF', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6']

const PriceTrendTab = ({ etfs = [], period = '3m' }) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedPeriod, setSelectedPeriod] = useState(period)
  const [activeTab, setActiveTab] = useState('price')

  useEffect(() => {
    const fetchData = async () => {
      if (!etfs || etfs.length === 0) {
        setData([])
        return
      }

      setLoading(true)
      setError(null)

      try {
        // 여러 ETF의 주가 히스토리를 병렬로 가져오기
        const promises = etfs.map(async (etf) => {
          const ticker = etf.ticker || etf
          console.log(`🔍 Fetching price history for ticker: ${ticker}`)
          const response = await fetch(`http://localhost:5000/api/etf/${ticker}/price-history?period=${selectedPeriod}`)
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
          const data = await response.json()
          console.log(`✅ Received price history for ${ticker}:`, data)
          return data
        })

        const results = await Promise.all(promises)
        console.log('📊 All price history results:', results)
        
        // 데이터를 차트용 형태로 변환
        const chartData = transformDataForChart(results, etfs)
        console.log('📈 Transformed chart data:', chartData)
        setData(chartData)
      } catch (err) {
        console.error('Failed to fetch price trend data:', err)
        setError('데이터를 불러올 수 없습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [etfs, selectedPeriod])

  const transformDataForChart = (results, etfs) => {
    // 모든 날짜를 수집
    const allDates = new Set()
    results.forEach(result => {
      result.priceHistory.forEach(item => allDates.add(item.date))
    })
    
    const sortedDates = Array.from(allDates).sort()
    
    // 각 날짜별로 데이터 구성
    return sortedDates.map(date => {
      const dataPoint = { date }
      
      results.forEach((result, index) => {
        const etf = etfs[index]
        const ticker = etf.ticker || etf
        const name = etf.name || etf
        
        // 해당 날짜의 데이터 찾기
        const dayData = result.priceHistory.find(item => item.date === date)
        if (dayData) {
          // 첫 번째 날짜를 기준으로 100%로 설정하고 상대적 변화율 계산
          if (index === 0 && sortedDates.indexOf(date) === 0) {
            dataPoint[`${ticker}_base`] = dayData.close
          }
          
          const basePrice = dataPoint[`${ticker}_base`] || result.priceHistory[0].close
          const changePercent = ((dayData.close - basePrice) / basePrice) * 100
          
          dataPoint[ticker] = changePercent
          dataPoint[`${ticker}_name`] = name
        }
      })
      
      return dataPoint
    })
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{ 
          backgroundColor: '#1a1f3a', 
          border: '1px solid #2a2f55', 
          borderRadius: 1, 
          p: 2,
          boxShadow: 3
        }}>
          <Typography variant="body2" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
            {formatDate(label)}
          </Typography>
          {payload.map((entry, index) => (
            <Typography key={index} variant="body2" sx={{ color: entry.color }}>
              {entry.dataKey.includes('_name') ? '' : `${entry.dataKey}: ${entry.value.toFixed(2)}%`}
            </Typography>
          ))}
        </Box>
      )
    }
    return null
  }

  if (loading) {
    return (
      <Box sx={{ backgroundColor: '#0f1430', borderRadius: 2, p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress sx={{ color: '#5B8DEF' }} />
        <Typography variant="body2" sx={{ color: 'white', ml: 2 }}>주가 데이터를 불러오는 중...</Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ backgroundColor: '#0f1430', borderRadius: 2, p: 3 }}>
        <Alert severity="error" sx={{ backgroundColor: '#1a1f3a', color: 'white' }}>
          {error}
        </Alert>
      </Box>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Box sx={{ backgroundColor: '#0f1430', borderRadius: 2, p: 3 }}>
        <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
          주가 추이 비교
        </Typography>
        <Typography variant="body2" sx={{ color: '#9aa4d4', textAlign: 'center', py: 4 }}>
          비교할 ETF를 선택해주세요.
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ backgroundColor: '#0f1430', borderRadius: 2, p: 3 }}>
      {/* 상단 탭 버튼들 */}
      <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
        {['price', 'dividend', 'marketCap', 'nav'].map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'contained' : 'outlined'}
            onClick={() => setActiveTab(tab)}
            sx={{
              backgroundColor: activeTab === tab ? '#5B8DEF' : 'transparent',
              color: activeTab === tab ? 'white' : '#9aa4d4',
              borderColor: '#2a2f55',
              '&:hover': {
                backgroundColor: activeTab === tab ? '#4a7bc8' : '#1a1f3a',
                borderColor: '#5B8DEF'
              },
              textTransform: 'none',
              px: 2,
              py: 1
            }}
          >
            {tab === 'price' ? '주가' : 
             tab === 'dividend' ? '배당금' : 
             tab === 'marketCap' ? '시가총액' : 'NAV'}
          </Button>
        ))}
      </Box>

      {/* 메인 차트 */}
      <Box sx={{ height: 300, mb: 2 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="#2a2f55" strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              stroke="#9aa4d4" 
              tickLine={false} 
              axisLine={{ stroke: '#2a2f55' }}
              tickFormatter={formatDate}
            />
            <YAxis 
              stroke="#9aa4d4" 
              tickLine={false} 
              axisLine={{ stroke: '#2a2f55' }}
              domain={['dataMin - 5', 'dataMax + 5']}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ color: 'white', paddingTop: '20px' }}
              formatter={(value, entry) => {
                // ETF 이름을 표시하도록 수정
                const etf = etfs.find(e => (e.ticker || e) === value)
                return etf ? (etf.name || etf) : value
              }}
            />
            {etfs.map((etf, idx) => {
              const ticker = etf.ticker || etf
              return (
                <Line
                  key={ticker}
                  type="monotone"
                  dataKey={ticker}
                  stroke={LINE_COLORS[idx % LINE_COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5, fill: LINE_COLORS[idx % LINE_COLORS.length] }}
                />
              )
            })}
          </LineChart>
        </ResponsiveContainer>
      </Box>

      {/* 기간 조절 스케일 바 */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <ButtonGroup variant="outlined" size="small">
          {[
            { key: '1m', label: '1M' },
            { key: '3m', label: '3M' },
            { key: '6m', label: '6M' },
            { key: '1y', label: '1Y' }
          ].map((period) => (
            <Button
              key={period.key}
              onClick={() => setSelectedPeriod(period.key)}
              sx={{
                backgroundColor: selectedPeriod === period.key ? '#5B8DEF' : 'transparent',
                color: selectedPeriod === period.key ? 'white' : '#9aa4d4',
                borderColor: '#2a2f55',
                '&:hover': {
                  backgroundColor: selectedPeriod === period.key ? '#4a7bc8' : '#1a1f3a',
                  borderColor: '#5B8DEF'
                },
                minWidth: '40px'
              }}
            >
              {period.label}
            </Button>
          ))}
        </ButtonGroup>
      </Box>

      {/* 범례 */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
        {etfs.map((etf, idx) => {
          const ticker = etf.ticker || etf
          const name = etf.name || etf
          return (
            <Box key={ticker} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  backgroundColor: LINE_COLORS[idx % LINE_COLORS.length],
                  borderRadius: '50%'
                }}
              />
              <Typography variant="body2" sx={{ color: '#9aa4d4', fontSize: '0.75rem' }}>
                {name}
              </Typography>
            </Box>
          )
        })}
      </Box>
    </Box>
  )
}

export default PriceTrendTab

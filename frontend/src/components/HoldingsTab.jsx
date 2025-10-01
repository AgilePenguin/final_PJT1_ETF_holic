import React, { useState, useEffect } from 'react'
import { Box, Typography, Card, CardContent, Grid, CircularProgress, Alert } from '@mui/material'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const CHART_COLORS = ['#5B8DEF', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1']

const HoldingsChart = ({ ticker, etfName }) => {
  const [holdingsData, setHoldingsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [apiEtfName, setApiEtfName] = useState(etfName)

  useEffect(() => {
    const fetchHoldings = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log(`🔍 Fetching holdings for ticker: ${ticker}`)
        const response = await fetch(`http://localhost:5000/api/etf/${ticker}/holdings`)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log(`✅ Received data for ${ticker}:`, data)
        
        if (data.error) {
          throw new Error(data.error)
        }
        
        // API에서 받은 ETF 이름으로 업데이트
        if (data.etfName) {
          setApiEtfName(data.etfName)
        }
        
        // 데이터를 차트용 형태로 변환
        const chartData = data.holdings.map((holding, index) => ({
          name: holding.stockName,
          value: parseFloat(holding.weight),
          stockCode: holding.stockCode,
          shares: holding.shares,
          value_amount: holding.value,
          color: CHART_COLORS[index % CHART_COLORS.length]
        }))
        
        console.log(`📊 Chart data for ${ticker}:`, chartData)
        setHoldingsData(chartData)
      } catch (err) {
        console.error('Error fetching holdings:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (ticker) {
      fetchHoldings()
    }
  }, [ticker])

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <Box sx={{ 
          backgroundColor: 'white', 
          border: '1px solid #ccc', 
          borderRadius: 1, 
          p: 1,
          boxShadow: 2
        }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {data.name}
          </Typography>
          <Typography variant="body2">
            비중: {data.value.toFixed(1)}%
          </Typography>
          <Typography variant="body2">
            종목코드: {data.stockCode}
          </Typography>
          {data.shares && (
            <Typography variant="body2">
              보유주수: {data.shares.toLocaleString()}주
            </Typography>
          )}
        </Box>
      )
    }
    return null
  }

  const CustomLegend = ({ payload }) => {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
          Holdings
        </Typography>
        {payload.map((entry, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                backgroundColor: entry.color,
                borderRadius: '50%',
                mr: 1
              }}
            />
            <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
              {entry.value}
            </Typography>
          </Box>
        ))}
      </Box>
    )
  }

  if (loading) {
    return (
      <Card sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 1 }}>
            보유 종목 정보를 불러오는 중...
          </Typography>
        </Box>
      </Card>
    )
  }

  if (error) {
    return (
      <Card sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Alert severity="error" sx={{ width: '100%' }}>
          <Typography variant="body2">
            보유 종목 정보를 불러올 수 없습니다: {error}
          </Typography>
        </Alert>
      </Card>
    )
  }

  return (
    <Card sx={{ height: 400 }}>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
          {apiEtfName || etfName || `ETF ${ticker}`}
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
          {ticker}
        </Typography>
        
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={holdingsData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {holdingsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </Box>
        
        {/* 비중 목록 */}
        <Box sx={{ mt: 2 }}>
          {holdingsData.map((holding, index) => (
            <Box key={index} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  backgroundColor: holding.color,
                  borderRadius: '50%',
                  mr: 1
                }}
              />
              <Typography variant="body2" sx={{ fontSize: '0.75rem' }}>
                {holding.value.toFixed(1)}%
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  )
}

const HoldingsTab = ({ selectedETFs }) => {
  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
        종목 구성
      </Typography>
      
      <Grid container spacing={3}>
        {selectedETFs.map((etf, index) => (
          <Grid item xs={12} md={6} key={etf.ticker}>
            <HoldingsChart 
              ticker={etf.ticker} 
              etfName={etf.name}
            />
          </Grid>
        ))}
      </Grid>
      
      {selectedETFs.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            비교할 ETF를 선택해주세요.
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default HoldingsTab

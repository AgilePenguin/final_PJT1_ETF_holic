import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
} from '@mui/material'
import StrategyResultCard from './StrategyResultCard'

const StrategyAnalysisPage = () => {
  const [selectedProduct, setSelectedProduct] = useState('QQQ')
  const [analysisResults, setAnalysisResults] = useState(null)

  const handleAnalyze = () => {
    // mock data generation for three strategies
    const days = Array.from({ length: 30 }).map((_, i) => i + 1)
    const priceSeries = days.map((d) => 100 + Math.sin(d / 3) * 4 + d * 0.15)

    const trendData = days.map((d, i) => ({
      x: `Day ${d}`,
      price: priceSeries[i],
      maShort: i >= 3 ? priceSeries.slice(i - 3, i + 1).reduce((a, b) => a + b, 0) / 4 : priceSeries[i],
      maLong: i >= 7 ? priceSeries.slice(i - 7, i + 1).reduce((a, b) => a + b, 0) / 8 : priceSeries[i],
    }))

    const bollData = days.map((d, i) => {
      const window = priceSeries.slice(Math.max(0, i - 9), i + 1)
      const mean = window.reduce((a, b) => a + b, 0) / window.length
      const variance = window.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / window.length
      const std = Math.sqrt(variance)
      return { x: `Day ${d}`, price: priceSeries[i], upper: mean + 2 * std, lower: mean - 2 * std }
    })

    const breakoutLevel = Math.max(...priceSeries.slice(0, 20))
    const breakoutData = days.map((d, i) => ({ x: `Day ${d}`, price: priceSeries[i] }))

    const results = [
      {
        strategyName: '추세 추종',
        description: '단기 이동평균선과 장기 이동평균선을 비교하여, 현재 추세의 지속 가능성을 판단하는 전략입니다.',
        signal: '매수 신호',
        confidence: '78%',
        direction: 'up',
        chartData: trendData,
        overlays: { maShort: true, maLong: true },
      },
      {
        strategyName: '평균 회귀',
        description: '주가가 장기 평균으로 회귀하려는 경향을 이용하는 전략입니다. 주로 볼린저 밴드를 활용합니다.',
        signal: '매도 신호',
        confidence: '65%',
        direction: 'down',
        chartData: bollData,
        overlays: { upper: true, lower: true },
      },
      {
        strategyName: '브레이크아웃',
        description: '중요한 저항선이나 지지선을 돌파할 때 새로운 추세의 시작으로 보고 투자하는 전략입니다.',
        signal: '매수 신호',
        confidence: '71%',
        direction: 'up',
        chartData: breakoutData,
        overlays: { resistance: breakoutLevel },
      },
    ]

    setAnalysisResults(results)
  }

  return (
    <Box sx={{ flex: 1, backgroundColor: '#0a0e27', p: 4 }}>
      <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, mb: 2 }}>
        전략 분석
      </Typography>
      <Typography variant="body1" sx={{ color: 'white', opacity: 0.8, mb: 3 }}>
        선택한 ETF에 대해 주요 전략들의 분석 결과를 한 번에 확인하세요
      </Typography>

      {/* 선택 영역: 상품만 선택 */}
      <Card sx={{ backgroundColor: '#1a1f3a', borderRadius: 2, mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
            상품 선택
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="product-label" sx={{ color: '#9aa4d4' }}>
                  상품 선택
                </InputLabel>
                <Select
                  labelId="product-label"
                  value={selectedProduct}
                  label="상품 선택"
                  sx={{ color: 'white', '.MuiOutlinedInput-notchedOutline': { borderColor: '#2a2f55' } }}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                >
                  <MenuItem value="VOO">VOO (S&P 500)</MenuItem>
                  <MenuItem value="QQQ">QQQ (Nasdaq 100)</MenuItem>
                  <MenuItem value="SPY">SPY</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" onClick={handleAnalyze}>
              분석하기
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* 결과 표시: 그리드 3열 */}
      {analysisResults && (
        <Grid container spacing={2}>
          {analysisResults.map((r) => (
            <Grid item xs={12} md={4} key={r.strategyName}>
              <StrategyResultCard
                strategyName={r.strategyName}
                description={r.description}
                signal={r.signal}
                confidence={r.confidence}
                direction={r.direction}
                chartData={r.chartData}
                overlays={r.overlays}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}

export default StrategyAnalysisPage

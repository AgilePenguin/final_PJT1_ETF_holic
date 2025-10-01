import React, { useState, useEffect } from 'react'
import { Typography, Box, Chip, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material'

const FeesTab = ({ rows = [] }) => {
  const [feesData, setFeesData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchFeesData = async () => {
      if (!rows || rows.length === 0) {
        setFeesData([])
        return
      }

      setLoading(true)
      setError(null)

      try {
        // 여러 ETF의 수수료 및 배당금 정보를 병렬로 가져오기
        const promises = rows.map(async (etf) => {
          const ticker = etf.ticker || etf
          console.log(`🔍 Fetching fees and dividend for ticker: ${ticker}`)
          const response = await fetch(`http://localhost:5000/api/etf/${ticker}/fees-dividend`)
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
          const data = await response.json()
          console.log(`✅ Received fees data for ${ticker}:`, data)
          return data
        })

        const results = await Promise.all(promises)
        console.log('📊 All fees data results:', results)
        setFeesData(results)
      } catch (err) {
        console.error('Failed to fetch fees data:', err)
        setError('데이터를 불러올 수 없습니다.')
      } finally {
        setLoading(false)
      }
    }

    fetchFeesData()
  }, [rows])

  const getFeeLevel = (fee) => {
    if (fee <= 0.05) return { level: '낮음', color: 'success' }
    if (fee <= 0.10) return { level: '보통', color: 'warning' }
    return { level: '높음', color: 'error' }
  }

  const getDividendLevel = (dividend) => {
    if (dividend >= 3.0) return { level: '높음', color: 'success' }
    if (dividend >= 1.5) return { level: '보통', color: 'warning' }
    return { level: '낮음', color: 'error' }
  }

  const getPerformanceColor = (returnValue) => {
    return returnValue >= 0 ? 'success.main' : 'error.main'
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress sx={{ color: '#5B8DEF' }} />
        <Typography variant="body2" sx={{ color: 'white', ml: 2 }}>수수료 및 배당금 데이터를 불러오는 중...</Typography>
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

  if (!feesData || feesData.length === 0) {
    return (
      <Box sx={{ backgroundColor: '#0f1430', borderRadius: 2, p: 3 }}>
        <Typography variant="h6" sx={{ color: 'white', mb: 2, fontWeight: 600 }}>
          수수료 및 배당금 정보
        </Typography>
        <Typography variant="body2" sx={{ color: '#9aa4d4', textAlign: 'center', py: 4 }}>
          비교할 ETF를 선택해주세요.
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ backgroundColor: '#0f1430', borderRadius: 2, p: 3 }}>
      <Typography variant="h6" sx={{ color: 'white', mb: 3, fontWeight: 600 }}>
        수수료 및 배당금 정보
      </Typography>
      
      <TableContainer component={Paper} sx={{ backgroundColor: '#1a1f3a', borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#2a2f55' }}>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', borderColor: '#2a2f55' }}>ETF</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', borderColor: '#2a2f55' }}>총 보수율</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', borderColor: '#2a2f55' }}>배당수익률</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', borderColor: '#2a2f55' }}>연초 수익률</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', borderColor: '#2a2f55' }}>1년 수익률</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold', borderColor: '#2a2f55' }}>최근 배당금</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {feesData.map((etf, index) => {
              const feeLevel = getFeeLevel(etf.fees.totalExpenseRatio)
              const dividendLevel = getDividendLevel(etf.dividend.dividendYield)
              
              return (
                <TableRow key={etf.ticker} sx={{ '&:hover': { backgroundColor: '#2a2f55' } }}>
                  <TableCell sx={{ color: 'white', borderColor: '#2a2f55' }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {etf.etfName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#9aa4d4' }}>
                        {etf.ticker}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell sx={{ color: 'white', borderColor: '#2a2f55' }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2">
                        {(etf.fees.totalExpenseRatio * 100).toFixed(2)}%
                      </Typography>
                      <Chip 
                        label={feeLevel.level} 
                        size="small" 
                        color={feeLevel.color} 
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                    </Box>
                  </TableCell>
                  
                  <TableCell sx={{ color: 'white', borderColor: '#2a2f55' }}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2">
                        {etf.dividend.dividendYield.toFixed(1)}%
                      </Typography>
                      <Chip 
                        label={dividendLevel.level} 
                        size="small" 
                        color={dividendLevel.color} 
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: 20 }}
                      />
                    </Box>
                  </TableCell>
                  
                  <TableCell sx={{ color: getPerformanceColor(etf.performance.ytdReturn), borderColor: '#2a2f55' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {etf.performance.ytdReturn >= 0 ? '+' : ''}{etf.performance.ytdReturn.toFixed(1)}%
                    </Typography>
                  </TableCell>
                  
                  <TableCell sx={{ color: getPerformanceColor(etf.performance.oneYearReturn), borderColor: '#2a2f55' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {etf.performance.oneYearReturn >= 0 ? '+' : ''}{etf.performance.oneYearReturn.toFixed(1)}%
                    </Typography>
                  </TableCell>
                  
                  <TableCell sx={{ color: 'white', borderColor: '#2a2f55' }}>
                    <Box>
                      <Typography variant="body2">
                        {etf.dividend.lastDividend.toLocaleString()}원
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#9aa4d4' }}>
                        {etf.dividend.dividendDate}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* 추가 정보 섹션 */}
      <Box sx={{ mt: 3, p: 2, backgroundColor: '#1a1f3a', borderRadius: 1, border: '1px solid #2a2f55' }}>
        <Typography variant="body2" sx={{ color: '#9aa4d4', mb: 1 }}>
          📊 수수료 및 배당금 정보 안내:
        </Typography>
        <Typography variant="caption" sx={{ color: '#9aa4d4', display: 'block', mb: 0.5 }}>
          • 총 보수율: 연간 관리비 + 보관비 + 기타 비용
        </Typography>
        <Typography variant="caption" sx={{ color: '#9aa4d4', display: 'block', mb: 0.5 }}>
          • 배당수익률: 연간 배당금 / 현재 주가 × 100
        </Typography>
        <Typography variant="caption" sx={{ color: '#9aa4d4', display: 'block' }}>
          • 수익률은 과거 실적이며 미래 수익을 보장하지 않습니다
        </Typography>
      </Box>
    </Box>
  )
}

export default FeesTab

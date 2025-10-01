import React, { useEffect, useMemo, useState } from 'react'
import { Box, Typography, Chip, Card, CardContent, Grid, Divider, TextField, InputAdornment, Button, Tabs, Tab } from '@mui/material'
import { useComparison } from '../contexts/ComparisonContext.jsx'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Search, Star } from '@mui/icons-material'
import PriceTrendTab from './PriceTrendTab'
import VolumeTrendTab from './VolumeTrendTab'
import FeesTab from './FeesTab'
import HoldingsTab from './HoldingsTab'
import AddPortfolioModal from './AddPortfolioModal'

const CHART_COLORS = ['#5B8DEF', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6']

const mockLookup = (ticker) => {
  // very simple mocked profiles per ticker
  const baseHoldings = [
    { name: 'Apple Inc', value: 12.1 },
    { name: 'Microsoft', value: 10.8 },
    { name: 'NVIDIA', value: 9.5 },
    { name: 'Amazon', value: 8.2 },
    { name: 'Tesla', value: 6.3 },
  ]
  return {
    name: ticker,
    ticker,
    fee: '0.20%',
    feeLevel: '보통',
    dividendYield: '0.90%',
    dividendLevel: '낮음',
    netAssets: '1.2조원',
    currentPrice: '₩30,000',
    priceChange: '+0.35%',
    holdings: baseHoldings,
  }
}

const buildTimeseries = (tickers) => {
  const dates = ['12월 1일', '12월 2일', '12월 3일', '12월 4일', '12월 5일']
  const priceHistory = dates.map((d, idx) => {
    const row = { date: d }
    tickers.forEach((t, i) => {
      row[t] = 30000 + i * 1200 + idx * 250
    })
    return row
  })
  const volumeHistory = dates.map((d, idx) => {
    const row = { date: d }
    tickers.forEach((t, i) => {
      row[t] = 5_000_000 + i * 400_000 + idx * 150_000
    })
    return row
  })
  return { priceHistory, volumeHistory }
}

const buildMockComparisonData = (tickers) => {
  console.warn("⚠️ 종목 구성 데이터가 mock으로 설정되어 있습니다")
  const { priceHistory, volumeHistory } = buildTimeseries(tickers)
  return {
    aiSummary:
      `${tickers.join(', ')} 에 대한 빠른 요약입니다. 각 ETF의 보수/배당 및 상위 보유종목을 간단 비교하세요. 실제 데이터 연동 시 백엔드 응답으로 대체됩니다.`,
    portfolioDetails: tickers.map((t) => mockLookup(t)),
    priceHistory,
    volumeHistory,
  }
}

// yFinance API 호출 함수
const fetchYFinanceData = async (ticker) => {
  const url = `http://127.0.0.1:5000/api/etf/info?ticker=${ticker}`
  console.log("📡 yFinance API 호출 시작:", url)
  
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    console.log("✅ yFinance 응답 수신:", data)
    
    // 응답 구조 검증
    if (!data.ticker || !data.name || !Array.isArray(data.holdings)) {
      console.error("❌ yFinance 응답이 비어 있거나 구조가 잘못되었습니다", data)
      throw new Error("Invalid response structure")
    }
    
    return data
  } catch (error) {
    console.error("❌ yFinance API 호출 실패:", error)
    throw error
  }
}

// 실제 yFinance 데이터로 비교 데이터 구성
const buildRealComparisonData = async (tickers) => {
  console.log("🔄 실제 yFinance 데이터로 비교 데이터 구성 시작")
  
  try {
    const portfolioDetails = await Promise.all(
      tickers.map(async (ticker) => {
        try {
          const data = await fetchYFinanceData(ticker)
          return {
            name: data.name,
            ticker: data.ticker,
            fee: '0.20%', // 실제 데이터에서는 fee 정보가 없으므로 기본값
            feeLevel: '보통',
            dividendYield: '0.90%', // 실제 데이터에서는 dividend 정보가 없으므로 기본값
            dividendLevel: '낮음',
            netAssets: '1.2조원', // 실제 데이터에서는 netAssets 정보가 없으므로 기본값
            currentPrice: '₩30,000', // 실제 데이터에서는 price 정보가 없으므로 기본값
            priceChange: '+0.35%',
            holdings: data.holdings.slice(0, 5).map(h => ({
              name: h.name || h.Stock || 'Unknown',
              value: h.weight || h.Weight || 0
            }))
          }
        } catch (error) {
          console.warn(`🔁 yFinance 실패 → mockData로 대체됨 (${ticker})`)
          return mockLookup(ticker)
        }
      })
    )
    
    const { priceHistory, volumeHistory } = buildTimeseries(tickers)
    return {
      aiSummary: `${tickers.join(', ')} 에 대한 실제 yFinance 데이터 기반 분석입니다.`,
      portfolioDetails,
      priceHistory,
      volumeHistory,
    }
  } catch (error) {
    console.error("❌ 전체 yFinance 데이터 구성 실패:", error)
    console.warn("🔁 전체 실패 → mockData로 대체됨")
    return buildMockComparisonData(tickers)
  }
}

const EtfComparePage = () => {
  const { tickersToCompare, setTickersToCompare } = useComparison()
  const [comparisonData, setComparisonData] = useState(null)
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false)
  const [aiAnalysisResult, setAiAnalysisResult] = useState('')
  const [isMockData, setIsMockData] = useState(false)
  const [yFinanceConnectionStatus, setYFinanceConnectionStatus] = useState('unknown')
  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false)
  const [initialETFs, setInitialETFs] = useState([])
  const [activeTab, setActiveTab] = useState(0)

  useEffect(() => {
    const loadComparisonData = async () => {
      if (tickersToCompare && tickersToCompare.length > 0) {
        console.log("🔄 ETF 비교 데이터 로딩 시작:", tickersToCompare)
        
        try {
          // 실제 yFinance API 호출 시도
          const results = await buildRealComparisonData(tickersToCompare)
          setComparisonData(results)
          setIsMockData(false)
          setYFinanceConnectionStatus('connected')
          console.log("✅ 실제 yFinance 데이터 로딩 완료")
        } catch (error) {
          console.error("❌ yFinance 데이터 로딩 실패, mock 데이터 사용:", error)
          const results = buildMockComparisonData(tickersToCompare)
          setComparisonData(results)
          setIsMockData(true)
          setYFinanceConnectionStatus('failed')
        }
        
        setTickersToCompare([])
      }
    }
    loadComparisonData()
  }, [tickersToCompare, setTickersToCompare])

  // yFinance 연결 테스트 함수
  const testYFinanceConnection = async () => {
    console.log("🧪 yFinance 연결 테스트 시작")
    setYFinanceConnectionStatus('testing')
    
    try {
      const testTicker = 'VOO'
      const data = await fetchYFinanceData(testTicker)
      console.log("✅ yFinance 연결 테스트 성공:", data)
      setYFinanceConnectionStatus('connected')
      alert(`yFinance 연결 테스트 성공!\n티커: ${data.ticker}\n이름: ${data.name}\n보유종목 수: ${data.holdings.length}`)
    } catch (error) {
      console.error("❌ yFinance 연결 테스트 실패:", error)
      setYFinanceConnectionStatus('failed')
      alert(`yFinance 연결 테스트 실패!\n오류: ${error.message}`)
    }
  }

  const handleAnalysisClick = async () => {
    if (!comparisonData) return
    const selected = comparisonData.portfolioDetails.map((p) => p.ticker)
    if (selected.length === 0) return

    setIsLoadingAnalysis(true)
    setAiAnalysisResult('')
    try {
      const res = await fetch('http://127.0.0.1:5000/api/etf/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tickers: selected }),
      })
      if (!res.ok) throw new Error('AI analysis failed')
      const data = await res.json()
      setAiAnalysisResult(data.analysis)
    } catch (e) {
      console.error('Error during AI analysis:', e)
      if (e.message.includes('Failed to fetch') || e.message.includes('Connection refused')) {
        setAiAnalysisResult("백엔드 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.")
      } else {
        setAiAnalysisResult("AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")
      }
    } finally {
      setIsLoadingAnalysis(false)
    }
  }

  const handlePortfolioRegisterClick = () => {
    if (!comparisonData || comparisonData.portfolioDetails.length === 0) return
    
    // 선택된 ETF들을 초기 데이터로 설정
    const selectedETFs = comparisonData.portfolioDetails.map(etf => {
      // 티커를 기반으로 시장 구분 판단 (한국 티커는 숫자로 시작)
      const isKoreanTicker = /^\d/.test(etf.ticker)
      return {
        ticker: etf.ticker,
        name: etf.name,
        market: isKoreanTicker ? '국내' : '해외',
        percentage: (100 / comparisonData.portfolioDetails.length).toFixed(1)
      }
    })
    
    setInitialETFs(selectedETFs)
    setPortfolioModalOpen(true)
  }

  const handlePortfolioSave = (portfolioData) => {
    // localStorage에 포트폴리오 저장
    const portfolios = JSON.parse(localStorage.getItem('portfolios') || '[]')
    const newPortfolio = {
      id: Date.now().toString(),
      ...portfolioData,
      createdAt: new Date().toISOString()
    }
    portfolios.push(newPortfolio)
    localStorage.setItem('portfolios', JSON.stringify(portfolios))
    
    // 성공 토스트 메시지 (간단한 alert로 대체)
    alert('포트폴리오가 저장되었습니다!')
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const header = useMemo(
    () => (
      <>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, mb: 1 }}>
              ETF 비교
            </Typography>
            <Typography sx={{ color: '#9aa4d4', mb: 1 }}>
              선택한 티커를 기반으로 상세 비교를 제공합니다
            </Typography>
            {comparisonData && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip 
                  label={isMockData ? "모의 데이터" : "실시간 데이터"} 
                  color={isMockData ? "warning" : "success"}
                  size="small"
                />
                <Chip 
                  label={`yFinance: ${yFinanceConnectionStatus === 'connected' ? '연결됨' : yFinanceConnectionStatus === 'failed' ? '실패' : yFinanceConnectionStatus === 'testing' ? '테스트중' : '알 수 없음'}`}
                  color={yFinanceConnectionStatus === 'connected' ? "success" : yFinanceConnectionStatus === 'failed' ? "error" : "default"}
                  size="small"
                />
              </Box>
            )}
          </Box>
          <Button 
            variant="outlined" 
            onClick={testYFinanceConnection}
            disabled={yFinanceConnectionStatus === 'testing'}
            sx={{ minWidth: 150 }}
          >
            {yFinanceConnectionStatus === 'testing' ? '테스트 중...' : 'yFinance 연결 테스트'}
          </Button>
        </Box>
      </>
    ),
    [comparisonData, isMockData, yFinanceConnectionStatus],
  )

  if (!comparisonData) {
    return (
      <Box sx={{ p: 3 }}>
        {header}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          {(tickersToCompare || []).map((t) => (
            <Chip key={t} label={t} sx={{ backgroundColor: '#0a0e27', color: 'white' }} />
          ))}
        </Box>
        <Card sx={{ backgroundColor: '#1a1f3a' }}>
          <CardContent>
            <Typography sx={{ color: 'white', mb: 1, fontWeight: 600 }}>ETF 검색</Typography>
            <TextField
              fullWidth
              placeholder="ETF 이름, 티커, 섹터로 검색"
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#0a0e27',
                  borderRadius: 2,
                  '& fieldset': { borderColor: '#333' },
                },
                '& .MuiInputBase-input': { color: 'white' },
              }}
              InputProps={{ startAdornment: (<InputAdornment position="start"><Search sx={{ color: '#1976d2' }} /></InputAdornment>) }}
            />
            <Typography sx={{ color: '#9aa4d4', mt: 2 }}>포트폴리오 카드에서 "전체 비교하기"를 클릭하면 자동으로 불러옵니다.</Typography>
          </CardContent>
        </Card>
      </Box>
    )
  }

  const selectedEtfs = comparisonData.portfolioDetails.map((p) => ({ name: p.name, ticker: p.ticker }))

  return (
    <Box sx={{ p: 3, width: '100%', maxWidth: '1400px', mx: 'auto' }}>
      {header}

      {/* AI 분석 */}
      <Card sx={{ backgroundColor: '#1a1f3a', borderRadius: 2, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 1 }}>
            ETF holic AI 분석
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" sx={{ color: 'white', opacity: 0.9, lineHeight: 1.7 }}>
              {isLoadingAnalysis
                ? 'AI가 분석 중입니다...'
                : (aiAnalysisResult || '비교할 ETF를 선택하고 \"분석하기\" 버튼을 눌러주세요.')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                variant="outlined" 
                startIcon={<Star />}
                onClick={handlePortfolioRegisterClick}
                disabled={!comparisonData || comparisonData.portfolioDetails.length === 0}
                sx={{
                  borderColor: '#1976d2',
                  color: '#1976d2',
                  '&:hover': {
                    borderColor: '#1976d2',
                    backgroundColor: 'rgba(25, 118, 210, 0.08)',
                  },
                  '&:disabled': {
                    opacity: 0.5,
                    cursor: 'not-allowed',
                  }
                }}
              >
                나의 포트폴리오 등록
              </Button>
              <Button variant="contained" onClick={handleAnalysisClick} disabled={isLoadingAnalysis}>
                분석하기
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* 탭 네비게이션 */}
      <Card sx={{ backgroundColor: '#1a1f3a', borderRadius: 2, mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                color: '#9aa4d4',
                '&.Mui-selected': {
                  color: '#5B8DEF',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#5B8DEF',
              },
            }}
          >
            <Tab label="종목 구성" />
            <Tab label="주가 추이" />
            <Tab label="거래량/거래대금" />
            <Tab label="수수료 및 분배금" />
          </Tabs>
        </Box>
        
        <CardContent sx={{ p: 3 }}>
          {activeTab === 0 && (
            <HoldingsTab selectedETFs={comparisonData?.portfolioDetails || []} />
          )}
          {activeTab === 1 && (
            <PriceTrendTab etfs={selectedEtfs} period="1y" />
          )}
          {activeTab === 2 && (
            <VolumeTrendTab etfs={selectedEtfs} period="1y" />
          )}
          {activeTab === 3 && (
            <FeesTab rows={comparisonData?.portfolioDetails || []} />
          )}
        </CardContent>
      </Card>

      {/* 포트폴리오 등록 모달 */}
      <AddPortfolioModal 
        open={portfolioModalOpen}
        onClose={() => setPortfolioModalOpen(false)}
        onSave={handlePortfolioSave}
        initialETFs={initialETFs}
      />
    </Box>
  )
}

export default EtfComparePage

import React, { useMemo, useState, useEffect } from 'react'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  LinearProgress,
  Checkbox,
  FormGroup,
  FormControlLabel,
  IconButton,
} from '@mui/material'
import { Refresh } from '@mui/icons-material'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'

const CHART_COLORS = ['#5B8DEF', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6']

// MyPortfoliosPage와 동일한 mock 데이터
const mockPortfolioList = [
  {
    id: 'p1',
    title: '반도체 매니아',
    description: '반도체만 집중 투자하는 포트폴리오',
    etfs: [
      { name: 'KODEX 반도체', ticker: 'KODEX반도체' },
      { name: 'TIGER 필라델피아반도체', ticker: 'TIGER필라델피아반도체' },
    ],
  },
  {
    id: 'p2',
    title: '대형 지수 추종',
    description: '미국과 한국의 대표 지수를 추종',
    etfs: [
      { name: 'KODEX 코스피200', ticker: 'KODEX200' },
      { name: 'TIGER 미국나스닥100', ticker: 'TIGER나스닥100' },
    ],
  },
  {
    id: 'p3',
    title: '2024년 9월 투자',
    description: '성장주 위주의 투자 이력',
    etfs: [
      { name: 'KODEX 코스피200', ticker: 'KODEX200' },
      { name: 'TIGER 미국나스닥100', ticker: 'TIGER나스닥100' },
      { name: 'KODEX 반도체', ticker: 'KODEX반도체' },
      { name: 'TIGER 2차전지테마', ticker: 'TIGER2차전지테마' },
    ],
  },
]

const benchmarkOptions = ['S&P 500', 'KOSPI', 'Gold']

const MyIndexPage = () => {
  const [myPortfolios, setMyPortfolios] = useState([])
  const [selectedPortfolio, setSelectedPortfolio] = useState(null)
  const [visibleBenchmarks, setVisibleBenchmarks] = useState(['S&P 500'])

  // 포트폴리오 데이터 로드 함수
  const loadPortfolios = () => {
    try {
      const savedPortfolios = localStorage.getItem('portfolios')
      if (savedPortfolios) {
        const portfolios = JSON.parse(savedPortfolios)
        console.log('📊 Loaded portfolios from localStorage:', portfolios)
        setMyPortfolios(portfolios)
        
        // 첫 번째 포트폴리오를 기본 선택
        if (portfolios.length > 0) {
          setSelectedPortfolio(portfolios[0])
        }
      } else {
        console.log('📊 No portfolios found in localStorage, using mock data')
        // localStorage에 데이터가 없으면 mock 데이터 사용
        setMyPortfolios(mockPortfolioList)
        setSelectedPortfolio(mockPortfolioList[0])
      }
    } catch (error) {
      console.error('❌ Error loading portfolios:', error)
      // 에러 발생 시에도 mock 데이터 사용
      setMyPortfolios(mockPortfolioList)
      setSelectedPortfolio(mockPortfolioList[0])
    }
  }

  // 새로고침 핸들러
  const handleRefresh = () => {
    console.log('🔄 Refreshing portfolio list...')
    loadPortfolios()
  }

  // localStorage에서 포트폴리오 데이터 로드 (없으면 mock 데이터 사용)
  useEffect(() => {
    loadPortfolios()
    
    // localStorage 변경 감지를 위한 이벤트 리스너
    const handleStorageChange = () => {
      loadPortfolios()
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const compositionData = useMemo(
    () => selectedPortfolio?.assets?.map((asset, index) => ({ 
      name: asset.ticker, 
      value: asset.percentage,
      color: CHART_COLORS[index % CHART_COLORS.length]
    })) ?? [],
    [selectedPortfolio],
  )

  const toggleBenchmark = (name) => {
    setVisibleBenchmarks((prev) => (prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]))
  }

  // Mock 성과 비교 데이터 (실제로는 API에서 가져와야 함)
  const comparisonData = [
    { date: '1월', MyIndex: 100, 'S&P 500': 100, KOSPI: 100, Gold: 100 },
    { date: '2월', MyIndex: 102, 'S&P 500': 101, KOSPI: 103, Gold: 98 },
    { date: '3월', MyIndex: 105, 'S&P 500': 104, KOSPI: 102, Gold: 101 },
    { date: '4월', MyIndex: 106, 'S&P 500': 103, KOSPI: 101, Gold: 102 },
    { date: '5월', MyIndex: 107, 'S&P 500': 104, KOSPI: 100, Gold: 103 },
    { date: '6월', MyIndex: 108, 'S&P 500': 105, KOSPI: 101, Gold: 104 },
    { date: '7월', MyIndex: 110, 'S&P 500': 106, KOSPI: 102, Gold: 103 },
    { date: '8월', MyIndex: 111, 'S&P 500': 107, KOSPI: 103, Gold: 102 },
    { date: '9월', MyIndex: 112, 'S&P 500': 108, KOSPI: 104, Gold: 101 },
    { date: '10월', MyIndex: 114, 'S&P 500': 109, KOSPI: 105, Gold: 100 },
    { date: '11월', MyIndex: 116, 'S&P 500': 111, KOSPI: 106, Gold: 101 },
    { date: '12월', MyIndex: 118, 'S&P 500': 113, KOSPI: 108, Gold: 102 },
  ]

  return (
    <Box sx={{ flex: 1, backgroundColor: '#0a0e27', p: 4 }}>
      <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, mb: 2 }}>
        나만의 지수
      </Typography>
      <Typography variant="body1" sx={{ color: 'white', opacity: 0.8, mb: 3 }}>
        개인화된 포트폴리오를 만들고 시장 벤치마크와 성과를 비교해보세요.
      </Typography>

      <Grid container spacing={3}>
        {/* 좌측 목록 */}
        <Grid item xs={12} md={2}>
          <Card sx={{ backgroundColor: '#1a1f3a', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                  나만의 포트폴리오
                </Typography>
                <IconButton 
                  onClick={handleRefresh}
                  sx={{ 
                    color: '#5B8DEF',
                    '&:hover': {
                      backgroundColor: 'rgba(91, 141, 239, 0.1)',
                      color: '#4a7bc8'
                    }
                  }}
                  title="포트폴리오 목록 새로고침"
                >
                  <Refresh />
                </IconButton>
              </Box>
              <List>
                {myPortfolios.length === 0 ? (
                  <Typography sx={{ color: '#9aa4d4', textAlign: 'center', py: 2 }}>
                    저장된 포트폴리오가 없습니다.
                  </Typography>
                ) : (
                  myPortfolios.map((portfolio, index) => (
                    <ListItemButton
                      key={portfolio.id || index}
                      selected={selectedPortfolio?.id === portfolio.id}
                      onClick={() => setSelectedPortfolio(portfolio)}
                      sx={{ borderRadius: 1, mb: 0.5 }}
                    >
                      <ListItemText 
                        primary={portfolio.name || portfolio.title} 
                        secondary={portfolio.description || (portfolio.investmentMethod ? `${portfolio.investmentMethod} • ${portfolio.totalAmount?.toLocaleString()}원` : undefined)} 
                      />
                    </ListItemButton>
                  ))
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* 우측 상세 */}
        <Grid item xs={12} md={10}>
          {selectedPortfolio ? (
            <Box>
              {/* 구성 */}
              <Card sx={{ backgroundColor: '#1a1f3a', borderRadius: 2, mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 1 }}>
                    {selectedPortfolio.name || selectedPortfolio.title}
                  </Typography>
                  <Typography sx={{ color: '#9aa4d4', mb: 2 }}>
                    {selectedPortfolio.description || (selectedPortfolio.investmentMethod ? ` ${selectedPortfolio.investmentMethod} • 총 투자금액: ${selectedPortfolio.totalAmount?.toLocaleString()}원` : '')}
                  </Typography>

                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    {(selectedPortfolio.assets || (selectedPortfolio.etfs || []).map((e, idx, arr) => ({
                      ticker: e.ticker,
                      name: e.name || e.ticker,
                      percentage: Math.round(100 / (arr.length || 1))
                    })) ).map((asset, i) => (
                      <Box key={`${asset.ticker}-${i}`} sx={{ width: '80%', mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography sx={{ color: 'white', fontWeight: 600 }}>{asset.ticker}</Typography>
                          <Typography sx={{ color: '#9aa4d4' }}>{asset.percentage}%</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={asset.percentage}
                          sx={{
                            height: 8,
                            borderRadius: 5,
                            '& .MuiLinearProgress-bar': { backgroundColor: CHART_COLORS[i % CHART_COLORS.length] },
                            backgroundColor: '#0f1430',
                          }}
                        />
                        <Typography sx={{ color: '#9aa4d4', fontSize: 12 }}>{asset.name}</Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>
              </Card>

              {/* 성과 비교 */}
              <Card sx={{ backgroundColor: '#1a1f3a', borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                      지수 성과 비교
                    </Typography>
                    <FormGroup row>
                      {benchmarkOptions.map((b) => (
                        <FormControlLabel
                          key={b}
                          control={<Checkbox checked={visibleBenchmarks.includes(b)} onChange={() => toggleBenchmark(b)} />}
                          label={b}
                          sx={{ color: 'white' }}
                        />
                      ))}
                    </FormGroup>
                  </Box>

                  <Divider sx={{ mb: 3, borderColor: '#2a2f55' }} />

                  <Box sx={{ height: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid stroke="#2a2f55" strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#9aa4d4" 
                          tickLine={false} 
                          axisLine={{ stroke: '#2a2f55' }}
                          fontSize={12}
                        />
                        <YAxis 
                          stroke="#9aa4d4" 
                          tickLine={false} 
                          axisLine={{ stroke: '#2a2f55' }}
                          fontSize={12}
                          domain={['dataMin - 5', 'dataMax + 5']}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1a1f3a', 
                            border: '1px solid #2a2f55', 
                            color: 'white',
                            borderRadius: 8
                          }} 
                        />
                        <Legend 
                          wrapperStyle={{ 
                            color: 'white', 
                            paddingTop: '20px',
                            fontSize: '12px'
                          }} 
                        />
                        <Line type="monotone" dataKey="MyIndex" stroke="#5B8DEF" strokeWidth={3} dot={false} name="나만의 지수" />
                        {visibleBenchmarks.includes('S&P 500') && (
                          <Line type="monotone" dataKey="S&P 500" stroke="#22C55E" strokeWidth={2} dot={false} name="S&P 500" />
                        )}
                        {visibleBenchmarks.includes('KOSPI') && (
                          <Line type="monotone" dataKey="KOSPI" stroke="#F59E0B" strokeWidth={2} dot={false} name="KOSPI" />
                        )}
                        {visibleBenchmarks.includes('Gold') && (
                          <Line type="monotone" dataKey="Gold" stroke="#EF4444" strokeWidth={2} dot={false} name="Gold" />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ) : (
            <Card sx={{ backgroundColor: '#1a1f3a', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 2 }}>
                  포트폴리오를 선택해주세요
                </Typography>
                <Typography sx={{ color: '#9aa4d4', textAlign: 'center', py: 4 }}>
                  좌측에서 포트폴리오를 선택하면 상세 정보를 확인할 수 있습니다.
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  )
}

export default MyIndexPage

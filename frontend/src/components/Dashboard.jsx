import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Chip,
  Tabs,
  Tab,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  Autocomplete,
  Button,
  Snackbar,
  Alert,
} from '@mui/material'
import { Search, Visibility, Star } from '@mui/icons-material'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import PriceTrendTab from './PriceTrendTab'
import VolumeTrendTab from './VolumeTrendTab'
import FeesTab from './FeesTab'
import AddPortfolioModal from './AddPortfolioModal'

// ----------------------
// 테마별 ETF 데이터 구조
// ----------------------
const themeETFGroups = {
  // 지수추종
  코스닥: [
    { ticker: '229200', name: 'KODEX 코스닥150' },
    { ticker: '233740', name: 'KODEX 코스닥150레버리지' },
    { ticker: '251340', name: 'KODEX 코스닥150선물인버스' },
    { ticker: '091180', name: 'TIGER 코스닥150' }
  ],
  나스닥: [
    { ticker: '133690', name: 'TIGER 미국나스닥100' },
    { ticker: '245710', name: 'KODEX 미국나스닥100TR' },
    { ticker: '381180', name: 'TIGER 미국나스닥100커버드콜' },
    { ticker: '379810', name: 'KODEX 미국나스닥100레버리지' }
  ],
  코스피: [
    { ticker: '069500', name: 'KODEX 200' },
    { ticker: '102110', name: 'TIGER 200' },
    { ticker: '278530', name: 'KODEX 200TR' },
    { ticker: '252670', name: 'KODEX 200선물인버스2X' }
  ],
  'S&P500': [
    { ticker: '360750', name: 'TIGER 미국S&P500' },
    { ticker: '379800', name: 'KODEX 미국S&P500TR' },
    { ticker: '381170', name: 'TIGER 미국S&P500커버드콜' },
    { ticker: '448630', name: 'SOL 미국S&P500' }
  ],

  // 채권 및 대체자산
  미국국채: [
    { ticker: '329750', name: 'TIGER 미국채10년선물' },
    { ticker: '305080', name: 'TIGER 미국채10년스트립' },
    { ticker: '457480', name: 'ACE 미국30년국채액티브' },
    { ticker: '148070', name: 'KOSEF 국고채10년' }
  ],
  금: [
    { ticker: '132030', name: 'KODEX 골드선물(H)' },
    { ticker: '411060', name: 'ACE 글로벌금현물(H)' },
    { ticker: '139320', name: 'TIGER 골드선물(H)' },
    { ticker: '489270', name: 'KOSEF 골드선물(H)' }
  ],
  원유: [
    { ticker: '130680', name: 'TIGER 원유선물Enhanced(H)' },
    { ticker: '217770', name: 'TIGER 원유선물Enhanced(H)' },
    { ticker: '261220', name: 'KODEX WTI원유선물' },
    { ticker: '314250', name: 'KODEX WTI원유선물인버스2X' }
  ],
  인프라펀드: [
    { ticker: '329200', name: 'ARIRANG 고속도로' },
    { ticker: '450140', name: 'HANARO 인프라' },
    { ticker: '456240', name: 'NH-KOSPI고배당50인프라' }
  ],

  // 섹터
  대체에너지: [
    { ticker: '396500', name: 'TIGER 글로벌클린에너지SOLACTIVE' },
    { ticker: '371460', name: 'TIGER 차이나전기차SOLACTIVE' },
    { ticker: '322410', name: 'TIGER 글로벌리튬&2차전지SOLACTIVE' },
    { ticker: '463710', name: 'ACE 글로벌친환경에너지' }
  ],
  인공지능: [
    { ticker: '388420', name: 'KODEX AI반도체' },
    { ticker: '473490', name: 'KIWOOM 글로벌AI반도체' },
    { ticker: '449450', name: 'SOL 미국AI빅테크' },
    { ticker: '453810', name: 'TIGER 글로벌AI반도체액티브' }
  ],
  양자컴퓨터: [
    { ticker: '498270', name: 'KIWOOM 미국양자컴퓨팅' },
    { ticker: '490340', name: 'SOL 미국양자컴퓨팅TOP10' },
    { ticker: '495300', name: 'HANARO 미국양자컴퓨팅' },
    { ticker: '497420', name: 'TIGER 미국양자컴퓨팅액티브' }
  ],
  제약: [
    { ticker: '266420', name: 'TIGER 200헬스케어' },
    { ticker: '337140', name: 'KODEX KRX바이오' },
    { ticker: '381180', name: 'KODEX 미국헬스케어' },
    { ticker: '385600', name: 'KOSEF 미국바이오' }
  ],
  '2차전지': [
    { ticker: '305720', name: 'KODEX 2차전지산업' },
    { ticker: '371460', name: 'TIGER 차이나전기차SOLACTIVE' },
    { ticker: '322410', name: 'TIGER 글로벌리튬&2차전지' },
    { ticker: '414780', name: 'KBSTAR 2차전지핵심소재' }
  ],
  반도체: [
    { ticker: '091230', name: 'TIGER 반도체' },
    { ticker: '139250', name: 'KODEX 반도체' },
    { ticker: '364960', name: 'TIGER 반도체TOP10' },
    { ticker: '388420', name: 'KODEX AI반도체' }
  ],
  항공우주: [
    { ticker: '359090', name: 'TIGER 미국항공우주방산' },
    { ticker: '453530', name: 'KODEX 미국방산&항공우주' },
    { ticker: '469070', name: 'HANARO 미국방산항공우주' },
    { ticker: '367380', name: 'KBSTAR 미국방산항공우주' }
  ]
};

// 해외 ETF 해시태그 데이터
const overseasThemeTags = {
  '지수추종': ['S&P500', '나스닥', '다우존스', '유로스탁스'],
  '채권 및 대체자산': ['미국국채', '금', '원유', '인프라펀드'],
  '섹터': ['대체에너지', '인공지능', '양자컴퓨터', '제약', '2차전지', '반도체', '항공우주']
};

// 해외 ETF 데이터 구조
const globalThemeETFGroups = {
  // 지수추종 (해외 전용)
  'S&P500': [
    { ticker: 'SPY', name: 'SPDR S&P 500 ETF Trust' },
    { ticker: 'VOO', name: 'Vanguard S&P 500 ETF' },
    { ticker: 'IVV', name: 'iShares Core S&P 500 ETF' },
    { ticker: 'SPLG', name: 'SPDR Portfolio S&P 500 ETF' }
  ],
  나스닥: [
    { ticker: 'QQQ', name: 'Invesco QQQ Trust' },
    { ticker: 'QQQM', name: 'Invesco NASDAQ 100 ETF' },
    { ticker: 'ONEQ', name: 'Fidelity NASDAQ Composite Index ETF' },
    { ticker: 'QTEC', name: 'First Trust NASDAQ-100 Tech ETF' }
  ],
  다우존스: [
    { ticker: 'DIA', name: 'SPDR Dow Jones Industrial Average ETF' },
    { ticker: 'UDOW', name: 'ProShares UltraPro Dow30' },
    { ticker: 'DDM', name: 'ProShares Ultra Dow30' },
    { ticker: 'DOG', name: 'ProShares Short Dow30' }
  ],
  유로스탁스: [
    { ticker: 'FEZ', name: 'SPDR EURO STOXX 50 ETF' },
    { ticker: 'VGK', name: 'Vanguard FTSE Europe ETF' },
    { ticker: 'IEV', name: 'iShares Europe ETF' },
    { ticker: 'EZU', name: 'iShares MSCI Eurozone ETF' }
  ],

  // 채권 및 대체자산
  미국국채: [
    { ticker: 'TLT', name: 'iShares 20+ Year Treasury Bond ETF' },
    { ticker: 'IEF', name: 'iShares 7-10 Year Treasury Bond ETF' },
    { ticker: 'VGIT', name: 'Vanguard Intermediate-Term Treasury ETF' },
    { ticker: 'SHY', name: 'iShares 1-3 Year Treasury Bond ETF' }
  ],
  금: [
    { ticker: 'GLD', name: 'SPDR Gold Shares' },
    { ticker: 'IAU', name: 'iShares Gold Trust' },
    { ticker: 'GLDM', name: 'SPDR Gold MiniShares Trust' },
    { ticker: 'SGOL', name: 'abrdn Physical Gold Shares ETF' }
  ],
  원유: [
    { ticker: 'USO', name: 'United States Oil Fund' },
    { ticker: 'UCO', name: 'ProShares Ultra Bloomberg Crude Oil' },
    { ticker: 'BNO', name: 'United States Brent Oil Fund' },
    { ticker: 'USL', name: 'United States 12 Month Oil Fund' }
  ],
  인프라펀드: [
    { ticker: 'IFRA', name: 'iShares U.S. Infrastructure ETF' },
    { ticker: 'NFRA', name: 'FlexShares STOXX US Infrastructure ETF' },
    { ticker: 'PAVE', name: 'Global X U.S. Infrastructure Development ETF' },
    { ticker: 'PKB', name: 'Invesco Dynamic Building & Construction ETF' }
  ],

  // 섹터
  대체에너지: [
    { ticker: 'ICLN', name: 'iShares Global Clean Energy ETF' },
    { ticker: 'TAN', name: 'Invesco Solar ETF' },
    { ticker: 'QCLN', name: 'First Trust NASDAQ Clean Edge Green Energy' },
    { ticker: 'PBW', name: 'Invesco WilderHill Clean Energy ETF' }
  ],
  인공지능: [
    { ticker: 'BOTZ', name: 'Global X Robotics & AI ETF' },
    { ticker: 'ROBT', name: 'First Trust Nasdaq AI and Robotics ETF' },
    { ticker: 'IRBO', name: 'iShares Robotics and AI Multisector ETF' },
    { ticker: 'ARKQ', name: 'ARK Autonomous Technology & Robotics ETF' }
  ],
  양자컴퓨터: [
    { ticker: 'QTUM', name: 'Defiance Quantum ETF' },
    { ticker: 'QBIT', name: 'Global X Quantum Computing & AI ETF' },
    { ticker: 'QSI', name: 'VanEck Quantum Computing ETF' },
    { ticker: 'PSI', name: 'Invesco Dynamic Semiconductors ETF' }
  ],
  제약: [
    { ticker: 'XLV', name: 'Health Care Select Sector SPDR Fund' },
    { ticker: 'VHT', name: 'Vanguard Health Care ETF' },
    { ticker: 'IHI', name: 'iShares U.S. Medical Devices ETF' },
    { ticker: 'IBB', name: 'iShares Biotechnology ETF' }
  ],
  '2차전지': [
    { ticker: 'LIT', name: 'Global X Lithium & Battery Tech ETF' },
    { ticker: 'BATT', name: 'Amplify Lithium & Battery Technology ETF' },
    { ticker: 'ILIT', name: 'iShares Lithium Miners and Producers ETF' },
    { ticker: 'DRIV', name: 'Global X Autonomous & Electric Vehicles ETF' }
  ],
  반도체: [
    { ticker: 'SOXX', name: 'iShares Semiconductor ETF' },
    { ticker: 'SMH', name: 'VanEck Semiconductor ETF' },
    { ticker: 'XSD', name: 'SPDR S&P Semiconductor ETF' },
    { ticker: 'SOXL', name: 'Direxion Daily Semiconductor Bull 3X' }
  ],
  항공우주: [
    { ticker: 'ITA', name: 'iShares U.S. Aerospace & Defense ETF' },
    { ticker: 'PPA', name: 'Invesco Aerospace & Defense ETF' },
    { ticker: 'XAR', name: 'SPDR S&P Aerospace & Defense ETF' },
    { ticker: 'DFEN', name: 'Direxion Daily Aerospace & Defense Bull 3X' }
  ]
};

// ----------------------
// mock data for dashboard
// ----------------------
const mockAnalysisData = {
  selectedEtfs: [],
  aiSummary:
    'KODEX 코스피200은 낮은 보수율(0.15%)과 안정적인 배당수익률(1.8%)로 국내 대형주에 투자하며, 순자산 규모 또한 25조 원으로 안정적입니다. TIGER 미국나스닥100은 기술주 중심으로 높은 성장 잠재력을 지니나, 변동성(45%)이 상대적으로 높습니다. TIGER 필라델피아반도체는 반도체 섹터에 집중하여 보수율(0.69%)과 재밌돌림(0.8%)이 단점입니다. 안정성을 중시하는 투자자는 KODEX 코스피200, 성장성이 중요한 투자는 TIGER 미국나스닥100을 고려하세요...',
  portfolioDetails: [
    {
      name: 'KODEX 코스피200',
      ticker: 'KODEX200',
      fee: '0.15%',
      feeLevel: '낮음',
      dividendYield: '1.80%',
      dividendLevel: '보통',
      netAssets: '25조원',
      currentPrice: '₩32,000',
      priceChange: '+0.65%',
      holdings: [
        { name: '삼성전자', value: 22.5 },
        { name: 'SK하이닉스', value: 8.2 },
        { name: 'LG에너지솔루션', value: 5.1 },
        { name: '삼성SDI', value: 3.8 },
        { name: 'NAVER', value: 3.2 },
      ],
    },
    {
      name: 'TIGER 미국나스닥100',
      ticker: 'TIGER나스닥100',
      fee: '0.20%',
      feeLevel: '보통',
      dividendYield: '0.90%',
      dividendLevel: '낮음',
      netAssets: '8조원',
      currentPrice: '₩34,300',
      priceChange: '-0.30%',
      holdings: [
        { name: 'Apple Inc', value: 12.1 },
        { name: 'Microsoft', value: 10.8 },
        { name: 'NVIDIA', value: 9.5 },
        { name: 'Amazon', value: 8.2 },
        { name: 'Tesla', value: 6.3 },
      ],
    },
    {
      name: 'TIGER 필라델피아반도체',
      ticker: 'TIGER필라델피아',
      fee: '0.69%',
      feeLevel: '보통',
      dividendYield: '0.80%',
      dividendLevel: '낮음',
      netAssets: '6.2조원',
      currentPrice: '₩31,200',
      priceChange: '-1.80%',
      holdings: [
        { name: 'NVIDIA', value: 18.1 },
        { name: 'Intel', value: 15.2 },
        { name: 'Qualcomm', value: 12.8 },
        { name: 'AMD', value: 11.3 },
        { name: 'Micron Technology', value: 9.7 },
      ],
    },
  ],
  // ---- 새로 추가된 시계열 데이터 ----
  priceHistory: [
    { date: '12월 1일', KODEX200: 31500, 'TIGER나스닥100': 34000 },
    { date: '12월 2일', KODEX200: 31800, 'TIGER나스닥100': 34200 },
    { date: '12월 3일', KODEX200: 31650, 'TIGER나스닥100': 34500 },
    { date: '12월 4일', KODEX200: 32000, 'TIGER나스닥100': 34300 },
  ],
  volumeHistory: [
    { date: '12월 1일', KODEX200: 5800000, 'TIGER나스닥100': 7100000 },
    { date: '12월 2일', KODEX200: 6200000, 'TIGER나스닥100': 6900000 },
    { date: '12월 3일', KODEX200: 5500000, 'TIGER나스닥100': 7500000 },
    { date: '12월 4일', KODEX200: 6500000, 'TIGER나스닥100': 7200000 },
  ],
}

const CHART_COLORS = ['#5B8DEF', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6']

const Dashboard = () => {
  const [tab, setTab] = useState(0)
  const [featuredEtfs, setFeaturedEtfs] = useState([])
  const [isLoadingFeatured, setIsLoadingFeatured] = useState(true)
  const [recommendedEtfs, setRecommendedEtfs] = useState([])
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false)
  const [searchOptions, setSearchOptions] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [searchValue, setSearchValue] = useState(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [selectedEtfs, setSelectedEtfs] = useState(mockAnalysisData.selectedEtfs)
  const [warningOpen, setWarningOpen] = useState(false)
  const [comingSoonOpen, setComingSoonOpen] = useState(false)
  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false)
  const [initialETFs, setInitialETFs] = useState([])
  
  // 테마 카테고리별 국내/해외 토글 상태
  const [themeToggleStates, setThemeToggleStates] = useState({
    '지수추종': false, // false = 국내, true = 해외
    '채권 및 대체자산': false,
    '섹터': false
  })

  // analysis datasets bound to tabs
  const [analysisEtfs, setAnalysisEtfs] = useState(mockAnalysisData.selectedEtfs)
  const [analysisPrice, setAnalysisPrice] = useState(mockAnalysisData.priceHistory)
  const [analysisVolume, setAnalysisVolume] = useState(mockAnalysisData.volumeHistory)
  const [analysisPortfolios, setAnalysisPortfolios] = useState(mockAnalysisData.portfolioDetails)
  const [aiSummary, setAiSummary] = useState(mockAnalysisData.aiSummary)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/etf/featured')
      .then((res) => res.json())
      .then((data) => {
        setFeaturedEtfs(Array.isArray(data) ? data : [])
        setIsLoadingFeatured(false)
      })
      .catch(() => setIsLoadingFeatured(false))
  }, [])

  // Debounced backend search for the top search bar
  useEffect(() => {
    const t = setTimeout(() => {
      if (!searchInput) {
        setSearchOptions([])
        return
      }
      setSearchLoading(true)
      // 국내와 해외 모두 검색하도록 수정
      Promise.all([
        fetch(`http://127.0.0.1:5000/api/search?market=domestic&keyword=${encodeURIComponent(searchInput)}`),
        fetch(`http://127.0.0.1:5000/api/search?market=overseas&keyword=${encodeURIComponent(searchInput)}`)
      ])
        .then(([domesticRes, overseasRes]) => Promise.all([domesticRes.json(), overseasRes.json()]))
        .then(([domesticData, overseasData]) => {
          const allResults = [
            ...(Array.isArray(domesticData) ? domesticData : []),
            ...(Array.isArray(overseasData) ? overseasData : [])
          ]
          setSearchOptions(allResults)
        })
        .catch(() => setSearchOptions([]))
        .finally(() => setSearchLoading(false))
    }, 300)
    return () => clearTimeout(t)
  }, [searchInput])

  const handleAddFromSearch = (opt) => {
    if (!opt || !opt.ticker) return
    const exists = selectedEtfs.some((e) => e.ticker === opt.ticker)
    if (exists) return
    if (selectedEtfs.length >= 4) {
      setWarningOpen(true)
      return
    }
    setSelectedEtfs([...selectedEtfs, { id: Date.now(), name: opt.name, ticker: opt.ticker }])
  }

  const handleChipDelete = (ticker) => {
    setSelectedEtfs(selectedEtfs.filter((e) => e.ticker !== ticker))
  }

  const handleThemeClick = (themeName) => {
    // 토글 상태에 따라 적절한 데이터 소스 선택
    const isOverseas = Object.values(themeToggleStates).some(state => state)
    const dataSource = isOverseas ? globalThemeETFGroups : themeETFGroups
    const etfList = dataSource[themeName] || []
    
    console.log('Selected theme:', themeName, etfList, isOverseas ? '(해외)' : '(국내)')
    
    // 검색창에 OR 조건으로 표시
    const tickerString = etfList.map(etf => etf.ticker).join(' OR ')
    setSearchInput(tickerString)
    
    // 해당 ETF들을 자동으로 선택된 ETF 목록에 추가
    const newEtfs = etfList.map(etf => ({
      id: Date.now() + Math.random(),
      name: etf.name,
      ticker: etf.ticker
    }))
    
    // 중복 제거하고 추가
    const existingTickers = selectedEtfs.map(e => e.ticker)
    const uniqueNewEtfs = newEtfs.filter(etf => !existingTickers.includes(etf.ticker))
    
    if (selectedEtfs.length + uniqueNewEtfs.length > 4) {
      setWarningOpen(true)
      return
    }
    
    setSelectedEtfs([...selectedEtfs, ...uniqueNewEtfs])
  }

  const handleInvestmentStyleClick = () => {
    setComingSoonOpen(true)
  }

  const handlePortfolioRegisterClick = () => {
    if (selectedEtfs.length === 0) return
    
    // 선택된 ETF들을 초기 데이터로 설정
    const selectedETFs = selectedEtfs.map(etf => {
      // 티커를 기반으로 시장 구분 판단 (한국 티커는 숫자로 시작)
      const isKoreanTicker = /^\d/.test(etf.ticker)
      return {
        ticker: etf.ticker,
        name: etf.name,
        market: isKoreanTicker ? '국내' : '해외',
        percentage: (100 / selectedEtfs.length).toFixed(1)
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

  const handleThemeToggle = (category) => {
    const currentState = themeToggleStates[category]
    const newState = !currentState
    const marketText = newState ? '해외' : '국내'
    
    setThemeToggleStates(prev => ({
      ...prev,
      [category]: newState
    }))
    
    // 토글 전환 시 선택된 ETF들 초기화
    setSelectedEtfs([])
    setSearchInput('')
    
    console.log(`${category}: ${currentState ? '해외' : '국내'} → ${marketText}`)
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

  const buildPortfolioDetails = (items) => {
    const base = [
      { name: 'Apple Inc', value: 12.1 },
      { name: 'Microsoft', value: 10.8 },
      { name: 'NVIDIA', value: 9.5 },
      { name: 'Amazon', value: 8.2 },
      { name: 'Tesla', value: 6.3 },
    ]
    return items.map((x) => ({
      name: x.name,
      ticker: x.ticker,
      fee: '0.20%',
      feeLevel: '보통',
      dividendYield: '0.90%',
      dividendLevel: '낮음',
      netAssets: '1.0조원',
      currentPrice: '₩30,000',
      priceChange: '+0.35%',
      holdings: base,
    }))
  }

  const fetchRecommendations = async (etf) => {
    try {
      setIsLoadingRecommendations(true)
      const response = await fetch('/api/etf/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ etf: { ticker: etf.ticker, name: etf.name } }),
      })
      const data = await response.json()
      if (data.recommendations && Array.isArray(data.recommendations)) {
        setRecommendedEtfs(data.recommendations)
      } else {
        setRecommendedEtfs([])
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error)
      setRecommendedEtfs([])
    } finally {
      setIsLoadingRecommendations(false)
    }
  }

  const handleAnalyze = () => {
    if (selectedEtfs.length === 0) return
    const tickers = selectedEtfs.map((e) => e.ticker)
    const { priceHistory, volumeHistory } = buildTimeseries(tickers)
    const portfolios = buildPortfolioDetails(selectedEtfs)
    setAnalysisEtfs(selectedEtfs)
    setAnalysisPrice(priceHistory)
    setAnalysisVolume(volumeHistory)
    setAnalysisPortfolios(portfolios)

    // Call backend AI summary (Gemini)
    setIsAnalyzing(true)
    setAiSummary('AI가 분석 중입니다...')
    fetch('/api/ai/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ etfs: selectedEtfs }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d && !d.error) {
          const common = d.common ? `공통점/비교 컨셉: ${d.common}` : ''
          const diff = Array.isArray(d.differences) && d.differences.length
            ? `\n차이점: \n- ${d.differences.join('\n- ')}`
            : ''
          const pros = Array.isArray(d.pros_cons) && d.pros_cons.length
            ? `\n성장성/안정성 비교: \n- ${d.pros_cons.join('\n- ')}`
            : ''
          setAiSummary(`${common}${diff}${pros}`.trim())
          
          // 첫 번째 선택된 ETF로 추천 요청
          if (selectedEtfs.length > 0) {
            fetchRecommendations(selectedEtfs[0])
          }
        } else {
          setAiSummary('AI 분석 응답을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.')
        }
      })
      .catch(() => {
        setAiSummary('AI 분석 호출에 실패했습니다. 백엔드 서버와 API 키 설정을 확인해주세요.')
      })
      .finally(() => setIsAnalyzing(false))
  }
  const itemXs = Math.max(1, Math.floor(12 / mockAnalysisData.portfolioDetails.length))

  return (
    <Box
      sx={{
        flex: 1,
        backgroundColor: '#0a0e27',
        padding: 4,
        overflow: 'auto',
      }}
    >
      <Snackbar open={warningOpen} autoHideDuration={3000} onClose={() => setWarningOpen(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setWarningOpen(false)} severity="warning" sx={{ width: '100%' }}>
          무료 비교 범위를 초과했습니다. ETF Holic(Pro) 로 업그레이드하세요
        </Alert>
      </Snackbar>
      
      <Snackbar open={comingSoonOpen} autoHideDuration={3000} onClose={() => setComingSoonOpen(false)} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setComingSoonOpen(false)} severity="info" sx={{ width: '100%' }}>
          준비중입니다. 곧 출시될 예정입니다!
        </Alert>
      </Snackbar>
      {/* 헤더 섹션 */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h3"
          sx={{ color: 'white', fontWeight: 'bold', mb: 1, fontSize: '2.5rem' }}
        >
          ETF holic 대시보드
        </Typography>
        <Typography variant="h6" sx={{ color: 'white', opacity: 0.8, fontSize: '1.1rem' }}>
          혁신적인 ETF 분석과 깊은 투자 인사이트
        </Typography>
      </Box>

      {/* ETF 비교하기 섹션 - INPUT */}
      <Card sx={{ 
        backgroundColor: '#2a3447', 
        borderRadius: 3, 
        mb: 3, 
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        border: '1px solid #374151'
      }}>
        <CardContent sx={{ p: 4 }}>
          {/* 카드 헤더 */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                backgroundColor: '#4a9eff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
                boxShadow: '0 4px 16px rgba(74, 158, 255, 0.3)'
              }}
            >
              <Visibility sx={{ color: 'white', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', mb: 0.5 }}>
                ETF 비교하기
              </Typography>
              <Typography variant="body1" sx={{ color: 'white', opacity: 0.7 }}>
                ETF holic으로 깊은 인사이트를 얻어보세요
              </Typography>
            </Box>
          </Box>

          {/* 검색창 (백엔드 연동 Autocomplete) */}
          <Autocomplete
            freeSolo
            options={searchOptions}
            loading={searchLoading}
            filterOptions={(x) => x}
            isOptionEqualToValue={(opt, val) => (opt?.ticker || '') === (val?.ticker || '')}
            getOptionLabel={(opt) => (typeof opt === 'string' ? opt : (opt?.ticker ? `${opt.name} (${opt.ticker})` : ''))}
            value={searchValue}
            inputValue={searchInput}
            onInputChange={(_, v) => setSearchInput(v)}
            onChange={(_, opt) => {
              handleAddFromSearch(opt)
              // clear input and reset selected Autocomplete value for next search
              setSearchInput('')
              setSearchValue(null)
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="ETF 이름, 티커, 섹터로 검색"
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: '#1a1f3a',
                    borderRadius: 2,
                    '& fieldset': { borderColor: '#374151' },
                    '&:hover fieldset': { borderColor: '#4a9eff' },
                    '&.Mui-focused fieldset': { borderColor: '#4a9eff' },
                  },
                  '& .MuiInputBase-input': { color: 'white', fontSize: '16px', padding: '16px 14px' },
                  '& .MuiInputBase-input::placeholder': { color: '#9aa4d4', opacity: 1 },
                  mb: 2,
                }}
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#4a9eff', fontSize: 24 }} />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          {/* 선택된 ETF Chips */}
          <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            {selectedEtfs.map((etf) => (
              <Chip
                key={etf.id}
                label={`${etf.name} (${etf.ticker})`}
                sx={{ 
                  backgroundColor: '#1a1f3a', 
                  color: 'white', 
                  border: '1px solid #374151',
                  '&:hover': {
                    backgroundColor: '#2a3447'
                  }
                }}
                onDelete={() => handleChipDelete(etf.ticker)}
              />
            ))}
            <Box sx={{ flex: 1 }} />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                variant="outlined" 
                startIcon={<Star />}
                onClick={handlePortfolioRegisterClick}
                disabled={selectedEtfs.length === 0}
                sx={{
                  borderColor: '#4a9eff',
                  color: '#4a9eff',
                  '&:hover': {
                    borderColor: '#4a9eff',
                    backgroundColor: 'rgba(74, 158, 255, 0.08)',
                  },
                  '&:disabled': {
                    opacity: 0.5,
                    cursor: 'not-allowed',
                  }
                }}
              >
                나의 포트폴리오 등록
              </Button>
              <Button 
                variant="contained" 
                size="large" 
                onClick={handleAnalyze}
                sx={{
                  backgroundColor: '#4a9eff',
                  '&:hover': {
                    backgroundColor: '#3b82f6'
                  },
                  boxShadow: '0 4px 16px rgba(74, 158, 255, 0.3)'
                }}
              >
                분석하기
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* 검색도우미 섹션 - INPUT */}
      <Card sx={{ 
        backgroundColor: '#2a3447', 
        borderRadius: 3, 
        mb: 3, 
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        border: '1px solid #374151'
      }}>
        <CardContent sx={{ p: 6 }}>
          {/* 검색도우미 헤더 */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                backgroundColor: '#ffb547',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
                boxShadow: '0 4px 16px rgba(255, 181, 71, 0.3)'
              }}
            >
              <Typography sx={{ fontSize: 24 }}>🔍</Typography>
            </Box>
            <Box>
              <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', mb: 0.5 }}>
                검색도우미
              </Typography>
              <Typography variant="body1" sx={{ color: 'white', opacity: 0.7 }}>
                테마나 투자지향별로 그룹화된 ETF를 한번에 검색하세요
              </Typography>
            </Box>
          </Box>

          {/* 테마 섹션 */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', mb: 3 }}>
              테마
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              gap: 4, 
              flexWrap: 'wrap',
              '& > *': {
                flex: '1 1 300px',
                minWidth: { xs: '100%', sm: '300px', md: '300px' }
              }
            }}>
              {/* 지수추종 카드 */}
              <Box
                sx={{
                  backgroundColor: '#BFDBFE',
                  borderRadius: 3,
                  p: 3,
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                  }
                }}
              >
                {/* 카드 헤더 - 제목과 토글 */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ color: '#1E40AF', fontWeight: 'bold', fontSize: '1.1rem' }}>
                    지수추종
                  </Typography>
                  
                  {/* 토글 스위치 */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" sx={{ fontSize: '12px', color: '#1E40AF', fontWeight: 500 }}>
                      국내
                    </Typography>
                    <Box
                      sx={{
                        position: 'relative',
                        width: 40,
                        height: 20,
                        backgroundColor: themeToggleStates['지수추종'] ? '#ff6b6b' : '#4a9eff',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          opacity: 0.8
                        }
                      }}
                      onClick={() => handleThemeToggle('지수추종')}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '2px',
                          left: themeToggleStates['지수추종'] ? '22px' : '2px',
                          width: '16px',
                          height: '16px',
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          transition: 'all 0.3s ease-in-out',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                        }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ fontSize: '12px', color: '#1E40AF', fontWeight: 500 }}>
                      해외
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 2,
                  transition: 'all 0.3s ease-in-out'
                }}>
                  {(themeToggleStates['지수추종'] ? overseasThemeTags['지수추종'] : ['코스닥', '나스닥', '코스피', 'S&P500']).map((tag) => (
                    <Chip
                      key={tag}
                      label={`#${tag}`}
                      size="small"
                      sx={{
                        backgroundColor: '#F8FAFC',
                        color: '#1E40AF',
                        fontSize: '0.8rem',
                        height: 28,
                        borderRadius: '14px',
                        fontWeight: 500,
                        '&:hover': {
                          transform: 'scale(1.05)',
                          backgroundColor: '#E2E8F0',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        },
                        transition: 'all 0.3s ease-in-out',
                        cursor: 'pointer',
                        animation: 'fadeIn 0.3s ease-in-out'
                      }}
                      onClick={() => handleThemeClick(tag)}
                    />
                  ))}
                </Box>
              </Box>

              {/* 채권 및 대체자산 카드 */}
              <Box
                sx={{
                  backgroundColor: '#A5F3FC',
                  borderRadius: 3,
                  p: 3,
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                  }
                }}
              >
                {/* 카드 헤더 - 제목과 토글 */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ color: '#0E7490', fontWeight: 'bold', fontSize: '1.1rem' }}>
                    채권 및 대체자산
                  </Typography>
                  
                  {/* 토글 스위치 */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" sx={{ fontSize: '12px', color: '#0E7490', fontWeight: 500 }}>
                      국내
                    </Typography>
                    <Box
                      sx={{
                        position: 'relative',
                        width: 40,
                        height: 20,
                        backgroundColor: themeToggleStates['채권 및 대체자산'] ? '#ff6b6b' : '#4a9eff',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          opacity: 0.8
                        }
                      }}
                      onClick={() => handleThemeToggle('채권 및 대체자산')}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '2px',
                          left: themeToggleStates['채권 및 대체자산'] ? '22px' : '2px',
                          width: '16px',
                          height: '16px',
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          transition: 'all 0.3s ease-in-out',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                        }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ fontSize: '12px', color: '#0E7490', fontWeight: 500 }}>
                      해외
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 2,
                  transition: 'all 0.3s ease-in-out'
                }}>
                  {(themeToggleStates['채권 및 대체자산'] ? overseasThemeTags['채권 및 대체자산'] : ['미국국채', '금', '원유', '인프라펀드']).map((tag) => (
                    <Chip
                      key={tag}
                      label={`#${tag}`}
                      size="small"
                      sx={{
                        backgroundColor: '#F0FDFA',
                        color: '#0E7490',
                        fontSize: '0.8rem',
                        height: 28,
                        borderRadius: '14px',
                        fontWeight: 500,
                        '&:hover': {
                          transform: 'scale(1.05)',
                          backgroundColor: '#CCFBF1',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        },
                        transition: 'all 0.3s ease-in-out',
                        cursor: 'pointer',
                        animation: 'fadeIn 0.3s ease-in-out'
                      }}
                      onClick={() => handleThemeClick(tag)}
                    />
                  ))}
                </Box>
              </Box>

              {/* 섹터 카드 */}
              <Box
                sx={{
                  backgroundColor: '#A7F3D0',
                  borderRadius: 3,
                  p: 3,
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                  }
                }}
              >
                {/* 카드 헤더 - 제목과 토글 */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ color: '#047857', fontWeight: 'bold', fontSize: '1.1rem' }}>
                    섹터
                  </Typography>
                  
                  {/* 토글 스위치 */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" sx={{ fontSize: '12px', color: '#047857', fontWeight: 500 }}>
                      국내
                    </Typography>
                    <Box
                      sx={{
                        position: 'relative',
                        width: 40,
                        height: 20,
                        backgroundColor: themeToggleStates['섹터'] ? '#ff6b6b' : '#4a9eff',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          opacity: 0.8
                        }
                      }}
                      onClick={() => handleThemeToggle('섹터')}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          top: '2px',
                          left: themeToggleStates['섹터'] ? '22px' : '2px',
                          width: '16px',
                          height: '16px',
                          backgroundColor: 'white',
                          borderRadius: '50%',
                          transition: 'all 0.3s ease-in-out',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                        }}
                      />
                    </Box>
                    <Typography variant="caption" sx={{ fontSize: '12px', color: '#047857', fontWeight: 500 }}>
                      해외
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 2,
                  transition: 'all 0.3s ease-in-out'
                }}>
                  {(themeToggleStates['섹터'] ? overseasThemeTags['섹터'] : ['대체에너지', '인공지능', '양자컴퓨터', '제약', '2차전지', '반도체', '항공우주']).map((tag) => (
                    <Chip
                      key={tag}
                      label={`#${tag}`}
                      size="small"
                      sx={{
                        backgroundColor: '#F0FDF4',
                        color: '#047857',
                        fontSize: '0.8rem',
                        height: 28,
                        borderRadius: '14px',
                        fontWeight: 500,
                        '&:hover': {
                          transform: 'scale(1.05)',
                          backgroundColor: '#DCFCE7',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        },
                        transition: 'all 0.3s ease-in-out',
                        cursor: 'pointer',
                        animation: 'fadeIn 0.3s ease-in-out'
                      }}
                      onClick={() => handleThemeClick(tag)}
                    />
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>

          {/* 투자지향 섹션 */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                투자지향
              </Typography>
              <Chip
                label="준비중"
                size="small"
                sx={{
                  backgroundColor: '#FF9800',
                  color: 'white',
                  fontSize: '0.75rem',
                  height: 24,
                  fontWeight: 500
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, opacity: 0.5 }}>
              {['주식형TOPS', '커버드콜TOPS', '기술대표TOPS', '급상승', '고배당', '레버리지', '인버스'].map((tag) => (
                <Chip
                  key={tag}
                  label={`#${tag}`}
                  size="small"
                  sx={{
                    backgroundColor: '#424242',
                    color: 'white',
                    fontSize: '0.8rem',
                    height: 28,
                    borderRadius: '14px',
                    fontWeight: 500,
                    '&:hover': {
                      transform: 'scale(1.05)',
                      backgroundColor: '#616161',
                    },
                    transition: 'all 0.2s ease-in-out',
                    cursor: 'pointer',
                    ...(tag === '인버스' && {
                      border: '1px solid #f44336',
                      color: '#f44336'
                    })
                  }}
                  onClick={handleInvestmentStyleClick}
                />
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* INPUT/OUTPUT 구분선 */}
      <Box sx={{ 
        height: 2, 
        background: 'linear-gradient(90deg, #e8ecf1 0%, #2a3447 50%, #1a1f3a 100%)',
        borderRadius: 1,
        mb: 4,
        mx: 2
      }} />

      {/* AI 분석 섹션 (추천 ETF 리스트 표시) - OUTPUT */}
      <Card sx={{ 
        backgroundColor: '#f8f9fb', 
        borderRadius: 2, 
        mb: 3,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e8ecf1'
      }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ color: '#1a2332', fontWeight: 'bold', mb: 1 }}>
            ETF holic AI 분석
          </Typography>
          <Box sx={{ color: '#1a2332', opacity: 0.9, lineHeight: 1.7 }}>
            <Typography variant="body2" sx={{ mb: 2, whiteSpace: 'pre-line' }}>{aiSummary}</Typography>
            <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1 }}>
              추천 ETF {recommendedEtfs.length > 0 ? `(${recommendedEtfs.join(', ')})` : ''}
            </Typography>
            {isLoadingRecommendations ? (
              <Typography variant="body2">AI가 추천 ETF를 분석 중입니다...</Typography>
            ) : recommendedEtfs.length > 0 ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {recommendedEtfs.map((ticker) => (
                  <Chip key={ticker} label={ticker} sx={{ backgroundColor: '#0a0e27', color: 'white', border: '1px solid #2a2f55' }} />
                ))}
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: '#9aa4d4' }}>
                분석하기를 클릭하면 관련 ETF를 추천해드립니다.
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* 상세 비교 탭 */}
      <Card sx={{ 
        backgroundColor: '#f8f9fb', 
        borderRadius: 2,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e8ecf1'
      }}>
        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          sx={{ px: 2, borderBottom: '1px solid #e8ecf1' }}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="종목 구성" sx={{ color: '#1a2332' }} />
          <Tab label="주가 추이" sx={{ color: '#1a2332' }} />
          <Tab label="거래량/거래대금" sx={{ color: '#1a2332' }} />
          <Tab label="수수료 및 분배금" sx={{ color: '#1a2332' }} />
        </Tabs>

        {tab === 0 && (
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ color: '#1a2332', mb: 2, fontWeight: 600 }}>
              종목 구성
            </Typography>
            <Grid container spacing={3}>
              {analysisPortfolios.map((pf) => (
                <Grid key={pf.ticker} item xs={itemXs} sx={{ minWidth: 280 }}>
                  <Box sx={{ backgroundColor: 'white', borderRadius: 2, p: 2, height: '100%', border: '1px solid #e8ecf1', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
                    <Typography variant="subtitle1" sx={{ color: '#1a2332', fontWeight: 700 }}>
                      {pf.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6b7280' }}>
                      {pf.ticker}
                    </Typography>

                    <Box sx={{ height: 220, mt: 1 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pf.holdings}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={25}
                            outerRadius={55}
                            paddingAngle={2}
                          >
                            {pf.holdings.map((_, i) => (
                              <Cell key={`cell-${i}`} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#1a1f3a', border: '1px solid #2a2f55' }} />
                          <Legend wrapperStyle={{ color: 'white' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>

                    <Divider sx={{ my: 1.5, borderColor: '#2a2f55' }} />

                    <List dense disablePadding>
                      {pf.holdings.map((h, i) => (
                        <ListItem key={h.name} sx={{ py: 0.25 }}>
                          <Box
                            sx={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                              mr: 1,
                            }}
                          />
                          <ListItemText
                            primary={h.name}
                            secondary={`${h.value}%`}
                            primaryTypographyProps={{ sx: { color: 'white', fontSize: 13 } }}
                            secondaryTypographyProps={{ sx: { color: '#9aa4d4', fontSize: 12 } }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        )}

        {tab === 1 && (
          <CardContent sx={{ p: 3 }}>
            <PriceTrendTab etfs={analysisEtfs} period="1y" />
          </CardContent>
        )}

        {tab === 2 && (
          <CardContent sx={{ p: 3 }}>
            <VolumeTrendTab etfs={analysisEtfs} period="1y" />
          </CardContent>
        )}

        {tab === 3 && (
          <CardContent sx={{ p: 0 }}>
            <FeesTab rows={analysisPortfolios} />
          </CardContent>
        )}
      </Card>

      {/* 하단 안내 섹션 */}
      <Box sx={{ textAlign: 'center', mt: 6 }}>
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: '#1976d2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3,
            position: 'relative',
          }}
        >
          <Visibility sx={{ color: 'white', fontSize: 40 }} />
          <Typography
            sx={{
              position: 'absolute',
              fontSize: '10px',
              color: 'white',
              fontWeight: 'bold',
              transform: 'rotate(-90deg)',
              right: -20,
              top: '50%',
              transformOrigin: 'center',
            }}
          >
            ETF HOLIC
          </Typography>
        </Box>

        <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', mb: 2, fontSize: '1.8rem' }}>
          ETF holic으로 ETF 분석을 시작하세요
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: 'white', opacity: 0.7, maxWidth: 600, mx: 'auto', mb: 4, fontSize: '1.1rem', lineHeight: 1.6 }}
        >
          관심 있는 ETF를 2개 이상 선택하면 AI가 분석한 투자 인사이트와 상세 비교 데이터를 확인할 수 있습니다.
        </Typography>
      </Box>

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

export default Dashboard

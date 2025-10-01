const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const KoreaInvestmentAPI = require('./kis-api');

const app = express();
const PORT = process.env.PORT || 3001;

// 미들웨어 설정
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// KIS API 인스턴스 생성
const kisAPI = new KoreaInvestmentAPI();

// 헬스 체크 엔드포인트
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'ETF Holic Backend API'
  });
});

// ETF 현재가 조회
app.get('/api/etf/:ticker/price', async (req, res) => {
  try {
    const { ticker } = req.params;
    
    // 티커 유효성 검사 (6자리 숫자)
    if (!/^\d{6}$/.test(ticker)) {
      return res.status(400).json({
        error: 'Invalid ticker format',
        message: 'Ticker must be 6 digits (e.g., 069500)'
      });
    }

    const priceData = await kisAPI.getETFPrice(ticker);
    res.json(priceData);
  } catch (error) {
    console.error('ETF 가격 조회 API 오류:', error.message);
    res.status(500).json({
      error: 'Failed to fetch ETF price',
      message: error.message
    });
  }
});

// ETF 종목 구성 조회
app.get('/api/etf/:ticker/holdings', async (req, res) => {
  try {
    const { ticker } = req.params;
    
    // 티커 유효성 검사
    if (!/^\d{6}$/.test(ticker)) {
      return res.status(400).json({
        error: 'Invalid ticker format',
        message: 'Ticker must be 6 digits (e.g., 069500)'
      });
    }

    const holdingsData = await kisAPI.getETFHoldings(ticker);
    res.json(holdingsData);
  } catch (error) {
    console.error('ETF 종목 구성 조회 API 오류:', error.message);
    res.status(500).json({
      error: 'Failed to fetch ETF holdings',
      message: error.message
    });
  }
});

// 통합 ETF 정보 조회
app.get('/api/etf/:ticker/full', async (req, res) => {
  try {
    const { ticker } = req.params;
    
    // 티커 유효성 검사
    if (!/^\d{6}$/.test(ticker)) {
      return res.status(400).json({
        error: 'Invalid ticker format',
        message: 'Ticker must be 6 digits (e.g., 069500)'
      });
    }

    const fullData = await kisAPI.getETFInfo(ticker);
    res.json(fullData);
  } catch (error) {
    console.error('통합 ETF 정보 조회 API 오류:', error.message);
    res.status(500).json({
      error: 'Failed to fetch ETF info',
      message: error.message
    });
  }
});

// API 문서 엔드포인트
app.get('/api/docs', (req, res) => {
  res.json({
    title: 'ETF Holic Backend API',
    version: '1.0.0',
    description: '한국투자증권 OpenAPI를 사용한 ETF 데이터 API',
    endpoints: {
      'GET /health': '서버 상태 확인',
      'GET /api/etf/:ticker/price': 'ETF 현재가 및 거래량 조회',
      'GET /api/etf/:ticker/holdings': 'ETF 종목 구성 조회',
      'GET /api/etf/:ticker/full': '통합 ETF 정보 조회',
      'GET /api/docs': 'API 문서'
    },
    examples: {
      'ETF 가격 조회': '/api/etf/069500/price',
      'ETF 종목 구성': '/api/etf/069500/holdings',
      '통합 정보': '/api/etf/069500/full'
    },
    sampleTickers: {
      'KODEX 200': '069500',
      'TIGER 미국S&P500': '360750',
      'KODEX 반도체': '091230'
    }
  });
});

// 404 핸들러
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

// 에러 핸들러
app.use((error, req, res, next) => {
  console.error('서버 오류:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: '서버 내부 오류가 발생했습니다.'
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 ETF Holic Backend API 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`📊 API 문서: http://localhost:${PORT}/api/docs`);
  console.log(`🏥 헬스 체크: http://localhost:${PORT}/health`);
  console.log(`🔧 모드: ${process.env.KIS_MOCK_MODE === 'true' ? '모의투자' : '실전투자'}`);
});

module.exports = app;

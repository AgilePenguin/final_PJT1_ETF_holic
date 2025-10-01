const axios = require('axios');
require('dotenv').config();

class KoreaInvestmentAPI {
  constructor() {
    this.appKey = process.env.KIS_APP_KEY;
    this.appSecret = process.env.KIS_APP_SECRET;
    this.accountNo = process.env.KIS_ACCOUNT_NO;
    this.baseURL = process.env.KIS_MOCK_MODE === 'true' 
      ? process.env.KIS_MOCK_BASE_URL 
      : process.env.KIS_BASE_URL;
    
    this.accessToken = null;
    this.tokenExpiry = null;
    
    console.log(`KIS API 초기화 완료 - 모드: ${process.env.KIS_MOCK_MODE === 'true' ? '모의투자' : '실전투자'}`);
  }

  /**
   * 액세스 토큰 발급
   */
  async getAccessToken() {
    try {
      // API 키가 실제 값이 아닌 경우 모의 토큰 반환
      if (this.appKey === 'your_app_key_here' || !this.appKey) {
        console.log('모의 토큰 반환');
        return 'mock_access_token';
      }

      // 토큰이 유효한 경우 재사용
      if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

      const url = `${this.baseURL}/oauth2/tokenP`;
      const data = {
        grant_type: 'client_credentials',
        appkey: this.appKey,
        appsecret: this.appSecret
      };

      const response = await axios.post(url, data, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.access_token) {
        this.accessToken = response.data.access_token;
        // 토큰 만료 시간 설정 (23시간 후)
        this.tokenExpiry = Date.now() + (23 * 60 * 60 * 1000);
        
        console.log('KIS 액세스 토큰 발급 완료');
        return this.accessToken;
      } else {
        throw new Error('토큰 발급 실패: 응답 데이터 없음');
      }
    } catch (error) {
      console.error('토큰 발급 오류:', error.response?.data || error.message);
      throw new Error(`토큰 발급 실패: ${error.message}`);
    }
  }

  /**
   * ETF 현재가 조회
   */
  async getETFPrice(ticker) {
    try {
      const token = await this.getAccessToken();
      
      const url = `${this.baseURL}/uapi/domestic-stock/v1/quotations/inquire-price`;
      const headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'authorization': `Bearer ${token}`,
        'appkey': this.appKey,
        'appsecret': this.appSecret,
        'tr_id': 'FHKST01010100'
      };

      const params = {
        FID_COND_MRKT_DIV_CODE: 'J',
        FID_INPUT_ISCD: ticker
      };

      const response = await axios.get(url, { headers, params });
      
      if (response.data && response.data.output) {
        const data = response.data.output;
        return {
          ticker: ticker,
          name: data.hts_kor_isnm || 'Unknown',
          currentPrice: parseInt(data.stck_prpr) || 0,
          changePrice: parseInt(data.prdy_vrss) || 0,
          changeRate: parseFloat(data.prdy_ctrt) || 0,
          volume: parseInt(data.acml_vol) || 0,
          tradingValue: parseInt(data.acml_tr_pbmn) || 0,
          high: parseInt(data.stck_hgpr) || 0,
          low: parseInt(data.stck_lwpr) || 0,
          open: parseInt(data.stck_oprc) || 0,
          previousClose: parseInt(data.stck_sdpr) || 0,
          timestamp: new Date().toISOString()
        };
      } else {
        throw new Error('ETF 가격 데이터 없음');
      }
    } catch (error) {
      console.error(`ETF 가격 조회 오류 (${ticker}):`, error.response?.data || error.message);
      throw new Error(`ETF 가격 조회 실패: ${error.message}`);
    }
  }

  /**
   * ETF 종목 구성 조회
   */
  async getETFHoldings(ticker) {
    try {
      // API 키가 실제 값이 아닌 경우 모의 데이터 반환
      if (this.appKey === 'your_app_key_here' || !this.appKey) {
        console.log(`모의 데이터 반환 (${ticker})`);
        return this.getMockHoldingsData(ticker);
      }

      const token = await this.getAccessToken();
      
      const url = `${this.baseURL}/uapi/domestic-stock/v1/quotations/inquire-price`;
      const headers = {
        'Content-Type': 'application/json; charset=utf-8',
        'authorization': `Bearer ${token}`,
        'appkey': this.appKey,
        'appsecret': this.appSecret,
        'tr_id': 'FHKST03030100'
      };

      const params = {
        FID_COND_MRKT_DIV_CODE: 'J',
        FID_INPUT_ISCD: ticker
      };

      const response = await axios.get(url, { headers, params });
      
      if (response.data && response.data.output) {
        const data = response.data.output;
        return {
          ticker: ticker,
          etfName: data.hts_kor_isnm || 'Unknown',
          nav: parseFloat(data.nav) || 0,
          totalHoldings: parseInt(data.tot_cnt) || 0,
          updateDate: data.updt_dt || new Date().toISOString().split('T')[0],
          holdings: data.output1 || []
        };
      } else {
        throw new Error('ETF 종목 구성 데이터 없음');
      }
    } catch (error) {
      console.error(`ETF 종목 구성 조회 오류 (${ticker}):`, error.response?.data || error.message);
      // 오류 발생 시 모의 데이터 반환
      console.log(`오류로 인해 모의 데이터 반환 (${ticker})`);
      return this.getMockHoldingsData(ticker);
    }
  }

  /**
   * 모의 ETF 종목 구성 데이터 생성
   */
  getMockHoldingsData(ticker) {
    const mockData = {
      '396500': {
        ticker: '396500',
        etfName: 'TIGER 글로벌클린에너지SOLACTIVE',
        nav: 12345.67,
        totalHoldings: 5,
        updateDate: '2025-10-01',
        holdings: [
          { stockCode: '005930', stockName: '삼성전자', weight: 25.5, shares: 12345, value: 892345000 },
          { stockCode: '000660', stockName: 'SK하이닉스', weight: 20.1, shares: 54321, value: 789012000 },
          { stockCode: '035420', stockName: 'NAVER', weight: 15.0, shares: 9876, value: 678901000 },
          { stockCode: '035720', stockName: '카카오', weight: 12.5, shares: 6543, value: 567890000 },
          { stockCode: '051910', stockName: 'LG화학', weight: 10.0, shares: 3210, value: 456789000 }
        ]
      },
      '371460': {
        ticker: '371460',
        etfName: 'TIGER 차이나전기차SOLACTIVE',
        nav: 23456.78,
        totalHoldings: 4,
        updateDate: '2025-10-01',
        holdings: [
          { stockCode: '005930', stockName: '삼성전자', weight: 30.0, shares: 20000, value: 1200000000 },
          { stockCode: '000660', stockName: 'SK하이닉스', weight: 25.0, shares: 15000, value: 900000000 },
          { stockCode: '035420', stockName: 'NAVER', weight: 20.0, shares: 10000, value: 600000000 },
          { stockCode: '035720', stockName: '카카오', weight: 15.0, shares: 5000, value: 300000000 }
        ]
      },
      '463710': {
        ticker: '463710',
        etfName: 'ACE 글로벌친환경에너지',
        nav: 34567.89,
        totalHoldings: 3,
        updateDate: '2025-10-01',
        holdings: [
          { stockCode: '005930', stockName: '삼성전자', weight: 40.0, shares: 30000, value: 1800000000 },
          { stockCode: '000660', stockName: 'SK하이닉스', weight: 30.0, shares: 20000, value: 1200000000 },
          { stockCode: '035420', stockName: 'NAVER', weight: 20.0, shares: 10000, value: 600000000 }
        ]
      }
    };

    return mockData[ticker] || {
      ticker: ticker,
      etfName: 'Unknown ETF',
      nav: 0,
      totalHoldings: 0,
      updateDate: new Date().toISOString().split('T')[0],
      holdings: []
    };
  }

  /**
   * 통합 ETF 정보 조회
   */
  async getETFInfo(ticker) {
    try {
      const [priceData, holdingsData] = await Promise.all([
        this.getETFPrice(ticker),
        this.getETFHoldings(ticker)
      ]);

      return {
        ...priceData,
        holdings: holdingsData.holdings,
        nav: holdingsData.nav,
        totalHoldings: holdingsData.totalHoldings,
        updateDate: holdingsData.updateDate
      };
    } catch (error) {
      console.error(`통합 ETF 정보 조회 오류 (${ticker}):`, error.message);
      throw new Error(`통합 ETF 정보 조회 실패: ${error.message}`);
    }
  }
}

module.exports = KoreaInvestmentAPI;

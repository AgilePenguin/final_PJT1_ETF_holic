const axios = require('axios');

const BASE_URL = 'http://localhost:3003';
const ETF_TICKERS = [
  { ticker: '396500', name: 'TIGER 글로벌클린에너지SOLACTIVE' },
  { ticker: '371460', name: 'TIGER 차이나전기차SOLACTIVE' },
  { ticker: '463710', name: 'ACE 글로벌친환경에너지' },
];

async function debugHoldings() {
  console.log('=== 한국투자증권 ETF 종목 구성 데이터 디버깅 시작 ===\n');

  for (const etf of ETF_TICKERS) {
    const endpoint = `${BASE_URL}/api/etf/${etf.ticker}/holdings`;
    console.log(`=== ETF: ${etf.ticker} (${etf.name}) ===`);
    console.log(`API Endpoint: ${endpoint}`);

    try {
      const response = await axios.get(endpoint, {
        // KIS API는 응답이 느릴 수 있으므로 타임아웃을 넉넉하게 설정
        timeout: 15000 
      });

      console.log(`Status: ${response.status}`);
      console.log('Response:');
      console.log(JSON.stringify(response.data, null, 2));
      console.log('\n--- 확인된 정보 ---');
      console.log(`  - API 호출 성공: ${response.status === 200 ? '✅' : '❌'}`);
      console.log(`  - 응답 데이터 구조: ${typeof response.data}`);
      console.log(`  - ETF 이름: ${response.data.etfName || 'N/A'}`);
      console.log(`  - NAV: ${response.data.nav || 'N/A'}`);
      console.log(`  - 총 구성 종목 수: ${response.data.totalHoldings || 'N/A'}`);
      console.log(`  - 업데이트 날짜: ${response.data.updateDate || 'N/A'}`);
      console.log(`  - holdings 데이터 존재 여부: ${Array.isArray(response.data.holdings) ? '✅ (배열)' : '❌ (없거나 배열 아님)'}`);
      if (Array.isArray(response.data.holdings) && response.data.holdings.length > 0) {
        console.log('  - 첫 번째 구성 종목 샘플:');
        console.log(JSON.stringify(response.data.holdings[0], null, 2).split('\n').map(line => `    ${line}`).join('\n'));
      } else {
        console.log('  - holdings 데이터가 비어 있거나 유효하지 않습니다.');
      }
      console.log('\n');

    } catch (error) {
      console.log(`Status: ${error.response ? error.response.status : 'N/A'}`);
      console.error('Error:');
      if (error.response) {
        console.error(`  HTTP Status: ${error.response.status}`);
        console.error(`  Error Message: ${error.message}`);
        console.error('  Error Response Data:');
        console.error(JSON.stringify(error.response.data, null, 2));
      } else if (error.request) {
        console.error('  No response received from server.');
        console.error('  Request:', error.request);
      } else {
        console.error('  Error setting up request:', error.message);
      }
      console.log('\n');
    }
  }
  console.log('=== ETF 종목 구성 데이터 디버깅 완료 ===');
}

debugHoldings();

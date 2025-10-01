const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testAPI() {
  console.log('🧪 ETF Holic Backend API 테스트 시작\n');

  try {
    // 1. 헬스 체크
    console.log('1️⃣ 헬스 체크 테스트...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ 헬스 체크 성공:', healthResponse.data);
    console.log('');

    // 2. API 문서 조회
    console.log('2️⃣ API 문서 조회...');
    const docsResponse = await axios.get(`${BASE_URL}/api/docs`);
    console.log('✅ API 문서 조회 성공');
    console.log('사용 가능한 엔드포인트:', Object.keys(docsResponse.data.endpoints));
    console.log('');

    // 3. ETF 가격 조회 테스트 (KODEX 200)
    console.log('3️⃣ ETF 가격 조회 테스트 (069500 - KODEX 200)...');
    try {
      const priceResponse = await axios.get(`${BASE_URL}/api/etf/069500/price`);
      console.log('✅ ETF 가격 조회 성공:');
      console.log(`   이름: ${priceResponse.data.name}`);
      console.log(`   현재가: ${priceResponse.data.currentPrice?.toLocaleString()}원`);
      console.log(`   등락률: ${priceResponse.data.changeRate}%`);
      console.log(`   거래량: ${priceResponse.data.volume?.toLocaleString()}주`);
    } catch (error) {
      console.log('❌ ETF 가격 조회 실패:', error.response?.data?.message || error.message);
    }
    console.log('');

    // 4. ETF 종목 구성 조회 테스트
    console.log('4️⃣ ETF 종목 구성 조회 테스트 (069500 - KODEX 200)...');
    try {
      const holdingsResponse = await axios.get(`${BASE_URL}/api/etf/069500/holdings`);
      console.log('✅ ETF 종목 구성 조회 성공:');
      console.log(`   ETF 이름: ${holdingsResponse.data.etfName}`);
      console.log(`   NAV: ${holdingsResponse.data.nav}`);
      console.log(`   총 보유 종목 수: ${holdingsResponse.data.totalHoldings}개`);
      console.log(`   업데이트 날짜: ${holdingsResponse.data.updateDate}`);
    } catch (error) {
      console.log('❌ ETF 종목 구성 조회 실패:', error.response?.data?.message || error.message);
    }
    console.log('');

    // 5. 통합 정보 조회 테스트
    console.log('5️⃣ 통합 ETF 정보 조회 테스트 (069500 - KODEX 200)...');
    try {
      const fullResponse = await axios.get(`${BASE_URL}/api/etf/069500/full`);
      console.log('✅ 통합 정보 조회 성공:');
      console.log(`   이름: ${fullResponse.data.name}`);
      console.log(`   현재가: ${fullResponse.data.currentPrice?.toLocaleString()}원`);
      console.log(`   NAV: ${fullResponse.data.nav}`);
      console.log(`   총 보유 종목 수: ${fullResponse.data.totalHoldings}개`);
    } catch (error) {
      console.log('❌ 통합 정보 조회 실패:', error.response?.data?.message || error.message);
    }
    console.log('');

    // 6. 잘못된 티커 테스트
    console.log('6️⃣ 잘못된 티커 형식 테스트...');
    try {
      await axios.get(`${BASE_URL}/api/etf/invalid/price`);
    } catch (error) {
      console.log('✅ 잘못된 티커 형식 오류 처리 성공:', error.response.data.message);
    }
    console.log('');

    console.log('🎉 모든 테스트 완료!');

  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    console.log('\n💡 서버가 실행 중인지 확인하세요: npm start');
  }
}

// 테스트 실행
testAPI();

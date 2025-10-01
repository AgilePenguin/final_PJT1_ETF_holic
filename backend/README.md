# ETF Holic Backend API

한국투자증권 OpenAPI를 사용하여 ETF 데이터를 제공하는 백엔드 API입니다.

## 🚀 빠른 시작

### 1. 환경 설정

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 열어서 실제 API 키를 입력하세요
```

### 2. 환경 변수 설정

`.env` 파일에 다음 정보를 입력하세요:

```env
# Gemini AI API Key
GEMINI_API_KEY=your_gemini_api_key_here

# 한국투자증권 OpenAPI 설정
KIS_APP_KEY=your_app_key_here
KIS_APP_SECRET=your_app_secret_here
KIS_ACCOUNT_NO=your_account_number_here

# API Base URLs
KIS_BASE_URL=https://openapi.koreainvestment.com:9443
KIS_MOCK_BASE_URL=https://openapivts.koreainvestment.com:29443

# 모의투자 모드 설정 (true: 모의투자, false: 실전투자)
KIS_MOCK_MODE=true
```

### 3. 서버 실행

```bash
# 개발 모드
npm run dev

# 프로덕션 모드
npm start
```

서버는 `http://localhost:3001`에서 실행됩니다.

## 📚 API 엔드포인트

### 헬스 체크
```http
GET /health
```

### ETF 현재가 조회
```http
GET /api/etf/:ticker/price
```

**파라미터:**
- `ticker`: ETF 티커 (6자리 숫자, 예: 069500)

**응답 예시:**
```json
{
  "ticker": "069500",
  "name": "KODEX 200",
  "currentPrice": 35000,
  "changePrice": 150,
  "changeRate": 0.43,
  "volume": 1234567,
  "tradingValue": 43210000000,
  "high": 35200,
  "low": 34800,
  "open": 34900,
  "previousClose": 34850,
  "timestamp": "2025-10-01T15:30:00"
}
```

### ETF 종목 구성 조회
```http
GET /api/etf/:ticker/holdings
```

**응답 예시:**
```json
{
  "ticker": "069500",
  "etfName": "KODEX 200",
  "nav": 35123.45,
  "totalHoldings": 200,
  "updateDate": "2025-10-01",
  "holdings": [
    {
      "stockCode": "005930",
      "stockName": "삼성전자",
      "weight": 25.5,
      "shares": 12345,
      "value": 892345000
    }
  ]
}
```

### 통합 ETF 정보 조회
```http
GET /api/etf/:ticker/full
```

현재가 정보와 종목 구성을 한 번에 조회합니다.

### API 문서
```http
GET /api/docs
```

## 🧪 테스트

### Postman 테스트

1. **ETF 가격 조회 테스트:**
   ```
   GET http://localhost:3001/api/etf/069500/price
   ```

2. **ETF 종목 구성 조회 테스트:**
   ```
   GET http://localhost:3001/api/etf/069500/holdings
   ```

3. **통합 정보 조회 테스트:**
   ```
   GET http://localhost:3001/api/etf/069500/full
   ```

### curl 테스트

```bash
# ETF 가격 조회
curl http://localhost:3001/api/etf/069500/price

# ETF 종목 구성 조회
curl http://localhost:3001/api/etf/069500/holdings

# 통합 정보 조회
curl http://localhost:3001/api/etf/069500/full
```

## 📊 샘플 ETF 티커

| ETF 이름 | 티커 | 설명 |
|---------|------|------|
| KODEX 200 | 069500 | 코스피 200 추종 |
| TIGER 미국S&P500 | 360750 | 미국 S&P 500 추종 |
| KODEX 반도체 | 091230 | 반도체 섹터 |
| TIGER 나스닥100 | 133690 | 나스닥 100 추종 |
| KODEX 2차전지산업 | 305720 | 2차전지 섹터 |

## 🔧 프론트엔드 연동

### JavaScript (Fetch API)

```javascript
// ETF 가격 조회
async function getETFPrice(ticker) {
  try {
    const response = await fetch(`http://localhost:3001/api/etf/${ticker}/price`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('ETF 가격 조회 오류:', error);
    throw error;
  }
}

// ETF 종목 구성 조회
async function getETFHoldings(ticker) {
  try {
    const response = await fetch(`http://localhost:3001/api/etf/${ticker}/holdings`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('ETF 종목 구성 조회 오류:', error);
    throw error;
  }
}

// 사용 예시
getETFPrice('069500').then(data => {
  console.log('KODEX 200 현재가:', data.currentPrice);
});
```

### React Hook 예시

```javascript
import { useState, useEffect } from 'react';

function useETFData(ticker) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3001/api/etf/${ticker}/full`);
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    if (ticker) {
      fetchData();
    }
  }, [ticker]);

  return { data, loading, error };
}

// 컴포넌트에서 사용
function ETFComponent({ ticker }) {
  const { data, loading, error } = useETFData(ticker);

  if (loading) return <div>로딩 중...</div>;
  if (error) return <div>오류 발생: {error.message}</div>;
  if (!data) return <div>데이터 없음</div>;

  return (
    <div>
      <h2>{data.name}</h2>
      <p>현재가: {data.currentPrice.toLocaleString()}원</p>
      <p>등락률: {data.changeRate}%</p>
    </div>
  );
}
```

## ⚠️ 주의사항

1. **API 키 보안**: `.env` 파일을 절대 공개 저장소에 커밋하지 마세요.
2. **Rate Limiting**: 한국투자증권 API는 요청 제한이 있으므로 적절한 딜레이를 두세요.
3. **토큰 관리**: 액세스 토큰은 자동으로 관리되며 23시간마다 갱신됩니다.
4. **모의투자 모드**: 개발 시에는 `KIS_MOCK_MODE=true`로 설정하세요.

## 🐛 문제 해결

### 일반적인 오류

1. **토큰 발급 실패**
   - API 키와 시크릿이 올바른지 확인
   - 네트워크 연결 상태 확인

2. **ETF 데이터 없음**
   - 티커가 올바른지 확인 (6자리 숫자)
   - 해당 ETF가 상장되어 있는지 확인

3. **서버 연결 실패**
   - 포트 3001이 사용 중인지 확인
   - 방화벽 설정 확인

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. 환경 변수 설정
2. 네트워크 연결
3. 한국투자증권 API 상태
4. 서버 로그

---

**ETF Holic Backend API v1.0.0**

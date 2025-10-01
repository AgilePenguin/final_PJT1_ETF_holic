# KIS(한국투자증권) API 응답 구조 및 관계형 테이블 설계

## 📋 환경 설정 (.env)
```env
KIS_APP_KEY=your_app_key_here
KIS_APP_SECRET=your_app_secret_here
KIS_ACCOUNT_NO=your_account_no
KIS_BASE_URL=https://openapi.koreainvestment.com:9443
KIS_MOCK_MODE=true
KIS_MOCK_BASE_URL=http://localhost:3001
```

## 🔍 주요 API 엔드포인트

### 1️⃣ 실시간 시세 조회 API
- **엔드포인트**: `/uapi/domestic-stock/v1/quotations/inquire-price`
- **TR_ID**: `FHKST01010100`
- **요청 파라미터**:
  ```json
  {
    "FID_COND_MRKT_DIV_CODE": "J",
    "FID_INPUT_ISCD": "069500"
  }
  ```

### 2️⃣ 종목 기본 정보 조회 API
- **엔드포인트**: `/uapi/domestic-stock/v1/quotations/inquire-basic-price`
- **TR_ID**: `FHKST03030100`

### 3️⃣ 종목 체결 정보 조회 API
- **엔드포인트**: `/uapi/domestic-stock/v1/quotations/inquire-transaction`
- **TR_ID**: (요청 시 지정)

---

## 📊 관계형 테이블 설계

### 테이블 1: `kis_price_snapshot` (실시간 시세 스냅샷)

| 컬럼명 | KIS API 필드명 | 데이터 타입 | 설명 | 예시값 |
|--------|---------------|------------|------|--------|
| `id` | - | `SERIAL PRIMARY KEY` | 자동 증가 ID | 1, 2, 3... |
| `ticker` | (요청 파라미터) | `VARCHAR(20)` | 종목 코드 | "069500" |
| `name` | `hts_kor_isnm` | `VARCHAR(100)` | 종목명 (한글) | "KODEX 200" |
| `current_price` | `stck_prpr` | `INT` | 현재가 (원) | 32000 |
| `change_price` | `prdy_vrss` | `INT` | 전일대비 (원) | 500 |
| `change_rate` | `prdy_ctrt` | `DECIMAL(10,2)` | 전일대비율 (%) | 1.59 |
| `volume` | `acml_vol` | `BIGINT` | 누적 거래량 (주) | 1500000 |
| `trading_value` | `acml_tr_pbmn` | `BIGINT` | 누적 거래대금 (원) | 48000000000 |
| `high` | `stck_hgpr` | `INT` | 당일 고가 (원) | 32500 |
| `low` | `stck_lwpr` | `INT` | 당일 저가 (원) | 31800 |
| `open` | `stck_oprc` | `INT` | 당일 시가 (원) | 31900 |
| `previous_close` | `stck_sdpr` | `INT` | 전일 종가 (원) | 31500 |
| `upper_limit` | `stck_mxpr` | `INT` | 상한가 (원) | 33000 |
| `lower_limit` | `stck_llam` | `INT` | 하한가 (원) | 30000 |
| `timestamp` | - | `TIMESTAMP` | 데이터 수집 시각 | "2025-10-01 09:30:00" |
| `created_at` | - | `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` | 레코드 생성 시각 | "2025-10-01 09:30:05" |

**인덱스**:
- `idx_ticker_timestamp` on (`ticker`, `timestamp`)
- `idx_timestamp` on (`timestamp`)

**SQL 생성문**:
```sql
CREATE TABLE kis_price_snapshot (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL,
    name VARCHAR(100),
    current_price INT,
    change_price INT,
    change_rate DECIMAL(10,2),
    volume BIGINT,
    trading_value BIGINT,
    high INT,
    low INT,
    open INT,
    previous_close INT,
    upper_limit INT,
    lower_limit INT,
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ticker_timestamp ON kis_price_snapshot(ticker, timestamp);
CREATE INDEX idx_timestamp ON kis_price_snapshot(timestamp);
```

---

### 테이블 2: `kis_etf_basic_info` (ETF 기본 정보)

| 컬럼명 | KIS API 필드명 | 데이터 타입 | 설명 | 예시값 |
|--------|---------------|------------|------|--------|
| `id` | - | `SERIAL PRIMARY KEY` | 자동 증가 ID | 1, 2, 3... |
| `ticker` | (요청 파라미터) | `VARCHAR(20) UNIQUE` | 종목 코드 (고유) | "069500" |
| `name` | `hts_kor_isnm` | `VARCHAR(100)` | ETF 이름 | "KODEX 200" |
| `nav` | `nav` | `DECIMAL(15,2)` | 순자산가치 (NAV) | 12345.67 |
| `total_holdings` | `tot_cnt` | `INT` | 총 보유 종목 수 | 200 |
| `expense_ratio` | `expense_ratio` | `DECIMAL(5,4)` | 운용보수 (%) | 0.0540 |
| `dividend_yield` | `dividend_yield` | `DECIMAL(5,2)` | 배당수익률 (%) | 1.25 |
| `dividend_frequency` | `dividend_freq` | `VARCHAR(20)` | 배당주기 | "연 1회" |
| `last_dividend_date` | `last_div_date` | `DATE` | 최근 배당일 | "2025-03-15" |
| `last_dividend_amount` | `last_div_amt` | `DECIMAL(10,2)` | 최근 배당금 (원) | 150.00 |
| `update_date` | `updt_dt` | `DATE` | 데이터 업데이트 날짜 | "2025-10-01" |
| `market_type` | - | `VARCHAR(20)` | 시장 구분 | "KOSPI" |
| `category` | - | `VARCHAR(50)` | 카테고리 | "지수추종" |
| `created_at` | - | `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` | 레코드 생성 시각 | "2025-10-01 09:30:05" |
| `updated_at` | - | `TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP` | 레코드 수정 시각 | "2025-10-01 10:15:00" |

**인덱스**:
- `UNIQUE KEY ticker` (자동 생성)

**SQL 생성문**:
```sql
CREATE TABLE kis_etf_basic_info (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100),
    nav DECIMAL(15,2),
    total_holdings INT,
    update_date DATE,
    market_type VARCHAR(20),
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

### 테이블 3: `kis_etf_holdings` (ETF 보유 종목)

| 컬럼명 | KIS API 필드명 | 데이터 타입 | 설명 | 예시값 |
|--------|---------------|------------|------|--------|
| `id` | - | `SERIAL PRIMARY KEY` | 자동 증가 ID | 1, 2, 3... |
| `etf_ticker` | (요청 파라미터) | `VARCHAR(20)` | ETF 종목 코드 (FK) | "069500" |
| `stock_code` | `stock_code` | `VARCHAR(20)` | 보유 종목 코드 | "005930" |
| `stock_name` | `stock_name` | `VARCHAR(100)` | 보유 종목 이름 | "삼성전자" |
| `weight` | `weight` | `DECIMAL(10,4)` | 보유 비중 (%) | 25.5000 |
| `shares` | `shares` | `BIGINT` | 보유 주식 수 | 12345 |
| `value` | `value` | `BIGINT` | 보유 평가 금액 (원) | 892345000 |
| `update_date` | - | `DATE` | 데이터 업데이트 날짜 | "2025-10-01" |
| `created_at` | - | `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` | 레코드 생성 시각 | "2025-10-01 09:30:05" |

**인덱스**:
- `idx_etf_ticker` on (`etf_ticker`)
- `idx_stock_code` on (`stock_code`)

**외래키**:
- `etf_ticker` REFERENCES `kis_etf_basic_info(ticker)` ON DELETE CASCADE

**SQL 생성문**:
```sql
CREATE TABLE kis_etf_holdings (
    id SERIAL PRIMARY KEY,
    etf_ticker VARCHAR(20) NOT NULL,
    stock_code VARCHAR(20),
    stock_name VARCHAR(100),
    weight DECIMAL(10,4),
    shares BIGINT,
    value BIGINT,
    update_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (etf_ticker) REFERENCES kis_etf_basic_info(ticker) ON DELETE CASCADE
);

CREATE INDEX idx_etf_ticker ON kis_etf_holdings(etf_ticker);
CREATE INDEX idx_stock_code ON kis_etf_holdings(stock_code);
```

---

### 테이블 4: `kis_price_history` (가격 히스토리 - 시계열 데이터)

| 컬럼명 | 데이터 타입 | 설명 | 예시값 |
|--------|------------|------|--------|
| `id` | `SERIAL PRIMARY KEY` | 자동 증가 ID | 1, 2, 3... |
| `ticker` | `VARCHAR(20)` | 종목 코드 | "069500" |
| `date` | `DATE` | 거래일 | "2025-10-01" |
| `open` | `INT` | 시가 (원) | 31900 |
| `high` | `INT` | 고가 (원) | 32500 |
| `low` | `INT` | 저가 (원) | 31800 |
| `close` | `INT` | 종가 (원) | 32000 |
| `volume` | `BIGINT` | 거래량 (주) | 1500000 |
| `trading_value` | `BIGINT` | 거래대금 (원) | 48000000000 |
| `change_rate` | `DECIMAL(10,2)` | 등락률 (%) | 1.59 |
| `created_at` | `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` | 레코드 생성 시각 | "2025-10-01 16:00:00" |

**인덱스**:
- `UNIQUE KEY ticker_date` on (`ticker`, `date`)
- `idx_date` on (`date`)

**SQL 생성문**:
```sql
CREATE TABLE kis_price_history (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL,
    date DATE NOT NULL,
    open INT,
    high INT,
    low INT,
    close INT,
    volume BIGINT,
    trading_value BIGINT,
    change_rate DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY ticker_date (ticker, date)
);

CREATE INDEX idx_date ON kis_price_history(date);
```

---

## 🚀 프론트엔드용 API 엔드포인트

### 1️⃣ ETF 보유 종목 조회 (도넛 차트용)
```javascript
// GET /api/etf/{ticker}/holdings
app.get('/api/etf/:ticker/holdings', async (req, res) => {
  const { ticker } = req.params;
  const limit = req.query.limit || 10;
  
  try {
    const result = await pool.query(`
      SELECT stock_name, weight, stock_code
      FROM kis_etf_holdings 
      WHERE etf_ticker = $1
      ORDER BY weight DESC
      LIMIT $2
    `, [ticker, limit]);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 2️⃣ 주가 추이 조회 (라인 차트용)
```javascript
// GET /api/etf/price-history
app.get('/api/etf/price-history', async (req, res) => {
  const { tickers, period = '3m' } = req.query;
  const tickerList = tickers.split(',');
  
  // 기간 계산
  const periodDays = period === '1m' ? 30 : period === '3m' ? 90 : period === '6m' ? 180 : 365;
  
  try {
    const result = await pool.query(`
      SELECT ticker, date, close, change_rate
      FROM kis_price_history 
      WHERE ticker = ANY($1)
        AND date >= CURRENT_DATE - INTERVAL '${periodDays} days'
      ORDER BY ticker, date
    `, [tickerList]);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 3️⃣ 거래량/거래대금 추이 조회
```javascript
// GET /api/etf/volume-history
app.get('/api/etf/volume-history', async (req, res) => {
  const { tickers, period = '3m' } = req.query;
  const tickerList = tickers.split(',');
  
  const periodDays = period === '1m' ? 30 : period === '3m' ? 90 : period === '6m' ? 180 : 365;
  
  try {
    const result = await pool.query(`
      SELECT ticker, date, volume, trading_value, close
      FROM kis_price_history 
      WHERE ticker = ANY($1)
        AND date >= CURRENT_DATE - INTERVAL '${periodDays} days'
      ORDER BY ticker, date
    `, [tickerList]);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 4️⃣ 수수료 및 배당금 정보 조회 (테이블용)
```javascript
// GET /api/etf/fees-info
app.get('/api/etf/fees-info', async (req, res) => {
  const { tickers } = req.query;
  const tickerList = tickers.split(',');
  
  try {
    const result = await pool.query(`
      SELECT 
        ticker,
        name,
        expense_ratio,
        dividend_yield,
        dividend_frequency,
        last_dividend_date,
        last_dividend_amount,
        nav,
        total_holdings
      FROM kis_etf_basic_info 
      WHERE ticker = ANY($1)
      ORDER BY ticker
    `, [tickerList]);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 🔄 데이터 수집 플로우

### 1. 실시간 시세 수집 (1분마다)
```javascript
async function collectRealtimePrice(ticker) {
  const data = await kisAPI.getETFPrice(ticker);
  
  // kis_price_snapshot 테이블에 INSERT
  const query = `
    INSERT INTO kis_price_snapshot 
    (ticker, name, current_price, change_price, change_rate, volume, trading_value, 
     high, low, open, previous_close, upper_limit, lower_limit, timestamp)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW())
  `;
  
  await db.query(query, [
    data.ticker,
    data.name,
    data.currentPrice,
    data.changePrice,
    data.changeRate,
    data.volume,
    data.tradingValue,
    data.high,
    data.low,
    data.open,
    data.previousClose,
    // upper_limit, lower_limit은 API 응답에 따라 추가
    null, null
  ]);
}
```

### 2. ETF 기본 정보 및 보유 종목 수집 (1일 1회)
```javascript
async function collectETFInfo(ticker) {
  const data = await kisAPI.getETFHoldings(ticker);
  
  // kis_etf_basic_info 테이블에 UPSERT
  await db.query(`
    INSERT INTO kis_etf_basic_info (ticker, name, nav, total_holdings, update_date)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (ticker) DO UPDATE SET
      name = EXCLUDED.name,
      nav = EXCLUDED.nav,
      total_holdings = EXCLUDED.total_holdings,
      update_date = EXCLUDED.update_date,
      updated_at = NOW()
  `, [data.ticker, data.etfName, data.nav, data.totalHoldings, data.updateDate]);
  
  // kis_etf_holdings 테이블에 INSERT (기존 데이터 삭제 후)
  await db.query('DELETE FROM kis_etf_holdings WHERE etf_ticker = $1', [ticker]);
  
  for (const holding of data.holdings) {
    await db.query(`
      INSERT INTO kis_etf_holdings (etf_ticker, stock_code, stock_name, weight, shares, value, update_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [ticker, holding.stockCode, holding.stockName, holding.weight, holding.shares, holding.value, data.updateDate]);
  }
}
```

### 3. 일별 가격 히스토리 수집 (장 마감 후)
```javascript
async function collectDailyHistory(ticker, date) {
  const data = await kisAPI.getETFPrice(ticker);
  
  // kis_price_history 테이블에 UPSERT
  await db.query(`
    INSERT INTO kis_price_history (ticker, date, open, high, low, close, volume, trading_value, change_rate)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (ticker, date) DO UPDATE SET
      open = EXCLUDED.open,
      high = EXCLUDED.high,
      low = EXCLUDED.low,
      close = EXCLUDED.close,
      volume = EXCLUDED.volume,
      trading_value = EXCLUDED.trading_value,
      change_rate = EXCLUDED.change_rate,
      updated_at = NOW()
  `, [ticker, date, data.open, data.high, data.low, data.currentPrice, data.volume, data.tradingValue, data.changeRate]);
}
```

---

## 📦 샘플 응답 JSON

### 실시간 시세 조회 응답 예시
```json
{
  "rt_cd": "0",
  "msg_cd": "MCA00000",
  "msg1": "정상처리 되었습니다.",
  "output": {
    "hts_kor_isnm": "KODEX 200",
    "stck_prpr": "32000",
    "prdy_vrss": "500",
    "prdy_ctrt": "1.59",
    "acml_vol": "1500000",
    "acml_tr_pbmn": "48000000000",
    "stck_hgpr": "32500",
    "stck_lwpr": "31800",
    "stck_oprc": "31900",
    "stck_sdpr": "31500"
  }
}
```

### ETF 종목 구성 조회 응답 예시
```json
{
  "rt_cd": "0",
  "msg_cd": "MCA00000",
  "msg1": "정상처리 되었습니다.",
  "output": {
    "hts_kor_isnm": "KODEX 200",
    "nav": "32150.50",
    "tot_cnt": "200",
    "updt_dt": "20251001"
  },
  "output1": [
    {
      "stock_code": "005930",
      "stock_name": "삼성전자",
      "weight": "25.5000",
      "shares": "12345",
      "value": "892345000"
    },
    {
      "stock_code": "000660",
      "stock_name": "SK하이닉스",
      "weight": "20.1000",
      "shares": "54321",
      "value": "789012000"
    }
  ]
}
```

---

## 🎯 데이터베이스 마이그레이션 스크립트

전체 테이블을 한번에 생성하는 마이그레이션 스크립트:

```sql
-- 1. kis_etf_basic_info 테이블 생성 (FK 참조 대상이므로 먼저 생성)
CREATE TABLE IF NOT EXISTS kis_etf_basic_info (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100),
    nav DECIMAL(15,2),
    total_holdings INT,
    update_date DATE,
    market_type VARCHAR(20),
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. kis_price_snapshot 테이블 생성
CREATE TABLE IF NOT EXISTS kis_price_snapshot (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL,
    name VARCHAR(100),
    current_price INT,
    change_price INT,
    change_rate DECIMAL(10,2),
    volume BIGINT,
    trading_value BIGINT,
    high INT,
    low INT,
    open INT,
    previous_close INT,
    upper_limit INT,
    lower_limit INT,
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ticker_timestamp ON kis_price_snapshot(ticker, timestamp);
CREATE INDEX IF NOT EXISTS idx_timestamp ON kis_price_snapshot(timestamp);

-- 3. kis_etf_holdings 테이블 생성
CREATE TABLE IF NOT EXISTS kis_etf_holdings (
    id SERIAL PRIMARY KEY,
    etf_ticker VARCHAR(20) NOT NULL,
    stock_code VARCHAR(20),
    stock_name VARCHAR(100),
    weight DECIMAL(10,4),
    shares BIGINT,
    value BIGINT,
    update_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (etf_ticker) REFERENCES kis_etf_basic_info(ticker) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_etf_ticker ON kis_etf_holdings(etf_ticker);
CREATE INDEX IF NOT EXISTS idx_stock_code ON kis_etf_holdings(stock_code);

-- 4. kis_price_history 테이블 생성
CREATE TABLE IF NOT EXISTS kis_price_history (
    id SERIAL PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL,
    date DATE NOT NULL,
    open INT,
    high INT,
    low INT,
    close INT,
    volume BIGINT,
    trading_value BIGINT,
    change_rate DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (ticker, date)
);

CREATE INDEX IF NOT EXISTS idx_date ON kis_price_history(date);
```

---

## 📊 유용한 쿼리 예시

### 1. 특정 ETF의 최근 실시간 시세 조회
```sql
SELECT * 
FROM kis_price_snapshot 
WHERE ticker = '069500' 
ORDER BY timestamp DESC 
LIMIT 10;
```

### 2. 특정 ETF의 보유 종목 TOP 10 조회
```sql
SELECT stock_code, stock_name, weight, value
FROM kis_etf_holdings
WHERE etf_ticker = '069500'
ORDER BY weight DESC
LIMIT 10;
```

### 3. 특정 ETF의 최근 30일 종가 조회
```sql
SELECT date, close, change_rate
FROM kis_price_history
WHERE ticker = '069500'
  AND date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY date DESC;
```

### 4. 가장 활발하게 거래되는 ETF TOP 10 (오늘)
```sql
SELECT ticker, name, MAX(volume) as max_volume, MAX(trading_value) as max_trading_value
FROM kis_price_snapshot
WHERE DATE(timestamp) = CURRENT_DATE
GROUP BY ticker, name
ORDER BY max_trading_value DESC
LIMIT 10;
```

---

## 🔧 백엔드 코드 예시 (Node.js + PostgreSQL)

```javascript
const { Pool } = require('pg');
const KoreaInvestmentAPI = require('./kis-api');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const kisAPI = new KoreaInvestmentAPI();

// 실시간 시세 저장
async function saveRealtimePrice(ticker) {
  try {
    const data = await kisAPI.getETFPrice(ticker);
    
    const query = `
      INSERT INTO kis_price_snapshot 
      (ticker, name, current_price, change_price, change_rate, volume, trading_value, 
       high, low, open, previous_close, timestamp)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
    `;
    
    await pool.query(query, [
      data.ticker,
      data.name,
      data.currentPrice,
      data.changePrice,
      data.changeRate,
      data.volume,
      data.tradingValue,
      data.high,
      data.low,
      data.open,
      data.previousClose
    ]);
    
    console.log(`✅ ${ticker} 실시간 시세 저장 완료`);
  } catch (error) {
    console.error(`❌ ${ticker} 실시간 시세 저장 실패:`, error.message);
  }
}

// ETF 기본 정보 및 보유 종목 저장
async function saveETFInfo(ticker) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const data = await kisAPI.getETFHoldings(ticker);
    
    // ETF 기본 정보 저장
    await client.query(`
      INSERT INTO kis_etf_basic_info (ticker, name, nav, total_holdings, update_date)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (ticker) DO UPDATE SET
        name = EXCLUDED.name,
        nav = EXCLUDED.nav,
        total_holdings = EXCLUDED.total_holdings,
        update_date = EXCLUDED.update_date,
        updated_at = NOW()
    `, [data.ticker, data.etfName, data.nav, data.totalHoldings, data.updateDate]);
    
    // 기존 보유 종목 삭제
    await client.query('DELETE FROM kis_etf_holdings WHERE etf_ticker = $1', [ticker]);
    
    // 새 보유 종목 저장
    for (const holding of data.holdings) {
      await client.query(`
        INSERT INTO kis_etf_holdings 
        (etf_ticker, stock_code, stock_name, weight, shares, value, update_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        ticker, 
        holding.stockCode, 
        holding.stockName, 
        holding.weight, 
        holding.shares, 
        holding.value, 
        data.updateDate
      ]);
    }
    
    await client.query('COMMIT');
    console.log(`✅ ${ticker} ETF 정보 저장 완료`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(`❌ ${ticker} ETF 정보 저장 실패:`, error.message);
  } finally {
    client.release();
  }
}

module.exports = { saveRealtimePrice, saveETFInfo };
```

---

## 🎨 프론트엔드 구현 예시 (React + Chart.js)

### 1️⃣ 도넛 차트 (ETF 보유 종목)
```javascript
// components/ETFHoldingsChart.jsx
import { Doughnut } from 'react-chartjs-2';

const ETFHoldingsChart = ({ ticker }) => {
  const [holdingsData, setHoldingsData] = useState([]);
  
  useEffect(() => {
    fetch(`/api/etf/${ticker}/holdings?limit=10`)
      .then(res => res.json())
      .then(data => setHoldingsData(data));
  }, [ticker]);
  
  const chartData = {
    labels: holdingsData.map(item => item.stock_name),
    datasets: [{
      data: holdingsData.map(item => parseFloat(item.weight)),
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
        '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
      ]
    }]
  };
  
  return (
    <div className="chart-container">
      <h3>ETF 보유 종목 구성</h3>
      <Doughnut data={chartData} options={{ responsive: true }} />
    </div>
  );
};
```

### 2️⃣ 주가 추이 라인 차트
```javascript
// components/PriceTrendChart.jsx
import { Line } from 'react-chartjs-2';

const PriceTrendChart = ({ tickers, period = '3m' }) => {
  const [priceData, setPriceData] = useState([]);
  
  useEffect(() => {
    fetch(`/api/etf/price-history?tickers=${tickers.join(',')}&period=${period}`)
      .then(res => res.json())
      .then(data => setPriceData(data));
  }, [tickers, period]);
  
  // 데이터를 ETF별로 그룹화
  const groupedData = priceData.reduce((acc, item) => {
    if (!acc[item.ticker]) acc[item.ticker] = [];
    acc[item.ticker].push({
      x: item.date,
      y: item.close
    });
    return acc;
  }, {});
  
  const chartData = {
    datasets: Object.entries(groupedData).map(([ticker, data], index) => ({
      label: ticker,
      data: data,
      borderColor: `hsl(${index * 60}, 70%, 50%)`,
      backgroundColor: `hsla(${index * 60}, 70%, 50%, 0.1)`,
      tension: 0.1
    }))
  };
  
  return (
    <div className="chart-container">
      <h3>주가 추이 ({period})</h3>
      <Line data={chartData} options={{ responsive: true }} />
    </div>
  );
};
```

### 3️⃣ 거래량/거래대금 추이 차트
```javascript
// components/VolumeTrendChart.jsx
import { Line } from 'react-chartjs-2';

const VolumeTrendChart = ({ tickers, period = '3m' }) => {
  const [volumeData, setVolumeData] = useState([]);
  
  useEffect(() => {
    fetch(`/api/etf/volume-history?tickers=${tickers.join(',')}&period=${period}`)
      .then(res => res.json())
      .then(data => setVolumeData(data));
  }, [tickers, period]);
  
  // 거래량 데이터
  const volumeChartData = {
    datasets: tickers.map((ticker, index) => ({
      label: `${ticker} 거래량`,
      data: volumeData
        .filter(item => item.ticker === ticker)
        .map(item => ({ x: item.date, y: item.volume })),
      borderColor: `hsl(${index * 60}, 70%, 50%)`,
      yAxisID: 'y'
    }))
  };
  
  // 거래대금 데이터
  const tradingValueChartData = {
    datasets: tickers.map((ticker, index) => ({
      label: `${ticker} 거래대금`,
      data: volumeData
        .filter(item => item.ticker === ticker)
        .map(item => ({ x: item.date, y: item.trading_value })),
      borderColor: `hsl(${index * 60}, 70%, 50%)`,
      yAxisID: 'y1'
    }))
  };
  
  return (
    <div className="chart-container">
      <h3>거래량 추이 ({period})</h3>
      <Line data={volumeChartData} options={{ responsive: true }} />
      
      <h3>거래대금 추이 ({period})</h3>
      <Line data={tradingValueChartData} options={{ responsive: true }} />
    </div>
  );
};
```

### 4️⃣ 수수료 및 배당금 테이블
```javascript
// components/FeesTable.jsx
const FeesTable = ({ tickers }) => {
  const [feesData, setFeesData] = useState([]);
  
  useEffect(() => {
    fetch(`/api/etf/fees-info?tickers=${tickers.join(',')}`)
      .then(res => res.json())
      .then(data => setFeesData(data));
  }, [tickers]);
  
  return (
    <div className="table-container">
      <h3>수수료 및 배당금 정보</h3>
      <table className="fees-table">
        <thead>
          <tr>
            <th>ETF</th>
            <th>운용보수</th>
            <th>배당수익률</th>
            <th>배당주기</th>
            <th>최근 배당일</th>
            <th>최근 배당금</th>
            <th>NAV</th>
            <th>보유종목수</th>
          </tr>
        </thead>
        <tbody>
          {feesData.map(item => (
            <tr key={item.ticker}>
              <td>{item.name} ({item.ticker})</td>
              <td>{(item.expense_ratio * 100).toFixed(2)}%</td>
              <td>{item.dividend_yield}%</td>
              <td>{item.dividend_frequency}</td>
              <td>{item.last_dividend_date}</td>
              <td>{item.last_dividend_amount?.toLocaleString()}원</td>
              <td>{item.nav?.toLocaleString()}원</td>
              <td>{item.total_holdings}개</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

### 5️⃣ 통합 ETF 분석 페이지
```javascript
// pages/ETFAnalysisPage.jsx
const ETFAnalysisPage = () => {
  const [selectedETFs, setSelectedETFs] = useState(['069500', '371460', '272580']);
  const [period, setPeriod] = useState('3m');
  
  return (
    <div className="etf-analysis-page">
      <div className="controls">
        <h2>ETF 비교 분석</h2>
        <div className="period-selector">
          <label>기간 선택:</label>
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="1m">1개월</option>
            <option value="3m">3개월</option>
            <option value="6m">6개월</option>
            <option value="1y">1년</option>
          </select>
        </div>
      </div>
      
      <div className="charts-grid">
        <div className="chart-section">
          <PriceTrendChart tickers={selectedETFs} period={period} />
        </div>
        
        <div className="chart-section">
          <VolumeTrendChart tickers={selectedETFs} period={period} />
        </div>
        
        <div className="chart-section">
          <ETFHoldingsChart ticker={selectedETFs[0]} />
        </div>
        
        <div className="table-section">
          <FeesTable tickers={selectedETFs} />
        </div>
      </div>
    </div>
  );
};
```

---

## 📅 데이터 수집 스케줄 예시

```javascript
const cron = require('node-cron');

// 장 운영 시간 (09:00 ~ 15:30) 1분마다 실시간 시세 수집
cron.schedule('*/1 9-15 * * 1-5', async () => {
  const tickers = ['069500', '371460', '272580']; // 수집할 ETF 목록
  
  for (const ticker of tickers) {
    await saveRealtimePrice(ticker);
  }
});

// 매일 16:00에 일별 히스토리 저장
cron.schedule('0 16 * * 1-5', async () => {
  const tickers = ['069500', '371460', '272580'];
  
  for (const ticker of tickers) {
    await saveDailyHistory(ticker, new Date());
  }
});

// 매일 06:00에 ETF 기본 정보 및 보유 종목 업데이트
cron.schedule('0 6 * * *', async () => {
  const tickers = ['069500', '371460', '272580'];
  
  for (const ticker of tickers) {
    await saveETFInfo(ticker);
  }
});
```

---

## 🎯 요약

### 핵심 테이블 4개:
1. **`kis_price_snapshot`**: 실시간 시세 스냅샷 (1분마다 저장)
2. **`kis_etf_basic_info`**: ETF 기본 정보 (1일 1회 업데이트)
3. **`kis_etf_holdings`**: ETF 보유 종목 상세 (1일 1회 업데이트)
4. **`kis_price_history`**: 일별 가격 히스토리 (장 마감 후 저장)

### 주요 컬럼 데이터 타입:
- **가격 정보**: `INT` (원 단위)
- **거래량**: `BIGINT` (큰 숫자 대응)
- **비율**: `DECIMAL(10,2)` (소수점 2자리)
- **비중**: `DECIMAL(10,4)` (소수점 4자리)
- **종목 코드**: `VARCHAR(20)` (문자열)
- **타임스탬프**: `TIMESTAMP` (날짜+시각)

이 구조를 사용하면 KIS API 응답을 효율적으로 관계형 데이터베이스에 저장하고 조회할 수 있습니다! 🚀


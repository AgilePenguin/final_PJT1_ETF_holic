// ETF 데이터 관련 유틸리티 함수들

/**
 * ETF 히스토리 데이터를 가져오는 함수
 * @param {string} ticker - ETF 티커 (예: "VOO")
 * @param {string} period - 기간 (예: "1y", "6mo", "3mo", "1mo")
 * @returns {Promise<Array>} 히스토리 데이터 배열
 */
export const fetchEtfHistory = async (ticker, period = '1y') => {
  try {
    const response = await fetch(`/api/etf/history?ticker=${ticker}&period=${period}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    // 에러 응답인 경우
    if (data.error) {
      throw new Error(data.error)
    }
    
    return data
  } catch (error) {
    console.error(`Failed to fetch ETF history for ${ticker}:`, error)
    throw error
  }
}

/**
 * 여러 ETF의 히스토리 데이터를 병합하는 함수
 * @param {Array} tickers - ETF 티커 배열
 * @param {string} period - 기간
 * @returns {Promise<Array>} 병합된 데이터 배열
 */
export const fetchMultipleEtfHistory = async (tickers, period = '1y') => {
  try {
    const promises = tickers.map(ticker => fetchEtfHistory(ticker, period))
    const results = await Promise.all(promises)
    
    // 날짜별로 데이터 병합
    const mergedData = {}
    
    results.forEach((history, index) => {
      const ticker = tickers[index]
      history.forEach(item => {
        const date = item.date
        if (!mergedData[date]) {
          mergedData[date] = { date }
        }
        mergedData[date][ticker] = item.close
        mergedData[date][`${ticker}_volume`] = item.volume
      })
    })
    
    // 배열로 변환하고 날짜순 정렬
    return Object.values(mergedData).sort((a, b) => new Date(a.date) - new Date(b.date))
  } catch (error) {
    console.error('Failed to fetch multiple ETF history:', error)
    throw error
  }
}

/**
 * ETF 실시간 데이터를 가져오는 함수
 * @param {string} ticker - ETF 티커
 * @returns {Promise<Object>} 실시간 데이터
 */
export const fetchEtfData = async (ticker) => {
  try {
    const response = await fetch('/api/etf/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.error) {
      throw new Error(data.error)
    }
    
    return data
  } catch (error) {
    console.error(`Failed to fetch ETF data for ${ticker}:`, error)
    throw error
  }
}

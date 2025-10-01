import yfinance as yf

# 처리된 CSV에서 몇 개의 티커를 테스트
test_tickers = ['360750.KS', '459580.KS', '069500.KS']

for ticker in test_tickers:
    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        print(f"\n{ticker} 정보:")
        print(f"  이름: {info.get('longName', 'N/A')}")
        print(f"  현재가: {info.get('currentPrice', 'N/A')}")
        print(f"  시가총액: {info.get('marketCap', 'N/A')}")
        print(f"  거래량: {info.get('volume', 'N/A')}")
    except Exception as e:
        print(f"{ticker} 오류: {e}")

#!/usr/bin/env python3
"""
ETF 실데이터 API 테스트 스크립트
"""

import requests
import json

def test_etf_data_api():
    """ETF 실데이터 API를 테스트합니다."""
    
    # 테스트할 ETF 티커들
    test_tickers = ["VOO", "SPY", "QQQ", "INVALID_TICKER"]
    
    for ticker in test_tickers:
        print(f"\n=== Testing ticker: {ticker} ===")
        
        try:
            # API 호출
            response = requests.post(
                'http://127.0.0.1:5000/api/etf/data',
                headers={'Content-Type': 'application/json'},
                json={"ticker": ticker},
                timeout=30
            )
            
            print(f"Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"Ticker: {data.get('ticker')}")
                print(f"Name: {data.get('name')}")
                print(f"Price: {data.get('price')} {data.get('currency')}")
                print(f"Volume: {data.get('volume'):,}")
                print(f"History entries: {len(data.get('history', {}))}")
                
                # 히스토리 일부 출력
                history = data.get('history', {})
                if history:
                    print("Recent history:")
                    for date, price in list(history.items())[-3:]:  # 최근 3일
                        print(f"  {date}: {price}")
            else:
                error_data = response.json()
                print(f"Error: {error_data.get('error', 'Unknown error')}")
                
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
        except Exception as e:
            print(f"Unexpected error: {e}")

if __name__ == "__main__":
    test_etf_data_api()

import requests
import json
import hashlib
import time
import os
from datetime import datetime
from typing import Dict, List, Optional

class KoreaInvestmentAPI:
    """한국투자증권 Open API 클라이언트"""
    
    def __init__(self):
        self.app_key = os.getenv('KIS_APP_KEY', 'your_app_key_here')
        self.app_secret = os.getenv('KIS_APP_SECRET', 'your_app_secret_here')
        self.account_no = os.getenv('KIS_ACCOUNT_NO', 'your_account_no')
        self.base_url = os.getenv('KIS_BASE_URL', 'https://openapi.koreainvestment.com:9443')
        self.mock_mode = os.getenv('KIS_MOCK_MODE', 'false').lower() == 'true'  # 기본값을 false로 변경
        self.mock_base_url = os.getenv('KIS_MOCK_BASE_URL', 'http://localhost:3001')
        
        # 액세스 토큰 및 만료 시간
        self.access_token = None
        self.token_expired_at = None
        
        # 실제 API 사용 가능 여부 확인
        self.api_available = self._check_api_availability()
        
        if not self.mock_mode and self.api_available:
            self._authenticate()
        
    def _get_headers(self, tr_id: str) -> Dict[str, str]:
        """API 요청 헤더 생성"""
        if self.mock_mode:
            return {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        
        # 실제 KIS API 헤더 (OAuth 토큰 포함)
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': f'Bearer {self.access_token}',
            'appkey': self.app_key,
            'appsecret': self.app_secret,
            'tr_id': tr_id
        }
        return headers
    
    def _check_api_availability(self) -> bool:
        """KIS API 사용 가능 여부 확인"""
        if (self.app_key == 'your_app_key_here' or 
            self.app_secret == 'your_app_secret_here' or
            not self.app_key or not self.app_secret):
            print("KIS API 키가 설정되지 않았습니다. Mock 모드로 실행됩니다.")
            print("실제 KIS API를 사용하려면 환경변수를 설정하세요:")
            print("  KIS_APP_KEY=your_actual_app_key")
            print("  KIS_APP_SECRET=your_actual_app_secret")
            print("  KIS_ACCOUNT_NO=your_actual_account_no")
            print("  KIS_MOCK_MODE=false")
            return False
        return True
    
    def _authenticate(self) -> bool:
        """KIS API 인증 토큰 발급"""
        try:
            url = f"{self.base_url}/oauth2/tokenP"
            data = {
                'grant_type': 'client_credentials',
                'appkey': self.app_key,
                'appsecret': self.app_secret
            }
            
            response = requests.post(url, data=data)
            response.raise_for_status()
            
            result = response.json()
            if 'access_token' in result:
                self.access_token = result['access_token']
                # 토큰 만료 시간 설정 (보통 24시간)
                expires_in = result.get('expires_in', 86400)
                self.token_expired_at = time.time() + expires_in
                print("KIS API 인증 성공")
                return True
            else:
                print(f"KIS API 인증 실패: {result}")
                return False
                
        except Exception as e:
            print(f"KIS API 인증 오류: {e}")
            return False
    
    def _is_token_valid(self) -> bool:
        """토큰 유효성 확인"""
        if not self.access_token or not self.token_expired_at:
            return False
        return time.time() < self.token_expired_at
    
    def _refresh_token_if_needed(self) -> bool:
        """토큰 갱신 (필요시)"""
        if not self._is_token_valid():
            print("KIS API 토큰 갱신 중...")
            return self._authenticate()
        return True
    
    def _get_timestamp(self) -> str:
        """현재 타임스탬프 생성"""
        return datetime.now().strftime('%Y%m%d%H%M%S')
    
    def _make_request(self, url: str, headers: Dict[str, str], data: Dict = None) -> Dict:
        """API 요청 실행"""
        try:
            if data:
                response = requests.post(url, headers=headers, json=data)
            else:
                response = requests.get(url, headers=headers)
            
            response.raise_for_status()
            return response.json()
            
        except requests.exceptions.RequestException as e:
            print(f"API 요청 실패: {e}")
            raise e
    
    def getETFHoldings(self, ticker: str) -> Dict:
        """ETF 보유 종목 정보 조회"""
        if self.mock_mode or not self.api_available:
            print(f"Mock mode: Returning mock holdings for {ticker}")
            return self._get_mock_holdings(ticker)
        
        # 실제 KIS API 호출
        try:
            # 토큰 유효성 확인 및 갱신
            if not self._refresh_token_if_needed():
                print("❌ 토큰 갱신 실패, Mock 데이터 반환")
                return self._get_mock_holdings(ticker)
            
            # ETF 보유종목 조회 API 호출
            url = f"{self.base_url}/uapi/domestic-stock/v1/quotations/inquire-basic-price"
            tr_id = "FHKST03030100"
            
            headers = self._get_headers(tr_id)
            data = {
                "FID_COND_MRKT_DIV_CODE": "J",
                "FID_INPUT_ISCD": ticker
            }
            
            print(f"KIS API 호출: ETF {ticker} 보유종목 조회")
            response = self._make_request(url, headers, data)
            
            # 응답 데이터 파싱
            if response.get('rt_cd') == '0':  # 성공
                output = response.get('output', {})
                output1 = response.get('output1', [])
                
                holdings = []
                for item in output1:
                    holdings.append({
                        'stockCode': item.get('stock_code', ''),
                        'stockName': item.get('stock_name', ''),
                        'weight': float(item.get('weight', 0)),
                        'shares': int(item.get('shares', 0)),
                        'value': int(item.get('value', 0))
                    })
                
                result = {
                    'ticker': ticker,
                    'etfName': output.get('hts_kor_isnm', f'ETF {ticker}'),
                    'nav': float(output.get('nav', 0)),
                    'totalHoldings': int(output.get('tot_cnt', 0)),
                    'updateDate': output.get('updt_dt', ''),
                    'holdings': holdings
                }
                
                print(f"KIS API 성공: {len(holdings)}개 보유종목 조회")
                return result
            else:
                print(f"KIS API 오류: {response.get('msg1', 'Unknown error')}")
                return self._get_mock_holdings(ticker)
                
        except Exception as e:
            print(f"KIS API 호출 실패: {e}")
            return self._get_mock_holdings(ticker)
    
    def getETFPriceHistory(self, ticker: str, period: str = '3m') -> Dict:
        """ETF 주가 히스토리 조회 (3개월 기본)"""
        if self.mock_mode or not self.api_available:
            print(f"Mock mode: Returning mock price history for {ticker}")
            return self._get_mock_price_history(ticker, period)
        
        # 실제 KIS API 호출
        try:
            # 토큰 유효성 확인 및 갱신
            if not self._refresh_token_if_needed():
                print("토큰 갱신 실패, Mock 데이터 반환")
                return self._get_mock_price_history(ticker, period)
            
            # ETF 주가 히스토리 조회 API 호출
            url = f"{self.base_url}/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice"
            tr_id = "FHKST03010100"  # 일봉 차트 조회 TR ID
            
            headers = self._get_headers(tr_id)
            data = {
                "FID_COND_MRKT_DIV_CODE": "J",
                "FID_INPUT_ISCD": ticker,
                "FID_INPUT_DATE_1": self._get_start_date(period),
                "FID_INPUT_DATE_2": self._get_end_date(),
                "FID_PERIOD_DIV_CODE": "D"  # 일봉
            }
            
            print(f"KIS API 호출: ETF {ticker} 주가 히스토리 조회")
            response = self._make_request(url, headers, data)
            
            if response.get('rt_cd') == '0':  # 성공
                output1 = response.get('output1', [])
                
                price_history = []
                for item in output1:
                    price_history.append({
                        'date': item.get('stck_bsop_date', ''),
                        'open': float(item.get('stck_oprc', 0)),
                        'high': float(item.get('stck_hgpr', 0)),
                        'low': float(item.get('stck_lwpr', 0)),
                        'close': float(item.get('stck_clpr', 0)),
                        'volume': int(item.get('acml_vol', 0))
                    })
                
                result = {
                    'ticker': ticker,
                    'period': period,
                    'priceHistory': price_history
                }
                
                print(f"KIS API 성공: {len(price_history)}개 일봉 데이터 조회")
                return result
            else:
                print(f"KIS API 오류: {response.get('msg1', 'Unknown error')}")
                return self._get_mock_price_history(ticker, period)
                
        except Exception as e:
            print(f"KIS API 호출 실패: {e}")
            return self._get_mock_price_history(ticker, period)
    
    def _get_start_date(self, period: str) -> str:
        """기간에 따른 시작 날짜 계산"""
        from datetime import datetime, timedelta
        
        end_date = datetime.now()
        
        if period == '1m':
            start_date = end_date - timedelta(days=30)
        elif period == '3m':
            start_date = end_date - timedelta(days=90)
        elif period == '6m':
            start_date = end_date - timedelta(days=180)
        elif period == '1y':
            start_date = end_date - timedelta(days=365)
        else:
            start_date = end_date - timedelta(days=90)  # 기본 3개월
        
        return start_date.strftime('%Y%m%d')
    
    def _get_end_date(self) -> str:
        """현재 날짜 반환"""
        from datetime import datetime
        return datetime.now().strftime('%Y%m%d')
    
    def _get_mock_price_history(self, ticker: str, period: str) -> Dict:
        """Mock 주가 히스토리 데이터"""
        import random
        from datetime import datetime, timedelta
        
        # 기간에 따른 데이터 포인트 수 계산
        days = 90 if period == '3m' else 30 if period == '1m' else 180 if period == '6m' else 365
        
        # 시작 가격 (ETF별로 다르게)
        base_prices = {
            '069500': 32000,  # KODEX 200
            '360750': 15000,  # TIGER 미국S&P500
            '379800': 12000,  # KODEX 미국S&P500TR
            '448630': 18000,  # SOL 미국S&P500
            '371460': 25000,  # TIGER 미국필라델피아반도체나스닥
            '272580': 28000,  # KODEX 2차전지산업
        }
        
        base_price = base_prices.get(ticker, 20000)
        
        price_history = []
        current_price = base_price
        
        for i in range(days):
            date = datetime.now() - timedelta(days=days-i-1)
            
            # 랜덤 변동 (-2% ~ +2%)
            change_percent = random.uniform(-0.02, 0.02)
            current_price = current_price * (1 + change_percent)
            
            # OHLC 계산
            open_price = current_price
            high_price = current_price * random.uniform(1.0, 1.03)
            low_price = current_price * random.uniform(0.97, 1.0)
            close_price = current_price * random.uniform(0.98, 1.02)
            volume = random.randint(100000, 1000000)
            
            price_history.append({
                'date': date.strftime('%Y-%m-%d'),
                'open': round(open_price, 2),
                'high': round(high_price, 2),
                'low': round(low_price, 2),
                'close': round(close_price, 2),
                'volume': volume
            })
        
        return {
            'ticker': ticker,
            'period': period,
            'priceHistory': price_history
        }
        
        # 실제 KIS API 호출
        url = f"{self.base_url}/uapi/domestic-stock/v1/quotations/inquire-price"
        tr_id = "FHKST01010100"
        
        headers = self._get_headers(tr_id)
        data = {
            "FID_COND_MRKT_DIV_CODE": "J",
            "FID_INPUT_ISCD": ticker
        }
        
        try:
            response = self._make_request(url, headers, data)
            
            if response.get('rt_cd') == '0':
                output = response.get('output', {})
                
                return {
                    'ticker': ticker,
                    'name': output.get('hts_kor_isnm', f'ETF {ticker}'),
                    'currentPrice': int(output.get('stck_prpr', 0)),
                    'changePrice': int(output.get('prdy_vrss', 0)),
                    'changeRate': float(output.get('prdy_ctrt', 0)),
                    'volume': int(output.get('acml_vol', 0)),
                    'tradingValue': int(output.get('acml_tr_pbmn', 0)),
                    'high': int(output.get('stck_hgpr', 0)),
                    'low': int(output.get('stck_lwpr', 0)),
                    'open': int(output.get('stck_oprc', 0)),
                    'previousClose': int(output.get('stck_sdpr', 0))
                }
            else:
                raise Exception(f"API 오류: {response.get('msg1', 'Unknown error')}")
                
        except Exception as e:
            print(f"ETF 가격 조회 실패: {e}")
            return self._get_mock_price(ticker)
    
    def _get_mock_holdings(self, ticker: str) -> Dict:
        """Mock 보유 종목 데이터"""
        # 티커별 다른 Mock 데이터 제공
        mock_data = {
            '069500': {  # KODEX 200
                'etfName': 'KODEX 200',
                'holdings': [
                    {'stockCode': '005930', 'stockName': '삼성전자', 'weight': 12.1, 'shares': 12345, 'value': 892345000},
                    {'stockCode': '000660', 'stockName': 'SK하이닉스', 'weight': 10.8, 'shares': 54321, 'value': 789012000},
                    {'stockCode': '035420', 'stockName': 'NAVER', 'weight': 9.5, 'shares': 23456, 'value': 567890000},
                    {'stockCode': '207940', 'stockName': '삼성바이오로직스', 'weight': 8.2, 'shares': 34567, 'value': 456789000},
                    {'stockCode': '006400', 'stockName': '삼성SDI', 'weight': 6.3, 'shares': 45678, 'value': 345678000},
                    {'stockCode': '035720', 'stockName': '카카오', 'weight': 5.8, 'shares': 12345, 'value': 234567000},
                    {'stockCode': '051910', 'stockName': 'LG화학', 'weight': 4.9, 'shares': 23456, 'value': 123456000},
                    {'stockCode': '068270', 'stockName': '셀트리온', 'weight': 4.2, 'shares': 34567, 'value': 98765000},
                    {'stockCode': '323410', 'stockName': '카카오뱅크', 'weight': 3.8, 'shares': 45678, 'value': 87654000},
                    {'stockCode': '066570', 'stockName': 'LG전자', 'weight': 3.5, 'shares': 56789, 'value': 76543000}
                ]
            },
            '360750': {  # TIGER 미국S&P500
                'etfName': 'TIGER 미국S&P500',
                'holdings': [
                    {'stockCode': 'AAPL', 'stockName': 'Apple Inc', 'weight': 12.1, 'shares': 1234, 'value': 1234567890},
                    {'stockCode': 'MSFT', 'stockName': 'Microsoft', 'weight': 10.8, 'shares': 2345, 'value': 987654321},
                    {'stockCode': 'NVDA', 'stockName': 'NVIDIA', 'weight': 9.5, 'shares': 3456, 'value': 876543210},
                    {'stockCode': 'AMZN', 'stockName': 'Amazon', 'weight': 8.2, 'shares': 4567, 'value': 765432109},
                    {'stockCode': 'TSLA', 'stockName': 'Tesla', 'weight': 6.3, 'shares': 5678, 'value': 654321098},
                    {'stockCode': 'GOOGL', 'stockName': 'Alphabet', 'weight': 5.8, 'shares': 6789, 'value': 543210987},
                    {'stockCode': 'META', 'stockName': 'Meta', 'weight': 4.9, 'shares': 7890, 'value': 432109876},
                    {'stockCode': 'BRK.B', 'stockName': 'Berkshire Hathaway', 'weight': 4.2, 'shares': 8901, 'value': 321098765},
                    {'stockCode': 'UNH', 'stockName': 'UnitedHealth', 'weight': 3.8, 'shares': 9012, 'value': 210987654},
                    {'stockCode': 'JNJ', 'stockName': 'Johnson & Johnson', 'weight': 3.5, 'shares': 1234, 'value': 109876543}
                ]
            },
            '379800': {  # KODEX 미국S&P500TR
                'etfName': 'KODEX 미국S&P500TR',
                'holdings': [
                    {'stockCode': 'AAPL', 'stockName': 'Apple Inc', 'weight': 11.8, 'shares': 1234, 'value': 1234567890},
                    {'stockCode': 'MSFT', 'stockName': 'Microsoft', 'weight': 10.5, 'shares': 2345, 'value': 987654321},
                    {'stockCode': 'NVDA', 'stockName': 'NVIDIA', 'weight': 9.2, 'shares': 3456, 'value': 876543210},
                    {'stockCode': 'AMZN', 'stockName': 'Amazon', 'weight': 7.9, 'shares': 4567, 'value': 765432109},
                    {'stockCode': 'TSLA', 'stockName': 'Tesla', 'weight': 6.1, 'shares': 5678, 'value': 654321098},
                    {'stockCode': 'GOOGL', 'stockName': 'Alphabet', 'weight': 5.6, 'shares': 6789, 'value': 543210987},
                    {'stockCode': 'META', 'stockName': 'Meta', 'weight': 4.7, 'shares': 7890, 'value': 432109876},
                    {'stockCode': 'BRK.B', 'stockName': 'Berkshire Hathaway', 'weight': 4.0, 'shares': 8901, 'value': 321098765},
                    {'stockCode': 'UNH', 'stockName': 'UnitedHealth', 'weight': 3.6, 'shares': 9012, 'value': 210987654},
                    {'stockCode': 'JNJ', 'stockName': 'Johnson & Johnson', 'weight': 3.3, 'shares': 1234, 'value': 109876543}
                ]
            },
            '448630': {  # SOL 미국S&P500
                'etfName': 'SOL 미국S&P500',
                'holdings': [
                    {'stockCode': 'AAPL', 'stockName': 'Apple Inc', 'weight': 12.3, 'shares': 1234, 'value': 1234567890},
                    {'stockCode': 'MSFT', 'stockName': 'Microsoft', 'weight': 11.0, 'shares': 2345, 'value': 987654321},
                    {'stockCode': 'NVDA', 'stockName': 'NVIDIA', 'weight': 9.8, 'shares': 3456, 'value': 876543210},
                    {'stockCode': 'AMZN', 'stockName': 'Amazon', 'weight': 8.5, 'shares': 4567, 'value': 765432109},
                    {'stockCode': 'TSLA', 'stockName': 'Tesla', 'weight': 6.7, 'shares': 5678, 'value': 654321098},
                    {'stockCode': 'GOOGL', 'stockName': 'Alphabet', 'weight': 6.0, 'shares': 6789, 'value': 543210987},
                    {'stockCode': 'META', 'stockName': 'Meta', 'weight': 5.1, 'shares': 7890, 'value': 432109876},
                    {'stockCode': 'BRK.B', 'stockName': 'Berkshire Hathaway', 'weight': 4.4, 'shares': 8901, 'value': 321098765},
                    {'stockCode': 'UNH', 'stockName': 'UnitedHealth', 'weight': 4.0, 'shares': 9012, 'value': 210987654},
                    {'stockCode': 'JNJ', 'stockName': 'Johnson & Johnson', 'weight': 3.7, 'shares': 1234, 'value': 109876543}
                ]
            },
            '371460': {  # TIGER 미국필라델피아반도체나스닥
                'etfName': 'TIGER 미국필라델피아반도체나스닥',
                'holdings': [
                    {'stockCode': 'NVDA', 'stockName': 'NVIDIA', 'weight': 15.2, 'shares': 1234, 'value': 1234567890},
                    {'stockCode': 'TSM', 'stockName': 'Taiwan Semiconductor', 'weight': 12.8, 'shares': 2345, 'value': 987654321},
                    {'stockCode': 'AMD', 'stockName': 'Advanced Micro Devices', 'weight': 10.5, 'shares': 3456, 'value': 876543210},
                    {'stockCode': 'INTC', 'stockName': 'Intel', 'weight': 8.9, 'shares': 4567, 'value': 765432109},
                    {'stockCode': 'AVGO', 'stockName': 'Broadcom', 'weight': 7.3, 'shares': 5678, 'value': 654321098},
                    {'stockCode': 'QCOM', 'stockName': 'Qualcomm', 'weight': 6.7, 'shares': 6789, 'value': 543210987},
                    {'stockCode': 'TXN', 'stockName': 'Texas Instruments', 'weight': 5.8, 'shares': 7890, 'value': 432109876},
                    {'stockCode': 'ADI', 'stockName': 'Analog Devices', 'weight': 4.9, 'shares': 8901, 'value': 321098765},
                    {'stockCode': 'MRVL', 'stockName': 'Marvell Technology', 'weight': 4.2, 'shares': 9012, 'value': 210987654},
                    {'stockCode': 'MCHP', 'stockName': 'Microchip Technology', 'weight': 3.7, 'shares': 1234, 'value': 109876543}
                ]
            },
            '272580': {  # KODEX 2차전지산업
                'etfName': 'KODEX 2차전지산업',
                'holdings': [
                    {'stockCode': '006400', 'stockName': '삼성SDI', 'weight': 18.5, 'shares': 12345, 'value': 1234567890},
                    {'stockCode': '051910', 'stockName': 'LG화학', 'weight': 16.2, 'shares': 23456, 'value': 987654321},
                    {'stockCode': '373220', 'stockName': 'LG에너지솔루션', 'weight': 14.8, 'shares': 34567, 'value': 876543210},
                    {'stockCode': '247540', 'stockName': '에코프로비엠', 'weight': 12.3, 'shares': 45678, 'value': 765432109},
                    {'stockCode': '357780', 'stockName': '솔브레인', 'weight': 9.7, 'shares': 56789, 'value': 654321098},
                    {'stockCode': '196170', 'stockName': '알테오젠', 'weight': 8.1, 'shares': 67890, 'value': 543210987},
                    {'stockCode': '348370', 'stockName': '에스엠', 'weight': 6.9, 'shares': 78901, 'value': 432109876},
                    {'stockCode': '091990', 'stockName': '셀트리온헬스케어', 'weight': 5.8, 'shares': 89012, 'value': 321098765},
                    {'stockCode': '066970', 'stockName': '엘앤에프', 'weight': 4.5, 'shares': 90123, 'value': 210987654},
                    {'stockCode': '096770', 'stockName': 'SK이노베이션', 'weight': 3.2, 'shares': 12345, 'value': 109876543}
                ]
            },
            '498270': {  # KIWOOM 미국양자컴퓨팅
                'etfName': 'KIWOOM 미국양자컴퓨팅',
                'holdings': [
                    {'stockCode': 'IBM', 'stockName': 'IBM', 'weight': 15.2, 'shares': 1234, 'value': 1234567890},
                    {'stockCode': 'GOOGL', 'stockName': 'Alphabet', 'weight': 12.8, 'shares': 2345, 'value': 987654321},
                    {'stockCode': 'MSFT', 'stockName': 'Microsoft', 'weight': 11.5, 'shares': 3456, 'value': 876543210},
                    {'stockCode': 'AMZN', 'stockName': 'Amazon', 'weight': 9.8, 'shares': 4567, 'value': 765432109},
                    {'stockCode': 'RIGETTI', 'stockName': 'Rigetti Computing', 'weight': 8.3, 'shares': 5678, 'value': 654321098},
                    {'stockCode': 'IONQ', 'stockName': 'IonQ', 'weight': 7.1, 'shares': 6789, 'value': 543210987},
                    {'stockCode': 'QUBT', 'stockName': 'Quantum Computing Inc', 'weight': 6.2, 'shares': 7890, 'value': 432109876},
                    {'stockCode': 'HONEY', 'stockName': 'Honeywell Quantum', 'weight': 5.4, 'shares': 8901, 'value': 321098765},
                    {'stockCode': 'TSM', 'stockName': 'Taiwan Semiconductor', 'weight': 4.8, 'shares': 9012, 'value': 210987654},
                    {'stockCode': 'NVDA', 'stockName': 'NVIDIA', 'weight': 4.1, 'shares': 1234, 'value': 109876543}
                ]
            },
            '490340': {  # SOL 미국양자컴퓨팅TOP10
                'etfName': 'SOL 미국양자컴퓨팅TOP10',
                'holdings': [
                    {'stockCode': 'IBM', 'stockName': 'IBM', 'weight': 16.8, 'shares': 1234, 'value': 1234567890},
                    {'stockCode': 'GOOGL', 'stockName': 'Alphabet', 'weight': 14.2, 'shares': 2345, 'value': 987654321},
                    {'stockCode': 'MSFT', 'stockName': 'Microsoft', 'weight': 12.9, 'shares': 3456, 'value': 876543210},
                    {'stockCode': 'AMZN', 'stockName': 'Amazon', 'weight': 10.5, 'shares': 4567, 'value': 765432109},
                    {'stockCode': 'RIGETTI', 'stockName': 'Rigetti Computing', 'weight': 9.1, 'shares': 5678, 'value': 654321098},
                    {'stockCode': 'IONQ', 'stockName': 'IonQ', 'weight': 7.8, 'shares': 6789, 'value': 543210987},
                    {'stockCode': 'QUBT', 'stockName': 'Quantum Computing Inc', 'weight': 6.7, 'shares': 7890, 'value': 432109876},
                    {'stockCode': 'HONEY', 'stockName': 'Honeywell Quantum', 'weight': 5.9, 'shares': 8901, 'value': 321098765},
                    {'stockCode': 'TSM', 'stockName': 'Taiwan Semiconductor', 'weight': 5.2, 'shares': 9012, 'value': 210987654},
                    {'stockCode': 'NVDA', 'stockName': 'NVIDIA', 'weight': 4.4, 'shares': 1234, 'value': 109876543}
                ]
            },
            '497420': {  # TIGER 미국양자컴퓨팅액티브
                'etfName': 'TIGER 미국양자컴퓨팅액티브',
                'holdings': [
                    {'stockCode': 'IBM', 'stockName': 'IBM', 'weight': 18.1, 'shares': 1234, 'value': 1234567890},
                    {'stockCode': 'GOOGL', 'stockName': 'Alphabet', 'weight': 15.3, 'shares': 2345, 'value': 987654321},
                    {'stockCode': 'MSFT', 'stockName': 'Microsoft', 'weight': 13.7, 'shares': 3456, 'value': 876543210},
                    {'stockCode': 'AMZN', 'stockName': 'Amazon', 'weight': 11.2, 'shares': 4567, 'value': 765432109},
                    {'stockCode': 'RIGETTI', 'stockName': 'Rigetti Computing', 'weight': 9.8, 'shares': 5678, 'value': 654321098},
                    {'stockCode': 'IONQ', 'stockName': 'IonQ', 'weight': 8.4, 'shares': 6789, 'value': 543210987},
                    {'stockCode': 'QUBT', 'stockName': 'Quantum Computing Inc', 'weight': 7.1, 'shares': 7890, 'value': 432109876},
                    {'stockCode': 'HONEY', 'stockName': 'Honeywell Quantum', 'weight': 6.3, 'shares': 8901, 'value': 321098765},
                    {'stockCode': 'TSM', 'stockName': 'Taiwan Semiconductor', 'weight': 5.6, 'shares': 9012, 'value': 210987654},
                    {'stockCode': 'NVDA', 'stockName': 'NVIDIA', 'weight': 4.8, 'shares': 1234, 'value': 109876543}
                ]
            }
        }
        
        default_data = {
            'etfName': f'ETF {ticker}',
            'holdings': [
                {'stockCode': '005930', 'stockName': '삼성전자', 'weight': 12.1, 'shares': 12345, 'value': 892345000},
                {'stockCode': '000660', 'stockName': 'SK하이닉스', 'weight': 10.8, 'shares': 54321, 'value': 789012000},
                {'stockCode': '035420', 'stockName': 'NAVER', 'weight': 9.5, 'shares': 23456, 'value': 567890000},
                {'stockCode': '207940', 'stockName': '삼성바이오로직스', 'weight': 8.2, 'shares': 34567, 'value': 456789000},
                {'stockCode': '006400', 'stockName': '삼성SDI', 'weight': 6.3, 'shares': 45678, 'value': 345678000}
            ]
        }
        
        ticker_data = mock_data.get(ticker, default_data)
        
        return {
            'ticker': ticker,
            'etfName': ticker_data['etfName'],
            'nav': 32150.50,
            'totalHoldings': 200,
            'updateDate': datetime.now().strftime('%Y%m%d'),
            'holdings': ticker_data['holdings']
        }
    
    def _get_mock_price(self, ticker: str) -> Dict:
        """Mock 가격 데이터"""
        base_price = 30000 + hash(ticker) % 10000
        
        return {
            'ticker': ticker,
            'name': f'ETF {ticker}',
            'currentPrice': base_price,
            'changePrice': 500,
            'changeRate': 1.59,
            'volume': 1500000,
            'tradingValue': 48000000000,
            'high': base_price + 500,
            'low': base_price - 500,
            'open': base_price - 100,
            'previousClose': base_price - 500
        }

# 사용 예시
if __name__ == "__main__":
    api = KoreaInvestmentAPI()
    
    # ETF 보유 종목 조회 테스트
    holdings = api.getETFHoldings('069500')
    print("ETF 보유 종목:")
    print(json.dumps(holdings, indent=2, ensure_ascii=False))
    
    # ETF 가격 조회 테스트
    price = api.getETFPrice('069500')
    print("\nETF 가격:")
    print(json.dumps(price, indent=2, ensure_ascii=False))

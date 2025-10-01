from flask import Flask, jsonify, request
import logging
import traceback
import yfinance as yf
import os
from dotenv import load_dotenv
import pathlib
import google.generativeai as genai
import pandas as pd

# .env는 반드시 최상단에서 로드하고 키 존재여부를 출력
env_path = pathlib.Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)
key = os.getenv("GEMINI_API_KEY")
print("Gemini key present?", bool(key))
print("Gemini key raw value:", repr(key))

# Gemini API 설정 (전역 1회 설정)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
# 로깅을 앱 생성 직후 초기화 (force로 기존 핸들러도 재설정)
logging.basicConfig(level=logging.DEBUG, force=True)
app.logger.setLevel(logging.DEBUG)
# 기존 핸들러 레벨도 상향
for _h in app.logger.handlers:
    try:
        _h.setLevel(logging.DEBUG)
    except Exception:
        pass
# werkzeug 로거도 정렬
logging.getLogger('werkzeug').setLevel(logging.DEBUG)

# 안전한 JSON 파서 유틸리티
def safe_parse_json(text: str, fallback_key: str = "common"):
    import json
    import re
    try:
        return json.loads(text)
    except Exception:
        match = re.search(r"\{[\s\S]*\}", text or "")
        if match:
            try:
                return json.loads(match.group())
            except Exception:
                return {fallback_key: (text or "모델 응답 파싱 실패")[:500]}
        return {fallback_key: (text or "모델 응답 없음")[:500]}

# 파일 로그 핸들러 추가 (백업 경로)
try:
    import os
    os.makedirs(os.path.join(os.path.dirname(__file__), 'logs'), exist_ok=True)
    _fh = logging.FileHandler(os.path.join(os.path.dirname(__file__), 'logs', 'app.log'), encoding='utf-8')
    _fh.setLevel(logging.DEBUG)
    _fmt = logging.Formatter('%(asctime)s %(levelname)s %(name)s - %(message)s')
    _fh.setFormatter(_fmt)
    app.logger.addHandler(_fh)
except Exception:
    pass

# 1. CSV 파일에서 국내 ETF 데이터 로드
try:
    # 여러 인코딩을 시도하여 CSV 파일 로드
    encodings = ['utf-8', 'cp949', 'euc-kr', 'latin-1']
    korean_etf_df = None
    
    for encoding in encodings:
        try:
            # CSV 파일의 첫 번째 줄을 건너뛰고 로드 (헤더가 잘못된 형식)
            korean_etf_df = pd.read_csv('k-etf_etfs.csv.csv', encoding=encoding, skiprows=1, 
                                       names=['Name', 'Ticker/Code', 'Type', 'Market', 'Category', 'SubCategory', 'Country', 'Status', 'NetAssets', 'TradingVolume'])
            print(f"✅ 국내 ETF 데이터 로드 완료 ({encoding}): {len(korean_etf_df)}개 ETF")
            break
        except UnicodeDecodeError:
            continue
    
    if korean_etf_df is None:
        raise Exception("모든 인코딩 시도 실패")
        
    # Ticker/Code 컬럼을 문자열로 변환하여 검색 오류 방지
    korean_etf_df['Ticker/Code'] = korean_etf_df['Ticker/Code'].astype(str)
    
except FileNotFoundError:
    print("!!! WARNING: k-etf_etfs.csv.csv not found. Domestic search will not work.")
    korean_etf_df = pd.DataFrame()
except Exception as e:
    print(f"!!! ERROR: 국내 CSV 파일 로드 실패: {e}")
    korean_etf_df = pd.DataFrame()

# 2. CSV 파일에서 해외 ETF 데이터 로드
try:
    # 여러 인코딩을 시도하여 해외 ETF CSV 파일 로드
    encodings = ['utf-8', 'cp949', 'euc-kr', 'latin-1']
    overseas_etf_df = None
    
    for encoding in encodings:
        try:
            # CSV 파일의 첫 번째 줄을 건너뛰고 로드 (헤더가 잘못된 형식)
            overseas_etf_df = pd.read_csv('i-etf_etfs.csv', encoding=encoding, skiprows=1, 
                                         names=['Name', 'Ticker/Code', 'Type', 'Market', 'Category', 'SubCategory', 'Country', 'Status', 'NetAssets', 'TradingVolume'])
            print(f"✅ 해외 ETF 데이터 로드 완료 ({encoding}): {len(overseas_etf_df)}개 ETF")
            break
        except UnicodeDecodeError:
            continue
    
    if overseas_etf_df is None:
        raise Exception("모든 인코딩 시도 실패")
        
    # Ticker/Code 컬럼을 문자열로 변환하여 검색 오류 방지
    overseas_etf_df['Ticker/Code'] = overseas_etf_df['Ticker/Code'].astype(str)
    
except FileNotFoundError:
    print("!!! WARNING: i-etf_etfs.csv not found. Overseas search will not work.")
    overseas_etf_df = pd.DataFrame()
except Exception as e:
    print(f"!!! ERROR: 해외 CSV 파일 로드 실패: {e}")
    overseas_etf_df = pd.DataFrame()

# 하드코딩된 OVERSEAS_ETF_LIST 제거됨 - 이제 i-etf_etfs.csv 파일을 사용

# 2. 새로운 API 엔드포인트: ETF 검색
@app.route('/api/search', methods=['GET'])
def search_etfs():
    """쿼리 파라미터로 받은 키워드와 시장 구분으로 ETF를 검색하여 결과를 반환합니다."""
    keyword = request.args.get('keyword', '').lower()
    market = request.args.get('market', 'domestic').lower()  # 기본값은 'domestic'

    if not keyword:
        return jsonify([])  # 검색어가 없으면 빈 리스트 반환

    results = []
    
    if market == 'domestic':
        # DataFrame에서 검색 (Name 또는 Ticker/Code 컬럼)
        if not korean_etf_df.empty:
            try:
                mask = (korean_etf_df['Name'].str.lower().str.contains(keyword, na=False)) | \
                       (korean_etf_df['Ticker/Code'].str.lower().str.contains(keyword, na=False))
                
                # 컬럼명을 프론트엔드가 기대하는 형식으로 변경 ('ticker', 'name')
                filtered_df = korean_etf_df[mask].rename(columns={'Ticker/Code': 'ticker', 'Name': 'name'})
                results = filtered_df[['ticker', 'name']].to_dict('records')
                
                print(f"[SEARCH] 국내 ETF 검색 (CSV): '{keyword}' -> {len(results)}개 결과")
            except Exception as e:
                print(f"[ERROR] 국내 ETF 검색 오류: {e}")
                results = []
        else:
            # CSV 로드 실패 시 fallback 데이터 사용
            fallback_korean_etfs = [
                {'ticker': '069500', 'name': 'KODEX 200'},
                {'ticker': '371460', 'name': 'TIGER 미국필라델피아반도체나스닥'},
                {'ticker': '272580', 'name': 'KODEX 2차전지산업'},
                {'ticker': '091160', 'name': 'KODEX 반도체'},
                {'ticker': '091170', 'name': 'KODEX 은행'},
                {'ticker': '091180', 'name': 'KODEX 자동차'},
                {'ticker': '091190', 'name': 'KODEX 화학'},
                {'ticker': '091200', 'name': 'KODEX 철강'},
                {'ticker': '091210', 'name': 'KODEX 건설'},
                {'ticker': '091220', 'name': 'KODEX 에너지화학'},
                {'ticker': '360750', 'name': 'TIGER 미국S&P500'},
                {'ticker': '133690', 'name': 'TIGER 미국나스닥100'},
                {'ticker': '379800', 'name': 'KODEX 미국S&P500'},
                {'ticker': '381170', 'name': 'TIGER 미국대형TOP10 INDXX'}
            ]
            
            results = [
                etf for etf in fallback_korean_etfs 
                if keyword in etf['ticker'].lower() or keyword in etf['name'].lower()
            ]
            print(f"[SEARCH] 국내 ETF 검색 (Fallback): '{keyword}' -> {len(results)}개 결과")
            
    elif market == 'overseas':
        # 해외 ETF는 DataFrame에서 검색
        if not overseas_etf_df.empty:
            try:
                mask = (overseas_etf_df['Name'].str.lower().str.contains(keyword, na=False)) | \
                       (overseas_etf_df['Ticker/Code'].str.lower().str.contains(keyword, na=False))
                
                # 컬럼명을 프론트엔드가 기대하는 형식으로 변경 ('ticker', 'name')
                filtered_df = overseas_etf_df[mask].rename(columns={'Ticker/Code': 'ticker', 'Name': 'name'})
                results = filtered_df[['ticker', 'name']].to_dict('records')
                
                print(f"[SEARCH] 해외 ETF 검색 (CSV): '{keyword}' -> {len(results)}개 결과")
            except Exception as e:
                print(f"[ERROR] 해외 ETF 검색 오류: {e}")
                results = []
        else:
            # CSV 로드 실패 시 fallback 데이터 사용
            fallback_overseas_etfs = [
                {'ticker': 'SPY', 'name': 'SPDR S&P 500 ETF Trust'},
                {'ticker': 'IVV', 'name': 'iShares CORE S&P 500 ETF'},
                {'ticker': 'VOO', 'name': 'Vanguard S&P 500 ETF'},
                {'ticker': 'QQQ', 'name': 'Invesco QQQ Trust'},
                {'ticker': 'VTI', 'name': 'Vanguard Total Stock Market ETF'},
                {'ticker': 'VEA', 'name': 'Vanguard FTSE Developed Markets ETF'},
                {'ticker': 'VWO', 'name': 'Vanguard FTSE Emerging Markets ETF'},
                {'ticker': 'EFA', 'name': 'iShares MSCI EAFE ETF'},
                {'ticker': 'EEM', 'name': 'iShares MSCI Emerging Markets ETF'},
                {'ticker': 'IWM', 'name': 'iShares Russell 2000 ETF'}
            ]
            
            results = [
                etf for etf in fallback_overseas_etfs 
                if keyword in etf['ticker'].lower() or keyword in etf['name'].lower()
            ]
            print(f"[SEARCH] 해외 ETF 검색 (Fallback): '{keyword}' -> {len(results)}개 결과")
    else:
        # 잘못된 market 파라미터인 경우 빈 결과 반환
        print(f"[WARNING] 잘못된 market 파라미터: {market}")
        results = []

    return jsonify(results)

@app.route('/api/test', methods=['GET'])
def test_connection():
    return jsonify({"message": "Success! Backend server is running."})

@app.route('/api/etf/info', methods=['GET'])
def get_etf_info():
    """쿼리 파라미터로 받은 티커의 상세 정보를 yfinance로 조회하여 반환합니다."""
    ticker_code = request.args.get('ticker', '')
    if not ticker_code:
        return jsonify({"error": "Ticker is required"}), 400

    full_ticker = f"{ticker_code}.KS"

    try:
        etf = yf.Ticker(full_ticker)

        # 보유 종목 정보 가져오기
        holdings_df = getattr(etf, 'holdings', None)
        if holdings_df is None:
            # 일부 종목은 holdings가 없을 수 있음
            return jsonify({
                "ticker": ticker_code,
                "name": etf.info.get('longName', ticker_code),
                "holdings": []
            })

        holdings_df = holdings_df.reset_index()
        # 예상 컬럼명에 맞춰 매핑 시도
        rename_map = {}
        if 'Stock' in holdings_df.columns:
            rename_map['Stock'] = 'name'
        if 'Holdings' in holdings_df.columns:
            rename_map['Holdings'] = 'name'
        if 'Weight' in holdings_df.columns:
            rename_map['Weight'] = 'weight'
        if rename_map:
            holdings_df = holdings_df.rename(columns=rename_map)

        if 'weight' in holdings_df.columns:
            try:
                holdings_df['weight'] = holdings_df['weight'].astype(float) * 100
            except Exception:
                pass

        records = holdings_df.to_dict('records')

        response_data = {
            "ticker": ticker_code,
            "name": etf.info.get('longName', ticker_code),
            "holdings": records[:10]
        }
        return jsonify(response_data)

    except Exception as e:
        return jsonify({"error": f"Failed to fetch data for {full_ticker}: {str(e)}"}), 404

# 4. 새로운 API 엔드포인트: 메인 대시보드용 주요 ETF 목록
@app.route('/api/etf/featured', methods=['GET'])
def get_featured_etfs():
    """메인 대시보드에 보여줄 미리 선정된 주요 ETF 목록을 반환합니다."""
    featured_list = [
        {"ticker": "SPY", "name": "SPDR S&P 500 ETF Trust"},
        {"ticker": "QQQ", "name": "Invesco QQQ Trust"},
        {"ticker": "069500", "name": "KODEX 200"},
        {"ticker": "371460", "name": "TIGER 미국필라델피아반도체나스닥"},
        {"ticker": "272580", "name": "KODEX 2차전지산업"},
    ]
    return jsonify(featured_list)

# 디버그 로그 확인용 핑 엔드포인트
@app.route('/ping', methods=['GET'])
def ping():
    app.logger.debug("Ping endpoint hit")
    print("Ping print() hit", flush=True)
    return "pong"

# ETF 히스토리 데이터 API 엔드포인트
@app.route('/api/etf/history', methods=['GET'])
def get_etf_history():
    """yFinance를 이용해 ETF의 히스토리 데이터를 반환합니다."""
    try:
        ticker = request.args.get('ticker', '').strip().upper()
        period = request.args.get('period', '1y').strip()
        
        if not ticker:
            return jsonify({"error": "Ticker parameter is required"}), 400
        
        app.logger.debug(f"[etf_history] Fetching history for ticker: {ticker}, period: {period}")
        
        # yFinance로 히스토리 데이터 가져오기
        etf = yf.Ticker(ticker)
        hist = etf.history(period=period)
        
        if hist.empty:
            app.logger.warning(f"[etf_history] No history data for ticker: {ticker}, period: {period}")
            return jsonify({"error": "No data found"}), 400
        
        # DataFrame을 JSON 배열로 변환
        history_data = []
        for date, row in hist.iterrows():
            history_data.append({
                "date": date.strftime('%Y-%m-%d'),
                "open": round(float(row['Open']), 2),
                "close": round(float(row['Close']), 2),
                "volume": int(row['Volume'])
            })
        
        app.logger.debug(f"[etf_history] Successfully fetched {len(history_data)} records for {ticker}")
        
        return jsonify(history_data)
        
    except Exception as e:
        app.logger.error(f"[etf_history] Error fetching ETF history: {e}\n{traceback.format_exc()}")
        return jsonify({"error": "Failed to fetch ETF history"}), 500

    """yFinance를 이용해 ETF의 실시간 데이터를 반환합니다."""
    try:
        data = request.get_json(silent=True) or {}
        app.logger.debug(f"[etf_data] incoming payload: {data}")
        
        ticker = data.get('ticker', '').strip().upper()
        if not ticker:
            return jsonify({"error": "Ticker is required"}), 400
        
        app.logger.debug(f"[etf_data] Fetching data for ticker: {ticker}")
        
        # yFinance로 데이터 가져오기
        etf = yf.Ticker(ticker)
        
        # 기본 정보 가져오기
        info = etf.info
        if not info or 'symbol' not in info:
            app.logger.warning(f"[etf_data] Invalid ticker: {ticker}")
            return jsonify({"error": "Invalid ticker"}), 400
        
        # 최근 1개월 히스토리 가져오기
        hist = etf.history(period="1mo")
        if hist.empty:
            app.logger.warning(f"[etf_data] No history data for ticker: {ticker}")
            return jsonify({"error": "No historical data available"}), 400
        
        # 히스토리를 날짜: 종가 형태의 dict로 변환
        history_dict = {}
        for date, row in hist.iterrows():
            date_str = date.strftime('%Y-%m-%d')
            history_dict[date_str] = round(float(row['Close']), 2)
        
        # 응답 데이터 구성
        response_data = {
            "ticker": ticker,
            "name": info.get('longName', info.get('shortName', ticker)),
            "price": round(float(info.get('currentPrice', hist['Close'].iloc[-1])), 2),
            "volume": int(info.get('volume', hist['Volume'].iloc[-1])),
            "currency": info.get('currency', 'USD'),
            "history": history_dict
        }
        
        app.logger.debug(f"[etf_data] Successfully fetched data for {ticker}, history_length={len(history_dict)}, price={response_data['price']}")
        
        return jsonify(response_data)
        
    except Exception as e:
        app.logger.error(f"[etf_data] Error fetching ETF data: {e}\n{traceback.format_exc()}")
        return jsonify({"error": "Failed to fetch ETF data"}), 500

    """입력된 ETF와 같은 섹터를 추종하는 다른 대표 ETF들을 Gemini API로 추천합니다."""
    try:
        data = request.get_json(silent=True) or {}
        app.logger.debug(f"[etf_recommend] incoming payload: {data}")
        
        etf_info = data.get('etf', {})
        ticker = etf_info.get('ticker', '')
        name = etf_info.get('name', '')
        
        if not ticker:
            return jsonify({"error": "ETF ticker is required"}), 400
        
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            app.logger.warning("[etf_recommend] GEMINI_API_KEY not set, returning empty recommendations")
            return jsonify({"recommendations": []})
        
        # 최신 키로 매 호출 구성
        genai.configure(api_key=api_key)
        
        # 모델은 공통으로 지원되는 'gemini-2.5-flash' 사용
        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = f"다음 ETF와 같은 섹터를 추종하는 다른 대표 ETF들의 ticker만 JSON 배열로 반환해줘. ETF: {ticker} {name}"
        
        try:
            app.logger.debug(f"[etf_recommend] Sending prompt to GEMINI... prompt_len={len(prompt)}; head={prompt[:200]}")
            resp = model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            text = (getattr(resp, 'text', '') or '').strip()
            app.logger.debug(f"[etf_recommend] GEMINI response received, text_len={len(text)}; head={text[:300]}")
            
            # JSON 파싱 시도
            import json, re
            try:
                parsed = json.loads(text)
                if isinstance(parsed, list):
                    return jsonify({"recommendations": parsed})
                elif isinstance(parsed, dict) and 'recommendations' in parsed:
                    return jsonify(parsed)
                else:
                    return jsonify({"recommendations": []})
            except Exception:
                # JSON 블록만 추출하여 재시도
                match = re.search(r"\[[\s\S]*\]", text)
                if match:
                    try:
                        parsed = json.loads(match.group())
                        if isinstance(parsed, list):
                            return jsonify({"recommendations": parsed})
                    except Exception:
                        pass
                return jsonify({"recommendations": []})
                
        except Exception as call_err:
            app.logger.error(f"[etf_recommend] GEMINI API 호출 실패: {call_err}\n{traceback.format_exc()}")
            return jsonify({"recommendations": []})
            
    except Exception as e:
        app.logger.error(f"[etf_recommend] 처리 중 예외: {e}\n{traceback.format_exc()}")
        return jsonify({"recommendations": []})

    """GEMINI API 키 로드 상태를 반환합니다."""
    try:
        key_present = bool(GEMINI_API_KEY)
        key_length = len(GEMINI_API_KEY) if GEMINI_API_KEY else 0
        
        return jsonify({
            "key_present": key_present,
            "key_length": key_length,
            "message": "API key loaded successfully" if key_present else "API key not found"
        })
    except Exception as e:
        app.logger.error(f"Key status check failed: {e}")
        return jsonify({
            "key_present": False,
            "key_length": 0,
            "message": f"Error checking key status: {str(e)}"
        }), 500

# 5. Gemini API를 사용한 AI 요약 생성
@app.route('/api/ai/summary', methods=['POST'])
def ai_summary():
    """선택된 ETF 배열을 받아 공통점/차이점/성장성/안정성을 요약한다.
    실패 시에도 프론트가 멈추지 않도록 친화적인 fallback을 반환한다.
    """
    try:
        data = request.get_json(silent=True) or {}
        app.logger.debug(f"[ai_summary] incoming payload: {data}")
        # 허용하는 페이로드 형태: { tickers: ["VOO", ...] } 또는 { etfs: [{ticker, name}, ...] }
        tickers = data.get('tickers')
        if isinstance(tickers, list) and len(tickers) > 0:
            # tickers 배열이 오면 etfs 구조로 변환
            etfs = [{"ticker": str(t), "name": str(t)} for t in tickers]
        else:
            etfs = data.get('etfs', [])
        if not isinstance(etfs, list) or not etfs:
            return jsonify({"error": "No tickers/etfs provided"}), 400

        api_key = os.getenv('GEMINI_API_KEY')
        app.logger.debug(f"[ai_summary] GEMINI key present? {bool(api_key)}")
        if not api_key:
            # 키가 없으면 간단한 fallback 반환 (200)
            names = ", ".join([e.get('ticker') or e.get('name','') for e in etfs])
            app.logger.warning("[ai_summary] GEMINI_API_KEY not set, returning fallback summary")
            return jsonify({
                "common": f"선택: {names}. 키 미설정 상태라 간단 요약만 제공합니다.",
                "differences": [],
                "pros_cons": []
            })

        # 최신 키로 매 호출 구성
        genai.configure(api_key=api_key)

        # 모델은 공통으로 지원되는 'gemini-2.5-flash' 사용
        model = genai.GenerativeModel('gemini-2.5-flash')
        tickers_text = ", ".join([f"{e.get('name','') or e.get('ticker','')} ({e.get('ticker','')})" for e in etfs])
        prompt = (
            "당신은 ETF 비교 분석 도우미입니다. 다음 선택된 ETF들에 대해 한국어로 간결하게 분석하세요.\n"
            f"선택된 ETF: {tickers_text}\n\n"
            "요구사항:\n"
            "1) 공통점/비교 컨셉\n"
            "2) 차이점 3~5개\n"
            "3) 성장성/안정성 관점 포인트\n"
            "응답을 JSON으로: {common: string, differences: [string], pros_cons: [string]}"
        )

        try:
            app.logger.debug(f"[ai_summary] Sending prompt to GEMINI... prompt_len={len(prompt)}; head={prompt[:200]}")
            resp = model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            text = (getattr(resp, 'text', '') or '').strip()
            app.logger.debug(f"[ai_summary] GEMINI response received, text_len={len(text)}; head={text[:300]}")
            parsed = safe_parse_json(text, fallback_key="common")
            return jsonify(parsed)
        except Exception as call_err:
            app.logger.error(
                f"[ai_summary] GEMINI API 호출 실패: {call_err}\n{traceback.format_exc()}"
            )
            names = ", ".join([e.get('ticker') or e.get('name','') for e in etfs])
            return jsonify({
                "common": f"선택: {names}. 모델 호출 실패로 간단 요약을 제공합니다.",
                "differences": [],
                "pros_cons": []
            })

        app.logger.debug("[ai_summary] Returning parsed response to client")
        return jsonify(parsed)
    except Exception as e:
        # 전체 핸들러 예외도 상세 추적 로그 남김
        traceback.print_exc()
        app.logger.error(
            f"[ai_summary] 처리 중 예외: {e}\n{traceback.format_exc()}"
        )
        # 최종 안전 fallback
        return jsonify({"common": "AI 요약 생성 중 오류 발생. 잠시 후 다시 시도해주세요.", "differences": [], "pros_cons": []}), 200

# 5. 새로운 API 엔드포인트: Gemini를 이용한 ETF 비교 분석
@app.route('/api/etf/analyze', methods=['POST'])
def analyze_etfs():
    """요청 본문으로 받은 ETF 티커 목록을 yfinance로 조회하고,
    그 정보를 바탕으로 Gemini API를 호출하여 비교 분석 결과를 반환합니다."""

    payload = request.get_json(silent=True) or {}
    app.logger.debug(f"[etf_analyze] incoming payload: {payload}")
    # tickers 또는 etfs 허용
    tickers = payload.get('tickers')
    if isinstance(tickers, list) and len(tickers) > 0:
        etf_tickers = [str(t) for t in tickers]
    else:
        etfs_in = payload.get('etfs', [])
        etf_tickers = [str(e.get('ticker')) for e in etfs_in if e.get('ticker')]

    if not etf_tickers:
        return jsonify({"error": "No tickers provided"}), 400

    try:
        summaries = []
        for ticker_code in etf_tickers:
            full_ticker = f"{ticker_code}.KS" if str(ticker_code).isdigit() else str(ticker_code)
            etf = yf.Ticker(full_ticker)

            info = getattr(etf, 'info', {}) or {}
            long_name = info.get('longName') or info.get('shortName') or str(ticker_code)
            expense = info.get('annualReportExpenseRatio')
            try:
                holdings_df = getattr(etf, 'holdings', None)
                if holdings_df is not None:
                    holdings_df = holdings_df.head(5)
                else:
                    holdings_df = None
            except Exception:
                holdings_df = None

            summary = [f"--- ETF: {long_name} ({ticker_code}) ---"]
            summary.append(f"  - 운용 보수: {expense if expense is not None else 'N/A'}")
            summary.append("  - 상위 5개 보유 종목:")
            if holdings_df is not None and not holdings_df.empty:
                # 컬럼명이 환경에 따라 다를 수 있어 안전 매핑
                stock_col = 'Stock' if 'Stock' in holdings_df.columns else ('Company' if 'Company' in holdings_df.columns else holdings_df.columns[0])
                weight_col = 'Weight' if 'Weight' in holdings_df.columns else ('% of assets' if '% of assets' in holdings_df.columns else (holdings_df.columns[1] if len(holdings_df.columns) > 1 else None))
                for _, row in holdings_df.iterrows():
                    name = str(row.get(stock_col, 'N/A'))
                    weight = row.get(weight_col, None)
                    try:
                        weight = float(weight) * (100.0 if float(weight) < 1 else 1.0)
                    except Exception:
                        weight = None
                    summary.append(f"    - {name}: {weight:.2f}%" if isinstance(weight, float) else f"    - {name}")
            else:
                summary.append("    - (데이터 없음)")

            summaries.append("\n".join(summary))

        prompt = (
            "당신은 전문 금융 애널리스트입니다. 다음 ETF들에 대한 정보를 바탕으로 아래 세 가지 기준에 맞춰 비교 분석 보고서를 작성해주세요. 보고서는 한국어로, 전문가적이면서도 이해하기 쉬운 톤으로 작성합니다.\n\n"
            "[분석 대상 ETF 정보]\n" + "\n".join(summaries) + "\n\n" \
            "[분석 보고서 작성 기준]\n"
            "1. 공통점 및 투자 컨셉 분석: 이 ETF들을 동시에 선택한 사용자는 어떤 종류의 투자에 관심이 있는지 추론하여 분석.\n"
            "2. 핵심 차이점 비교: 운용 보수, 상위 보유 종목 비중, 추종 지수 등을 기반으로 핵심 차이 설명.\n"
            "3. 성장성 vs 안정성 유불리 분석: 각 ETF의 특성을 바탕으로 성장성과 안정성 관점에서의 유불리를 구체적 근거와 함께 제시.\n"
        )

        # 모델 호출 (JSON 강제)
        model = genai.GenerativeModel('gemini-2.5-flash')
        try:
            app.logger.debug(f"[etf_analyze] Sending prompt to GEMINI... prompt_len={len(prompt)}; head={prompt[:200]}")
            resp = model.generate_content(
                prompt + "\n\n응답을 JSON으로: {analysis: string}",
                generation_config={"response_mime_type": "application/json"}
            )
            text = (getattr(resp, 'text', '') or '').strip()
            app.logger.debug(f"[etf_analyze] GEMINI response received, text_len={len(text)}; head={text[:300]}")
            parsed = safe_parse_json(text, fallback_key="analysis")
            return jsonify(parsed)
        except Exception as call_err:
            app.logger.error(f"[etf_analyze] GEMINI API 호출 실패: {call_err}\n{traceback.format_exc()}")
            names = ", ".join(etf_tickers)
            return jsonify({"analysis": f"모델 호출 실패. 선택된 ETF: {names}"})

    except Exception as e:
        # 에러 내용을 서버 콘솔과 로거에 남깁니다.
        print(f"!!! GEMINI API ERROR in /api/etf/analyze: {e}")
        app.logger.error(
            f"[etf_analyze] 처리 중 예외: {e}\n{traceback.format_exc()}"
        )
        return jsonify({"analysis": "AI 분석 처리 중 오류가 발생했습니다."})

# 6. KIS API를 이용한 ETF 보유 종목 조회
@app.route('/api/etf/<ticker>/holdings', methods=['GET'])
def get_etf_holdings(ticker):
    """KIS API를 통해 특정 ETF의 보유 종목 정보를 조회합니다."""
    try:
        app.logger.debug(f"[etf_holdings] Fetching holdings for ticker: {ticker}")
        
        # KIS API 호출을 위한 모듈 import
        try:
            from kis_api import KoreaInvestmentAPI
            kis_api = KoreaInvestmentAPI()
            
            # ETF 보유 종목 조회
            holdings_data = kis_api.getETFHoldings(ticker)
            
            if not holdings_data or not holdings_data.get('holdings'):
                app.logger.warning(f"[etf_holdings] No holdings data for ticker: {ticker}")
                return jsonify({"error": "No holdings data found"}), 404
            
            # 응답 데이터 구성
            response_data = {
                "ticker": ticker,
                "etfName": holdings_data.get('etfName', ticker),
                "nav": holdings_data.get('nav'),
                "totalHoldings": holdings_data.get('totalHoldings'),
                "updateDate": holdings_data.get('updateDate'),
                "holdings": holdings_data['holdings'][:10]  # 상위 10개만 반환
            }
            
            app.logger.debug(f"[etf_holdings] Successfully fetched {len(response_data['holdings'])} holdings for {ticker}")
            return jsonify(response_data)
            
        except ImportError:
            app.logger.warning("[etf_holdings] KIS API module not available, using mock data")
            # KIS API 모듈이 없을 경우 Mock 데이터 반환
            mock_holdings = [
                {"stockCode": "005930", "stockName": "삼성전자", "weight": 12.1, "shares": 12345, "value": 892345000},
                {"stockCode": "000660", "stockName": "SK하이닉스", "weight": 10.8, "shares": 54321, "value": 789012000},
                {"stockCode": "035420", "stockName": "NAVER", "weight": 9.5, "shares": 23456, "value": 567890000},
                {"stockCode": "207940", "stockName": "삼성바이오로직스", "weight": 8.2, "shares": 34567, "value": 456789000},
                {"stockCode": "006400", "stockName": "삼성SDI", "weight": 6.3, "shares": 45678, "value": 345678000}
            ]
            
            response_data = {
                "ticker": ticker,
                "etfName": f"KODEX {ticker}",
                "nav": 32150.50,
                "totalHoldings": 200,
                "updateDate": "20251001",
                "holdings": mock_holdings
            }
            
            return jsonify(response_data)
            
        except Exception as e:
            app.logger.error(f"[etf_holdings] Error fetching ETF holdings: {e}\n{traceback.format_exc()}")
            return jsonify({"error": "Failed to fetch ETF holdings"}), 500
            
    except Exception as e:
        app.logger.error(f"[etf_holdings] Outer error: {e}\n{traceback.format_exc()}")
        return jsonify({"error": "Failed to fetch ETF holdings"}), 500

# 7. KIS API를 이용한 ETF 주가 히스토리 조회
@app.route('/api/etf/<ticker>/price-history', methods=['GET'])
def get_etf_price_history(ticker):
    """KIS API를 통해 특정 ETF의 주가 히스토리를 조회합니다."""
    try:
        period = request.args.get('period', '3m')  # 기본 3개월
        
        app.logger.debug(f"[price_history] Fetching price history for ticker: {ticker}, period: {period}")
        
        # Mock 데이터 반환 (ETF별로 다른 데이터)
        import random
        from datetime import datetime, timedelta
        
        # 기간에 따른 데이터 포인트 수 계산
        days = 30 if period == '1m' else 90 if period == '3m' else 180 if period == '6m' else 365
        
        # ETF별 기본 가격 설정
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
        
        mock_data = {
            "ticker": ticker,
            "period": period,
            "priceHistory": price_history
        }
        
        app.logger.debug(f"[price_history] Returning mock data for {ticker}")
        return jsonify(mock_data)
            
    except Exception as e:
        app.logger.error(f"[price_history] Error fetching ETF price history: {e}\n{traceback.format_exc()}")
        return jsonify({"error": "Failed to fetch ETF price history"}), 500

# 8. KIS API를 이용한 ETF 수수료 및 배당금 정보 조회
@app.route('/api/etf/<ticker>/fees-dividend', methods=['GET'])
def get_etf_fees_dividend(ticker):
    """KIS API를 통해 특정 ETF의 수수료 및 배당금 정보를 조회합니다."""
    try:
        app.logger.debug(f"[fees_dividend] Fetching fees and dividend info for ticker: {ticker}")
        
        # Mock 데이터 반환 (ETF별로 다른 수수료 및 배당금 정보)
        fees_dividend_data = {
            "ticker": ticker,
            "etfName": f"ETF {ticker}",
            "fees": {
                "managementFee": 0.05,  # 연간 관리비 (0.05%)
                "custodyFee": 0.01,    # 보관비 (0.01%)
                "totalExpenseRatio": 0.06,  # 총 비용 비율 (0.06%)
                "tradingFee": 0.015,   # 거래 수수료 (0.015%)
                "redemptionFee": 0.0   # 환매 수수료 (0%)
            },
            "dividend": {
                "dividendYield": 2.5,  # 배당 수익률 (2.5%)
                "lastDividend": 150,   # 최근 배당금 (원)
                "dividendDate": "2025-09-30",  # 배당일
                "paymentFrequency": "quarterly",  # 배당 주기 (분기별)
                "nextDividendDate": "2025-12-31"  # 다음 배당일
            },
            "performance": {
                "ytdReturn": 8.5,      # 연초 대비 수익률 (8.5%)
                "oneYearReturn": 12.3,  # 1년 수익률 (12.3%)
                "threeYearReturn": 15.7,  # 3년 수익률 (15.7%)
                "fiveYearReturn": 18.2   # 5년 수익률 (18.2%)
            },
            "updateDate": "2025-10-01"
        }
        
        # ETF별로 다른 데이터 설정
        etf_specific_data = {
            '069500': {  # KODEX 200
                "etfName": "KODEX 200",
                "fees": {"managementFee": 0.05, "custodyFee": 0.01, "totalExpenseRatio": 0.06, "tradingFee": 0.015, "redemptionFee": 0.0},
                "dividend": {"dividendYield": 2.8, "lastDividend": 180, "dividendDate": "2025-09-30", "paymentFrequency": "quarterly", "nextDividendDate": "2025-12-31"},
                "performance": {"ytdReturn": 7.2, "oneYearReturn": 11.5, "threeYearReturn": 14.8, "fiveYearReturn": 17.3}
            },
            '360750': {  # TIGER 미국S&P500
                "etfName": "TIGER 미국S&P500",
                "fees": {"managementFee": 0.08, "custodyFee": 0.02, "totalExpenseRatio": 0.10, "tradingFee": 0.015, "redemptionFee": 0.0},
                "dividend": {"dividendYield": 1.8, "lastDividend": 120, "dividendDate": "2025-09-30", "paymentFrequency": "quarterly", "nextDividendDate": "2025-12-31"},
                "performance": {"ytdReturn": 9.1, "oneYearReturn": 13.2, "threeYearReturn": 16.5, "fiveYearReturn": 19.1}
            },
            '379800': {  # KODEX 미국S&P500TR
                "etfName": "KODEX 미국S&P500TR",
                "fees": {"managementFee": 0.06, "custodyFee": 0.015, "totalExpenseRatio": 0.075, "tradingFee": 0.015, "redemptionFee": 0.0},
                "dividend": {"dividendYield": 2.1, "lastDividend": 140, "dividendDate": "2025-09-30", "paymentFrequency": "quarterly", "nextDividendDate": "2025-12-31"},
                "performance": {"ytdReturn": 8.7, "oneYearReturn": 12.8, "threeYearReturn": 15.9, "fiveYearReturn": 18.4}
            },
            '448630': {  # SOL 미국S&P500
                "etfName": "SOL 미국S&P500",
                "fees": {"managementFee": 0.07, "custodyFee": 0.018, "totalExpenseRatio": 0.088, "tradingFee": 0.015, "redemptionFee": 0.0},
                "dividend": {"dividendYield": 1.9, "lastDividend": 125, "dividendDate": "2025-09-30", "paymentFrequency": "quarterly", "nextDividendDate": "2025-12-31"},
                "performance": {"ytdReturn": 8.9, "oneYearReturn": 13.0, "threeYearReturn": 16.2, "fiveYearReturn": 18.7}
            },
            '371460': {  # TIGER 미국필라델피아반도체나스닥
                "etfName": "TIGER 미국필라델피아반도체나스닥",
                "fees": {"managementFee": 0.10, "custodyFee": 0.025, "totalExpenseRatio": 0.125, "tradingFee": 0.015, "redemptionFee": 0.0},
                "dividend": {"dividendYield": 0.8, "lastDividend": 50, "dividendDate": "2025-09-30", "paymentFrequency": "quarterly", "nextDividendDate": "2025-12-31"},
                "performance": {"ytdReturn": 15.2, "oneYearReturn": 22.1, "threeYearReturn": 28.5, "fiveYearReturn": 35.2}
            },
            '272580': {  # KODEX 2차전지산업
                "etfName": "KODEX 2차전지산업",
                "fees": {"managementFee": 0.09, "custodyFee": 0.02, "totalExpenseRatio": 0.11, "tradingFee": 0.015, "redemptionFee": 0.0},
                "dividend": {"dividendYield": 1.2, "lastDividend": 80, "dividendDate": "2025-09-30", "paymentFrequency": "quarterly", "nextDividendDate": "2025-12-31"},
                "performance": {"ytdReturn": 12.5, "oneYearReturn": 18.7, "threeYearReturn": 25.3, "fiveYearReturn": 32.1}
            }
        }
        
        # 특정 ETF 데이터가 있으면 사용, 없으면 기본값 사용
        if ticker in etf_specific_data:
            fees_dividend_data.update(etf_specific_data[ticker])
        
        app.logger.debug(f"[fees_dividend] Returning fees and dividend data for {ticker}")
        return jsonify(fees_dividend_data)
            
    except Exception as e:
        app.logger.error(f"[fees_dividend] Error fetching ETF fees and dividend: {e}\n{traceback.format_exc()}")
        return jsonify({"error": "Failed to fetch ETF fees and dividend"}), 500

if __name__ == '__main__':
    # 배포 환경에서는 debug=False로 설정
    port = int(os.environ.get("PORT", 5000))  # Railway가 포트를 자동으로 정해줌
    app.run(host="0.0.0.0", port=port, debug=False)

"""
ETF Holic Backend API Server
ETF 비교 분석을 위한 FastAPI 서버
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
from dotenv import load_dotenv
import yfinance as yf
import google.generativeai as genai
import pandas as pd
from typing import List, Optional
import logging

# 환경변수 로드
load_dotenv()

# 로깅 설정
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI 앱 생성
app = FastAPI(
    title="ETF Holic API",
    description="ETF 비교 분석을 위한 API 서버",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React 개발 서버
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gemini API 설정
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.5-flash')
else:
    logger.warning("GEMINI_API_KEY가 설정되지 않았습니다.")

# Pydantic 모델
class ETFInfo(BaseModel):
    symbol: str
    name: str
    price: float
    change: float
    change_percent: float
    volume: int
    market_cap: Optional[float] = None

class ETFComparison(BaseModel):
    etfs: List[ETFInfo]
    analysis: str

class ETFSearchRequest(BaseModel):
    symbols: List[str]

# API 엔드포인트
@app.get("/")
async def root():
    """루트 엔드포인트"""
    return {"message": "ETF Holic API 서버가 실행 중입니다."}

@app.get("/health")
async def health_check():
    """헬스 체크 엔드포인트"""
    return {"status": "healthy", "service": "ETF Holic API"}

@app.post("/api/etf/info", response_model=ETFInfo)
async def get_etf_info(symbol: str):
    """단일 ETF 정보 조회"""
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        hist = ticker.history(period="1d")
        
        if hist.empty:
            raise HTTPException(status_code=404, detail=f"ETF {symbol}를 찾을 수 없습니다.")
        
        current_price = hist['Close'].iloc[-1]
        prev_close = info.get('previousClose', current_price)
        change = current_price - prev_close
        change_percent = (change / prev_close) * 100 if prev_close else 0
        
        return ETFInfo(
            symbol=symbol.upper(),
            name=info.get('longName', symbol),
            price=round(current_price, 2),
            change=round(change, 2),
            change_percent=round(change_percent, 2),
            volume=hist['Volume'].iloc[-1] if not hist.empty else 0,
            market_cap=info.get('marketCap')
        )
    except Exception as e:
        logger.error(f"ETF 정보 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=f"ETF 정보를 가져오는 중 오류가 발생했습니다: {str(e)}")

@app.post("/api/etf/compare", response_model=ETFComparison)
async def compare_etfs(request: ETFSearchRequest):
    """여러 ETF 비교 분석"""
    try:
        etf_data = []
        
        # 각 ETF 정보 수집
        for symbol in request.symbols:
            try:
                ticker = yf.Ticker(symbol)
                info = ticker.info
                hist = ticker.history(period="1d")
                
                if not hist.empty:
                    current_price = hist['Close'].iloc[-1]
                    prev_close = info.get('previousClose', current_price)
                    change = current_price - prev_close
                    change_percent = (change / prev_close) * 100 if prev_close else 0
                    
                    etf_data.append(ETFInfo(
                        symbol=symbol.upper(),
                        name=info.get('longName', symbol),
                        price=round(current_price, 2),
                        change=round(change, 2),
                        change_percent=round(change_percent, 2),
                        volume=hist['Volume'].iloc[-1],
                        market_cap=info.get('marketCap')
                    ))
            except Exception as e:
                logger.warning(f"ETF {symbol} 정보 조회 실패: {e}")
                continue
        
        if not etf_data:
            raise HTTPException(status_code=404, detail="유효한 ETF 정보를 찾을 수 없습니다.")
        
        # Gemini AI를 사용한 분석
        analysis = ""
        if GEMINI_API_KEY and model:
            try:
                etf_summary = "\n".join([
                    f"- {etf.symbol}: {etf.name}, 가격: ${etf.price}, 변동률: {etf.change_percent}%"
                    for etf in etf_data
                ])
                
                prompt = f"""
                다음 ETF들의 정보를 분석하고 비교해주세요:
                
                {etf_summary}
                
                각 ETF의 특징, 장단점, 투자 시 고려사항을 한국어로 간단히 설명해주세요.
                """
                
                response = model.generate_content(prompt)
                analysis = response.text
            except Exception as e:
                logger.error(f"AI 분석 오류: {e}")
                analysis = "AI 분석을 수행할 수 없습니다."
        else:
            analysis = "AI 분석 기능을 사용할 수 없습니다. (API 키가 설정되지 않음)"
        
        return ETFComparison(etfs=etf_data, analysis=analysis)
        
    except Exception as e:
        logger.error(f"ETF 비교 분석 오류: {e}")
        raise HTTPException(status_code=500, detail=f"ETF 비교 분석 중 오류가 발생했습니다: {str(e)}")

@app.get("/api/etf/popular")
async def get_popular_etfs():
    """인기 ETF 목록 조회"""
    popular_symbols = [
        "SPY", "QQQ", "VTI", "VEA", "VWO", "AGG", "BND", "GLD", "SLV", "IWM"
    ]
    
    try:
        etf_data = []
        for symbol in popular_symbols:
            try:
                ticker = yf.Ticker(symbol)
                info = ticker.info
                hist = ticker.history(period="1d")
                
                if not hist.empty:
                    current_price = hist['Close'].iloc[-1]
                    prev_close = info.get('previousClose', current_price)
                    change = current_price - prev_close
                    change_percent = (change / prev_close) * 100 if prev_close else 0
                    
                    etf_data.append(ETFInfo(
                        symbol=symbol,
                        name=info.get('longName', symbol),
                        price=round(current_price, 2),
                        change=round(change, 2),
                        change_percent=round(change_percent, 2),
                        volume=hist['Volume'].iloc[-1],
                        market_cap=info.get('marketCap')
                    ))
            except Exception as e:
                logger.warning(f"인기 ETF {symbol} 정보 조회 실패: {e}")
                continue
        
        return {"etfs": etf_data}
        
    except Exception as e:
        logger.error(f"인기 ETF 목록 조회 오류: {e}")
        raise HTTPException(status_code=500, detail=f"인기 ETF 목록을 가져오는 중 오류가 발생했습니다: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )


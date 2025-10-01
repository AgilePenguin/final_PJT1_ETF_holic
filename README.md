# ETF Holic - ETF 비교 분석 서비스

ETF 상품을 비교 분석할 수 있는 웹 서비스입니다. `yfinance` 라이브러리와 Gemini API를 연동하여 사용자에게 ETF 정보를 제공합니다.

## 프로젝트 구조

```
final_PJT1_ETF_holic/
├── frontend/                 # React + Vite 프론트엔드
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   │   └── vite.svg
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── .eslintrc.cjs
├── venv/                     # Python 가상환경 (생성 예정)
├── .env                      # 환경변수 (GEMINI_API_KEY 포함)
├── .gitignore               # Git 제외 파일 목록
└── README.md
```

## 설치 및 실행 방법

### 1. Python 가상환경 설정
```bash
# Python 가상환경 생성
python -m venv venv

# 가상환경 활성화 (Windows)
venv\Scripts\activate

# 가상환경 활성화 (macOS/Linux)
source venv/bin/activate
```

### 2. Python 의존성 설치
```bash
pip install -r requirements.txt
```

### 3. 프론트엔드 의존성 설치
```bash
cd frontend
npm install
```

### 4. 개발 서버 실행
```bash
# 백엔드 서버 (포트 8000)
python app.py

# 프론트엔드 서버 (포트 3000)
cd frontend
npm run dev
```

## 환경변수 설정

`.env` 파일에 다음 내용이 포함되어 있습니다:
```
GEMINI_API_KEY="AIzaSyCVqHiywVvxFPo2O3vCkRTDSgh59UaSQbA"
```

## 기술 스택

- **프론트엔드**: React, Vite, JavaScript
- **백엔드**: Python (예정)
- **API**: Gemini API
- **데이터**: yfinance 라이브러리

## 주요 기능 (예정)

- ETF 상품 검색 및 비교
- 실시간 가격 정보
- AI 기반 분석 및 추천
- 포트폴리오 구성 도구

## 개발 상태

- [x] 프로젝트 구조 설정
- [x] 프론트엔드 기본 구조 생성
- [x] 환경변수 설정
- [x] Git 설정
- [ ] Python 가상환경 설정 (Python 설치 필요)
- [ ] 백엔드 API 개발
- [ ] yfinance 연동
- [ ] Gemini API 연동
- [ ] ETF 비교 기능 구현
# KIS API 실제 연동 가이드

## 현재 상태
- Mock 모드 활성화 (KIS_MOCK_MODE=true)
- 실제 KIS API 키가 설정되지 않음

## 실제 KIS API 사용 방법

### 1. 환경변수 설정 (권장)
```bash
# Windows PowerShell
$env:KIS_APP_KEY="your_actual_app_key"
$env:KIS_APP_SECRET="your_actual_app_secret"  
$env:KIS_ACCOUNT_NO="your_actual_account_no"
$env:KIS_MOCK_MODE="false"

# Linux/Mac
export KIS_APP_KEY="your_actual_app_key"
export KIS_APP_SECRET="your_actual_app_secret"
export KIS_ACCOUNT_NO="your_actual_account_no"
export KIS_MOCK_MODE="false"
```

### 2. 코드에서 직접 설정 (개발용)
`backend/kis_api.py`의 `__init__` 메서드에서:
```python
self.app_key = "your_actual_app_key"
self.app_secret = "your_actual_app_secret"
self.account_no = "your_actual_account_no"
self.mock_mode = False
```

### 3. KIS API 키 발급 방법
1. 한국투자증권 홈페이지 접속
2. Open API 신청
3. App Key, App Secret 발급
4. 계좌번호 확인

## 현재 구현된 기능
- ✅ OAuth 2.0 인증 토큰 발급
- ✅ 토큰 자동 갱신
- ✅ ETF 보유종목 조회
- ✅ API 실패 시 Mock 데이터 폴백
- ✅ 상세한 로깅 및 에러 핸들링

## 테스트 방법
```bash
# Mock 모드 테스트 (현재 상태)
curl http://localhost:5000/api/etf/498270/holdings

# 실제 API 모드 테스트 (환경변수 설정 후)
# 환경변수 설정 후 백엔드 재시작 필요
```

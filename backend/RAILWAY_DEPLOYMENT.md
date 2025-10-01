# Railway 배포 환경변수 설정 가이드

## 필수 환경변수

Railway 대시보드에서 다음 환경변수들을 설정해야 합니다:

### 1. KIS API 설정
```
KIS_APP_KEY=PSJrwH8NBzOjkCXaonxfCFvgStNKcBuzfUth
KIS_APP_SECRET=GLGHFMaCpE+zedF7AXoZXybCXTgGsK3Pe3b1xoKBO9cJhNAbX5V58HEawwPpzB09NacStNgpeqYVa269xrC4MURFApt4ElVzIzYrFjh3v8YEdN+hLjpeeY1G8B7wO7AnqDNiYPqXkZ//C3f0BkZ1a6LpyuFK8KOQzfQikzdrm7ZQdARFO0M=
KIS_ACCOUNT_NO=43146370-01
KIS_BASE_URL=https://openapi.koreainvestment.com:9443
KIS_MOCK_MODE=false
```

### 2. Gemini API 설정
```
GEMINI_API_KEY=AIzaSyDNZoWRJzi-SMqkDaxFRVwuyivNwAmJYLo
```

### 3. 배포 설정
```
PORT=5000
FLASK_ENV=production
```

## 설정 방법

1. Railway 대시보드 → 프로젝트 선택
2. Settings → Variables 탭
3. 위의 환경변수들을 하나씩 추가
4. Deploy 버튼 클릭하여 재배포

## 주의사항

- KIS_MOCK_MODE=false로 설정하여 실제 API 사용
- 환경변수는 대소문자를 정확히 입력
- 민감한 정보는 절대 Git에 커밋하지 말 것

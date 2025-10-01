# KIS API 설정 가이드
# 실제 KIS API를 사용하려면 아래 환경변수들을 설정하세요

# 방법 1: 환경변수로 설정
# export KIS_APP_KEY="your_actual_app_key"
# export KIS_APP_SECRET="your_actual_app_secret"
# export KIS_ACCOUNT_NO="your_actual_account_no"
# export KIS_MOCK_MODE="false"

# 방법 2: 코드에서 직접 설정 (개발용)
# kis_api.py의 __init__ 메서드에서 직접 설정

# 현재 상태: Mock 모드 활성화 (KIS_MOCK_MODE=true)
# 실제 API 사용 시: KIS_MOCK_MODE=false로 변경 필요

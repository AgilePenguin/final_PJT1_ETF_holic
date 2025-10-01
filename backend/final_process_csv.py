import pandas as pd

# 파일을 직접 읽어서 파싱
with open('k-etf_etfs.csv.csv', 'r', encoding='cp949') as f:
    lines = f.readlines()

# 헤더 파싱
first_line = lines[0].strip().strip('"')
columns = first_line.split(',')

# 데이터 파싱
data = []
for line in lines[1:]:  # 헤더 제외
    line = line.strip().strip('"')
    row = line.split(',')
    data.append(row)

# DataFrame 생성
df = pd.DataFrame(data, columns=columns)

print(f"원본 파일 로드 완료: {len(df)}개 행")
print("컬럼명:", df.columns.tolist())
print("\n--- 원본 데이터 샘플 (상위 3개) ---")
print(df[['Name', 'Ticker/Code']].head(3))

# Ticker/Code 컬럼의 데이터 타입을 문자열로 변환 (0으로 시작하는 코드 보호)
df['Ticker/Code'] = df['Ticker/Code'].astype(str).str.zfill(6)

# 새로운 'ticker_yFinance' 컬럼 생성
# 모든 한국 ETF는 KOSPI에 상장되어 있으므로 .KS 접미사 사용
df['ticker_yFinance'] = df['Ticker/Code'] + '.KS'

# 새로운 파일로 저장
output_filename = 'k-etf_etfs_processed.csv'
df.to_csv(output_filename, index=False, encoding='utf-8-sig')

print(f"\n전처리가 완료되었습니다. '{output_filename}' 파일을 확인해보세요.")
print(f"처리된 행 수: {len(df)}")
print("\n--- 처리 결과 (상위 5개) ---")
print(df[['Name', 'Ticker/Code', 'ticker_yFinance']].head())

# 통계 정보
print(f"\n--- 통계 정보 ---")
print(f"총 ETF 개수: {len(df)}")
print(f"고유 티커 개수: {df['Ticker/Code'].nunique()}")
print(f"yFinance 티커 예시: {df['ticker_yFinance'].head(3).tolist()}")

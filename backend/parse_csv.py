import pandas as pd
import re

# 파일을 직접 읽어서 파싱
with open('k-etf_etfs.csv.csv', 'r', encoding='cp949') as f:
    lines = f.readlines()

print("첫 번째 줄 원본:")
print(repr(lines[0]))

# 따옴표 제거 후 쉼표로 분리
first_line = lines[0].strip().strip('"')
columns = first_line.split(',')

print(f"\n분리된 컬럼들 ({len(columns)}개):")
for i, col in enumerate(columns):
    print(f"{i}: {repr(col)}")

# 실제 데이터로 DataFrame 생성
data = []
for line in lines[1:]:  # 헤더 제외
    line = line.strip().strip('"')
    row = line.split(',')
    data.append(row)

df = pd.DataFrame(data, columns=columns)
print(f"\nDataFrame 생성 완료: {df.shape}")
print("\n첫 번째 행:")
print(df.iloc[0])

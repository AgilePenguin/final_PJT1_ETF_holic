import pandas as pd

# 다양한 구분자 시도
separators = [',', ';', '\t', '|']

for sep in separators:
    try:
        df = pd.read_csv('k-etf_etfs.csv.csv', encoding='cp949', sep=sep, quotechar='"')
        print(f"\n구분자 '{sep}' 사용:")
        print(f"Shape: {df.shape}")
        print(f"Columns: {df.columns.tolist()}")
        if len(df.columns) > 1:
            print("✅ 올바른 구분자 발견!")
            print("첫 번째 행:")
            print(df.iloc[0])
            break
    except Exception as e:
        print(f"구분자 '{sep}' 실패: {e}")

import pandas as pd

# CSV 파일 분석
df = pd.read_csv('k-etf_etfs.csv.csv', encoding='cp949', quotechar='"')
print('Shape:', df.shape)
print('Columns:', df.columns.tolist())
print('\nFirst row:')
print(df.iloc[0])
print('\nColumn types:')
print(df.dtypes)

import pandas as pd

# 1. 원본 CSV 파일 읽기
# 파일이 스크립트와 같은 위치에 있다고 가정합니다.
input_filename = 'k-etf_etfs.csv.csv'

try:
    # 여러 인코딩 시도
    encodings = ['utf-8', 'cp949', 'euc-kr', 'latin-1']
    df = None
    
    for encoding in encodings:
        try:
            df = pd.read_csv(input_filename, encoding=encoding, quotechar='"')
            print(f"원본 파일 로드 완료 ({encoding}): {len(df)}개 행")
            break
        except UnicodeDecodeError:
            continue
    
    if df is None:
        raise Exception("모든 인코딩 시도 실패")
    print("컬럼명:", df.columns.tolist())
    print("\n--- 원본 데이터 샘플 (상위 3개) ---")
    print(df.head(3))
    
    # 2. 'Ticker/Code' 컬럼의 데이터 타입을 문자열로 변환 (0으로 시작하는 코드 보호)
    # 컬럼 이름이 다를 경우, 실제 파일의 컬럼명으로 수정해주세요.
    df['Ticker/Code'] = df['Ticker/Code'].astype(str).str.zfill(6)
    
    # 3. 새로운 'ticker_yFinance' 컬럼 생성
    # 모든 한국 ETF는 KOSPI에 상장되어 있으므로 .KS 접미사 사용
    df['ticker_yFinance'] = df['Ticker/Code'] + '.KS'
    
    # 4. 새로운 파일로 저장
    output_filename = 'k-etf_etfs_processed.csv'
    df.to_csv(output_filename, index=False, encoding='utf-8-sig')
    
    print(f"\n전처리가 완료되었습니다. '{output_filename}' 파일을 확인해보세요.")
    print(f"처리된 행 수: {len(df)}")
    print("\n--- 처리 결과 (상위 5개) ---")
    print(df[['Ticker/Code', 'Name', 'ticker_yFinance']].head())
    
except FileNotFoundError:
    print(f"파일을 찾을 수 없습니다: {input_filename}")
    print("현재 디렉토리의 파일들:")
    import os
    print(os.listdir('.'))
except Exception as e:
    print(f"오류 발생: {e}")

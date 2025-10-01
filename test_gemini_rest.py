#!/usr/bin/env python3
"""
Gemini REST API 직접 호출 테스트 스크립트
google-generativeai SDK 대신 requests 라이브러리 사용
"""

import os
import requests
import json
from dotenv import load_dotenv
import pathlib

# backend 폴더 안의 .env를 명시적으로 지정
env_path = pathlib.Path(__file__).parent / "backend" / ".env"
load_dotenv(dotenv_path=env_path)

def test_gemini_rest_api():
    """Gemini REST API를 직접 호출하여 테스트"""
    
    # 환경변수에서 API 키 읽기
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY not found in environment variables")
        return
    
    print(f"API Key present: {bool(api_key)}")
    print(f"API Key length: {len(api_key)}")
    
    # API 엔드포인트 URL
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
    
    # 요청 헤더
    headers = {
        "Content-Type": "application/json"
    }
    
    # 요청 바디
    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {"text": "Hello Gemini, please respond with a short JSON: {\"msg\": \"hi\"}"}
                ]
            }
        ]
    }
    
    try:
        print(f"\nSending request to: {url}")
        print(f"Headers: {headers}")
        print(f"Payload: {json.dumps(payload, indent=2)}")
        
        # API 호출
        # Google Generative Language REST는 API 키를 쿼리스트링 ?key= 로 전달
        response = requests.post(url, headers=headers, params={"key": api_key}, json=payload, timeout=30)
        
        print(f"\nStatus: {response.status_code}")
        print(f"Response: {response.text}")
        
        # 응답이 성공적이면 JSON 파싱 시도
        if response.status_code == 200:
            try:
                response_json = response.json()
                print(f"\nParsed JSON Response:")
                print(json.dumps(response_json, indent=2, ensure_ascii=False))
            except json.JSONDecodeError as e:
                print(f"\nJSON parsing failed: {e}")
        
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
    except Exception as e:
        print(f"Unexpected error: {e}")

if __name__ == "__main__":
    test_gemini_rest_api()

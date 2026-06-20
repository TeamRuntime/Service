import os
import glob
import cv2
import pytesseract
import pandas as pd
from datetime import datetime

# Tesseract 설치 경로 (Windows 환경일 경우 필요, Mac/Linux는 생략 가능)
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

SCAN_DIR = "data/raw/scans"
OUTPUT_CSV = "data/output/ocr_draft.csv"

def preprocess_image(image_path: str):
    """
    OCR 인식률을 높이기 위한 이미지 전처리
    - 흑백 변환, 노이즈 제거, 이진화(Binarization) 처리
    """
    # 1. 이미지 로드
    img = cv2.imread(image_path)
    if img is None:
        print(f"⚠️ 이미지를 읽을 수 없습니다: {image_path}")
        return None

    # 2. 그레이스케일 변환
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # 3. 노이즈 제거 (가우시안 블러)
    blur = cv2.GaussianBlur(gray, (5, 5), 0)

    # 4. 이진화 (Thresholding) - 글씨는 검게, 배경은 희게
    _, binary = cv2.threshold(blur, 150, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    # 배경을 흰색, 글씨를 검은색으로 반전 (Tesseract가 선호하는 형태)
    processed_img = cv2.bitwise_not(binary)
    
    return processed_img

def extract_data_from_image(processed_img, file_name: str) -> pd.DataFrame:
    """
    전처리된 이미지에서 텍스트를 추출하고 DataFrame으로 구조화
    """
    # Tesseract 옵션: 한국어+영어 혼용, 페이지 세그먼테이션 모드(PSM) 6(단일 균일 텍스트 블록 가정)
    custom_config = r'--oem 3 --psm 6'
    text = pytesseract.image_to_string(processed_img, lang='kor+eng', config=custom_config)
    
    parsed_data = []
    lines = text.split('\n')
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # 예시: "홍길동 40 40" 형태로 인식되었다고 가정하고 공백 기준으로 분리
        parts = line.split()
        if len(parts) >= 3:
            participant_name = parts[0]
            jt_hours = parts[1] # 직무훈련 시간
            we_hours = parts[2] # 일경험 시간
            
            parsed_data.append({
                "source_file": file_name,
                "participant_name": participant_name,
                "jt_attended_hours": jt_hours,
                "we_attended_hours": we_hours,
                "confidence_flag": "Needs Review" # 수기 OCR이므로 검토 필요 플래그 추가
            })
            
    return pd.DataFrame(parsed_data)

def run_ocr_pipeline():
    """
    스캔 폴더의 모든 이미지를 순회하며 OCR을 수행하고 하나의 CSV로 병합
    """
    print(f"🔍 [{datetime.now().strftime('%H:%M:%S')}] 수기 출석부 OCR 스캔을 시작합니다...")
    
    # 지원하는 이미지 확장자
    image_files = glob.glob(os.path.join(SCAN_DIR, "*.[pj][np][g]")) # .png, .jpg, .jpeg
    
    if not image_files:
        print(f"⚠️ '{SCAN_DIR}' 폴더에 스캔된 이미지가 없습니다.")
        return

    all_dataframes = []

    # 하나씩 스캔해서 처리
    for img_path in image_files:
        file_name = os.path.basename(img_path)
        print(f" ⏳ 처리 중: {file_name}")
        
        # 1. 전처리
        processed_img = preprocess_image(img_path)
        if processed_img is None:
            continue
            
        # 2. 텍스트 추출 및 구조화
        df_extracted = extract_data_from_image(processed_img, file_name)
        
        if not df_extracted.empty:
            all_dataframes.append(df_extracted)

    # 3. CSV로 통합 (Merge)
    if all_dataframes:
        final_df = pd.concat(all_dataframes, ignore_index=True)
        
        # 출력 디렉토리 확인 및 생성
        os.makedirs(os.path.dirname(OUTPUT_CSV), exist_ok=True)
        
        # CSV 저장 (한글 깨짐 방지를 위해 utf-8-sig 사용)
        final_df.to_csv(OUTPUT_CSV, index=False, encoding='utf-8-sig')
        print(f"✅ OCR 완료! 통합된 데이터가 저장되었습니다: {OUTPUT_CSV}")
        print(f"📊 총 추출된 행(Row) 수: {len(final_df)}개")
    else:
        print("❌ 추출된 유의미한 데이터가 없습니다.")

if __name__ == "__main__":
    run_ocr_pipeline()
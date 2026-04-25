import io
import os 
import uuid 
from PIL import Image 
from fastapi import UploadFile

class LocalStorageService: 
    def __init__(self):
        # goidama/uploads 폴더 기준
        current_path = os.path.abspath(__file__)
        root_dir = os.path.dirname(os.path.dirname(os.path.dirname(current_path)))
        self.base_dir = os.path.join(root_dir, "uploads")
    
    async def upload_optimized_image(self, file: UploadFile, folder: str) -> str: 
        #==================
        # 1. 이미지 처리 로직
        #==================
        content = await file.read()
        img = Image.open(io.BytesIO(content))
        
        # WebP 압축 및 리사이징 
        img.thumbnail((1280, 1280), Image.LANCZOS)
        output = io.BytesIO()
        img.save(output, format="WEBP", quality=80)

        #==================
        # 2. 저장 경로 생성: uploads/capsules/{capsule_id}
        #==================
        target_dir = os.path.join(self.base_dir, folder)
        os.makedirs(target_dir, exist_ok=True)

        filename = f"{uuid.uuid4()}.webp"
        save_path = os.path.join(target_dir, filename)

        with open(save_path, "wb") as f:
            f.write(output.getbuffer())

        #==================
        # 3. DB에 저장될 접근 주소(URL)
        #==================
        return f"/uploads/{folder}/{filename}"

storage_service = LocalStorageService()

# import io
# import uuid 
# import aioboto3 
# from PIL import Image 
# from fastapi import UploadFile 
# from appserver.settings import get_settings 

# settings = get_settings()

# class StorageService:
#     def __init__(self):
#         self.bucket_name = settings.S3_BUCKET_NAME 
#         self.session = aioboto3.Session()
    
#     async def upload_optimized_image(self, file: UploadFile, folder: str) -> str:
#         #==============
#         # 1. 이미지 읽기 및 Pillow 오픈
#         #==============
#         content = await file.read()
#         img = Image.open(io.BytesIO(content))

#         #==============
#         # 2. 리사이징 (최대 해상도 1280px 제한) 
#         #==============
#         if max(img.size) > 1280:
#             img.thumbnail((1280, 1280), Image.LANCZOS)
        
#         #==============
#         # 3. WebP 변환 및 압축
#         #==============
#         output = io.BytesIO()
#         img.save(output, format="WEBP", quality=80)
#         output.seek(0)

#         #==============
#         # 4. S3 업로드
#         #==============
#         file_path = f"{folder}/{uuid.uuid4()}.webp"
#         async with self.session.client(
#             "s3",
#             aws_access_key_id=settings.AWS_ACCESS_KEY,
#             aws_secret_access_key=settings.AWS_SECRET_KEY,
#             region_name=settings.AWS_REGION
#         ) as s3:
#             await s3.put_object(
#                 Bucket = self.bucket_name,
#                 Key=file_path,
#                 Body=output,
#                 ContentType="image/webp"
#             )
#         return f"https://{self.bucket_name}.s3.{settings.AWS_REGION}.amazonaws.com/{file_path}"

# storage_service = StorageService()

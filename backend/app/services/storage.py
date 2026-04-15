import os
import uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException
from app.core.config import settings
from loguru import logger
from PIL import Image
from io import BytesIO

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_SIZE = 5 * 1024 * 1024  # 5MB


async def save_upload(file: UploadFile, folder: str = "misc") -> str:
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG/PNG/WebP images allowed")

    content = await file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")

    try:
        img = Image.open(BytesIO(content))
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        output = BytesIO()
        img.save(output, format="WEBP", quality=80)
        content = output.getvalue()
        ext = "webp"
        file_content_type = "image/webp"
    except Exception as e:
        logger.error(f"Image compression failed: {e}")
        ext = file.filename.rsplit(".", 1)[-1].lower()
        file_content_type = file.content_type

    filename = f"{uuid.uuid4().hex}.{ext}"

    if settings.STORAGE_TYPE == "s3":
        return await _upload_s3(content, filename, folder, file_content_type)
    else:
        return await _save_local(content, filename, folder)


async def _save_local(content: bytes, filename: str, folder: str) -> str:
    upload_dir = Path(settings.UPLOAD_DIR) / folder
    upload_dir.mkdir(parents=True, exist_ok=True)
    path = upload_dir / filename
    with open(path, "wb") as f:
        f.write(content)
    return f"/uploads/{folder}/{filename}"


async def _upload_s3(content: bytes, filename: str, folder: str, content_type: str) -> str:
    import boto3
    s3 = boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION,
    )
    key = f"{folder}/{filename}"
    s3.put_object(
        Bucket=settings.S3_BUCKET,
        Key=key,
        Body=content,
        ContentType=content_type,
        ACL="public-read",
    )
    return f"https://{settings.S3_BUCKET}.s3.{settings.AWS_REGION}.amazonaws.com/{key}"

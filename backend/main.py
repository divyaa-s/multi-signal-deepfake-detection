import os
import shutil
import uuid
import logging
from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

# Import detection logic
from deepfake_detection import generate_gradcam_and_ensemble_predict
from hybrid_vid_improved import HybridVideoAnalyzer

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Antigravity Deepfake Detection API", version="1.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directories
BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"
STATIC_DIR = BASE_DIR / "static"

for d in [UPLOAD_DIR, STATIC_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# Serve Static Files
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

# Initialize Video Analyzer (Singleton-like)
video_analyzer = HybridVideoAnalyzer()

class AnalysisResult(BaseModel):
    label: str
    confidence: float
    gradcam_url: Optional[str] = None
    radar_url: Optional[str] = None
    barchart_url: Optional[str] = None
    details: dict

@app.get("/")
async def root():
    return {"message": "Antigravity Deepfake Detection API is running"}

@app.post("/analyze/image")
async def analyze_image_endpoint(file: UploadFile = File(...)):
    """
    Performs image-based deepfake analysis using an ensemble of 4 CNNs + Frequency analysis.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")

    file_id = str(uuid.uuid4())
    ext = Path(file.filename).suffix
    temp_path = UPLOAD_DIR / f"{file_id}{ext}"

    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Run Analysis
        # Note: generate_gradcam_and_ensemble_predict generates plots in ../static relative to deepfake_detection.py
        # Since main.py is in backend/, we need to ensure paths match.
        result = generate_gradcam_and_ensemble_predict(None, str(temp_path))

        # Cleanup original upload (optional, keeping for 1 hour could be better but simple cleanup for now)
        # os.remove(temp_path)

        return result

    except Exception as e:
        logger.error(f"Image analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/video")
async def analyze_video_endpoint(file: UploadFile = File(...)):
    """
    Performs hybrid video deepfake analysis using per-frame CNNs, BiLSTM temporal features, and Quality forensics.
    """
    if not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a video.")

    file_id = str(uuid.uuid4())
    ext = Path(file.filename).suffix
    temp_path = UPLOAD_DIR / f"{file_id}{ext}"

    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Run Analysis
        result = video_analyzer.analyze_video(str(temp_path))

        return result

    except Exception as e:
        logger.error(f"Video analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

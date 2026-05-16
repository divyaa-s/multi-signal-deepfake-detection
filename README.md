<p align="center">
  <img src="https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/PyTorch-2.x-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white" />
  <img src="https://img.shields.io/badge/FastAPI-0.135-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
  <img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" />
</p>

# 🛡️ DeepFocus — Multi-Modal Deepfake Detection System

**DeepFocus** is an end-to-end deepfake detection platform that combines a **4-model CNN ensemble**, **BiLSTM temporal analysis**, **frequency-domain forensics**, and a **meta-learner fusion layer** to classify images and videos as real or AI-generated. It ships with a clinical-grade **Next.js forensic dashboard** and a **FastAPI** backend for real-time analysis.

> Built as a Major Project for academic research in AI-powered media forensics.

---

## 📋 Table of Contents

- [Architecture Overview](#-architecture-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Usage](#-usage)
- [Detection Pipeline](#-detection-pipeline)
  - [Image Analysis](#image-analysis-pipeline)
  - [Video Analysis](#video-analysis-pipeline)
- [Models](#-models)
- [Frontend Dashboard](#-frontend-dashboard)
- [API Endpoints](#-api-endpoints)
- [Screenshots](#-screenshots)
- [Acknowledgements](#-acknowledgements)

---

## 🏗 Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                     Next.js Frontend Dashboard                   │
│         Upload → Analyze → Forensic Report + PDF Export          │
└────────────────────────────┬─────────────────────────────────────┘
                             │ REST API
┌────────────────────────────▼─────────────────────────────────────┐
│                      FastAPI Backend (main.py)                   │
│                 /analyze/image    /analyze/video                 │
└──────┬─────────────────────────────────────────┬─────────────────┘
       │                                         │
┌──────▼──────────────┐              ┌───────────▼────────────────┐
│  IMAGE PIPELINE     │              │  VIDEO PIPELINE            │
│  deepfake_detection │              │  hybrid_vid_improved.py    │
│  .py                │              │                            │
│                     │              │  ┌────────────────────┐    │
│  ┌───────────────┐  │              │  │ Temporal Analyzer  │    │
│  │ 4-CNN Ensemble│  │              │  │ (Blink, Flow,      │    │
│  │ EfficientNet  │  │              │  │  Landmark Jitter)  │    │
│  │ Xception      │  │              │  └────────────────────┘    │
│  │ ViT-Small     │  │              │  ┌────────────────────┐    │
│  │ ConvNeXt      │  │              │  │ BiLSTM Temporal    │    │
│  └───────┬───────┘  │              │  │ (Optical Flow RNN) │    │
│          │          │              │  └────────────────────┘    │
│  ┌───────▼───────┐  │              │  ┌────────────────────┐    │
│  │ Watermark     │  │              │  │ Quality Forensics  │    │
│  │ Detection     │  │              │  │ (DCT, Color, Edge) │    │
│  │ (DCT + SVM)   │  │              │  └────────────────────┘    │
│  └───────┬───────┘  │              │  ┌────────────────────┐    │
│          │          │              │  │ 4-CNN Ensemble     │    │
│  ┌───────▼───────┐  │              │  │ (per-keyframe)     │    │
│  │ Meta-Learner  │  │              │  └────────┬───────────┘    │
│  │ (Stacking     │  │              │           │               │
│  │  Ensemble)    │  │              │  ┌────────▼───────────┐    │
│  └───────────────┘  │              │  │ Meta-Learner       │    │
│                     │              │  │ (LogReg Fusion)    │    │
└─────────────────────┘              │  └────────────────────┘    │
                                     └────────────────────────────┘
```

---

## ✨ Key Features

| Feature | Description |
|---|---|
| **4-Model CNN Ensemble** | EfficientNet-B3, Xception, ViT-Small, ConvNeXt-Small — each fine-tuned on deepfake datasets |
| **BiLSTM Temporal Branch** | Optical-flow-based Bidirectional LSTM that detects unnatural motion in videos |
| **Temporal Consistency Analyzer** | Blink detection, optical flow analysis, and facial landmark stability tracking |
| **Quality Forensics** | Sharpness mismatch, frequency analysis, edge anomaly, compression artifact, DCT anomaly, and color inconsistency detection |
| **Watermark / Frequency Detection** | DCT mid-frequency feature extraction + SVM classifier for AI watermark artifacts |
| **Meta-Learner Fusion** | Stacking ensemble (Logistic Regression / XGBoost) that fuses all signals into a final prediction |
| **GradCAM Visualization** | Spatial attention heatmaps showing which image regions triggered the detection |
| **Forensic Dashboard** | Premium Next.js UI with radar plots, bar charts, signal breakdowns, and PDF report export |
| **Analysis History** | LocalStorage-backed forensic log with export to JSON |
| **Single-Pass Frame Extraction** | Optimized video decoding — reads the video exactly once for both CNN and BiLSTM branches |

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Python 3.10+** | Core language |
| **PyTorch 2.x** | Deep learning framework |
| **timm** | Pre-trained model zoo (EfficientNet, Xception, ViT, ConvNeXt) |
| **FastAPI** | REST API server |
| **OpenCV** | Video processing, optical flow, face detection (Haar Cascade) |
| **facenet-pytorch** | MTCNN face detection |
| **pytorch-grad-cam** | GradCAM visualization |
| **scikit-learn** | Meta-learner training and inference |
| **XGBoost** | Ensemble boosting for meta-learner |
| **joblib** | Model serialization |
| **Matplotlib** | Radar plots and bar chart generation |

### Frontend
| Technology | Purpose |
|---|---|
| **Next.js 16** | React framework |
| **TypeScript** | Type safety |
| **Tailwind CSS 4** | Styling |
| **Framer Motion** | Animations and transitions |
| **Lucide React** | Icon library |
| **jsPDF + modern-screenshot** | PDF report export |

---

## 📁 Project Structure

```
deepfocus/
├── backend/
│   ├── main.py                    # FastAPI server — /analyze/image & /analyze/video
│   ├── static/                    # Generated visualizations (GradCAM, radar, bar charts)
│   └── uploads/                   # Temporary uploaded files
│
├── frontend/
│   ├── src/app/page.tsx           # Main forensic dashboard (single-page app)
│   ├── src/lib/api.ts             # API client for backend communication
│   ├── package.json               # Node.js dependencies
│   └── ...                        # Next.js config files
│
├── final/                         # Pre-trained model weights (not tracked in Git)
│   ├── convnext_finetuned_v5.pth
│   ├── efficientnet_b3_finetuned_v5.pth
│   ├── xception_finetuned_v5.pth
│   ├── vit_finetuned_v5.pth
│   ├── meta_learner_fusion.pkl
│   ├── new_watermark_classifier.pkl
│   ├── new_feature_scaler.pkl
│   └── ...
│
├── deepfake_detection.py          # Image analysis pipeline (4-CNN + Watermark + Meta-Learner)
├── hybrid_vid_improved.py         # Video analysis pipeline (CNN + BiLSTM + Temporal + Quality)
├── temporal_analysis.py           # Temporal consistency analyzer (Blink, Flow, Landmark)
├── quality_forensic.py            # Quality forensics (Sharpness, Frequency, DCT, Color)
├── dct_features.py                # DCT mid-frequency feature extraction
├── visualizer_utils.py            # GradCAM, radar plot, and bar chart generation
├── video_meta_learner_v2.pkl      # Video meta-learner model
├── run_all.ps1                    # PowerShell script to launch both servers
├── requirements.txt               # Python dependencies
└── .gitignore
```

---

## ⚙️ Installation

### Prerequisites
- **Python 3.10+** with `pip`
- **Node.js 18+** with `npm`
- **CUDA-capable GPU** (recommended, falls back to CPU)

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/deepfocus.git
cd deepfocus
```

### 2. Set Up Python Backend

```bash
# Create and activate virtual environment
python -m venv venv

# Windows
.\venv\Scripts\activate

# Linux/macOS
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Set Up Frontend

```bash
cd frontend
npm install
cd ..
```

### 4. Download Model Weights

> ⚠️ **Model weights are not included in this repository** (`.pth`, `.pkl`, `.pt` files are gitignored due to their large size).

Place the following pre-trained weights in the `final/` directory:

| File | Size | Description |
|---|---|---|
| `convnext_finetuned_v5.pth` | ~198 MB | ConvNeXt-Small fine-tuned weights |
| `efficientnet_b3_finetuned_v5.pth` | ~43 MB | EfficientNet-B3 fine-tuned weights |
| `xception_finetuned_v5.pth` | ~84 MB | Xception fine-tuned weights |
| `vit_finetuned_v5.pth` | ~87 MB | ViT-Small fine-tuned weights |
| `meta_learner_fusion.pkl` | ~1 KB | Stacking meta-learner (image pipeline) |
| `new_watermark_classifier.pkl` | ~155 MB | Watermark SVM classifier |
| `new_feature_scaler.pkl` | ~492 KB | Feature scaler for watermark pipeline |

Also place `video_meta_learner_v2.pkl` in the project root for video analysis.

---

## 🚀 Usage

### Quick Launch (Windows)

```powershell
.\run_all.ps1
```

This starts both the backend API and frontend dashboard in separate terminal windows.

### Manual Launch

**Terminal 1 — Backend:**
```bash
# From project root, with venv activated
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

### Access
- **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:8000](http://localhost:8000)
- **API Docs (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 🔬 Detection Pipeline

### Image Analysis Pipeline

```
Input Image
    │
    ├──► 4× CNN Inference (EfficientNet-B3, Xception, ViT-Small, ConvNeXt)
    │       └──► Per-model fake probability
    │
    ├──► Watermark Detection
    │       ├──► DCT mid-frequency feature extraction (8×8 blocks)
    │       ├──► Global frequency statistics (energy, variance, flatness, entropy)
    │       └──► SVM classification → watermark probability
    │
    └──► Meta-Learner Fusion (Stacking Ensemble)
            ├──► Input: [eff_b3_prob, xception_prob, vit_prob, convnext_prob, watermark_prob]
            └──► Output: Final fake probability + label
```

### Video Analysis Pipeline

```
Input Video
    │
    ├──► Single-Pass Frame Extraction (optimized decode — reads video once)
    │       ├──► CNN keyframe candidates (evenly sampled)
    │       └──► BiLSTM temporal clip frames
    │
    ├──► Temporal Consistency Analyzer
    │       ├──► Blink detection (eye brightness changes)
    │       ├──► Optical flow analysis (Farneback dense flow)
    │       └──► Facial landmark stability (normalized eye jitter)
    │
    ├──► BiLSTM Temporal Branch
    │       ├──► Optical flow feature extraction (12-dim per frame pair)
    │       ├──► Multi-clip inference (3 clips × 48 frames)
    │       └──► Attention-weighted BiLSTM → temporal fake score
    │
    ├──► Smart Keyframe Selection (MTCNN face detection + quality ranking)
    │       └──► 4× CNN Ensemble on top-N face crops
    │
    ├──► Quality Forensics Analyzer
    │       ├──► Sharpness mismatch (face vs. body Laplacian variance)
    │       ├──► Frequency mismatch (FFT high-frequency energy)
    │       ├──► Edge anomaly (Canny edge density at face boundary)
    │       ├──► Compression mismatch (JPEG blocking artifacts)
    │       ├──► DCT anomaly (mid-frequency coefficient patterns)
    │       └──► Color inconsistency (LAB color space face/boundary comparison)
    │
    └──► Meta-Learner Fusion (Logistic Regression)
            ├──► Input: [eff_b3, xception, vit, convnext, quality, flow, blink, landmark]
            └──► Output: Final fake probability + label
```

---

## 🧠 Models

### CNN Architectures

| Model | Input Size | Architecture Strength |
|---|---|---|
| **EfficientNet-B3** | 300×300 | Compression artifact detection, mobile-scale forensics |
| **Xception** | 299×299 | Depthwise separable convolutions for phase inconsistencies |
| **ViT-Small** | 224×224 | Global self-attention for long-range pixel dependencies |
| **ConvNeXt-Small** | 224×224 | Modern ConvNet for texture and geometric anomalies |

### BiLSTM Temporal Model

- **Architecture:** 2-layer Bidirectional LSTM with attention mechanism
- **Input:** 12-dimensional optical flow features per frame pair
- **Sequence Length:** 48 frames per clip, 3 clips per video
- **Features:** Flow magnitude, direction, boundary scores, spatial entropy, quadrant correlation

### Meta-Learner

- **Image pipeline:** Stacking ensemble (trained on CNN + watermark outputs)
- **Video pipeline:** Logistic Regression meta-learner (trained on CNN + temporal + quality outputs)

---

## 🖥 Frontend Dashboard

The forensic dashboard provides:

- **Drag-and-drop upload** for images and videos
- **Real-time analysis** with animated progress tracking
- **Verdict display** — large, clear Real/Fake classification with confidence score
- **Meta-Learner Inputs panel** — per-model signal bars with weights and status
- **Visual Diagnostics** — GradCAM heatmap, radar plot, and ensemble bar chart
- **CNN Ensemble Deep-Dive** — cross-architectural agreement analysis
- **BiLSTM Motion Forensics** (video only) — temporal inconsistency breakdown
- **Biological Sync** (video only) — blink rate and landmark jitter analysis
- **Forensic Artifacts** — DCT anomaly, sharpness mismatch, color inconsistency details
- **PDF Export** — full forensic report download
- **Analysis History** — LocalStorage log with JSON export

---

## 📡 API Endpoints

### `POST /analyze/image`

Analyze a single image for deepfake indicators.

**Request:** `multipart/form-data` with `file` field (image)

**Response:**
```json
{
  "label": "Fake",
  "confidence": 0.9523,
  "final_score": 0.9523,
  "gradcam_url": "/static/grad_cams/gradcam_Fake_0.9523_a1b2c3d4.jpg",
  "radar_url": "/static/radar_plots/radar_fake_0.9523_e5f6g7h8.png",
  "barchart_url": "/static/bar_charts/barchart_fake_0.9523_i9j0k1l2.png",
  "forensic_report": { ... },
  "ensemble_fake_probability": 0.8912,
  "watermark_probability": 0.7634,
  "decision_source": "meta_learner_stacking",
  "models": { ... }
}
```

### `POST /analyze/video`

Analyze a video for deepfake indicators using the full hybrid pipeline.

**Request:** `multipart/form-data` with `file` field (video)

**Response:**
```json
{
  "label": "Fake",
  "confidence": 0.8765,
  "final_score": 0.8765,
  "gradcam_url": "/static/grad_cams/...",
  "radar_url": "/static/radar_plots/...",
  "barchart_url": "/static/bar_charts/...",
  "forensic_report": {
    "ai_consensus": { ... },
    "motion_integrity": { ... },
    "forensic_artifacts": { ... },
    "biological_signals": { ... },
    "metadata": { ... },
    "interpretation": { ... }
  }
}
```

---

## 📸 Screenshots

> Screenshots of the dashboard can be added here after deployment.

<!-- 
![Dashboard Upload](screenshots/upload.png)
![Analysis Result](screenshots/result.png)
![Forensic Report](screenshots/report.png)
-->

---

## 🙏 Acknowledgements

- [timm](https://github.com/huggingface/pytorch-image-models) — PyTorch Image Models
- [facenet-pytorch](https://github.com/timesler/facenet-pytorch) — MTCNN face detection
- [pytorch-grad-cam](https://github.com/jacobgil/pytorch-grad-cam) — GradCAM visualization
- [FastAPI](https://fastapi.tiangolo.com/) — Modern Python web framework
- [Next.js](https://nextjs.org/) — React framework for the frontend dashboard

---

## 📄 License

This project is developed for academic purposes. See [LICENSE](LICENSE) for details.

---

<p align="center">
  <sub>Built with 🔬 by the DeepFocus Team</sub>
</p>

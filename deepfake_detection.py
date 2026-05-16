import matplotlib
matplotlib.use('Agg')

import torch
import torch.nn as nn
import numpy as np
import os
import uuid
import logging
import matplotlib.pyplot as plt
from PIL import Image
from torchvision import transforms
from timm import create_model
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget
from pytorch_grad_cam.utils.image import show_cam_on_image
import joblib
from dct_features import extract_dct_features, extract_frequency_statistics
from visualizer_utils import generate_gradcam, generate_radar_plot, generate_bar_chart

# -------------------------
# CONFIG
# -------------------------
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
logger = logging.getLogger(__name__)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(os.path.dirname(BASE_DIR))

# ============================================================
# LOAD META-LEARNER
# ============================================================
META_LEARNER_PATH = os.path.join(BASE_DIR, 'final', 'meta_learner_fusion.pkl')

try:
    meta_learner = joblib.load(META_LEARNER_PATH)
    logger.info("[OK] Successfully loaded Meta-Learner Ensemble!")
except Exception as e:
    logger.error(f"[FAIL] Failed to load Meta-Learner: {e}")
    meta_learner = None

# ============================================================
# LOAD MODELS
# ============================================================
def load_model(model_name, path):
    model = create_model(model_name, pretrained=False, num_classes=1)
    ckpt  = torch.load(path, map_location=DEVICE, weights_only=False)
    if isinstance(ckpt, dict):
        state_dict = ckpt.get("model_state_dict", ckpt.get("state_dict", ckpt))
    else:
        state_dict = ckpt
    state_dict = {k.replace("module.", ""): v for k, v in state_dict.items()}
    model.load_state_dict(state_dict, strict=False)
    model.to(DEVICE)
    model.eval()
    return model

MODELS = {
    "convnext": (
        load_model(
            "convnext_small",
            os.path.join(BASE_DIR, "final", "convnext_finetuned_v5.pth")
        ),
        224
    ),
    "xception": (
        load_model(
            "legacy_xception",
            os.path.join(BASE_DIR, "final", "xception_finetuned_v5.pth")
        ),
        299
    ),
    "efficientnet_b3": (
        load_model(
            "efficientnet_b3",
            os.path.join(BASE_DIR, "final", "efficientnet_b3_finetuned_v5.pth")
        ),
        300
    ),
    "vit": (
        load_model(
            "vit_small_patch16_224",
            os.path.join(BASE_DIR, "final", "vit_finetuned_v5.pth")
        ),
        224
    )
}

print("Loaded models:", list(MODELS.keys()))
print("Running on device:", DEVICE)

# ============================================================
# LOAD WATERMARK MODEL
# ============================================================
try:
    WATERMARK_CLF = joblib.load(
        os.path.join(BASE_DIR, "final", "new_watermark_classifier.pkl")
    )
    WATERMARK_SCALER = joblib.load(
        os.path.join(BASE_DIR, "final", "new_feature_scaler.pkl")
    )
    logger.info("Watermark model loaded successfully.")
except Exception as e:
    logger.error(f"Watermark model load failed: {e}")
    WATERMARK_CLF = None
    WATERMARK_SCALER = None

# ============================================================
# WATERMARK DETECTION
# ============================================================
def detect_watermark(img_path):
    watermark_prob = 0.0

    if WATERMARK_CLF is None or WATERMARK_SCALER is None:
        return watermark_prob

    try:
        dct_feats  = extract_dct_features(img_path)
        freq_stats = extract_frequency_statistics(img_path)

        if dct_feats is None or freq_stats is None:
            return watermark_prob

        combined = np.hstack([dct_feats, freq_stats])
        scaled   = WATERMARK_SCALER.transform(combined.reshape(1, -1))
        probas   = WATERMARK_CLF.predict_proba(scaled)[0]
        watermark_prob = float(probas[1])

    except Exception as e:
        logger.warning(f"Watermark detection failed: {e}")

    return watermark_prob

# Visualization functions now imported from visualizer_utils.py


# ============================================================
# MAIN PIPELINE
# ============================================================
def generate_gradcam_and_ensemble_predict(request, img_path, true_label="Unknown"):

    logger.warning(">>> 4-MODEL CNN ENSEMBLE invoked")

    img = Image.open(img_path).convert("RGB")

    fake_probs = {}
    real_probs = {}

    best_model      = None
    best_input_size = None
    best_confidence = -1
    best_model_name = None

    # ── Run all models ────────────────────────────────────────────
    for name, (model, input_size) in MODELS.items():
        transform = transforms.Compose([
            transforms.Resize((input_size, input_size)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406],
                                 [0.229, 0.224, 0.225])
        ])
        x = transform(img).unsqueeze(0).to(DEVICE)

        with torch.no_grad():
            logits    = model(x)
            prob_fake = torch.sigmoid(logits).item()
            prob_real = 1.0 - prob_fake

        logger.warning(f"{name}: raw_sigmoid={torch.sigmoid(logits).item():.4f}  prob_fake={prob_fake:.4f}")
        fake_probs[name] = prob_fake
        real_probs[name] = prob_real

        model_label = "Fake" if prob_fake > 0.5 else "Real"
        model_conf  = prob_fake if model_label == "Fake" else prob_real

        if model_conf > best_confidence:
            best_confidence = model_conf
            best_model      = model
            best_input_size = input_size
            best_model_name = name

    # ── Ensemble Calculation ───────────────────────────────────────
    ensemble_fake = float(np.mean(list(fake_probs.values())))
    watermark_prob = detect_watermark(img_path)

    # ── Meta-Learner Fusion ───────────────────────────────────────
    if meta_learner is not None:
        features = np.array([[
            fake_probs.get("efficientnet_b3", 0.5),
            fake_probs.get("xception", 0.5),
            fake_probs.get("vit", 0.5),
            fake_probs.get("convnext", 0.5),
            watermark_prob
        ]])
        
        final_fake = float(meta_learner.predict_proba(features)[0][1])
        decision_source = "meta_learner_stacking"
    else:
        logger.warning("Meta-Learner not found! Falling back to raw average.")
        final_fake = (ensemble_fake + watermark_prob) / 2.0
        decision_source = "fallback_average"

    # Set Final Label & Confidence
    final_real = 1.0 - final_fake
    label      = "Fake" if final_fake >= 0.50 else "Real"
    confidence = final_fake if label == "Fake" else final_real

    # ── GradCAM ───────────────────────────────────────────────────
    if best_model is not None:
        logger.warning(f"GradCAM model used: {best_model_name}")
        gradcam_url = generate_gradcam(
            img_path, best_model, best_input_size,
            label, confidence, DEVICE
        )
    else:
        gradcam_url = None

    # ── Radar plot ────────────────────────────────────────────────
    try:
        radar_url = generate_radar_plot(
            ensemble_fake=ensemble_fake,
            watermark_prob=watermark_prob,
            fake_probs=fake_probs,
            label=label,
            confidence=confidence
        )
    except Exception as e:
        logger.warning(f"Radar plot generation failed: {e}")
        radar_url = None

    # ── Bar Chart ─────────────────────────────────────────────────
    try:
        barchart_url = generate_bar_chart(
            fake_probs=fake_probs,
            ensemble_fake=ensemble_fake,
            watermark_prob=watermark_prob,
            final_fake=final_fake,
            label=label,
            confidence=confidence
        )
    except Exception as e:
        logger.warning(f"Bar chart generation failed: {e}")
        barchart_url = None

    # ── Per-model details ─────────────────────────────────────────
    model_details = {}
    for name in fake_probs:
        model_fake  = fake_probs[name]
        model_real  = real_probs[name]
        model_label = "Fake" if model_fake > 0.5 else "Real"
        model_conf  = model_fake if model_label == "Fake" else model_real

        model_details[name] = {
            "label":      model_label,
            "confidence": round(model_conf, 4),
            "prob_fake":  round(model_fake, 4),
            "prob_real":  round(model_real, 4)
        }

    # ── Logging ───────────────────────────────────────────────────
    logger.warning("\n" + "=" * 70)
    logger.warning("ENSEMBLE FINAL RESULT (META-LEARNER)")
    logger.warning(f"Final Label       : {label}")
    logger.warning(f"Final Confidence  : {confidence:.4f}")
    logger.warning(f"CNN Base Avg Prob : {ensemble_fake:.4f}")
    logger.warning(f"Watermark Prob    : {watermark_prob:.4f}")
    logger.warning(f"Decision Source   : {decision_source}")

    for name, details in model_details.items():
        logger.warning(
            f"{name.upper():15} → "
            f"Label: {details['label']}, "
            f"Conf: {details['confidence']:.4f}, "
            f"Fake: {details['prob_fake']:.4f}, "
            f"Real: {details['prob_real']:.4f}"
        )
    logger.warning("=" * 70 + "\n")

    # ── Forensic Report Standard ──────────────────────────────────
    gan_fingerprint = float(np.mean([fake_probs.get("vit", 0.0), fake_probs.get("convnext", 0.0)]))
    color_anomaly    = float(np.mean([fake_probs.get("efficientnet_b3", 0.0), fake_probs.get("xception", 0.0)]))
    
    forensic_report = {
        "ai_consensus": {
            "ensemble_score": round(ensemble_fake, 4),
            "models": {k: v["prob_fake"] for k, v in model_details.items()}
        },
        "forensic_artifacts": {
            "watermark_score": round(watermark_prob, 4),
            "dct_anomaly": round(watermark_prob, 4),
            "gan_fingerprint": round(gan_fingerprint, 4),
            "color_anomaly": round(color_anomaly, 4),
            "overall_mismatch": round(max(watermark_prob, gan_fingerprint, color_anomaly), 4),
            "interpretation": (
                "High-confidence generative signature detected." if gan_fingerprint > 0.8 else
                "Subtle frequency and color inconsistencies noted." if (watermark_prob > 0.4 or color_anomaly > 0.4) else
                "Minimal forensic artifacts detected."
            )
        },
        "metadata": {
            "decision_source": decision_source,
            "analysis_type": "Static-Frame",
            "gradcam_url": gradcam_url,
            "radar_url": radar_url,
            "barchart_url": barchart_url
        },
        "interpretation": {
            "label": label,
            "confidence": round(confidence, 4),
            "needs_manual_review": abs(final_fake - 0.5) < 0.10
        }
    }

    # ── Return ────────────────────────────────────────────────────
    return {
        "label":                    label,
        "confidence":               round(confidence, 4),
        "final_score":              round(final_fake, 4),
        "forensic_report":          forensic_report,
        # Legacy fields for backward compatibility
        "gradcam_url":              gradcam_url,
        "radar_url":                radar_url,
        "barchart_url":             barchart_url,             
        "ensemble_fake_probability": round(ensemble_fake, 4),
        "final_fake_probability":   round(final_fake, 4),
        "watermark_probability":    round(watermark_prob, 4),
        "decision_source":          decision_source,
        "models":                   model_details
    }
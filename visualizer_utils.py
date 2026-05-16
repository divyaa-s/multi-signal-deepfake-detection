import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import os
import uuid
import torch
import torch.nn as nn
from PIL import Image
from torchvision import transforms
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget
from pytorch_grad_cam.utils.image import show_cam_on_image

# Path discovery
# This file (visualizer_utils.py) is in the ROOT: D:\Projects\Major Project\test folder\
SELF_DIR = os.path.dirname(os.path.abspath(__file__))

# Always target the backend/static folder
# If we are already in the backend folder, STATIC_BASE is SELF_DIR/static
# If we are in root, STATIC_BASE is SELF_DIR/backend/static
if os.path.basename(SELF_DIR) == "backend":
    STATIC_BASE = os.path.join(SELF_DIR, "static")
else:
    STATIC_BASE = os.path.join(SELF_DIR, "backend", "static")

# Ensure it exists
os.makedirs(STATIC_BASE, exist_ok=True)

def generate_gradcam(img_path, model, input_size, predicted_label, confidence, device="cpu"):
    target_layer = None
    for name, m in reversed(list(model.named_modules())):
        if isinstance(m, nn.Conv2d):
            target_layer = m
            break

    if target_layer is None:
        return None

    img_pil = Image.open(img_path).convert("RGB")

    transform = transforms.Compose([
        transforms.Resize((input_size, input_size)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225])
    ])

    x = transform(img_pil).unsqueeze(0).to(device)

    with GradCAM(model=model, target_layers=[target_layer]) as cam:
        grayscale_cam = cam(
            input_tensor=x,
            targets=[ClassifierOutputTarget(0)]
        )[0]

    img_resized   = np.array(img_pil.resize((input_size, input_size))).astype(np.float32) / 255.0
    visualization = show_cam_on_image(img_resized, grayscale_cam, use_rgb=True)

    output_dir = os.path.join(STATIC_BASE, "grad_cams")
    os.makedirs(output_dir, exist_ok=True)

    filename  = f"gradcam_{predicted_label}_{confidence:.4f}_{uuid.uuid4().hex[:8]}.jpg"
    save_path = os.path.join(output_dir, filename)
    Image.fromarray(visualization).save(save_path)

    return f"/static/grad_cams/{filename}"

def generate_radar_plot(ensemble_fake, watermark_prob, fake_probs, label, confidence):
    gan_fingerprint = float(np.mean([
        fake_probs.get("vit", 0.0),
        fake_probs.get("convnext", 0.0),
    ]))
    frequency    = float(watermark_prob)
    cnn_ensemble = float(ensemble_fake)
    color_anomaly = float(np.mean([
        fake_probs.get("efficientnet_b3", 0.0),
        fake_probs.get("xception", 0.0),
    ]))

    categories  = ["GAN Fingerprint", "Frequency", "CNN Ensemble", "Color Anomaly"]
    values      = [gan_fingerprint, frequency, cnn_ensemble, color_anomaly]
    N           = len(categories)

    values_plot = values + [values[0]]
    angles      = [n / float(N) * 2 * np.pi for n in range(N)]
    angles     += angles[:1]

    fig, ax = plt.subplots(figsize=(5, 5), subplot_kw=dict(polar=True))
    fig.patch.set_facecolor("#ffffff")
    ax.set_facecolor("#f9f9f9")

    ref_values = [1.0] * N + [1.0]
    ax.plot(angles, ref_values, color="#cccccc", linewidth=1, linestyle="--")
    ax.fill(angles, ref_values, color="#e8e8e8", alpha=0.3)

    color = "#cc0000" if label == "Fake" else "#007700"
    ax.plot(angles, values_plot, color=color, linewidth=2.5)
    ax.fill(angles, values_plot, color=color, alpha=0.20)

    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(categories, size=11, fontweight="bold")
    ax.set_yticks([0.2, 0.4, 0.6, 0.8, 1.0])
    ax.set_yticklabels(["0.2", "0.4", "0.6", "0.8", "1.0"], size=7, color="#888888")
    ax.set_ylim(0, 1.0)
    ax.grid(color="#cccccc", linestyle="--", linewidth=0.6, alpha=0.7)
    ax.spines["polar"].set_visible(False)

    ax.set_title(
        f"Signal Profile — {label} ({confidence * 100:.1f}%)",
        size=13, fontweight="bold", pad=20, color=color
    )

    for angle, val in zip(angles[:-1], values):
        ax.annotate(
            f"{val:.2f}",
            xy=(angle, val),
            xytext=(angle, val + 0.08),
            ha="center", va="center",
            fontsize=8, color=color, fontweight="bold"
        )

    plt.tight_layout()

    output_dir = os.path.join(STATIC_BASE, "radar_plots")
    os.makedirs(output_dir, exist_ok=True)

    filename  = f"radar_{label.lower()}_{confidence:.4f}_{uuid.uuid4().hex[:8]}.png"
    save_path = os.path.join(output_dir, filename)
    plt.savefig(save_path, dpi=120, bbox_inches="tight", facecolor=fig.get_facecolor())
    plt.close(fig)

    return f"/static/radar_plots/{filename}"

def generate_bar_chart(fake_probs, ensemble_fake, watermark_prob, final_fake, label, confidence):
    categories = ['Final', 'Forensic', 'CNN ens.', 'vit', 'convnext', 'xception', 'eff_b3']
    values = [
        final_fake,
        watermark_prob,
        ensemble_fake,
        fake_probs.get('vit', 0.0),
        fake_probs.get('convnext', 0.0),
        fake_probs.get('xception', 0.0),
        fake_probs.get('efficientnet_b3', 0.0)
    ]
    colors = ['#3498db', '#e74c3c', '#e67e22', '#2980b9', '#2980b9', '#2980b9', '#2980b9']

    fig, ax = plt.subplots(figsize=(7, 4))
    bars = ax.barh(categories, values, color=colors, height=0.5)
    ax.set_xlim(0, 1.05)
    ax.set_xlabel("Fake probability / score", fontsize=10)
    title_color = "#cc0000" if label == "Fake" else "#007700"
    ax.set_title(f"Deepfake Analysis - {label} ({confidence * 100:.1f}%)", fontsize=12, pad=15, color=title_color, fontweight="bold")
    ax.grid(axis='x', linestyle='--', alpha=0.7)
    ax.invert_yaxis()

    for bar, val in zip(bars, values):
        ax.text(val + 0.02, bar.get_y() + bar.get_height()/2, f'{val:.3f}', 
                va='center', ha='left', fontsize=9, color='#333333', fontweight='bold')

    plt.tight_layout()
    output_dir = os.path.join(STATIC_BASE, "bar_charts")
    os.makedirs(output_dir, exist_ok=True)

    filename  = f"barchart_{label.lower()}_{confidence:.4f}_{uuid.uuid4().hex[:8]}.png"
    save_path = os.path.join(output_dir, filename)
    plt.savefig(save_path, dpi=120, bbox_inches="tight")
    plt.close(fig)

    return f"/static/bar_charts/{filename}"

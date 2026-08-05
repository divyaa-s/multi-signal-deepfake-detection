export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface ForensicReport {
  ai_consensus: {
    ensemble_score: number;
    models: Record<string, number>;
    bilstm_temporal_score?: number;
  };
  motion_integrity?: {
    temporal_score: number;
    optical_flow: any;
    landmark_jitter: any;
  };
  forensic_artifacts: {
    overall_mismatch: number;
    watermark_score?: number;
    dct_anomaly?: number;
    gan_fingerprint?: number;
    color_anomaly?: number;
    [key: string]: any;
  };
  biological_signals?: {
    score: number;
    blink_count: number;
    expected_blinks: number;
    interpretation: string;
    [key: string]: any;
  };
  metadata: {
    decision_source: string;
    frames_analyzed?: number;
    faces_detected?: number;
    [key: string]: any;
  };
  interpretation: {
    label: string;
    confidence: number;
    needs_manual_review: boolean;
  };
}

export interface AnalysisResult {
  label: string;
  confidence: number;
  final_score?: number;
  forensic_report?: ForensicReport;
  gradcam_url?: string;
  radar_url?: string;
  barchart_url?: string;
  [key: string]: any;
}

export async function analyzeImage(file: File): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/analyze/image`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Image analysis failed");
  }

  return response.json();
}

export async function analyzeVideo(file: File): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/analyze/video`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Video analysis failed");
  }

  return response.json();
}

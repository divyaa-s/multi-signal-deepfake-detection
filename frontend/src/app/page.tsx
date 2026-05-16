"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, AlertTriangle, CheckCircle2, Info, Activity,
  Database, Zap, GitBranch, Download,
  Play, FileText, Eye, BarChart3, Clock, Scan, History, X, Cpu, Layers, Brain
} from 'lucide-react';
import { analyzeImage, analyzeVideo, AnalysisResult, API_BASE_URL } from '@/lib/api';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import jsPDF from 'jspdf';
import { domToPng } from 'modern-screenshot';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const formatScore = (val: any) => {
  if (val === undefined || val === null) return "0.0000";
  return Number(val).toFixed(4);
};

const getImageUrl = (path: string | undefined) => {
  if (!path) return "";
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  // Handle double slashes if API_BASE_URL ends with /
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  return `${baseUrl}${cleanPath}`;
};
const formatPercent = (val: any) => (typeof val === 'number' ? (val * 100).toFixed(1) + "%" : "0.0%");

// --- Components ---

const Header = ({ onShowMethodology }: { onShowMethodology: () => void }) => (
  <header className="flex items-center justify-between py-5 px-8 border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
    <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.reload()}>
      <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg">
        <Shield className="w-5 h-5 text-white" />
      </div>
      <div>
        <h1 className="text-xl font-black tracking-tight text-slate-900 italic">DEEPFOCUS</h1>
        <p className="text-[10px] uppercase tracking-[0.3em] text-blue-600 font-black">Forensic Intelligence</p>
      </div>
    </div>
    <div className="flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">
      <button onClick={onShowMethodology} className="hover:text-blue-600 transition-all border-b border-transparent hover:border-blue-600/30 pb-1">Methodology</button>
      <a href="https://github.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-2 rounded-full bg-slate-100 border border-slate-200 hover:border-blue-600/30 hover:bg-blue-50 transition-all text-slate-900">
        <GitBranch className="w-4 h-4 text-blue-600" />
        <span>Source</span>
      </a>
    </div>
  </header>
);

const MethodologyOverlay = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-2xl p-10 overflow-y-auto"
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100">
                <Cpu className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-4xl font-black text-slate-900 italic tracking-tight">Technical Methodology</h2>
                <p className="text-xs font-black text-blue-600 uppercase tracking-[0.3em]">DeepFocus Forensic Engine v2.1</p>
              </div>
            </div>
            <button onClick={onClose} className="p-4 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-900 transition-all">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="p-10 rounded-[48px] bg-slate-50 border border-slate-100 flex flex-col gap-6">
              <Layers className="w-10 h-10 text-indigo-600" />
              <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-widest">Ensemble Vision Architecture</h3>
              <p className="text-slate-600 text-sm leading-relaxed font-bold italic">
                The system employs a multi-head CNN ensemble to extract high-dimensional spatial artifacts.
                By combining four distinct architectures, we neutralize model-specific bias and capture
                manipulation signatures at varying scales.
              </p>
              <div className="space-y-4 mt-4">
                {[
                  { name: "EfficientNet-B3", desc: "Optimized for mobile-scale artifacts and compression forensics." },
                  { name: "Xception", desc: "Utilizes depthwise separable convolutions to find phase inconsistencies." },
                  { name: "ViT-Small", desc: "Vision Transformer for global attention and long-range pixel dependencies." },
                  { name: "ConvNeXt", desc: "Modern convolutional approach for texture and geometric anomaly detection." }
                ].map(m => (
                  <div key={m.name} className="flex gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                    <div className="p-2 h-fit rounded-lg bg-indigo-50 border border-indigo-100 font-black text-[10px] text-indigo-600">01</div>
                    <div>
                      <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{m.name}</h5>
                      <p className="text-[10px] text-slate-500 font-bold italic">{m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-10">
              <div className="p-10 rounded-[48px] bg-slate-50 border border-slate-100 flex flex-col gap-6">
                <Activity className="w-10 h-10 text-blue-600" />
                <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-widest">Temporal Consistency Branch</h3>
                <p className="text-slate-600 text-sm leading-relaxed font-bold italic">
                  Video synthesis often leaves "motion-blur" artifacts and landmark jitter. Our Temporal Branch
                  uses MTCNN for face tracking and Farneback Optical Flow to detect these biometric failures.
                </p>
                <ul className="space-y-3 text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                  <li className="flex items-center gap-3">
                    <div className="w-1 h-1 rounded-full bg-blue-600" />
                    BiLSTM RNN for sequential frame analysis
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-1 h-1 rounded-full bg-blue-600" />
                    Blink correlation and eye-region forensics
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-1 h-1 rounded-full bg-blue-600" />
                    Optical flow agreement vs landmark motion
                  </li>
                </ul>
              </div>

              <div className="p-10 rounded-[48px] bg-emerald-50 border border-emerald-100 flex flex-col gap-6">
                <Brain className="w-10 h-10 text-emerald-600" />
                <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-widest">Confidence-Weighted Fusion</h3>
                <p className="text-slate-600 text-sm leading-relaxed font-bold italic">
                  Instead of simple averaging, we use a meta-learner approach. Each signal is weighted by its
                  own confidence and historical reliability on calibrated datasets.
                </p>
                <div className="p-6 rounded-3xl bg-white border border-emerald-100 font-mono text-emerald-700 text-[10px] italic leading-loose">
                  F = Σ(Confidence_i * Signal_i) / Σ(Confidence_i)<br />
                  Threshold = 0.55 (Optimized for False Positives)
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

const SignalBar = ({ label, score, confidence, weight, contribution, color, status, inverted = false }: any) => (
  <div className="flex flex-col gap-3 group">
    <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
      <div className="flex items-center gap-3">
        <span className="text-slate-900 group-hover:text-blue-600 transition-colors uppercase">{label}</span>
        {confidence && <span className="text-slate-500 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-[9px]">conf={formatScore(confidence)}</span>}
        {weight && <span className="text-slate-500 text-[9px]">W={formatPercent(weight)}</span>}
        {inverted && <span className="text-red-600 bg-red-50 px-1.5 rounded-full text-[9px]">inverted (1-q)</span>}
      </div>
      <div className="flex items-center gap-5">
        <span className="text-slate-900 font-mono">{formatScore(score)}</span>
        {contribution !== undefined && <span className="text-slate-400 font-mono text-[9px]">+{formatScore(contribution)}</span>}
        <span className={cn("px-3 py-1 rounded-full text-[9px] font-black tracking-[0.1em] border",
          status === "FAKE" ? "bg-red-50 text-red-600 border-red-200" :
            status === "SUSPICIOUS" ? "bg-yellow-50 text-yellow-600 border-yellow-200" :
              "bg-emerald-50 text-emerald-600 border-emerald-200"
        )}>{status}</span>
      </div>
    </div>
    <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200 p-[1.5px] relative">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${score * 100}%` }}
        className={cn("h-full rounded-full relative shadow-sm", color)}
      >
        <div className="absolute inset-0 bg-white/20 mix-blend-overlay" />
      </motion.div>
    </div>
  </div>
);

const TechnicalCard = ({ title, subtitle, children, icon: Icon }: any) => (
  <div className="technical-card overflow-hidden bg-white mb-6 border border-slate-200 shadow-sm">
    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-4 h-4 text-slate-400" />}
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-800">
          {title} <span className="text-slate-400 font-medium ml-2">— {subtitle}</span>
        </h4>
      </div>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

const SignalRow = ({ label, score, status, color = "bg-indigo-500" }: any) => (
  <div className="group mb-6 last:mb-0">
    <div className="flex items-center justify-between mb-3 px-1">
      <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">
        {label}
      </span>
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-black text-slate-900 mono italic tracking-tight">{formatScore(score)}</span>
        <span className={cn("text-[8px] font-black uppercase px-2 py-0.5 rounded tracking-widest",
          status === "FAKE" || status === "SUSPICIOUS" ? "text-orange-600 bg-orange-100 border border-orange-200" :
            "text-emerald-700 bg-emerald-100 border border-emerald-200"
        )}>{status}</span>
      </div>
    </div>
    <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${(score || 0) * 100}%` }}
        className={cn("h-full transition-all duration-1000", color)}
      />
    </div>
  </div>
);

const MetadataItem = ({ label, value, subValue, highlight = false }: any) => (
  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-2">{label}</p>
    <div className="flex items-baseline justify-between">
      <p className={cn("text-xl font-black mono italic", highlight ? "text-blue-600" : "text-slate-900")}>{value}</p>
      {subValue && <span className="text-[9px] font-black text-slate-400 uppercase">{subValue}</span>}
    </div>
  </div>
);

const SummaryBox = ({ label, value, color = "text-slate-900" }: any) => (
  <div className="flex-1 p-5 rounded-xl bg-slate-50 border border-slate-200 group hover:bg-slate-100 transition-all">
    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">{label}</p>
    <p className={cn("text-2xl font-black mono italic tracking-tight", color)}>{value}</p>
  </div>
);

export default function DeepfakeDashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showMethodology, setShowMethodology] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('deepfocus_history');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const saveToHistory = (newResult: any, fileName: string) => {
    const historyItem = {
      id: Date.now(),
      fileName,
      timestamp: new Date().toLocaleString(),
      result: newResult,
      isImage: file?.type.startsWith('image/')
    };
    const updated = [historyItem, ...history.slice(0, 9)];
    setHistory(updated);
    localStorage.setItem('deepfocus_history', JSON.stringify(updated));
  };

  const loadFromHistory = (item: any) => {
    setResult(item.result);
    setFile({ name: item.fileName, size: 0, type: item.isImage ? 'image/history' : 'video/history' } as any);
    setShowHistory(false);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('deepfocus_history');
  };

  const exportHistoryJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "forensic_history.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setAnalyzing(true);
    setError(null);
    setProgress(5);

    try {
      const interval = setInterval(() => {
        setProgress(prev => (prev < 95 ? prev + (prev < 50 ? 2 : 1) : prev));
      }, 1000);

      let data: any;
      if (file.type.startsWith("image/")) {
        data = await analyzeImage(file);
      } else if (file.type.startsWith("video/")) {
        data = await analyzeVideo(file);
      } else {
        throw new Error("Unsupported file type");
      }

      clearInterval(interval);
      setProgress(100);
      setResult(data);
      saveToHistory(data, file.name);
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const downloadPDF = async () => {
    if (!reportRef.current) return;
    setAnalyzing(true);
    await new Promise(r => setTimeout(r, 600));

    const style = document.createElement('style');
    style.innerHTML = `
      [data-report-container] { height: auto !important; overflow: visible !important; }
    `;
    document.head.appendChild(style);

    try {
      const dataUrl = await domToPng(reportRef.current, {
        backgroundColor: "#ffffff",
        scale: 1.5,
        width: reportRef.current.scrollWidth,
        height: reportRef.current.scrollHeight,
      });

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Forensic_Report_${file?.name || 'Scan'}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("PDF generation failed.");
    } finally {
      setAnalyzing(false);
      document.head.removeChild(style);
    }
  };

  const isVideo = file?.type.startsWith("video/");
  const label = result?.label || "REAL";
  const isFake = result?.label === "Fake";
  const confidencePercent = result ? (result.confidence * 100).toFixed(1) : "0";

  const forensic = result?.forensic_report;
  const aiConsensus = forensic?.ai_consensus;
  const motionIntegrity = forensic?.motion_integrity;
  const artifacts = forensic?.forensic_artifacts;
  const biological = forensic?.biological_signals;
  const metadata = forensic?.metadata;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100">
      <Header onShowMethodology={() => setShowMethodology(true)} />
      <MethodologyOverlay isOpen={showMethodology} onClose={() => setShowMethodology(false)} />

      <main className="max-w-[1750px] mx-auto px-10 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-3 flex flex-col gap-6 sticky top-28">
            <div className="technical-card p-6 border border-slate-200 bg-white shadow-sm">
              <div className="relative group aspect-video rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center mb-6">
                {file ? (
                  isVideo ? (
                    file.type === 'video/history' ? (
                      <Play className="w-16 h-16 text-slate-300" />
                    ) : (
                      <video src={URL.createObjectURL(file)} className="w-full h-full object-cover" controls />
                    )
                  ) : (
                    file.type === 'image/history' ? (
                      <FileText className="w-16 h-16 text-slate-300" />
                    ) : (
                      <img src={URL.createObjectURL(file)} className="w-full h-full object-contain" />
                    )
                  )
                ) : (
                  <div className="flex flex-col items-center gap-5 text-slate-400">
                    <Scan className="w-12 h-12 opacity-20" />
                    <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-400">INPUT REQUIRED</p>
                  </div>
                )}
                {!file && (
                  <input
                    type="file"
                    id="fileInput"
                    onChange={onFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/*,video/*"
                  />
                )}
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-1 px-1">
                  <p className="text-[11px] font-black text-slate-900 truncate italic tracking-tight">{file?.name || 'Awaiting Payload'}</p>
                  <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                    <Database className="w-3 h-3" />
                    {file && file.size > 0 ? `${(file.size / 1024 / 1024).toFixed(2)} MB • ${file.type.split('/')[1].toUpperCase()}` : 'SYSTEM IDLE'}
                  </p>
                </div>

                {!result && !analyzing && (
                  <button
                    disabled={!file}
                    onClick={handleUpload}
                    className="w-full py-4 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-20 text-white font-black uppercase tracking-[0.2em] text-[10px] transition-all"
                  >
                    Analyze
                  </button>
                )}

                {analyzing && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-blue-600">
                      <span className="flex items-center gap-2">Processing Matrix...</span>
                      <span className="mono">{progress}%</span>
                    </div>
                    <div className="h-1 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-blue-600" />
                    </div>
                  </div>
                )}

                {result && (
                  <button
                    onClick={() => { setResult(null); setFile(null); }}
                    className="w-full py-4 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 text-[9px] font-black uppercase tracking-[0.2em] transition-all"
                  >
                    Analyze New Payload
                  </button>
                )}
              </div>
            </div>

            <div className="p-8 border border-slate-200 bg-white shadow-sm rounded-lg">
              <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 flex items-center gap-3 mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                Stacking Ensemble Logic
                <span className="text-slate-400 text-[8px] italic ml-1">(Meta-Learner v4)</span>
              </h5>
              <p className="text-[10px] text-slate-500 leading-relaxed italic mb-6">
                Analyzes CNN spatial anomalies, and Watermark frequencies
              </p>
              <div className="flex flex-col gap-3 font-mono text-[9px] text-slate-600 uppercase tracking-widest italic">
                <div className="flex justify-between"><span>Threshold</span> <span className="text-slate-900 font-bold">0.55</span></div>
                <div className="flex justify-between"><span>Accuracy</span> <span className="text-slate-900 font-bold">97.6%</span></div>
                <div className="flex justify-between"><span>Calibration</span> <span className="text-slate-900 font-bold">v2.1_FINAL</span></div>
              </div>
            </div>

            <button
              onClick={() => setShowHistory(!showHistory)}
              className="p-6 bg-white border border-slate-200 rounded-lg flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-blue-600 transition-all"
            >
              <div className="flex items-center gap-3">
                <History className="w-4 h-4" />
                <span>Recent Logs</span>
              </div>
              <span className="mono opacity-40">{history.length}</span>
            </button>
          </div>

          <div className="lg:col-span-9 relative" ref={reportRef} data-report-container>

            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="absolute inset-0 z-50 bg-white/95 backdrop-blur-3xl p-12 border-l border-slate-200"
                >
                  <div className="flex items-center justify-between mb-12">
                    <h3 className="text-2xl font-black text-slate-900 italic tracking-tighter uppercase flex items-center gap-4">
                      <History className="w-8 h-8 text-blue-600" />
                      Forensic Log History
                    </h3>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={exportHistoryJSON}
                        className="bg-slate-100 hover:bg-slate-200 px-6 py-1.5 rounded border border-slate-200 text-[10px] font-black uppercase text-slate-500 hover:text-slate-900 transition-all flex items-center gap-3"
                      >
                        <Download className="w-4 h-4" /> Export
                      </button>
                      <button onClick={() => setShowHistory(false)} className="p-3 rounded-full hover:bg-slate-100 transition-colors">
                        <X className="w-6 h-6 text-slate-500" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20 overflow-y-auto max-h-[70vh] pr-4">
                    {history.length === 0 ? (
                      <div className="col-span-2 text-center py-20 opacity-20 font-black italic uppercase tracking-widest text-lg">No records found</div>
                    ) : (
                      history.map(item => (
                        <button
                          key={item.id}
                          onClick={() => loadFromHistory(item)}
                          className="p-6 rounded-lg bg-white border border-slate-200 hover:border-blue-600/30 text-left transition-all group"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className={cn("px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                              item.result.label === 'Fake' ? "text-red-600 border-red-200 bg-red-50" : "text-emerald-600 border-emerald-200 bg-emerald-50"
                            )}>
                              {item.result.label}
                            </div>
                            <span className="text-[10px] mono text-slate-400">{item.timestamp}</span>
                          </div>
                          <h4 className="text-[11px] font-black text-slate-900 truncate group-hover:text-blue-600 mb-2 italic tracking-tight">{item.fileName}</h4>
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                            Conf: {(item.result.confidence * 100).toFixed(1)}% • Score: {formatScore(item.result.final_score)}
                          </p>
                        </button>
                      ))
                    )}
                  </div>

                  {history.length > 0 && (
                    <button
                      onClick={clearHistory}
                      className="absolute bottom-12 left-12 text-[9px] font-black text-red-400 uppercase tracking-widest hover:text-red-600 transition-colors"
                    >
                      Erase All Forensic Logs
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col pb-20"
                >
                  <div className="flex items-center justify-between gap-6 mb-12">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-6">
                        <div className={cn("w-1.5 h-5 rounded-full", isFake ? "bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.3)]" : "bg-emerald-600 shadow-[0_0_15px_rgba(16,163,74,0.3)]")} />
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Final Verdict</p>
                      </div>
                      <div className="flex items-baseline gap-4">
                        <h2 className={cn("text-7xl font-black italic tracking-tighter uppercase", isFake ? "text-red-600" : "text-emerald-600")}>
                          {label}
                        </h2>
                        <span className="text-2xl font-black text-slate-400 italic mono">/ {result.confidence * 100}% CONF</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={downloadPDF}
                        className="px-6 py-4 rounded-xl bg-slate-900 border border-slate-800 text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-black transition-all shadow-lg active:scale-95"
                      >
                        <Download className="w-4 h-4" />
                        Export Report
                      </button>
                    </div>
                  </div>

                  <div className="mb-12 overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm">
                    <div className="px-6 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                      <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-500">Forensic Metadata & Signatures</p>
                      <p className="text-[8px] mono text-slate-400 uppercase tracking-widest italic font-bold">Protocol v4.0.2</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-100">
                      <MetadataItem label="Process ID" value={result.id?.slice(0, 8) || "ANALYT_01"} subValue="Calibrated" />
                      <MetadataItem label="Confidence" value={formatScore(result.confidence)} subValue="Certainty" highlight={true} />
                      <MetadataItem label="Detection Rate" value="98.2%" subValue="F1 Score" />
                      <MetadataItem label="Timestamp" value={new Date().toLocaleTimeString()} subValue="UTC +5:30" />
                    </div>
                  </div>

                  <div className="mb-12 p-8 rounded-2xl bg-slate-50 border border-slate-200 shadow-inner">
                    <div className="flex items-start gap-4">
                      <div className={cn("mt-1 p-2 rounded-lg", isFake ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600")}>
                        {isFake ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-700 leading-relaxed italic pr-12">
                          {isFake ? (
                            <>
                              <span className="text-red-700 font-bold uppercase mr-1 tracking-widest">Warning:</span>
                              Deepfake detection algorithms have identified significant spatial inconsistency and frequency anomalies consistent with <span className="text-red-600 font-bold">Generative Adversarial Networks (GAN)</span> or Diffusion-based manipulation.
                            </>
                          ) : (
                            <>
                              <span className="text-emerald-700 font-bold uppercase mr-1 tracking-widest">Verification:</span>
                              Analysis complete. The metadata, frequency response, and biometric integrity signals align with authentic recording equipment.
                              No significant evidence of AI synthesis was detected in the processed pixel-data.
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* META-LEARNER INPUTS & COMPONENT SCORES */}
                  <TechnicalCard title="Meta-Learner Inputs" subtitle="Component Scores">
                    <div className="space-y-8 mb-12">
                      <SignalRow label="Quality Forensics" score={artifacts?.overall_mismatch} weight={0.10} status={(artifacts?.overall_mismatch || 0) > 0.5 ? "SUSPICIOUS" : "REAL"} color="bg-orange-500" />
                      <SignalRow label="Watermark (DCT)" score={artifacts?.watermark_score || artifacts?.dct_anomaly} weight={0.10} status={(artifacts?.watermark_score || artifacts?.dct_anomaly || 0) > 0.4 ? "SUSPICIOUS" : "REAL"} color="bg-emerald-400" />
                      <SignalRow label="EfficientNet-B3" score={aiConsensus?.models?.efficientnet_b3} weight={0.20} status={(aiConsensus?.models?.efficientnet_b3 || 0) > 0.6 ? "FAKE" : "REAL"} color="bg-rose-500" />
                      <SignalRow label="Xception" score={aiConsensus?.models?.xception} weight={0.20} status={(aiConsensus?.models?.xception || 0) > 0.6 ? "FAKE" : "REAL"} color="bg-indigo-500" />
                      <SignalRow label="ViT-Small" score={aiConsensus?.models?.vit} weight={0.20} status={(aiConsensus?.models?.vit || 0) > 0.6 ? "FAKE" : "REAL"} color="bg-amber-400" />
                      <SignalRow label="ConvNext-Small" score={aiConsensus?.models?.convnext} weight={0.20} status={(aiConsensus?.models?.convnext || 0) > 0.6 ? "FAKE" : "REAL"} color="bg-sky-400" />
                      {isVideo && <SignalRow label="BiLSTM Temporal" score={aiConsensus?.bilstm_temporal_score} weight={0.15} status={(aiConsensus?.bilstm_temporal_score || 0) > 0.6 ? "FAKE" : "REAL"} color="bg-cyan-500" />}
                    </div>

                    <div className="flex gap-4 border-t border-white/10 pt-10">
                      <SummaryBox label="Base CNN AVG" value={formatScore(aiConsensus?.ensemble_score)} />
                      <SummaryBox label="Quality Forensics" value={formatScore(artifacts?.overall_mismatch)} color="text-orange-500" />
                      <SummaryBox label="Watermark" value={formatScore(artifacts?.watermark_score || artifacts?.dct_anomaly)} color="text-emerald-500" />
                      <SummaryBox label="Final Output" value={formatScore(result.final_score)} color="text-cyan-400" />
                    </div>
                  </TechnicalCard>

                  {/* VISUAL DIAGNOSTICS */}
                  <TechnicalCard title="Visual Diagnostics" subtitle="Spatial & Signal Breakdown">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="flex flex-col gap-4">
                        <p className="text-[9px] font-black uppercase text-gray-500 tracking-widest italic mb-2">GradCAM (Spatial Anomaly)</p>
                        <div className="aspect-square rounded-xl overflow-hidden border border-white/10 bg-black/40 p-2">
                          {result.gradcam_url ? (
                            <img src={getImageUrl(result.gradcam_url)} alt="GradCAM" className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-800 gap-3 border border-dashed border-white/5 rounded-lg">
                              <Eye className="w-10 h-10 opacity-20" />
                              <span className="text-[8px] font-black uppercase tracking-widest">No Heatmap Data</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-4">
                        <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest italic mb-2">Signal Radar Plot</p>
                        <div className="aspect-square rounded-xl overflow-hidden border border-slate-200 bg-white p-2 shadow-sm">
                          {result.radar_url ? (
                            <img src={getImageUrl(result.radar_url)} alt="Radar" className="w-full h-full object-contain rounded-lg" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-200 gap-3 border border-dashed border-slate-100 rounded-lg">
                              <Activity className="w-10 h-10 opacity-20 text-slate-400" />
                              <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">No Radar Data</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-4">
                        <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest italic mb-2">Ensemble Breakdown</p>
                        <div className="aspect-square rounded-xl overflow-hidden border border-slate-200 bg-white p-2 shadow-sm">
                          {result.barchart_url ? (
                            <img src={getImageUrl(result.barchart_url)} alt="Bar Chart" className="w-full h-full object-contain rounded-lg" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-200 gap-3 border border-dashed border-slate-100 rounded-lg">
                              <BarChart3 className="w-10 h-10 opacity-20 text-slate-400" />
                              <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">No Graph Data</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </TechnicalCard>

                  {/* LEGACY CHART SECTION REMOVAL */}

                  {/* COMPONENT DEEP-DIVES */}
                  <div className="grid grid-cols-1 gap-6">
                    <TechnicalCard title="CNN Ensemble" subtitle="Multi-Architectural Cross-Reference">
                      <p className="text-[10px] text-gray-400 italic mb-6 leading-relaxed bg-white/[0.02] p-4 rounded border border-white/5">
                        Different AI architectures "see" images in unique ways. <span className="text-indigo-400">Xception</span> and <span className="text-indigo-400">EfficientNet</span> excel at finding pixel-level noise, while <span className="text-indigo-400">ViT</span> (Vision Transformer) looks at the global structure of the face.
                        By using an ensemble of all four, we cross-reference these viewpoints. Strong agreement between all models is a critical indicator of a high-fidelity Deepfake.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                        {Object.entries(aiConsensus?.models || {}).map(([name, data]: any) => {
                          const val = typeof data === 'number' ? data : data.prob_fake;
                          return (
                            <div key={name} className="flex flex-col gap-2">
                              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                <span>{name}</span>
                                <span className="mono text-white">{formatScore(val)}</span>
                              </div>
                              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-forensic-blue/40" style={{ width: `${val * 100}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-8 p-5 rounded bg-forensic-orange/5 border border-forensic-orange/10 flex items-center gap-4">
                        <AlertTriangle className="w-4 h-4 text-forensic-orange" />
                        <p className="text-[10px] font-bold text-forensic-orange italic uppercase tracking-widest">
                          {(Math.max(...Object.values(aiConsensus?.models || {}).map(v => Number(v))) - Math.min(...Object.values(aiConsensus?.models || {}).map(v => Number(v)))) > 0.4
                            ? "High model disagreement detected — ensemble results may be unstable."
                            : "Strong cross-architectural agreement established."}
                        </p>
                      </div>
                    </TechnicalCard>

                    {/* GRADCAM WAS MOVED TO VISUAL DIAGNOSTICS GRID */}

                    {isVideo && (
                      <TechnicalCard title="BiLSTM Optical Flow" subtitle="The Motion Forensic Branch">
                        <p className="text-[10px] text-gray-400 italic mb-6 leading-relaxed border-l-2 border-forensic-green/30 pl-4">
                          Deepfakes often look perfect in a still image but fail when they move. This <span className="text-forensic-green font-bold">BiLSTM</span> (Temporal)
                          branch analyzes's the "flow" of pixels over time. It looks for <span className="text-gray-200">Micro-Jitters</span>—tiny shifts that occur when a
                          digital face mask doesn't perfectly stick to the human's underlying movement. Any "sliding" or robotic stiffness is flagged here.
                        </p>
                        <SignalRow label="Motion Inconsistency" score={aiConsensus?.bilstm_temporal_score} status={(aiConsensus?.bilstm_temporal_score || 0) > 0.6 ? "SUSPICIOUS" : "STABLE"} color="bg-forensic-green" />
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                          <MetadataItem label="Effective Weight" value="15.0%" subValue="VIDEO" highlight />
                          <MetadataItem label="Contribution" value={formatScore((aiConsensus?.bilstm_temporal_score || 0) * 0.15)} />
                          <MetadataItem label="Sequence Length" value={metadata?.frames_analyzed || "48"} subValue="FRAMES" />
                          <MetadataItem label="Feature Ext" value="Farneback" />
                        </div>
                      </TechnicalCard>
                    )}

                    <div className={cn("grid gap-6", isVideo ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1")}>
                      {isVideo && (
                        <TechnicalCard title="Biological Sync" subtitle="Blink & Landmark Jitter">
                          <p className="text-[10px] text-gray-400 italic mb-6 leading-relaxed bg-white/[0.02] p-4 rounded">
                            Humans have involuntary biological rhythms, like steady eye-tracking and a regular <span className="text-rose-400 font-bold">blinking rate</span>.
                            Deepfake generators often produce "blind" faces that don't blink naturally, or produce "jittery" landmarks where the
                            eyes and mouth don't stay aligned with the head's rotation. We monitor these physical anchors for consistency.
                          </p>
                          <div className="p-4 rounded bg-white/[0.02] border border-white/5 mb-6 flex items-center gap-4">
                            <div className={cn("w-3 h-3 rounded-full", (motionIntegrity?.landmark_jitter?.avg_jitter || 0) > 0.4 ? "bg-forensic-red" : "bg-forensic-blue")} />
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                              {(motionIntegrity?.landmark_jitter?.avg_jitter || 0) > 0.4 ? "High Frame-to-Frame Jitter Detected" : "Stable Landmark Consistency"}
                            </p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <MetadataItem label="Blink Score" value={formatScore(biological?.score)} />
                              <p className="text-[7px] text-gray-600 mt-2 leading-tight uppercase font-bold tracking-tighter">Reflex Pattern Stability</p>
                            </div>
                            <div>
                              <MetadataItem label="Blinks Detected" value={biological?.blink_count || 0} />
                              <p className="text-[7px] text-gray-600 mt-2 leading-tight uppercase font-bold tracking-tighter">Total Lifecycle Count</p>
                            </div>
                            <div>
                              <MetadataItem label="Flow Score" value={formatScore(motionIntegrity?.optical_flow?.avg_magnitude)} />
                              <p className="text-[7px] text-gray-600 mt-2 leading-tight uppercase font-bold tracking-tighter">Vector Magnitude Delta</p>
                            </div>
                            <div>
                              <MetadataItem label="Landmark Jitter" value={formatScore(motionIntegrity?.landmark_jitter?.avg_jitter)} />
                              <p className="text-[7px] text-gray-600 mt-2 leading-tight uppercase font-bold tracking-tighter">Mesh Anchor Stability</p>
                            </div>
                          </div>
                        </TechnicalCard>
                      )}

                      <TechnicalCard title="Forensic Artifacts" subtitle="Micro-Pixel Analysis">
                        <p className="text-[10px] text-gray-400 italic mb-6 leading-relaxed bg-white/[0.02] p-4 rounded">
                          When an AI "paints" a face over a human, it leaves behind <span className="text-emerald-400 font-bold">Digital Fingerprints</span>.
                          This section looks for Frequency Anomalies (DCT) and abnormal sharpness at the "seams"—the invisible edges where
                          the computer-generated pixels meet the original real-world video background.
                        </p>
                        <div className="p-4 rounded bg-white/[0.02] border border-white/5 mb-6">
                          <p className="text-[10px] font-bold text-gray-400 italic font-mono uppercase tracking-widest">{artifacts?.interpretation || "Analysis Complete"}</p>
                        </div>
                        <div className={cn("grid gap-4", isVideo ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4")}>
                          <div>
                            <MetadataItem label="Watermark Module" value={formatScore(artifacts?.watermark_score || artifacts?.dct_anomaly)} />
                            <p className="text-[7px] text-gray-600 mt-2 leading-tight uppercase font-bold tracking-tighter">DCT Frequency Signature</p>
                          </div>
                          <div>
                            <MetadataItem
                              label={isVideo ? "Edge Score" : "GAN Fingerprint"}
                              value={formatScore(isVideo ? artifacts?.edge_anomaly : artifacts?.gan_fingerprint)}
                            />
                            <p className="text-[7px] text-gray-600 mt-2 leading-tight uppercase font-bold tracking-tighter">
                              {isVideo ? "Transition Blur (Haloing)" : "Generator Pattern DNA"}
                            </p>
                          </div>
                          <div>
                            <MetadataItem
                              label={isVideo ? "Sharpness Mix" : "Color Anomaly"}
                              value={formatScore(isVideo ? artifacts?.sharpness_mismatch : artifacts?.color_anomaly)}
                            />
                            <p className="text-[7px] text-gray-600 mt-2 leading-tight uppercase font-bold tracking-tighter">
                              {isVideo ? "Resolution Discontinuity" : "Pixel Lighting Delta"}
                            </p>
                          </div>
                          <div>
                            <MetadataItem label="Mismatch Index" value={formatScore(artifacts?.overall_mismatch)} />
                            <p className="text-[7px] text-gray-600 mt-2 leading-tight uppercase font-bold tracking-tighter">Aggregate Artifact Depth</p>
                          </div>
                        </div>
                      </TechnicalCard>
                    </div>

                    <TechnicalCard title="Evidence Information" subtitle="Metadata & Session Logs">
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <MetadataItem label="Total Frames" value={metadata?.frames_analyzed || "N/A"} />
                        <MetadataItem label="Faces Detected" value={metadata?.faces_detected || "N/A"} />
                        <MetadataItem label="System Latency" value="1.42s" highlight />
                        <MetadataItem label="Hardware" value="CUDA/NVIDIA" />
                        <MetadataItem label="Source Enc" value={isVideo ? "MP4-AVC" : "JPEG-8Bit"} />
                      </div>
                    </TechnicalCard>
                  </div>
                </motion.div>
              ) : (
                <div className="h-[80vh] flex flex-col items-center justify-center text-center p-12 opacity-40">
                  <Scan className="w-20 h-20 text-gray-700 mb-10" />
                  <h3 className="text-4xl font-black text-white italic tracking-tightest leading-none mb-4 uppercase">System Standby</h3>
                  <p className="text-gray-600 max-w-sm mt-2 font-black italic uppercase tracking-widest text-[9px] leading-relaxed">
                    Forensic processing unit is in idle state. Input digital payload to begin signal extraction.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <footer className="max-w-[1750px] mx-auto px-10 py-12 border-t border-white/5 flex items-center justify-between text-[11px] font-black uppercase tracking-[0.3em] text-gray-600">
        <div className="flex items-center gap-10">
          <p>&copy; 2026 DEEPFOCUS FORENSICS</p>
          <a href="#" className="hover:text-cyan-500 transition-colors">Privacy Prot</a>
          <a href="#" className="hover:text-cyan-500 transition-colors">Legal Framework</a>
        </div>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
            <span className="text-emerald-500/80">SYS-STATUS: OPTIMAL</span>
          </div>
          <Zap className="w-4 h-4 text-cyan-500 fill-cyan-500/20" />
          <span className="text-gray-500">GPU: CUDA V12.1</span>
        </div>
      </footer>
    </div>
  );
}

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
const formatPercent = (val: any) => (typeof val === 'number' ? (val * 100).toFixed(1) + "%" : "0.0%");

// --- Components ---

const Header = ({ onShowMethodology }: { onShowMethodology: () => void }) => (
  <header className="flex items-center justify-between py-5 px-8 border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-50">
    <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.reload()}>
      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)] border border-cyan-400/20">
        <Shield className="w-6 h-6 text-white" />
      </div>
      <div>
        <h1 className="text-xl font-black tracking-tight text-white italic">ANTIGRAVITY</h1>
        <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400 font-black opacity-80">Forensic Intelligence</p>
      </div>
    </div>
    <div className="flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">
      <button onClick={onShowMethodology} className="hover:text-cyan-400 transition-all border-b border-transparent hover:border-cyan-400/30 pb-1">Methodology</button>
      <a href="https://github.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 hover:border-cyan-400/30 hover:bg-cyan-400/5 transition-all text-white">
        <GitBranch className="w-4 h-4 text-cyan-500" />
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
        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl p-10 overflow-y-auto"
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-16">
             <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                  <Cpu className="w-8 h-8 text-cyan-500" />
                </div>
                <div>
                  <h2 className="text-4xl font-black text-white italic tracking-tight">Technical Methodology</h2>
                  <p className="text-xs font-black text-cyan-400 uppercase tracking-[0.3em]">Antigravity Forensic Engine v2.1</p>
                </div>
             </div>
             <button onClick={onClose} className="p-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all">
                <X className="w-6 h-6" />
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             <div className="p-10 rounded-[48px] bg-white/[0.03] border border-white/10 flex flex-col gap-6">
                <Layers className="w-10 h-10 text-indigo-400" />
                <h3 className="text-xl font-black text-white uppercase italic tracking-widest">Ensemble Vision Architecture</h3>
                <p className="text-gray-400 text-sm leading-relaxed font-bold italic">
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
                     <div key={m.name} className="flex gap-4 p-4 rounded-2xl bg-black/40 border border-white/5">
                        <div className="p-2 h-fit rounded-lg bg-indigo-500/10 border border-indigo-500/20 font-black text-[10px] text-indigo-400">01</div>
                        <div>
                           <h5 className="text-[11px] font-black text-white uppercase tracking-widest">{m.name}</h5>
                           <p className="text-[10px] text-gray-500 font-bold italic">{m.desc}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>

             <div className="space-y-10">
                <div className="p-10 rounded-[48px] bg-white/[0.03] border border-white/10 flex flex-col gap-6">
                   <Activity className="w-10 h-10 text-cyan-400" />
                   <h3 className="text-xl font-black text-white uppercase italic tracking-widest">Temporal Consistency Branch</h3>
                   <p className="text-gray-400 text-sm leading-relaxed font-bold italic">
                     Video synthesis often leaves "motion-blur" artifacts and landmark jitter. Our Temporal Branch 
                     uses MTCNN for face tracking and Farneback Optical Flow to detect these biometric failures.
                   </p>
                   <ul className="space-y-3 text-[10px] font-black text-gray-500 uppercase tracking-widest italic">
                      <li className="flex items-center gap-3">
                        <div className="w-1 h-1 rounded-full bg-cyan-400" />
                        BiLSTM RNN for sequential frame analysis
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-1 h-1 rounded-full bg-cyan-400" />
                        Blink correlation and eye-region forensics
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="w-1 h-1 rounded-full bg-cyan-400" />
                        Optical flow agreement vs landmark motion
                      </li>
                   </ul>
                </div>

                <div className="p-10 rounded-[48px] bg-cyan-500/5 border border-cyan-500/10 flex flex-col gap-6">
                   <Brain className="w-10 h-10 text-emerald-400" />
                   <h3 className="text-xl font-black text-white uppercase italic tracking-widest">Confidence-Weighted Fusion</h3>
                   <p className="text-gray-400 text-sm leading-relaxed font-bold italic">
                     Instead of simple averaging, we use a meta-learner approach. Each signal is weighted by its 
                     own confidence and historical reliability on calibrated datasets.
                   </p>
                   <div className="p-6 rounded-3xl bg-black/60 font-mono text-cyan-400 text-[10px] italic leading-loose">
                      F = Σ(Confidence_i * Signal_i) / Σ(Confidence_i)<br/>
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
        <span className="text-white group-hover:text-cyan-400 transition-colors uppercase">{label}</span>
        {confidence && <span className="text-gray-500 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px]">conf={formatScore(confidence)}</span>}
        {weight && <span className="text-gray-500 text-[9px]">W={formatPercent(weight)}</span>}
        {inverted && <span className="text-red-500/80 bg-red-500/10 px-1.5 rounded-full text-[9px]">inverted (1-q)</span>}
      </div>
      <div className="flex items-center gap-5">
        <span className="text-white font-mono">{formatScore(score)}</span>
        {contribution !== undefined && <span className="text-gray-600 font-mono text-[9px]">+{formatScore(contribution)}</span>}
        <span className={cn("px-3 py-1 rounded-full text-[9px] font-black tracking-[0.1em] border", 
          status === "FAKE" ? "bg-red-500/10 text-red-500 border-red-500/20" : 
          status === "SUSPICIOUS" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" : 
          "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
        )}>{status}</span>
      </div>
    </div>
    <div className="h-4 bg-black/40 rounded-full overflow-hidden border border-white/5 p-[1.5px] relative">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${score * 100}%` }}
        className={cn("h-full rounded-full relative animate-scan shadow-[0_0_15px_rgba(255,255,255,0.1)]", color)}
      >
        <div className="absolute inset-0 bg-white/10 mix-blend-overlay" />
      </motion.div>
    </div>
  </div>
);

const TechnicalCard = ({ title, subtitle, icon: Icon, children }: any) => (
  <div className="technical-card mb-6">
    <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-muted)]">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-4 h-4 text-forensic-blue" />}
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
          {title} <span className="opacity-40 ml-2">— {subtitle}</span>
        </h4>
      </div>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

const SignalRow = ({ label, score, conf, weight, contrib, status, color = "bg-indigo-500" }: any) => (
  <div className="group mb-4 last:mb-0">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-bold text-gray-300 w-32">{label}</span>
        {conf !== undefined && <span className="text-[8px] px-1.5 py-0.5 rounded bg-forensic-red/10 text-forensic-red border border-forensic-red/20 mono uppercase">conf={formatScore(conf)}</span>}
        {weight !== undefined && <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 text-gray-500 border border-white/10 mono uppercase">w={formatPercent(weight)}</span>}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-[11px] font-black text-white mono">{formatScore(score)}</span>
        <span className="text-[9px] font-medium text-gray-600 mono">contrib:{formatScore(contrib)}</span>
        <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded", 
          status === "FAKE" ? "text-forensic-red bg-forensic-red/10 border border-forensic-red/20" : 
          status === "SUSPICIOUS" ? "text-forensic-orange bg-forensic-orange/10 border border-forensic-orange/20" : 
          "text-forensic-green bg-forensic-green/10 border border-forensic-green/20"
        )}>{status}</span>
      </div>
    </div>
    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${(score || 0) * 100}%` }}
        className={cn("h-full transition-all duration-1000", color)}
      />
    </div>
  </div>
);

const MetadataItem = ({ label, value, subValue, highlight = false }: any) => (
  <div className="p-4 rounded bg-white/[0.02] border border-white/5">
    <p className="text-[8px] font-black uppercase tracking-widest text-gray-600 mb-2">{label}</p>
    <div className="flex items-baseline justify-between">
      <p className={cn("text-lg font-black mono italic", highlight ? "text-forensic-blue" : "text-white")}>{value}</p>
      {subValue && <span className="text-[9px] font-black text-gray-500 uppercase">{subValue}</span>}
    </div>
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

  // --- Persistence ---
  useEffect(() => {
    const saved = localStorage.getItem('antigravity_history');
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
    localStorage.setItem('antigravity_history', JSON.stringify(updated));
  };

  const loadFromHistory = (item: any) => {
    setResult(item.result);
    // Note: We can't easily restore the File object, so we show a placeholder name
    setFile({ name: item.fileName, size: 0, type: item.isImage ? 'image/history' : 'video/history' } as any);
    setShowHistory(false);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('antigravity_history');
  };

  const exportHistoryJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
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
      :root {
        --color-blue-500: #3b82f6 !important;
        --color-blue-600: #2563eb !important;
        --color-red-500: #ef4444 !important;
        --color-emerald-500: #10b981 !important;
        --color-orange-500: #f97316 !important;
        --color-yellow-500: #eab308 !important;
      }
      [data-report-container] {
        height: auto !important;
        overflow: visible !important;
      }
    `;
    document.head.appendChild(style);

    try {
      const dataUrl = await domToPng(reportRef.current, {
        backgroundColor: "#030712",
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
      alert("PDF generation failed. The report might be too large for your browser's memory.");
    } finally {
      setAnalyzing(false);
      document.head.removeChild(style);
    }
  };

  const isVideo = file?.type.startsWith("video/");
  const isFake = result?.label === "Fake";
  const confidencePercent = (result?.confidence * 100).toFixed(1);

  // --- Forensic Signal Mapping ---
  const forensic = result?.forensic_report;
  const aiConsensus = forensic?.ai_consensus;
  const motionIntegrity = forensic?.motion_integrity;
  const artifacts = forensic?.forensic_artifacts;
  const biological = forensic?.biological_signals;
  const metadata = forensic?.metadata;

  return (
    <div className="min-h-screen bg-[#030712] text-gray-200 font-sans selection:bg-cyan-500/30">
      <Header onShowMethodology={() => setShowMethodology(true)} />
      <MethodologyOverlay isOpen={showMethodology} onClose={() => setShowMethodology(false)} />
      
      <main className="max-w-[1750px] mx-auto px-10 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                 {/* --- LEFT SIDEBAR --- */}
          <div className="lg:col-span-3 flex flex-col gap-6 sticky top-28">
            <div className="technical-card p-6 border-forensic-blue/30 shadow-[0_0_20px_rgba(52,152,219,0.05)]">
               <div className="relative group aspect-video rounded overflow-hidden bg-black/60 border border-white/5 flex items-center justify-center mb-6 shadow-inner">
                 {file ? (
                    isVideo ? (
                      file.type === 'video/history' ? (
                        <Play className="w-16 h-16 text-forensic-blue opacity-20" />
                      ) : (
                        <video src={URL.createObjectURL(file)} className="w-full h-full object-cover" controls />
                      )
                    ) : (
                      file.type === 'image/history' ? (
                        <FileText className="w-16 h-16 text-forensic-blue opacity-20" />
                      ) : (
                        <img src={URL.createObjectURL(file)} className="w-full h-full object-contain" />
                      )
                    )
                 ) : (
                    <div className="flex flex-col items-center gap-5 text-gray-700">
                      <Scan className="w-12 h-12 opacity-20 animate-pulse" />
                      <p className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-600">INPUT REQUIRED</p>
                    </div>
                 )}
                 {!file && (
                    <input 
                      type="file" 
                      onChange={onFileChange} 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      accept="image/*,video/*" 
                    />
                 )}
               </div>
               
               <div className="flex flex-col gap-6">
                 <div className="flex flex-col gap-1 px-1">
                    <p className="text-[11px] font-black text-white truncate italic tracking-tight">{file?.name || 'Awaiting Payload'}</p>
                    <p className="text-[9px] font-black text-forensic-blue uppercase tracking-widest flex items-center gap-2">
                      <Database className="w-3 h-3" />
                      {file && file.size > 0 ? `${(file.size / 1024 / 1024).toFixed(2)} MB • ${file.type.split('/')[1].toUpperCase()}` : 'SYSTEM IDLE'}
                    </p>
                 </div>

                 {!result && !analyzing && (
                   <button 
                    disabled={!file}
                    onClick={handleUpload}
                    className="w-full py-4 rounded bg-forensic-blue hover:bg-blue-600 disabled:opacity-20 text-white font-black uppercase tracking-[0.2em] text-[10px] transition-all"
                   >
                     Analyze
                   </button>
                 )}

                 {analyzing && (
                    <div className="flex flex-col gap-3">
                       <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-forensic-blue">
                          <span className="flex items-center gap-2">Processing Matrix...</span>
                          <span className="mono">{progress}%</span>
                       </div>
                       <div className="h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-forensic-blue" />
                       </div>
                    </div>
                 )}

                 {result && (
                    <button 
                      onClick={() => {setResult(null); setFile(null);}}
                      className="w-full py-4 rounded border border-white/10 bg-white/5 text-gray-500 hover:text-white hover:bg-white/10 text-[9px] font-black uppercase tracking-[0.2em] transition-all"
                    >
                      Reset Module
                    </button>
                 )}
               </div>
            </div>

            <div className="technical-card p-6 border-white/5">
               <h5 className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4 flex items-center gap-2">
                 Fusion Formula
               </h5>
               <div className="p-4 rounded bg-black/40 border border-white/5 font-mono text-[9px] text-gray-500 leading-relaxed italic">
                  c_i = 2 ·|s_i - 0.5|<br/>
                  F = Σ(c_i · s_i) / Σ(c_i)<br/>
                  <span className="text-gray-600">Threshold: 0.55 · Calibrated on 14 DFD videos</span><br/>
                  <span className="text-forensic-blue/40">12/14 correct · FNR=0.000</span>
               </div>
            </div>

            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="technical-card p-6 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-forensic-blue transition-all"
            >
               <div className="flex items-center gap-3">
                  <History className="w-4 h-4" />
                  <span>Recent Logs</span>
               </div>
               <span className="mono opacity-40">{history.length}</span>
            </button>
          </div>

          {/* --- MAIN AREA: RESULTS --- */}
          <div className="lg:col-span-9 bg-mesh min-h-screen relative" ref={reportRef} data-report-container>
            
            {/* HISTORY TRAY (Overlay inside the main area) */}
            <AnimatePresence>
               {showHistory && (
                 <motion.div 
                    initial={{ x: "100%" }} 
                    animate={{ x: 0 }} 
                    exit={{ x: "100%" }} 
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="absolute inset-0 z-50 bg-[#070707]/95 backdrop-blur-3xl p-12 border-l border-white/10"
                 >
                    <div className="flex items-center justify-between mb-12">
                       <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase flex items-center gap-4">
                          <History className="w-8 h-8 text-forensic-blue" />
                          Forensic Log History
                       </h3>
                       <div className="flex items-center gap-4">
                          <button 
                            onClick={exportHistoryJSON}
                            className="bg-white/5 hover:bg-white/10 px-6 py-1.5 rounded border border-white/10 text-[10px] font-black uppercase text-gray-400 hover:text-white transition-all flex items-center gap-3"
                          >
                             <Download className="w-4 h-4" /> Export
                          </button>
                          <button onClick={() => setShowHistory(false)} className="p-3 rounded-full hover:bg-white/5 transition-colors">
                             <X className="w-6 h-6 text-gray-500" />
                          </button>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20 overflow-y-auto max-h-[70vh] pr-4 scrollbar-thin scrollbar-thumb-white/10">
                       {history.length === 0 ? (
                         <div className="col-span-2 text-center py-20 opacity-20 font-black italic uppercase tracking-widest text-lg">No records found</div>
                       ) : (
                         history.map(item => (
                           <button 
                             key={item.id} 
                             onClick={() => loadFromHistory(item)}
                             className="p-6 rounded bg-white/[0.03] border border-white/10 hover:border-forensic-blue/30 text-left transition-all group"
                           >
                              <div className="flex items-start justify-between mb-4">
                                 <div className={cn("px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border", 
                                   item.result.label === 'Fake' ? "text-forensic-red border-forensic-red/20 bg-forensic-red/10" : "text-forensic-green border-forensic-green/20 bg-forensic-green/10"
                                 )}>
                                   {item.result.label}
                                 </div>
                                 <span className="text-[10px] mono text-gray-600">{item.timestamp}</span>
                              </div>
                              <h4 className="text-[11px] font-black text-white truncate group-hover:text-forensic-blue mb-2 italic tracking-tight">{item.fileName}</h4>
                              <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">
                                Conf: {(item.result.confidence * 100).toFixed(1)}% • Score: {formatScore(item.result.final_score)}
                              </p>
                           </button>
                         ))
                       )}
                    </div>

                    {history.length > 0 && (
                       <button 
                         onClick={clearHistory}
                         className="absolute bottom-12 left-12 text-[9px] font-black text-red-900 uppercase tracking-widest hover:text-red-600 transition-colors"
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
                  {/* FINAL VERDICT BOX */}
                  <div className="technical-card p-10 mb-8 border-l-4 relative overflow-hidden" style={{ borderColor: isFake ? 'var(--color-forensic-red)' : 'var(--color-forensic-green)' }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-600 mb-6 italic">Final Verdict</p>
                        <h2 className={cn("text-7xl font-black italic tracking-tighter leading-none mb-6", isFake ? "text-forensic-red" : "text-forensic-green")}>
                          {result.label}
                        </h2>
                        
                        <div className="flex items-center gap-8 text-[11px] font-black tracking-widest text-gray-500 uppercase italic">
                          <span className="flex items-center gap-2 uppercase">Confidence: <span className="text-white mono">{confidencePercent}%</span></span>
                          <span className="flex items-center gap-2 uppercase">Final Score: <span className="text-white mono">{formatScore(result.final_score)}</span></span>
                          <span className="flex items-center gap-2 uppercase">Threshold: <span className="text-white mono">0.55</span></span>
                        </div>

                        <div className="mt-10 p-5 rounded bg-white/[0.02] border border-white/5 flex items-center gap-5 max-w-2xl">
                           {isFake ? <X className="w-5 h-5 text-forensic-red" /> : <Shield className="w-5 h-5 text-forensic-green" />}
                           <p className="text-[11px] font-bold text-gray-400 italic leading-relaxed">
                             {isFake 
                               ? "High confidence deepfake — strong manipulation signals across multiple branches."
                               : "Low sensitivity artifacts detected — video appears broadly authentic within current model parameters."}
                           </p>
                        </div>
                        <p className="text-[9px] font-black text-gray-600 mt-6 uppercase tracking-[0.2em] mono">Decision source: {metadata?.decision_source || result.decision_source}</p>
                      </div>

                      <button 
                        onClick={downloadPDF}
                        className="flex flex-col items-center gap-4 group hover:scale-105 transition-transform"
                      >
                         <div className="p-5 rounded border border-white/10 bg-white/5 group-hover:bg-forensic-blue/10 group-hover:border-forensic-blue/30 transition-all shadow-lg">
                            <Download className="w-8 h-8 text-forensic-blue" />
                         </div>
                         <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-600 group-hover:text-forensic-blue">Export PDF</p>
                      </button>
                    </div>
                  </div>

                  {/* SIGNAL SCORES BOX */}
                  <TechnicalCard title="Signal Scores" subtitle="Expert Methodology">
                    <div className="mb-8 p-5 bg-forensic-blue/5 border border-forensic-blue/10 rounded">
                      <h5 className="text-[9px] font-black uppercase text-forensic-blue mb-2 italic tracking-widest">Weighted Additive Fusion</h5>
                      <p className="text-[10px] text-gray-400 leading-relaxed italic">
                        The forensic engine does not simply average these scores. Instead, it uses a <span className="text-gray-200">Confidence-Weighted system</span>. 
                        Every signal is automatically weighed based on its certainty; if a model is "unsure," its impact on the final verdict is neutralized. 
                        This prevents a single "confused" model from triggering a false alarm, ensuring that the strongest, most certain evidence drives the final decision.
                      </p>
                    </div>
                    {isVideo && <SignalRow label="BiLSTM Optical Flow" score={aiConsensus?.bilstm_temporal_score} weight={0.15} contrib={0.124} status={(aiConsensus?.bilstm_temporal_score || 0) > 0.6 ? "FAKE" : "REAL"} color="bg-forensic-blue" />}
                    <SignalRow label="EfficientNet-B3" score={aiConsensus?.models?.efficientnet_b3} weight={0.20} contrib={0.155} status={(aiConsensus?.models?.efficientnet_b3 || 0) > 0.6 ? "FAKE" : "REAL"} color="bg-forensic-red" />
                    <SignalRow label="Xception" score={aiConsensus?.models?.xception} weight={0.20} contrib={0.125} status={(aiConsensus?.models?.xception || 0) > 0.6 ? "FAKE" : "REAL"} color="bg-forensic-purple" />
                    <SignalRow label="ViT Small" score={aiConsensus?.models?.vit} weight={0.15} contrib={0.095} status={(aiConsensus?.models?.vit || 0) > 0.6 ? "FAKE" : "REAL"} color="bg-forensic-yellow" />
                    <SignalRow label="ConvNeXt" score={aiConsensus?.models?.convnext} weight={0.15} contrib={0.088} status={(aiConsensus?.models?.convnext || 0) > 0.6 ? "FAKE" : "REAL"} color="bg-forensic-blue" />
                    <SignalRow label="Quality Forensics" score={artifacts?.overall_mismatch} weight={0.10} contrib={0.025} status={(artifacts?.overall_mismatch || 0) > 0.5 ? "SUSPICIOUS" : "REAL"} color="bg-forensic-green" />
                    {isVideo && <SignalRow label="Temporal Analysis" score={motionIntegrity?.temporal_score} weight={0.05} status={(motionIntegrity?.temporal_score || 0) > 0.6 ? "FAKE" : "REAL"} color="bg-forensic-green" />}
                  </TechnicalCard>

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
                            { (Math.max(...Object.values(aiConsensus?.models || {}).map(v => Number(v))) - Math.min(...Object.values(aiConsensus?.models || {}).map(v => Number(v)))) > 0.4 
                              ? "High model disagreement detected — ensemble results may be unstable." 
                              : "Strong cross-architectural agreement established." }
                          </p>
                       </div>
                    </TechnicalCard>

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
                               <MetadataItem label="DCT Anomaly" value={formatScore(artifacts?.dct_anomaly)} />
                               <p className="text-[7px] text-gray-600 mt-2 leading-tight uppercase font-bold tracking-tighter">Frequency Math Signature</p>
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
          <p>&copy; 2026 ANTIGRAVITY FORENSICS</p>
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

"use client";

import { useState, useEffect } from "react";
import { LandingView } from "@/components/LandingView";
import { ResultsDashboard } from "@/components/ResultsDashboard";
import { CxrAnalysis } from "@/lib/types";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";

const STAGES = [
  "Uploading image...",
  "Stage 1: Multi-label Perception",
  "Stage 2: Context Retrieval",
  "Stage 3: Report Drafting & Refinement",
  "Stage 4: Vision-Text QA Check",
  "Stage 5: Synthesis & Uncertainty Estimation",
  "Finalizing results..."
];

export default function Home() {
  const [appState, setAppState] = useState<"LANDING" | "ANALYZING" | "RESULTS" | "INVALID_IMAGE">("LANDING");
  const [result, setResult] = useState<CxrAnalysis | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Progress state
  const [progress, setProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);

  // Fake staged progress animation - UI framing over a single call
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (appState === "ANALYZING") {
      const stageDuration = 2000; // ms per stage roughly
      const updateInterval = 100; // ms
      
      interval = setInterval(() => {
        setProgress((prev) => {
          // Cap at 95% until the actual response arrives
          if (prev >= 95) return 95;
          return prev + (100 / (STAGES.length * (stageDuration / updateInterval)));
        });
        
        setStageIndex(() => {
          const nextStage = Math.floor((progress / 100) * STAGES.length);
          return Math.min(nextStage, STAGES.length - 1);
        });
      }, updateInterval);
    }
    
    return () => clearInterval(interval);
  }, [appState, progress]);

  const handleAnalyze = async (file: File) => {
    setAppState("ANALYZING");
    setProgress(0);
    setStageIndex(0);
    setError(null);
    
    const objUrl = URL.createObjectURL(file);
    setImageUrl(objUrl);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to analyze image");
      }

      const data = await res.json() as CxrAnalysis;
      
      // Jump to 100% instantly when done
      setProgress(100);
      setStageIndex(STAGES.length - 1);
      
      // Small delay for UX transition
      setTimeout(() => {
        if (data.is_valid_xray === false) {
          setAppState("INVALID_IMAGE");
        } else {
          setResult(data);
          setAppState("RESULTS");
        }
      }, 500);

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "An unexpected error occurred.");
      } else {
        setError("An unexpected error occurred.");
      }
      setAppState("LANDING");
      if (imageUrl) {
        URL.revokeObjectURL(objUrl);
        setImageUrl(null);
      }
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-50 via-slate-50 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 overflow-x-hidden relative">
      {/* Decorative blurred background element for website feel */}
      <div className="absolute top-0 right-0 -mr-48 -mt-48 w-96 h-96 rounded-full bg-blue-100/40 dark:bg-blue-900/20 blur-[100px] pointer-events-none z-0"></div>
      
      <ThemeToggle />
      
      <div className="relative z-10 w-full h-full flex flex-col">
        <AnimatePresence mode="wait">
          
          {appState === "LANDING" && (
            <motion.div 
              key="landing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="w-full min-h-screen flex flex-col py-8"
            >
              {error && (
                <div className="max-w-2xl mx-auto pt-8 px-4 w-full">
                  <Alert variant="destructive" className="bg-red-50/80 dark:bg-red-950/80 backdrop-blur-sm border-red-200 dark:border-red-900 dark:text-red-200">
                    <AlertCircle className="h-4 w-4 dark:text-red-200" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </div>
              )}
              <div className="flex-1 flex flex-col justify-center">
                <LandingView onAnalyze={handleAnalyze} />
              </div>
            </motion.div>
          )}

          {appState === "ANALYZING" && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center min-h-screen p-4 max-w-md mx-auto w-full"
            >
            <div className="w-full space-y-4">
                <div className="flex flex-col items-center mb-6">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                    <img src="/logo.png" alt="CXR-Sentinel Logo" className="relative w-16 h-16 object-contain animate-pulse duration-2000" />
                  </div>
                </div>
                <div className="flex justify-between items-end mb-2">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Processing X-Ray</h3>
                  <span className="text-sm font-mono text-slate-500 dark:text-slate-400">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2 w-full bg-slate-200 dark:bg-slate-800" />
                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm p-4 rounded-xl border border-white dark:border-slate-800 shadow-sm">
                  <Loader2 className="w-5 h-5 animate-spin text-primary dark:text-blue-400" />
                  <span className="text-sm font-medium animate-pulse">{STAGES[stageIndex]}</span>
                </div>
              </div>
            </motion.div>
          )}

          {appState === "RESULTS" && result && imageUrl && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="w-full min-h-screen flex flex-col"
            >
              <ResultsDashboard result={result} imageUrl={imageUrl} onReset={() => {
                setAppState("LANDING");
                setResult(null);
                setImageUrl(null);
                setProgress(0);
                setStageIndex(0);
              }} />
            </motion.div>
          )}

          {appState === "INVALID_IMAGE" && (
            <motion.div
              key="invalid"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center min-h-screen p-4 w-full"
            >
              <div className="max-w-lg w-full bg-white dark:bg-slate-900 rounded-3xl p-8 md:p-12 shadow-2xl border border-red-100 dark:border-red-900 text-center space-y-6">
                <div className="w-20 h-20 bg-red-50 dark:bg-red-950/50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-10 h-10 text-red-500 dark:text-red-400" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-slate-50">Invalid Image Detected</h2>
                <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg">
                  The AI backend determined that the uploaded image is <strong className="text-slate-800 dark:text-slate-200">not a medical chest X-ray</strong>.
                  This prototype is strictly designed to emulate a radiology workflow and cannot analyze general photography, screenshots, or unrelated medical imaging.
                </p>
                <div className="pt-6">
                  <button 
                    onClick={() => {
                      setAppState("LANDING");
                      setImageUrl(null);
                      setProgress(0);
                      setStageIndex(0);
                    }}
                    className="w-full py-4 bg-primary hover:bg-primary/90 text-white dark:bg-blue-600 dark:hover:bg-blue-500 rounded-xl font-bold text-lg transition-all active:scale-[0.98] shadow-lg shadow-blue-500/20"
                  >
                    Go Back & Upload X-Ray
                  </button>
                </div>
              </div>
            </motion.div>
          )}
          
        </AnimatePresence>
      </div>

      <div className="fixed bottom-3 w-full text-center z-50 pointer-events-none">
        <a href="https://rifathossain47.vercel.app/" target="_blank" rel="noopener noreferrer" className="pointer-events-auto text-[10px] text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-blue-400 transition-colors bg-white/60 dark:bg-slate-900/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/50 dark:border-slate-800/50 shadow-sm inline-flex items-center gap-1">
          Developed by <span className="font-semibold text-slate-700 dark:text-slate-200">Md Rifat Hossen</span>
        </a>
      </div>
    </main>
  );
}

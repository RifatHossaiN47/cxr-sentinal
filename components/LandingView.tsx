"use client";

import { useState, useCallback } from "react";
import { Upload, ArrowRight, Eye, Search, FileText, Settings, Layers } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const STEPS = [
  { id: "perception", label: "Perception", icon: Eye },
  { id: "retrieval", label: "Retrieval", icon: Search },
  { id: "drafting", label: "Drafting", icon: FileText },
  { id: "refinement", label: "Refinement", icon: Settings },
  { id: "synthesis", label: "Synthesis", icon: Layers },
];

export function LandingView({ onAnalyze }: { onAnalyze: (file: File) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith("image/")) {
        setFile(droppedFile);
      }
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-4 md:py-8 flex flex-col justify-center items-center h-full min-h-0">
      {/* Hero Section */}
      <div className="text-center mb-6 md:mb-10 space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          CXR-Sentinel
        </h1>
        <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          AI-assisted chest X-ray analysis — research prototype
        </p>
      </div>

      {/* Architecture Strip */}
      <div className="w-full mb-6 md:mb-10">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider text-center mb-4">
          Emulates a five-stage workflow
        </p>
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 w-full bg-white dark:bg-slate-900 p-4 md:p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="flex items-center w-full md:w-auto">
                <div className="flex flex-col items-center text-center space-y-3 flex-1 md:flex-none">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/5 dark:bg-primary/10 rounded-full flex items-center justify-center text-primary dark:text-blue-400">
                    <Icon className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <span className="text-xs md:text-sm font-medium text-slate-700 dark:text-slate-300">{step.label}</span>
                </div>
                {index < STEPS.length - 1 && (
                  <ArrowRight className="w-4 h-4 md:w-5 md:h-5 text-slate-300 dark:text-slate-700 hidden md:block mx-2 md:mx-4 flex-shrink-0" />
                )}
                {index < STEPS.length - 1 && (
                  <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 md:hidden my-2 mx-auto"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upload Panel */}
      <div className="relative w-full max-w-xl mx-auto">
        {/* Decorative glow behind the card */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-[2rem] blur-xl opacity-50 pointer-events-none"></div>
        <Card className="relative w-full p-6 md:p-8 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-white/50 dark:border-slate-700/50 rounded-2xl">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all duration-300 ${
              isDragging ? "border-primary bg-primary/5 dark:bg-primary/10 scale-[1.02]" : "border-slate-300 dark:border-slate-700 hover:border-primary/50 hover:bg-white/50 dark:hover:bg-slate-800/50 bg-white/30 dark:bg-slate-950/30"
            }`}
          >
            <Upload className="w-8 h-8 md:w-10 md:h-10 text-slate-400 dark:text-slate-500 mb-3 transition-transform duration-300 hover:-translate-y-1" />
          <h3 className="text-base md:text-lg font-semibold text-slate-800 dark:text-slate-200 mb-1">
            Upload Chest X-Ray
          </h3>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-5 max-w-xs mx-auto">
            Drag and drop your frontal CXR image here, or click to browse. Max 10MB.
          </p>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileChange}
          />
          {file && (
            <div className="mb-5 p-2.5 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center gap-3 relative z-10 pointer-events-none w-full max-w-xs mx-auto">
              <div className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                {file.name}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </div>
            </div>
          )}
          <Button
            size="default"
            className="w-full max-w-xs font-medium relative z-10"
            disabled={!file}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (file) onAnalyze(file);
            }}
          >
            Run Analysis
          </Button>
        </div>
      </Card>
      </div>
      
      <div className="mt-8 text-center shrink-0">
         <a href="#model-card" className="text-xs text-slate-500 dark:text-slate-500 hover:text-primary dark:hover:text-primary transition-colors underline underline-offset-4 decoration-slate-300 dark:decoration-slate-700">
            About this prototype
         </a>
      </div>
    </div>
  );
}

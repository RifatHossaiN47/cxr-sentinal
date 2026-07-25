"use client";

import { useState } from "react";
import { CxrAnalysis } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, CheckCircle, Info, Copy, Printer, FileText, User, Layers, CheckSquare, Search, Settings, Eye, ArrowLeft } from "lucide-react";
import { ClassificationChart } from "./ClassificationChart";

export function ResultsDashboard({ result, imageUrl, onReset }: { result: CxrAnalysis; imageUrl: string; onReset?: () => void }) {
  const [showRoi, setShowRoi] = useState(true);

  const isFlagged = result.uncertainty.status === "FLAGGED_FOR_REVIEW";
  
  const handleCopy = () => {
    const text = `Findings:\n${result.report.findings}\n\nImpression:\n${result.report.impression}`;
    navigator.clipboard.writeText(text);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-none px-2 md:px-4 py-2 font-sans print:p-0 print:m-0 h-auto flex flex-col pb-16 lg:pb-8">
      
      {/* 8.5 Confidence / Review Banner */}
      <div className={`shrink-0 w-full rounded-xl p-2 md:p-3 mb-2 flex flex-col md:flex-row items-center justify-between shadow-sm border ${
        isFlagged ? "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-200" : "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200"
      } print:hidden`}>
        <div className="flex items-center gap-3 mb-2 md:mb-0">
          {onReset && (
            <Button variant="ghost" size="icon" onClick={onReset} className="h-8 w-8 rounded-full shrink-0 -ml-1 opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-all">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          {isFlagged ? <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" /> : <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />}
          <div>
            <h2 className="font-bold text-lg leading-tight">
              {isFlagged ? "Flagged for Radiologist Review" : "Automated — Draft Ready"}
            </h2>
            <p className="text-sm opacity-80 leading-tight mt-0.5">Model self-estimated uncertainty parameters:</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Tooltip>
            <TooltipTrigger className="flex items-center gap-2 bg-white/60 dark:bg-black/20 px-3 py-1.5 rounded-full text-sm font-medium border border-black/5 dark:border-white/10">
              <span>Class U: {result.uncertainty.u_classification.toFixed(2)}</span>
              <Info className="w-3.5 h-3.5 opacity-50" />
            </TooltipTrigger>
            <TooltipContent>Uncertainty in classification stage (0-1)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger className="flex items-center gap-2 bg-white/60 dark:bg-black/20 px-3 py-1.5 rounded-full text-sm font-medium border border-black/5 dark:border-white/10">
              <span>Gen U: {result.uncertainty.u_generation.toFixed(2)}</span>
              <Info className="w-3.5 h-3.5 opacity-50" />
            </TooltipTrigger>
            <TooltipContent>Uncertainty in text generation stage (0-1)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger className="flex items-center gap-2 bg-white/60 dark:bg-black/20 px-3 py-1.5 rounded-full text-sm font-bold border border-black/10 dark:border-white/20 shadow-sm">
              <span>Final U: {result.uncertainty.u_final.toFixed(2)}</span>
              <Info className="w-3.5 h-3.5 opacity-50" />
            </TooltipTrigger>
            <TooltipContent>Weighted final uncertainty (Threshold: 0.35)</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Main 3-Column Bento Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 flex-1 min-h-0 items-start">
        
        {/* Left Column: Image + ROI panel */}
        <Card className="xl:col-span-3 p-3 flex flex-col gap-3 shadow-sm border-slate-200 dark:border-slate-800 dark:bg-slate-900/80 backdrop-blur-sm print:break-inside-avoid h-auto min-h-[350px]">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 text-sm">
              <Layers className="w-4 h-4 text-primary dark:text-blue-400" />
              Input & ROI
            </h3>
            <Button variant="outline" size="sm" onClick={() => setShowRoi(!showRoi)} className="h-7 text-[10px] px-2 print:hidden dark:border-slate-700">
              {showRoi ? "Hide ROIs" : "Show ROIs"}
            </Button>
          </div>
          <div className="relative w-full flex-1 bg-slate-100 dark:bg-slate-950 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 min-h-[250px]">
            {/* Base Image */}
            <img src={imageUrl} alt="Uploaded Chest X-Ray" className="w-full h-full object-contain absolute inset-0" />
            
            {/* ROI Overlay SVG */}
            {showRoi && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1000 1000" preserveAspectRatio="none">
                {result.regions_of_interest.map((roi, idx) => {
                  const [ymin, xmin, ymax, xmax] = roi.box_2d;
                  const width = xmax - xmin;
                  const height = ymax - ymin;
                  return (
                    <g key={idx} className="pointer-events-auto cursor-help group">
                      <rect
                        x={xmin}
                        y={ymin}
                        width={width}
                        height={height}
                        fill="rgba(245, 158, 11, 0.15)"
                        stroke="#f59e0b"
                        strokeWidth="3"
                        strokeDasharray="6 4"
                        className="transition-all hover:fill-amber-500/30 hover:stroke-amber-500 hover:stroke-[4]"
                      />
                      <title>{roi.label}: {roi.note}</title>
                    </g>
                  );
                })}
              </svg>
            )}
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 italic px-1">
            Model-highlighted regions of interest (estimated, not a gradient-based saliency map).
          </p>
        </Card>

        {/* Middle Column: Stats, Classification, Report */}
        <div className="xl:col-span-6 flex flex-col gap-4 h-auto">
          
          {/* Header stat row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 print:grid-cols-4 shrink-0">
            <Card className="p-3 flex flex-col justify-center border-slate-200 dark:border-slate-800 dark:bg-slate-900/80 shadow-sm">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mb-1 uppercase tracking-wider">Overall Status</div>
              <div className={`font-semibold text-xs truncate ${isFlagged ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                {isFlagged ? "Flagged for Review" : "Automated-Ready"}
              </div>
            </Card>
            <Card className="p-3 flex flex-col justify-center border-slate-200 dark:border-slate-800 dark:bg-slate-900/80 shadow-sm">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mb-1 uppercase tracking-wider flex items-center gap-1">
                Final Uncertainty
              </div>
              <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                {result.uncertainty.u_final.toFixed(2)}
              </div>
            </Card>
            <Card className="p-3 flex flex-col justify-center border-slate-200 dark:border-slate-800 dark:bg-slate-900/80 shadow-sm">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mb-1 uppercase tracking-wider">Processing Time</div>
              <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                {result.classification.length} / 14
              </div>
            </Card>
            <Card className="p-3 flex flex-col justify-center border-slate-200 dark:border-slate-800 dark:bg-slate-900/80 shadow-sm relative overflow-hidden group">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mb-1 uppercase tracking-wider flex items-center justify-between">
                Case ID
              </div>
              <div className="font-mono font-semibold text-primary dark:text-blue-400 text-sm truncate">
                {result.case_id || "CXR-DEMO-001"}
              </div>
            </Card>
          </div>

          {/* Classification panel & Report panel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 flex-1 min-h-0">
            <Card className="p-3 border-slate-200 dark:border-slate-800 dark:bg-slate-900/80 shadow-sm flex flex-col print:break-inside-avoid">
              <div className="flex items-center gap-2 mb-2">
                <CheckSquare className="w-4 h-4 text-primary dark:text-blue-400" />
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Classification</h3>
              </div>
              <div className="flex-1 min-h-[250px]">
                <ClassificationChart data={result.classification} />
              </div>
            </Card>

            <Card className="p-4 border-slate-200 dark:border-slate-800 dark:bg-slate-900/80 shadow-sm flex flex-col relative print:break-inside-avoid print:shadow-none print:border-none print:p-0">
              <div className="flex items-center justify-between mb-3 print:hidden">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary dark:text-blue-400" />
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Generated Report</h3>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-7 gap-1 text-[10px] px-2 dark:border-slate-700" onClick={handleCopy}>
                    <Copy className="w-3 h-3" /> Copy
                  </Button>
                  <Button variant="outline" size="sm" className="h-7 gap-1 text-[10px] px-2 dark:border-slate-700" onClick={handlePrint}>
                    <Printer className="w-3 h-3" /> Print
                  </Button>
                </div>
              </div>

              {/* Print-only header */}
              <div className="hidden print:block mb-4 border-b pb-4">
                <h1 className="text-2xl font-bold mb-1">Radiology Report (Draft)</h1>
                <div className="flex gap-4 text-sm text-slate-500 font-mono">
                  <span>ID: {result.case_id}</span>
                  <span>Date: {result.processed_at ? new Date(result.processed_at).toLocaleString() : new Date().toLocaleString()}</span>
                  <span>Status: {isFlagged ? "FLAGGED" : "READY"}</span>
                </div>
              </div>

              <div className="flex-1 space-y-2 text-[11px] text-slate-700 dark:text-slate-300 leading-snug">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[9px] mb-0.5">Findings</h4>
                  <p>{result.report.findings}</p>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[9px] mb-0.5">Impression</h4>
                  <p className="font-semibold">{result.report.impression}</p>
                </div>
              </div>
              
              {/* Print-only footer */}
              <div className="hidden print:block mt-8 pt-4 border-t text-[10px] text-slate-400 dark:text-slate-500">
                {result.disclaimer}
              </div>
            </Card>
          </div>
        </div>

        {/* Right Column: Agent Trace Timeline */}
        <Card className="xl:col-span-3 p-3 border-slate-200 dark:border-slate-800 dark:bg-slate-900/80 shadow-sm flex flex-col h-auto print:hidden">
          <div className="flex items-center gap-2 mb-2 shrink-0">
            <User className="w-4 h-4 text-primary dark:text-blue-400" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Simulated Agent Trace</h3>
          </div>

          <div className="flex-1 overflow-hidden relative border-l border-slate-100 dark:border-slate-800 pl-3 space-y-3 text-[9px] leading-tight">
            
            <div className="relative">
              <div className="absolute w-2.5 h-2.5 bg-primary/20 dark:bg-primary/30 rounded-full -left-[17px] top-0.5 border border-white dark:border-slate-900 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
              </div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide flex items-center gap-1 mb-0.5 text-[9px]">
                <Search className="w-3 h-3 text-slate-400 dark:text-slate-500" /> Stage 1: Retrieval
              </h4>
              <p className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/50 p-1.5 rounded border border-slate-100 dark:border-slate-800/80">
                {result.agent_trace.retrieval_context}
              </p>
            </div>

            <div className="relative">
              <div className="absolute w-2.5 h-2.5 bg-primary/20 dark:bg-primary/30 rounded-full -left-[17px] top-0.5 border border-white dark:border-slate-900 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
              </div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide flex items-center gap-1 mb-0.5 text-[9px]">
                <FileText className="w-3 h-3 text-slate-400 dark:text-slate-500" /> Stage 2: Drafting
              </h4>
              <div className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/50 p-1.5 rounded border border-slate-100 dark:border-slate-800/80 space-y-1">
                <div><strong className="font-bold text-slate-800 dark:text-slate-200">Findings:</strong> {result.agent_trace.draft_report.findings}</div>
                <div><strong className="font-bold text-slate-800 dark:text-slate-200">Impression:</strong> {result.agent_trace.draft_report.impression}</div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute w-2.5 h-2.5 bg-primary/20 dark:bg-primary/30 rounded-full -left-[17px] top-0.5 border border-white dark:border-slate-900 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
              </div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide flex items-center gap-1 mb-0.5 text-[9px]">
                <Settings className="w-3 h-3 text-slate-400 dark:text-slate-500" /> Stage 3: Refinement
              </h4>
              <div className="flex flex-col gap-1">
                {result.agent_trace.refinement_actions.map((action, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80 p-1 rounded">
                    <div className="font-bold mb-0.5 flex items-center gap-1 text-slate-800 dark:text-slate-200">
                      <Badge variant={action.action === "ADD" ? "default" : action.action === "REMOVE" ? "destructive" : "secondary"} className="text-[7px] h-3 px-1 py-0 rounded-sm">
                        {action.action}
                      </Badge>
                      {action.label}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 text-[8px]">{action.reason}</div>
                  </div>
                ))}
                {result.agent_trace.refinement_actions.length === 0 && (
                  <div className="text-slate-500 dark:text-slate-500 italic">No refinement actions taken.</div>
                )}
              </div>
            </div>

            <div className="relative">
              <div className="absolute w-2.5 h-2.5 bg-primary/20 dark:bg-primary/30 rounded-full -left-[17px] top-0.5 border border-white dark:border-slate-900 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
              </div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide flex items-center gap-1 mb-0.5 text-[9px]">
                <Eye className="w-3 h-3 text-slate-400 dark:text-slate-500" /> Stage 4: Vision Check
              </h4>
              <p className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/50 p-1.5 rounded border border-slate-100 dark:border-slate-800/80">
                {result.agent_trace.vision_check_notes}
              </p>
            </div>

            <div className="relative">
              <div className="absolute w-2.5 h-2.5 bg-primary/20 dark:bg-primary/30 rounded-full -left-[17px] top-0.5 border border-white dark:border-slate-900 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
              </div>
              <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide flex items-center gap-1 mb-0.5 text-[9px]">
                <Layers className="w-3 h-3 text-slate-400 dark:text-slate-500" /> Stage 5: Synthesis
              </h4>
              <p className="text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/50 p-1.5 rounded border border-slate-100 dark:border-slate-800/80">
                {result.agent_trace.synthesis_notes}
              </p>
            </div>
            
          </div>

        </Card>
      </div>
    </div>
  );
}

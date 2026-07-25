"use client";

import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useEffect, useState } from "react";

export function DisclaimerBadge() {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setMounted(true);
    // Optional feature: capture=true to hide disclaimer for the final screenshot
    const params = new URLSearchParams(window.location.search);
    if (params.get("capture") === "true") {
      setIsVisible(false);
    }
  }, []);

  if (!mounted || !isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <Popover>
        <PopoverTrigger className="flex items-center gap-2 bg-amber-50 border border-amber-500/50 text-amber-800 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm hover:bg-amber-100 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2">
          <Info className="w-3.5 h-3.5" />
          Dummy Prototype &middot; Demo Only
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 text-sm p-4 text-slate-700 leading-relaxed shadow-lg border-amber-200">
          This is a dummy prototype demonstrating a proposed thesis workflow&apos;s user experience. It uses
          a general-purpose multimodal AI model (Gemini), not the trained classification/retrieval/
          generation pipeline described in the underlying thesis, and its outputs are illustrative only.
          <strong> Not a medical device &mdash; do not use for real clinical decisions.</strong>
        </PopoverContent>
      </Popover>
    </div>
  );
}

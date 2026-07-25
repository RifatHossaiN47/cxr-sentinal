"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ClassificationLabel, RiskGroup } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

const STATUS_COLORS: Record<string, string> = {
  "Positive": "#ef4444", // Red
  "Negative": "#22c55e", // Green
  "Uncertain": "#f59e0b", // Amber
  "Not Mentioned": "#94a3b8" // Slate
};

const RISK_WEIGHTS: Record<RiskGroup, number> = {
  RED: 3,
  YELLOW: 2,
  GREEN: 1,
};

export function ClassificationChart({ data }: { data: ClassificationLabel[] }) {
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      // Sort by risk group first
      const riskDiff = RISK_WEIGHTS[b.risk_group] - RISK_WEIGHTS[a.risk_group];
      if (riskDiff !== 0) return riskDiff;
      // Then by confidence
      return b.confidence - a.confidence;
    });
  }, [data]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="text-sm font-medium text-slate-700 mb-4 px-2">Label Classification (Sorted by Risk)</div>
      <div className="flex-1 min-h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
            barSize={16}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} opacity={0.3} />
            <XAxis type="number" domain={[0, 1]} tick={{ fontSize: 12 }} />
            <YAxis 
              dataKey="label" 
              type="category" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#475569" }}
              width={110}
            />
            <Tooltip 
              cursor={{ fill: "transparent" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as ClassificationLabel;
                  return (
                    <div className="bg-white dark:bg-slate-900 p-3 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg text-sm">
                      <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1">{data.label}</div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-slate-500 dark:text-slate-400">Status:</span>
                        <span style={{ color: STATUS_COLORS[data.status] }} className="font-medium">{data.status}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-slate-500 dark:text-slate-400">Confidence:</span>
                        <span className="dark:text-slate-200">{(data.confidence * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 dark:text-slate-400">Risk:</span>
                        <Badge variant={data.risk_group === "RED" ? "destructive" : data.risk_group === "YELLOW" ? "secondary" : "default"} className="text-[10px] h-4">
                          {data.risk_group}
                        </Badge>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="confidence" radius={[0, 4, 4, 0]}>
              {sortedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

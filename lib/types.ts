export type ClassificationStatus = "Positive" | "Negative" | "Uncertain" | "Not Mentioned";
export type RiskGroup = "RED" | "YELLOW" | "GREEN";

export interface ClassificationLabel {
  label: string;
  status: ClassificationStatus;
  confidence: number;
  risk_group: RiskGroup;
}

export interface RegionOfInterest {
  label: string;
  box_2d: [number, number, number, number];
  note: string;
}

export interface AgentTrace {
  retrieval_context: string;
  draft_report: { findings: string; impression: string };
  refinement_actions: Array<{
    action: "ADD" | "REMOVE" | "SOFTEN" | "KEEP";
    label: string;
    reason: string;
  }>;
  vision_check_notes: string;
  synthesis_notes: string;
}

export interface Uncertainty {
  u_classification: number;
  u_generation: number;
  u_final: number;
  status: "AUTOMATED_READY" | "FLAGGED_FOR_REVIEW";
}

export interface CxrAnalysis {
  classification: ClassificationLabel[];
  report: { findings: string; impression: string };
  regions_of_interest: RegionOfInterest[];
  agent_trace: AgentTrace;
  uncertainty: Uncertainty;
  disclaimer: string;
  case_id?: string;
  processed_at?: string;
}

export type Stage = 'dashboard' | 'idea' | 'canvas' | 'finance' | 'decision' | 'pitch';

export interface StartupData {
  idea: string;
  targetAudience: string;
  problemSolved: string;
  revenueModel: string;
  initialCapital: number;
  monthlyBurn: number;
  marketShare: number;
  teamSize: number;
  reputation: number;
}

export interface DecisionOption {
  id: string;
  label: string;
  description: string;
  impact: {
    shortTerm: string;
    longTerm: string;
    financial: number; // Change in capital
    marketShare: number; // Change in market share
    reputation: number; // Change in reputation
  };
}

export interface DecisionPoint {
  title: string;
  context: string;
  options: DecisionOption[];
}

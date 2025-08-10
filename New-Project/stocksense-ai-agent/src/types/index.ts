// Agent and User Types
export interface UserProfile {
  id: string;
  expertiseLevel: 'beginner' | 'intermediate' | 'advanced';
  searchHistory: string[];
  clickPatterns: ClickEvent[];
  timeSpentOnSections: Record<string, number>;
  preferredSectors: string[];
  lastActive: Date;
}

export interface ClickEvent {
  timestamp: Date;
  element: string;
  section: string;
  duration: number;
}

// Market Data Types
export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  sentiment: SentimentData;
  sector: string;
  marketCap: number;
}

export interface SentimentData {
  score: number; // -1 to 1
  label: 'bearish' | 'neutral' | 'bullish';
  confidence: number;
  sources: number;
  keywords: string[];
}

export interface MarketCondition {
  overall: SentimentData;
  vix: number;
  trend: 'up' | 'down' | 'sideways';
  volatility: 'low' | 'medium' | 'high';
}

// Agent System Types
export interface AgentObservation {
  marketData: StockData[];
  marketCondition: MarketCondition;
  userBehavior: UserProfile;
  timestamp: Date;
}

export interface AgentThought {
  marketAnalysis: string;
  userAnalysis: string;
  recommendations: string[];
  urgency: 'low' | 'medium' | 'high';
  suggestedActions: AgentAction[];
}

// Payload interfaces for different action types
export interface UIChangePayload {
  theme: 'default' | 'red' | 'green' | 'blue' | 'orange';
  message: string;
}

export interface ModeSwitchPayload {
  mode: 'beginner' | 'intermediate' | 'advanced';
  showTooltips?: boolean;
  showAdvancedMetrics?: boolean;
}

export interface ContentUpdatePayload {
  marketAnalysis: string;
  userAnalysis: string;
  timestamp: string;
}

export interface NotificationPayload {
  message: string;
}

export interface AgentAction {
  type: 'ui_change' | 'notification' | 'mode_switch' | 'content_update';
  target: string;
  payload: UIChangePayload | ModeSwitchPayload | ContentUpdatePayload | NotificationPayload;
  priority: number;
}

export interface AgentState {
  isActive: boolean;
  lastObservation: AgentObservation | null;
  lastThought: AgentThought | null;
  actions: AgentAction[];
  cycleCount: number;
}

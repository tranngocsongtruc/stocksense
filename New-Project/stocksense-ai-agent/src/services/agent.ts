import type { AgentObservation, AgentThought, AgentAction, AgentState, UserProfile, MarketCondition, StockData, UIChangePayload, ModeSwitchPayload, ContentUpdatePayload } from '../types';

class StockSenseAgent {
  private state: AgentState;
  private observers: ((action: AgentAction) => void)[] = [];
  private cycleInterval: number | null = null;

  constructor() {
    this.state = {
      isActive: false,
      lastObservation: null,
      lastThought: null,
      actions: [],
      cycleCount: 0
    };
  }

  // Start the agent loop
  start() {
    if (this.state.isActive) return;

    this.state.isActive = true;
    console.log('🤖 StockSense Agent activated');

    // Run the agent cycle every 5 seconds
    this.cycleInterval = setInterval(() => {
      this.runCycle();
    }, 5000);

    // Run initial cycle
    this.runCycle();
  }

  stop() {
    this.state.isActive = false;
    if (this.cycleInterval) {
      clearInterval(this.cycleInterval);
      this.cycleInterval = null;
    }
    console.log('🤖 StockSense Agent deactivated');
  }

  // Subscribe to agent actions
  subscribe(callback: (action: AgentAction) => void) {
    this.observers.push(callback);
  }

  // Main agent cycle: Observe → Think → Act
  private async runCycle() {
    try {
      console.log(`🔄 Agent cycle ${this.state.cycleCount + 1} starting...`);

      // 1. OBSERVE
      const observation = await this.observe();
      this.state.lastObservation = observation;

      // 2. THINK
      const thought = await this.think(observation);
      this.state.lastThought = thought;

      // 3. ACT
      await this.act(thought.suggestedActions);

      this.state.cycleCount++;
      console.log(`✅ Agent cycle ${this.state.cycleCount} completed`);

    } catch (error) {
      console.error('❌ Agent cycle error:', error);
    }
  }

  // OBSERVE: Gather market data and user behavior
  private async observe(): Promise<AgentObservation> {
    console.log('👀 Observing market and user data...');

    // Get market data (mock for now, replace with real APIs)
    const marketData = await this.getMarketData();
    const marketCondition = await this.getMarketCondition();
    const userBehavior = this.getUserBehavior();

    return {
      marketData,
      marketCondition,
      userBehavior,
      timestamp: new Date()
    };
  }

  // THINK: Analyze observations and plan actions
  private async think(observation: AgentObservation): Promise<AgentThought> {
    console.log('🧠 Analyzing data and planning actions...');

    const marketAnalysis = this.analyzeMarket(observation.marketCondition, observation.marketData);
    const userAnalysis = this.analyzeUser(observation.userBehavior);
    const recommendations = this.generateRecommendations(marketAnalysis, userAnalysis);
    const urgency = this.assessUrgency(observation);
    const suggestedActions = this.planActions(marketAnalysis, userAnalysis, urgency);

    return {
      marketAnalysis,
      userAnalysis,
      recommendations,
      urgency,
      suggestedActions
    };
  }

  // ACT: Execute planned actions
  private async act(actions: AgentAction[]) {
    console.log(`⚡ Executing ${actions.length} actions...`);

    // Sort actions by priority
    const sortedActions = actions.sort((a, b) => b.priority - a.priority);

    for (const action of sortedActions) {
      this.executeAction(action);
      this.state.actions.push(action);
    }
  }

  // Execute individual action and notify observers
  private executeAction(action: AgentAction) {
    console.log(`🎯 Executing action: ${action.type} on ${action.target}`);

    // Notify all observers (UI components) about the action
    for (const callback of this.observers) {
      callback(action);
    }
  }

  // Market analysis logic
  private analyzeMarket(condition: MarketCondition, stocks: StockData[]): string {
    const bearishStocks = stocks.filter(s => s.sentiment.label === 'bearish').length;
    const bullishStocks = stocks.filter(s => s.sentiment.label === 'bullish').length;

    if (condition.overall.score < -0.3) {
      return `Market sentiment is strongly bearish (${condition.overall.score.toFixed(2)}). ${bearishStocks}/${stocks.length} stocks showing negative sentiment.`;
    }
    if (condition.overall.score > 0.3) {
      return `Market sentiment is bullish (${condition.overall.score.toFixed(2)}). ${bullishStocks}/${stocks.length} stocks showing positive sentiment.`;
    }
    return `Market sentiment is neutral (${condition.overall.score.toFixed(2)}). Mixed signals across sectors.`;
  }

  // User behavior analysis
  private analyzeUser(user: UserProfile): string {
    const recentSearches = user.searchHistory.slice(-5);
    const totalInteractions = user.clickPatterns.length;

    return `User expertise: ${user.expertiseLevel}. Recent focus: ${recentSearches.join(', ')}. Activity level: ${totalInteractions} interactions.`;
  }

  // Generate contextual recommendations
  private generateRecommendations(marketAnalysis: string, userAnalysis: string): string[] {
    const recommendations = [];

    if (marketAnalysis.includes('bearish')) {
      recommendations.push('Consider defensive positions');
      recommendations.push('Monitor VIX levels closely');
    }

    if (userAnalysis.includes('beginner')) {
      recommendations.push('Focus on educational content');
      recommendations.push('Simplify technical indicators');
    }

    return recommendations;
  }

  // Assess situation urgency
  private assessUrgency(observation: AgentObservation): 'low' | 'medium' | 'high' {
    const sentiment = observation.marketCondition.overall.score;
    const volatility = observation.marketCondition.volatility;

    if (Math.abs(sentiment) > 0.7 || volatility === 'high') {
      return 'high';
    }
    if (Math.abs(sentiment) > 0.3 || volatility === 'medium') {
      return 'medium';
    }
    return 'low';
  }

  // Plan specific actions based on analysis
  private planActions(marketAnalysis: string, userAnalysis: string, urgency: 'low' | 'medium' | 'high'): AgentAction[] {
    const actions: AgentAction[] = [];

    // Market-driven actions
    if (marketAnalysis.includes('bearish')) {
      const payload: UIChangePayload = {
        theme: 'red',
        message: 'Market Alert: Bearish conditions detected'
      };

      actions.push({
        type: 'ui_change',
        target: 'theme',
        payload,
        priority: urgency === 'high' ? 10 : 5
      });
    }

    // User expertise-driven actions
    if (userAnalysis.includes('beginner')) {
      const payload: ModeSwitchPayload = {
        mode: 'beginner',
        showTooltips: true
      };

      actions.push({
        type: 'mode_switch',
        target: 'interface',
        payload,
        priority: 3
      });
    } else if (userAnalysis.includes('advanced')) {
      const payload: ModeSwitchPayload = {
        mode: 'advanced',
        showAdvancedMetrics: true
      };

      actions.push({
        type: 'mode_switch',
        target: 'interface',
        payload,
        priority: 3
      });
    }

    // Content updates
    const contentPayload: ContentUpdatePayload = {
      marketAnalysis,
      userAnalysis,
      timestamp: new Date().toISOString()
    };

    actions.push({
      type: 'content_update',
      target: 'dashboard',
      payload: contentPayload,
      priority: 2
    });

    return actions;
  }

  // Mock data methods (replace with real APIs)
  private async getMarketData(): Promise<StockData[]> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return [
      {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        price: 174.50,
        change: -2.30,
        changePercent: -1.3,
        sentiment: { score: 0.2, label: 'bullish', confidence: 0.7, sources: 45, keywords: ['innovation', 'AI', 'growth'] },
        sector: 'Technology',
        marketCap: 2800000000
      },
      {
        symbol: 'TSLA',
        name: 'Tesla Inc.',
        price: 248.50,
        change: -12.80,
        changePercent: -4.9,
        sentiment: { score: -0.4, label: 'bearish', confidence: 0.8, sources: 67, keywords: ['volatility', 'concerns', 'decline'] },
        sector: 'Automotive',
        marketCap: 790000000
      },
      {
        symbol: 'NVDA',
        name: 'NVIDIA Corporation',
        price: 421.30,
        change: 8.90,
        changePercent: 2.2,
        sentiment: { score: 0.6, label: 'bullish', confidence: 0.9, sources: 89, keywords: ['AI', 'chips', 'demand'] },
        sector: 'Technology',
        marketCap: 1040000000
      }
    ];
  }

  private async getMarketCondition(): Promise<MarketCondition> {
    await new Promise(resolve => setTimeout(resolve, 50));

    return {
      overall: { score: 0.1, label: 'neutral', confidence: 0.6, sources: 156, keywords: ['mixed', 'uncertain'] },
      vix: 18.5,
      trend: 'sideways',
      volatility: 'medium'
    };
  }

  private getUserBehavior(): UserProfile {
    // Get from localStorage or create default
    const stored = localStorage.getItem('stocksense_user_profile');
    if (stored) {
      return JSON.parse(stored);
    }

    return {
      id: `user_${Date.now()}`,
      expertiseLevel: 'intermediate',
      searchHistory: ['AAPL', 'market sentiment', 'volatility'],
      clickPatterns: [],
      timeSpentOnSections: {},
      preferredSectors: ['Technology'],
      lastActive: new Date()
    };
  }

  // Getters for UI
  getState(): AgentState {
    return { ...this.state };
  }
}

export const stockSenseAgent = new StockSenseAgent();

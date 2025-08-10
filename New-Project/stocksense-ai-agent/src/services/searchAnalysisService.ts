import axios from 'axios';

// Finance knowledge complexity levels
interface FinanceKnowledgeLevel {
  level: 'beginner' | 'intermediate' | 'advanced';
  confidence: number;
  reasoning: string;
  suggestedContent: string[];
}

interface SearchAnalysisResult {
  term: string;
  knowledgeLevel: FinanceKnowledgeLevel;
  relatedConcepts: string[];
  definition: string;
  complexity: number;
}

// Financial term complexity database
const FINANCE_TERMS_DB = {
  beginner: [
    'stock', 'share', 'buy', 'sell', 'profit', 'loss', 'dividend', 'company',
    'investment', 'portfolio', 'broker', 'market', 'price', 'trading',
    'nasdaq', 'dow jones', 'sp500', 's&p 500', 'bull market', 'bear market'
  ],
  intermediate: [
    'pe ratio', 'earnings', 'revenue', 'market cap', 'volume', 'support',
    'resistance', 'trend', 'technical analysis', 'fundamental analysis',
    'rsi', 'moving average', 'macd', 'candlestick', 'ema', 'bollinger bands',
    'eps', 'roe', 'debt to equity', 'price to book', 'quarterly earnings'
  ],
  advanced: [
    'vix', 'volatility', 'beta', 'alpha', 'sharpe ratio', 'options', 'derivatives',
    'futures', 'margin', 'leverage', 'arbitrage', 'hedge', 'correlation',
    'standard deviation', 'fibonacci', 'stochastic', 'ichimoku', 'elliott wave',
    'black scholes', 'greeks', 'delta', 'gamma', 'theta', 'vega', 'implied volatility'
  ]
};

class SearchAnalysisService {
  private searchHistory: SearchAnalysisResult[] = [];

  // Analyze search term complexity and determine user knowledge level
  async analyzeSearchTerm(searchTerm: string): Promise<SearchAnalysisResult> {
    const normalizedTerm = searchTerm.toLowerCase().trim();

    // Determine base complexity from our database
    const complexity = this.calculateTermComplexity(normalizedTerm);

    // Get additional context from search APIs
    const searchContext = await this.getSearchContext(searchTerm);

    // Analyze knowledge level based on term and context
    const knowledgeLevel = this.determineKnowledgeLevel(normalizedTerm, complexity, searchContext);

    // Extract related concepts
    const relatedConcepts = this.extractRelatedConcepts(normalizedTerm, searchContext);

    const result: SearchAnalysisResult = {
      term: searchTerm,
      knowledgeLevel,
      relatedConcepts,
      definition: searchContext.definition || `Financial term: ${searchTerm}`,
      complexity
    };

    // Store in history for pattern analysis
    this.searchHistory.push(result);
    this.searchHistory = this.searchHistory.slice(-20); // Keep last 20 searches

    console.log('🔍 Search Analysis:', result);

    return result;
  }

  // Calculate term complexity based on financial knowledge database
  private calculateTermComplexity(term: string): number {
    // Check if term matches any category
    if (FINANCE_TERMS_DB.beginner.some(t => term.includes(t) || t.includes(term))) {
      return 1; // Beginner level
    }

    if (FINANCE_TERMS_DB.intermediate.some(t => term.includes(t) || t.includes(term))) {
      return 2; // Intermediate level
    }

    if (FINANCE_TERMS_DB.advanced.some(t => term.includes(t) || t.includes(term))) {
      return 3; // Advanced level
    }

    // Analyze term structure for complexity indicators
    const complexityIndicators = [
      'ratio', 'analysis', 'strategy', 'model', 'theory', 'algorithm',
      'derivative', 'quantitative', 'statistical', 'mathematical'
    ];

    const hasComplexityIndicators = complexityIndicators.some(indicator =>
      term.includes(indicator)
    );

    // Default complexity based on term length and indicators
    if (hasComplexityIndicators || term.split(' ').length > 2) {
      return 2.5; // Intermediate-Advanced
    }

    return 1.5; // Beginner-Intermediate
  }

  // Get search context from multiple sources
  private async getSearchContext(searchTerm: string): Promise<{
    definition: string;
    relatedTerms: string[];
    searchResults: any[];
  }> {
    try {
      // Use DuckDuckGo Instant Answer API (free, no auth required)
      const duckDuckGoResults = await this.queryDuckDuckGo(searchTerm);

      // Use JSONPlaceholder for additional context (demo API)
      const additionalContext = await this.getFinanceContext(searchTerm);

      return {
        definition: duckDuckGoResults.definition || additionalContext.definition,
        relatedTerms: [...duckDuckGoResults.relatedTerms, ...additionalContext.relatedTerms],
        searchResults: duckDuckGoResults.results
      };
    } catch (error) {
      console.error('Search context error:', error);

      // Fallback to local analysis
      return {
        definition: `Financial term related to: ${searchTerm}`,
        relatedTerms: this.getLocalRelatedTerms(searchTerm),
        searchResults: []
      };
    }
  }

  // Query DuckDuckGo Instant Answer API
  private async queryDuckDuckGo(query: string): Promise<{
    definition: string;
    relatedTerms: string[];
    results: any[];
  }> {
    try {
      // DuckDuckGo Instant Answer API
      const response = await axios.get(`https://api.duckduckgo.com/`, {
        params: {
          q: `${query} finance definition`,
          format: 'json',
          no_html: '1',
          skip_disambig: '1'
        },
        timeout: 3000
      });

      const data = response.data;

      return {
        definition: data.Abstract || data.Definition || '',
        relatedTerms: data.RelatedTopics?.slice(0, 5).map((topic: any) =>
          topic.Text?.split(' ')[0] || ''
        ).filter(Boolean) || [],
        results: data.RelatedTopics || []
      };
    } catch (error) {
      console.log('DuckDuckGo API not available, using fallback');
      return {
        definition: '',
        relatedTerms: [],
        results: []
      };
    }
  }

  // Get finance context using a mock finance API
  private async getFinanceContext(term: string): Promise<{
    definition: string;
    relatedTerms: string[];
  }> {
    // Simulate finance knowledge API call
    const financeDefinitions: Record<string, any> = {
      'pe ratio': {
        definition: 'Price-to-Earnings ratio measures company valuation relative to earnings',
        related: ['earnings', 'valuation', 'financial metrics', 'stock analysis']
      },
      'volatility': {
        definition: 'Measure of price fluctuation in financial instruments over time',
        related: ['risk', 'standard deviation', 'VIX', 'market uncertainty']
      },
      'options': {
        definition: 'Financial derivatives giving the right to buy/sell assets at specific prices',
        related: ['derivatives', 'calls', 'puts', 'strike price', 'expiration']
      },
      'dividend': {
        definition: 'Payment made by companies to shareholders from profits',
        related: ['yield', 'payout ratio', 'ex-dividend date', 'income investing']
      }
    };

    const normalizedTerm = term.toLowerCase();
    const matchedTerm = Object.keys(financeDefinitions).find(key =>
      normalizedTerm.includes(key) || key.includes(normalizedTerm)
    );

    if (matchedTerm) {
      const info = financeDefinitions[matchedTerm];
      return {
        definition: info.definition,
        relatedTerms: info.related
      };
    }

    return {
      definition: `Advanced financial concept: ${term}`,
      relatedTerms: this.getLocalRelatedTerms(term)
    };
  }

  // Get locally related terms
  private getLocalRelatedTerms(term: string): string[] {
    const termLower = term.toLowerCase();
    const allTerms = [
      ...FINANCE_TERMS_DB.beginner,
      ...FINANCE_TERMS_DB.intermediate,
      ...FINANCE_TERMS_DB.advanced
    ];

    // Find terms that share common words
    return allTerms
      .filter(t => {
        const words = termLower.split(' ');
        const termWords = t.split(' ');
        return words.some(word => termWords.some(tWord =>
          word.includes(tWord) || tWord.includes(word)
        ));
      })
      .slice(0, 4);
  }

  // Determine user knowledge level based on search analysis
  private determineKnowledgeLevel(
    term: string,
    complexity: number,
    context: any
  ): FinanceKnowledgeLevel {
    // Analyze search history pattern
    const recentComplexity = this.searchHistory
      .slice(-5)
      .map(s => s.complexity)
      .reduce((avg, c) => avg + c, 0) / Math.max(this.searchHistory.slice(-5).length, 1);

    const avgComplexity = (complexity + recentComplexity) / 2;

    if (avgComplexity <= 1.3) {
      return {
        level: 'beginner',
        confidence: 0.8,
        reasoning: 'Searching basic financial terms and concepts',
        suggestedContent: [
          'Basic investment principles',
          'How stock markets work',
          'Understanding dividends',
          'Investment terminology'
        ]
      };
    } else if (avgComplexity <= 2.2) {
      return {
        level: 'intermediate',
        confidence: 0.85,
        reasoning: 'Exploring technical analysis and financial metrics',
        suggestedContent: [
          'Technical indicators',
          'Financial statement analysis',
          'Portfolio diversification',
          'Risk management strategies'
        ]
      };
    } else {
      return {
        level: 'advanced',
        confidence: 0.9,
        reasoning: 'Researching complex derivatives and quantitative analysis',
        suggestedContent: [
          'Options strategies',
          'Quantitative models',
          'Risk metrics',
          'Advanced portfolio theory'
        ]
      };
    }
  }

  // Extract related concepts from search context
  private extractRelatedConcepts(term: string, context: any): string[] {
    const concepts = new Set<string>();

    // Add related terms from context
    if (context.relatedTerms) {
      context.relatedTerms.forEach((related: string) => concepts.add(related));
    }

    // Add contextually related terms based on the search term
    const contextualTerms = this.getContextualTerms(term);
    contextualTerms.forEach(t => concepts.add(t));

    return Array.from(concepts).slice(0, 6);
  }

  // Get contextually related terms
  private getContextualTerms(term: string): string[] {
    const termLower = term.toLowerCase();

    // Context mapping
    const contextMap: Record<string, string[]> = {
      'stock': ['equity', 'shares', 'market cap', 'dividend'],
      'option': ['derivative', 'call', 'put', 'strike price'],
      'technical': ['chart', 'indicator', 'trend', 'support'],
      'fundamental': ['earnings', 'revenue', 'valuation', 'growth'],
      'risk': ['volatility', 'beta', 'correlation', 'hedge'],
      'portfolio': ['diversification', 'allocation', 'rebalancing', 'return']
    };

    for (const [key, related] of Object.entries(contextMap)) {
      if (termLower.includes(key)) {
        return related;
      }
    }

    return [];
  }

  // Get overall user knowledge assessment
  getUserKnowledgeAssessment(): {
    level: 'beginner' | 'intermediate' | 'advanced';
    confidence: number;
    searchPattern: string;
    recommendations: string[];
  } {
    if (this.searchHistory.length === 0) {
      return {
        level: 'beginner',
        confidence: 0.5,
        searchPattern: 'No search history available',
        recommendations: ['Start with basic investment concepts']
      };
    }

    // Calculate average complexity and determine pattern
    const avgComplexity = this.searchHistory
      .reduce((sum, search) => sum + search.complexity, 0) / this.searchHistory.length;

    const recentSearches = this.searchHistory.slice(-3);
    const isProgressing = recentSearches.length > 1 &&
      recentSearches[recentSearches.length - 1].complexity > recentSearches[0].complexity;

    let level: 'beginner' | 'intermediate' | 'advanced';
    let confidence: number;
    let searchPattern: string;

    if (avgComplexity <= 1.4) {
      level = 'beginner';
      confidence = 0.8;
      searchPattern = 'Focusing on basic financial concepts';
    } else if (avgComplexity <= 2.3) {
      level = 'intermediate';
      confidence = 0.85;
      searchPattern = 'Exploring technical and analytical concepts';
    } else {
      level = 'advanced';
      confidence = 0.9;
      searchPattern = 'Researching complex financial instruments';
    }

    if (isProgressing) {
      searchPattern += ' with increasing complexity';
      confidence = Math.min(confidence + 0.1, 1.0);
    }

    const recommendations = this.getPersonalizedRecommendations(level, recentSearches);

    return {
      level,
      confidence,
      searchPattern,
      recommendations
    };
  }

  // Get personalized recommendations based on search pattern
  private getPersonalizedRecommendations(
    level: 'beginner' | 'intermediate' | 'advanced',
    recentSearches: SearchAnalysisResult[]
  ): string[] {
    const baseRecommendations = {
      beginner: [
        'Learn about different types of investments',
        'Understand risk vs return',
        'Start with index funds or ETFs'
      ],
      intermediate: [
        'Study financial statement analysis',
        'Learn about portfolio diversification',
        'Explore different asset classes'
      ],
      advanced: [
        'Research options strategies',
        'Study quantitative analysis methods',
        'Explore alternative investments'
      ]
    };

    const base = baseRecommendations[level];

    // Add personalized recommendations based on search history
    const searchTopics = recentSearches.map(s => s.term.toLowerCase());

    if (searchTopics.some(t => t.includes('dividend'))) {
      base.push('Explore dividend growth investing strategies');
    }

    if (searchTopics.some(t => t.includes('technical') || t.includes('chart'))) {
      base.push('Study advanced technical analysis patterns');
    }

    if (searchTopics.some(t => t.includes('option') || t.includes('derivative'))) {
      base.push('Learn about risk management with derivatives');
    }

    return base.slice(0, 4);
  }

  // Clear search history (for demo purposes)
  clearHistory(): void {
    this.searchHistory = [];
  }

  // Get search history for analysis
  getSearchHistory(): SearchAnalysisResult[] {
    return [...this.searchHistory];
  }
}

export const searchAnalysisService = new SearchAnalysisService();

import axios from 'axios';

// News API configuration
const NEWS_API_BASE_URL = 'https://newsapi.org/v2';
const NEWS_API_KEY = 'demo'; // Using demo key - replace with real key: process.env.NEWS_API_KEY || 'demo';

export interface NewsArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string;
  category: 'politics' | 'business' | 'technology' | 'general';
  impact: 'high' | 'medium' | 'low';
  affectedSectors: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
}

export interface MarketNews {
  breakingNews: NewsArticle[];
  politicalNews: NewsArticle[];
  businessNews: NewsArticle[];
  sectorNews: Record<string, NewsArticle[]>;
}

class NewsService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = NEWS_API_KEY;
    this.baseUrl = NEWS_API_BASE_URL;
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    try {
      const response = await axios.get(`${this.baseUrl}${endpoint}`, {
        params: {
          ...params,
          apiKey: this.apiKey
        },
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      console.error('News API error:', error);
      // Return mock data for demo purposes
      return this.getMockData(endpoint, params) as T;
    }
  }

  // Get breaking news that could impact markets
  async getBreakingNews(): Promise<NewsArticle[]> {
    const data = await this.makeRequest<{ articles: any[] }>('/top-headlines', {
      category: 'business',
      country: 'us',
      pageSize: 10
    });

    return this.enhanceNewsData(data.articles || []);
  }

  // Get political news that could affect markets
  async getPoliticalNews(): Promise<NewsArticle[]> {
    const data = await this.makeRequest<{ articles: any[] }>('/everything', {
      q: 'politics AND (market OR economy OR trade OR regulation OR policy)',
      sortBy: 'publishedAt',
      pageSize: 15,
      language: 'en'
    });

    return this.enhanceNewsData(data.articles || [], 'politics');
  }

  // Get sector-specific news
  async getSectorNews(sectors: string[]): Promise<Record<string, NewsArticle[]>> {
    const sectorNews: Record<string, NewsArticle[]> = {};

    for (const sector of sectors) {
      const query = this.getSectorQuery(sector);
      const data = await this.makeRequest<{ articles: any[] }>('/everything', {
        q: query,
        sortBy: 'publishedAt',
        pageSize: 5,
        language: 'en'
      });

      sectorNews[sector] = this.enhanceNewsData(data.articles || [], 'business', [sector]);
    }

    return sectorNews;
  }

  // Get comprehensive market news
  async getMarketNews(): Promise<MarketNews> {
    const [breakingNews, politicalNews, sectorNews] = await Promise.all([
      this.getBreakingNews(),
      this.getPoliticalNews(),
      this.getSectorNews(['Technology', 'Healthcare', 'Finance', 'Energy'])
    ]);

    const businessNews = breakingNews.filter(article =>
      article.category === 'business' && !article.title.toLowerCase().includes('politics')
    );

    return {
      breakingNews: breakingNews.slice(0, 5),
      politicalNews: politicalNews.slice(0, 5),
      businessNews: businessNews.slice(0, 5),
      sectorNews
    };
  }

  // Enhance news data with market impact analysis
  private enhanceNewsData(articles: any[], defaultCategory = 'business', affectedSectors: string[] = []): NewsArticle[] {
    return articles.map(article => ({
      source: article.source,
      author: article.author,
      title: article.title,
      description: article.description || '',
      url: article.url,
      urlToImage: article.urlToImage,
      publishedAt: article.publishedAt,
      content: article.content || '',
      category: this.categorizeNews(article.title, article.description),
      impact: this.assessImpact(article.title, article.description),
      affectedSectors: affectedSectors.length > 0 ? affectedSectors : this.identifyAffectedSectors(article.title, article.description),
      sentiment: this.analyzeSentiment(article.title, article.description)
    }));
  }

  // Categorize news articles
  private categorizeNews(title: string, description: string): 'politics' | 'business' | 'technology' | 'general' {
    const text = `${title} ${description}`.toLowerCase();

    if (text.includes('politic') || text.includes('congress') || text.includes('senate') || text.includes('government') || text.includes('regulation') || text.includes('policy')) {
      return 'politics';
    }
    if (text.includes('tech') || text.includes('ai') || text.includes('software') || text.includes('chip') || text.includes('semiconductor')) {
      return 'technology';
    }
    if (text.includes('business') || text.includes('market') || text.includes('stock') || text.includes('earnings') || text.includes('revenue')) {
      return 'business';
    }

    return 'general';
  }

  // Assess market impact level
  private assessImpact(title: string, description: string): 'high' | 'medium' | 'low' {
    const text = `${title} ${description}`.toLowerCase();

    const highImpactKeywords = ['breaking', 'federal reserve', 'interest rate', 'inflation', 'recession', 'crisis', 'bankruptcy', 'merger', 'acquisition', 'earnings beat', 'earnings miss'];
    const mediumImpactKeywords = ['regulation', 'policy', 'guidance', 'forecast', 'outlook', 'upgrade', 'downgrade'];

    if (highImpactKeywords.some(keyword => text.includes(keyword))) {
      return 'high';
    }
    if (mediumImpactKeywords.some(keyword => text.includes(keyword))) {
      return 'medium';
    }

    return 'low';
  }

  // Identify affected sectors
  private identifyAffectedSectors(title: string, description: string): string[] {
    const text = `${title} ${description}`.toLowerCase();
    const sectors: string[] = [];

    const sectorKeywords = {
      'Technology': ['tech', 'ai', 'software', 'chip', 'semiconductor', 'cloud', 'digital'],
      'Healthcare': ['health', 'pharma', 'medical', 'drug', 'biotech', 'vaccine'],
      'Finance': ['bank', 'financial', 'credit', 'loan', 'payment', 'fintech'],
      'Energy': ['oil', 'gas', 'renewable', 'solar', 'wind', 'energy'],
      'Consumer': ['retail', 'consumer', 'shopping', 'brand'],
      'Automotive': ['auto', 'car', 'electric vehicle', 'transportation'],
      'Real Estate': ['real estate', 'housing', 'property', 'mortgage'],
      'Aerospace': ['aerospace', 'defense', 'airline', 'aviation'],
      'Telecom': ['telecom', 'wireless', 'mobile', '5g'],
      'Entertainment': ['media', 'entertainment', 'streaming', 'gaming']
    };

    for (const [sector, keywords] of Object.entries(sectorKeywords)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        sectors.push(sector);
      }
    }

    return sectors;
  }

  // Analyze sentiment
  private analyzeSentiment(title: string, description: string): 'positive' | 'negative' | 'neutral' {
    const text = `${title} ${description}`.toLowerCase();

    const positiveKeywords = ['gain', 'growth', 'profit', 'beat', 'exceed', 'strong', 'positive', 'bullish', 'upgrade', 'success'];
    const negativeKeywords = ['loss', 'decline', 'fall', 'miss', 'weak', 'negative', 'bearish', 'downgrade', 'crisis', 'concern'];

    const positiveCount = positiveKeywords.filter(keyword => text.includes(keyword)).length;
    const negativeCount = negativeKeywords.filter(keyword => text.includes(keyword)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  // Get sector-specific search query
  private getSectorQuery(sector: string): string {
    const queries = {
      'Technology': 'technology OR tech OR AI OR software OR semiconductor OR chip',
      'Healthcare': 'healthcare OR pharma OR medical OR biotech OR drug',
      'Finance': 'finance OR bank OR fintech OR payment OR credit',
      'Energy': 'energy OR oil OR gas OR renewable OR solar',
      'Consumer': 'retail OR consumer OR brand OR shopping',
      'Automotive': 'automotive OR car OR electric vehicle OR EV',
      'Real Estate': 'real estate OR housing OR property OR REIT',
      'Aerospace': 'aerospace OR defense OR airline OR aviation',
      'Telecom': 'telecom OR wireless OR mobile OR 5G',
      'Entertainment': 'entertainment OR media OR streaming OR gaming'
    };

    return queries[sector as keyof typeof queries] || sector;
  }

  // Mock data for demo purposes
  private getMockData(endpoint: string, params: any): any {
    const currentTime = new Date().toISOString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    if (endpoint === '/top-headlines') {
      return {
        articles: [
          {
            source: { id: 'reuters', name: 'Reuters' },
            author: 'Reuters Staff',
            title: 'Fed Signals Potential Rate Cut as Inflation Cools',
            description: 'Federal Reserve officials hint at monetary policy changes following latest inflation data, potentially impacting all sectors.',
            url: 'https://example.com/fed-rates',
            urlToImage: 'https://via.placeholder.com/400x200',
            publishedAt: currentTime,
            content: 'Federal Reserve officials are considering policy adjustments...'
          },
          {
            source: { id: 'bloomberg', name: 'Bloomberg' },
            author: 'Bloomberg News',
            title: 'Tech Stocks Rally on AI Earnings Beat',
            description: 'Major technology companies exceed earnings expectations, driven by artificial intelligence revenue growth.',
            url: 'https://example.com/tech-rally',
            urlToImage: 'https://via.placeholder.com/400x200',
            publishedAt: currentTime,
            content: 'Technology sector shows strong performance...'
          },
          {
            source: { id: 'cnbc', name: 'CNBC' },
            title: 'Oil Prices Surge on Geopolitical Tensions',
            description: 'Energy sector sees significant gains as international conflicts affect global oil supply chains.',
            url: 'https://example.com/oil-surge',
            urlToImage: 'https://via.placeholder.com/400x200',
            publishedAt: yesterday,
            content: 'Energy markets respond to international developments...'
          }
        ]
      };
    }

    if (endpoint === '/everything' && params.q?.includes('politics')) {
      return {
        articles: [
          {
            source: { id: 'politico', name: 'Politico' },
            title: 'Senate Passes New Tech Regulation Bill',
            description: 'Bipartisan legislation targets big tech companies with new privacy and antitrust measures, potentially affecting technology sector valuations.',
            url: 'https://example.com/tech-regulation',
            urlToImage: 'https://via.placeholder.com/400x200',
            publishedAt: currentTime,
            content: 'The Senate voted to approve comprehensive technology regulation...'
          },
          {
            source: { id: 'washingtonpost', name: 'Washington Post' },
            title: 'Healthcare Policy Changes Under Congressional Review',
            description: 'Proposed healthcare reforms could significantly impact pharmaceutical and insurance companies.',
            url: 'https://example.com/healthcare-policy',
            urlToImage: 'https://via.placeholder.com/400x200',
            publishedAt: yesterday,
            content: 'Congressional committees are reviewing healthcare policy changes...'
          }
        ]
      };
    }

    // Sector-specific news
    return {
      articles: [
        {
          source: { id: 'techcrunch', name: 'TechCrunch' },
          title: 'AI Breakthrough Drives Semiconductor Demand',
          description: 'New artificial intelligence capabilities require advanced chip architectures, boosting semiconductor sector outlook.',
          url: 'https://example.com/ai-chips',
          urlToImage: 'https://via.placeholder.com/400x200',
          publishedAt: currentTime,
          content: 'Artificial intelligence developments are creating new demand...'
        }
      ]
    };
  }

  // Analyze news for different user levels
  analyzeNewsImpact(news: NewsArticle[], userLevel: 'beginner' | 'intermediate' | 'advanced'): any {
    const highImpactNews = news.filter(article => article.impact === 'high');
    const politicalNews = news.filter(article => article.category === 'politics');
    const sectorImpacts = this.aggregateSectorImpacts(news);

    switch (userLevel) {
      case 'beginner':
        return {
          summary: `${highImpactNews.length} important news items may affect your stocks`,
          keyPoints: [
            highImpactNews.length > 0 ? `${highImpactNews[0].title.substring(0, 60)}...` : 'No major market-moving news',
            politicalNews.length > 0 ? 'Government news may affect markets' : 'No major political news',
            `Most affected: ${Object.keys(sectorImpacts)[0] || 'No specific sectors'}`
          ],
          recommendation: highImpactNews.length > 2 ? 'Watch your investments closely today' : 'Normal market conditions'
        };

      case 'intermediate':
        return {
          summary: `Market news analysis: ${news.length} articles reviewed`,
          insights: [
            `High impact events: ${highImpactNews.length}`,
            `Political/regulatory news: ${politicalNews.length}`,
            `Affected sectors: ${Object.keys(sectorImpacts).join(', ')}`,
            `Overall sentiment: ${this.calculateOverallSentiment(news)}`
          ],
          sectorImpacts,
          recommendation: this.getIntermediateRecommendation(news)
        };

      case 'advanced':
        return {
          summary: 'Comprehensive news impact analysis',
          detailedAnalysis: {
            totalArticles: news.length,
            impactDistribution: {
              high: highImpactNews.length,
              medium: news.filter(a => a.impact === 'medium').length,
              low: news.filter(a => a.impact === 'low').length
            },
            sentimentAnalysis: {
              positive: news.filter(a => a.sentiment === 'positive').length,
              negative: news.filter(a => a.sentiment === 'negative').length,
              neutral: news.filter(a => a.sentiment === 'neutral').length
            },
            sectorExposure: sectorImpacts,
            politicalRisk: politicalNews.length,
            timeDistribution: this.analyzeTimeDistribution(news)
          },
          strategicInsights: this.getStrategicInsights(news),
          recommendation: this.getAdvancedNewsRecommendation(news)
        };

      default:
        return {};
    }
  }

  private aggregateSectorImpacts(news: NewsArticle[]): Record<string, number> {
    const impacts: Record<string, number> = {};

    for (const article of news) {
      for (const sector of article.affectedSectors) {
        impacts[sector] = (impacts[sector] || 0) + 1;
      }
    }

    return Object.fromEntries(
      Object.entries(impacts).sort(([,a], [,b]) => b - a)
    );
  }

  private calculateOverallSentiment(news: NewsArticle[]): string {
    const sentiments = news.map(a => a.sentiment);
    const positive = sentiments.filter(s => s === 'positive').length;
    const negative = sentiments.filter(s => s === 'negative').length;

    if (positive > negative) return 'Positive';
    if (negative > positive) return 'Negative';
    return 'Neutral';
  }

  private getIntermediateRecommendation(news: NewsArticle[]): string {
    const highImpact = news.filter(a => a.impact === 'high').length;
    const negativeNews = news.filter(a => a.sentiment === 'negative').length;

    if (highImpact > 2 && negativeNews > highImpact / 2) {
      return 'High volatility expected - consider defensive positions';
    }
    if (highImpact > 1) {
      return 'Monitor positions closely - significant news flow';
    }
    return 'Normal news cycle - maintain current strategy';
  }

  private analyzeTimeDistribution(news: NewsArticle[]): any {
    const last24h = news.filter(a =>
      new Date(a.publishedAt).getTime() > Date.now() - 24 * 60 * 60 * 1000
    ).length;

    return {
      last24Hours: last24h,
      older: news.length - last24h
    };
  }

  private getStrategicInsights(news: NewsArticle[]): string[] {
    const insights = [];
    const sectorImpacts = this.aggregateSectorImpacts(news);
    const topSector = Object.keys(sectorImpacts)[0];

    if (topSector) {
      insights.push(`${topSector} sector showing highest news flow - monitor for volatility`);
    }

    const politicalNews = news.filter(a => a.category === 'politics').length;
    if (politicalNews > 2) {
      insights.push('Elevated political risk - regulatory changes possible');
    }

    const highImpactNegative = news.filter(a => a.impact === 'high' && a.sentiment === 'negative').length;
    if (highImpactNegative > 1) {
      insights.push('Multiple negative catalysts present - risk management priority');
    }

    return insights;
  }

  private getAdvancedNewsRecommendation(news: NewsArticle[]): string {
    const riskScore = this.calculateNewsRiskScore(news);

    if (riskScore > 0.7) {
      return 'HIGH RISK: Multiple negative catalysts - reduce exposure, increase hedging';
    }
    if (riskScore > 0.5) {
      return 'ELEVATED RISK: Significant news flow - tighten stops, monitor closely';
    }
    if (riskScore < 0.3) {
      return 'LOW RISK: Stable news environment - normal positioning appropriate';
    }
    return 'MODERATE RISK: Mixed signals - maintain current allocations with active monitoring';
  }

  private calculateNewsRiskScore(news: NewsArticle[]): number {
    let score = 0;

    // High impact negative news
    const highNegative = news.filter(a => a.impact === 'high' && a.sentiment === 'negative').length;
    score += highNegative * 0.3;

    // Political news
    const political = news.filter(a => a.category === 'politics').length;
    score += Math.min(political * 0.1, 0.2);

    // Overall negative sentiment
    const negativeRatio = news.filter(a => a.sentiment === 'negative').length / news.length;
    score += negativeRatio * 0.3;

    return Math.min(score, 1);
  }
}

export const newsService = new NewsService();

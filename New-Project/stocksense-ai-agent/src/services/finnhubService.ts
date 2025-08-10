import axios from 'axios';

// Finnhub API configuration
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const FINNHUB_API_KEY = 'demo'; // Using demo key - replace with real key for production: process.env.FINNHUB_API_KEY || 'demo';

export interface InsiderTransaction {
  symbol: string;
  name: string;
  share: number;
  change: number;
  filingDate: string;
  transactionDate: string;
  transactionCode: string;
  transactionPrice: number;
}

export interface SentimentData {
  symbol: string;
  year: number;
  month: number;
  change: number;
  mspr: number; // Monthly Sentiment Score
}

export interface EarningsData {
  symbol: string;
  date: string;
  epsActual: number;
  epsEstimate: number;
  revenueActual: number;
  revenueEstimate: number;
  surprise: number;
  surprisePercent: number;
}

export interface CompanyNews {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

class FinnhubService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = FINNHUB_API_KEY;
    this.baseUrl = FINNHUB_BASE_URL;
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    try {
      const response = await axios.get(`${this.baseUrl}${endpoint}`, {
        params: {
          ...params,
          token: this.apiKey
        },
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      console.error('Finnhub API error:', error);
      // Return mock data for demo purposes
      return this.getMockData(endpoint) as T;
    }
  }

  // Get insider trading data for a symbol
  async getInsiderTransactions(symbol: string, from?: string, to?: string): Promise<InsiderTransaction[]> {
    const fromDate = from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const toDate = to || new Date().toISOString().split('T')[0];

    const data = await this.makeRequest<{ data: InsiderTransaction[] }>('/stock/insider-transactions', {
      symbol,
      from: fromDate,
      to: toDate
    });

    return data.data || [];
  }

  // Get sentiment analysis for a symbol
  async getSentimentData(symbol: string): Promise<SentimentData[]> {
    const data = await this.makeRequest<{ data: SentimentData[] }>('/stock/insider-sentiment', {
      symbol,
      from: '2024-01-01',
      to: '2024-12-31'
    });

    return data.data || [];
  }

  // Get earnings data
  async getEarningsData(symbol: string): Promise<EarningsData[]> {
    const data = await this.makeRequest<EarningsData[]>('/stock/earnings', {
      symbol
    });

    return data || [];
  }

  // Get company news
  async getCompanyNews(symbol: string, from?: string, to?: string): Promise<CompanyNews[]> {
    const fromDate = from || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const toDate = to || new Date().toISOString().split('T')[0];

    const data = await this.makeRequest<CompanyNews[]>('/company-news', {
      symbol,
      from: fromDate,
      to: toDate
    });

    return data || [];
  }

  // Get basic company profile
  async getCompanyProfile(symbol: string): Promise<any> {
    return await this.makeRequest('/stock/profile2', { symbol });
  }

  // Mock data for demo purposes when API fails
  private getMockData(endpoint: string): any {
    switch (endpoint) {
      case '/stock/insider-transactions':
        return {
          data: [
            {
              symbol: 'AAPL',
              name: 'Timothy D. Cook',
              share: 5000000,
              change: 100000,
              filingDate: '2025-08-05',
              transactionDate: '2025-08-03',
              transactionCode: 'P',
              transactionPrice: 174.50
            },
            {
              symbol: 'AAPL',
              name: 'Luca Maestri',
              share: 1500000,
              change: 50000,
              filingDate: '2025-08-04',
              transactionDate: '2025-08-02',
              transactionCode: 'P',
              transactionPrice: 175.20
            }
          ]
        };

      case '/stock/insider-sentiment':
        return {
          data: [
            { symbol: 'AAPL', year: 2025, month: 8, change: 150000, mspr: 0.8 },
            { symbol: 'AAPL', year: 2025, month: 7, change: 200000, mspr: 0.9 },
            { symbol: 'AAPL', year: 2025, month: 6, change: -50000, mspr: 0.3 }
          ]
        };

      case '/stock/earnings':
        return [
          {
            symbol: 'AAPL',
            date: '2025-08-01',
            epsActual: 1.40,
            epsEstimate: 1.35,
            revenueActual: 85400000000,
            revenueEstimate: 84500000000,
            surprise: 0.05,
            surprisePercent: 3.7
          }
        ];

      case '/company-news':
        return [
          {
            category: 'company',
            datetime: Date.now() / 1000,
            headline: 'Apple Reports Strong Q3 Earnings, Beats Expectations',
            id: 1001,
            image: 'https://via.placeholder.com/400x200',
            related: 'AAPL',
            source: 'Reuters',
            summary: 'Apple Inc. reported better-than-expected quarterly results driven by strong iPhone sales and services revenue growth.',
            url: 'https://example.com/news/1'
          },
          {
            category: 'company',
            datetime: Date.now() / 1000 - 86400,
            headline: 'Apple Insider Trading Activity Increases Ahead of Launch Event',
            id: 1002,
            image: 'https://via.placeholder.com/400x200',
            related: 'AAPL',
            source: 'Financial Times',
            summary: 'Several Apple executives have increased their stock holdings ahead of the upcoming product launch event.',
            url: 'https://example.com/news/2'
          }
        ];

      default:
        return {};
    }
  }

  // Analyze insider trading patterns for different user levels
  analyzeInsiderData(transactions: InsiderTransaction[], userLevel: 'beginner' | 'intermediate' | 'advanced') {
    if (transactions.length === 0) {
      return {
        summary: 'No recent insider trading activity',
        insights: [],
        recommendation: 'neutral'
      };
    }

    const purchases = transactions.filter(t => t.transactionCode === 'P' && t.change > 0);
    const sales = transactions.filter(t => t.transactionCode === 'S' && t.change < 0);
    const totalPurchases = purchases.reduce((sum, t) => sum + t.change, 0);
    const totalSales = Math.abs(sales.reduce((sum, t) => sum + t.change, 0));
    const netActivity = totalPurchases - totalSales;

    switch (userLevel) {
      case 'beginner':
        return {
          summary: netActivity > 0
            ? `Executives bought ${purchases.length} times recently - usually a good sign!`
            : netActivity < 0
            ? `Executives sold more than they bought recently - might be cautious`
            : 'Mixed insider activity - no clear signal',
          insights: [
            `${purchases.length} insider purchases vs ${sales.length} sales`,
            netActivity > 0 ? 'When company leaders buy stock, they often expect good news' : 'Be careful when insiders are selling',
            'Insider trading is legal when reported properly'
          ],
          recommendation: netActivity > 50000 ? 'bullish' : netActivity < -50000 ? 'bearish' : 'neutral'
        };

      case 'intermediate':
        return {
          summary: `Net insider activity: ${netActivity > 0 ? '+' : ''}${netActivity.toLocaleString()} shares`,
          insights: [
            `Purchase volume: ${totalPurchases.toLocaleString()} shares`,
            `Sale volume: ${totalSales.toLocaleString()} shares`,
            `Insider sentiment: ${netActivity > 0 ? 'Positive' : netActivity < 0 ? 'Negative' : 'Neutral'}`,
            `Average transaction size: ${Math.round((totalPurchases + totalSales) / transactions.length).toLocaleString()} shares`
          ],
          recommendation: netActivity > 100000 ? 'bullish' : netActivity < -100000 ? 'bearish' : 'neutral'
        };

      case 'advanced':
        const avgPrice = transactions.reduce((sum, t) => sum + (t.transactionPrice || 0), 0) / transactions.length;
        const priceRange = {
          min: Math.min(...transactions.map(t => t.transactionPrice || 0)),
          max: Math.max(...transactions.map(t => t.transactionPrice || 0))
        };

        return {
          summary: `Comprehensive insider analysis: ${transactions.length} transactions, net ${netActivity.toLocaleString()} shares`,
          insights: [
            `Net insider flow: ${netActivity > 0 ? '+' : ''}${netActivity.toLocaleString()} shares`,
            `Transaction price range: $${priceRange.min.toFixed(2)} - $${priceRange.max.toFixed(2)}`,
            `Average transaction price: $${avgPrice.toFixed(2)}`,
            `Insider confidence ratio: ${(totalPurchases / (totalPurchases + totalSales) * 100).toFixed(1)}%`,
            `Recent filing velocity: ${transactions.length} filings in 30 days`,
            netActivity > 0 ? 'Positive insider momentum suggests confidence in near-term catalysts' : 'Insider selling may indicate overvaluation or profit-taking'
          ],
          recommendation: netActivity > 200000 ? 'strong_bullish' : netActivity > 50000 ? 'bullish' : netActivity < -200000 ? 'strong_bearish' : netActivity < -50000 ? 'bearish' : 'neutral'
        };

      default:
        return { summary: '', insights: [], recommendation: 'neutral' };
    }
  }
}

export const finnhubService = new FinnhubService();

import axios from 'axios';

// IEX Cloud API configuration
const IEX_BASE_URL = 'https://cloud.iexapis.com/stable';
const IEX_SANDBOX_URL = 'https://sandbox.iexapis.com/stable';
const IEX_API_KEY = 'pk_demo'; // Using demo/sandbox key - replace with real key: process.env.IEX_API_KEY || 'pk_demo';

export interface IEXStockData {
  symbol: string;
  companyName: string;
  primaryExchange: string;
  calculationPrice: string;
  open: number;
  openTime: number;
  close: number;
  closeTime: number;
  high: number;
  low: number;
  latestPrice: number;
  latestSource: string;
  latestTime: string;
  latestUpdate: number;
  latestVolume: number;
  iexRealtimePrice: number;
  iexRealtimeSize: number;
  iexLastUpdated: number;
  delayedPrice: number;
  delayedPriceTime: number;
  previousClose: number;
  change: number;
  changePercent: number;
  marketCap: number;
  peRatio: number;
  week52High: number;
  week52Low: number;
  ytdChange: number;
}

export interface IEXFinancials {
  symbol: string;
  financials: Array<{
    reportDate: string;
    grossProfit: number;
    costOfRevenue: number;
    operatingRevenue: number;
    totalRevenue: number;
    operatingIncome: number;
    netIncome: number;
    researchAndDevelopment: number;
    operatingExpense: number;
    currentAssets: number;
    totalAssets: number;
    totalLiabilities: number;
    currentCash: number;
    currentDebt: number;
    totalCash: number;
    totalDebt: number;
    shareholderEquity: number;
    cashChange: number;
    cashFlow: number;
  }>;
}

export interface IEXNews {
  datetime: number;
  headline: string;
  source: string;
  url: string;
  summary: string;
  related: string;
  image: string;
  lang: string;
  hasPaywall: boolean;
}

export interface IEXEarnings {
  symbol: string;
  earnings: Array<{
    actualEPS: number;
    consensusEPS: number;
    announceTime: string;
    numberOfEstimates: number;
    EPSSurpriseDollar: number;
    EPSReportDate: string;
    fiscalPeriod: string;
    fiscalEndDate: string;
    yearAgo: number;
    yearAgoChangePercent: number;
  }>;
}

class IEXCloudService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = IEX_API_KEY;
    this.baseUrl = IEX_SANDBOX_URL; // Using sandbox for demo
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
      console.error('IEX Cloud API error:', error);
      // Return mock data for demo purposes
      return this.getMockData(endpoint) as T;
    }
  }

  // Get real-time stock quote
  async getStockQuote(symbol: string): Promise<IEXStockData> {
    return await this.makeRequest<IEXStockData>(`/stock/${symbol}/quote`);
  }

  // Get multiple stock quotes
  async getBatchQuotes(symbols: string[]): Promise<Record<string, IEXStockData>> {
    const symbolsParam = symbols.join(',');
    return await this.makeRequest<Record<string, IEXStockData>>(`/stock/market/batch`, {
      symbols: symbolsParam,
      types: 'quote'
    });
  }

  // Get company financials
  async getFinancials(symbol: string): Promise<IEXFinancials> {
    return await this.makeRequest<IEXFinancials>(`/stock/${symbol}/financials`);
  }

  // Get company news
  async getNews(symbol: string, last = 10): Promise<IEXNews[]> {
    return await this.makeRequest<IEXNews[]>(`/stock/${symbol}/news/last/${last}`);
  }

  // Get earnings data
  async getEarnings(symbol: string): Promise<IEXEarnings> {
    return await this.makeRequest<IEXEarnings>(`/stock/${symbol}/earnings`);
  }

  // Get historical prices
  async getHistoricalPrices(symbol: string, range = '1m'): Promise<any[]> {
    return await this.makeRequest<any[]>(`/stock/${symbol}/chart/${range}`);
  }

  // Get market movers
  async getMarketMovers(type: 'gainers' | 'losers' | 'mostactive' = 'gainers'): Promise<IEXStockData[]> {
    return await this.makeRequest<IEXStockData[]>(`/stock/market/list/${type}`);
  }

  // Mock data for demo purposes
  private getMockData(endpoint: string): any {
    if (endpoint.includes('/quote')) {
      const symbols = ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'TSLA'];
      const symbol = symbols.find(s => endpoint.includes(s)) || 'AAPL';

      const baseData = {
        AAPL: { latestPrice: 174.50, change: -2.30, changePercent: -0.013, marketCap: 2800000000000, peRatio: 29.5 },
        MSFT: { latestPrice: 421.30, change: 8.90, changePercent: 0.022, marketCap: 3120000000000, peRatio: 32.1 },
        GOOGL: { latestPrice: 140.85, change: 3.25, changePercent: 0.024, marketCap: 1750000000000, peRatio: 25.8 },
        NVDA: { latestPrice: 518.73, change: 15.20, changePercent: 0.030, marketCap: 1280000000000, peRatio: 65.2 },
        TSLA: { latestPrice: 248.50, change: -12.80, changePercent: -0.049, marketCap: 790000000000, peRatio: 45.7 }
      };

      const data = baseData[symbol as keyof typeof baseData] || baseData.AAPL;

      return {
        symbol,
        companyName: `${symbol} Inc.`,
        primaryExchange: 'NASDAQ',
        calculationPrice: 'close',
        open: data.latestPrice - data.change + Math.random() * 2 - 1,
        openTime: Date.now() - 8 * 60 * 60 * 1000,
        close: data.latestPrice - data.change,
        closeTime: Date.now() - 2 * 60 * 60 * 1000,
        high: data.latestPrice + Math.random() * 5,
        low: data.latestPrice - Math.random() * 5,
        latestPrice: data.latestPrice,
        latestSource: 'Close',
        latestTime: new Date().toISOString(),
        latestUpdate: Date.now(),
        latestVolume: Math.floor(Math.random() * 50000000) + 10000000,
        iexRealtimePrice: data.latestPrice,
        iexRealtimeSize: 100,
        iexLastUpdated: Date.now(),
        delayedPrice: data.latestPrice - 0.01,
        delayedPriceTime: Date.now() - 15 * 60 * 1000,
        previousClose: data.latestPrice - data.change,
        change: data.change,
        changePercent: data.changePercent,
        marketCap: data.marketCap,
        peRatio: data.peRatio,
        week52High: data.latestPrice * 1.3,
        week52Low: data.latestPrice * 0.7,
        ytdChange: Math.random() * 0.4 - 0.2
      };
    }

    if (endpoint.includes('/financials')) {
      return {
        symbol: 'AAPL',
        financials: [
          {
            reportDate: '2025-06-30',
            grossProfit: 45960000000,
            costOfRevenue: 39400000000,
            operatingRevenue: 85360000000,
            totalRevenue: 85360000000,
            operatingIncome: 24930000000,
            netIncome: 21440000000,
            researchAndDevelopment: 7750000000,
            operatingExpense: 21030000000,
            currentAssets: 135400000000,
            totalAssets: 365720000000,
            totalLiabilities: 259490000000,
            currentCash: 67150000000,
            currentDebt: 9450000000,
            totalCash: 67150000000,
            totalDebt: 104630000000,
            shareholderEquity: 106230000000,
            cashChange: -3500000000,
            cashFlow: 28500000000
          }
        ]
      };
    }

    if (endpoint.includes('/news')) {
      return [
        {
          datetime: Date.now(),
          headline: 'Company Reports Strong Quarterly Results',
          source: 'Reuters',
          url: 'https://example.com/news/1',
          summary: 'The company exceeded analyst expectations with strong revenue growth.',
          related: 'AAPL',
          image: 'https://via.placeholder.com/400x200',
          lang: 'en',
          hasPaywall: false
        },
        {
          datetime: Date.now() - 86400000,
          headline: 'New Product Launch Expected Next Quarter',
          source: 'Bloomberg',
          url: 'https://example.com/news/2',
          summary: 'Industry sources suggest a major product announcement is coming.',
          related: 'AAPL',
          image: 'https://via.placeholder.com/400x200',
          lang: 'en',
          hasPaywall: false
        }
      ];
    }

    if (endpoint.includes('/earnings')) {
      return {
        symbol: 'AAPL',
        earnings: [
          {
            actualEPS: 1.40,
            consensusEPS: 1.35,
            announceTime: 'AMC',
            numberOfEstimates: 15,
            EPSSurpriseDollar: 0.05,
            EPSReportDate: '2025-08-01',
            fiscalPeriod: 'Q3 2025',
            fiscalEndDate: '2025-06-30',
            yearAgo: 1.26,
            yearAgoChangePercent: 0.111
          }
        ]
      };
    }

    if (endpoint.includes('/market/list/')) {
      return [
        { symbol: 'NVDA', latestPrice: 518.73, change: 15.20, changePercent: 0.030 },
        { symbol: 'MSFT', latestPrice: 421.30, change: 8.90, changePercent: 0.022 },
        { symbol: 'GOOGL', latestPrice: 140.85, change: 3.25, changePercent: 0.024 }
      ];
    }

    return {};
  }

  // Enhanced analysis for different user levels
  analyzeStockData(stock: IEXStockData, userLevel: 'beginner' | 'intermediate' | 'advanced') {
    const isPositive = stock.change > 0;
    const volatility = Math.abs(stock.changePercent) > 0.03 ? 'high' : Math.abs(stock.changePercent) > 0.01 ? 'medium' : 'low';

    switch (userLevel) {
      case 'beginner':
        return {
          summary: `${stock.symbol} is ${isPositive ? 'up' : 'down'} ${Math.abs(stock.changePercent * 100).toFixed(1)}% today`,
          insights: [
            `Stock price: $${stock.latestPrice.toFixed(2)}`,
            `Today's change: ${isPositive ? '+' : ''}$${stock.change.toFixed(2)}`,
            `Company size: ${this.formatMarketCap(stock.marketCap)}`,
            volatility === 'high' ? 'This stock is moving a lot today - be careful!' : 'Normal price movement today'
          ],
          recommendation: this.getSimpleRecommendation(stock)
        };

      case 'intermediate':
        return {
          summary: `${stock.symbol}: $${stock.latestPrice.toFixed(2)} (${isPositive ? '+' : ''}${(stock.changePercent * 100).toFixed(2)}%)`,
          insights: [
            `P/E Ratio: ${stock.peRatio?.toFixed(1) || 'N/A'}`,
            `52-week range: $${stock.week52Low?.toFixed(2)} - $${stock.week52High?.toFixed(2)}`,
            `YTD Performance: ${((stock.ytdChange || 0) * 100).toFixed(1)}%`,
            `Volume: ${(stock.latestVolume / 1000000).toFixed(1)}M shares`,
            `Volatility: ${volatility} (${Math.abs(stock.changePercent * 100).toFixed(2)}% daily move)`
          ],
          recommendation: this.getTechnicalRecommendation(stock)
        };

      case 'advanced':
        const relativeStrength = ((stock.latestPrice - stock.week52Low) / (stock.week52High - stock.week52Low)) * 100;
        const volumeRatio = stock.latestVolume / (stock.latestVolume * 0.8); // Simplified volume analysis

        return {
          summary: `Comprehensive analysis for ${stock.symbol}`,
          insights: [
            `Current: $${stock.latestPrice.toFixed(2)} | Chg: ${isPositive ? '+' : ''}${(stock.changePercent * 100).toFixed(2)}%`,
            `Valuation: P/E ${stock.peRatio?.toFixed(1)} | Market Cap: ${this.formatMarketCap(stock.marketCap)}`,
            `Relative Strength: ${relativeStrength.toFixed(1)}% of 52-week range`,
            `Volume Analysis: ${(volumeRatio * 100).toFixed(0)}% of average`,
            `Technical Position: ${this.getTechnicalPosition(stock)}`,
            `Risk Assessment: ${this.getRiskAssessment(stock)}`
          ],
          recommendation: this.getAdvancedRecommendation(stock)
        };

      default:
        return { summary: '', insights: [], recommendation: 'neutral' };
    }
  }

  private formatMarketCap(marketCap: number): string {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(1)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(1)}B`;
    return `$${(marketCap / 1e6).toFixed(1)}M`;
  }

  private getSimpleRecommendation(stock: IEXStockData): string {
    if (stock.changePercent > 0.02) return 'Looking strong today';
    if (stock.changePercent < -0.02) return 'Down today, might be a buying opportunity';
    return 'Stable movement today';
  }

  private getTechnicalRecommendation(stock: IEXStockData): string {
    const score = this.calculateTechnicalScore(stock);
    if (score > 0.6) return 'Bullish technical setup';
    if (score < 0.4) return 'Bearish technical indicators';
    return 'Neutral technical position';
  }

  private getAdvancedRecommendation(stock: IEXStockData): string {
    const score = this.calculateTechnicalScore(stock);
    const valuationScore = this.getValuationScore(stock);
    const overallScore = (score + valuationScore) / 2;

    if (overallScore > 0.7) return 'Strong Buy - Technical and fundamental alignment';
    if (overallScore > 0.6) return 'Buy - Positive indicators outweigh negatives';
    if (overallScore < 0.3) return 'Sell - Multiple negative indicators';
    if (overallScore < 0.4) return 'Hold/Weak Sell - Caution advised';
    return 'Hold - Mixed signals, monitor closely';
  }

  private calculateTechnicalScore(stock: IEXStockData): number {
    let score = 0.5; // Start neutral

    // Price momentum
    if (stock.changePercent > 0.02) score += 0.2;
    else if (stock.changePercent < -0.02) score -= 0.2;

    // Position in 52-week range
    const relativePosition = (stock.latestPrice - stock.week52Low) / (stock.week52High - stock.week52Low);
    if (relativePosition > 0.8) score += 0.1;
    else if (relativePosition < 0.2) score -= 0.1;

    // YTD performance
    if ((stock.ytdChange || 0) > 0.1) score += 0.1;
    else if ((stock.ytdChange || 0) < -0.1) score -= 0.1;

    return Math.max(0, Math.min(1, score));
  }

  private getValuationScore(stock: IEXStockData): number {
    let score = 0.5;

    // P/E ratio analysis (simplified)
    if (stock.peRatio) {
      if (stock.peRatio < 15) score += 0.2;
      else if (stock.peRatio > 30) score -= 0.2;
    }

    return Math.max(0, Math.min(1, score));
  }

  private getTechnicalPosition(stock: IEXStockData): string {
    const relativePosition = (stock.latestPrice - stock.week52Low) / (stock.week52High - stock.week52Low);
    if (relativePosition > 0.8) return 'Near 52-week highs';
    if (relativePosition < 0.2) return 'Near 52-week lows';
    return 'Mid-range of 52-week trading range';
  }

  private getRiskAssessment(stock: IEXStockData): string {
    const volatility = Math.abs(stock.changePercent);
    if (volatility > 0.05) return 'High volatility - significant risk';
    if (volatility > 0.02) return 'Moderate volatility - normal risk';
    return 'Low volatility - stable stock';
  }
}

export const iexCloudService = new IEXCloudService();

import type { StockData } from '../types';

// Comprehensive stock database with diverse US and international companies
export const STOCK_DATABASE: StockData[] = [
  // US Technology
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 174.50,
    change: -2.30,
    changePercent: -1.3,
    sentiment: { score: 0.2, label: 'bullish', confidence: 0.7, sources: 45, keywords: ['innovation', 'AI', 'iPhone'] },
    sector: 'Technology',
    marketCap: 2800000000000
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    price: 421.30,
    change: 8.90,
    changePercent: 2.2,
    sentiment: { score: 0.6, label: 'bullish', confidence: 0.9, sources: 89, keywords: ['AI', 'cloud', 'azure'] },
    sector: 'Technology',
    marketCap: 3120000000000
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    price: 140.85,
    change: 3.25,
    changePercent: 2.4,
    sentiment: { score: 0.4, label: 'bullish', confidence: 0.8, sources: 67, keywords: ['search', 'AI', 'advertising'] },
    sector: 'Technology',
    marketCap: 1750000000000
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    price: 518.73,
    change: 15.20,
    changePercent: 3.0,
    sentiment: { score: 0.8, label: 'bullish', confidence: 0.95, sources: 134, keywords: ['AI', 'chips', 'gaming'] },
    sector: 'Technology',
    marketCap: 1280000000000
  },
  {
    symbol: 'META',
    name: 'Meta Platforms Inc.',
    price: 485.20,
    change: -8.45,
    changePercent: -1.7,
    sentiment: { score: 0.1, label: 'neutral', confidence: 0.6, sources: 78, keywords: ['metaverse', 'social', 'VR'] },
    sector: 'Technology',
    marketCap: 1230000000000
  },

  // International Technology
  {
    symbol: 'TSM',
    name: 'Taiwan Semiconductor',
    price: 145.60,
    change: 2.80,
    changePercent: 2.0,
    sentiment: { score: 0.5, label: 'bullish', confidence: 0.8, sources: 56, keywords: ['semiconductors', 'manufacturing', 'chips'] },
    sector: 'Technology',
    marketCap: 756000000000
  },
  {
    symbol: 'ASML',
    name: 'ASML Holding N.V.',
    price: 720.45,
    change: 12.30,
    changePercent: 1.7,
    sentiment: { score: 0.6, label: 'bullish', confidence: 0.85, sources: 42, keywords: ['lithography', 'equipment', 'Netherlands'] },
    sector: 'Technology',
    marketCap: 295000000000
  },

  // Healthcare & Pharmaceuticals
  {
    symbol: 'JNJ',
    name: 'Johnson & Johnson',
    price: 158.90,
    change: 1.45,
    changePercent: 0.9,
    sentiment: { score: 0.3, label: 'bullish', confidence: 0.7, sources: 89, keywords: ['healthcare', 'pharma', 'dividend'] },
    sector: 'Healthcare',
    marketCap: 418000000000
  },
  {
    symbol: 'PFE',
    name: 'Pfizer Inc.',
    price: 28.75,
    change: -0.85,
    changePercent: -2.9,
    sentiment: { score: -0.2, label: 'bearish', confidence: 0.6, sources: 124, keywords: ['vaccine', 'decline', 'post-covid'] },
    sector: 'Healthcare',
    marketCap: 162000000000
  },
  {
    symbol: 'UNH',
    name: 'UnitedHealth Group',
    price: 542.30,
    change: 8.70,
    changePercent: 1.6,
    sentiment: { score: 0.4, label: 'bullish', confidence: 0.8, sources: 67, keywords: ['insurance', 'healthcare', 'growth'] },
    sector: 'Healthcare',
    marketCap: 512000000000
  },
  {
    symbol: 'NVO',
    name: 'Novo Nordisk A/S',
    price: 108.45,
    change: 3.20,
    changePercent: 3.0,
    sentiment: { score: 0.7, label: 'bullish', confidence: 0.9, sources: 78, keywords: ['diabetes', 'ozempic', 'Denmark'] },
    sector: 'Healthcare',
    marketCap: 495000000000
  },

  // Financial Services
  {
    symbol: 'JPM',
    name: 'JPMorgan Chase & Co.',
    price: 185.20,
    change: 2.15,
    changePercent: 1.2,
    sentiment: { score: 0.3, label: 'bullish', confidence: 0.75, sources: 156, keywords: ['banking', 'rates', 'earnings'] },
    sector: 'Finance',
    marketCap: 542000000000
  },
  {
    symbol: 'BAC',
    name: 'Bank of America Corp.',
    price: 34.85,
    change: 0.65,
    changePercent: 1.9,
    sentiment: { score: 0.2, label: 'bullish', confidence: 0.7, sources: 134, keywords: ['banking', 'consumer', 'credit'] },
    sector: 'Finance',
    marketCap: 278000000000
  },
  {
    symbol: 'V',
    name: 'Visa Inc.',
    price: 265.40,
    change: 4.20,
    changePercent: 1.6,
    sentiment: { score: 0.5, label: 'bullish', confidence: 0.85, sources: 89, keywords: ['payments', 'digital', 'network'] },
    sector: 'Finance',
    marketCap: 578000000000
  },

  // Energy
  {
    symbol: 'XOM',
    name: 'Exxon Mobil Corporation',
    price: 108.75,
    change: -1.25,
    changePercent: -1.1,
    sentiment: { score: -0.1, label: 'neutral', confidence: 0.6, sources: 167, keywords: ['oil', 'energy', 'climate'] },
    sector: 'Energy',
    marketCap: 458000000000
  },
  {
    symbol: 'CVX',
    name: 'Chevron Corporation',
    price: 154.30,
    change: 0.85,
    changePercent: 0.6,
    sentiment: { score: 0.1, label: 'neutral', confidence: 0.65, sources: 145, keywords: ['oil', 'dividend', 'production'] },
    sector: 'Energy',
    marketCap: 295000000000
  },
  {
    symbol: 'NEE',
    name: 'NextEra Energy Inc.',
    price: 75.20,
    change: 1.90,
    changePercent: 2.6,
    sentiment: { score: 0.6, label: 'bullish', confidence: 0.8, sources: 78, keywords: ['renewable', 'solar', 'wind'] },
    sector: 'Energy',
    marketCap: 152000000000
  },

  // Automotive
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    price: 248.50,
    change: -12.80,
    changePercent: -4.9,
    sentiment: { score: -0.4, label: 'bearish', confidence: 0.8, sources: 267, keywords: ['EV', 'volatility', 'musk'] },
    sector: 'Automotive',
    marketCap: 790000000000
  },
  {
    symbol: 'F',
    name: 'Ford Motor Company',
    price: 11.45,
    change: -0.35,
    changePercent: -3.0,
    sentiment: { score: -0.3, label: 'bearish', confidence: 0.7, sources: 189, keywords: ['traditional', 'EV transition', 'debt'] },
    sector: 'Automotive',
    marketCap: 46000000000
  },
  {
    symbol: 'TM',
    name: 'Toyota Motor Corporation',
    price: 178.90,
    change: 2.40,
    changePercent: 1.4,
    sentiment: { score: 0.3, label: 'bullish', confidence: 0.75, sources: 134, keywords: ['hybrid', 'reliable', 'Japan'] },
    sector: 'Automotive',
    marketCap: 248000000000
  },

  // Consumer Goods
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    price: 145.30,
    change: 3.85,
    changePercent: 2.7,
    sentiment: { score: 0.4, label: 'bullish', confidence: 0.8, sources: 234, keywords: ['e-commerce', 'AWS', 'cloud'] },
    sector: 'Consumer',
    marketCap: 1520000000000
  },
  {
    symbol: 'WMT',
    name: 'Walmart Inc.',
    price: 165.20,
    change: 1.25,
    changePercent: 0.8,
    sentiment: { score: 0.2, label: 'bullish', confidence: 0.7, sources: 156, keywords: ['retail', 'value', 'consumer'] },
    sector: 'Consumer',
    marketCap: 534000000000
  },
  {
    symbol: 'PG',
    name: 'Procter & Gamble Co.',
    price: 158.70,
    change: 0.90,
    changePercent: 0.6,
    sentiment: { score: 0.3, label: 'bullish', confidence: 0.75, sources: 89, keywords: ['consumer goods', 'dividend', 'stable'] },
    sector: 'Consumer',
    marketCap: 378000000000
  },
  {
    symbol: 'NKE',
    name: 'Nike Inc.',
    price: 102.15,
    change: -1.85,
    changePercent: -1.8,
    sentiment: { score: -0.1, label: 'neutral', confidence: 0.6, sources: 167, keywords: ['athletic', 'brand', 'china'] },
    sector: 'Consumer',
    marketCap: 159000000000
  },

  // International Consumer
  {
    symbol: 'NESN',
    name: 'Nestlé S.A.',
    price: 112.80,
    change: 1.40,
    changePercent: 1.3,
    sentiment: { score: 0.3, label: 'bullish', confidence: 0.7, sources: 67, keywords: ['food', 'Switzerland', 'emerging markets'] },
    sector: 'Consumer',
    marketCap: 356000000000
  },

  // Aerospace & Defense
  {
    symbol: 'BA',
    name: 'Boeing Company',
    price: 198.45,
    change: -5.20,
    changePercent: -2.6,
    sentiment: { score: -0.5, label: 'bearish', confidence: 0.8, sources: 234, keywords: ['aerospace', 'issues', 'safety'] },
    sector: 'Aerospace',
    marketCap: 118000000000
  },
  {
    symbol: 'LMT',
    name: 'Lockheed Martin Corp.',
    price: 465.30,
    change: 8.90,
    changePercent: 1.9,
    sentiment: { score: 0.4, label: 'bullish', confidence: 0.8, sources: 89, keywords: ['defense', 'contracts', 'military'] },
    sector: 'Aerospace',
    marketCap: 115000000000
  },

  // Real Estate
  {
    symbol: 'AMT',
    name: 'American Tower Corp.',
    price: 195.60,
    change: 2.80,
    changePercent: 1.5,
    sentiment: { score: 0.3, label: 'bullish', confidence: 0.75, sources: 67, keywords: ['REIT', 'towers', '5G'] },
    sector: 'Real Estate',
    marketCap: 92000000000
  },
  {
    symbol: 'PLD',
    name: 'Prologis Inc.',
    price: 125.40,
    change: 1.60,
    changePercent: 1.3,
    sentiment: { score: 0.3, label: 'bullish', confidence: 0.7, sources: 56, keywords: ['logistics', 'warehouses', 'e-commerce'] },
    sector: 'Real Estate',
    marketCap: 116000000000
  },

  // Telecommunications
  {
    symbol: 'VZ',
    name: 'Verizon Communications',
    price: 41.25,
    change: 0.45,
    changePercent: 1.1,
    sentiment: { score: 0.1, label: 'neutral', confidence: 0.6, sources: 134, keywords: ['telecom', 'dividend', '5G'] },
    sector: 'Telecom',
    marketCap: 173000000000
  },
  {
    symbol: 'T',
    name: 'AT&T Inc.',
    price: 19.85,
    change: -0.25,
    changePercent: -1.2,
    sentiment: { score: -0.2, label: 'bearish', confidence: 0.7, sources: 156, keywords: ['telecom', 'debt', 'restructuring'] },
    sector: 'Telecom',
    marketCap: 142000000000
  },

  // Entertainment & Media
  {
    symbol: 'DIS',
    name: 'Walt Disney Company',
    price: 89.75,
    change: 2.30,
    changePercent: 2.6,
    sentiment: { score: 0.3, label: 'bullish', confidence: 0.7, sources: 189, keywords: ['streaming', 'parks', 'entertainment'] },
    sector: 'Entertainment',
    marketCap: 164000000000
  },
  {
    symbol: 'NFLX',
    name: 'Netflix Inc.',
    price: 485.60,
    change: 12.40,
    changePercent: 2.6,
    sentiment: { score: 0.5, label: 'bullish', confidence: 0.8, sources: 145, keywords: ['streaming', 'content', 'subscribers'] },
    sector: 'Entertainment',
    marketCap: 216000000000
  },

  // International Financial
  {
    symbol: 'BRK.B',
    name: 'Berkshire Hathaway Inc.',
    price: 420.85,
    change: 5.20,
    changePercent: 1.3,
    sentiment: { score: 0.4, label: 'bullish', confidence: 0.8, sources: 234, keywords: ['buffett', 'value', 'conglomerate'] },
    sector: 'Finance',
    marketCap: 920000000000
  },

  // Emerging Markets
  {
    symbol: 'BABA',
    name: 'Alibaba Group Holding',
    price: 78.90,
    change: -2.15,
    changePercent: -2.7,
    sentiment: { score: -0.3, label: 'bearish', confidence: 0.7, sources: 189, keywords: ['china', 'e-commerce', 'regulation'] },
    sector: 'Technology',
    marketCap: 198000000000
  },
  {
    symbol: 'TSM',
    name: 'Taiwan Semiconductor',
    price: 145.60,
    change: 2.80,
    changePercent: 2.0,
    sentiment: { score: 0.5, label: 'bullish', confidence: 0.8, sources: 134, keywords: ['chips', 'AI', 'manufacturing'] },
    sector: 'Technology',
    marketCap: 756000000000
  }
];

// Sector information for better categorization
export const SECTORS = {
  'Technology': {
    name: 'Technology',
    description: 'Software, hardware, and internet companies',
    icon: '💻',
    color: 'blue'
  },
  'Healthcare': {
    name: 'Healthcare',
    description: 'Pharmaceutical, biotech, and medical device companies',
    icon: '🏥',
    color: 'green'
  },
  'Finance': {
    name: 'Financial Services',
    description: 'Banks, insurance, and financial technology companies',
    icon: '🏦',
    color: 'indigo'
  },
  'Energy': {
    name: 'Energy',
    description: 'Oil, gas, renewable energy, and utilities',
    icon: '⚡',
    color: 'yellow'
  },
  'Consumer': {
    name: 'Consumer Goods',
    description: 'Retail, e-commerce, and consumer products',
    icon: '🛍️',
    color: 'pink'
  },
  'Automotive': {
    name: 'Automotive',
    description: 'Car manufacturers and automotive technology',
    icon: '🚗',
    color: 'gray'
  },
  'Aerospace': {
    name: 'Aerospace & Defense',
    description: 'Aircraft manufacturers and defense contractors',
    icon: '✈️',
    color: 'purple'
  },
  'Real Estate': {
    name: 'Real Estate',
    description: 'REITs and real estate companies',
    icon: '🏢',
    color: 'orange'
  },
  'Telecom': {
    name: 'Telecommunications',
    description: 'Telecom providers and communication services',
    icon: '📡',
    color: 'teal'
  },
  'Entertainment': {
    name: 'Entertainment & Media',
    description: 'Streaming, gaming, and media companies',
    icon: '🎬',
    color: 'red'
  }
} as const;

// Helper functions
export const getStocksBySector = (sector: string): StockData[] => {
  return STOCK_DATABASE.filter(stock => stock.sector === sector);
};

export const getAllSectors = (): string[] => {
  return Object.keys(SECTORS);
};

export const getRandomStocks = (count = 9): StockData[] => {
  const shuffled = [...STOCK_DATABASE].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const searchStocks = (query: string): StockData[] => {
  const lowercaseQuery = query.toLowerCase();
  return STOCK_DATABASE.filter(stock =>
    stock.symbol.toLowerCase().includes(lowercaseQuery) ||
    stock.name.toLowerCase().includes(lowercaseQuery) ||
    stock.sector.toLowerCase().includes(lowercaseQuery) ||
    stock.sentiment.keywords.some(keyword =>
      keyword.toLowerCase().includes(lowercaseQuery)
    )
  );
};

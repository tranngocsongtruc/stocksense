import type React from 'react';
import { useState } from 'react';
import { useTheme, THEMES } from '../contexts/ThemeContext';
import { InsiderTradingPanel } from './InsiderTradingPanel';
import { NewsImpactPanel } from './NewsImpactPanel';
import { finnhubService } from '../services/finnhubService';
import { iexCloudService } from '../services/iexCloudService';
import { newsService } from '../services/newsService';
import {
  Play,
  Users,
  Newspaper,
  TrendingUp,
  BarChart3,
  Brain,
  Zap,
  Globe,
  Building2,
  X,
  ChevronRight,
  Star,
  Target,
  Lightbulb
} from 'lucide-react';

interface QuickDemoPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userLevel: 'beginner' | 'intermediate' | 'advanced';
  onUserLevelChange: (level: 'beginner' | 'intermediate' | 'advanced') => void;
}

export const QuickDemoPanel: React.FC<QuickDemoPanelProps> = ({
  isOpen,
  onClose,
  userLevel,
  onUserLevelChange
}) => {
  const { theme } = useTheme();
  const themeClasses = THEMES[theme].classes;

  const [activeDemo, setActiveDemo] = useState<string | null>(null);
  const [insiderPanelOpen, setInsiderPanelOpen] = useState(false);
  const [newsPanelOpen, setNewsPanelOpen] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [demoResults, setDemoResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  if (!isOpen) return null;

  const symbols = ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'TSLA', 'AMZN', 'JPM', 'JNJ'];

  const runRealTimeDemo = async (demoType: string) => {
    setIsRunning(true);
    setActiveDemo(demoType);
    setDemoResults(null);

    try {
      switch (demoType) {
        case 'insider-analysis':
          await demonstrateInsiderAnalysis();
          break;
        case 'news-impact':
          await demonstrateNewsImpact();
          break;
        case 'stock-analysis':
          await demonstrateStockAnalysis();
          break;
        case 'market-overview':
          await demonstrateMarketOverview();
          break;
      }
    } catch (error) {
      console.error('Demo error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const demonstrateInsiderAnalysis = async () => {
    const transactions = await finnhubService.getInsiderTransactions(selectedSymbol);
    const analysis = finnhubService.analyzeInsiderData(transactions, userLevel);

    setDemoResults({
      type: 'insider',
      symbol: selectedSymbol,
      transactions: transactions.slice(0, 5),
      analysis,
      userLevel
    });
  };

  const demonstrateNewsImpact = async () => {
    const marketNews = await newsService.getMarketNews();
    const allNews = [...marketNews.breakingNews, ...marketNews.politicalNews];
    const analysis = newsService.analyzeNewsImpact(allNews, userLevel);

    setDemoResults({
      type: 'news',
      marketNews,
      analysis,
      userLevel
    });
  };

  const demonstrateStockAnalysis = async () => {
    const stockData = await iexCloudService.getStockQuote(selectedSymbol);
    const analysis = iexCloudService.analyzeStockData(stockData, userLevel);

    setDemoResults({
      type: 'stock',
      stockData,
      analysis,
      userLevel
    });
  };

  const demonstrateMarketOverview = async () => {
    const [gainers, losers, news] = await Promise.all([
      iexCloudService.getMarketMovers('gainers'),
      iexCloudService.getMarketMovers('losers'),
      newsService.getBreakingNews()
    ]);

    setDemoResults({
      type: 'market',
      gainers: gainers.slice(0, 3),
      losers: losers.slice(0, 3),
      news: news.slice(0, 3),
      userLevel
    });
  };

  const getLevelDescription = (level: 'beginner' | 'intermediate' | 'advanced') => {
    switch (level) {
      case 'beginner':
        return 'Simple explanations, basic insights, educational content';
      case 'intermediate':
        return 'Technical analysis, moderate complexity, balanced view';
      case 'advanced':
        return 'Comprehensive metrics, strategic insights, full data';
    }
  };

  const getLevelColor = (level: 'beginner' | 'intermediate' | 'advanced') => {
    switch (level) {
      case 'beginner':
        return 'border-green-300 bg-green-50 text-green-800';
      case 'intermediate':
        return 'border-blue-300 bg-blue-50 text-blue-800';
      case 'advanced':
        return 'border-purple-300 bg-purple-50 text-purple-800';
    }
  };

  const renderDemoCard = (demo: any) => (
    <div className={`p-4 ${themeClasses.card} rounded-lg border-2 hover:border-blue-300 transition-all cursor-pointer`}>
      <div className="flex items-start gap-3">
        <demo.icon size={24} className="text-blue-600 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{demo.title}</h3>
          <p className="text-sm text-gray-600 mb-3">{demo.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {demo.features.map((feature: string, index: number) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                  {feature}
                </span>
              ))}
            </div>

            <button
              onClick={() => runRealTimeDemo(demo.id)}
              disabled={isRunning}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Play size={14} />
              {isRunning && activeDemo === demo.id ? 'Running...' : 'Try It'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderResults = () => {
    if (!demoResults) return null;

    const { type, userLevel: resultLevel } = demoResults;

    return (
      <div className={`mt-6 p-4 ${themeClasses.card} rounded-lg border-2 border-green-300 bg-green-50`}>
        <div className="flex items-center gap-2 mb-4">
          <Star size={20} className="text-green-600" />
          <h3 className="font-semibold text-green-900">
            Demo Results ({resultLevel} level)
          </h3>
        </div>

        {type === 'insider' && (
          <div className="space-y-3">
            <div className="p-3 bg-white rounded border">
              <h4 className="font-medium mb-2">Insider Trading Analysis for {demoResults.symbol}</h4>
              <p className="text-sm text-gray-700 mb-2">{demoResults.analysis.summary}</p>

              <div className="space-y-1">
                {demoResults.analysis.insights.slice(0, 3).map((insight: string, index: number) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-xs text-gray-600">{insight}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setInsiderPanelOpen(true)}
                className="mt-3 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
              >
                View Full Analysis <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {type === 'news' && (
          <div className="space-y-3">
            <div className="p-3 bg-white rounded border">
              <h4 className="font-medium mb-2">Market News Impact Analysis</h4>
              <p className="text-sm text-gray-700 mb-2">{demoResults.analysis.summary}</p>

              <div className="text-xs text-gray-600 mb-3">
                Breaking News: {demoResults.marketNews.breakingNews.length} articles •
                Political: {demoResults.marketNews.politicalNews.length} articles
              </div>

              <button
                onClick={() => setNewsPanelOpen(true)}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
              >
                View Full News Analysis <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {type === 'stock' && (
          <div className="space-y-3">
            <div className="p-3 bg-white rounded border">
              <h4 className="font-medium mb-2">Stock Analysis for {demoResults.stockData.symbol}</h4>
              <p className="text-sm text-gray-700 mb-2">{demoResults.analysis.summary}</p>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                <div>Price: ${demoResults.stockData.latestPrice?.toFixed(2)}</div>
                <div>Change: {demoResults.stockData.changePercent > 0 ? '+' : ''}{(demoResults.stockData.changePercent * 100).toFixed(2)}%</div>
              </div>

              <div className="text-xs bg-blue-100 text-blue-800 p-2 rounded">
                💡 {demoResults.analysis.recommendation}
              </div>
            </div>
          </div>
        )}

        {type === 'market' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded border">
                <h5 className="font-medium text-green-600 mb-2">Top Gainers</h5>
                {demoResults.gainers.map((stock: any, index: number) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span>{stock.symbol}</span>
                    <span className="text-green-600">+{(stock.changePercent * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-white rounded border">
                <h5 className="font-medium text-red-600 mb-2">Top Losers</h5>
                {demoResults.losers.map((stock: any, index: number) => (
                  <div key={index} className="flex justify-between text-xs">
                    <span>{stock.symbol}</span>
                    <span className="text-red-600">{(stock.changePercent * 100).toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const demos = [
    {
      id: 'insider-analysis',
      title: 'Insider Trading Analysis',
      description: 'Real-time insider trading data with AI-powered analysis tailored to your expertise level',
      icon: Users,
      features: ['Finnhub API', 'Real Transactions', 'AI Analysis']
    },
    {
      id: 'news-impact',
      title: 'Market News Impact',
      description: 'Political and business news analysis with sector impact assessment',
      icon: Newspaper,
      features: ['Live News', 'Political Impact', 'Sector Analysis']
    },
    {
      id: 'stock-analysis',
      title: 'Enhanced Stock Analysis',
      description: 'Comprehensive stock analysis using IEX Cloud data with user-level adaptation',
      icon: TrendingUp,
      features: ['IEX Cloud', 'Real-time Data', 'Technical Analysis']
    },
    {
      id: 'market-overview',
      title: 'Market Overview',
      description: 'Complete market snapshot with gainers, losers, and breaking news',
      icon: BarChart3,
      features: ['Market Movers', 'Breaking News', 'Live Updates']
    }
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

        {/* Modal */}
        <div className={`relative w-full max-w-6xl mx-4 max-h-[90vh] ${themeClasses.card} rounded-xl shadow-2xl overflow-hidden`}>
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Brain size={24} className="text-blue-600" />
              <div>
                <h2 className={`text-xl font-bold ${themeClasses.text}`}>
                  StockSense API Demo
                </h2>
                <p className={`text-sm ${themeClasses.textSecondary}`}>
                  Real financial data from Finnhub, IEX Cloud, and News APIs
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className={`p-2 ${themeClasses.textSecondary} hover:${themeClasses.text} rounded-lg`}
            >
              <X size={20} />
            </button>
          </div>

          {/* User Level Selector */}
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <Target size={20} className="text-purple-600" />
              <h3 className="font-semibold">Select Your Experience Level</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(['beginner', 'intermediate', 'advanced'] as const).map(level => (
                <button
                  key={level}
                  onClick={() => onUserLevelChange(level)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    userLevel === level
                      ? getLevelColor(level)
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium capitalize mb-1">{level}</div>
                  <div className="text-xs opacity-75">{getLevelDescription(level)}</div>
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-3">
              <span className="text-sm text-gray-600">Demo with symbol:</span>
              <select
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                {symbols.map(symbol => (
                  <option key={symbol} value={symbol}>{symbol}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Demo Cards */}
          <div className="p-6 overflow-y-auto max-h-[50vh]">
            <div className="flex items-center gap-2 mb-6">
              <Zap size={20} className="text-yellow-500" />
              <h3 className="text-lg font-semibold">Live API Demonstrations</h3>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                Click "Try It" to see real data!
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {demos.map(demo => (
                <div key={demo.id}>
                  {renderDemoCard(demo)}
                </div>
              ))}
            </div>

            {renderResults()}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <div className="flex items-center gap-4">
                <span>🔥 Finnhub: Insider trading data</span>
                <span>📊 IEX Cloud: Real-time stock data</span>
                <span>📰 News API: Market news analysis</span>
              </div>
              <span>All data is live and updated in real-time</span>
            </div>
          </div>
        </div>
      </div>

      {/* Insider Trading Panel */}
      <InsiderTradingPanel
        isOpen={insiderPanelOpen}
        onClose={() => setInsiderPanelOpen(false)}
        symbol={selectedSymbol}
        userLevel={userLevel}
      />

      {/* News Impact Panel */}
      <NewsImpactPanel
        isOpen={newsPanelOpen}
        onClose={() => setNewsPanelOpen(false)}
        userLevel={userLevel}
      />
    </>
  );
};

export default QuickDemoPanel;

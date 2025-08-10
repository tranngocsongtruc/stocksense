import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { stockSenseAgent } from '../services/agent';
import { useUserTracking } from '../hooks/useUserTracking';
import { MarketSentimentSimulator } from './MarketSentimentSimulator';
import { SectorFilter } from './SectorFilter';
import { EnhancedStockCard } from './EnhancedStockCard';
import { STOCK_DATABASE, getStocksBySector, searchStocks, getAllSectors } from '../data/stockData';
import type {
  AgentAction,
  StockData,
  UIChangePayload,
  ModeSwitchPayload,
  NotificationPayload,
} from '../types';
import {
  TrendingUp,
  TrendingDown,
  Brain,
  Eye,
  Activity,
  Search,
  AlertTriangle,
  Info,
  BarChart3,
  Zap,
  HelpCircle,
  Target,
  Lightbulb,
  Cpu,
  TrendingUpDown,
  BookOpen,
  Users,
  Shuffle,
  Filter,
  Globe2,
  Layers
} from 'lucide-react';

interface DashboardState {
  theme: 'default' | 'red' | 'green' | 'blue' | 'orange';
  mode: 'beginner' | 'intermediate' | 'advanced';
  showTooltips: boolean;
  showAdvancedMetrics: boolean;
  alertMessage: string | null;
  stocks: StockData[];
  agentStatus: 'idle' | 'observing' | 'thinking' | 'acting';
  marketCondition: 'neutral' | 'bullish' | 'bearish' | 'volatile';
  selectedSectors: string[];
  searchQuery: string;
  displayMode: 'featured' | 'filtered' | 'search';
}

export const Dashboard: React.FC = () => {
  const [dashboardState, setDashboardState] = useState<DashboardState>({
    theme: 'default',
    mode: 'intermediate',
    showTooltips: false,
    showAdvancedMetrics: false,
    alertMessage: null,
    stocks: [],
    agentStatus: 'idle',
    marketCondition: 'neutral',
    selectedSectors: getAllSectors(), // Start with all sectors selected
    searchQuery: '',
    displayMode: 'featured'
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [agentLogs, setAgentLogs] = useState<string[]>([]);
  const [isAgentActive, setIsAgentActive] = useState(false);
  const [agentThoughts, setAgentThoughts] = useState<string[]>([]);
  const [knowledgeInsights, setKnowledgeInsights] = useState<any>(null);

  const {
    trackSearch,
    trackClick,
    trackSectionEnter,
    trackSectionLeave,
    getUserProfile,
    getKnowledgeInsights,
    getSearchAnalysisHistory,
    simulateUser,
    resetUserProfile,
    isAnalyzing
  } = useUserTracking();

  // Subscribe to agent actions
  useEffect(() => {
    const handleAgentAction = (action: AgentAction) => {
      console.log('🎬 Dashboard received action:', action);

      setAgentLogs((prev) => [
        ...prev.slice(-9),
        `${new Date().toLocaleTimeString()}: ${action.type} → ${action.target}`,
      ]);

      switch (action.type) {
        case 'ui_change':
          if (action.target === 'theme') {
            const payload = action.payload as UIChangePayload;
            setDashboardState((prev) => ({
              ...prev,
              theme: payload.theme,
              alertMessage: payload.message,
            }));

            setAgentThoughts((prev) => [
              ...prev.slice(-2),
              `Market sentiment shifted - adapting UI theme to ${payload.theme}`,
            ]);
          }
          break;

        case 'mode_switch':
          if (action.target === 'interface') {
            const payload = action.payload as ModeSwitchPayload;
            setDashboardState((prev) => ({
              ...prev,
              mode: payload.mode,
              showTooltips: payload.showTooltips || false,
              showAdvancedMetrics: payload.showAdvancedMetrics || false,
            }));

            setAgentThoughts((prev) => [
              ...prev.slice(-2),
              `User expertise detected as ${payload.mode} - switching interface mode`,
            ]);
          }
          break;

        case 'content_update':
          if (action.target === 'dashboard') {
            setAgentThoughts((prev) => [
              ...prev.slice(-2),
              'Analyzing market data and user behavior patterns',
            ]);
          }
          break;

        case 'notification':
          {
            const payload = action.payload as NotificationPayload;
            setDashboardState((prev) => ({
              ...prev,
              alertMessage: payload.message,
            }));
          }
          break;
      }
    };

    stockSenseAgent.subscribe(handleAgentAction);
  }, []);

  // Update knowledge insights periodically
  useEffect(() => {
    const updateInsights = () => {
      const insights = getKnowledgeInsights();
      setKnowledgeInsights(insights);
    };

    updateInsights();
    const interval = setInterval(updateInsights, 5000);

    return () => clearInterval(interval);
  }, [getKnowledgeInsights]);

  // Simulate agent status changes
  useEffect(() => {
    if (!isAgentActive) return;

    const statusCycle = setInterval(() => {
      setDashboardState((prev) => {
        const statuses: typeof prev.agentStatus[] = [
          'observing',
          'thinking',
          'acting',
        ];
        const currentIndex = statuses.indexOf(prev.agentStatus);
        const nextIndex = (currentIndex + 1) % statuses.length;
        return { ...prev, agentStatus: statuses[nextIndex] };
      });
    }, 2000);

    return () => clearInterval(statusCycle);
  }, [isAgentActive]);

  // Load stocks based on current state
  useEffect(() => {
    const loadStocks = () => {
      let stocks: StockData[] = [];

      if (dashboardState.displayMode === 'search' && dashboardState.searchQuery) {
        stocks = searchStocks(dashboardState.searchQuery);
      } else if (dashboardState.displayMode === 'filtered' && dashboardState.selectedSectors.length > 0) {
        stocks = STOCK_DATABASE.filter(stock =>
          dashboardState.selectedSectors.includes(stock.sector)
        );
      } else {
        // Featured mode: Show a curated selection
        stocks = [
          ...STOCK_DATABASE.filter(s => ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'TSLA', 'AMZN'].includes(s.symbol)),
          ...STOCK_DATABASE.filter(s => ['TSM', 'ASML', 'BABA'].includes(s.symbol)), // International
          ...STOCK_DATABASE.filter(s => ['JNJ', 'UNH', 'PFE'].includes(s.symbol)), // Healthcare
          ...STOCK_DATABASE.filter(s => ['JPM', 'V', 'BRK.B'].includes(s.symbol)), // Finance
        ].slice(0, 12);
      }

      setDashboardState(prev => ({ ...prev, stocks }));
    };

    loadStocks();
  }, [dashboardState.displayMode, dashboardState.selectedSectors, dashboardState.searchQuery]);

  const handleSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (searchTerm.trim()) {
        trackClick('search', 'header');

        // Update search state
        setDashboardState(prev => ({
          ...prev,
          searchQuery: searchTerm.trim(),
          displayMode: 'search'
        }));

        // AI-powered search analysis
        const analysisResult = await trackSearch(searchTerm.trim());

        // Agent reacts to search with AI insights
        if (isAgentActive && analysisResult) {
          setAgentThoughts((prev) => [
            ...prev.slice(-2),
            `AI analyzed "${searchTerm}" - Level: ${analysisResult.knowledgeAssessment.level}, Confidence: ${(analysisResult.knowledgeAssessment.confidence * 100).toFixed(0)}%`,
          ]);

          // Update dashboard mode based on AI assessment
          if (analysisResult.knowledgeAssessment.level !== dashboardState.mode) {
            setDashboardState(prev => ({
              ...prev,
              mode: analysisResult.knowledgeAssessment.level,
              showTooltips: analysisResult.knowledgeAssessment.level === 'intermediate',
              showAdvancedMetrics: analysisResult.knowledgeAssessment.level === 'advanced'
            }));
          }
        }

        console.log('🔍 AI-powered search completed:', searchTerm);
        setSearchTerm('');
      }
    },
    [searchTerm, trackSearch, trackClick, isAgentActive, dashboardState.mode]
  );

  const handleSectorChange = useCallback((sectors: string[]) => {
    setDashboardState(prev => ({
      ...prev,
      selectedSectors: sectors,
      displayMode: sectors.length === getAllSectors().length ? 'featured' : 'filtered'
    }));
    trackClick('sector-filter', 'filters');
  }, [trackClick]);

  const handleRandomizeStocks = useCallback(() => {
    const randomStocks = [...STOCK_DATABASE]
      .sort(() => 0.5 - Math.random())
      .slice(0, 12);

    setDashboardState(prev => ({
      ...prev,
      stocks: randomStocks,
      displayMode: 'featured'
    }));

    trackClick('randomize', 'controls');
  }, [trackClick]);

  const clearSearch = useCallback(() => {
    setDashboardState(prev => ({
      ...prev,
      searchQuery: '',
      displayMode: 'featured'
    }));
  }, []);

  const toggleAgent = useCallback(() => {
    if (isAgentActive) {
      stockSenseAgent.stop();
      setIsAgentActive(false);
      setDashboardState((prev) => ({ ...prev, agentStatus: 'idle' }));
      setAgentThoughts([]);
    } else {
      stockSenseAgent.start();
      setIsAgentActive(true);
      setAgentThoughts([
        'AI Agent activated - beginning advanced market and user analysis',
      ]);
    }
  }, [isAgentActive]);

  const handleMarketChange = useCallback(
    (condition: 'bullish' | 'bearish' | 'volatile' | 'neutral') => {
      setDashboardState((prev) => ({ ...prev, marketCondition: condition }));

      if (isAgentActive) {
        const reactions = {
          bullish: {
            theme: 'green' as const,
            message: '📈 Bullish market detected - highlighting growth opportunities',
          },
          bearish: {
            theme: 'red' as const,
            message: '📉 Bearish market detected - focusing on risk management',
          },
          volatile: {
            theme: 'orange' as const,
            message: '⚠️ High volatility detected - exercise caution',
          },
          neutral: {
            theme: 'default' as const,
            message: '📊 Market conditions stabilized',
          },
        };

        const reaction = reactions[condition];
        setDashboardState((prev) => ({
          ...prev,
          theme: reaction.theme,
          alertMessage: reaction.message,
        }));

        setAgentThoughts((prev) => [
          ...prev.slice(-2),
          `Market condition changed to ${condition} - adapting strategy and UI`,
        ]);
      }
    },
    [isAgentActive]
  );

  const getModeIndicator = () => {
    const colors = {
      beginner: 'bg-green-100 text-green-800 border-green-200',
      intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      advanced: 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return colors[dashboardState.mode];
  };

  const getAgentStatusIcon = () => {
    switch (dashboardState.agentStatus) {
      case 'observing':
        return <Eye size={14} className="animate-pulse" />;
      case 'thinking':
        return <Brain size={14} className="animate-spin" />;
      case 'acting':
        return <Zap size={14} className="animate-bounce" />;
      default:
        return <Activity size={14} />;
    }
  };

  const getDisplayModeInfo = () => {
    switch (dashboardState.displayMode) {
      case 'search':
        return {
          title: `Search Results for "${dashboardState.searchQuery}"`,
          subtitle: `Found ${dashboardState.stocks.length} matching stocks`,
          icon: <Search size={20} />
        };
      case 'filtered':
        return {
          title: 'Filtered View',
          subtitle: `${dashboardState.stocks.length} stocks in ${dashboardState.selectedSectors.length} sectors`,
          icon: <Filter size={20} />
        };
      default:
        return {
          title: 'Featured Stocks',
          subtitle: 'Curated selection of global companies',
          icon: <Layers size={20} />
        };
    }
  };

  const displayInfo = getDisplayModeInfo();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4 gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <Brain className="text-blue-600" size={32} />
              <h1 className="text-3xl font-bold text-gray-900">StockSense</h1>
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Cpu size={16} />
                <span>AI-Powered</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium border ${getModeIndicator()}`}
              >
                {dashboardState.mode.toUpperCase()} MODE
              </div>
              {isAnalyzing && (
                <div className="flex items-center gap-1 text-sm text-blue-600">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                  <span>Analyzing...</span>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={toggleAgent}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 ${
                isAgentActive
                  ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              <Zap size={16} className={isAgentActive ? 'animate-pulse' : ''} />
              AI Agent {isAgentActive ? 'ON' : 'OFF'}
            </button>

            {/* User Type Demo Controls */}
            <div className="flex gap-2">
              <button
                onClick={() => simulateUser('beginner')}
                className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
              >
                Beginner
              </button>
              <button
                onClick={() => simulateUser('intermediate')}
                className="px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition-colors"
              >
                Intermediate
              </button>
              <button
                onClick={() => simulateUser('advanced')}
                className="px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded hover:bg-purple-200 transition-colors"
              >
                Advanced
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Search Bar */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={
                  dashboardState.mode === 'beginner'
                    ? "Search for companies like Apple, Tesla..."
                    : "Search stocks, financial terms, or ask questions... (AI-powered analysis)"
                }
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                onFocus={() => trackSectionEnter('search')}
                onBlur={() => trackSectionLeave('search')}
              />
              {isAnalyzing && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={isAnalyzing}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? 'Analyzing...' : 'Search'}
            </button>
          </form>

          <div className="flex gap-2">
            <button
              onClick={handleRandomizeStocks}
              className="flex items-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
            >
              <Shuffle size={16} />
              Random
            </button>
            {dashboardState.searchQuery && (
              <button
                onClick={clearSearch}
                className="flex items-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* AI Knowledge Insights */}
        {knowledgeInsights && (
          <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="text-blue-600" size={16} />
                <span className="text-sm font-medium text-blue-900">AI Knowledge Assessment</span>
              </div>
              <div className="text-xs text-blue-700">
                Confidence: {(knowledgeInsights.confidence * 100).toFixed(0)}%
              </div>
            </div>
            <div className="mt-2 text-sm text-blue-800">
              <strong>Pattern:</strong> {knowledgeInsights.searchPattern}
            </div>
            {knowledgeInsights.recommendations && knowledgeInsights.recommendations.length > 0 && (
              <div className="mt-2">
                <div className="text-xs font-medium text-blue-700 mb-1">AI Recommendations:</div>
                <div className="flex flex-wrap gap-1">
                  {knowledgeInsights.recommendations.slice(0, 3).map((rec: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {rec}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Alert Message */}
        {dashboardState.alertMessage && (
          <div
            className={`mb-4 p-4 rounded-lg border-l-4 transition-all duration-500 ${
              dashboardState.theme === 'red'
                ? 'bg-red-50 border-red-400'
                : dashboardState.theme === 'green'
                ? 'bg-green-50 border-green-400'
                : dashboardState.theme === 'orange'
                ? 'bg-orange-50 border-orange-400'
                : 'bg-yellow-50 border-yellow-400'
            }`}
          >
            <div className="flex items-center">
              <AlertTriangle className="text-current mr-2" size={20} />
              <span className="text-current font-medium">
                {dashboardState.alertMessage}
              </span>
              <button
                onClick={() =>
                  setDashboardState((prev) => ({
                    ...prev,
                    alertMessage: null,
                  }))
                }
                className="ml-auto text-current hover:opacity-75"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Sector Filter */}
          <div className="mb-6">
            <SectorFilter
              selectedSectors={dashboardState.selectedSectors}
              onSectorChange={handleSectorChange}
              userLevel={dashboardState.mode}
            />
          </div>

          {/* Stocks Header */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              {displayInfo.icon}
              <div>
                <h2 className="text-xl font-semibold">{displayInfo.title}</h2>
                <p className="text-sm text-gray-600">{displayInfo.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Activity
                size={16}
                className={isAgentActive ? 'animate-pulse text-green-600' : ''}
              />
              {isAgentActive ? 'AI Monitoring' : 'Static View'}
            </div>
          </div>

          {/* Stocks Grid */}
          {dashboardState.stocks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {dashboardState.stocks.map((stock) => (
                <EnhancedStockCard
                  key={stock.symbol}
                  stock={stock}
                  userLevel={dashboardState.mode}
                  showTooltips={dashboardState.showTooltips}
                  showAdvancedMetrics={dashboardState.showAdvancedMetrics}
                  theme={dashboardState.theme}
                  onClick={() => {
                    trackClick('stock-card', 'stocks');
                    trackSectionEnter(`stock-${stock.symbol}`);
                  }}
                  onMouseEnter={() => trackSectionEnter(`stock-${stock.symbol}`)}
                  onMouseLeave={() => trackSectionLeave(`stock-${stock.symbol}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Search size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No stocks found</h3>
              <p className="text-gray-600 mb-4">
                {dashboardState.displayMode === 'search'
                  ? `No results for "${dashboardState.searchQuery}". Try different keywords.`
                  : 'No stocks match your current filters.'
                }
              </p>
              <button
                onClick={dashboardState.displayMode === 'search' ? clearSearch : handleRandomizeStocks}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {dashboardState.displayMode === 'search' ? 'Clear Search' : 'Show Featured Stocks'}
              </button>
            </div>
          )}
        </div>

        {/* Enhanced Sidebar */}
        <div className="space-y-4">
          {/* AI Agent Status */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Brain size={20} />
              AI Agent Status
            </h3>

            <div
              className={`mb-3 p-3 rounded-lg transition-all ${
                isAgentActive
                  ? 'bg-green-50 text-green-800'
                  : 'bg-gray-50 text-gray-600'
              }`}
            >
              <div className="flex items-center gap-2">
                {getAgentStatusIcon()}
                <span className="font-medium">
                  {isAgentActive
                    ? `${
                        dashboardState.agentStatus.charAt(0).toUpperCase() +
                        dashboardState.agentStatus.slice(1)
                      }...`
                    : 'Inactive'}
                </span>
              </div>
            </div>

            {agentThoughts.length > 0 && (
              <div className="mt-3 space-y-2">
                <h4 className="text-sm font-medium text-gray-700">
                  Agent Thoughts:
                </h4>
                {agentThoughts.map((thought, index) => (
                  <div
                    key={`thought-${index}-${thought.slice(0, 20)}`}
                    className="text-xs bg-blue-50 p-2 rounded border-l-2 border-blue-300"
                  >
                    💭 {thought}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Market Simulator */}
          <MarketSentimentSimulator onMarketChange={handleMarketChange} />

          {/* Enhanced User Profile */}
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Target size={20} />
              AI User Profile
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Level:</span>
                <span className="font-medium">{dashboardState.mode}</span>
              </div>
              {knowledgeInsights && (
                <>
                  <div className="flex justify-between">
                    <span>AI Confidence:</span>
                    <span className="font-medium">{(knowledgeInsights.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {knowledgeInsights.searchPattern}
                  </div>
                </>
              )}
              <div>Recent searches: {getUserProfile()?.searchHistory.slice(-3).join(', ') || 'None'}</div>
              <div>
                Market condition:{' '}
                <span className="font-medium">
                  {dashboardState.marketCondition}
                </span>
              </div>
              <div>
                Preferred sectors:{' '}
                <span className="font-medium">
                  {getUserProfile()?.preferredSectors.join(', ') || 'None detected'}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <div className="text-xs text-gray-500 mb-2">Database Stats:</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>Total Stocks: {STOCK_DATABASE.length}</div>
                  <div>Sectors: {getAllSectors().length}</div>
                  <div>International: {STOCK_DATABASE.filter(s => ['TSM', 'ASML', 'NVO', 'NESN', 'TM', 'BABA'].includes(s.symbol)).length}</div>
                  <div>US Companies: {STOCK_DATABASE.length - STOCK_DATABASE.filter(s => ['TSM', 'ASML', 'NVO', 'NESN', 'TM', 'BABA'].includes(s.symbol)).length}</div>
                </div>
              </div>
              <button
                onClick={resetUserProfile}
                className="mt-2 w-full text-xs text-blue-600 hover:text-blue-800 underline"
              >
                Reset Profile & AI Data
              </button>
            </div>
          </div>

          {/* Agent Activity Log */}
          {isAgentActive && agentLogs.length > 0 && (
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Agent Activity</h3>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {agentLogs.map((log, index) => (
                  <div
                    key={`log-${index}-${log.slice(0, 20)}`}
                    className="text-xs text-gray-600 font-mono bg-gray-50 p-2 rounded"
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

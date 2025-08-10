import type React from 'react';
import { useState } from 'react';
import type { StockData } from '../types';
import { SECTORS } from '../data/stockData';
import { useTheme, THEMES } from '../contexts/ThemeContext';
import { InsiderTradingPanel } from './InsiderTradingPanel';
import { NewsImpactPanel } from './NewsImpactPanel';
import {
  TrendingUp,
  TrendingDown,
  Globe,
  Info,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  AlertTriangle,
  Users,
  Newspaper
} from 'lucide-react';

interface CleanStockCardProps {
  stock: StockData;
  userLevel: 'beginner' | 'intermediate' | 'advanced';
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const CleanStockCard: React.FC<CleanStockCardProps> = ({
  stock,
  userLevel,
  onClick,
  onMouseEnter,
  onMouseLeave
}) => {
  const { theme } = useTheme();
  const [showDetails, setShowDetails] = useState(false);
  const [showInsiderPanel, setShowInsiderPanel] = useState(false);
  const [showNewsPanel, setShowNewsPanel] = useState(false);
  const themeClasses = THEMES[theme].classes;

  const isPositive = stock.change >= 0;
  const isVolatile = Math.abs(stock.changePercent) > 4;
  const sectorInfo = SECTORS[stock.sector as keyof typeof SECTORS];
  const isInternational = ['TSM', 'ASML', 'NVO', 'NESN', 'TM', 'BABA'].includes(stock.symbol);

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(1)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(0)}B`;
    return `$${(marketCap / 1e6).toFixed(0)}M`;
  };

  const getSimpleDescription = () => {
    const descriptions: Record<string, string> = {
      'AAPL': 'Makes iPhones and computers',
      'MSFT': 'Makes Windows and Xbox',
      'GOOGL': 'Owns Google and YouTube',
      'NVDA': 'Makes computer chips for gaming',
      'TSLA': 'Makes electric cars',
      'AMZN': 'Online shopping and delivery',
      'META': 'Owns Facebook and Instagram',
      'JNJ': 'Makes medicines and band-aids',
      'JPM': 'Large bank for savings and loans',
      'TSM': 'Taiwan chip maker',
      'TM': 'Toyota car company from Japan',
      'BABA': 'Chinese shopping website'
    };
    return descriptions[stock.symbol] || `${sectorInfo.name} company`;
  };

  const getSentimentExplanation = () => {
    if (stock.sentiment.label === 'bullish') {
      return userLevel === 'beginner'
        ? 'Most people think this stock will go up'
        : 'Positive market sentiment detected';
    }
    if (stock.sentiment.label === 'bearish') {
      return userLevel === 'beginner'
        ? 'Most people think this stock might go down'
        : 'Negative market sentiment detected';
    }
    return userLevel === 'beginner'
      ? 'People have mixed opinions about this stock'
      : 'Neutral market sentiment';
  };

  return (
    <div
      className={`${themeClasses.card} rounded-xl p-6 transition-all duration-300 hover:shadow-md cursor-pointer group`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Header with Symbol and Price */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{sectorInfo.icon}</span>
            <div>
              <h3 className={`text-xl font-bold ${themeClasses.text}`}>{stock.symbol}</h3>
              {isInternational && (
                <div className="flex items-center gap-1 mt-1">
                  <Globe size={12} className="text-blue-500" />
                  <span className="text-xs text-blue-600 font-medium">International</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className={`text-2xl font-bold ${themeClasses.text}`}>
            ${stock.price.toFixed(2)}
          </div>
          <div className={`flex items-center gap-1 text-sm font-medium ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {isPositive ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(1)}%)
          </div>
        </div>
      </div>

      {/* Company Name - Always visible for context */}
      <div className="mb-4">
        {userLevel === 'beginner' ? (
          <div>
            <p className={`text-sm ${themeClasses.textSecondary} mb-1`}>{getSimpleDescription()}</p>
            <p className={`text-xs ${themeClasses.textSecondary} opacity-75`}>{stock.name}</p>
          </div>
        ) : (
          <p className={`text-sm ${themeClasses.textSecondary}`}>{stock.name}</p>
        )}
      </div>

      {/* Sentiment Badge - Prominent but clean */}
      <div className="mb-4">
        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${
          stock.sentiment.label === 'bullish'
            ? 'bg-green-100 text-green-800 border border-green-200'
            : stock.sentiment.label === 'bearish'
            ? 'bg-red-100 text-red-800 border border-red-200'
            : 'bg-gray-100 text-gray-800 border border-gray-200'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            stock.sentiment.label === 'bullish' ? 'bg-green-500' :
            stock.sentiment.label === 'bearish' ? 'bg-red-500' : 'bg-gray-500'
          }`} />
          {stock.sentiment.label.charAt(0).toUpperCase() + stock.sentiment.label.slice(1)}
        </div>
      </div>

      {/* Beginner Helper - Only for beginners, clean design */}
      {userLevel === 'beginner' && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex items-start gap-2">
            <Lightbulb size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">What this means:</p>
              <p>{getSentimentExplanation()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Risk Warning for Beginners */}
      {userLevel === 'beginner' && isVolatile && (
        <div className="mb-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">High movement today</p>
              <p className="text-xs mt-1">This stock price is changing a lot. Be careful!</p>
            </div>
          </div>
        </div>
      )}

      {/* Progressive Disclosure - Show More Details */}
      {userLevel !== 'beginner' && (
        <div>
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDetails(!showDetails);
              }}
              className={`flex items-center gap-2 text-sm ${themeClasses.textSecondary} hover:${themeClasses.text} transition-colors`}
            >
              <Info size={14} />
              <span>{showDetails ? 'Less' : 'More'} details</span>
              {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {(userLevel === 'intermediate' || userLevel === 'advanced') && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowInsiderPanel(true);
                  }}
                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded border ${themeClasses.border} hover:border-blue-300 transition-colors`}
                  title="Insider Trading Analysis"
                >
                  <Users size={12} />
                  <span>Insider</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNewsPanel(true);
                  }}
                  className={`flex items-center gap-1 text-xs px-2 py-1 rounded border ${themeClasses.border} hover:border-blue-300 transition-colors`}
                  title="News Impact Analysis"
                >
                  <Newspaper size={12} />
                  <span>News</span>
                </button>
              </>
            )}
          </div>

          {showDetails && (
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-3">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className={`text-xs ${themeClasses.textSecondary} mb-1`}>Market Cap</p>
                  <p className={`text-sm font-medium ${themeClasses.text}`}>{formatMarketCap(stock.marketCap)}</p>
                </div>
                <div>
                  <p className={`text-xs ${themeClasses.textSecondary} mb-1`}>Sentiment Score</p>
                  <p className={`text-sm font-medium ${themeClasses.text}`}>{stock.sentiment.score.toFixed(2)}</p>
                </div>
              </div>

              {/* Advanced Details for Advanced Users */}
              {userLevel === 'advanced' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className={themeClasses.textSecondary}>Confidence:</span>
                    <span className={themeClasses.text}>{(stock.sentiment.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className={themeClasses.textSecondary}>Sources:</span>
                    <span className={themeClasses.text}>{stock.sentiment.sources}</span>
                  </div>

                  {/* Keywords */}
                  <div>
                    <p className={`text-xs ${themeClasses.textSecondary} mb-2`}>Trending Keywords:</p>
                    <div className="flex flex-wrap gap-1">
                      {stock.sentiment.keywords.slice(0, 3).map((keyword, index) => (
                        <span
                          key={`${keyword}-${index}`}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Insider Trading Panel */}
      <InsiderTradingPanel
        isOpen={showInsiderPanel}
        onClose={() => setShowInsiderPanel(false)}
        symbol={stock.symbol}
        userLevel={userLevel}
      />

      {/* News Impact Panel */}
      <NewsImpactPanel
        isOpen={showNewsPanel}
        onClose={() => setShowNewsPanel(false)}
        userLevel={userLevel}
      />
    </div>
  );
};

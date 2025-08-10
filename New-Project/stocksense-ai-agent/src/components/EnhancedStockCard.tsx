import type React from 'react';
import type { StockData } from '../types';
import { SECTORS } from '../data/stockData';
import {
  TrendingUp,
  TrendingDown,
  Info,
  Lightbulb,
  Globe,
  BarChart3,
  DollarSign,
  Users,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface EnhancedStockCardProps {
  stock: StockData;
  userLevel: 'beginner' | 'intermediate' | 'advanced';
  showTooltips: boolean;
  showAdvancedMetrics: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  theme: string;
}

export const EnhancedStockCard: React.FC<EnhancedStockCardProps> = ({
  stock,
  userLevel,
  showTooltips,
  showAdvancedMetrics,
  onClick,
  onMouseEnter,
  onMouseLeave,
  theme
}) => {
  const isPositive = stock.change >= 0;
  const sectorInfo = SECTORS[stock.sector as keyof typeof SECTORS];
  const isInternational = ['TSM', 'ASML', 'NVO', 'NESN', 'TM', 'BABA'].includes(stock.symbol);

  const getThemeClasses = () => {
    switch (theme) {
      case 'red':
        return 'bg-red-50 border-red-200 shadow-red-100';
      case 'green':
        return 'bg-green-50 border-green-200 shadow-green-100';
      case 'blue':
        return 'bg-blue-50 border-blue-200 shadow-blue-100';
      case 'orange':
        return 'bg-orange-50 border-orange-200 shadow-orange-100';
      default:
        return 'bg-white border-gray-200 shadow-gray-100';
    }
  };

  const getSentimentColor = () => {
    switch (stock.sentiment.label) {
      case 'bullish':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'bearish':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(1)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(0)}B`;
    } else {
      return `$${(marketCap / 1e6).toFixed(0)}M`;
    }
  };

  const getBeginnerExplanation = () => {
    const explanations = {
      bullish: `People are optimistic about ${stock.name}. This means many investors think the stock price will go up.`,
      bearish: `People are worried about ${stock.name}. This means many investors think the stock price might go down.`,
      neutral: `People have mixed opinions about ${stock.name}. Some think it will go up, others think it will go down.`
    };
    return explanations[stock.sentiment.label] || explanations.neutral;
  };

  const getCompanyDescription = () => {
    const descriptions: Record<string, string> = {
      'AAPL': 'Makes iPhones, iPads, and Mac computers',
      'MSFT': 'Makes Windows and Xbox, plus cloud services',
      'GOOGL': 'Owns Google search and YouTube',
      'NVDA': 'Makes computer chips for gaming and AI',
      'TSLA': 'Makes electric cars and solar panels',
      'AMZN': 'Online shopping and cloud computing',
      'META': 'Owns Facebook, Instagram, and WhatsApp',
      'JNJ': 'Makes medicines and medical products',
      'JPM': 'Large bank that lends money and manages investments',
      'TSM': 'Taiwan company that makes computer chips',
      'TM': 'Japanese car company (Toyota)',
      'BABA': 'Chinese e-commerce company (like Amazon in China)'
    };
    return descriptions[stock.symbol] || `${sectorInfo.name} company`;
  };

  return (
    <div
      className={`p-4 rounded-lg border-2 transition-all duration-500 hover:shadow-lg cursor-pointer transform hover:scale-105 ${getThemeClasses()}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-lg">{stock.symbol}</h3>
            {isInternational && (
              <div className="flex items-center gap-1">
                <Globe size={14} className="text-blue-600" />
                {userLevel === 'beginner' && (
                  <span className="text-xs text-blue-600 font-medium">International</span>
                )}
              </div>
            )}
            <span className="text-lg">{sectorInfo.icon}</span>
          </div>

          {userLevel === 'beginner' ? (
            <div>
              <p className="text-sm text-gray-600 font-medium">{getCompanyDescription()}</p>
              <p className="text-xs text-gray-500">{stock.name}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-600 truncate">{stock.name}</p>
          )}
        </div>

        <div className="text-right">
          <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span className="font-bold text-lg">${stock.price.toFixed(2)}</span>
          </div>
          <div className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(1)}%)
          </div>
        </div>
      </div>

      {/* Sentiment Badge */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getSentimentColor()}`}>
            {userLevel === 'beginner'
              ? stock.sentiment.label.charAt(0).toUpperCase() + stock.sentiment.label.slice(1)
              : stock.sentiment.label.toUpperCase()
            }
          </div>
          {userLevel !== 'beginner' && (
            <div className="text-xs text-gray-500">
              {stock.sentiment.sources} sources
            </div>
          )}
        </div>

        {userLevel === 'advanced' && (
          <div className="text-xs text-gray-600">
            Score: {stock.sentiment.score.toFixed(2)}
          </div>
        )}
      </div>

      {/* User Level Specific Content */}
      {userLevel === 'beginner' && (
        <div className="space-y-2">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-start gap-2">
              <Lightbulb size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                <div className="font-medium mb-1">What this means:</div>
                <div>{getBeginnerExplanation()}</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <DollarSign size={12} className="text-gray-500" />
              <span className="text-gray-600">Size: {formatMarketCap(stock.marketCap)}</span>
            </div>
            <div className="flex items-center gap-1">
              <BarChart3 size={12} className="text-gray-500" />
              <span className="text-gray-600">Sector: {sectorInfo.name.split(' ')[0]}</span>
            </div>
          </div>
        </div>
      )}

      {userLevel === 'intermediate' && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-xs text-gray-500 mb-1">Market Cap</div>
              <div className="font-medium">{formatMarketCap(stock.marketCap)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Sentiment Score</div>
              <div className="font-medium">{stock.sentiment.score.toFixed(2)}</div>
            </div>
          </div>

          {showTooltips && (
            <div className="p-2 bg-gray-50 rounded text-xs">
              <div className="flex items-center gap-1 mb-1">
                <Info size={12} className="text-gray-600" />
                <span className="font-medium text-gray-700">Key Trends:</span>
              </div>
              <div className="text-gray-600">
                {stock.sentiment.keywords.slice(0, 3).join(', ')}
              </div>
            </div>
          )}
        </div>
      )}

      {userLevel === 'advanced' && showAdvancedMetrics && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <div className="text-gray-500 mb-1">Market Cap</div>
              <div className="font-medium">{formatMarketCap(stock.marketCap)}</div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">Sentiment</div>
              <div className="font-medium">{stock.sentiment.score.toFixed(3)}</div>
            </div>
            <div>
              <div className="text-gray-500 mb-1">Confidence</div>
              <div className="font-medium">{(stock.sentiment.confidence * 100).toFixed(0)}%</div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-2">
            <div className="text-xs text-gray-500 mb-1">Sentiment Keywords</div>
            <div className="flex flex-wrap gap-1">
              {stock.sentiment.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          <div className="text-xs text-gray-500">
            <div className="flex items-center gap-1 mb-1">
              <Users size={12} />
              <span>Data Sources: {stock.sentiment.sources}</span>
            </div>
            {isInternational && (
              <div className="flex items-center gap-1">
                <Globe size={12} />
                <span>International Market</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Risk Warning for Volatile Stocks */}
      {(stock.sentiment.label === 'bearish' || Math.abs(stock.changePercent) > 4) && userLevel === 'beginner' && (
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded flex items-start gap-2">
          <AlertCircle size={14} className="text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-yellow-800">
            <strong>High Risk:</strong> This stock is moving a lot today. Be careful with investments.
          </div>
        </div>
      )}
    </div>
  );
};

import type React from 'react';
import { useState, useEffect } from 'react';
import { useTheme, THEMES } from '../contexts/ThemeContext';
import { newsService, type NewsArticle, type MarketNews } from '../services/newsService';
import {
  Newspaper,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  ExternalLink,
  RefreshCw,
  X,
  Zap,
  Building2,
  Globe
} from 'lucide-react';

interface NewsImpactPanelProps {
  isOpen: boolean;
  onClose: () => void;
  userLevel: 'beginner' | 'intermediate' | 'advanced';
}

export const NewsImpactPanel: React.FC<NewsImpactPanelProps> = ({
  isOpen,
  onClose,
  userLevel
}) => {
  const { theme } = useTheme();
  const themeClasses = THEMES[theme].classes;

  const [newsData, setNewsData] = useState<MarketNews | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'breaking' | 'political' | 'sectors'>('breaking');

  // Fetch news data
  const fetchNewsData = async () => {
    setLoading(true);
    setError(null);

    try {
      const marketNews = await newsService.getMarketNews();
      setNewsData(marketNews);

      // Analyze all news for impact
      const allNews = [
        ...marketNews.breakingNews,
        ...marketNews.politicalNews,
        ...marketNews.businessNews
      ];
      const analysisResult = newsService.analyzeNewsImpact(allNews, userLevel);
      setAnalysis(analysisResult);
    } catch (err) {
      setError('Failed to fetch news data');
      console.error('News data error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when panel opens
  useEffect(() => {
    if (isOpen) {
      fetchNewsData();
    }
  }, [isOpen, userLevel]);

  if (!isOpen) return null;

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const publishedAt = new Date(dateString);
    const diffMs = now.getTime() - publishedAt.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffHours >= 24) {
      return `${Math.floor(diffHours / 24)}d ago`;
    } else if (diffHours >= 1) {
      return `${diffHours}h ago`;
    } else {
      return `${diffMinutes}m ago`;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'high':
        return <AlertTriangle size={14} className="text-red-600" />;
      case 'medium':
        return <TrendingUp size={14} className="text-yellow-600" />;
      case 'low':
        return <TrendingDown size={14} className="text-green-600" />;
      default:
        return <Globe size={14} className="text-gray-600" />;
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp size={14} className="text-green-600" />;
      case 'negative':
        return <TrendingDown size={14} className="text-red-600" />;
      default:
        return <TrendingUp size={14} className="text-gray-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'politics':
        return <Building2 size={16} className="text-purple-600" />;
      case 'business':
        return <Zap size={16} className="text-blue-600" />;
      case 'technology':
        return <Newspaper size={16} className="text-green-600" />;
      default:
        return <Globe size={16} className="text-gray-600" />;
    }
  };

  const renderAnalysis = () => {
    if (!analysis) return null;

    return (
      <div className={`p-4 rounded-lg border-2 border-blue-300 bg-blue-50 mb-6`}>
        <div className="flex items-start gap-3">
          <Newspaper size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 mb-2">
              {userLevel === 'beginner' ? 'News Impact Summary' : 'Market News Analysis'}
            </h3>
            <p className="text-sm text-blue-800 mb-3">{analysis.summary}</p>

            {userLevel === 'beginner' && analysis.keyPoints && (
              <div className="space-y-1">
                {analysis.keyPoints.map((point: string, index: number) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-xs text-blue-700">{point}</span>
                  </div>
                ))}
              </div>
            )}

            {userLevel === 'intermediate' && analysis.insights && (
              <div className="space-y-1">
                {analysis.insights.map((insight: string, index: number) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-xs text-blue-700">{insight}</span>
                  </div>
                ))}
              </div>
            )}

            {userLevel === 'advanced' && analysis.strategicInsights && (
              <div className="mt-3">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Strategic Insights:</h4>
                <div className="space-y-1">
                  {analysis.strategicInsights.map((insight: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-xs text-blue-700">{insight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-3 p-2 bg-blue-100 rounded text-xs font-medium text-blue-900">
              📊 Recommendation: {analysis.recommendation}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderNewsCard = (article: NewsArticle, showDetails = false) => (
    <div key={article.url} className={`p-4 ${themeClasses.card} rounded-lg hover:shadow-md transition-shadow`}>
      <div className="flex items-start gap-3">
        {article.urlToImage && (
          <img
            src={article.urlToImage}
            alt=""
            className="w-16 h-12 object-cover rounded flex-shrink-0"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {getCategoryIcon(article.category)}
            <span className="text-xs text-gray-500">{article.source.name}</span>
            <div className="flex items-center gap-1">
              <Clock size={12} className="text-gray-400" />
              <span className="text-xs text-gray-500">{formatTimeAgo(article.publishedAt)}</span>
            </div>
          </div>

          <h4 className="font-medium text-sm mb-2 line-clamp-2">
            {article.title}
          </h4>

          {showDetails && (
            <p className="text-xs text-gray-600 mb-3 line-clamp-2">
              {article.description}
            </p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs border ${getImpactColor(article.impact)}`}>
                {getImpactIcon(article.impact)}
                <span className="capitalize">{article.impact}</span>
              </div>

              <div className="flex items-center gap-1">
                {getSentimentIcon(article.sentiment)}
                <span className="text-xs text-gray-600 capitalize">{article.sentiment}</span>
              </div>
            </div>

            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
            >
              <ExternalLink size={12} />
              Read
            </a>
          </div>

          {showDetails && article.affectedSectors.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <div className="text-xs text-gray-500 mb-1">Affected Sectors:</div>
              <div className="flex flex-wrap gap-1">
                {article.affectedSectors.slice(0, 3).map((sector, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                    {sector}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderBreakingNews = () => {
    const news = newsData?.breakingNews || [];

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={20} className="text-red-600" />
          <h3 className="text-lg font-semibold">Breaking Market News</h3>
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">LIVE</span>
        </div>

        {news.length > 0 ? (
          <div className="space-y-3">
            {news.map(article => renderNewsCard(article, userLevel !== 'beginner'))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Newspaper size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No breaking news at the moment</p>
          </div>
        )}
      </div>
    );
  };

  const renderPoliticalNews = () => {
    const news = newsData?.politicalNews || [];

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Building2 size={20} className="text-purple-600" />
          <h3 className="text-lg font-semibold">Political & Regulatory News</h3>
        </div>

        {userLevel === 'beginner' && (
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg mb-4">
            <p className="text-sm text-purple-800">
              <strong>Why politics matter:</strong> Government policies, regulations, and political events
              can significantly impact stock prices and entire market sectors.
            </p>
          </div>
        )}

        {news.length > 0 ? (
          <div className="space-y-3">
            {news.map(article => renderNewsCard(article, userLevel !== 'beginner'))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No recent political news affecting markets</p>
          </div>
        )}
      </div>
    );
  };

  const renderSectorNews = () => {
    const sectorNews = newsData?.sectorNews || {};

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe size={20} className="text-blue-600" />
          <h3 className="text-lg font-semibold">Sector-Specific News</h3>
        </div>

        {Object.keys(sectorNews).length > 0 ? (
          Object.entries(sectorNews).map(([sector, articles]) => (
            <div key={sector} className="space-y-3">
              <h4 className="font-medium text-gray-900 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                {sector}
                <span className="text-xs text-gray-500">({articles.length} articles)</span>
              </h4>

              <div className="space-y-3 pl-4">
                {articles.slice(0, userLevel === 'beginner' ? 2 : 3).map(article =>
                  renderNewsCard(article, userLevel === 'advanced')
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Globe size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No sector-specific news available</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div className={`relative w-full max-w-6xl mx-4 max-h-[90vh] ${themeClasses.card} rounded-xl shadow-2xl overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Newspaper size={24} className="text-blue-600" />
            <div>
              <h2 className={`text-xl font-bold ${themeClasses.text}`}>
                Market News Impact
              </h2>
              <p className={`text-sm ${themeClasses.textSecondary}`}>
                Political & business news analysis • {userLevel} view
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchNewsData}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={onClose}
              className={`p-2 ${themeClasses.textSecondary} hover:${themeClasses.text} rounded-lg`}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'breaking', label: 'Breaking News', icon: Zap },
            { id: 'political', label: 'Political', icon: Building2 },
            { id: 'sectors', label: 'Sectors', icon: Globe }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : `${themeClasses.textSecondary} hover:${themeClasses.text}`
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw size={24} className="animate-spin text-blue-600 mr-3" />
              <span className="text-gray-600">Loading market news...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertTriangle size={48} className="mx-auto text-red-400 mb-4" />
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchNewsData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {renderAnalysis()}

              {activeTab === 'breaking' && renderBreakingNews()}
              {activeTab === 'political' && renderPoliticalNews()}
              {activeTab === 'sectors' && renderSectorNews()}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>News aggregated from multiple sources • Updated continuously</span>
            <span>Impact analysis powered by AI sentiment analysis</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsImpactPanel;

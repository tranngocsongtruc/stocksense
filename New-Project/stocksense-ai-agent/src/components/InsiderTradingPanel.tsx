import type React from 'react';
import { useState, useEffect } from 'react';
import { useTheme, THEMES } from '../contexts/ThemeContext';
import { finnhubService, type InsiderTransaction } from '../services/finnhubService';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Calendar,
  Info,
  AlertTriangle,
  Lightbulb,
  X,
  RefreshCw
} from 'lucide-react';

interface InsiderTradingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  userLevel: 'beginner' | 'intermediate' | 'advanced';
}

export const InsiderTradingPanel: React.FC<InsiderTradingPanelProps> = ({
  isOpen,
  onClose,
  symbol,
  userLevel
}) => {
  const { theme } = useTheme();
  const themeClasses = THEMES[theme].classes;

  const [insiderData, setInsiderData] = useState<InsiderTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch insider trading data
  const fetchInsiderData = async () => {
    setLoading(true);
    setError(null);

    try {
      const transactions = await finnhubService.getInsiderTransactions(symbol);
      setInsiderData(transactions);

      // Analyze the data for the user's level
      const analysisResult = finnhubService.analyzeInsiderData(transactions, userLevel);
      setAnalysis(analysisResult);
    } catch (err) {
      setError('Failed to fetch insider trading data');
      console.error('Insider data error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when panel opens or symbol changes
  useEffect(() => {
    if (isOpen && symbol) {
      fetchInsiderData();
    }
  }, [isOpen, symbol, userLevel]);

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount.toFixed(2)}`;
  };

  const formatShares = (shares: number) => {
    if (shares >= 1000000) {
      return `${(shares / 1000000).toFixed(1)}M`;
    }
    if (shares >= 1000) {
      return `${(shares / 1000).toFixed(0)}K`;
    }
    return shares.toLocaleString();
  };

  const getTransactionColor = (code: string, change: number) => {
    if (code === 'P' || change > 0) return 'text-green-600 bg-green-50';
    if (code === 'S' || change < 0) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getTransactionIcon = (code: string, change: number) => {
    if (code === 'P' || change > 0) return <TrendingUp size={16} className="text-green-600" />;
    if (code === 'S' || change < 0) return <TrendingDown size={16} className="text-red-600" />;
    return <DollarSign size={16} className="text-gray-600" />;
  };

  const getAnalysisColor = (recommendation: string) => {
    switch (recommendation) {
      case 'strong_bullish':
      case 'bullish':
        return 'border-green-300 bg-green-50';
      case 'strong_bearish':
      case 'bearish':
        return 'border-red-300 bg-red-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const renderAnalysis = () => {
    if (!analysis) return null;

    return (
      <div className={`p-4 rounded-lg border-2 ${getAnalysisColor(analysis.recommendation)} mb-6`}>
        <div className="flex items-start gap-3">
          <Lightbulb size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-2">
              {userLevel === 'beginner' ? 'What This Means' : 'Insider Analysis'}
            </h3>
            <p className="text-sm text-gray-800 mb-3">{analysis.summary}</p>

            <div className="space-y-1">
              {analysis.insights.map((insight: string, index: number) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-xs text-gray-700">{insight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBeginnerView = () => (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-blue-900 mb-1">What is Insider Trading?</h4>
            <p className="text-sm text-blue-800">
              When company executives and directors buy or sell their own company's stock,
              they must report it publicly. This can signal their confidence in the company's future.
            </p>
          </div>
        </div>
      </div>

      {insiderData.length > 0 ? (
        <div className="space-y-3">
          {insiderData.slice(0, 5).map((transaction, index) => (
            <div key={index} className={`p-3 rounded-lg border ${getTransactionColor(transaction.transactionCode, transaction.change)}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getTransactionIcon(transaction.transactionCode, transaction.change)}
                  <span className="font-medium text-sm">
                    {transaction.change > 0 ? 'BOUGHT' : 'SOLD'} {formatShares(Math.abs(transaction.change))} shares
                  </span>
                </div>
                <span className="text-xs text-gray-600">
                  {formatDate(transaction.filingDate)}
                </span>
              </div>
              <p className="text-sm text-gray-700">
                <strong>{transaction.name}</strong> • Price: {formatCurrency(transaction.transactionPrice)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No recent insider trading activity for {symbol}</p>
        </div>
      )}
    </div>
  );

  const renderIntermediateView = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className={`p-3 ${themeClasses.card} rounded-lg text-center`}>
          <div className="text-lg font-bold text-green-600">
            {insiderData.filter(t => t.change > 0).length}
          </div>
          <div className="text-xs text-gray-600">Purchases</div>
        </div>
        <div className={`p-3 ${themeClasses.card} rounded-lg text-center`}>
          <div className="text-lg font-bold text-red-600">
            {insiderData.filter(t => t.change < 0).length}
          </div>
          <div className="text-xs text-gray-600">Sales</div>
        </div>
        <div className={`p-3 ${themeClasses.card} rounded-lg text-center`}>
          <div className="text-lg font-bold text-blue-600">
            {insiderData.length}
          </div>
          <div className="text-xs text-gray-600">Total</div>
        </div>
      </div>

      {insiderData.length > 0 ? (
        <div className="space-y-2">
          {insiderData.map((transaction, index) => (
            <div key={index} className={`p-3 ${themeClasses.card} rounded-lg`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getTransactionIcon(transaction.transactionCode, transaction.change)}
                  <span className="font-medium">
                    {transaction.name}
                  </span>
                </div>
                <span className="text-sm text-gray-600">
                  {formatDate(transaction.filingDate)}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Shares:</span>
                  <div className="font-medium">
                    {transaction.change > 0 ? '+' : ''}{formatShares(transaction.change)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">Price:</span>
                  <div className="font-medium">{formatCurrency(transaction.transactionPrice)}</div>
                </div>
                <div>
                  <span className="text-gray-500">Value:</span>
                  <div className="font-medium">
                    {formatCurrency(Math.abs(transaction.change) * transaction.transactionPrice)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">No insider trading data available</p>
        </div>
      )}
    </div>
  );

  const renderAdvancedView = () => {
    const purchases = insiderData.filter(t => t.change > 0);
    const sales = insiderData.filter(t => t.change < 0);
    const totalPurchaseValue = purchases.reduce((sum, t) => sum + (t.change * t.transactionPrice), 0);
    const totalSaleValue = Math.abs(sales.reduce((sum, t) => sum + (t.change * t.transactionPrice), 0));
    const netValue = totalPurchaseValue - totalSaleValue;

    return (
      <div className="space-y-6">
        {/* Summary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className={`p-3 ${themeClasses.card} rounded-lg`}>
            <div className="text-xs text-gray-500 mb-1">Net Flow</div>
            <div className={`text-lg font-bold ${netValue > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {netValue > 0 ? '+' : ''}{formatCurrency(netValue)}
            </div>
          </div>
          <div className={`p-3 ${themeClasses.card} rounded-lg`}>
            <div className="text-xs text-gray-500 mb-1">Purchase Value</div>
            <div className="text-lg font-bold text-green-600">
              {formatCurrency(totalPurchaseValue)}
            </div>
          </div>
          <div className={`p-3 ${themeClasses.card} rounded-lg`}>
            <div className="text-xs text-gray-500 mb-1">Sale Value</div>
            <div className="text-lg font-bold text-red-600">
              {formatCurrency(totalSaleValue)}
            </div>
          </div>
          <div className={`p-3 ${themeClasses.card} rounded-lg`}>
            <div className="text-xs text-gray-500 mb-1">Transactions</div>
            <div className="text-lg font-bold text-blue-600">
              {insiderData.length}
            </div>
          </div>
        </div>

        {/* Detailed Transaction Table */}
        {insiderData.length > 0 ? (
          <div className={`${themeClasses.card} rounded-lg overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Insider</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Shares</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Value</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {insiderData.map((transaction, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{transaction.name}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {getTransactionIcon(transaction.transactionCode, transaction.change)}
                          <span className={transaction.change > 0 ? 'text-green-600' : 'text-red-600'}>
                            {transaction.change > 0 ? 'BUY' : 'SELL'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatShares(Math.abs(transaction.change))}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {formatCurrency(transaction.transactionPrice)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(Math.abs(transaction.change) * transaction.transactionPrice)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatDate(transaction.filingDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Users size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No insider trading data available for {symbol}</p>
            <p className="text-xs text-gray-500 mt-2">Data may be limited for demo purposes</p>
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
      <div className={`relative w-full max-w-4xl mx-4 max-h-[90vh] ${themeClasses.card} rounded-xl shadow-2xl overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Users size={24} className="text-blue-600" />
            <div>
              <h2 className={`text-xl font-bold ${themeClasses.text}`}>
                Insider Trading Analysis
              </h2>
              <p className={`text-sm ${themeClasses.textSecondary}`}>
                {symbol} • Last 30 days • {userLevel} view
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchInsiderData}
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

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw size={24} className="animate-spin text-blue-600 mr-3" />
              <span className="text-gray-600">Loading insider trading data...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertTriangle size={48} className="mx-auto text-red-400 mb-4" />
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchInsiderData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {renderAnalysis()}

              {userLevel === 'beginner' && renderBeginnerView()}
              {userLevel === 'intermediate' && renderIntermediateView()}
              {userLevel === 'advanced' && renderAdvancedView()}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Data provided by Finnhub • Updated in real-time</span>
            <span>Insider trading is reported within 2 business days</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsiderTradingPanel;

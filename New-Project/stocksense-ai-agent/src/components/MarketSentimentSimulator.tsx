import type React from 'react';
import { useState } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, BarChart3 } from 'lucide-react';

interface MarketSentimentSimulatorProps {
  onMarketChange: (condition: 'bullish' | 'bearish' | 'volatile' | 'neutral') => void;
}

export const MarketSentimentSimulator: React.FC<MarketSentimentSimulatorProps> = ({ onMarketChange }) => {
  const [currentCondition, setCurrentCondition] = useState<'bullish' | 'bearish' | 'volatile' | 'neutral'>('neutral');

  const simulateCondition = (condition: 'bullish' | 'bearish' | 'volatile' | 'neutral') => {
    setCurrentCondition(condition);
    onMarketChange(condition);

    // Provide visual feedback
    console.log(`📊 Market condition simulated: ${condition.toUpperCase()}`);
  };

  const conditions = [
    {
      key: 'bullish' as const,
      label: 'Bullish Market',
      icon: TrendingUp,
      color: 'bg-green-600 hover:bg-green-700',
      description: 'Strong positive sentiment'
    },
    {
      key: 'bearish' as const,
      label: 'Bearish Market',
      icon: TrendingDown,
      color: 'bg-red-600 hover:bg-red-700',
      description: 'Strong negative sentiment'
    },
    {
      key: 'volatile' as const,
      label: 'High Volatility',
      icon: AlertTriangle,
      color: 'bg-orange-600 hover:bg-orange-700',
      description: 'Uncertain market conditions'
    },
    {
      key: 'neutral' as const,
      label: 'Neutral Market',
      icon: BarChart3,
      color: 'bg-gray-600 hover:bg-gray-700',
      description: 'Stable conditions'
    }
  ];

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-3">Market Simulator</h3>
      <p className="text-sm text-gray-600 mb-4">
        Simulate different market conditions to see how the AI agent adapts
      </p>

      <div className="space-y-2">
        {conditions.map((condition) => {
          const Icon = condition.icon;
          const isActive = currentCondition === condition.key;

          return (
            <button
              key={condition.key}
              onClick={() => simulateCondition(condition.key)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-white font-medium transition-all ${
                isActive
                  ? condition.color + ' ring-2 ring-offset-2 ring-blue-500'
                  : condition.color
              }`}
            >
              <Icon size={16} />
              <div className="text-left">
                <div className="font-medium">{condition.label}</div>
                <div className="text-xs opacity-90">{condition.description}</div>
              </div>
              {isActive && (
                <div className="ml-auto">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-800">
          💡 Watch how the AI agent changes the dashboard theme, recommendations, and UI elements based on market conditions!
        </p>
      </div>
    </div>
  );
};

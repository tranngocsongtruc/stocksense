import type React from 'react';
import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface RealTimeClockProps {
  className?: string;
  format?: '12h' | '24h';
  showDate?: boolean;
  showTimezone?: boolean;
}

export const RealTimeClock: React.FC<RealTimeClockProps> = ({
  className = '',
  format = '12h',
  showDate = true,
  showTimezone = false
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: format === '12h'
    };

    if (showTimezone) {
      options.timeZoneName = 'short';
    }

    return date.toLocaleTimeString('en-US', options);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getMarketStatus = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 60 + minutes;

    // Market hours: 9:30 AM - 4:00 PM ET (convert to minutes)
    const marketOpen = 9 * 60 + 30; // 9:30 AM
    const marketClose = 16 * 60; // 4:00 PM
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday

    // Check if it's a weekday
    if (day === 0 || day === 6) {
      return { status: 'Closed', color: 'text-red-600', reason: 'Weekend' };
    }

    // Check market hours
    if (currentTime >= marketOpen && currentTime < marketClose) {
      return { status: 'Open', color: 'text-green-600', reason: 'Trading Hours' };
    } else if (currentTime < marketOpen) {
      return { status: 'Pre-Market', color: 'text-yellow-600', reason: 'Before 9:30 AM ET' };
    } else {
      return { status: 'After Hours', color: 'text-orange-600', reason: 'After 4:00 PM ET' };
    }
  };

  const marketStatus = getMarketStatus();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Clock size={16} className="text-blue-600" />
      <div className="text-sm">
        {showDate && (
          <div className="text-gray-600 font-medium">
            {formatDate(currentTime)}
          </div>
        )}
        <div className="font-mono font-bold">
          {formatTime(currentTime)}
        </div>
        <div className={`text-xs ${marketStatus.color} font-medium`}>
          {marketStatus.status}
        </div>
      </div>
    </div>
  );
};

export default RealTimeClock;

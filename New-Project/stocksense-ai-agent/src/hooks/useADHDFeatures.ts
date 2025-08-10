import { useState, useCallback, useEffect, useRef } from 'react';

export interface FocusSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
  type: 'work' | 'break' | 'long-break';
  completed: boolean;
  interrupted?: boolean;
}

export interface AttentionMetrics {
  timeSpent: number; // in seconds
  clicks: number;
  scrolls: number;
  tabSwitches: number;
  lastActivity: Date;
  focusScore: number; // 0-100
}

export interface ADHDSettings {
  breakReminders: boolean;
  breakInterval: number; // minutes
  focusTimer: boolean;
  workDuration: number; // minutes
  shortBreakDuration: number; // minutes
  longBreakDuration: number; // minutes
  sessionsUntilLongBreak: number;
  gentleNotifications: boolean;
  distractionBlocking: boolean;
  timeAwareness: boolean;
  attentionTracking: boolean;
}

const DEFAULT_SETTINGS: ADHDSettings = {
  breakReminders: true,
  breakInterval: 25, // Pomodoro-style
  focusTimer: false,
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4,
  gentleNotifications: true,
  distractionBlocking: false,
  timeAwareness: true,
  attentionTracking: true
};

export const useADHDFeatures = () => {
  const [settings, setSettings] = useState<ADHDSettings>(DEFAULT_SETTINGS);
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
  const [sessionHistory, setSessionHistory] = useState<FocusSession[]>([]);
  const [attentionMetrics, setAttentionMetrics] = useState<AttentionMetrics>({
    timeSpent: 0,
    clicks: 0,
    scrolls: 0,
    tabSwitches: 0,
    lastActivity: new Date(),
    focusScore: 100
  });
  const [isBreakTime, setIsBreakTime] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [notifications, setNotifications] = useState<string[]>([]);

  const timerRef = useRef<number | null>(null);
  const breakReminderRef = useRef<number | null>(null);
  const activityTimeoutRef = useRef<number | null>(null);
  const metricsRef = useRef(attentionMetrics);

  // Update metrics ref when state changes
  useEffect(() => {
    metricsRef.current = attentionMetrics;
  }, [attentionMetrics]);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('stocksense_adhd_settings');
    if (savedSettings) {
      try {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
      } catch (error) {
        console.error('Error loading ADHD settings:', error);
      }
    }

    const savedSessions = localStorage.getItem('stocksense_focus_sessions');
    if (savedSessions) {
      try {
        const sessions = JSON.parse(savedSessions).map((s: any) => ({
          ...s,
          startTime: new Date(s.startTime),
          endTime: s.endTime ? new Date(s.endTime) : undefined
        }));
        setSessionHistory(sessions);
      } catch (error) {
        console.error('Error loading session history:', error);
      }
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = useCallback((newSettings: Partial<ADHDSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('stocksense_adhd_settings', JSON.stringify(updated));
  }, [settings]);

  // Save session history
  const saveSessionHistory = useCallback((sessions: FocusSession[]) => {
    setSessionHistory(sessions);
    localStorage.setItem('stocksense_focus_sessions', JSON.stringify(sessions));
  }, []);

  // Attention tracking
  useEffect(() => {
    if (!settings.attentionTracking) return;

    const trackActivity = () => {
      setAttentionMetrics(prev => ({
        ...prev,
        lastActivity: new Date(),
        timeSpent: prev.timeSpent + 1
      }));
    };

    const trackClick = () => {
      setAttentionMetrics(prev => ({
        ...prev,
        clicks: prev.clicks + 1,
        lastActivity: new Date()
      }));
    };

    const trackScroll = () => {
      setAttentionMetrics(prev => ({
        ...prev,
        scrolls: prev.scrolls + 1,
        lastActivity: new Date()
      }));
    };

    const trackVisibilityChange = () => {
      if (document.hidden) {
        setAttentionMetrics(prev => ({
          ...prev,
          tabSwitches: prev.tabSwitches + 1
        }));
      }
    };

    // Activity tracking interval
    const activityInterval = setInterval(trackActivity, 1000);

    // Event listeners
    document.addEventListener('click', trackClick);
    document.addEventListener('scroll', trackScroll);
    document.addEventListener('visibilitychange', trackVisibilityChange);

    return () => {
      clearInterval(activityInterval);
      document.removeEventListener('click', trackClick);
      document.removeEventListener('scroll', trackScroll);
      document.removeEventListener('visibilitychange', trackVisibilityChange);
    };
  }, [settings.attentionTracking]);

  // Calculate focus score
  useEffect(() => {
    const calculateFocusScore = () => {
      const now = new Date();
      const timeSinceLastActivity = now.getTime() - attentionMetrics.lastActivity.getTime();
      const inactiveMinutes = timeSinceLastActivity / (1000 * 60);

      let score = 100;

      // Reduce score for inactivity
      if (inactiveMinutes > 2) {
        score -= Math.min(50, inactiveMinutes * 5);
      }

      // Reduce score for excessive tab switching
      if (attentionMetrics.tabSwitches > 5) {
        score -= Math.min(30, (attentionMetrics.tabSwitches - 5) * 5);
      }

      // Improve score for sustained activity
      if (attentionMetrics.timeSpent > 300) { // 5 minutes
        score = Math.min(100, score + 10);
      }

      setAttentionMetrics(prev => ({
        ...prev,
        focusScore: Math.max(0, Math.round(score))
      }));
    };

    const scoreInterval = setInterval(calculateFocusScore, 30000); // Every 30 seconds
    return () => clearInterval(scoreInterval);
  }, [attentionMetrics]);

  // Start focus session
  const startFocusSession = useCallback((type: 'work' | 'break' | 'long-break') => {
    if (currentSession) {
      endCurrentSession(true); // End current session
    }

    const duration = type === 'work'
      ? settings.workDuration
      : type === 'long-break'
      ? settings.longBreakDuration
      : settings.shortBreakDuration;

    const session: FocusSession = {
      id: `session_${Date.now()}`,
      startTime: new Date(),
      duration,
      type,
      completed: false
    };

    setCurrentSession(session);
    setTimeRemaining(duration * 60); // Convert to seconds
    setIsBreakTime(type !== 'work');

    // Start countdown timer
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          completeCurrentSession();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Show notification
    showNotification(
      type === 'work'
        ? `🎯 Focus session started! ${duration} minutes to concentrate.`
        : `☕ Break time! Relax for ${duration} minutes.`
    );
  }, [currentSession, settings]);

  // End current session
  const endCurrentSession = useCallback((interrupted = false) => {
    if (!currentSession) return;

    const endedSession: FocusSession = {
      ...currentSession,
      endTime: new Date(),
      completed: !interrupted,
      interrupted
    };

    const updatedHistory = [...sessionHistory, endedSession];
    saveSessionHistory(updatedHistory);

    setCurrentSession(null);
    setTimeRemaining(0);
    setIsBreakTime(false);

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [currentSession, sessionHistory, saveSessionHistory]);

  // Complete current session
  const completeCurrentSession = useCallback(() => {
    if (!currentSession) return;

    endCurrentSession(false);

    // Determine next session type
    const workSessions = sessionHistory.filter(s => s.type === 'work' && s.completed).length;
    const nextIsLongBreak = (workSessions + 1) % settings.sessionsUntilLongBreak === 0;

    if (currentSession.type === 'work') {
      const nextBreakType = nextIsLongBreak ? 'long-break' : 'break';
      showNotification(
        nextIsLongBreak
          ? '🎉 Great work! Time for a longer break.'
          : '✨ Session complete! Take a short break.'
      );

      if (settings.focusTimer) {
        setTimeout(() => startFocusSession(nextBreakType), 2000);
      }
    } else {
      showNotification('⚡ Break over! Ready for another focus session?');
    }
  }, [currentSession, sessionHistory, settings, startFocusSession]);

  // Break reminders
  useEffect(() => {
    if (!settings.breakReminders || isBreakTime) return;

    if (breakReminderRef.current) {
      clearTimeout(breakReminderRef.current);
    }

    breakReminderRef.current = setTimeout(() => {
      showNotification('🔔 Time for a break! Your eyes and mind need rest.');
    }, settings.breakInterval * 60 * 1000);

    return () => {
      if (breakReminderRef.current) {
        clearTimeout(breakReminderRef.current);
      }
    };
  }, [settings.breakReminders, settings.breakInterval, isBreakTime]);

  // Show notification
  const showNotification = useCallback((message: string) => {
    setNotifications(prev => [...prev, message]);

    if (settings.gentleNotifications && 'Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification('StockSense ADHD Assistant', {
            body: message,
            icon: '/favicon.ico',
            silent: true
          });
        }
      });
    }

    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n !== message));
    }, 5000);
  }, [settings.gentleNotifications]);

  // Dismiss notification
  const dismissNotification = useCallback((message: string) => {
    setNotifications(prev => prev.filter(n => n !== message));
  }, []);

  // Get session statistics
  const getSessionStats = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySessions = sessionHistory.filter(s => s.startTime >= today);
    const completedSessions = todaySessions.filter(s => s.completed);
    const workSessions = completedSessions.filter(s => s.type === 'work');

    const totalFocusTime = workSessions.reduce((sum, s) => sum + s.duration, 0);
    const averageSessionLength = workSessions.length > 0
      ? totalFocusTime / workSessions.length
      : 0;

    return {
      todayTotal: todaySessions.length,
      todayCompleted: completedSessions.length,
      todayFocusTime: totalFocusTime,
      averageSessionLength: Math.round(averageSessionLength),
      currentStreak: getCurrentStreak(),
      focusScore: attentionMetrics.focusScore
    };
  }, [sessionHistory, attentionMetrics.focusScore]);

  // Get current streak
  const getCurrentStreak = useCallback(() => {
    const workSessions = sessionHistory
      .filter(s => s.type === 'work' && s.completed)
      .reverse();

    let streak = 0;
    for (const session of workSessions) {
      if (session.completed) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }, [sessionHistory]);

  // Format time remaining
  const formatTimeRemaining = useCallback(() => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, [timeRemaining]);

  // Reset daily metrics
  const resetDailyMetrics = useCallback(() => {
    setAttentionMetrics(prev => ({
      ...prev,
      timeSpent: 0,
      clicks: 0,
      scrolls: 0,
      tabSwitches: 0,
      focusScore: 100
    }));
  }, []);

  return {
    // State
    settings,
    currentSession,
    sessionHistory,
    attentionMetrics,
    isBreakTime,
    timeRemaining,
    notifications,

    // Actions
    saveSettings,
    startFocusSession,
    endCurrentSession,
    showNotification,
    dismissNotification,
    resetDailyMetrics,

    // Getters
    getSessionStats,
    formatTimeRemaining,

    // Utils
    isSessionActive: currentSession !== null,
    canStartSession: currentSession === null
  };
};

export default useADHDFeatures;

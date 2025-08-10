import type React from 'react';
import { useState } from 'react';
import { useTheme, THEMES } from '../contexts/ThemeContext';
import { useADHDFeatures, type ADHDSettings } from '../hooks/useADHDFeatures';
import {
  Brain,
  Timer,
  Coffee,
  Play,
  Pause,
  Square,
  Settings,
  BarChart3,
  Bell,
  Eye,
  Target,
  TrendingUp,
  Clock,
  X,
  RotateCcw,
  Zap
} from 'lucide-react';

interface ADHDFeaturesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ADHDFeaturesPanel: React.FC<ADHDFeaturesPanelProps> = ({
  isOpen,
  onClose
}) => {
  const { theme } = useTheme();
  const themeClasses = THEMES[theme].classes;
  const [activeTab, setActiveTab] = useState<'timer' | 'settings' | 'stats'>('timer');

  const {
    settings,
    currentSession,
    attentionMetrics,
    isBreakTime,
    timeRemaining,
    notifications,
    saveSettings,
    startFocusSession,
    endCurrentSession,
    dismissNotification,
    getSessionStats,
    formatTimeRemaining,
    isSessionActive,
    canStartSession
  } = useADHDFeatures();

  if (!isOpen) return null;

  const stats = getSessionStats();

  const renderTimer = () => (
    <div className="space-y-6">
      {/* Current Session Display */}
      <div className={`p-6 ${themeClasses.card} rounded-xl text-center`}>
        {isSessionActive ? (
          <>
            <div className="flex items-center justify-center gap-2 mb-4">
              {isBreakTime ? (
                <Coffee size={24} className="text-green-600" />
              ) : (
                <Timer size={24} className="text-blue-600" />
              )}
              <span className={`text-lg font-semibold ${themeClasses.text}`}>
                {isBreakTime ? 'Break Time' : 'Focus Session'}
              </span>
            </div>

            <div className={`text-4xl font-bold ${themeClasses.text} mb-4`}>
              {formatTimeRemaining()}
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => endCurrentSession(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Square size={16} />
                End Session
              </button>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-1000 ${
                    isBreakTime ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{
                    width: `${((currentSession!.duration * 60 - timeRemaining) / (currentSession!.duration * 60)) * 100}%`
                  }}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <Brain size={48} className="mx-auto text-blue-600 mb-4" />
            <h3 className={`text-xl font-semibold ${themeClasses.text} mb-2`}>
              Ready to Focus?
            </h3>
            <p className={`${themeClasses.textSecondary} mb-6`}>
              Start a focus session to improve concentration and track your progress.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => startFocusSession('work')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Play size={16} />
                Work ({settings.workDuration}m)
              </button>

              <button
                onClick={() => startFocusSession('break')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Coffee size={16} />
                Break ({settings.shortBreakDuration}m)
              </button>

              <button
                onClick={() => startFocusSession('long-break')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Coffee size={16} />
                Long Break ({settings.longBreakDuration}m)
              </button>
            </div>
          </>
        )}
      </div>

      {/* Attention Metrics */}
      <div className={`p-4 ${themeClasses.card} rounded-xl`}>
        <div className="flex items-center gap-2 mb-4">
          <Target size={20} className="text-purple-600" />
          <span className={`font-semibold ${themeClasses.text}`}>
            Focus Score
          </span>
        </div>

        <div className="flex items-center justify-between mb-4">
          <span className={`text-3xl font-bold ${
            attentionMetrics.focusScore >= 80 ? 'text-green-600' :
            attentionMetrics.focusScore >= 60 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {attentionMetrics.focusScore}
          </span>
          <div className="text-right">
            <div className={`text-sm ${themeClasses.textSecondary}`}>
              Based on activity patterns
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className={`font-medium ${themeClasses.text}`}>
              {Math.round(attentionMetrics.timeSpent / 60)}m
            </div>
            <div className={themeClasses.textSecondary}>Time Active</div>
          </div>
          <div className="text-center">
            <div className={`font-medium ${themeClasses.text}`}>
              {attentionMetrics.clicks}
            </div>
            <div className={themeClasses.textSecondary}>Interactions</div>
          </div>
          <div className="text-center">
            <div className={`font-medium ${themeClasses.text}`}>
              {attentionMetrics.tabSwitches}
            </div>
            <div className={themeClasses.textSecondary}>Tab Switches</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`p-4 ${themeClasses.card} rounded-xl text-center`}>
          <TrendingUp size={24} className="mx-auto text-green-600 mb-2" />
          <div className={`text-2xl font-bold ${themeClasses.text}`}>
            {stats.currentStreak}
          </div>
          <div className={`text-sm ${themeClasses.textSecondary}`}>
            Session Streak
          </div>
        </div>

        <div className={`p-4 ${themeClasses.card} rounded-xl text-center`}>
          <Clock size={24} className="mx-auto text-blue-600 mb-2" />
          <div className={`text-2xl font-bold ${themeClasses.text}`}>
            {stats.todayFocusTime}m
          </div>
          <div className={`text-sm ${themeClasses.textSecondary}`}>
            Focus Time Today
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      {/* Break Reminders */}
      <div className={`p-4 ${themeClasses.card} rounded-xl`}>
        <h3 className={`font-semibold ${themeClasses.text} mb-4`}>Break Reminders</h3>

        <div className="flex items-center justify-between mb-4">
          <div>
            <span className={`font-medium ${themeClasses.text}`}>Enable break reminders</span>
            <p className={`text-sm ${themeClasses.textSecondary}`}>
              Get gentle notifications to take regular breaks
            </p>
          </div>
          <button
            onClick={() => saveSettings({ breakReminders: !settings.breakReminders })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.breakReminders ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.breakReminders ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {settings.breakReminders && (
          <div>
            <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
              Break interval (minutes)
            </label>
            <input
              type="range"
              min="15"
              max="60"
              step="5"
              value={settings.breakInterval}
              onChange={(e) => saveSettings({ breakInterval: Number(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-500">
              <span>15m</span>
              <span className="font-medium">{settings.breakInterval}m</span>
              <span>60m</span>
            </div>
          </div>
        )}
      </div>

      {/* Focus Timer Settings */}
      <div className={`p-4 ${themeClasses.card} rounded-xl`}>
        <h3 className={`font-semibold ${themeClasses.text} mb-4`}>Focus Timer</h3>

        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
              Work session length
            </label>
            <input
              type="range"
              min="10"
              max="60"
              step="5"
              value={settings.workDuration}
              onChange={(e) => saveSettings({ workDuration: Number(e.target.value) })}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-500 font-medium">
              {settings.workDuration} minutes
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
              Short break length
            </label>
            <input
              type="range"
              min="3"
              max="15"
              step="1"
              value={settings.shortBreakDuration}
              onChange={(e) => saveSettings({ shortBreakDuration: Number(e.target.value) })}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-500 font-medium">
              {settings.shortBreakDuration} minutes
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium ${themeClasses.text} mb-2`}>
              Long break length
            </label>
            <input
              type="range"
              min="15"
              max="30"
              step="5"
              value={settings.longBreakDuration}
              onChange={(e) => saveSettings({ longBreakDuration: Number(e.target.value) })}
              className="w-full"
            />
            <div className="text-center text-sm text-gray-500 font-medium">
              {settings.longBreakDuration} minutes
            </div>
          </div>
        </div>
      </div>

      {/* Other Settings */}
      <div className={`p-4 ${themeClasses.card} rounded-xl`}>
        <h3 className={`font-semibold ${themeClasses.text} mb-4`}>Other Features</h3>

        <div className="space-y-4">
          {[
            {
              key: 'gentleNotifications',
              label: 'Gentle notifications',
              description: 'Non-intrusive browser notifications'
            },
            {
              key: 'timeAwareness',
              label: 'Time awareness indicators',
              description: 'Visual cues about session duration'
            },
            {
              key: 'attentionTracking',
              label: 'Attention tracking',
              description: 'Monitor activity patterns for focus insights'
            }
          ].map(setting => (
            <div key={setting.key} className="flex items-center justify-between">
              <div>
                <span className={`font-medium ${themeClasses.text}`}>
                  {setting.label}
                </span>
                <p className={`text-sm ${themeClasses.textSecondary}`}>
                  {setting.description}
                </p>
              </div>
              <button
                onClick={() => saveSettings({ [setting.key]: !settings[setting.key as keyof ADHDSettings] })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings[setting.key as keyof ADHDSettings] ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings[setting.key as keyof ADHDSettings] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStats = () => (
    <div className="space-y-6">
      {/* Today's Overview */}
      <div className={`p-4 ${themeClasses.card} rounded-xl`}>
        <h3 className={`font-semibold ${themeClasses.text} mb-4`}>Today's Progress</h3>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${themeClasses.text}`}>
              {stats.todayCompleted}
            </div>
            <div className={`text-sm ${themeClasses.textSecondary}`}>
              Sessions Completed
            </div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${themeClasses.text}`}>
              {stats.todayFocusTime}m
            </div>
            <div className={`text-sm ${themeClasses.textSecondary}`}>
              Total Focus Time
            </div>
          </div>
        </div>

        {/* Focus Score Breakdown */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">Focus Quality</span>
            <span className={`text-lg font-bold ${
              attentionMetrics.focusScore >= 80 ? 'text-green-600' :
              attentionMetrics.focusScore >= 60 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {attentionMetrics.focusScore}/100
            </span>
          </div>
          <div className="text-xs text-blue-700">
            {attentionMetrics.focusScore >= 80 ? '🎯 Excellent focus!' :
             attentionMetrics.focusScore >= 60 ? '👍 Good concentration' : '🤔 Try reducing distractions'}
          </div>
        </div>
      </div>

      {/* Weekly Trends */}
      <div className={`p-4 ${themeClasses.card} rounded-xl`}>
        <h3 className={`font-semibold ${themeClasses.text} mb-4`}>Insights & Tips</h3>

        <div className="space-y-3">
          {stats.currentStreak > 0 && (
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Zap size={14} className="text-green-600" />
                <span className="text-sm font-medium text-green-900">
                  Great momentum!
                </span>
              </div>
              <p className="text-xs text-green-700">
                You've completed {stats.currentStreak} sessions in a row. Keep it up!
              </p>
            </div>
          )}

          {stats.averageSessionLength > 0 && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 size={14} className="text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Session Average
                </span>
              </div>
              <p className="text-xs text-blue-700">
                Your average session length is {stats.averageSessionLength} minutes.
                {stats.averageSessionLength < 20 && " Try gradually increasing session length."}
                {stats.averageSessionLength > 45 && " Consider shorter sessions to maintain focus."}
              </p>
            </div>
          )}

          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Brain size={14} className="text-purple-600" />
              <span className="text-sm font-medium text-purple-900">
                ADHD Tip
              </span>
            </div>
            <p className="text-xs text-purple-700">
              Regular breaks help maintain sustained attention. Even 2-minute breaks can refresh your focus.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div className={`relative w-full max-w-2xl mx-4 max-h-[90vh] ${themeClasses.card} rounded-xl shadow-2xl overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Brain size={24} className="text-blue-600" />
            <div>
              <h2 className={`text-xl font-bold ${themeClasses.text}`}>
                ADHD Focus Assistant
              </h2>
              <p className={`text-sm ${themeClasses.textSecondary}`}>
                Tools to help you stay focused and productive
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

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="p-4 bg-blue-50 border-b border-blue-200">
            {notifications.map((notification, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg mb-2 last:mb-0">
                <span className="text-sm text-blue-800">{notification}</span>
                <button
                  onClick={() => dismissNotification(notification)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { id: 'timer', label: 'Focus Timer', icon: Timer },
            { id: 'settings', label: 'Settings', icon: Settings },
            { id: 'stats', label: 'Progress', icon: BarChart3 }
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
        <div className="p-6 overflow-y-auto max-h-96">
          {activeTab === 'timer' && renderTimer()}
          {activeTab === 'settings' && renderSettings()}
          {activeTab === 'stats' && renderStats()}
        </div>
      </div>
    </div>
  );
};

export default ADHDFeaturesPanel;

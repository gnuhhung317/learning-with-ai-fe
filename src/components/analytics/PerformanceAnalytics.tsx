"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_CONFIG } from '@/config/api-config';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  AcademicCapIcon,
  FireIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

import PerformanceLineChart from '@/components/charts/PerformanceLineChart';
import PerformanceBarChart from '@/components/charts/PerformanceBarChart';



interface PerformanceData {
  date: string;
  avg_score: number;
  attempts_count: number;
}

interface TopicPerformance {
  topic: string;
  avg_score: number;
  attempts_count: number;
}

interface Analytics {
  performanceOverTime: PerformanceData[];
  performanceByTopic: TopicPerformance[];
  performanceByLevel: Array<{
    level: string;
    avg_score: number;
    attempts_count: number;
  }>;
  bestQuizzes: Array<{
    title: string;
    topic: string;
    score: number;
    completed_at: string;
  }>;
  worstQuizzes: Array<{
    title: string;
    topic: string;
    score: number;
    completed_at: string;
  }>;
}

interface StreakData {
  currentStreak: number;
  recentDates: string[];
}

export default function Analytics() {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(30);

  const fetchAnalytics = React.useCallback(async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ANALYTICS}?days=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
        setStreak(data.streak);
      } else {
        throw new Error('Failed to fetch analytics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [token, selectedPeriod]);

  useEffect(() => {
    if (token) {
      fetchAnalytics();
    }
  }, [token, selectedPeriod, fetchAnalytics]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Chưa có dữ liệu thống kê
          </h2>
          <p className="text-gray-600">
            Hãy làm một vài quiz để xem thống kê của bạn!
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Thống kê học tập
          </h1>
          <p className="text-gray-600">
            Phân tích hiệu suất và tiến độ học tập của bạn
          </p>
        </div>
        
        <div className="flex space-x-2">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => setSelectedPeriod(days)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                selectedPeriod === days
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {days} ngày
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FireIcon className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Streak hiện tại</p>
              <p className="text-2xl font-semibold text-gray-900">
                {streak?.currentStreak || 0} ngày
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ArrowTrendingUpIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Điểm TB</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analytics.performanceOverTime.length > 0 
                  ? (analytics.performanceOverTime.reduce((acc, curr) => acc + curr.avg_score, 0) / analytics.performanceOverTime.length).toFixed(1)
                  : '0'
                }%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AcademicCapIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Tổng Quiz</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analytics.performanceOverTime.reduce((acc, curr) => acc + curr.attempts_count, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CalendarDaysIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Ngày hoạt động</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analytics.performanceOverTime.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Over Time Chart */}
      {analytics.performanceOverTime.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Xu hướng điểm số theo thời gian
          </h2>
          <PerformanceLineChart 
            data={analytics.performanceOverTime} 
            formatDate={formatDate}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Performance by Topic */}
        {analytics.performanceByTopic.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Hiệu suất theo chủ đề
            </h2>
            <PerformanceBarChart data={analytics.performanceByTopic} />
          </div>
        )}

        {/* Performance by Level */}
        {analytics.performanceByLevel.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Hiệu suất theo cấp độ
            </h2>
            <div className="space-y-4">
              {analytics.performanceByLevel.map((level) => (
                <div key={level.level} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="w-20 text-sm font-medium text-gray-900 capitalize">
                      {level.level}
                    </span>
                    <div className="w-32 bg-gray-200 rounded-full h-2 ml-4">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${level.avg_score}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {level.avg_score.toFixed(1)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      {level.attempts_count} quiz
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Best and Worst Performances */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Best Quizzes */}
        {analytics.bestQuizzes.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Quiz tốt nhất
            </h2>
            <div className="space-y-3">
              {analytics.bestQuizzes.map((quiz, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{quiz.title}</p>
                    <p className="text-sm text-gray-600">{quiz.topic}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{quiz.score.toFixed(1)}%</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(quiz.completed_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Worst Quizzes */}
        {analytics.worstQuizzes.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Quiz cần cải thiện
            </h2>
            <div className="space-y-3">
              {analytics.worstQuizzes.map((quiz, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{quiz.title}</p>
                    <p className="text-sm text-gray-600">{quiz.topic}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">{quiz.score.toFixed(1)}%</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(quiz.completed_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

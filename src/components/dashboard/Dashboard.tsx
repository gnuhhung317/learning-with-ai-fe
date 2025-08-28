"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_CONFIG } from '@/config/api-config';
import { 
  AcademicCapIcon, 
  ChartBarIcon, 
  TrophyIcon, 
  BookmarkIcon,
  CalendarDaysIcon,
  ArrowTopRightOnSquareIcon,
  FireIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

interface DashboardProps {
  onNavigate?: (view: 'quiz' | 'history' | 'saved' | 'analytics' | 'achievements' | 'study') => void;
}

interface DashboardStats {
  totalQuizzes: number;
  averageScore: number;
  highestScore: number;
  totalAchievements: number;
  currentStreak: number;
  totalTimeSpent: number;
  recentActivity: Array<{
    id: number;
    score: number;
    completed_at: string;
    quiz_title?: string;
  }>;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = React.useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Chào mừng trở lại, {user.name || user.email.split('@')[0]}!
        </h1>
        <p className="text-gray-600 mt-2">
          Thành viên từ {formatDate(user.created_at)}
        </p>
        
        {/* Current Streak Banner */}
        {stats && stats.currentStreak > 0 && (
          <div className="mt-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-lg inline-flex items-center">
            <FireIcon className="h-6 w-6 mr-2" />
            <span className="font-semibold">Chuỗi {stats.currentStreak} ngày!</span>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Tổng Quiz</p>
              <p className="text-3xl font-bold">
                {stats?.totalQuizzes || 0}
              </p>
            </div>
            <AcademicCapIcon className="h-10 w-10 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Điểm TB</p>
              <p className="text-3xl font-bold">
                {stats?.averageScore ? `${stats.averageScore.toFixed(1)}%` : 'N/A'}
              </p>
            </div>
            <ChartBarIcon className="h-10 w-10 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Thành tích</p>
              <p className="text-3xl font-bold">
                {stats?.totalAchievements || 0}
              </p>
            </div>
            <TrophyIcon className="h-10 w-10 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Thời gian học</p>
              <p className="text-3xl font-bold">
                {stats?.totalTimeSpent || 0} phút
              </p>
            </div>
            <ClockIcon className="h-10 w-10 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Điểm cao nhất</p>
              <p className="text-2xl font-bold text-green-600">
                {stats?.highestScore || 0}%
              </p>
            </div>
            <div className="text-2xl">🎯</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Chuỗi hiện tại</p>
              <p className="text-2xl font-bold text-red-600">
                {stats?.currentStreak || 0} ngày
              </p>
            </div>
            <div className="text-2xl">🔥</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Hoạt động gần đây</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats?.recentActivity?.length || 0} bài
              </p>
            </div>
            <div className="text-2xl">📊</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {stats?.recentActivity && stats.recentActivity.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Hoạt động gần đây
          </h2>
          <div className="space-y-3">
            {stats.recentActivity.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    activity.score >= 80 ? 'bg-green-500' : 
                    activity.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-gray-700">
                    {new Date(activity.completed_at).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                  activity.score >= 80 ? 'bg-green-100 text-green-800' : 
                  activity.score >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                }`}>
                  {activity.score}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Hành động nhanh
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <button 
            onClick={() => onNavigate?.('quiz')}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <AcademicCapIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 text-center text-sm">Tạo Quiz mới</p>
          </button>
          
          <button 
            onClick={() => onNavigate?.('saved')}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
          >
            <BookmarkIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 text-center text-sm">Quiz đã lưu</p>
          </button>
          
          <button 
            onClick={() => onNavigate?.('study')}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
          >
            <CalendarDaysIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 text-center text-sm">Kế hoạch học</p>
          </button>
          
          <button 
            onClick={() => onNavigate?.('achievements')}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-colors"
          >
            <TrophyIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 text-center text-sm">Thành tích</p>
          </button>
          
          <button 
            onClick={() => onNavigate?.('analytics')}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <ChartBarIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 text-center text-sm">Thống kê</p>
          </button>
          
          <button 
            onClick={() => onNavigate?.('history')}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
          >
            <ArrowTopRightOnSquareIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 text-center text-sm">Lịch sử</p>
          </button>
        </div>
      </div>
    </div>
  );
}

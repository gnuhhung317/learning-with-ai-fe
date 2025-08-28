import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_CONFIG } from '@/config/api-config';

interface Achievement {
  id: number;
  type: string;
  title: string;
  description: string;
  earned_at: string;
}

interface AchievementStats {
  total_achievements: number;
  streak_achievements: number;
  score_achievements: number;
  quiz_achievements: number;
}

interface QuizStats {
  totalQuizzes: number;
  averageScore: number;
  highestScore: number;
  perfectScores: number;
  totalTimeSpent: number;
}

export default function AchievementBoard() {
  const { token } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<AchievementStats | null>(null);
  const [quizStats, setQuizStats] = useState<QuizStats | null>(null);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAchievements = React.useCallback(async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/achievements`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAchievements(data.achievements || []);
        setStats(data.stats);
        setQuizStats(data.quizStats);
        setCurrentStreak(data.currentStreak || 0);
      } else {
        throw new Error('Failed to fetch achievements');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load achievements');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchAchievements();
    }
  }, [token, fetchAchievements]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getAchievementIcon = (type: string) => {
    if (type.includes('quiz_count')) return '🎯';
    if (type.includes('streak')) return '🔥';
    if (type.includes('score') || type === 'high_scorer') return '⭐';
    if (type === 'perfectionist') return '💯';
    return '🏆';
  };

  const getAchievementColor = (type: string) => {
    if (type.includes('quiz_count')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (type.includes('streak')) return 'bg-red-100 text-red-800 border-red-200';
    if (type.includes('score') || type === 'high_scorer') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (type === 'perfectionist') return 'bg-purple-100 text-purple-800 border-purple-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Thành tích
        </h1>
        <p className="text-gray-600">
          Theo dõi tiến bộ học tập của bạn
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Tổng số thành tích</p>
              <p className="text-3xl font-bold">{stats?.total_achievements || 0}</p>
            </div>
            <div className="text-3xl">🏆</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Chuỗi ngày hiện tại</p>
              <p className="text-3xl font-bold">{currentStreak}</p>
            </div>
            <div className="text-3xl">🔥</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Điểm trung bình</p>
              <p className="text-3xl font-bold">{Math.round(quizStats?.averageScore || 0)}%</p>
            </div>
            <div className="text-3xl">📊</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Điểm cao nhất</p>
              <p className="text-3xl font-bold">{quizStats?.highestScore || 0}%</p>
            </div>
            <div className="text-3xl">⭐</div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Thống kê chi tiết</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{quizStats?.totalQuizzes || 0}</div>
            <div className="text-gray-600">Tổng số quiz</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{quizStats?.perfectScores || 0}</div>
            <div className="text-gray-600">Điểm tuyệt đối</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">{Math.round((quizStats?.totalTimeSpent || 0) / 60)}</div>
            <div className="text-gray-600">Phút học tập</div>
          </div>
        </div>
      </div>

      {/* Achievements List */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Danh sách thành tích</h2>
        
        {achievements.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Chưa có thành tích nào
            </h3>
            <p className="text-gray-600">
              Hãy tiếp tục làm quiz để mở khóa các thành tích đầu tiên!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div 
                key={achievement.id} 
                className={`border rounded-lg p-4 ${getAchievementColor(achievement.type)}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">
                    {getAchievementIcon(achievement.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{achievement.title}</h3>
                    <p className="text-xs opacity-90 mt-1">{achievement.description}</p>
                    <p className="text-xs opacity-75 mt-2">
                      Đạt được: {formatDate(achievement.earned_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

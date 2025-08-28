"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_CONFIG } from '@/config/api-config';
import { 
  ClockIcon, 
  ChartBarIcon, 
  EyeIcon,
  CalendarDaysIcon 
} from '@heroicons/react/24/outline';

interface QuizAttempt {
  id: number;
  quiz_id: number;
  title: string;
  topic: string;
  level: string;
  score: number;
  answers: number[];
  time_spent: number;
  completed_at: string;
}

export default function QuizHistory() {
  const { token } = useAuth();
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAttempt, setSelectedAttempt] = useState<QuizAttempt | null>(null);

  const fetchQuizHistory = React.useCallback(async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.QUIZ_HISTORY}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAttempts(data.attempts || []);
      } else {
        throw new Error('Failed to fetch quiz history');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load quiz history');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchQuizHistory();
    }
  }, [token, fetchQuizHistory]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
          Lịch sử Quiz
        </h1>
        <p className="text-gray-600">
          Tổng cống {attempts.length} lần làm quiz
        </p>
      </div>

      {attempts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Chưa có lịch sử quiz
          </h2>
          <p className="text-gray-600">
            Hãy tạo và làm quiz đầu tiên của bạn!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {attempts.map((attempt) => (
            <div key={attempt.id} className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {attempt.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(attempt.level)}`}>
                      {attempt.level}
                    </span>
                    <span className="text-sm text-gray-500">
                      {attempt.topic}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center">
                      <CalendarDaysIcon className="h-4 w-4 mr-1" />
                      {formatDate(attempt.completed_at)}
                    </div>
                    
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {formatTime(attempt.time_spent)}
                    </div>
                    
                    <div className="flex items-center">
                      <ChartBarIcon className="h-4 w-4 mr-1" />
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(attempt.score)}`}>
                        {attempt.score.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => setSelectedAttempt(attempt)}
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <EyeIcon className="h-5 w-5 mr-1" />
                  Chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Attempt Detail Modal */}
      {selectedAttempt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Chi tiết Quiz
                </h2>
                <button
                  onClick={() => setSelectedAttempt(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">{selectedAttempt.title}</h3>
                  <p className="text-sm text-gray-600">Chủ đề: {selectedAttempt.topic}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600">Điểm số</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedAttempt.score.toFixed(1)}%
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600">Thời gian</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatTime(selectedAttempt.time_spent)}
                    </p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-3 rounded">
                  <p className="text-sm text-gray-600">Hoàn thành lúc</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(selectedAttempt.completed_at)}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-2">Câu trả lời của bạn:</p>
                  <div className="space-y-2">
                    {selectedAttempt.answers.map((answer, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <span className="w-16 text-gray-600">Câu {index + 1}:</span>
                        <span className="font-medium">
                          {answer >= 0 ? String.fromCharCode(65 + answer) : 'Không trả lời'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

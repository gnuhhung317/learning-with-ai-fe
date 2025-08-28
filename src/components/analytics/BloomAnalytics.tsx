"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_CONFIG } from '@/config/api-config';

interface BloomPerformance {
  bloom_category: string;
  total_attempts: number;
  correct_attempts: number;
  avg_response_time: number;
  avg_difficulty: number;
  accuracy: number;
}

interface WeakArea {
  bloom_category: string;
  tags: string[];
  attempts: number;
  correct: number;
  avg_difficulty: number;
  accuracy: number;
}

interface BloomAnalyticsProps {
  className?: string;
}

const bloomCategoryNames: Record<string, string> = {
  'remember': 'Ghi nhớ',
  'understand': 'Hiểu biết',
  'apply': 'Áp dụng',
  'analyze': 'Phân tích', 
  'evaluate': 'Đánh giá',
  'create': 'Sáng tạo'
};

const bloomCategoryColors: Record<string, string> = {
  'remember': 'bg-blue-100 text-blue-800',
  'understand': 'bg-green-100 text-green-800',
  'apply': 'bg-yellow-100 text-yellow-800',
  'analyze': 'bg-orange-100 text-orange-800',
  'evaluate': 'bg-red-100 text-red-800',
  'create': 'bg-purple-100 text-purple-800'
};

export default function BloomAnalytics({ className }: BloomAnalyticsProps) {
  const { token } = useAuth();
  const [performance, setPerformance] = useState<BloomPerformance[]>([]);
  const [weakAreas, setWeakAreas] = useState<WeakArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBloomAnalytics = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/analytics/bloom-performance`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPerformance(data.performanceByCategory || []);
        setWeakAreas(data.weakAreas || []);
      } else {
        throw new Error('Failed to fetch Bloom analytics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchBloomAnalytics();
    }
  }, [token, fetchBloomAnalytics]);

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 80) return 'text-green-600';
    if (accuracy >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getDifficultyStars = (difficulty: number) => {
    return '★'.repeat(Math.round(difficulty)) + '☆'.repeat(5 - Math.round(difficulty));
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md ${className}`}>
        {error}
      </div>
    );
  }

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        📊 Phân tích theo Bloom&apos;s Taxonomy
      </h3>

      {/* Performance by Category */}
      <div className="space-y-3 mb-6">
        <h4 className="text-md font-medium text-gray-700">Hiệu suất theo danh mục</h4>
        {performance.length === 0 ? (
          <p className="text-gray-500 text-sm">Chưa có dữ liệu phân tích</p>
        ) : (
          performance.map((perf) => (
            <div key={perf.bloom_category} className="bg-white p-4 rounded-lg border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    bloomCategoryColors[perf.bloom_category] || 'bg-gray-100 text-gray-800'
                  }`}>
                    {bloomCategoryNames[perf.bloom_category] || perf.bloom_category}
                  </span>
                  <span className="text-sm text-gray-500">
                    {perf.total_attempts} lần thử
                  </span>
                </div>
                <div className={`text-lg font-semibold ${getAccuracyColor(perf.accuracy)}`}>
                  {Math.round(perf.accuracy)}%
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Độ khó trung bình:</span>
                  <span className="ml-2 text-yellow-600">
                    {getDifficultyStars(perf.avg_difficulty)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Thời gian trung bình:</span>
                  <span className="ml-2 font-medium">
                    {Math.round(perf.avg_response_time / 1000)}s
                  </span>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-3">
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      perf.accuracy >= 80 ? 'bg-green-500' : 
                      perf.accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(100, perf.accuracy)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Weak Areas */}
      {weakAreas.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-md font-medium text-gray-700">📉 Điểm yếu cần cải thiện</h4>
          {weakAreas.slice(0, 3).map((area, index) => (
            <div key={`${area.bloom_category}-${index}`} className="bg-red-50 p-3 rounded-lg border border-red-200">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  bloomCategoryColors[area.bloom_category] || 'bg-gray-100 text-gray-800'
                }`}>
                  {bloomCategoryNames[area.bloom_category] || area.bloom_category}
                </span>
                <span className="text-red-600 font-semibold">
                  {Math.round(area.accuracy)}%
                </span>
              </div>
              
              <div className="text-sm text-gray-600">
                <span>{area.attempts} lần thử • </span>
                <span>Độ khó {getDifficultyStars(area.avg_difficulty)}</span>
                {area.tags.length > 0 && (
                  <div className="mt-1">
                    <span className="text-xs">Tags: </span>
                    {area.tags.map((tag, i) => (
                      <span key={i} className="inline-block bg-gray-200 text-gray-700 px-1 py-0.5 rounded text-xs mr-1">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="mt-2 text-xs text-red-700">
                💡 Gợi ý: Luyện tập thêm với câu hỏi ở mức độ này để cải thiện
              </div>
            </div>
          ))}
        </div>
      )}

      {performance.length === 0 && weakAreas.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">📈</div>
          <p>Bắt đầu làm quiz để xem phân tích chi tiết!</p>
          <p className="text-sm mt-1">Hệ thống sẽ phân tích theo Bloom&apos;s Taxonomy</p>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_CONFIG } from '@/config/api-config';
import QuizPlayer from '../quiz/QuizPlayer';

interface DueQuiz {
  id: number;
  title: string;
  topic: string;
  level: string;
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
  }>;
  next_review: string;
  n: number;
  ease_factor: number;
  total_reviews: number;
  last_review: string;
  interval_days: number;
}

interface WeakTopic {
  topic: string;
  avg_score: number;
  attempts: number;
}

interface StudyPlan {
  dueQuizzes: DueQuiz[];
  totalDue: number;
  weakTopics: WeakTopic[];
  recommendation: string;
}

interface SpacedRepetitionStats {
  total_tracked_quizzes: number;
  due_for_review: number;
  mastered_quizzes: number;
  avg_ease_factor: number;
  avg_reviews_per_quiz: number;
  total_reviews: number;
  upcomingReviews: Array<{
    review_date: string;
    count: number;
  }>;
}

export default function StudyPlan() {
  const { token } = useAuth();
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [spacedRepStats, setSpacedRepStats] = useState<SpacedRepetitionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<DueQuiz | null>(null);

  const fetchStudyPlan = React.useCallback(async () => {
    try {
      const [planResponse, statsResponse] = await Promise.all([
        fetch(`${API_CONFIG.BASE_URL}/api/study/daily-plan`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_CONFIG.BASE_URL}/api/study/spaced-repetition-stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (planResponse.ok && statsResponse.ok) {
        const planData = await planResponse.json();
        const statsData = await statsResponse.json();
        setStudyPlan(planData);
        setSpacedRepStats(statsData);
      } else {
        throw new Error('Failed to fetch study plan');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load study plan');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchStudyPlan();
    }
  }, [token, fetchStudyPlan]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDifficultyColor = (n: number) => {
    if (n === 0) return 'text-red-600 bg-red-100';
    if (n <= 2) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getDifficultyText = (n: number) => {
    if (n === 0) return 'Mới';
    if (n <= 2) return 'Đang học';
    return 'Đã thuộc';
  };

  const playQuiz = (quiz: DueQuiz) => {
    setSelectedQuiz(quiz);
  };

  const handleQuizComplete = async (score: number) => {
    console.log(`Quiz completed with score: ${score}%`);
    setSelectedQuiz(null);
    // Refresh study plan after completing a quiz
    await fetchStudyPlan();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
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
          Kế hoạch học tập
        </h1>
        <p className="text-gray-600">
          Học tập hiệu quả với hệ thống lặp lại ngắt quãng
        </p>
      </div>

      {/* Recommendation Banner */}
      {studyPlan?.recommendation && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-6 py-4 rounded-lg mb-8">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              <div className="text-2xl">💡</div>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Gợi ý hôm nay</h3>
              <p>{studyPlan.recommendation}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content - Due Quizzes */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Quiz cần ôn tập ({studyPlan?.totalDue || 0})
              </h2>
              <div className="text-sm text-gray-500">
                {studyPlan?.totalDue === 0 ? 'Tuyệt vời!' : 'Hãy ôn tập ngay!'}
              </div>
            </div>

            {(!studyPlan?.dueQuizzes || studyPlan.dueQuizzes.length === 0) ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Không có quiz nào cần ôn tập
                </h3>
                <p className="text-gray-600">
                  Bạn đã hoàn thành tất cả các bài ôn tập hôm nay!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {studyPlan.dueQuizzes.map((quiz) => (
                  <div key={quiz.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{quiz.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span>📚 {quiz.topic}</span>
                          <span>📊 {quiz.questions.length} câu</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(quiz.n)}`}>
                            {getDifficultyText(quiz.n)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Đáo hạn: {formatDate(quiz.next_review)}</span>
                          <span>Lần ôn: {quiz.total_reviews}</span>
                          <span>Độ dễ: {quiz.ease_factor.toFixed(1)}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => playQuiz(quiz)}
                        className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                      >
                        Ôn tập
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weak Topics */}
          {studyPlan?.weakTopics && studyPlan.weakTopics.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Chủ đề cần cải thiện
              </h2>
              <div className="space-y-3">
                {studyPlan.weakTopics.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <div>
                      <span className="font-medium text-gray-900">{topic.topic}</span>
                      <span className="text-sm text-gray-600 ml-2">({topic.attempts} lần làm)</span>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${topic.avg_score < 60 ? 'text-red-600' : topic.avg_score < 80 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {Math.round(topic.avg_score)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Statistics */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê học tập</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Quiz đang theo dõi</span>
                <span className="font-semibold">{spacedRepStats?.total_tracked_quizzes || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cần ôn tập</span>
                <span className="font-semibold text-orange-600">{spacedRepStats?.due_for_review || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Đã thành thạo</span>
                <span className="font-semibold text-green-600">{spacedRepStats?.mastered_quizzes || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tổng lần ôn</span>
                <span className="font-semibold">{spacedRepStats?.total_reviews || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Độ dễ trung bình</span>
                <span className="font-semibold">{spacedRepStats?.avg_ease_factor?.toFixed(1) || '2.5'}</span>
              </div>
            </div>
          </div>

          {/* Upcoming Reviews */}
          {spacedRepStats?.upcomingReviews && spacedRepStats.upcomingReviews.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lịch ôn tập sắp tới</h3>
              <div className="space-y-2">
                {spacedRepStats.upcomingReviews.map((review, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">{formatDate(review.review_date)}</span>
                    <span className="font-medium">{review.count} quiz</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quiz Player Modal */}
      {selectedQuiz && (
        <QuizPlayer
          quiz={selectedQuiz}
          onClose={() => setSelectedQuiz(null)}
          onComplete={handleQuizComplete}
        />
      )}
    </div>
  );
}

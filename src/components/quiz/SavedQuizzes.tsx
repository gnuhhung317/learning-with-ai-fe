"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_CONFIG } from '@/config/api-config';
import QuizPlayer from './QuizPlayer';
import QuizEditor from './QuizEditor';
import { useRouter } from 'next/navigation';
import { 
  BookOpenIcon, 
  CalendarDaysIcon, 
  AcademicCapIcon,
  TrashIcon,
  PlayIcon,
  ArrowTopRightOnSquareIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

interface SavedQuiz {
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
  created_at: string;
}

interface SavedQuizzesProps {
  onPlayQuiz?: (quiz: SavedQuiz) => void;
}

export default function SavedQuizzes({ onPlayQuiz }: SavedQuizzesProps) {
  const { token } = useAuth();
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<SavedQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<SavedQuiz | null>(null);
  const [editingQuiz, setEditingQuiz] = useState<SavedQuiz | null>(null);

  const fetchSavedQuizzes = React.useCallback(async () => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.QUIZ_SAVED}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setQuizzes(data.quizzes || []);
      } else {
        throw new Error('Failed to fetch saved quizzes');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load saved quizzes');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const deleteQuiz = async (quizId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa quiz này?')) {
      return;
    }

    setDeleting(quizId);
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/quiz/${quizId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setQuizzes(prev => prev.filter(quiz => quiz.id !== quizId));
      } else {
        throw new Error('Failed to delete quiz');
      }
    } catch (err) {
      alert('Không thể xóa quiz. Vui lòng thử lại.');
      console.error('Delete quiz error:', err);
    } finally {
      setDeleting(null);
    }
  };

  const playQuiz = (quiz: SavedQuiz) => {
    if (onPlayQuiz) {
      onPlayQuiz(quiz);
    } else {
      // Open quiz player modal
      setSelectedQuiz(quiz);
    }
  };

  const editQuiz = (quiz: SavedQuiz) => {
    setEditingQuiz(quiz);
  };

  const handleQuizUpdated = (updatedQuiz: { 
    id: number; 
    title: string; 
    topic: string; 
    level: string; 
    questions: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
      explanation?: string;
    }>
  }) => {
    // Convert the updated quiz to SavedQuiz format
    const savedQuiz: SavedQuiz = {
      ...updatedQuiz,
      created_at: editingQuiz?.created_at || new Date().toISOString()
    };
    setQuizzes(prev => prev.map(quiz => quiz.id === savedQuiz.id ? savedQuiz : quiz));
    setEditingQuiz(null);
  };

  useEffect(() => {
    if (token) {
      fetchSavedQuizzes();
    }
  }, [token, fetchSavedQuizzes]);

  // Limit number of quiz cards shown by default to avoid showing too many at once
  const INITIAL_VISIBLE = 6;
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_VISIBLE);
  const isExpanded = visibleCount >= quizzes.length;
  const toggleShowMore = () => {
    if (isExpanded) {
      setVisibleCount(INITIAL_VISIBLE);
    } else {
      setVisibleCount(quizzes.length);
    }
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

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'beginner': return 'Cơ bản';
      case 'intermediate': return 'Trung cấp';
      case 'advanced': return 'Nâng cao';
      default: return level;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
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
          Quiz đã lưu
        </h1>
        <p className="text-gray-600">
          {quizzes.length} quiz trong thư viện của bạn
        </p>
      </div>

      {quizzes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <BookOpenIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Chưa có quiz nào được lưu
          </h2>
          <p className="text-gray-600">
            Các quiz bạn tạo sẽ được tự động lưu ở đây khi bạn đăng nhập.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.slice(0, visibleCount).map((quiz) => (
            <div key={quiz.id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {quiz.title}
                    </h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(quiz.level)}`}>
                        {getLevelText(quiz.level)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 mb-2">
                      <div className="line-clamp-2" title={quiz.topic}>
                        {quiz.topic}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <AcademicCapIcon className="h-4 w-4 mr-1" />
                  <span className="mr-4">{quiz.questions.length} câu hỏi</span>
                  <CalendarDaysIcon className="h-4 w-4 mr-1" />
                  <span>{formatDate(quiz.created_at)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => playQuiz(quiz)}
                      className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors text-sm"
                    >
                      <PlayIcon className="h-4 w-4 mr-1" />
                      Popup
                    </button>
                    
                    <button 
                      onClick={() => router.push(`/quiz?id=${quiz.id}`)}
                      className="flex items-center text-green-600 hover:text-green-800 font-medium transition-colors text-sm"
                    >
                      <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-1" />
                      Trang riêng
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => editQuiz(quiz)}
                      className="text-gray-400 hover:text-blue-600 transition-colors"
                      title="Chỉnh sửa quiz"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    
                    <button 
                      onClick={() => deleteQuiz(quiz.id)}
                      disabled={deleting === quiz.id}
                      className={`transition-colors ${
                        deleting === quiz.id 
                          ? 'text-gray-400 cursor-not-allowed' 
                          : 'text-gray-400 hover:text-red-600'
                      }`}
                      title="Xóa quiz"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          </div>
          {/* Show more / collapse control */}
          {quizzes.length > INITIAL_VISIBLE && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={toggleShowMore}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                {isExpanded ? 'Thu gọn' : `Xem thêm (+${quizzes.length - INITIAL_VISIBLE})`}
              </button>
            </div>
          )}
        </>
      )}
      
      {/* Quiz Player Modal */}
      {selectedQuiz && (
        <QuizPlayer
          quiz={selectedQuiz}
          onClose={() => setSelectedQuiz(null)}
          onComplete={(score) => {
            console.log(`Quiz completed with score: ${score}%`);
            // Optionally refresh quiz history or show success message
          }}
        />
      )}

      {/* Quiz Editor Modal */}
      {editingQuiz && (
        <QuizEditor
          quiz={editingQuiz}
          isOpen={!!editingQuiz}
          onClose={() => setEditingQuiz(null)}
          onSave={handleQuizUpdated}
        />
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { API_CONFIG } from '@/config/api-config';
import { 
  ClockIcon, 
  ArrowLeftIcon,
  CheckCircleIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface Quiz {
  id: number;
  title: string;
  topic: string;
  level: string;
  questions: QuizQuestion[];
}

export default function QuizPage() {
  const { token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const quizId = searchParams.get('id');

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState<boolean[]>([]);
  const [startTime] = useState<number>(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentTime, setCurrentTime] = useState<number>(0);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  // Fetch quiz data or quiz list
  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError('Token không hợp lệ');
        setLoading(false);
        return;
      }

      try {
        if (quizId) {
          // Fetch specific quiz
          const response = await fetch(`${API_CONFIG.BASE_URL}/api/quiz/${quizId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            setQuiz(data.quiz);
            setSelectedAnswers(new Array(data.quiz.questions.length).fill(-1));
            setShowResults(new Array(data.quiz.questions.length).fill(false));
          } else {
            throw new Error('Không thể tải quiz');
          }
        } else {
          // Fetch quiz list
          const response = await fetch(`${API_CONFIG.BASE_URL}/api/quiz/saved`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            setQuizzes(data.quizzes || []);
          } else {
            throw new Error('Không thể tải danh sách quiz');
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [quizId, token]);

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    if (isSubmitted) return;
    
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    const correctAnswers = selectedAnswers.reduce((count, answer, index) => {
      return count + (answer === quiz.questions[index].correctAnswer ? 1 : 0);
    }, 0);
    return (correctAnswers / quiz.questions.length) * 100;
  };

  const submitQuizAttempt = async () => {
    if (!token || !quiz) return;

    setSubmitting(true);
    try {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const score = calculateScore();

      const response = await fetch(`${API_CONFIG.BASE_URL}/api/quiz/attempt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          quizId: quiz.id,
          answers: selectedAnswers,
          timeSpent,
          score
        })
      });

      if (response.ok) {
        setShowResults(new Array(quiz.questions.length).fill(true));
        setIsSubmitted(true);
      } else {
        throw new Error('Không thể lưu kết quả');
      }
    } catch (error) {
      console.error('Error saving quiz attempt:', error);
      alert('Có lỗi khi lưu kết quả. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'beginner': return 'Cơ bản';
      case 'intermediate': return 'Trung cấp';
      case 'advanced': return 'Nâng cao';
      default: return level;
    }
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Có lỗi xảy ra</h2>
            <p>{error}</p>
          </div>
          <button
            onClick={() => router.back()}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            ← Quay lại
          </button>
        </div>
      </div>
    );
  }

  // Show quiz selection if no specific quiz ID
  if (!quizId) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-gray-800"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Quay lại
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Chọn Quiz để làm</h1>
              <div></div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 py-8">
          {loading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải danh sách quiz...</p>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <AcademicCapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Chưa có quiz nào
              </h2>
              <p className="text-gray-600 mb-4">
                Bạn chưa có quiz nào được lưu. Hãy tạo quiz mới trước.
              </p>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Tạo Quiz mới
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {quiz.title}
                    </h3>
                    
                    <div className="flex items-center space-x-2 mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(quiz.level)}`}>
                        {getLevelText(quiz.level)}
                      </span>
                      <span className="text-sm text-gray-500">{quiz.topic}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <AcademicCapIcon className="h-4 w-4 mr-1" />
                      <span>{quiz.questions.length} câu hỏi</span>
                    </div>

                    <button
                      onClick={() => router.push(`/quiz?id=${quiz.id}`)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Bắt đầu làm quiz
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  // If we have a quiz ID but no quiz loaded yet or error
  if (!quiz) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Không tìm thấy quiz</h2>
            <p>Quiz không tồn tại hoặc bạn không có quyền truy cập.</p>
          </div>
          <button
            onClick={() => router.back()}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            ← Quay lại
          </button>
        </div>
      </div>
    );
  }

  const allAnswered = selectedAnswers.every(answer => answer !== -1);
  const correctCount = selectedAnswers.reduce((count, answer, index) => {
    return count + (answer === quiz.questions[index].correctAnswer ? 1 : 0);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Quay lại
            </button>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center text-sm text-gray-600">
                <ClockIcon className="h-4 w-4 mr-1" />
                {formatTime(currentTime)}
              </div>
              
              {isSubmitted && (
                <div className="flex items-center text-sm text-green-600">
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  Đã nộp bài
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Quiz Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(quiz.level)}`}>
              {getLevelText(quiz.level)}
            </span>
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
            <span>Chủ đề: {quiz.topic}</span>
            <span>{quiz.questions.length} câu hỏi</span>
            {isSubmitted && (
              <span className="text-blue-600 font-medium">
                Điểm: {calculateScore().toFixed(1)}%
              </span>
            )}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${(selectedAnswers.filter(a => a !== -1).length / quiz.questions.length) * 100}%` 
              }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Đã trả lời: {selectedAnswers.filter(a => a !== -1).length}/{quiz.questions.length}
          </p>
        </div>

        {/* Questions */}
        <div className="space-y-8">
          {quiz.questions.map((question, questionIndex) => (
            <div key={questionIndex} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start mb-4">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-4">
                  {questionIndex + 1}
                </span>
                <h3 className="text-lg font-medium text-gray-900 flex-1">
                  {question.question}
                </h3>
              </div>

              <div className="ml-12 space-y-3">
                {question.options.map((option, optionIndex) => (
                  <label
                    key={optionIndex}
                    className={`block p-4 cursor-pointer border rounded-lg transition-all ${
                      selectedAnswers[questionIndex] === optionIndex
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    } ${
                      showResults[questionIndex]
                        ? optionIndex === question.correctAnswer
                          ? 'border-green-500 bg-green-50'
                          : selectedAnswers[questionIndex] === optionIndex && optionIndex !== question.correctAnswer
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 bg-gray-50'
                        : ''
                    } ${isSubmitted ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name={`question-${questionIndex}`}
                        value={optionIndex}
                        checked={selectedAnswers[questionIndex] === optionIndex}
                        onChange={() => handleAnswerSelect(questionIndex, optionIndex)}
                        disabled={isSubmitted}
                        className="mr-3"
                      />
                      <span className="text-sm font-medium mr-3">
                        {String.fromCharCode(65 + optionIndex)}.
                      </span>
                      <span className="flex-1">{option}</span>
                      
                      {/* Show correct/incorrect icons after submission */}
                      {showResults[questionIndex] && (
                        <span className="ml-2">
                          {optionIndex === question.correctAnswer ? (
                            <span className="text-green-600">✓</span>
                          ) : selectedAnswers[questionIndex] === optionIndex ? (
                            <span className="text-red-600">✗</span>
                          ) : null}
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>

              {/* Show explanation after submission */}
              {showResults[questionIndex] && question.explanation && (
                <div className="ml-12 mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="mb-2">
                    {selectedAnswers[questionIndex] === question.correctAnswer ? (
                      <span className="text-green-600 font-medium">✓ Chính xác!</span>
                    ) : (
                      <span className="text-red-600 font-medium">
                        ✗ Chưa chính xác. Đáp án đúng: {String.fromCharCode(65 + question.correctAnswer)}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Giải thích:</strong> {question.explanation}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Submit Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          {!isSubmitted ? (
            <div className="text-center">
              <div className="mb-4">
                <p className="text-gray-600 mb-2">
                  {allAnswered 
                    ? 'Bạn đã trả lời tất cả câu hỏi. Sẵn sàng nộp bài?' 
                    : `Còn ${quiz.questions.length - selectedAnswers.filter(a => a !== -1).length} câu chưa trả lời`
                  }
                </p>
                <p className="text-sm text-gray-500">
                  Thời gian: {formatTime(currentTime)}
                </p>
              </div>
              
              <button
                onClick={submitQuizAttempt}
                disabled={!allAnswered || submitting}
                className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                  allAnswered && !submitting
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {submitting ? 'Đang nộp bài...' : 'Nộp bài'}
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Hoàn thành!</h2>
                <p className="text-gray-600 mb-4">Bạn đã nộp bài thành công</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{calculateScore().toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Điểm số</div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{correctCount}/{quiz.questions.length}</div>
                  <div className="text-sm text-gray-600">Câu đúng</div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{formatTime(currentTime)}</div>
                  <div className="text-sm text-gray-600">Thời gian</div>
                </div>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => router.push('/')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Về trang chủ
                </button>
                
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Làm lại
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

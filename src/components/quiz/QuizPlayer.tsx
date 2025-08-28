"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { API_CONFIG } from '@/config/api-config';

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

interface QuizPlayerProps {
  quiz: Quiz;
  onClose: () => void;
  onComplete?: (score: number) => void;
}

export default function QuizPlayer({ quiz, onClose, onComplete }: QuizPlayerProps) {
  const { token } = useAuth();
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(new Array(quiz.questions.length).fill(-1));
  const [showResults, setShowResults] = useState<boolean[]>(new Array(quiz.questions.length).fill(false));
  const [startTime] = useState<number>(Date.now());
  const [submitting, setSubmitting] = useState(false);

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const calculateScore = () => {
    const correctAnswers = selectedAnswers.reduce((count, answer, index) => {
      return count + (answer === quiz.questions[index].correctAnswer ? 1 : 0);
    }, 0);
    return (correctAnswers / quiz.questions.length) * 100;
  };

  const submitQuizAttempt = async () => {
    if (!token) return;

    setSubmitting(true);
    try {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const score = calculateScore();

      await fetch(`${API_CONFIG.BASE_URL}/api/quiz/attempt`, {
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

      onComplete?.(score);
    } catch (error) {
      console.error('Error saving quiz attempt:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitQuiz = async () => {
    setShowResults(new Array(quiz.questions.length).fill(true));
    await submitQuizAttempt();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{quiz.title}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <span>Chủ đề: {quiz.topic}</span>
                <span>Trình độ: {quiz.level}</span>
                <span>{quiz.questions.length} câu hỏi</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>

          {/* Questions */}
          <div className="space-y-8">
            {quiz.questions.map((question, questionIndex) => (
              <div key={questionIndex} className="border-b border-gray-200 pb-6 last:border-b-0">
                <p className="font-medium mb-4 text-lg">
                  {questionIndex + 1}. {question.question}
                </p>
                
                <div className="space-y-3">
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
                      }`}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name={`question-${questionIndex}`}
                          value={optionIndex}
                          checked={selectedAnswers[questionIndex] === optionIndex}
                          onChange={() => handleAnswerSelect(questionIndex, optionIndex)}
                          disabled={showResults[questionIndex]}
                          className="mr-3"
                        />
                        <span className="text-sm font-medium mr-3">
                          {String.fromCharCode(65 + optionIndex)}.
                        </span>
                        <span>{option}</span>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Show explanation after submission */}
                {showResults[questionIndex] && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="mb-2">
                      {selectedAnswers[questionIndex] === question.correctAnswer ? (
                        <span className="text-green-600 font-medium">✓ Chính xác!</span>
                      ) : (
                        <span className="text-red-600 font-medium">
                          ✗ Chưa chính xác. Đáp án đúng là: {String.fromCharCode(65 + question.correctAnswer)}
                        </span>
                      )}
                    </div>
                    {question.explanation && (
                      <div className="text-sm text-gray-600">
                        <strong>Giải thích:</strong> {question.explanation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex justify-between items-center">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Đóng
            </button>

            <div className="space-x-4">
              {selectedAnswers.every(answer => answer !== -1) && !showResults.some(result => result) && (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={submitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300"
                >
                  {submitting ? 'Đang nộp bài...' : 'Nộp bài'}
                </button>
              )}

              {showResults.some(result => result) && (
                <div className="flex items-center space-x-4">
                  <div className="text-lg font-semibold text-blue-600">
                    Điểm: {calculateScore().toFixed(1)}%
                  </div>
                  <button
                    onClick={() => {
                      setSelectedAnswers(new Array(quiz.questions.length).fill(-1));
                      setShowResults(new Array(quiz.questions.length).fill(false));
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Làm lại
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

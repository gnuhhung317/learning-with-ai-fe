"use client";

import React, { useState } from 'react';
import { API_CONFIG } from '../config/api-config';

interface FormData {
  topic: string;
  level: string;
  numberOfQuestions: number;
  description: string;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export default function Quiz() {
  const [formData, setFormData] = useState<FormData>({
    topic: '',
    level: 'beginner',
    numberOfQuestions: 5,
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState<boolean[]>(new Array(questions.length).fill(false));
  const [quizPdfUrl, setQuizPdfUrl] = useState<string | null>(null);
  const [answersPdfUrl, setAnswersPdfUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        setFileError('Please upload a PDF file');
        setSelectedFile(null);
      } else {
        setFileError(null);
        setSelectedFile(file);
      }
    }
  };

  const handlePDFSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setFileError('Please select a PDF file');
      return;
    }

    setLoading(true);
    setError(null);
    setQuestions([]);
    setSelectedAnswers([]);
    setShowResults(new Array(questions.length).fill(false));
    setQuizPdfUrl(null);
    setAnswersPdfUrl(null);

    try {
      const pdfFormData = new FormData();
      pdfFormData.append('file', selectedFile);
      pdfFormData.append('numberOfQuestions', String(formData.numberOfQuestions));
      pdfFormData.append('level', formData.level);
      pdfFormData.append('description', formData.description);

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.QUIZ_PDF}`, {
        method: 'POST',
        body: pdfFormData
      });

      if (!response.ok) {
        throw new Error('Failed to generate quiz from PDF');
      }

      const { questions: newQuestions } = await response.json();
      setQuestions(newQuestions);
      setSelectedAnswers(new Array(newQuestions.length).fill(-1));

      // Generate quiz PDF URL
      const quizResponse = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.QUIZ_PDF_GENERATE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questions: newQuestions, type: 'quiz' })
      });

      if (quizResponse.ok) {
        const quizBlob = await quizResponse.blob();
        setQuizPdfUrl(URL.createObjectURL(quizBlob));
      }

      // Generate answers PDF URL
      const answersResponse = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.QUIZ_PDF_GENERATE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questions: newQuestions, type: 'answers' })
      });

      if (answersResponse.ok) {
        const answersBlob = await answersResponse.blob();
        setAnswersPdfUrl(URL.createObjectURL(answersBlob));
      }
    } catch (err) {
      setError('Failed to generate quiz from PDF. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setQuestions([]);
    setSelectedAnswers([]);
    setShowResults(new Array(questions.length).fill(false));
    setQuizPdfUrl(null);
    setAnswersPdfUrl(null);

    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.QUIZ}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: formData.topic,
          level: formData.level,
          numberOfQuestions: formData.numberOfQuestions,
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate quiz');
      }

      const { questions: newQuestions } = await response.json();
      setQuestions(newQuestions);
      setSelectedAnswers(new Array(newQuestions.length).fill(-1));

      // Generate quiz PDF URL
      const quizResponse = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.QUIZ_PDF_GENERATE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questions: newQuestions, type: 'quiz' })
      });

      if (quizResponse.ok) {
        const quizBlob = await quizResponse.blob();
        setQuizPdfUrl(URL.createObjectURL(quizBlob));
      }

      // Generate answers PDF URL
      const answersResponse = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.QUIZ_PDF_GENERATE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questions: newQuestions, type: 'answers' })
      });

      if (answersResponse.ok) {
        const answersBlob = await answersResponse.blob();
        setAnswersPdfUrl(URL.createObjectURL(answersBlob));
      }
    } catch (err) {
      setError('Failed to generate quiz. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const calculateScore = () => {
    const correctAnswers = selectedAnswers.reduce((count, answer, index) => {
      return count + (answer === questions[index].correctAnswer ? 1 : 0);
    }, 0);
    return (correctAnswers / questions.length) * 100;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-8">Tạo Bài Kiểm Tra</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="text-xl font-semibold mb-4">Tạo từ chủ đề</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Chủ đề</label>
              <input
                type="text"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Trình độ</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                <option value="beginner">Cơ bản</option>
                <option value="intermediate">Trung cấp</option>
                <option value="advanced">Nâng cao</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Số lượng câu hỏi</label>
              <input
                type="number"
                min="1"
                max="100"
                value={String(formData.numberOfQuestions)}
                onChange={(e) => setFormData({ ...formData, numberOfQuestions: parseInt(e.target.value) || 5 })}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Mô tả chủ đề</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border rounded-md"
                rows={3}
                placeholder="Nhập mô tả chi tiết về chủ đề để tạo câu hỏi tập trung vào nội dung chính"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? 'Đang tạo...' : 'Tạo bài kiểm tra'}
            </button>
          </form>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Tạo từ tệp PDF</h3>
          <form onSubmit={handlePDFSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Chọn tệp PDF</label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="w-full p-2 border rounded-md"
                required
              />
              {fileError && (
                <p className="text-red-500 text-sm mt-1">{fileError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Mô tả nội dung PDF</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border rounded-md"
                rows={3}
                placeholder="Nhập mô tả về nội dung của tệp PDF để tạo câu hỏi tập trung vào chủ đề chính"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !selectedFile}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? 'Đang tạo...' : 'Tạo bài kiểm tra từ PDF'}
            </button>
          </form>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {questions.length > 0 && (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-semibold">Câu hỏi kiểm tra</h3>
            <div className="space-x-4">
              {quizPdfUrl && (
                <a
                  href={quizPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Tải bài kiểm tra PDF
                </a>
              )}
              {showResults && answersPdfUrl && (
                <a
                  href={answersPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Tải đáp án PDF
                </a>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {questions.map((question, questionIndex) => (
              <div key={questionIndex} className="border-b pb-4 last:border-b-0">
                <p className="font-medium mb-3">{questionIndex + 1}. {question.question}</p>
                <div className="space-y-2">
                  {question.options.map((option, optionIndex) => (
                    <label
                      key={optionIndex}
                      className="block p-3 cursor-pointer hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name={`question-${questionIndex}`}
                          value={optionIndex}
                          checked={selectedAnswers[questionIndex] === optionIndex}
                          onChange={() => handleAnswerSelect(questionIndex, optionIndex)}
                          className="mr-3"
                        />
                        {option}
                      </div>
                    </label>
                  ))}
                </div>
                {showResults[questionIndex] && (
                  <div className="mt-3 text-sm">
                    {selectedAnswers[questionIndex] === question.correctAnswer ? (
                      <div className="text-green-600">
                        <strong>Chính xác!</strong>
                        {question.explanation && (
                          <div className="mt-1 text-gray-600">
                            <strong>Giải thích:</strong> {question.explanation}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-red-600">
                        <strong>Chưa chính xác.</strong> Đáp án đúng là: {String.fromCharCode(65 + question.correctAnswer)}
                        {question.explanation && (
                          <div className="mt-1 text-gray-600">
                            <strong>Giải thích:</strong> {question.explanation}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {selectedAnswers.length > 0 && selectedAnswers.every(answer => answer !== -1) && !showResults.some(result => result) && (
            <div className="flex gap-4">
              <button
                onClick={() => setShowResults(new Array(questions.length).fill(true))}
                className="mt-6 w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
              >
                Nộp bài
              </button>
            </div>
          )}

          {showResults.some(result => result) && (
            <div className="space-y-4">
              <div className="mt-6 p-4 bg-blue-50 rounded-md">
                <p className="text-lg font-semibold">
                  Điểm của bạn: {calculateScore().toFixed(1)}%
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedAnswers(new Array(questions.length).fill(-1));
                  setShowResults(new Array(questions.length).fill(false));
                }}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Làm lại
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
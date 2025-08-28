import React, { useState, useEffect } from 'react';
import { API_CONFIG } from '@/config/api-config';

interface Question {
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
  questions: Question[];
}

interface QuizEditorProps {
  quiz: Quiz | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (quiz: Quiz) => void;
}

export default function QuizEditor({ quiz, isOpen, onClose, onSave }: QuizEditorProps) {
  const [editedQuiz, setEditedQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (quiz) {
      setEditedQuiz({ ...quiz });
    }
  }, [quiz]);

  const handleSave = async () => {
    if (!editedQuiz) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/quiz/${editedQuiz.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editedQuiz.title,
          topic: editedQuiz.topic,
          level: editedQuiz.level,
          questions: editedQuiz.questions
        })
      });

      const data = await response.json();
      if (data.success) {
        onSave(data.quiz);
        onClose();
      }
    } catch (error) {
      console.error('Error saving quiz:', error);
      alert('Failed to save quiz. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuizField = (field: keyof Quiz, value: string) => {
    if (!editedQuiz) return;
    setEditedQuiz({ ...editedQuiz, [field]: value });
  };

  const updateQuestion = (index: number, field: keyof Question, value: string | number) => {
    if (!editedQuiz) return;
    const updatedQuestions = [...editedQuiz.questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setEditedQuiz({ ...editedQuiz, questions: updatedQuestions });
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    if (!editedQuiz) return;
    const updatedQuestions = [...editedQuiz.questions];
    const updatedOptions = [...updatedQuestions[questionIndex].options];
    updatedOptions[optionIndex] = value;
    updatedQuestions[questionIndex] = { ...updatedQuestions[questionIndex], options: updatedOptions };
    setEditedQuiz({ ...editedQuiz, questions: updatedQuestions });
  };

  const addQuestion = () => {
    if (!editedQuiz) return;
    const newQuestion: Question = {
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: ''
    };
    setEditedQuiz({
      ...editedQuiz,
      questions: [...editedQuiz.questions, newQuestion]
    });
  };

  const removeQuestion = (index: number) => {
    if (!editedQuiz) return;
    const updatedQuestions = editedQuiz.questions.filter((_, i) => i !== index);
    setEditedQuiz({ ...editedQuiz, questions: updatedQuestions });
  };

  const addOption = (questionIndex: number) => {
    if (!editedQuiz) return;
    const updatedQuestions = [...editedQuiz.questions];
    updatedQuestions[questionIndex].options.push('');
    setEditedQuiz({ ...editedQuiz, questions: updatedQuestions });
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    if (!editedQuiz) return;
    const updatedQuestions = [...editedQuiz.questions];
    if (updatedQuestions[questionIndex].options.length > 2) {
      updatedQuestions[questionIndex].options.splice(optionIndex, 1);
      // Adjust correct answer if necessary
      if (updatedQuestions[questionIndex].correctAnswer >= optionIndex) {
        updatedQuestions[questionIndex].correctAnswer = Math.max(0, updatedQuestions[questionIndex].correctAnswer - 1);
      }
      setEditedQuiz({ ...editedQuiz, questions: updatedQuestions });
    }
  };

  if (!isOpen || !editedQuiz) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Edit Quiz</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Quiz metadata */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={editedQuiz.title}
                onChange={(e) => updateQuizField('title', e.target.value)}
                placeholder="Quiz title"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
              <input
                type="text"
                value={editedQuiz.topic || ''}
                onChange={(e) => updateQuizField('topic', e.target.value)}
                placeholder="Quiz topic"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
              <select
                value={editedQuiz.level}
                onChange={(e) => updateQuizField('level', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Questions ({editedQuiz.questions.length})</h3>
              <button
                onClick={addQuestion}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                ➕ Add Question
              </button>
            </div>

            {editedQuiz.questions.map((question, questionIndex) => (
              <div key={questionIndex} className="border border-gray-200 rounded-lg p-4 space-y-4">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium">Question {questionIndex + 1}</h4>
                  <button
                    onClick={() => removeQuestion(questionIndex)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    🗑️
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Question Text</label>
                  <textarea
                    value={question.question}
                    onChange={(e) => updateQuestion(questionIndex, 'question', e.target.value)}
                    placeholder="Enter question text"
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">Options</label>
                    <button
                      onClick={() => addOption(questionIndex)}
                      className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      ➕ Add Option
                    </button>
                  </div>
                  
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center gap-2">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            name={`correct-${questionIndex}`}
                            checked={question.correctAnswer === optionIndex}
                            onChange={() => updateQuestion(questionIndex, 'correctAnswer', optionIndex)}
                            className="mr-2"
                          />
                          <span className="text-sm font-medium">{String.fromCharCode(65 + optionIndex)}.</span>
                        </div>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                          className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {question.options.length > 2 && (
                          <button
                            onClick={() => removeOption(questionIndex, optionIndex)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Explanation (optional)</label>
                  <textarea
                    value={question.explanation || ''}
                    onChange={(e) => updateQuestion(questionIndex, 'explanation', e.target.value)}
                    placeholder="Explain the correct answer"
                    rows={2}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Save button */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || !editedQuiz.title || editedQuiz.questions.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              💾 {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

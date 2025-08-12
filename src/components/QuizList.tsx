"use client";

import React, { useEffect, useState } from 'react';
import { QuizService, Group, Quiz as QuizType } from '../services/quiz-service';

export default function QuizList() {
  const [quizzes, setQuizzes] = useState<QuizType[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const quizService = React.useMemo(() => new QuizService(), []);

  useEffect(() => {
    quizService
      .listGroups()
      .then(setGroups)
      .catch(() => {});
  }, [quizService]);

  useEffect(() => {
    setLoading(true);
    quizService
      .listQuizzes(selectedGroup || undefined)
      .then(setQuizzes)
      .catch(() => setQuizzes([]))
      .finally(() => setLoading(false));
  }, [selectedGroup, quizService]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <label className="text-sm font-medium">Nhóm</label>
        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">Tất cả</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>
      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <ul className="space-y-4">
          {quizzes.map((q) => (
            <li key={q.id} className="border rounded p-4 bg-white shadow-sm">
              <h4 className="font-semibold">{q.title}</h4>
              {q.description && (
                <p className="text-sm text-gray-600 mt-1">{q.description}</p>
              )}
              {q.tags && q.tags.length > 0 && (
                <div className="text-xs text-gray-500 mt-2 flex flex-wrap gap-2">
                  {q.tags.map((tag) => (
                    <span key={tag} className="bg-gray-100 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
          {quizzes.length === 0 && (
            <li className="text-gray-500">Không có bài kiểm tra nào</li>
          )}
        </ul>
      )}
    </div>
  );
}

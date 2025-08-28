"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import Dashboard from '@/components/dashboard/Dashboard';
import Quiz from "@/components/Quiz";
import QuizHistory from '@/components/quiz/QuizHistory';
import SavedQuizzes from '@/components/quiz/SavedQuizzes';
import PerformanceAnalytics from '@/components/analytics/PerformanceAnalytics';
import BloomAnalytics from '@/components/analytics/BloomAnalytics';
import AchievementBoard from '@/components/analytics/AchievementBoard';
import StudyPlan from '@/components/study/StudyPlan';
import { 
  UserCircleIcon, 
  HomeIcon, 
  AcademicCapIcon,
  ClockIcon,
  ChartBarIcon,
  BookmarkIcon,
  TrophyIcon,
  CalendarDaysIcon,
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';

type ViewType = 'dashboard' | 'quiz' | 'history' | 'saved' | 'analytics' | 'achievements' | 'study';

export default function Home() {
  const { user, loading, logout } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              AI-Powered Learning Platform
            </h1>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-12 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex flex-col items-center justify-center">
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Chào mừng đến với nền tảng học tập thông minh!
                </h2>
                <p className="text-gray-600 max-w-md">
                  Tạo quiz từ AI, theo dõi tiến độ học tập và cải thiện kết quả một cách khoa học.
                </p>
              </div>
              <LoginForm />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              AI-Powered Learning Platform
            </h1>
            
            {/* Navigation Tabs */}
            <div className="flex space-x-4">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'dashboard'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <HomeIcon className="h-5 w-5 mr-2" />
                Dashboard
              </button>
              
              <button
                onClick={() => setCurrentView('quiz')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'quiz'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <AcademicCapIcon className="h-5 w-5 mr-2" />
                Tạo Quiz
              </button>

              <button
                onClick={() => setCurrentView('saved')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'saved'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <BookmarkIcon className="h-5 w-5 mr-2" />
                Quiz đã lưu
              </button>

              <button
                onClick={() => setCurrentView('study')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'study'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <CalendarDaysIcon className="h-5 w-5 mr-2" />
                Kế hoạch học
              </button>

              <button
                onClick={() => setCurrentView('achievements')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'achievements'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <TrophyIcon className="h-5 w-5 mr-2" />
                Thành tích
              </button>

              <button
                onClick={() => setCurrentView('history')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'history'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ClockIcon className="h-5 w-5 mr-2" />
                Lịch sử
              </button>

              <button
                onClick={() => setCurrentView('analytics')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'analytics'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ChartBarIcon className="h-5 w-5 mr-2" />
                Thống kê
              </button>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <UserCircleIcon className="h-8 w-8 text-gray-400" />
                <span className="ml-2 text-sm text-gray-700">
                  {user.name || user.email.split('@')[0]}
                </span>
              </div>
              
              <button
                onClick={logout}
                className="flex items-center text-gray-500 hover:text-gray-700"
                title="Đăng xuất"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {currentView === 'dashboard' && <Dashboard onNavigate={setCurrentView} />}
          {currentView === 'quiz' && (
            <div className="border-t border-gray-200 pt-8">
              <Quiz />
            </div>
          )}
          {currentView === 'saved' && <SavedQuizzes />}
          {currentView === 'study' && <StudyPlan />}
          {currentView === 'achievements' && <AchievementBoard />}
          {currentView === 'history' && <QuizHistory />}
          {currentView === 'analytics' && (
            <div className="space-y-6">
              <PerformanceAnalytics />
              <BloomAnalytics />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

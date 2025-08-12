"use client";

import { useState } from "react";
import Quiz from "@/components/Quiz";
import QuizList from "@/components/QuizList";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"generate" | "saved">("generate");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            AI-Powered Learning Platform
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6 flex space-x-4 border-b">
            <button
              className={`py-2 px-4 -mb-px border-b-2 ${
                activeTab === "generate"
                  ? "border-blue-500 font-semibold"
                  : "border-transparent"
              }`}
              onClick={() => setActiveTab("generate")}
            >
              Tạo mới
            </button>
            <button
              className={`py-2 px-4 -mb-px border-b-2 ${
                activeTab === "saved"
                  ? "border-blue-500 font-semibold"
                  : "border-transparent"
              }`}
              onClick={() => setActiveTab("saved")}
            >
              Bài kiểm tra đã lưu
            </button>
          </div>
          <div className="border-t border-gray-200 pt-8">
            {activeTab === "generate" ? <Quiz /> : <QuizList />}
          </div>
        </div>
      </main>
    </div>
  );
}

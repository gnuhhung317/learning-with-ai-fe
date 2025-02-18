import Image from "next/image";
import LearningPath from '../components/LearningPath';
import Quiz from "@/components/Quiz";
export default function Home() {
  // In a real application, this would be securely managed through environment variables
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

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
          <div className="border-t border-gray-200 pt-8">
            <Quiz apiKey={apiKey} />
          </div>
        </div>
      </main>
    </div>
  );
}

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Làm Quiz | AI-Powered Learning Platform',
  description: 'Trang làm quiz chuyên dụng với giao diện tối ưu cho việc học tập',
}

export default function QuizLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}

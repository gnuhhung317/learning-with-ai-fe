"use client";

import React from 'react';
import dynamic from 'next/dynamic';

// Create a wrapper component for the chart
const ChartWrapper = dynamic(() => import('./ChartComponents'), { 
  ssr: false,
  loading: () => (
    <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
      <div className="animate-pulse text-gray-500">Đang tải biểu đồ...</div>
    </div>
  )
});

interface PerformanceData {
  date: string;
  avg_score: number;
  attempts_count: number;
}

interface PerformanceLineChartProps {
  data: PerformanceData[];
  formatDate: (date: string) => string;
}

const PerformanceLineChart: React.FC<PerformanceLineChartProps> = ({ data, formatDate }) => {
  return <ChartWrapper data={data} formatDate={formatDate} type="line" />;
};

export default PerformanceLineChart;

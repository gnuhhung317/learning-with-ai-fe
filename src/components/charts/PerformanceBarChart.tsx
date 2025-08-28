"use client";

import React from 'react';
import dynamic from 'next/dynamic';

const ChartWrapper = dynamic(() => import('./ChartComponents'), { 
  ssr: false,
  loading: () => (
    <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
      <div className="animate-pulse text-gray-500">Đang tải biểu đồ...</div>
    </div>
  )
});

interface TopicPerformance {
  topic: string;
  avg_score: number;
  attempts_count: number;
}

interface PerformanceBarChartProps {
  data: TopicPerformance[];
}

const PerformanceBarChart: React.FC<PerformanceBarChartProps> = ({ data }) => {
  return <ChartWrapper data={data} type="bar" />;
};

export default PerformanceBarChart;

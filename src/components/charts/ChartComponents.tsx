import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

interface PerformanceData {
  date: string;
  avg_score: number;
  attempts_count: number;
}

interface TopicPerformance {
  topic: string;
  avg_score: number;
  attempts_count: number;
}

interface ChartComponentsProps {
  data: PerformanceData[] | TopicPerformance[];
  formatDate?: (date: string) => string;
  type: 'line' | 'bar';
}

const ChartComponents: React.FC<ChartComponentsProps> = ({ data, formatDate, type }) => {
  if (type === 'line') {
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data as PerformanceData[]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
            />
            <YAxis domain={[0, 100]} />
            <Tooltip 
              labelFormatter={formatDate}
              formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Điểm TB']}
            />
            <Line 
              type="monotone" 
              dataKey="avg_score" 
              stroke="#3B82F6" 
              strokeWidth={2}
              dot={{ fill: '#3B82F6' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'bar') {
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data as TopicPerformance[]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="topic" />
            <YAxis domain={[0, 100]} />
            <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Điểm TB']} />
            <Bar dataKey="avg_score" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return null;
};

export default ChartComponents;

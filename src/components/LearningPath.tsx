"use client";

import React, { useState } from 'react';
import { AIService } from '../services/ai-service';
import Assessment from './Assessment';

interface LearningPathProps {
  apiKey: string;
}

interface FormData {
  topic: string;
  level: string;
  goals: string;
}

export default function LearningPath({ apiKey }: LearningPathProps) {
  const [formData, setFormData] = useState<FormData>({
    topic: '',
    level: 'beginner',
    goals: ''
  });
  const [loading, setLoading] = useState(false);
  const [learningPath, setLearningPath] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const aiService = new AIService(apiKey);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const path = await aiService.createLearningPath({
        topic: formData.topic,
        level: formData.level,
        goals: formData.goals.split(',').map(goal => goal.trim())
      });
      setLearningPath(path);
    } catch (err) {
      setError('Failed to generate learning path. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Create Your Learning Path</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 mb-8">
        <div>
          <label className="block text-sm font-medium mb-2">Topic</label>
          <input
            type="text"
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Level</label>
          <select
            value={formData.level}
            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
            className="w-full p-2 border rounded-md"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Goals (comma-separated)</label>
          <textarea
            value={formData.goals}
            onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
            className="w-full p-2 border rounded-md"
            rows={3}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
        >
          {loading ? 'Generating...' : 'Generate Learning Path'}
        </button>
      </form>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {learningPath && (
        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Your Learning Path</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Difficulty Level</h3>
              <p className="text-gray-600">{learningPath.difficulty}</p>
            </div>

            <div>
              <h3 className="font-medium">Estimated Duration</h3>
              <p className="text-gray-600">{learningPath.duration}</p>
            </div>

            <div>
              <h3 className="font-medium">Topics</h3>
              <ul className="list-disc pl-5 text-gray-600">
                {learningPath.topics.map((topic: string, index: number) => (
                  <li key={index}>{topic}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-4">Assessments</h3>
              {learningPath.assessments.map((assessment: any, index: number) => {
                let assessmentType: 'quiz' | 'project' | 'final' = 'quiz';
                let assessmentTitle = assessment.title || 'Assessment';
                let description = assessment.description || '';
                let questions = assessment.questions;
                let projectRequirements = assessment.requirements;
              
                if (assessment.type === 'quiz') {
                  assessmentType = 'quiz';
                } else if (assessment.type === 'project') {
                  assessmentType = 'project';
                } else if (assessment.type === 'final') {
                  assessmentType = 'final';
                }
              
                return (
                  <div key={index} className="mb-6">
                    <Assessment
                      type={assessmentType}
                      title={assessmentTitle}
                      description={description}
                      questions={questions}
                      projectRequirements={projectRequirements}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
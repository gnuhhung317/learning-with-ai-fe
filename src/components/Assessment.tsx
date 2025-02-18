import React from 'react';

interface AssessmentProps {
  type: 'quiz' | 'project' | 'final';
  title: string;
  description: string;
  questions?: Array<{
    question: string;
    options?: string[];
    correctAnswer?: number;
    explanation?: string;
    type?: string;
    criteria?: string[];
  }>;
  projectRequirements?: string[];
}

export default function Assessment({ type, title, description, questions, projectRequirements }: AssessmentProps) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <h4 className="text-xl font-semibold mb-2">{title}</h4>
      <p className="text-gray-600 mb-4">{description}</p>

      {type === 'project' && projectRequirements && (
        <div className="mb-4">
          <h5 className="font-medium mb-2">Project Requirements:</h5>
          <ul className="list-disc pl-5 space-y-2">
            {projectRequirements.map((req, index) => (
              <li key={index} className="text-gray-700">{req}</li>
            ))}
          </ul>
        </div>
      )}

      {(type === 'quiz' || type === 'final') && questions && (
        <div className="space-y-6">
          {questions.map((q, index) => (
            <div key={index} className="border-t pt-4">
              <p className="font-medium mb-3">{q.question}</p>
              
              {q.options ? (
                <div className="space-y-2">
                  {q.options.map((option, optIndex) => (
                    <div key={optIndex} className="flex items-center">
                      <input
                        type="radio"
                        name={`question-${index}`}
                        id={`q${index}-opt${optIndex}`}
                        className="mr-2"
                      />
                      <label htmlFor={`q${index}-opt${optIndex}`} className="text-gray-700">
                        {option}
                      </label>
                    </div>
                  ))}
                </div>
              ) : q.criteria ? (
                <div className="space-y-2">
                  <h6 className="font-medium">Evaluation Criteria:</h6>
                  <ul className="list-disc pl-5">
                    {q.criteria.map((criterion, critIndex) => (
                      <li key={critIndex} className="text-gray-700">{criterion}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {q.explanation && (
                <div className="mt-3 text-sm text-gray-600">
                  <strong>Explanation:</strong> {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
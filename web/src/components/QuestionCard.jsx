import React from 'react';

const QuestionCard = ({ question, topic, questionNumber, totalQuestions }) => {
  return (
    <div className="card p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="chip">Question {questionNumber} of {totalQuestions}</span>
          {topic && <span className="chip bg-brand-500/20 border-brand-400/30 text-brand-100">{topic}</span>}
        </div>
      </div>
      <h2 className="text-xl md:text-2xl font-semibold text-white leading-relaxed">
        {question}
      </h2>
    </div>
  );
};

export default QuestionCard;

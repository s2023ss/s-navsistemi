
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { TestAttempt, UserAnswer, Question } from '../lib/types';
import Spinner from '../components/ui/Spinner';
import Card, { CardContent, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';

const ResultPage: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const [attempt, setAttempt] = useState<TestAttempt | null>(null);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      if (!attemptId) return;
      setLoading(true);

      const { data: attemptData, error: attemptError } = await supabase
        .from('test_attempts')
        .select('*, tests(name)')
        .eq('id', attemptId)
        .single();
      
      if (attemptError || !attemptData) {
        console.error('Error fetching attempt:', attemptError?.message);
        setLoading(false);
        return;
      }
      setAttempt(attemptData as TestAttempt);

      const { data: answersData, error: answersError } = await supabase
        .from('user_answers')
        .select('*')
        .eq('attempt_id', attemptId);

      if (answersError) console.error('Error fetching answers:', answersError.message);
      else setAnswers(answersData);
      
      const questionIds = answersData?.map(a => a.question_id) || [];
      if (questionIds.length > 0) {
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*, options(*)')
          .in('id', questionIds);

        if (questionsError) console.error('Error fetching questions:', questionsError.message);
        else setQuestions(questionsData as Question[]);
      }

      setLoading(false);
    };

    fetchResult();
  }, [attemptId]);

  if (loading) return <div className="flex justify-center py-10"><Spinner /></div>;
  if (!attempt) return <p>Test sonucu bulunamadı.</p>;

  const correctAnswersCount = answers.filter(a => a.is_correct).length;
  const incorrectAnswersCount = answers.length - correctAnswersCount;

  const getOptionText = (questionId: number, optionId: number) => {
    const question = questions.find(q => q.id === questionId);
    const option = question?.options.find(o => o.id === optionId);
    return option?.option_text || 'Bilinmeyen Seçenek';
  };
  
  const getCorrectOptionText = (questionId: number) => {
    const question = questions.find(q => q.id === questionId);
    const correctOption = question?.options.find(o => o.is_correct);
    return correctOption?.option_text || 'Doğru Cevap Bulunamadı';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <h1 className="text-3xl font-bold">Test Sonucu: {attempt.tests.name}</h1>
          <p className="text-gray-500 mt-1">{new Date(attempt.created_at).toLocaleString()}</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-8">
            <div className="bg-blue-100 dark:bg-blue-900/50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-blue-800 dark:text-blue-300">{attempt.score}/100</p>
              <p className="text-sm text-blue-600 dark:text-blue-400">Puan</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900/50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-green-800 dark:text-green-300">{correctAnswersCount}</p>
              <p className="text-sm text-green-600 dark:text-green-400">Doğru</p>
            </div>
            <div className="bg-red-100 dark:bg-red-900/50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-red-800 dark:text-red-300">{incorrectAnswersCount}</p>
              <p className="text-sm text-red-600 dark:text-red-400">Yanlış</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-4">Cevap Analizi</h2>
          <div className="space-y-6">
            {answers.map((answer, index) => {
              const question = questions.find(q => q.id === answer.question_id);
              if (!question) return null;
              
              const userAnswerText = getOptionText(question.id, answer.selected_option_id);
              const correctAnswerText = getCorrectOptionText(question.id);

              return (
                <div key={answer.id} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
                  <p className="font-semibold">{index + 1}. {question.question_text}</p>
                  <div className="mt-2 text-sm space-y-2">
                    <p className={`p-2 rounded ${answer.is_correct ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                      Senin Cevabın: <span className="font-medium">{userAnswerText}</span>
                    </p>
                    {!answer.is_correct && (
                      <p className="p-2 rounded bg-green-100 dark:bg-green-900/50">
                        Doğru Cevap: <span className="font-medium">{correctAnswerText}</span>
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-8 flex justify-center">
            <Link to="/">
              <Button>Ana Sayfaya Dön</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultPage;

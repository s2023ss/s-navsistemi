import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Question, Option } from '../lib/types';
import { useAuthStore } from '../store/useAuthStore';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import Card, { CardContent, CardHeader } from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';

const TEST_DURATION = 300; // 5 minutes in seconds

const TestPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { session, profile } = useAuthStore();
  const user = session?.user;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<{ question_id: number, selected_option_id: number, is_correct: boolean }[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION);
  const [testName, setTestName] = useState('');

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!testId) return;
      setLoading(true);

      // Fetch test and its questions using the new M-M relationship
      const { data, error } = await supabase
        .from('tests')
        .select('name, questions(*, options(*))')
        .eq('id', testId)
        .single();
      
      if (error || !data) {
        console.error('Error fetching test and questions:', error?.message);
        alert('Test yüklenirken bir hata oluştu.');
        navigate('/');
        return;
      }
      
      setTestName(data.name);

      if (data.questions.length === 0) {
        alert("Bu testte henüz soru bulunmuyor.");
        navigate('/');
      } else {
        // Shuffle questions for variety
        const shuffledQuestions = data.questions.sort(() => Math.random() - 0.5);
        setQuestions(shuffledQuestions as Question[]);
      }
      setLoading(false);
    };
    fetchQuestions();
  }, [testId, navigate]);
  
  const finishTest = useCallback(async (finalAnswers?: typeof userAnswers) => {
    if (submitting) return;
    setSubmitting(true);

    if (!user || !profile || !testId) {
        alert("Kullanıcı profili bulunamadı veya test bilgileri eksik. Lütfen tekrar giriş yapın.");
        setSubmitting(false);
        navigate('/');
        return;
    }

    const answersToSubmit = finalAnswers || userAnswers;
    const correctAnswers = answersToSubmit.filter(a => a.is_correct).length;
    const totalQuestions = questions.length > 0 ? questions.length : answersToSubmit.length;
    const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    const { data: attemptData, error: attemptError } = await supabase
      .from('test_attempts')
      .insert({
        user_id: user.id,
        test_id: parseInt(testId, 10),
        score,
      })
      .select('id')
      .single();

    if (attemptError || !attemptData) {
      console.error('Error saving test attempt:', attemptError);
      alert(`Test sonucu kaydedilirken bir hata oluştu: ${attemptError?.message}`);
      setSubmitting(false);
      return;
    }

    const attemptId = attemptData.id;
    const answersToInsert = answersToSubmit.map(answer => ({
      ...answer,
      attempt_id: attemptId,
    }));

    if (answersToInsert.length > 0) {
        const { error: answersError } = await supabase
          .from('user_answers')
          .insert(answersToInsert);

        if (answersError) {
          console.error('Error saving user answers:', answersError);
          alert(`Cevaplar kaydedilirken bir hata oluştu: ${answersError.message}`);
        }
    }
    
    navigate(`/result/${attemptId}`);
    setSubmitting(false);
  }, [userAnswers, questions, testId, user, profile, navigate, submitting]);


  useEffect(() => {
    if (loading || submitting) return;
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          finishTest();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, submitting, finishTest]);

  const handleNextQuestion = () => {
    if (selectedOptionId === null) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    const selectedOption = currentQuestion.options.find(opt => opt.id === selectedOptionId);
    
    const newAnswers = [...userAnswers, {
      question_id: currentQuestion.id,
      selected_option_id: selectedOptionId,
      is_correct: selectedOption?.is_correct || false
    }];
    setUserAnswers(newAnswers);
    setSelectedOptionId(null);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishTest(newAnswers);
    }
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner /></div>;
  if (questions.length === 0) return <p>Sorular yükleniyor...</p>;

  const currentQuestion = questions[currentQuestionIndex];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">{testName}</h1>
            <div className="text-lg font-semibold bg-red-100 dark:bg-red-800/50 text-red-700 dark:text-red-300 px-3 py-1 rounded-md">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
          </div>
          <div className="mt-4">
            <ProgressBar value={currentQuestionIndex + 1} max={questions.length} />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
              Soru {currentQuestionIndex + 1} / {questions.length}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold mb-6">{currentQuestion.question_text}</p>
          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <label
                key={option.id}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedOptionId === option.id
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/50 ring-2 ring-indigo-500'
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <input
                  type="radio"
                  name="option"
                  value={option.id}
                  checked={selectedOptionId === option.id}
                  onChange={() => setSelectedOptionId(option.id)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <span className="ml-3 text-gray-800 dark:text-gray-200">{option.option_text}</span>
              </label>
            ))}
          </div>
        </CardContent>
        <div className="p-6 border-t border-gray-200 dark:border-gray-700">
           <Button
              onClick={handleNextQuestion}
              disabled={selectedOptionId === null || submitting}
              className="w-full"
            >
              {submitting 
                ? 'Bitiriliyor...' 
                : currentQuestionIndex < questions.length - 1 
                ? 'Sonraki Soru' 
                : 'Testi Bitir'}
            </Button>
        </div>
      </Card>
    </div>
  );
};

export default TestPage;

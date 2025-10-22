import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../lib/supabaseClient';
import { TestAttempt } from '../lib/types';
import Spinner from '../components/ui/Spinner';
import Card, { CardContent, CardHeader } from '../components/ui/Card';

const ProfilePage: React.FC = () => {
  const { profile } = useAuthStore();
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttempts = async () => {
      if (!profile) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('test_attempts')
        .select('*, tests(name)')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching attempts:', error.message);
        alert(`Geçmiş testler yüklenirken bir hata oluştu: ${error.message}`);
      } else {
        setAttempts(data as unknown as TestAttempt[]);
      }
      setLoading(false);
    };

    fetchAttempts();
  }, [profile]);

  const chartData = useMemo(() => {
    if (attempts.length === 0) return [];

    const performanceByTest: { [key: string]: number[] } = {};

    // Group scores by test name
    attempts.forEach(attempt => {
        const testName = attempt.tests.name;
        if (!performanceByTest[testName]) {
            performanceByTest[testName] = [];
        }
        performanceByTest[testName].push(attempt.score);
    });

    // Calculate average score for each test
    const data = Object.keys(performanceByTest).map(testName => {
        const scores = performanceByTest[testName];
        const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        return {
            name: testName,
            score: Math.round(averageScore),
        };
    });

    return data;
  }, [attempts]);


  if (loading) return <div className="flex justify-center py-10"><Spinner /></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Profilim</h1>
      
      <Card className="mb-8">
        <CardContent>
          <p><strong>Ad Soyad:</strong> {profile?.full_name}</p>
          <p><strong>Rol:</strong> {profile?.role === 'admin' ? 'Yönetici' : 'Öğrenci'}</p>
        </CardContent>
      </Card>

      {chartData.length > 0 && (
        <Card className="mb-8">
            <CardHeader>
                <h2 className="text-2xl font-bold">Performans Grafiği</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Testlere göre ortalama başarı puanları</p>
            </CardHeader>
            <CardContent>
                <div className="h-64 relative pt-4 pr-4">
                    <div className="h-full w-full absolute top-0 left-0 grid grid-rows-4">
                        <div className="row-span-1 border-t border-gray-200 dark:border-gray-700 relative"><span className="absolute -left-7 top-0 -translate-y-1/2 text-xs text-gray-400">100</span></div>
                        <div className="row-span-1 border-t border-gray-200 dark:border-gray-700 relative"><span className="absolute -left-7 top-0 -translate-y-1/2 text-xs text-gray-400">75</span></div>
                        <div className="row-span-1 border-t border-gray-200 dark:border-gray-700 relative"><span className="absolute -left-7 top-0 -translate-y-1/2 text-xs text-gray-400">50</span></div>
                        <div className="row-span-1 border-t border-gray-200 dark:border-gray-700 relative"><span className="absolute -left-7 top-0 -translate-y-1/2 text-xs text-gray-400">25</span></div>
                    </div>
                    <div className="h-full w-full flex justify-around items-end pl-8 relative">
                        <div className="absolute bottom-0 left-8 h-[1px] w-[calc(100%-2rem)] bg-gray-300 dark:bg-gray-600"></div>
                        <span className="absolute -left-7 bottom-0 -translate-y-1/2 text-xs text-gray-400">0</span>
                        
                        {chartData.map((data, index) => (
                            <div key={index} className="flex flex-col items-center h-full justify-end group w-full max-w-20 text-center px-1">
                                <div className="relative w-1/2 h-full flex items-end">
                                    <div 
                                        className="w-full bg-indigo-500 hover:bg-indigo-600 transition-all duration-300 rounded-t-md relative z-10"
                                        style={{ height: `${data.score}%` }}
                                        title={`${data.name}: ${data.score}`}
                                    >
                                        <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-bold absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 px-2 py-1 rounded">
                                            {data.score}
                                        </span>
                                    </div>
                                </div>
                                <p className="text-xs mt-2 truncate w-full">{data.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
      )}

      <h2 className="text-2xl font-bold mb-4">Geçmiş Testlerim</h2>
      <Card>
        {attempts.length === 0 ? (
          <CardContent>
            <p className="text-gray-500">Henüz çözülmüş bir testiniz bulunmuyor.</p>
          </CardContent>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">Test</th>
                  <th scope="col" className="px-6 py-3">Puan</th>
                  <th scope="col" className="px-6 py-3">Tarih</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((attempt) => (
                  <tr key={attempt.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      {attempt.tests.name}
                    </td>
                    <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${attempt.score >= 50 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                            {attempt.score}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                      {new Date(attempt.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProfilePage;
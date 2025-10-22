import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Class } from '../lib/types';
import Card, { CardContent } from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';

const HomePage: React.FC = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHierarchy = async () => {
      setLoading(true);
      try {
        const { data: classesData, error: classesError } = await supabase.from('classes').select('*').order('name', { ascending: true });
        if (classesError) throw classesError;

        const { data: coursesData, error: coursesError } = await supabase.from('courses').select('*');
        if (coursesError) throw coursesError;

        const { data: unitsData, error: unitsError } = await supabase.from('units').select('*');
        if (unitsError) throw unitsError;

        const { data: topicsData, error: topicsError } = await supabase.from('topics').select('*');
        if (topicsError) throw topicsError;

        const { data: testsData, error: testsError } = await supabase.from('tests').select('*');
        if (testsError) throw testsError;

        const topicsWithTests = topicsData.map(topic => ({
            ...topic,
            tests: testsData.filter(test => test.topic_id === topic.id)
        }));

        const unitsWithTopics = unitsData.map(unit => ({
            ...unit,
            topics: topicsWithTests.filter(topic => topic.unit_id === unit.id)
        }));

        const coursesWithUnits = coursesData.map(course => ({
            ...course,
            units: unitsWithTopics.filter(unit => unit.course_id === course.id)
        }));

        const classesWithCourses = classesData.map(cls => ({
            ...cls,
            courses: coursesWithUnits.filter(course => course.class_id === cls.id)
        }));

        setClasses(classesWithCourses as Class[]);

      } catch (error: any) {
        console.error('Error fetching hierarchy:', error.message);
        alert(`Testler yüklenirken bir hata oluştu: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchHierarchy();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Testler</h1>
      {classes.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-gray-500 text-center">Henüz çözülecek test bulunmuyor.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {classes.map((cls) => (
            <details key={cls.id} className="group bg-white dark:bg-gray-800 rounded-lg shadow-sm" open>
              <summary className="p-4 cursor-pointer font-bold text-2xl list-none flex justify-between items-center">
                {cls.name}
                <svg className="w-6 h-6 transform group-open:rotate-180 transition-transform" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
                 {cls.courses.length > 0 ? cls.courses.map((course) => (
                  <details key={course.id} className="group/course bg-gray-50 dark:bg-gray-700/50 rounded-md" open>
                    <summary className="p-3 cursor-pointer font-semibold text-xl list-none flex justify-between items-center">
                      {course.name}
                      <svg className="w-5 h-5 transform group-open/course:rotate-180 transition-transform" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="p-3 border-t border-gray-200 dark:border-gray-600 space-y-3">
                      {course.units.length > 0 ? course.units.map(unit => (
                        <details key={unit.id} className="group/unit bg-white dark:bg-gray-800 rounded-md shadow-sm" open>
                          <summary className="p-3 cursor-pointer font-medium text-lg list-none flex justify-between items-center">
                            {unit.name}
                            <svg className="w-4 h-4 transform group-open/unit:rotate-180 transition-transform" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </summary>
                          <div className="p-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                            {unit.topics.length > 0 ? unit.topics.map(topic => (
                              <details key={topic.id} className="group/topic" open>
                                <summary className="p-2 cursor-pointer font-medium list-none flex justify-between items-center">
                                  {topic.name}
                                  <svg className="w-3 h-3 transform group-open/topic:rotate-180 transition-transform" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </summary>
                                <div className="pl-4 pt-2 space-y-2">
                                  {topic.tests.length > 0 ? topic.tests.map(test => (
                                    <div key={test.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                      <div>
                                        <h3 className="font-semibold text-gray-800 dark:text-gray-200">{test.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{test.description || 'Açıklama yok'}</p>
                                      </div>
                                      <Link to={`/test/${test.id}`}>
                                        <Button size="sm">Teste Başla</Button>
                                      </Link>
                                    </div>
                                  )) : <p className="text-sm text-gray-400 italic pl-3">Bu konuda test bulunmuyor.</p>}
                                </div>
                              </details>
                            )) : <p className="text-sm text-gray-400 italic p-2">Bu ünitede konu bulunmuyor.</p>}
                          </div>
                        </details>
                      )) : <p className="text-sm text-gray-400 italic p-2">Bu derste ünite bulunmuyor.</p>}
                    </div>
                  </details>
                )) : <p className="text-sm text-gray-400 italic p-3">Bu sınıfta ders bulunmuyor.</p>}
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
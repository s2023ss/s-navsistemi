import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Class, Course, Unit, Topic, Test, Question, Option } from '../lib/types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import Card, { CardContent, CardHeader } from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import { useAuthStore } from '../store/useAuthStore';

type AdminTab = 'content' | 'bank' | 'questions' | 'import' | 'users';

const ManageContent: React.FC<{ hierarchy: Class[], fetchHierarchy: () => void }> = ({ hierarchy, fetchHierarchy }) => {
    const [newItemName, setNewItemName] = useState('');
    const [newItemDesc, setNewItemDesc] = useState('');
    const [loading, setLoading] = useState(false);
    
    // States for selections
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [selectedUnitId, setSelectedUnitId] = useState<string>('');
    const [selectedTopicId, setSelectedTopicId] = useState<string>('');

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ id: number; name: string; type: 'classes' | 'courses' | 'units' | 'topics' | 'tests' } | null>(null);

    const handleAddItem = async (type: 'classes' | 'courses' | 'units' | 'topics' | 'tests') => {
        if (!newItemName) return;
        setLoading(true);

        let item: any = { name: newItemName };
        if (type === 'topics' || type === 'tests') {
          item.description = newItemDesc || null;
        }

        if (type === 'courses') item.class_id = selectedClassId;
        if (type === 'units') item.course_id = selectedCourseId;
        if (type === 'topics') item.unit_id = selectedUnitId;
        if (type === 'tests') item.topic_id = selectedTopicId;

        const { error } = await supabase.from(type).insert(item);
        if (error) {
            console.error(`Error adding ${type}:`, error.message);
            alert(`Hata: ${error.message}`);
        } else {
            setNewItemName('');
            setNewItemDesc('');
            fetchHierarchy();
        }
        setLoading(false);
    };
    
    const handleDeleteItem = async () => {
        if (!itemToDelete) return;
        setLoading(true);
        const { error } = await supabase.from(itemToDelete.type).delete().eq('id', itemToDelete.id);
        if (error) {
            console.error(`Error deleting ${itemToDelete.type}:`, error.message);
            alert(`Silme işlemi başarısız: ${error.message}`);
        }
        else fetchHierarchy();
        setLoading(false);
        setShowModal(false);
        setItemToDelete(null);
    };

    const confirmDelete = (id: number, name: string, type: 'classes' | 'courses' | 'units' | 'topics' | 'tests') => {
        setItemToDelete({ id, name, type });
        setShowModal(true);
    };

    const courses = useMemo(() => hierarchy.find(c => c.id === parseInt(selectedClassId))?.courses || [], [hierarchy, selectedClassId]);
    const units = useMemo(() => courses.find(c => c.id === parseInt(selectedCourseId))?.units || [], [courses, selectedCourseId]);
    const topics = useMemo(() => units.find(u => u.id === parseInt(selectedUnitId))?.topics || [], [units, selectedUnitId]);
    const tests = useMemo(() => topics.find(t => t.id === parseInt(selectedTopicId))?.tests || [], [topics, selectedTopicId]);

    useEffect(() => { setSelectedCourseId(''); }, [selectedClassId]);
    useEffect(() => { setSelectedUnitId(''); }, [selectedCourseId]);
    useEffect(() => { setSelectedTopicId(''); }, [selectedUnitId]);
    
    const renderList = (items: any[], type: 'classes' | 'courses' | 'units' | 'topics' | 'tests') => (
        <ul className="space-y-2 max-h-48 overflow-y-auto">
            {items.map(item => (
                <li key={item.id} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded">
                    <span>{item.name}</span>
                    <Button variant="danger" size="sm" onClick={() => confirmDelete(item.id, item.name, type)}>Sil</Button>
                </li>
            ))}
        </ul>
    );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Classes */}
            <Card>
                <CardHeader><h3 className="text-lg font-bold">Sınıflar</h3></CardHeader>
                <CardContent className="space-y-4">
                    <Input value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="Yeni Sınıf Adı (örn: 9. Sınıf)" />
                    <Button onClick={() => handleAddItem('classes')} disabled={loading || !newItemName}>Ekle</Button>
                    {renderList(hierarchy, 'classes')}
                </CardContent>
            </Card>

            {/* Courses */}
            <Card>
                <CardHeader><h3 className="text-lg font-bold">Dersler</h3></CardHeader>
                <CardContent className="space-y-4">
                    <select onChange={e => setSelectedClassId(e.target.value)} value={selectedClassId} className="w-full p-2 rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
                        <option value="">Önce Sınıf Seçin</option>
                        {hierarchy.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    {selectedClassId && <>
                        <Input value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="Yeni Ders Adı" />
                        <Button onClick={() => handleAddItem('courses')} disabled={loading || !newItemName}>Ekle</Button>
                        {renderList(courses, 'courses')}
                    </>}
                </CardContent>
            </Card>

            {/* Units */}
            <Card>
                <CardHeader><h3 className="text-lg font-bold">Üniteler</h3></CardHeader>
                <CardContent className="space-y-4">
                    <select onChange={e => setSelectedClassId(e.target.value)} value={selectedClassId} className="w-full p-2 rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
                        <option value="">Önce Sınıf Seçin</option>
                        {hierarchy.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    {selectedClassId && <select onChange={e => setSelectedCourseId(e.target.value)} value={selectedCourseId} className="w-full p-2 rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
                        <option value="">Sonra Ders Seçin</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>}
                    {selectedCourseId && <>
                        <Input value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="Yeni Ünite Adı" />
                        <Button onClick={() => handleAddItem('units')} disabled={loading || !newItemName}>Ekle</Button>
                        {renderList(units, 'units')}
                    </>}
                </CardContent>
            </Card>

            {/* Topics */}
            <Card>
                <CardHeader><h3 className="text-lg font-bold">Konular</h3></CardHeader>
                <CardContent className="space-y-4">
                    <select onChange={e => setSelectedClassId(e.target.value)} value={selectedClassId} className="w-full p-2 rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
                        <option value="">Önce Sınıf Seçin</option>
                        {hierarchy.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                     {selectedClassId && <select onChange={e => setSelectedCourseId(e.target.value)} value={selectedCourseId} className="w-full p-2 rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
                        <option value="">Sonra Ders Seçin</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>}
                    {selectedCourseId && <select onChange={e => setSelectedUnitId(e.target.value)} value={selectedUnitId} className="w-full p-2 rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
                        <option value="">Sonra Ünite Seçin</option>
                        {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>}
                    {selectedUnitId && <>
                        <Input value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="Yeni Konu Adı" />
                        <Input value={newItemDesc} onChange={e => setNewItemDesc(e.target.value)} placeholder="Açıklama (Opsiyonel)" />
                        <Button onClick={() => handleAddItem('topics')} disabled={loading || !newItemName}>Ekle</Button>
                        {renderList(topics, 'topics')}
                    </>}
                </CardContent>
            </Card>
            
            {/* Tests */}
            <Card>
                <CardHeader><h3 className="text-lg font-bold">Testler</h3></CardHeader>
                <CardContent className="space-y-4">
                     <select onChange={e => setSelectedClassId(e.target.value)} value={selectedClassId} className="w-full p-2 rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
                        <option value="">Önce Sınıf Seçin</option>
                        {hierarchy.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    {selectedClassId && <select onChange={e => setSelectedCourseId(e.target.value)} value={selectedCourseId} className="w-full p-2 rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
                        <option value="">Sonra Ders Seçin</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>}
                     {selectedCourseId && <select onChange={e => setSelectedUnitId(e.target.value)} value={selectedUnitId} className="w-full p-2 rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
                        <option value="">Sonra Ünite Seçin</option>
                        {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>}
                     {selectedUnitId && <select onChange={e => setSelectedTopicId(e.target.value)} value={selectedTopicId} className="w-full p-2 rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
                        <option value="">Sonra Konu Seçin</option>
                        {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>}
                    {selectedTopicId && <>
                        <Input value={newItemName} onChange={e => setNewItemName(e.target.value)} placeholder="Yeni Test Adı" />
                        <Input value={newItemDesc} onChange={e => setNewItemDesc(e.target.value)} placeholder="Açıklama (Opsiyonel)" />
                        <Button onClick={() => handleAddItem('tests')} disabled={loading || !newItemName}>Ekle</Button>
                        {renderList(tests, 'tests')}
                    </>}
                </CardContent>
            </Card>

            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Silme Onayı">
                <p>'{itemToDelete?.name}' öğesini silmek istediğinizden emin misiniz? Bu öğeye ait tüm alt öğeler de (dersler, üniteler, konular, testler, sorular vb.) silinecektir.</p>
                <div className="mt-4 flex justify-end space-x-2">
                    <Button variant="secondary" onClick={() => setShowModal(false)}>İptal</Button>
                    <Button variant="danger" onClick={handleDeleteItem} disabled={loading}>{loading ? 'Siliniyor...' : 'Sil'}</Button>
                </div>
            </Modal>
        </div>
    );
};

// Cascading Selects component for reuse
const HierarchySelectors: React.FC<{
    hierarchy: Class[];
    onTestSelect: (testId: string) => void;
}> = ({ hierarchy, onTestSelect }) => {
    const [classId, setClassId] = useState('');
    const [courseId, setCourseId] = useState('');
    const [unitId, setUnitId] = useState('');
    const [topicId, setTopicId] = useState('');
    const [testId, setTestId] = useState('');

    const courses = useMemo(() => hierarchy.find(c => c.id === parseInt(classId))?.courses || [], [hierarchy, classId]);
    const units = useMemo(() => courses.find(c => c.id === parseInt(courseId))?.units || [], [courses, courseId]);
    const topics = useMemo(() => units.find(u => u.id === parseInt(unitId))?.topics || [], [units, unitId]);
    const tests = useMemo(() => topics.find(t => t.id === parseInt(topicId))?.tests || [], [topics, topicId]);

    useEffect(() => { setCourseId(''); setUnitId(''); setTopicId(''); setTestId(''); }, [classId]);
    useEffect(() => { setUnitId(''); setTopicId(''); setTestId(''); }, [courseId]);
    useEffect(() => { setTopicId(''); setTestId(''); }, [unitId]);
    useEffect(() => { setTestId(''); }, [topicId]);
    useEffect(() => { onTestSelect(testId); }, [testId, onTestSelect]);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
            <select value={classId} onChange={e => setClassId(e.target.value)} className="w-full p-2 rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
                <option value="">1. Sınıf Seçin</option>
                {hierarchy.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={courseId} onChange={e => setCourseId(e.target.value)} disabled={!classId} className="w-full p-2 rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
                <option value="">2. Ders Seçin</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={unitId} onChange={e => setUnitId(e.target.value)} disabled={!courseId} className="w-full p-2 rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
                <option value="">3. Ünite Seçin</option>
                {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
            <select value={topicId} onChange={e => setTopicId(e.target.value)} disabled={!unitId} className="w-full p-2 rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
                <option value="">4. Konu Seçin</option>
                {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <select value={testId} onChange={e => setTestId(e.target.value)} disabled={!topicId} className="w-full p-2 rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600">
                <option value="">5. Test Seçin</option>
                {tests.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
        </div>
    );
};

const initialOption = { text: '', is_correct: false };
const initialQuestionState = {
  id: null as number | null,
  question_text: '',
  options: [{ text: '', is_correct: true }, { text: '', is_correct: false }],
};

const QuestionFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  questionToEdit: typeof initialQuestionState | null;
}> = ({ isOpen, onClose, onSave, questionToEdit }) => {
    const [question, setQuestion] = useState(initialQuestionState);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if(isOpen) {
            setQuestion(questionToEdit || initialQuestionState);
        }
    }, [isOpen, questionToEdit]);

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuestion({ ...question, question_text: e.target.value });
    };

    const handleOptionChange = (index: number, text: string) => {
        const newOptions = question.options.map((opt, i) => (i === index ? { ...opt, text } : opt));
        setQuestion({ ...question, options: newOptions });
    };

    const handleCorrectOptionChange = (index: number) => {
        const newOptions = question.options.map((opt, i) => ({ ...opt, is_correct: i === index }));
        setQuestion({ ...question, options: newOptions });
    };

    const handleAddOption = () => {
        setQuestion({ ...question, options: [...question.options, initialOption] });
    };

    const handleRemoveOption = (index: number) => {
        const newOptions = question.options.filter((_, i) => i !== index);
        // Ensure at least one option is correct
        if (!newOptions.some(opt => opt.is_correct) && newOptions.length > 0) {
            newOptions[0].is_correct = true;
        }
        setQuestion({ ...question, options: newOptions });
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!question.question_text || question.options.some(o => !o.text) || !question.options.some(o => o.is_correct)) {
        alert("Lütfen soru metnini, tüm seçenekleri doldurun ve bir doğru cevap işaretleyin.");
        return;
      }
      setLoading(true);
      
      const options_payload = question.options.map(o => ({ option_text: o.text, is_correct: o.is_correct }));
      
      let error;
      if (question.id) { // Update
        const { error: updateError } = await supabase.rpc('update_question_in_bank', { 
            p_question_id: question.id, 
            p_question_text: question.question_text, 
            p_options: options_payload
        });
        error = updateError;
      } else { // Create
         const { error: createError } = await supabase.rpc('create_question_in_bank', {
            p_question_text: question.question_text,
            p_options: options_payload
        });
        error = createError;
      }

      if (error) {
        alert(`Soru kaydedilirken hata oluştu: ${error.message}`);
      } else {
        onSave();
        onClose();
      }
      setLoading(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={question.id ? "Soruyu Düzenle" : "Yeni Soru Ekle"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input value={question.question_text} onChange={handleTextChange} placeholder="Soru Metni" required />
                <p className="text-sm text-gray-500">Doğru seçeneği işaretleyin:</p>
                {question.options.map((opt, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <input type="radio" name="correct_option" checked={opt.is_correct} onChange={() => handleCorrectOptionChange(index)} className="form-radio h-4 w-4 text-indigo-600"/>
                        <Input value={opt.text} onChange={e => handleOptionChange(index, e.target.value)} placeholder={`Seçenek ${index + 1}`} required />
                        {question.options.length > 2 && <Button type="button" variant="danger" size="sm" onClick={() => handleRemoveOption(index)}>X</Button>}
                    </div>
                ))}
                <div className="flex justify-between">
                    <Button type="button" variant="secondary" onClick={handleAddOption}>Seçenek Ekle</Button>
                    <div className="flex space-x-2">
                        <Button type="button" variant="ghost" onClick={onClose}>İptal</Button>
                        <Button type="submit" disabled={loading}>{loading ? 'Kaydediliyor...' : 'Kaydet'}</Button>
                    </div>
                </div>
            </form>
        </Modal>
    );
}


const ManageQuestionBank: React.FC = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal state
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [questionToEdit, setQuestionToEdit] = useState<typeof initialQuestionState | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null);
    
    const fetchQuestions = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.from('questions').select('*, options(*)').order('created_at', { ascending: false });
        if (error) alert(`Sorular yüklenirken hata: ${error.message}`);
        else setQuestions(data as Question[]);
        setLoading(false);
    }, []);
    
    useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

    const handleDelete = async () => {
        if (!questionToDelete) return;
        const { error } = await supabase.from('questions').delete().eq('id', questionToDelete.id);
        if (error) alert(`Soru silinirken hata: ${error.message}`);
        else fetchQuestions();
        setIsDeleteModalOpen(false);
    };

    const filteredQuestions = useMemo(() => {
        return questions.filter(q => q.question_text.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [questions, searchTerm]);

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold">Soru Bankası</h3>
                    <Button onClick={() => { setQuestionToEdit(null); setIsFormModalOpen(true); }}>Yeni Soru Ekle</Button>
                </div>
                <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Sorularda ara..." className="mt-4" />
            </CardHeader>
            <CardContent>
                {loading ? <Spinner /> : (
                    <ul className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                         {filteredQuestions.length === 0 && <p className="text-gray-500 text-center">Soru bulunamadı.</p>}
                         {filteredQuestions.map(q => (
                            <li key={q.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="flex justify-between items-start">
                                    <p className="font-semibold flex-1 pr-4">{q.question_text}</p>
                                    <div className="flex space-x-2 flex-shrink-0">
{/* FIX: Map `q.options` from `Option[]` (with `option_text`) to `{ text: string, is_correct: boolean }[]` to match the state type in the modal. */}
                                        <Button size="sm" variant="secondary" onClick={() => { setQuestionToEdit({id: q.id, question_text: q.question_text, options: q.options.map(o => ({ text: o.option_text, is_correct: o.is_correct }))}); setIsFormModalOpen(true);}}>Düzenle</Button>
                                        <Button size="sm" variant="danger" onClick={() => { setQuestionToDelete(q); setIsDeleteModalOpen(true);}}>Sil</Button>
                                    </div>
                                </div>
                                <ul className="text-sm list-disc pl-5 mt-2 space-y-1">
                                    {q.options.sort((a,b) => a.id - b.id).map(o => <li key={o.id} className={o.is_correct ? 'text-green-600 dark:text-green-400 font-bold' : ''}>{o.option_text}</li>)}
                                </ul>
                            </li>
                         ))}
                    </ul>
                )}
            </CardContent>

            <QuestionFormModal 
                isOpen={isFormModalOpen}
                onClose={() => setIsFormModalOpen(false)}
                onSave={fetchQuestions}
                questionToEdit={questionToEdit}
            />
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Soruyu Sil">
              <p>"{questionToDelete?.question_text}" sorusunu Soru Bankası'ndan kalıcı olarak silmek istediğinizden emin misiniz? Bu soru tüm testlerden de kaldırılacaktır.</p>
              <div className="mt-6 flex justify-end space-x-2">
                <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>İptal</Button>
                <Button variant="danger" onClick={handleDelete}>Sil</Button>
              </div>
            </Modal>
        </Card>
    );
};


const QuestionBankPickerModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    testId: number;
    onAddQuestions: (questionIds: number[]) => Promise<void>;
    existingQuestionIds: number[];
}> = ({ isOpen, onClose, testId, onAddQuestions, existingQuestionIds }) => {
    // FIX: Changed state type to match the partial `Question` object fetched from Supabase, which only has `id` and `question_text`.
    const [bankQuestions, setBankQuestions] = useState<{ id: number; question_text: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        if(isOpen) {
            const fetchBankQuestions = async () => {
                setLoading(true);
                const { data, error } = await supabase.from('questions').select('id, question_text').order('created_at', { ascending: false });
                if(error) alert(error.message);
                else setBankQuestions(data || []);
                setLoading(false);
            };
            fetchBankQuestions();
            setSelectedIds(new Set()); // Reset selection on open
        }
    }, [isOpen]);

    const handleSelect = (id: number) => {
        const newSelection = new Set(selectedIds);
        if(newSelection.has(id)) newSelection.delete(id);
        else newSelection.add(id);
        setSelectedIds(newSelection);
    };

    const handleSave = async () => {
      await onAddQuestions(Array.from(selectedIds));
    }

    const filteredQuestions = useMemo(() => {
        return bankQuestions.filter(q => q.question_text.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [bankQuestions, searchTerm]);
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Soru Bankasından Ekle">
            <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Sorularda ara..." className="mb-4" />
            {loading ? <Spinner /> : (
            <div className="space-y-2 max-h-96 overflow-y-auto border-y border-gray-200 dark:border-gray-700 py-2">
                {filteredQuestions.map(q => {
                    const isDisabled = existingQuestionIds.includes(q.id);
                    return (
                        <label key={q.id} className={`flex items-center p-2 rounded cursor-pointer ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                            <input type="checkbox" checked={selectedIds.has(q.id)} onChange={() => !isDisabled && handleSelect(q.id)} disabled={isDisabled} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                            <span className="ml-3 text-sm">{q.question_text} {isDisabled && <span className="text-xs text-gray-400">(Zaten Testte)</span>}</span>
                        </label>
                    );
                })}
            </div>
            )}
            <div className="mt-4 flex justify-end space-x-2">
                <Button variant="secondary" onClick={onClose}>İptal</Button>
                <Button onClick={handleSave} disabled={selectedIds.size === 0}>Seçilenleri Ekle</Button>
            </div>
        </Modal>
    );
}

const ManageTestQuestions: React.FC<{hierarchy: Class[]}> = ({ hierarchy }) => {
    const [selectedTestId, setSelectedTestId] = useState<string>('');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    
    const fetchQuestions = useCallback(async () => {
        if(!selectedTestId) {
            setQuestions([]);
            return;
        };
        setLoadingQuestions(true);
        const { data, error } = await supabase.from('tests').select('questions(*, options(*))').eq('id', selectedTestId).single();

        if(error) {
            console.error("Error fetching questions:", error.message);
            setQuestions([]);
        } else {
            setQuestions(data.questions as Question[]);
        }
        setLoadingQuestions(false);
    }, [selectedTestId]);
    
    useEffect(() => { fetchQuestions(); }, [fetchQuestions]);

    const handleRemoveQuestionFromTest = async (questionId: number) => {
        if(!selectedTestId) return;
        const { error } = await supabase.from('test_questions').delete().match({ test_id: selectedTestId, question_id: questionId });
        if(error) alert(`Soru testten kaldırılırken hata oluştu: ${error.message}`);
        else fetchQuestions();
    }
    
    const handleAddQuestions = async (questionIds: number[]) => {
        if(!selectedTestId || questionIds.length === 0) return;
        const links = questionIds.map(qid => ({ test_id: selectedTestId, question_id: qid }));
        const { error } = await supabase.from('test_questions').insert(links);
        if(error) alert(`Sorular teste eklenirken hata oluştu: ${error.message}`);
        else {
            fetchQuestions();
            setIsPickerOpen(false);
        }
    }
    
    return (
        <div>
            <HierarchySelectors hierarchy={hierarchy} onTestSelect={setSelectedTestId} />
            {selectedTestId && (
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                         <h3 className="text-lg font-bold">Teste Atanmış Sorular</h3>
                         <Button onClick={() => setIsPickerOpen(true)}>Bankadan Soru Ekle</Button>
                    </div>
                </CardHeader>
                <CardContent>
                {loadingQuestions ? <Spinner /> : (
                    <ul className="space-y-2">
                        {questions.length === 0 && <p className="text-gray-500">Bu teste henüz soru atanmamış.</p>}
                        {questions.map(q => (
                            <li key={q.id} className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
                                <div className="flex justify-between items-start">
                                    <p className="font-semibold flex-1 pr-4">{q.question_text}</p>
                                    <Button variant="danger" size="sm" onClick={() => handleRemoveQuestionFromTest(q.id)}>Testten Kaldır</Button>
                                </div>
                                <ul className="text-sm list-disc pl-5 mt-2">
                                    {q.options.sort((a,b) => a.id - b.id).map(o => <li key={o.id} className={o.is_correct ? 'text-green-600 dark:text-green-400 font-bold' : ''}>{o.option_text}</li>)}
                                </ul>
                            </li>
                        ))}
                    </ul>
                )}
                </CardContent>
                 <QuestionBankPickerModal
                    isOpen={isPickerOpen}
                    onClose={() => setIsPickerOpen(false)}
                    testId={parseInt(selectedTestId)}
                    onAddQuestions={handleAddQuestions}
                    existingQuestionIds={questions.map(q => q.id)}
                 />
            </Card>
            )}
        </div>
    );
};

const CSVImport: React.FC<{hierarchy: Class[]}> = ({ hierarchy }) => {
    const [selectedTestId, setSelectedTestId] = useState<string>('');
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{success: number, failed: number} | null>(null);

    const handleImport = async () => {
        if(!file || !selectedTestId) {
            alert("Lütfen bir test seçin ve bir CSV dosyası yükleyin.");
            return;
        }
        setLoading(true);
        setResult(null);
        
        const text = await file.text();
        const lines = text.split('\n').filter(line => line.trim() !== '');
        
        let failedCount = 0;
        const questionsToInsert = [];

        for(const line of lines) {
            const parts = line.split(',').map(p => p.trim());
            if (parts.length < 3) { failedCount++; continue; }
            const question_text = parts[0];
            const correct_index = parseInt(parts[parts.length - 1], 10) - 1;
            const option_texts = parts.slice(1, -1);
            if (isNaN(correct_index) || correct_index < 0 || correct_index >= option_texts.length) { failedCount++; continue; }
            const options = option_texts.map((opt, index) => ({ option_text: opt, is_correct: index === correct_index }));
            questionsToInsert.push({ question_text, options });
        }
        
        if (questionsToInsert.length > 0) {
            const { error } = await supabase.rpc('create_bulk_questions_with_options', { p_test_id: parseInt(selectedTestId), p_questions: questionsToInsert });
            if (error) {
                alert(`Toplu ekleme sırasında bir hata oluştu: ${error.message}`);
                setResult({success: 0, failed: lines.length});
            } else {
                setResult({success: questionsToInsert.length, failed: failedCount});
            }
        } else {
             setResult({success: 0, failed: lines.length});
        }
        setLoading(false);
    };
    
    return (
        <Card>
            <CardHeader><h3 className="text-lg font-bold">CSV ile Toplu Soru Ekle</h3></CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-gray-500">CSV Formatı: <code>soru metni,seçenek1,seçenek2,...,doğru_seçenek_indeksi</code> (indeks 1'den başlar)</p>
                <HierarchySelectors hierarchy={hierarchy} onTestSelect={setSelectedTestId} />
                <Input type="file" accept=".csv" onChange={e => setFile(e.target.files ? e.target.files[0] : null)} disabled={!selectedTestId}/>
                <Button onClick={handleImport} disabled={loading || !file || !selectedTestId}>{loading ? 'İçe Aktarılıyor...' : 'İçe Aktar'}</Button>
                {result && (
                    <div className="mt-4 p-2 rounded bg-gray-100 dark:bg-gray-700">
                        <p className="text-green-600">Başarılı: {result.success}</p>
                        <p className="text-red-600">Başarısız: {result.failed}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const ManageUsers: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState<any | null>(null);
    const [updating, setUpdating] = useState<string | null>(null);
    const { profile } = useAuthStore();

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase.rpc('get_all_users');
        if (error) {
            console.error('Error fetching users:', error.message);
            alert(`Kullanıcılar getirilirken bir hata oluştu: ${error.message}`);
        } else {
            setUsers(data || []);
        }
        setLoading(false);
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleRoleChange = async (userId: string, newRole: string) => {
        setUpdating(userId);
        const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
        if (error) alert(`Rol güncellenirken bir hata oluştu: ${error.message}`);
        else setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        setUpdating(null);
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        setUpdating(userToDelete.id);
        const { error } = await supabase.rpc('delete_user_by_admin', { user_id_to_delete: userToDelete.id });
        if (error) alert(`Kullanıcı silinirken bir hata oluştu: ${error.message}`);
        else fetchUsers();
        setUpdating(null);
        setShowDeleteModal(false);
        setUserToDelete(null);
    };
    
    if (loading) return <Spinner />;

    return (
        <Card>
            <CardHeader><h3 className="text-lg font-bold">Kullanıcı Yönetimi</h3></CardHeader>
            <CardContent>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Ad Soyad</th>
                                <th scope="col" className="px-6 py-3">E-posta</th>
                                <th scope="col" className="px-6 py-3">Rol</th>
                                <th scope="col" className="px-6 py-3">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{user.full_name || '-'}</td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                            disabled={user.id === profile?.id || updating === user.id}
                                            className="p-1 rounded bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                                        >
                                            <option value="user">Öğrenci</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Button variant="danger" size="sm" onClick={() => { setUserToDelete(user); setShowDeleteModal(true); }} disabled={user.id === profile?.id || updating === user.id}>
                                            {updating === user.id ? <Spinner /> : 'Sil'}
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
            <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Kullanıcıyı Sil">
              <p>'{userToDelete?.full_name}' ({userToDelete?.email}) kullanıcısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</p>
              <div className="mt-4 flex justify-end space-x-2">
                  <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>İptal</Button>
                  <Button variant="danger" onClick={handleDeleteUser}>Sil</Button>
              </div>
            </Modal>
        </Card>
    );
};

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('content');
  const [hierarchy, setHierarchy] = useState<Class[]>([]);
  const [loadingHierarchy, setLoadingHierarchy] = useState(true);

  const fetchHierarchy = useCallback(async () => {
    setLoadingHierarchy(true);
    try {
      const { data: classesData, error: classesError } = await supabase.from('classes').select('*').order('name');
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
      
      setHierarchy(classesWithCourses as Class[]);
    } catch (error: any) {
        console.error('Error fetching hierarchy for admin:', error.message);
        alert(`Yönetici hiyerarşisi yüklenemedi: ${error.message}`);
    } finally {
        setLoadingHierarchy(false);
    }
  }, []);

  useEffect(() => {
    fetchHierarchy();
  }, [fetchHierarchy]);

  const renderTabContent = () => {
    if (loadingHierarchy) return <Spinner />;
    switch (activeTab) {
      case 'content':
        return <ManageContent hierarchy={hierarchy} fetchHierarchy={fetchHierarchy} />;
       case 'bank':
        return <ManageQuestionBank />;
      case 'questions':
        return <ManageTestQuestions hierarchy={hierarchy} />;
      case 'import':
        return <CSVImport hierarchy={hierarchy} />;
      case 'users':
        return <ManageUsers />;
      default:
        return null;
    }
  };
  
  const TabButton: React.FC<{tabName: AdminTab, label: string}> = ({tabName, label}) => (
    <button 
        onClick={() => setActiveTab(tabName)}
        className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${activeTab === tabName ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 border-t border-x' : 'bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
    >
        {label}
    </button>
  );

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Yönetici Paneli</h1>
      <div className="border-b border-gray-200 dark:border-gray-700 mb-[-1px] flex flex-wrap">
        <TabButton tabName="content" label="İçerik Yönetimi" />
        <TabButton tabName="bank" label="Soru Bankası" />
        <TabButton tabName="questions" label="Test Soru Atama" />
        <TabButton tabName="import" label="Toplu İçe Aktar" />
        <TabButton tabName="users" label="Kullanıcıları Yönet" />
      </div>
      <div className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-b-lg border border-gray-200 dark:border-gray-700">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdminPage;
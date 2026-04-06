/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  FileText, 
  Plus, 
  Search, 
  GraduationCap,
  TrendingUp,
  Award,
  Trash2,
  Save,
  Download,
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { cn } from './lib/utils';
import { 
  Student, 
  Subject, 
  Result, 
  SUBJECTS, 
  calculateGrade, 
  calculatePoints,
  StudentPerformance 
} from './types';

// Mock Initial Data
const INITIAL_STUDENTS: Student[] = [
  { id: '1', name: 'Juma Hamisi', regNumber: 'S0101/0001/2024', form: 'Form 1', stream: 'A' },
  { id: '2', name: 'Asha Bakari', regNumber: 'S0101/0002/2024', form: 'Form 1', stream: 'A' },
  { id: '3', name: 'David Malosha', regNumber: 'S0101/0003/2024', form: 'Form 1', stream: 'B' },
  { id: '4', name: 'Neema John', regNumber: 'S0101/0004/2024', form: 'Form 1', stream: 'B' },
];

const INITIAL_RESULTS: Result[] = [
  { studentId: '1', subjectId: '1', score: 85, term: 'Term 1', year: 2024 },
  { studentId: '1', subjectId: '2', score: 72, term: 'Term 1', year: 2024 },
  { studentId: '1', subjectId: '3', score: 90, term: 'Term 1', year: 2024 },
  { studentId: '2', subjectId: '1', score: 45, term: 'Term 1', year: 2024 },
  { studentId: '2', subjectId: '2', score: 55, term: 'Term 1', year: 2024 },
  { studentId: '2', subjectId: '3', score: 60, term: 'Term 1', year: 2024 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'results' | 'reports'>('dashboard');
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [results, setResults] = useState<Result[]>(INITIAL_RESULTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [newStudent, setNewStudent] = useState<Partial<Student>>({ form: 'Form 1', stream: 'A' });

  // Persistence
  useEffect(() => {
    const savedStudents = localStorage.getItem('school_students');
    const savedResults = localStorage.getItem('school_results');
    if (savedStudents) setStudents(JSON.parse(savedStudents));
    if (savedResults) setResults(JSON.parse(savedResults));
  }, []);

  useEffect(() => {
    localStorage.setItem('school_students', JSON.stringify(students));
    localStorage.setItem('school_results', JSON.stringify(results));
  }, [students, results]);

  // Calculations
  const performanceData = useMemo(() => {
    return students.map(student => {
      const studentResults = results.filter(r => r.studentId === student.id);
      const detailedResults = studentResults.map(r => ({
        subjectName: SUBJECTS.find(s => s.id === r.subjectId)?.name || 'Unknown',
        score: r.score,
        grade: calculateGrade(r.score)
      }));

      const totalMarks = studentResults.reduce((sum, r) => sum + r.score, 0);
      const average = studentResults.length > 0 ? totalMarks / studentResults.length : 0;
      
      // Simplified Division Calculation (Tanzanian style based on best 7 subjects usually, but here we use all available)
      const points = studentResults.map(r => calculatePoints(calculateGrade(r.score)));
      const totalPoints = points.sort((a, b) => a - b).slice(0, 7).reduce((sum, p) => sum + p, 0);
      
      let division = 'N/A';
      if (studentResults.length >= 7) {
        if (totalPoints <= 17) division = 'I';
        else if (totalPoints <= 21) division = 'II';
        else if (totalPoints <= 25) division = 'III';
        else if (totalPoints <= 33) division = 'IV';
        else division = '0';
      }

      return {
        student,
        results: detailedResults,
        average,
        totalMarks,
        division
      };
    }).sort((a, b) => b.average - a.average).map((item, index) => ({ ...item, rank: index + 1 }));
  }, [students, results]);

  const stats = useMemo(() => {
    const totalStudents = students.length;
    const overallAverage = performanceData.reduce((sum, p) => sum + p.average, 0) / (totalStudents || 1);
    const passCount = performanceData.filter(p => p.average >= 30).length;
    const passRate = totalStudents > 0 ? (passCount / totalStudents) * 100 : 0;

    const gradeDistribution = [
      { name: 'A', value: performanceData.filter(p => calculateGrade(p.average) === 'A').length },
      { name: 'B', value: performanceData.filter(p => calculateGrade(p.average) === 'B').length },
      { name: 'C', value: performanceData.filter(p => calculateGrade(p.average) === 'C').length },
      { name: 'D', value: performanceData.filter(p => calculateGrade(p.average) === 'D').length },
      { name: 'F', value: performanceData.filter(p => calculateGrade(p.average) === 'F').length },
    ];

    return { totalStudents, overallAverage, passRate, gradeDistribution };
  }, [performanceData, students]);

  const handleAddStudent = () => {
    if (newStudent.name && newStudent.regNumber) {
      const student: Student = {
        id: Math.random().toString(36).substr(2, 9),
        name: newStudent.name,
        regNumber: newStudent.regNumber,
        form: newStudent.form || 'Form 1',
        stream: newStudent.stream || 'A',
      };
      setStudents([...students, student]);
      setNewStudent({ form: 'Form 1', stream: 'A' });
      setIsAddingStudent(false);
    }
  };

  const handleDeleteStudent = (id: string) => {
    setStudents(students.filter(s => s.id !== id));
    setResults(results.filter(r => r.studentId !== id));
  };

  const handleUpdateScore = (studentId: string, subjectId: string, score: number) => {
    const existingIndex = results.findIndex(r => r.studentId === studentId && r.subjectId === subjectId);
    if (existingIndex >= 0) {
      const newResults = [...results];
      newResults[existingIndex].score = score;
      setResults(newResults);
    } else {
      setResults([...results, { studentId, subjectId, score, term: 'Term 1', year: 2024 }]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3 text-blue-600">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <GraduationCap size={24} />
            </div>
            <h1 className="font-bold text-xl tracking-tight">EduScore</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">Mfumo wa Matokeo</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
          />
          <NavItem 
            icon={<Users size={20} />} 
            label="Wanafunzi" 
            active={activeTab === 'students'} 
            onClick={() => setActiveTab('students')} 
          />
          <NavItem 
            icon={<BookOpen size={20} />} 
            label="Ingiza Alama" 
            active={activeTab === 'results'} 
            onClick={() => setActiveTab('results')} 
          />
          <NavItem 
            icon={<FileText size={20} />} 
            label="Ripoti" 
            active={activeTab === 'reports'} 
            onClick={() => setActiveTab('reports')} 
          />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Shule</p>
            <p className="text-sm font-bold text-slate-700">Mlimani Secondary</p>
            <p className="text-xs text-slate-400">Dar es Salaam, TZ</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-8 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 capitalize">
            {activeTab === 'dashboard' ? 'Muhtasari wa Shule' : 
             activeTab === 'students' ? 'Usimamizi wa Wanafunzi' : 
             activeTab === 'results' ? 'Uingizaji wa Alama' : 'Ripoti za Matokeo'}
          </h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Tafuta mwanafunzi..." 
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-full text-sm focus:ring-2 focus:ring-blue-500 w-64 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
              AD
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard 
                    title="Jumla ya Wanafunzi" 
                    value={stats.totalStudents} 
                    icon={<Users className="text-blue-600" />} 
                    color="bg-blue-50" 
                  />
                  <StatCard 
                    title="Wastani wa Shule" 
                    value={`${stats.overallAverage.toFixed(1)}%`} 
                    icon={<TrendingUp className="text-emerald-600" />} 
                    color="bg-emerald-50" 
                  />
                  <StatCard 
                    title="Kiwango cha Ufaulu" 
                    value={`${stats.passRate.toFixed(1)}%`} 
                    icon={<Award className="text-amber-600" />} 
                    color="bg-amber-50" 
                  />
                  <StatCard 
                    title="Masomo" 
                    value={SUBJECTS.length} 
                    icon={<BookOpen className="text-purple-600" />} 
                    color="bg-purple-50" 
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Performance Chart */}
                  <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold mb-6">Mwenendo wa Ufaulu Kimasomo</h3>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={SUBJECTS.map(s => ({
                          name: s.code,
                          avg: results.filter(r => r.subjectId === s.id).reduce((sum, r) => sum + r.score, 0) / 
                               (results.filter(r => r.subjectId === s.id).length || 1)
                        }))}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          />
                          <Bar dataKey="avg" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Grade Distribution */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold mb-6">Mgawanyo wa Gradi</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.gradeDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {stats.gradeDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#64748b'][index]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2 mt-4">
                      {stats.gradeDistribution.map((item, idx) => (
                        <div key={item.name} className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-3 h-3 rounded-full", 
                              idx === 0 ? "bg-emerald-500" : 
                              idx === 1 ? "bg-blue-500" : 
                              idx === 2 ? "bg-amber-500" : 
                              idx === 3 ? "bg-red-500" : "bg-slate-500"
                            )} />
                            <span className="text-slate-600 font-medium">Gradi {item.name}</span>
                          </div>
                          <span className="font-bold">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Top Students */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold">Wanafunzi Bora (Top 5)</h3>
                    <button onClick={() => setActiveTab('reports')} className="text-blue-600 text-sm font-semibold hover:underline">Ona Wote</button>
                  </div>
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Rank</th>
                        <th className="px-6 py-4 font-semibold">Mwanafunzi</th>
                        <th className="px-6 py-4 font-semibold">Kidato</th>
                        <th className="px-6 py-4 font-semibold">Wastani</th>
                        <th className="px-6 py-4 font-semibold">Gradi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {performanceData.slice(0, 5).map((p) => (
                        <tr key={p.student.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <span className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                              p.rank === 1 ? "bg-amber-100 text-amber-700" :
                              p.rank === 2 ? "bg-slate-100 text-slate-700" :
                              p.rank === 3 ? "bg-orange-100 text-orange-700" : "text-slate-500"
                            )}>
                              {p.rank}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-medium">{p.student.name}</td>
                          <td className="px-6 py-4 text-slate-500">{p.student.form} {p.student.stream}</td>
                          <td className="px-6 py-4 font-bold text-blue-600">{p.average.toFixed(1)}%</td>
                          <td className="px-6 py-4">
                            <GradeBadge grade={calculateGrade(p.average)} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'students' && (
              <motion.div 
                key="students"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <p className="text-slate-500">Orodha ya wanafunzi wote waliosajiliwa.</p>
                  <button 
                    onClick={() => setIsAddingStudent(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                  >
                    <UserPlus size={20} />
                    Ongeza Mwanafunzi
                  </button>
                </div>

                {isAddingStudent && (
                  <div className="bg-white p-6 rounded-2xl border-2 border-blue-100 shadow-xl">
                    <h3 className="text-lg font-bold mb-4">Sajili Mwanafunzi Mpya</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Jina Kamili</label>
                        <input 
                          type="text" 
                          className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                          value={newStudent.name || ''}
                          onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Namba ya Usajili</label>
                        <input 
                          type="text" 
                          className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                          value={newStudent.regNumber || ''}
                          onChange={(e) => setNewStudent({ ...newStudent, regNumber: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Kidato</label>
                        <select 
                          className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                          value={newStudent.form}
                          onChange={(e) => setNewStudent({ ...newStudent, form: e.target.value })}
                        >
                          <option>Form 1</option>
                          <option>Form 2</option>
                          <option>Form 3</option>
                          <option>Form 4</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">Mkondo (Stream)</label>
                        <select 
                          className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                          value={newStudent.stream}
                          onChange={(e) => setNewStudent({ ...newStudent, stream: e.target.value })}
                        >
                          <option>A</option>
                          <option>B</option>
                          <option>C</option>
                          <option>D</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                      <button 
                        onClick={() => setIsAddingStudent(false)}
                        className="px-4 py-2 text-slate-600 font-semibold hover:bg-slate-100 rounded-lg"
                      >
                        Ghairi
                      </button>
                      <button 
                        onClick={handleAddStudent}
                        className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
                      >
                        Hifadhi
                      </button>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Mwanafunzi</th>
                        <th className="px-6 py-4 font-semibold">Reg Number</th>
                        <th className="px-6 py-4 font-semibold">Kidato</th>
                        <th className="px-6 py-4 font-semibold">Mkondo</th>
                        <th className="px-6 py-4 font-semibold text-right">Vitendo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map((student) => (
                        <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">
                                {student.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <span className="font-medium">{student.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-500 font-mono text-sm">{student.regNumber}</td>
                          <td className="px-6 py-4">{student.form}</td>
                          <td className="px-6 py-4">{student.stream}</td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => handleDeleteStudent(student.id)}
                              className="text-slate-400 hover:text-red-600 transition-colors p-2"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'results' && (
              <motion.div 
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
              >
                <div className="bg-blue-600 p-8 rounded-3xl text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-2">Ingiza Alama za Masomo</h3>
                    <p className="text-blue-100 max-w-md">Chagua mwanafunzi na uingize alama zake kwa kila somo. Mfumo utachakata gradi na wastani papo hapo.</p>
                  </div>
                  <BookOpen className="absolute right-[-20px] bottom-[-20px] text-blue-500 opacity-20" size={200} />
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())).map(student => (
                    <div key={student.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h4 className="font-bold text-lg">{student.name}</h4>
                          <p className="text-sm text-slate-400">{student.regNumber} • {student.form} {student.stream}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-xs font-bold text-slate-400 uppercase">Wastani</p>
                            <p className="font-bold text-blue-600">
                              {(results.filter(r => r.studentId === student.id).reduce((s, r) => s + r.score, 0) / 
                                (results.filter(r => r.studentId === student.id).length || 1)).toFixed(1)}%
                            </p>
                          </div>
                          <ChevronRight className="text-slate-300" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {SUBJECTS.map(subject => {
                          const result = results.find(r => r.studentId === student.id && r.subjectId === subject.id);
                          return (
                            <div key={subject.id} className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase block truncate">{subject.name}</label>
                              <div className="flex items-center gap-2">
                                <input 
                                  type="number" 
                                  min="0"
                                  max="100"
                                  placeholder="0-100"
                                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                  value={result?.score || ''}
                                  onChange={(e) => handleUpdateScore(student.id, subject.id, parseInt(e.target.value) || 0)}
                                />
                                {result && (
                                  <span className={cn(
                                    "text-xs font-bold",
                                    calculateGrade(result.score) === 'F' ? "text-red-500" : "text-emerald-500"
                                  )}>
                                    {calculateGrade(result.score)}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'reports' && (
              <motion.div 
                key="reports"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold">Ripoti ya Jumla ya Matokeo</h3>
                    <p className="text-sm text-slate-500">Msimu: Term 1, 2024</p>
                  </div>
                  <button className="bg-slate-900 text-white px-6 py-2 rounded-xl font-semibold flex items-center gap-2 hover:bg-slate-800 transition-colors">
                    <Download size={18} />
                    Pakua PDF
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
                  <table className="w-full text-left min-w-[1000px]">
                    <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4 font-semibold sticky left-0 bg-slate-50 z-10">Rank & Mwanafunzi</th>
                        {SUBJECTS.map(s => (
                          <th key={s.id} className="px-4 py-4 font-semibold text-center">{s.code}</th>
                        ))}
                        <th className="px-6 py-4 font-semibold text-center">Jumla</th>
                        <th className="px-6 py-4 font-semibold text-center">Wastani</th>
                        <th className="px-6 py-4 font-semibold text-center">Div</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {performanceData.filter(p => p.student.name.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => (
                        <tr key={p.student.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 sticky left-0 bg-white z-10 border-r border-slate-50">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-slate-400">#{p.rank}</span>
                              <div>
                                <p className="font-bold text-sm">{p.student.name}</p>
                                <p className="text-[10px] text-slate-400">{p.student.regNumber}</p>
                              </div>
                            </div>
                          </td>
                          {SUBJECTS.map(s => {
                            const score = results.find(r => r.studentId === p.student.id && r.subjectId === s.id)?.score;
                            return (
                              <td key={s.id} className="px-4 py-4 text-center">
                                {score !== undefined ? (
                                  <div className="flex flex-col items-center">
                                    <span className="text-sm font-medium">{score}</span>
                                    <span className={cn(
                                      "text-[10px] font-bold",
                                      calculateGrade(score) === 'F' ? "text-red-500" : "text-slate-400"
                                    )}>{calculateGrade(score)}</span>
                                  </div>
                                ) : (
                                  <span className="text-slate-200">-</span>
                                )}
                              </td>
                            );
                          })}
                          <td className="px-6 py-4 text-center font-bold">{p.totalMarks}</td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex flex-col items-center">
                              <span className="font-bold text-blue-600">{p.average.toFixed(1)}%</span>
                              <GradeBadge grade={calculateGrade(p.average)} />
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-xs font-black",
                              p.division === 'I' ? "bg-emerald-100 text-emerald-700" :
                              p.division === 'II' ? "bg-blue-100 text-blue-700" :
                              p.division === 'III' ? "bg-amber-100 text-amber-700" :
                              p.division === 'IV' ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"
                            )}>
                              {p.division}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
        active 
          ? "bg-blue-50 text-blue-600 font-bold" 
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      <span className={cn("transition-transform duration-200", active ? "scale-110" : "group-hover:scale-110")}>
        {icon}
      </span>
      <span className="text-sm">{label}</span>
      {active && <motion.div layoutId="activeNav" className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
    </button>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: string | number, icon: React.ReactNode, color: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-3 rounded-xl", color)}>
          {icon}
        </div>
      </div>
      <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
      <h4 className="text-2xl font-bold text-slate-900">{value}</h4>
    </div>
  );
}

function GradeBadge({ grade }: { grade: string }) {
  const colors = {
    'A': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'B': 'bg-blue-100 text-blue-700 border-blue-200',
    'C': 'bg-amber-100 text-amber-700 border-amber-200',
    'D': 'bg-orange-100 text-orange-700 border-orange-200',
    'F': 'bg-red-100 text-red-700 border-red-200',
  };
  return (
    <span className={cn(
      "px-2 py-0.5 rounded-md text-[10px] font-bold border",
      colors[grade as keyof typeof colors] || 'bg-slate-100 text-slate-700 border-slate-200'
    )}>
      {grade}
    </span>
  );
}

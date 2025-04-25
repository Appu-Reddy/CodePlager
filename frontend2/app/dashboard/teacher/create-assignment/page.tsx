"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, UploadCloud, BookOpen, Award, FileText } from 'lucide-react';

const CreateAssignmentPage = () => {
    const router = useRouter();

    const [name, setName] = useState('');
    const [course, setCourse] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [status, setStatus] = useState('active');
    const [maxScore, setMaxScore] = useState('100');
    const [file, setFile] = useState<File | null>(null);
    const [courseId, setCourseId] = useState('');
    const [availableCourses] = useState([
        { _id: '1', name: 'Mathematics', code: 'MATH101' },
        { _id: '2', name: 'English Literature', code: 'ENG201' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCourseId = e.target.value;
        setCourseId(selectedCourseId);
        const selectedCourse = availableCourses.find(course => course._id === selectedCourseId);
        if (selectedCourse) {
            setCourse(selectedCourse.name);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');
    
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('course', course);
            formData.append('description', description);
            formData.append('dueDate', dueDate);
            formData.append('status', status);
            formData.append('maxScore', maxScore);
            formData.append('teacherRollNo', localStorage.getItem('teacherid') || '');
            formData.append('courseId', courseId);
            if (file) formData.append('file', file);
    
            const res = await fetch('http://localhost:5000/api/createAssignment', {
                method: 'POST',
                body: formData,
            });
            console.log(formData)
    
            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to create assignment');
            }
    
            const result = await res.json();
            alert('Assignment created successfully!');
            router.push('/dashboard/teacher');
        } catch (error) {
            console.error('Error submitting form:', error);
            setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black p-8 text-white">
            <div className="max-w-3xl mx-auto bg-black/60 backdrop-blur rounded-lg p-8 shadow-xl border border-green-500">
                <h2 className="text-3xl font-bold mb-6 text-green-400">Create New Assignment</h2>

                {errorMessage && (
                    <div className="bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded mb-6">
                        <p>{errorMessage}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm mb-1">Assignment Title</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="e.g. Linear Algebra Homework"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1 flex items-center gap-2">
                            <BookOpen size={16} /> Course
                        </label>
                        <select
                            value={courseId}
                            onChange={handleCourseChange}
                            className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                        >
                            <option value="">Select a course</option>
                            {availableCourses.map(course => (
                                <option key={course._id} value={course._id}>
                                    {course.name} ({course.code})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm mb-1 flex items-center gap-2">
                            <FileText size={16} /> Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 min-h-24"
                            placeholder="Enter assignment description and instructions"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1 flex items-center gap-2">
                            <Calendar size={16} /> Due Date
                        </label>
                        <input
                            type="datetime-local"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm mb-1">Status</label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="active">Active</option>
                                <option value="draft">Draft</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm mb-1 flex items-center gap-2">
                                <Award size={16} /> Maximum Score
                            </label>
                            <input
                                type="number"
                                value={maxScore}
                                onChange={(e) => setMaxScore(e.target.value)}
                                className="w-full px-4 py-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                                min="0"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm mb-1 flex items-center gap-2">
                            <UploadCloud size={16} /> Upload Assignment File
                        </label>
                        <input
                            type="file"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="block w-full text-sm text-gray-400
                             file:mr-4 file:py-2 file:px-4
                             file:rounded-full file:border-0
                             file:text-sm file:font-semibold
                             file:bg-green-600 file:text-white
                             hover:file:bg-green-700"
                        />
                        <p className="text-xs text-gray-400 mt-1">Optional: Upload assignment instructions or materials</p>
                    </div>

                    <div className="text-right">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg shadow-md ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Creating...' : 'Create Assignment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateAssignmentPage;
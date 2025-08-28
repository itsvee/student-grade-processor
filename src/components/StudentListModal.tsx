'use client';

import { useState } from 'react';
import { XMarkIcon, ArrowDownTrayIcon, UserGroupIcon, AcademicCapIcon, UserIcon } from '@heroicons/react/24/outline';
import { SubjectData, StudentData } from '@/types';
import { generateExcelFiles } from '@/lib/excelGenerator';

interface StudentListModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: SubjectData | null;
  allStudentData: StudentData[];
}

export default function StudentListModal({ 
  isOpen, 
  onClose, 
  subject, 
  allStudentData 
}: StudentListModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !subject) return null;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const excelBuffer = await generateExcelFiles([subject]);
      const blob = new Blob([excelBuffer[subject.subjectCode]], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `แบบบันทึกคะแนนกลางภาค-${subject.subjectCode}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('เกิดข้อผิดพลาดในการดาวน์โหลด');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <AcademicCapIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold">
                  รายชื่อนักเรียน
                </h2>
                <p className="text-blue-100 text-sm sm:text-base">
                  วิชา: {subject.subjectCode}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all duration-200"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-blue-50 border-b border-blue-100 px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-blue-700">
                <UserGroupIcon className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {subject.students.length} นักเรียน
                </span>
              </div>
            </div>
            
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 text-sm"
            >
              {isDownloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>กำลังดาวน์โหลด...</span>
                </>
              ) : (
                <>
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  <span>ดาวน์โหลด Excel</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Student List */}
        <div className="overflow-y-auto max-h-96">
          {subject.students.length === 0 ? (
            <div className="text-center py-12">
              <UserIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">ไม่มีนักเรียนในวิชานี้</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {subject.students.map((student, index) => {
                // Find full student data for additional information
                const fullStudentData = allStudentData.find(s => s.studentId === student.studentId);
                
                return (
                  <div key={student.studentId} className="p-4 hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 text-sm sm:text-base">
                            {student.fullName}
                          </h3>
                          <p className="text-gray-600 text-xs sm:text-sm">
                            รหัส: {student.studentId}
                          </p>
                        </div>
                      </div>
                      
                      {/* Show student's other subjects if available */}
                      {fullStudentData && (
                        <div className="text-right">
                          <div className="text-xs text-gray-500">
                            ลงทะเบียน {Object.values(fullStudentData.subjects).filter(Boolean).length} วิชา
                          </div>
                          <div className="text-xs text-blue-600 mt-1">
                            คะแนนเฉลี่ย: {(fullStudentData.scores.reduce((a, b) => a + b, 0) / fullStudentData.scores.length).toFixed(1)}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Show enrolled subjects for this student */}
                    {fullStudentData && (
                      <div className="mt-2 ml-11">
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(fullStudentData.subjects)
                            .filter(([, isEnrolled]) => isEnrolled)
                            .slice(0, 5) // Show only first 5 subjects
                            .map(([subjectCode]) => (
                              <span
                                key={subjectCode}
                                className={`px-2 py-1 rounded text-xs font-medium ${
                                  subjectCode === subject.subjectCode
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {subjectCode}
                              </span>
                            ))}
                          {Object.values(fullStudentData.subjects).filter(Boolean).length > 5 && (
                            <span className="px-2 py-1 rounded text-xs text-gray-500 bg-gray-100">
                              +{Object.values(fullStudentData.subjects).filter(Boolean).length - 5}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>รวม {subject.students.length} คน</span>
              {subject.students.length > 0 && (
                <span>• ไฟล์ Excel จะมี {subject.students.length + 5} แถว</span>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition-colors duration-200"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}